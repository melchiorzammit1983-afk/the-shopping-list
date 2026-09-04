import type { BarcodeType, VerificationStatus } from "@/types/item";

export type ExternalProduct = {
  barcode: string;
  barcodeType: BarcodeType;
  name: string;
  canonicalName: string;
  brand: string;
  variant: string;
  category: string;
  packageQuantity: string;
  packageUnit: string;
  imageUrl: string | null;
  dataSource: "open_food_facts";
  verificationStatus: VerificationStatus;
};

export type ExternalLookupResult =
  | { status: "found"; product: ExternalProduct }
  | { status: "not_found" }
  | { status: "invalid"; message: string }
  | { status: "unavailable"; message: string };

export type ProductLookupProvider = {
  name: string;
  lookupByBarcode: (barcode: string) => Promise<ExternalLookupResult>;
};
