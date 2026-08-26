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
            className="font-label mb-1 text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
          >
            ← Recipes
          </button>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {recipe.name}
          </h1>
          {recipe.servings != null && (
            <p className="mt-1 text-sm text-charcoal-soft">
              Serves {recipe.servings}
            </p>
          )}
        </div>
        {isOwner && (
          <button
            onClick={() => onEdit(recipe)}
            className="rounded-full border border-linen-border bg-linen-card px-4 py-2 text-sm font-medium transition-colors hover:bg-herb-tint"
          >
            Edit
          </button>
        )}
      </header>

      {recipe.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recipe.image_url}
          alt=""
          className="h-48 w-full rounded-3xl object-cover"
        />
      )}

      <div className="flex flex-col gap-2 rounded-3xl border border-linen-border bg-linen-card p-4 shadow-sm">
        <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
          Ingredients
        </h2>
        {loaded && ingredients.length === 0 && (
          <p className="text-sm text-charcoal-soft">No ingredients listed.</p>
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
      </div>

      <div className="flex flex-col gap-2 border-t border-linen-border pt-6">
        <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
          Method
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {recipe.method}
        </p>
      </div>
    </div>
  );
}
