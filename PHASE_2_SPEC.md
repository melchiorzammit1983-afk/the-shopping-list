# Phase 2 — Recipe Book

## What this phase builds

Users can create recipes with ingredients and method. Each recipe has a
"make this public" toggle — private by default, but the user can choose to
share it so other households can see (read-only) and use it.

## Data model

### recipes

- `id` (uuid, primary key)
- `name` (text)
- `method` (text) — the steps/instructions
- `servings` (numeric, optional)
- `is_public` (boolean, default false)
- `created_by` (uuid, references auth.users)
- `created_at` (timestamptz)

### recipe_ingredients

- `id` (uuid, primary key)
- `recipe_id` (uuid, references recipes)
- `item_id` (uuid, references items) — reuse the existing shared item
  catalog from Phase 1
- `quantity` (numeric)
- `unit` (text)
- `created_at` (timestamptz)

## Rules

- Adding an ingredient to a recipe follows the same shared-catalog rule as
  Phase 1: search existing items first, link to a match, only create new
  if nothing matches.
- A user can always see and edit their own recipes.
- A user can view (read-only, cannot edit) other users' recipes where
  `is_public = true`.
- Set up RLS policies to enforce this.

## Screens

1. Recipes list — split into "My Recipes" and "Shared Recipes", with a
   "Create recipe" button
2. Recipe detail — view method + ingredients list
3. Create/edit recipe — name, method, add ingredients (search catalog
   first), quantity/unit per ingredient, toggle for "Make this recipe
   public"

## Out of scope for this phase (do not build yet)

- AI import from video links
- Meal planning / auto-generating a shopping list from recipes
- Moderation or reporting tools for public recipes

## Instructions for Claude Code

- Work on a branch called `phase-2-recipes`
- Checkpoint 1: build database tables + RLS policies, then stop and report
- Checkpoint 2: build all three screens together (list, detail,
  create/edit), then stop and report
- Once confirmed at checkpoint 2, merge `phase-2-recipes` into main and
  deploy
- Do not start anything beyond what's described here
