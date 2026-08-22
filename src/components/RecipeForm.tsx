"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRecipes } from "@/hooks/useRecipes";
import { useRecipeIngredients } from "@/hooks/useRecipeIngredients";
import { useRecipePhotoUpload } from "@/hooks/useRecipePhotoUpload";
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
  const { uploadPhoto } = useRecipePhotoUpload(userId);
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

  const photoField = (
    <div className="flex flex-col gap-2">
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          className="h-40 w-full rounded-lg object-cover"
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
        <p className="text-xs text-black/40 dark:text-white/40">
          Uploading…
        </p>
      )}
      {photoError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {photoError}
        </p>
      )}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <button
          onClick={onBack}
          className="mb-1 text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
        >
          ← Recipes
        </button>
        <h1 className="text-2xl font-semibold">
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
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
          />
          {photoField}
          <button
            type="submit"
            disabled={creating || uploadingPhoto}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create recipe"}
          </button>
          {createError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {createError}
            </p>
          )}
        </form>
      ) : (
        <>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Recipe name"
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
          />
          {photoField}

          <div className="flex flex-col gap-2 border-y border-black/10 py-6 dark:border-white/15">
            <h2 className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
              Ingredients
            </h2>
            {loaded && ingredients.length === 0 && (
              <p className="text-sm text-black/40 dark:text-white/40">
                No ingredients yet. Add one below.
              </p>
            )}
            <ul className="flex flex-col gap-1">
              {ingredients.map((ingredient) => (
                <li
                  key={ingredient.id}
                  className="flex items-center justify-between rounded-lg px-2 py-2"
                >
                  <span className="text-sm">{ingredient.item.name}</span>
                  <span className="text-xs text-black/40 dark:text-white/40">
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
              className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
            />
            <input
              type="number"
              step="any"
              min="0"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="Servings (optional)"
              className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Make this recipe public
            </label>
            <button
              type="submit"
              disabled={saving || uploadingPhoto}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {saveError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {saveError}
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}
