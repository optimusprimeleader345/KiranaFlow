import { parseQuantity } from "../units/normalise";
import type { ParsedLine } from "./extract";

/**
 * Regex-based fallback parser used when the LLM is unavailable or times out.
 * Handles patterns like:
 *   "10 ctn parle-g"
 *   "5 surf excel 1kg"
 *   "2 dz maggi"
 *   "parle g"  (no quantity — flagged)
 */
export function extractWithRegex(orderText: string): ParsedLine[] {
  if (!orderText.trim()) return [];

  // Split on newlines, commas, or semicolons
  const rawLines = orderText
    .split(/[\n,;]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  return rawLines.map((line) => parseLine(line));
}

const UNIT_PATTERN =
  /\b(ctn|ctns|carton|cartons|case|cases|dz|dzn|dozen|dozens|doz|pcs|pc|pieces?|nos?|units?|packets?|packs?|kg|kgs|kilogram|g|gm|gms|grams?|ltr?s?|litres?|liters?|ml)\b/i;

const QTY_UNIT_PREFIX =
  /^(\d+(?:\.\d+)?)\s*(ctn|ctns|carton|cartons|case|cases|dz|dzn|dozen|dozens|doz|pcs|pc|pieces?|nos?|units?|packets?|packs?|kg|kgs|kilogram|g|gm|gms|grams?|ltrs?|litres?|liters?|ml)?\s+(.+)/i;

const QTY_PREFIX = /^(\d+(?:\.\d+)?)\s+(.+)/i;

function parseLine(line: string): ParsedLine {
  // Try: "10 ctn parle-g" or "10 parle-g"
  const withUnit = QTY_UNIT_PREFIX.exec(line);
  if (withUnit) {
    const [, qty, unit, rest] = withUnit;
    // rest might still contain size info like "surf excel 1kg"
    const rawText = rest.trim();
    const { quantity, unit: normUnit, missingQuantity, unknownUnit } = parseQuantity(
      parseFloat(qty),
      unit ?? null
    );
    return { rawText, quantity, unit: normUnit, missingQuantity, unknownUnit };
  }

  const qtyOnly = QTY_PREFIX.exec(line);
  if (qtyOnly) {
    const [, qty, rest] = qtyOnly;
    const rawText = rest.trim();
    // Check if rest starts with a unit keyword (e.g. "kg sugar")
    const unitInRest = UNIT_PATTERN.exec(rawText);
    let unitStr: string | null = null;
    let productText = rawText;
    if (unitInRest && unitInRest.index === 0) {
      unitStr = unitInRest[0];
      productText = rawText.slice(unitStr.length).trim();
    }
    const { quantity, unit, missingQuantity, unknownUnit } = parseQuantity(
      parseFloat(qty),
      unitStr
    );
    return { rawText: productText || rawText, quantity, unit, missingQuantity, unknownUnit };
  }

  // No quantity found — flag it
  return {
    rawText: line,
    quantity: null,
    unit: null,
    missingQuantity: true,
    unknownUnit: false,
  };
}
