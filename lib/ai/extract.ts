import { z } from "zod";
import { parseQuantity } from "../units/normalise";

// ─── Zod schema for LLM response ──────────────────────────────────────────
export const ExtractedLineSchema = z.object({
  rawText: z.string().min(1),
  quantity: z.number().positive().nullable(),
  unit: z.string().nullable(),
});

export const ExtractionResponseSchema = z.array(ExtractedLineSchema).min(1);

export type ExtractedLine = z.infer<typeof ExtractedLineSchema>;

export interface ParsedLine {
  rawText: string;
  quantity: number | null;
  unit: string | null;
  missingQuantity: boolean;
  unknownUnit: boolean;
}

// ─── System prompt ─────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a JSON extractor for FMCG retail orders.
Return ONLY a JSON array — no prose, no markdown, no code fences.
Schema: [{"rawText": string, "quantity": number | null, "unit": string | null}]

Rules:
- rawText: the product name exactly as typed, without quantity or unit
- quantity: a positive number, or null if not specified
- unit: the unit as typed (ctn, dz, kg, pcs, etc.), or null if not specified
- Never add extra fields
- One object per line item; split comma-separated items
- If quantity is missing, set it to null — never guess`;

/**
 * Call the LLM to extract order lines from free-text.
 * Retries once on malformed JSON / failed zod parse.
 * Throws only after two consecutive failures.
 */
export async function extractWithLLM(orderText: string): Promise<ParsedLine[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const url = "https://api.openai.com/v1/chat/completions";

  async function attempt(): Promise<ExtractedLine[]> {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 1024,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: orderText },
        ],
      }),
      signal: AbortSignal.timeout(15_000), // 15s timeout
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${body}`);
    }

    const json = await res.json();
    const content: string = json.choices?.[0]?.message?.content ?? "";

    // Strip markdown code fences if model misbehaves
    const cleaned = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleaned);
    return ExtractionResponseSchema.parse(parsed);
  }

  let lastError: unknown;
  for (let i = 0; i < 2; i++) {
    try {
      const lines = await attempt();
      return lines.map((l) => {
        const { quantity, unit, missingQuantity, unknownUnit } = parseQuantity(l.quantity, l.unit);
        return { rawText: l.rawText, quantity, unit, missingQuantity, unknownUnit };
      });
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}
