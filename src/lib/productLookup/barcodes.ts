import type { BarcodeType } from "@/types/item";

export function normalizeBarcode(value: string) {
  return value.replace(/[^0-9a-z]/gi, "").toUpperCase();
}

export function barcodeType(value: string): BarcodeType {
  if (!/^\d+$/.test(value)) return "other";
  if (value.length === 8) return "ean_8";
  if (value.length === 12) return "upc_a";
  if (value.length === 13) return "ean_13";
  if (value.length === 14) return "gtin_14";
  return "other";
}

export function isValidExternalBarcode(value: string) {
  if (!/^\d{8}$|^\d{12,14}$/.test(value)) return false;

  const digits = [...value].map(Number);
  const checkDigit = digits.pop();
  const sum = digits
    .reverse()
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);

  return (10 - (sum % 10)) % 10 === checkDigit;
}
