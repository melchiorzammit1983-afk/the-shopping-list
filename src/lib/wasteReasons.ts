export const WASTE_REASONS = [
  { value: "mistake", label: "Mistake" },
  { value: "expired", label: "Expired" },
  { value: "damaged", label: "Package damaged" },
  { value: "pest", label: "Pest damage 🐀" },
  { value: "other", label: "Other" },
] as const;

export type WasteReason = (typeof WASTE_REASONS)[number]["value"];

export function wasteReasonLabel(reason: string): string {
  return WASTE_REASONS.find((r) => r.value === reason)?.label ?? reason;
}
