// Unit normalisation: maps user-typed aliases to canonical units
// Canonical units: carton, dozen, kg, g, pcs, litre, ml

export const UNIT_ALIASES: Record<string, string> = {
  // Carton
  ctn: "carton",
  ctns: "carton",
  carton: "carton",
  cartons: "carton",
  case: "carton",
  cases: "carton",
  box: "carton",
  boxes: "carton",
  // Dozen
  dz: "dozen",
  dzn: "dozen",
  dozen: "dozen",
  dozens: "dozen",
  doz: "dozen",
  "12": "dozen",
  // Pieces
  pcs: "pcs",
  pc: "pcs",
  piece: "pcs",
  pieces: "pcs",
  nos: "pcs",
  no: "pcs",
  unit: "pcs",
  units: "pcs",
  packet: "pcs",
  packets: "pcs",
  pack: "pcs",
  packs: "pcs",
  // Kilogram
  kg: "kg",
  kgs: "kg",
  kilogram: "kg",
  kilograms: "kg",
  kilo: "kg",
  kilos: "kg",
  // Gram
  g: "g",
  gm: "g",
  gms: "g",
  gram: "g",
  grams: "g",
  // Litre
  l: "litre",
  ltr: "litre",
  litre: "litre",
  litres: "litre",
  liter: "litre",
  liters: "litre",
  // Millilitre
  ml: "ml",
  millilitre: "ml",
  millilitres: "ml",
};

export type NormalisedUnit = string | null;

/**
 * Normalise a unit string to a canonical value.
 * Returns null if the unit is unrecognised (triggers a flag, not a crash).
 */
export function normaliseUnit(raw: string | null | undefined): NormalisedUnit {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  return UNIT_ALIASES[key] ?? null;
}

export interface ParsedQuantity {
  quantity: number | null;
  unit: NormalisedUnit;
  missingQuantity: boolean;
  unknownUnit: boolean;
}

/**
 * Parse and normalise quantity + unit from raw LLM or regex output.
 */
export function parseQuantity(
  rawQty: number | null | undefined,
  rawUnit: string | null | undefined
): ParsedQuantity {
  const unit = normaliseUnit(rawUnit);
  const quantity = rawQty != null && isFinite(rawQty) && rawQty > 0 ? rawQty : null;

  return {
    quantity,
    unit,
    missingQuantity: quantity === null,
    unknownUnit: rawUnit != null && rawUnit.trim() !== "" && unit === null,
  };
}
