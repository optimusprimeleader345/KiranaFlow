import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, withAuth } from "@/lib/auth/guards";
import { extractWithLLM } from "@/lib/ai/extract";
import { extractWithRegex } from "@/lib/ai/fallback";
import { initialiseMatcher, matchProduct } from "@/lib/matching/matcher";
import { prisma } from "@/lib/db";
import type { ParsedLine } from "@/lib/ai/extract";

const RequestSchema = z.object({
  orderText: z.string().min(1).max(5000),
});

export const POST = withAuth(async (req: Request) => {
  await requireRole("RETAILER");

  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { orderText } = parsed.data;

  // Load catalog for matching
  const products = await prisma.product.findMany();
  initialiseMatcher(products);

  let lines: ParsedLine[];
  let aiFailed = false;

  try {
    lines = await extractWithLLM(orderText);
  } catch {
    aiFailed = true;
    lines = extractWithRegex(orderText);
  }

  // Match each line against the catalog
  const matchedLines = lines.map((line) => {
    const matchResult = matchProduct(line.rawText);

    // Override match status if quantity is missing
    let status = matchResult.status;
    let reason = matchResult.reason;

    if (line.missingQuantity) {
      status = "needs_review";
      reason = reason
        ? `${reason}; quantity missing`
        : "Quantity missing — please specify";
    }

    if (line.unknownUnit) {
      status = "needs_review";
      reason = reason
        ? `${reason}; unknown unit "${line.unit}"`
        : `Unknown unit — please verify`;
    }

    return {
      rawText: line.rawText,
      quantity: line.quantity,
      unit: line.unit,
      missingQuantity: line.missingQuantity,
      unknownUnit: line.unknownUnit,
      matchStatus: status,
      matchScore: matchResult.score,
      product: matchResult.product,
      suggestions: matchResult.suggestions,
      reason,
    };
  });

  return NextResponse.json({ lines: matchedLines, aiFailed });
});
