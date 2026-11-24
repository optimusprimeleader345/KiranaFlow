import { describe, it, expect } from "vitest";
import { calculateLineTotal, calculateOrderTotal } from "@/lib/pricing/calculate";

const PRODUCT = {
  id: "1",
  sku: "PARLEG",
  name: "Parle-G Biscuits",
  aliases: "[]",
  unit: "carton",
  pricePerUnit: 480,
  category: "Biscuits",
};

describe("calculateLineTotal", () => {
  it("carton qty × price", () => {
    const r = calculateLineTotal(PRODUCT, 10, "carton");
    expect(r?.totalPrice).toBe(4800);
    expect(r?.unitPrice).toBe(480);
    expect(r?.quantity).toBe(10);
  });

  it("dozen expands to 12×price", () => {
    const r = calculateLineTotal(PRODUCT, 2, "dozen");
    // 2 dozens = 24 pcs at ₹480 each
    expect(r?.totalPrice).toBe(24 * 480);
  });

  it("null quantity → null", () => {
    expect(calculateLineTotal(PRODUCT, null, "carton")).toBeNull();
  });

  it("zero quantity → null", () => {
    expect(calculateLineTotal(PRODUCT, 0, "carton")).toBeNull();
  });

  it("negative quantity → null", () => {
    expect(calculateLineTotal(PRODUCT, -1, "carton")).toBeNull();
  });

  it("null unit falls back to product unit", () => {
    const r = calculateLineTotal(PRODUCT, 3, null);
    expect(r?.unit).toBe("carton");
    expect(r?.totalPrice).toBe(1440);
  });

  it("fractional quantity", () => {
    const r = calculateLineTotal(PRODUCT, 1.5, "carton");
    expect(r?.totalPrice).toBe(720);
  });
});

describe("calculateOrderTotal", () => {
  it("sums line totals", () => {
    const lines = [
      { productId: "1", quantity: 2, unit: "carton", unitPrice: 480, totalPrice: 960 },
      { productId: "2", quantity: 5, unit: "kg", unitPrice: 220, totalPrice: 1100 },
    ];
    expect(calculateOrderTotal(lines)).toBe(2060);
  });

  it("empty lines → 0", () => {
    expect(calculateOrderTotal([])).toBe(0);
  });
});
