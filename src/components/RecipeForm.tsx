"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRecipes } from "@/hooks/useRecipes";
import { useRecipeIngredients } from "@/hooks/useRecipeIngredients";
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
  const [recipe, setRecipe] = useState<Recipe | null>(existingRecipe);
  const [name, setName] = useState(existingRecipe?.name ?? "");
  const [method, setMethod] = useState(existingRecipe?.method ?? "");
  const [servings, setServings] = useState(
    existingRecipe?.servings != null ? String(existingRecipe.servings) : ""
  );
  const [isPublic, setIsPublic] = useState(existingRecipe?.is_public ?? false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const { ingredients, loaded, addIngredient } = useRecipeIngredients(
    recipe?.id ?? null
  );

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");

    const wasNew = !recipe;
    const result = recipe
      ? await updateRecipe(recipe.id, name, method, servings, isPublic)
      : await createRecipe(name, method, servings, isPublic);

    setPending(false);
    if (result.error || !result.recipe) {
      setError(result.error ?? "Could not save recipe");
      return;
    }
    setRecipe(result.recipe);
    // Stay on this screen after creating so the ingredients section (which
    // only appears once the recipe exists) is immediately visible, instead
    // of dropping the user onto the view-only detail page.
    if (!wasNew) onDone(result.recipe);
  }

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

      <form onSubmit={handleSave} className="flex flex-col gap-2">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Recipe name"
          className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
        />
        <textarea
          required
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
          disabled={pending}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : recipe ? "Save changes" : "Create recipe"}
        </button>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>

      {recipe && (
        <div className="flex flex-col gap-2 border-t border-black/10 pt-6 dark:border-white/15">
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
      )}
    </div>
  );
}
