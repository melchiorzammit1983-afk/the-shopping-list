"use client";

import { useCallback, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { useItemCatalog } from "@/hooks/useItemCatalog";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import type { BarcodeType, Item, ProductDraft } from "@/types/item";

type Props = {
  userId: string;
  onBack: () => void;
  onGoToInventory: () => void;
};

const emptyDraft: ProductDraft = {
  name: "",
  canonicalName: "",
  brand: "",
  variant: "",
  category: "",
  packageQuantity: "",
  packageUnit: "",
  barcodeValue: "",
  barcodeType: "other",
};

function draftFromProduct(product: Item): ProductDraft {
  return {
    name: product.name,
    canonicalName: product.canonical_name,
    brand: product.brand ?? "",
    variant: product.variant ?? "",
    category: product.category ?? "",
    packageQuantity: product.package_quantity?.toString() ?? "",
    packageUnit: product.package_unit ?? "",
    barcodeValue: product.barcodes?.[0]?.barcode_value ?? "",
    barcodeType: product.barcodes?.[0]?.barcode_type ?? "other",
  };
}

export function ProductCatalogue({ userId, onBack, onGoToInventory }: Props) {
  const { searchItems, searchProductByBarcode, createProduct, updateProduct } = useItemCatalog();
  const { uploadPhoto } = usePhotoUpload(userId, "item-photos");
  const [mode, setMode] = useState<"barcode" | "manual">("barcode");
  const [stage, setStage] = useState<"search" | "edit" | "review" | "done">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [searched, setSearched] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [existing, setExisting] = useState<Item | null>(null);
  const [saved, setSaved] = useState<Item | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [barcodeFile, setBarcodeFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const resetSearch = useCallback(() => {
    setStage("search");
    setQuery("");
    setResults([]);
    setSearched(false);
    setScannerOpen(false);
    setDraft(emptyDraft);
    setExisting(null);
    setSaved(null);
    setFrontFile(null);
    setBarcodeFile(null);
    setFrontPreview(null);
    setError("");
  }, []);

  function updateField<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function searchBarcode(value = query) {
    setPending(true);
    setError("");
    const result = await searchProductByBarcode(value);
    setPending(false);
    setSearched(true);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.product) {
      setExisting(result.product);
      setDraft(draftFromProduct(result.product));
      setStage("review");
      return;
    }
    setDraft({ ...emptyDraft, barcodeValue: value.trim() });
    setStage("edit");
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (mode === "barcode") {
      await searchBarcode();
      return;
    }
    setPending(true);
    setError("");
    const result = await searchItems(query);
    setPending(false);
    setSearched(true);
    if (result.error) {
      setError(result.error);
      return;
    }
    setResults(result.items);
  }

  function selectExisting(product: Item) {
    setExisting(product);
    setDraft(draftFromProduct(product));
    setStage("review");
  }

  function createManual() {
    setExisting(null);
    setDraft({ ...emptyDraft, name: query.trim(), canonicalName: query.trim() });
    setStage("edit");
  }

  function chooseFrontImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setFrontFile(file);
    if (!file) return setFrontPreview(null);
    const reader = new FileReader();
    reader.onload = () => setFrontPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  async function confirmProduct() {
    if (existing) {
      setSaved(existing);
      setStage("done");
      return;
    }
    setPending(true);
    setError("");
    let front = { url: null as string | null, path: null as string | null };
    let barcode = { url: null as string | null, path: null as string | null };
    if (frontFile) {
      const result = await uploadPhoto(frontFile);
      if (result.error) {
        setPending(false);
        setError(result.error);
        return;
      }
      front = result;
    }
    if (barcodeFile) {
      const result = await uploadPhoto(barcodeFile);
      if (result.error) {
        setPending(false);
        setError(result.error);
        return;
      }
      barcode = result;
    }
    const result = await createProduct(draft, {
      frontImagePath: front.path,
      frontImageUrl: front.url,
      barcodeImagePath: barcode.path,
      barcodeImageUrl: barcode.url,
    });
    setPending(false);
    if (result.error || !result.product) {
      setError(result.error ?? "Could not save product");
      return;
    }
    setSaved(result.product);
    setStage("done");
  }

  async function saveExistingEdit(e: FormEvent) {
    e.preventDefault();
    if (!existing) {
      setStage("review");
      return;
    }
    setPending(true);
    setError("");
    const result = await updateProduct(existing.id, draft);
    setPending(false);
    if (result.error || !result.product) {
      setError(result.error ?? "Could not update product");
      return;
    }
    setExisting(result.product);
    setDraft(draftFromProduct(result.product));
    setStage("review");
  }

  const displayProduct = saved ?? existing;
  const imageUrl = frontPreview ?? displayProduct?.images?.find((image) => image.image_type === "front")?.image_url ?? displayProduct?.image_url;
  const canEditExisting = existing?.created_by === userId;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <button onClick={onBack} className="mb-3 text-sm text-charcoal-soft hover:text-charcoal">← Back</button>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Products</h1>
        <p className="mt-1 text-sm text-charcoal-soft">Search the shared catalogue before creating a product.</p>
      </header>

      {stage === "search" && (
        <>
          <div className="grid grid-cols-2 gap-2 rounded-3xl bg-herb-tint p-1">
            {(["barcode", "manual"] as const).map((option) => (
              <button key={option} type="button" onClick={() => { setMode(option); setSearched(false); setResults([]); setError(""); }} className={`rounded-full px-3 py-2 text-sm font-medium ${mode === option ? "bg-linen-card shadow-sm" : "text-charcoal-soft"}`}>
                {option === "barcode" ? "Scan / barcode" : "Manual search"}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <input required value={query} onChange={(e) => { setQuery(e.target.value); setSearched(false); }} inputMode={mode === "barcode" ? "numeric" : "search"} placeholder={mode === "barcode" ? "Enter barcode" : "Product or brand"} className="rounded-2xl border border-linen-border bg-linen-card px-4 py-3 text-sm outline-none focus:border-herb focus:ring-2 focus:ring-herb/20" />
            <div className="flex gap-2">
              {mode === "barcode" && <button type="button" onClick={() => setScannerOpen(true)} className="flex-1 rounded-full border border-linen-border bg-linen-card px-4 py-2.5 text-sm font-medium">Use camera</button>}
              <button disabled={pending} className="flex-1 rounded-full bg-herb px-4 py-2.5 text-sm font-semibold text-linen-card disabled:opacity-50">{pending ? "Searching…" : "Search"}</button>
            </div>
          </form>
          {scannerOpen && <BarcodeScanner onClose={() => setScannerOpen(false)} onDetected={(value) => { setScannerOpen(false); setQuery(value); void searchBarcode(value); }} />}
          {mode === "manual" && searched && (
            <div className="flex flex-col gap-2">
              {results.map((product) => <button key={product.id} type="button" onClick={() => selectExisting(product)} className="rounded-2xl border border-linen-border bg-linen-card px-4 py-3 text-left text-sm hover:bg-herb-tint"><span className="font-semibold">{product.name}</span>{product.brand && <span className="ml-2 text-charcoal-soft">{product.brand}</span>}</button>)}
              <button type="button" onClick={createManual} className="rounded-full border border-herb px-4 py-2.5 text-sm font-semibold text-herb">Create a new product</button>
            </div>
          )}
        </>
      )}

      {stage === "edit" && (
        <form onSubmit={saveExistingEdit} className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-semibold">Product details</h2>
          <input required value={draft.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Product name" className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm" />
          <input value={draft.canonicalName} onChange={(e) => updateField("canonicalName", e.target.value)} placeholder="Canonical name" className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm" />
          <div className="grid grid-cols-2 gap-2"><input value={draft.brand} onChange={(e) => updateField("brand", e.target.value)} placeholder="Brand" className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm" /><input value={draft.variant} onChange={(e) => updateField("variant", e.target.value)} placeholder="Variant" className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm" /></div>
          <input value={draft.category} onChange={(e) => updateField("category", e.target.value)} placeholder="Category" className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm" />
          <div className="grid grid-cols-2 gap-2"><input value={draft.packageQuantity} onChange={(e) => updateField("packageQuantity", e.target.value)} inputMode="decimal" placeholder="Package quantity" className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm" /><input value={draft.packageUnit} onChange={(e) => updateField("packageUnit", e.target.value)} placeholder="Unit, e.g. g" className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm" /></div>
          <div className="grid grid-cols-2 gap-2"><input value={draft.barcodeValue} onChange={(e) => updateField("barcodeValue", e.target.value)} disabled={Boolean(existing)} placeholder="Barcode (optional)" className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm disabled:opacity-60" /><select value={draft.barcodeType} onChange={(e) => updateField("barcodeType", e.target.value as BarcodeType)} disabled={Boolean(existing)} className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm disabled:opacity-60"><option value="other">Other</option><option value="ean_8">EAN-8</option><option value="ean_13">EAN-13</option><option value="upc_a">UPC-A</option><option value="gtin_14">GTIN-14</option></select></div>
          {!existing && <><label className="text-sm">Front image<input type="file" accept="image/*" onChange={chooseFrontImage} className="mt-1 block text-sm" /></label><label className="text-sm">Barcode image<input type="file" accept="image/*" onChange={(e) => setBarcodeFile(e.target.files?.[0] ?? null)} className="mt-1 block text-sm" /></label></>}
          <div className="flex gap-2"><button type="button" onClick={resetSearch} className="flex-1 rounded-full border border-linen-border px-4 py-2.5 text-sm">Cancel</button><button disabled={pending} className="flex-1 rounded-full bg-herb px-4 py-2.5 text-sm font-semibold text-linen-card disabled:opacity-50">{pending ? "Saving…" : "Review"}</button></div>
        </form>
      )}

      {(stage === "review" || stage === "done") && (
        <div className="flex flex-col gap-4 rounded-3xl border border-linen-border bg-linen-card p-5 shadow-sm">
          {imageUrl && (
            // User-uploaded public URLs are not known at build time.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={draft.name} className="h-48 w-full rounded-2xl object-cover" />
          )}
          <div><p className="font-label text-xs uppercase tracking-wide text-charcoal-soft">{stage === "done" ? "Saved product" : existing ? "Catalogue match" : "Confirm product"}</p><h2 className="font-display text-2xl font-semibold">{draft.name}</h2>{draft.brand && <p className="text-sm text-charcoal-soft">{draft.brand}{draft.variant ? ` · ${draft.variant}` : ""}</p>}</div>
          <dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-charcoal-soft">Package</dt><dd>{draft.packageQuantity || draft.packageUnit ? `${draft.packageQuantity} ${draft.packageUnit}`.trim() : "Not set"}</dd></div><div><dt className="text-charcoal-soft">Barcode</dt><dd>{draft.barcodeValue || "Not set"}</dd></div><div><dt className="text-charcoal-soft">Status</dt><dd>{existing ? existing.verification_status.replaceAll("_", " ") : "Ready to verify"}</dd></div><div><dt className="text-charcoal-soft">Source</dt><dd>{existing?.data_source ?? "Manual"}</dd></div></dl>
          {stage === "review" ? <div className="flex flex-col gap-2">{(!existing || canEditExisting) && <button type="button" onClick={() => setStage("edit")} className="rounded-full border border-linen-border px-4 py-2.5 text-sm font-medium">Edit</button>}<button type="button" onClick={() => void confirmProduct()} disabled={pending} className="rounded-full bg-herb px-4 py-2.5 text-sm font-semibold text-linen-card disabled:opacity-50">{pending ? "Saving…" : "Confirm"}</button><button type="button" onClick={resetSearch} className="text-sm text-charcoal-soft">Cancel / search again</button></div> : <div className="flex flex-col gap-2"><button type="button" disabled title="Shopping-list items are not part of this milestone" className="rounded-full border border-linen-border px-4 py-2.5 text-sm opacity-50">Add to Shopping List — coming next</button><button type="button" onClick={onGoToInventory} className="rounded-full border border-herb px-4 py-2.5 text-sm font-semibold text-herb">Add to Home / Inventory</button><button type="button" onClick={onBack} className="rounded-full bg-herb px-4 py-2.5 text-sm font-semibold text-linen-card">Just Save Product</button></div>}
          {existing && !canEditExisting && stage === "review" && <p className="text-xs text-charcoal-soft">Shared catalogue products can only be edited by their creator.</p>}
        </div>
      )}

      {stage === "done" && <p className="text-xs text-charcoal-soft">To add stock, choose a home shelf and search for this product.</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
