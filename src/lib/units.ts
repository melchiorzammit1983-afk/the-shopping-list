export type UnitTotal = {
  label: string;
  amount: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Sums quantities across compatible units (g+kg into one weight total,
 * ml+l into one volume total), picking a readable display unit for each
 * group. Anything else (each, cups, ...) is summed separately per unit.
 */
export function summarizeQuantities(
  entries: { quantity: number; unit: string | null }[]
): UnitTotal[] {
  let grams = 0;
  let hasWeight = false;
  let ml = 0;
  let hasVolume = false;
  const other: Record<string, number> = {};

  for (const { quantity, unit } of entries) {
    const u = (unit ?? "").trim().toLowerCase();
    if (u === "g") {
      grams += quantity;
      hasWeight = true;
    } else if (u === "kg") {
      grams += quantity * 1000;
      hasWeight = true;
    } else if (u === "ml") {
      ml += quantity;
      hasVolume = true;
    } else if (u === "l") {
      ml += quantity * 1000;
      hasVolume = true;
    } else {
      const key = u || "unspecified";
      other[key] = (other[key] ?? 0) + quantity;
    }
  }

  const totals: UnitTotal[] = [];
  if (hasWeight) {
    totals.push(
      grams >= 1000
        ? { label: "kg", amount: round2(grams / 1000) }
        : { label: "g", amount: round2(grams) }
    );
  }
  if (hasVolume) {
    totals.push(
      ml >= 1000
        ? { label: "l", amount: round2(ml / 1000) }
        : { label: "ml", amount: round2(ml) }
    );
  }
  for (const [label, amount] of Object.entries(other)) {
    totals.push({ label, amount: round2(amount) });
  }
  return totals;
}
