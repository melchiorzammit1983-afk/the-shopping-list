export type BarcodeType = "ean_8" | "ean_13" | "upc_a" | "gtin_14" | "other";
export type VerificationStatus =
  | "unverified"
  | "user_verified"
  | "provider_verified";

export type ProductBarcode = {
  id: string;
  product_id: string;
  barcode_value: string;
  barcode_type: BarcodeType;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_type: "front" | "barcode";
  storage_path: string;
  image_url: string;
  created_at: string;
};

export type Item = {
  id: string;
  name: string;
  canonical_name: string;
  brand: string | null;
  variant: string | null;
  category: string | null;
  unit: string | null;
  package_quantity: number | null;
  package_unit: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  verification_status: VerificationStatus;
  data_source: string;
  created_by: string | null;
  barcodes?: ProductBarcode[];
  images?: ProductImage[];
};

export type ProductDraft = {
  name: string;
  canonicalName: string;
  brand: string;
  variant: string;
  category: string;
  packageQuantity: string;
  packageUnit: string;
  barcodeValue: string;
  barcodeType: BarcodeType;
};
