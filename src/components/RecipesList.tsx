"use client";

import { useRecipes } from "@/hooks/useRecipes";
import type { Recipe } from "@/types/recipe";

type Props = {
  userId: string;
  onSelectRecipe: (recipe: Recipe) => void;
  onCreateRecipe: () => void;
  onGoToLocations: () => void;
};

export function RecipesList({
  userId,
  onSelectRecipe,
  onCreateRecipe,
  onGoToLocations,
}: Props) {
  const { myRecipes, sharedRecipes, loaded } = useRecipes(userId);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex items-start justify-between">
        <div>
          <button
            onClick={onGoToLocations}
            className="font-label mb-1 text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
          >
            ← Locations
          </button>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Recipes
          </h1>
        </div>
        <button
          onClick={onCreateRecipe}
          className="rounded-full bg-herb px-4 py-2 text-sm font-semibold text-linen-card shadow-sm transition-colors hover:bg-herb-dark"
        >
          Create recipe
        </button>
      </header>

      <div className="flex flex-col gap-2">
        <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
          My Recipes
        </h2>
        {loaded && myRecipes.length === 0 && (
          <p className="text-sm text-charcoal-soft">
            You haven&apos;t created any recipes yet.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {myRecipes.map((recipe) => (
            <li key={recipe.id}>
              <button
                type="button"
                onClick={() => onSelectRecipe(recipe)}
                className="flex w-full items-center justify-between rounded-3xl border border-linen-border bg-linen-card px-5 py-4 text-left shadow-sm transition-colors hover:border-herb/40 hover:bg-herb-tint"
              >
                <span className="font-display text-lg font-semibold">
                  {recipe.name}
                </span>
                {recipe.is_public && (
                  <span className="font-label rounded-full bg-butter-tint px-2.5 py-1 text-[10px] uppercase tracking-wide text-butter-dark">
                    Public
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t border-linen-border pt-6">
        <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
          Shared Recipes
        </h2>
        {loaded && sharedRecipes.length === 0 && (
          <p className="text-sm text-charcoal-soft">
            No public recipes from other users yet.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {sharedRecipes.map((recipe) => (
            <li key={recipe.id}>
              <button
                type="button"
                onClick={() => onSelectRecipe(recipe)}
                className="flex w-full items-center justify-between rounded-3xl border border-linen-border bg-linen-card px-5 py-4 text-left shadow-sm transition-colors hover:border-herb/40 hover:bg-herb-tint"
              >
                <span className="font-display text-lg font-semibold">
                  {recipe.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
