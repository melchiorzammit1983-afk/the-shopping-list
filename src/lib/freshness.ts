const EXPIRING_SOON_DAYS = 3;

export type FreshnessStatus = "fresh" | "expiring" | "expired" | "none";

export function getFreshnessStatus(
  expiryDate: string | null
): FreshnessStatus {
  if (!expiryDate) return "none";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diffDays = Math.round(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 0) return "expired";
  if (diffDays <= EXPIRING_SOON_DAYS) return "expiring";
  return "fresh";
}

export const FRESHNESS_STYLES: Record<
  FreshnessStatus,
  { ring: string; bg: string; label: string }
> = {
  fresh: { ring: "ring-fresh", bg: "bg-fresh-tint", label: "Fresh" },
  expiring: {
    ring: "ring-expiring",
    bg: "bg-expiring-tint",
    label: "Expiring soon",
  },
  expired: { ring: "ring-expired", bg: "bg-expired-tint", label: "Expired" },
  none: { ring: "ring-no-expiry", bg: "bg-no-expiry-tint", label: "" },
};
