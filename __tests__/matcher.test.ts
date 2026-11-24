import { describe, it, expect, beforeAll } from "vitest";
import { initialiseMatcher, matchProduct } from "@/lib/matching/matcher";
import { THRESHOLD_MATCHED, THRESHOLD_REVIEW } from "@/lib/matching/constants";

const CATALOG = [
  {
    id: "1", sku: "PARLEG", name: "Parle-G Biscuits",
    aliases: JSON.stringify(["parle g", "parleg", "parle biscuit", "glucose biscuit"]),
    unit: "carton", pricePerUnit: 480, category: "Biscuits",
  },
  {
    id: "2", sku: "MAGGI", name: "Maggi Noodles 70g",
    aliases: JSON.stringify(["maggi", "maggie", "maggi masala", "2 min noodles"]),
    unit: "carton", pricePerUnit: 840, category: "Noodles",
  },
  {
    id: "3", sku: "SURF", name: "Surf Excel 1kg",
    aliases: JSON.stringify(["surf excel", "surf 1kg", "surf excell", "surf xl"]),
    unit: "kg", pricePerUnit: 220, category: "Detergent",
  },
  {
    id: "4", sku: "LUX", name: "Lux Soap 100g",
    aliases: JSON.stringify(["lux", "lux soap", "lux bathing bar"]),
    unit: "pcs", pricePerUnit: 48, category: "Soap",
  },
];

beforeAll(() => {
  initialiseMatcher(CATALOG);
});

describe("Matcher thresholds", () => {
  it("exact match → matched status", () => {
    const result = matchProduct("Parle-G Biscuits");
    expect(result.status).toBe("matched");
    expect(result.score).toBeGreaterThanOrEqual(THRESHOLD_MATCHED);
  });

  it("alias match → matched status", () => {
    const result = matchProduct("parle g");
    expect(result.status).toBe("matched");
  });

  it("Hinglish alias → matched", () => {
    const result = matchProduct("maggi");
    expect(result.status).toBe("matched");
  });

  it("slight typo 'surf excell' → at least needs_review or matched", () => {
    const result = matchProduct("surf excell");
    expect(["matched", "needs_review"]).toContain(result.status);
    expect(result.score).toBeGreaterThanOrEqual(THRESHOLD_REVIEW);
  });

  it("moderate typo 'parle g biscit' → needs_review with suggestions", () => {
    const result = matchProduct("parle g biscit");
    expect(["matched", "needs_review"]).toContain(result.status);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it("completely unknown product → not_found", () => {
    const result = matchProduct("xyzzzzz unknown item 999");
    expect(result.status).toBe("not_found");
    expect(result.score).toBeLessThan(THRESHOLD_REVIEW);
  });

  it("empty string → not_found", () => {
    const result = matchProduct("");
    expect(result.status).toBe("not_found");
  });

  it("needs_review returns top 3 suggestions", () => {
    const result = matchProduct("maggi noodl");
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBeLessThanOrEqual(3);
  });

  it("matched result has a product", () => {
    const result = matchProduct("lux soap");
    expect(result.product).not.toBeNull();
    expect(result.product?.id).toBe("4");
  });
});
