"use client";

import { useRecipeIngredients } from "@/hooks/useRecipeIngredients";
import type { Recipe } from "@/types/recipe";

type Props = {
  recipe: Recipe;
  userId: string;
  onBack: () => void;
  onEdit: (recipe: Recipe) => void;
};

export function RecipeDetail({ recipe, userId, onBack, onEdit }: Props) {
  const { ingredients, loaded } = useRecipeIngredients(recipe.id);
  const isOwner = recipe.created_by === userId;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex items-start justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-1 text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
          >
            ← Recipes
          </button>
          <h1 className="text-2xl font-semibold">{recipe.name}</h1>
          {recipe.servings != null && (
            <p className="text-sm text-black/50 dark:text-white/50">
              Serves {recipe.servings}
            </p>
          )}
        </div>
        {isOwner && (
          <button
            onClick={() => onEdit(recipe)}
            className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.05]"
          >
            Edit
          </button>
        )}
      </header>

      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
          Ingredients
        </h2>
        {loaded && ingredients.length === 0 && (
          <p className="text-sm text-black/40 dark:text-white/40">
            No ingredients listed.
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
      </div>

      <div className="flex flex-col gap-2 border-t border-black/10 pt-6 dark:border-white/15">
        <h2 className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
          Method
        </h2>
        <p className="whitespace-pre-wrap text-sm">{recipe.method}</p>
      </div>
    </div>
  );
}
