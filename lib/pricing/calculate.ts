import type { CatalogProduct } from "../matching/matcher";

/** Units where "dozen" means 12 pieces for total calculation */
const DOZEN_UNIT = "dozen";
const DOZEN_MULTIPLIER = 12;

export interface PricedLine {
  productId: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Calculate the total price for an order line.
 * - For "dozen" unit, multiplies quantity by 12 then applies per-unit price.
 * - Returns null if any required field is missing.
 */
export function calculateLineTotal(
  product: CatalogProduct,
  quantity: number | null,
  unit: string | null
): PricedLine | null {
  if (quantity === null || quantity <= 0) return null;

  const resolvedUnit = unit ?? product.unit;
  let effectiveQty = quantity;

  if (resolvedUnit === DOZEN_UNIT) {
    effectiveQty = quantity * DOZEN_MULTIPLIER;
  }

  const totalPrice = Number((effectiveQty * product.pricePerUnit).toFixed(2));

  return {
    productId: product.id,
    quantity,
    unit: resolvedUnit,
    unitPrice: product.pricePerUnit,
    totalPrice,
  };
}

/**
 * Calculate the total amount for all order lines.
 */
export function calculateOrderTotal(lines: PricedLine[]): number {
  return Number(lines.reduce((sum, l) => sum + l.totalPrice, 0).toFixed(2));
}
