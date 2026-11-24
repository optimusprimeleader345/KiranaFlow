import { describe, it, expect } from "vitest";
import { extractWithRegex } from "@/lib/ai/fallback";

describe("extractWithRegex", () => {
  it("parses 'qty unit product' format", () => {
    const lines = extractWithRegex("10 ctn parle-g");
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(10);
    expect(lines[0].unit).toBe("carton");
    expect(lines[0].rawText).toBe("parle-g");
  });

  it("parses multiple lines separated by newline", () => {
    const lines = extractWithRegex("10 ctn parle-g\n5 kg surf excel\n2 dz maggi");
    expect(lines).toHaveLength(3);
    expect(lines[0].quantity).toBe(10);
    expect(lines[1].quantity).toBe(5);
    expect(lines[2].quantity).toBe(2);
  });

  it("parses comma-separated items", () => {
    const lines = extractWithRegex("10 ctn parle-g, 5 surf excel 1kg");
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it("flags missing quantity", () => {
    const lines = extractWithRegex("parle g biscuit");
    expect(lines[0].missingQuantity).toBe(true);
    expect(lines[0].quantity).toBeNull();
  });

  it("empty input → empty array", () => {
    expect(extractWithRegex("")).toHaveLength(0);
    expect(extractWithRegex("   ")).toHaveLength(0);
  });

  it("handles Hinglish: '5 maggi noodl'", () => {
    const lines = extractWithRegex("5 maggi noodl");
    expect(lines[0].quantity).toBe(5);
    expect(lines[0].rawText.toLowerCase()).toContain("maggi");
  });

  it("handles no-unit: '10 parle g'", () => {
    const lines = extractWithRegex("10 parle g");
    expect(lines[0].quantity).toBe(10);
    expect(lines[0].unit).toBeNull();
  });

  it("handles duplicate items (both appear as separate lines)", () => {
    const lines = extractWithRegex("5 ctn maggi\n5 ctn maggi");
    expect(lines).toHaveLength(2);
    expect(lines[0].rawText).toBe(lines[1].rawText);
  });

  it("semicolon separator", () => {
    const lines = extractWithRegex("10 ctn parle-g; 5 kg surf excel");
    expect(lines).toHaveLength(2);
  });
});
