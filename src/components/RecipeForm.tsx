"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRecipes } from "@/hooks/useRecipes";
import { useRecipeIngredients } from "@/hooks/useRecipeIngredients";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { AddIngredientForm } from "@/components/AddIngredientForm";
import type { Recipe } from "@/types/recipe";

type Props = {
  userId: string;
  existingRecipe: Recipe | null;
  onBack: () => void;
  onDone: (recipe: Recipe) => void;
};

export function RecipeForm({
  userId,
  existingRecipe,
  onBack,
  onDone,
}: Props) {
  const { createRecipe, updateRecipe } = useRecipes(userId);
  const { uploadPhoto } = usePhotoUpload(userId, "recipe-photos");
  const [recipe, setRecipe] = useState<Recipe | null>(existingRecipe);
  const [name, setName] = useState(existingRecipe?.name ?? "");
  const [method, setMethod] = useState(existingRecipe?.method ?? "");
  const [servings, setServings] = useState(
    existingRecipe?.servings != null ? String(existingRecipe.servings) : ""
  );
  const [isPublic, setIsPublic] = useState(existingRecipe?.is_public ?? false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    existingRecipe?.image_url ?? null
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const { ingredients, loaded, addIngredient } = useRecipeIngredients(
    recipe?.id ?? null
  );

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setPhotoError("");
    const result = await uploadPhoto(file);
    setUploadingPhoto(false);
    if (result.error || !result.url) {
      setPhotoError(result.error ?? "Could not upload photo");
      return;
    }
    setPhotoUrl(result.url);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    const result = await createRecipe(name, "", "", false, photoUrl);
    setCreating(false);
    if (result.error || !result.recipe) {
      setCreateError(result.error ?? "Could not create recipe");
      return;
    }
    setRecipe(result.recipe);
  }

  async function handleSaveDetails(e: FormEvent) {
    e.preventDefault();
    if (!recipe) return;
    setSaving(true);
    setSaveError("");
    const result = await updateRecipe(
      recipe.id,
      name,
      method,
      servings,
      isPublic,
      photoUrl
    );
    setSaving(false);
    if (result.error || !result.recipe) {
      setSaveError(result.error ?? "Could not save recipe");
      return;
    }
    setRecipe(result.recipe);
    onDone(result.recipe);
  }

  const inputClass =
    "rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-soft/60 focus:border-herb focus:ring-2 focus:ring-herb/20";

  const photoField = (
    <div className="flex flex-col gap-2">
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          className="h-40 w-full rounded-2xl object-cover"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        disabled={uploadingPhoto}
        className="text-sm"
      />
      {uploadingPhoto && (
        <p className="text-xs text-charcoal-soft">Uploading…</p>
      )}
      {photoError && <p className="text-sm text-danger">{photoError}</p>}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <button
          onClick={onBack}
          className="font-label mb-1 text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
        >
          ← Recipes
        </button>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {recipe ? "Edit recipe" : "Create recipe"}
        </h1>
      </header>

      {!recipe ? (
        <form onSubmit={handleCreate} className="flex flex-col gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Recipe name"
            className={inputClass}
          />
          {photoField}
          <button
            type="submit"
            disabled={creating || uploadingPhoto}
            className="rounded-full bg-herb px-4 py-2.5 text-sm font-semibold text-linen-card shadow-sm transition-colors hover:bg-herb-dark disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create recipe"}
          </button>
          {createError && <p className="text-sm text-danger">{createError}</p>}
        </form>
      ) : (
        <>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Recipe name"
            className={inputClass}
          />
          {photoField}

          <div className="flex flex-col gap-2 rounded-3xl border border-linen-border bg-linen-card p-4 shadow-sm">
            <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
              Ingredients
            </h2>
            {loaded && ingredients.length === 0 && (
              <p className="text-sm text-charcoal-soft">
                No ingredients yet. Add one below.
              </p>
            )}
            <ul className="flex flex-col gap-1">
              {ingredients.map((ingredient) => (
                <li
                  key={ingredient.id}
                  className="flex items-center justify-between rounded-xl px-2 py-2"
                >
                  <span className="text-sm">{ingredient.item.name}</span>
                  <span className="font-label text-xs text-charcoal-soft">
                    {ingredient.quantity}
                    {ingredient.unit ? ` ${ingredient.unit}` : ""}
                  </span>
                </li>
              ))}
            </ul>

            <AddIngredientForm onAddIngredient={addIngredient} />
          </div>

          <form onSubmit={handleSaveDetails} className="flex flex-col gap-2">
            <textarea
              rows={6}
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="Method / steps"
              className={inputClass}
            />
            <input
              type="number"
              step="any"
              min="0"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="Servings (optional)"
              className={inputClass}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="accent-herb"
              />
              Make this recipe public
            </label>
            <button
              type="submit"
              disabled={saving || uploadingPhoto}
              className="rounded-full bg-herb px-4 py-2.5 text-sm font-semibold text-linen-card shadow-sm transition-colors hover:bg-herb-dark disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {saveError && <p className="text-sm text-danger">{saveError}</p>}
          </form>
        </>
      )}
    </div>
  );
}
