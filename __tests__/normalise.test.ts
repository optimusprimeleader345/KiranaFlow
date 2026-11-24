import { describe, it, expect } from "vitest";
import { normaliseUnit, parseQuantity } from "@/lib/units/normalise";

describe("normaliseUnit", () => {
  it("maps ctn → carton", () => expect(normaliseUnit("ctn")).toBe("carton"));
  it("maps CTN (uppercase) → carton", () => expect(normaliseUnit("CTN")).toBe("carton"));
  it("maps carton → carton", () => expect(normaliseUnit("carton")).toBe("carton"));
  it("maps dz → dozen", () => expect(normaliseUnit("dz")).toBe("dozen"));
  it("maps dozen → dozen", () => expect(normaliseUnit("dozen")).toBe("dozen"));
  it("maps kg → kg", () => expect(normaliseUnit("kg")).toBe("kg"));
  it("maps kgs → kg", () => expect(normaliseUnit("kgs")).toBe("kg"));
  it("maps g → g", () => expect(normaliseUnit("g")).toBe("g"));
  it("maps pcs → pcs", () => expect(normaliseUnit("pcs")).toBe("pcs"));
  it("maps ltr → litre", () => expect(normaliseUnit("ltr")).toBe("litre"));
  it("maps ml → ml", () => expect(normaliseUnit("ml")).toBe("ml"));
  it("unknown unit → null", () => expect(normaliseUnit("xyz")).toBeNull());
  it("null input → null", () => expect(normaliseUnit(null)).toBeNull());
  it("empty string → null", () => expect(normaliseUnit("")).toBeNull());
});

describe("parseQuantity", () => {
  it("valid quantity + unit → parsed", () => {
    const r = parseQuantity(10, "ctn");
    expect(r.quantity).toBe(10);
    expect(r.unit).toBe("carton");
    expect(r.missingQuantity).toBe(false);
    expect(r.unknownUnit).toBe(false);
  });

  it("null quantity → missingQuantity true", () => {
    const r = parseQuantity(null, "ctn");
    expect(r.quantity).toBeNull();
    expect(r.missingQuantity).toBe(true);
  });

  it("zero quantity → missingQuantity true", () => {
    const r = parseQuantity(0, "pcs");
    expect(r.missingQuantity).toBe(true);
  });

  it("negative quantity → missingQuantity true", () => {
    const r = parseQuantity(-5, "kg");
    expect(r.missingQuantity).toBe(true);
  });

  it("unknown unit → unknownUnit true, unit null", () => {
    const r = parseQuantity(5, "xyz");
    expect(r.unit).toBeNull();
    expect(r.unknownUnit).toBe(true);
  });

  it("null unit → unknownUnit false (not unknown, just absent)", () => {
    const r = parseQuantity(5, null);
    expect(r.unknownUnit).toBe(false);
    expect(r.unit).toBeNull();
  });
});
