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
            className="mb-1 text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
          >
            ← Locations
          </button>
          <h1 className="text-2xl font-semibold">Recipes</h1>
        </div>
        <button
          onClick={onCreateRecipe}
          className="rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Create recipe
        </button>
      </header>

      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
          My Recipes
        </h2>
        {loaded && myRecipes.length === 0 && (
          <p className="text-sm text-black/40 dark:text-white/40">
            You haven&apos;t created any recipes yet.
          </p>
        )}
        <ul className="flex flex-col gap-1">
          {myRecipes.map((recipe) => (
            <li key={recipe.id}>
              <button
                type="button"
                onClick={() => onSelectRecipe(recipe)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-black/[.03] dark:hover:bg-white/[.05]"
              >
                <span className="text-sm">{recipe.name}</span>
                {recipe.is_public && (
                  <span className="text-xs text-black/40 dark:text-white/40">
                    Public
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t border-black/10 pt-6 dark:border-white/15">
        <h2 className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
          Shared Recipes
        </h2>
        {loaded && sharedRecipes.length === 0 && (
          <p className="text-sm text-black/40 dark:text-white/40">
            No public recipes from other users yet.
          </p>
        )}
        <ul className="flex flex-col gap-1">
          {sharedRecipes.map((recipe) => (
            <li key={recipe.id}>
              <button
                type="button"
                onClick={() => onSelectRecipe(recipe)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-black/[.03] dark:hover:bg-white/[.05]"
              >
                <span className="text-sm">{recipe.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
