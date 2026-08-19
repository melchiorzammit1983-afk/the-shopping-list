# Phase 1 — Foundation

Foundation for this shopping list / household inventory app.

## What this phase builds

Locations, an item catalog, login, and basic stock tracking (add item, set
quantity, adjust quantity). No recurring rules, no POS/checkout, no barcode
scanning yet — those come in later phases.

## Assumptions

- Backend: Supabase (new project, separate from my other app)
- Auth: Supabase email/password login
- Hosting: Vercel (already connected via GitHub)

## Data model

### locations

- `id` (uuid, primary key)
- `name` (text) — e.g. "Home", "Shop A"
- `type` (text) — free text for now: household / shop / restaurant
- `owner_id` (uuid, references auth.users)
- `created_at` (timestamptz)

### items (global catalog — shared across all users, not per-location)

- `id` (uuid, primary key)
- `name` (text)
- `category` (text, optional)
- `unit` (text) — e.g. each / kg / l
- `created_at` (timestamptz)

### location_items (actual stock at a location)

- `id` (uuid, primary key)
- `location_id` (uuid, references locations)
- `item_id` (uuid, references items)
- `quantity` (numeric)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Shared catalog rule (important)

When a user adds an item, search existing items by name first and show
matches so they link to an existing item instead of creating a duplicate.
Only create a new item if nothing matches.

## Screens

1. Login / Sign up — email + password
2. Locations list — see your locations, create a new one
3. Location detail — list of items with quantity, +/- buttons to adjust,
   "Add item" button
4. Add item — search existing catalog first, or create new item, set
   starting quantity

## Out of scope for this phase (do not build yet)

- Recurring/auto-refill rules, low-stock alerts
- POS checkout, pricing
- Barcode scanning
- Admin page

## Instructions for Claude Code

- Work on a branch called `phase-1-foundation`
- Build order: DB tables → auth → locations screen → item catalog →
  location detail/stock screen
- Stop after each piece so I can test before you continue
- Once everything works end-to-end, merge `phase-1-foundation` into main
  and deploy
- Do not start anything beyond what's described here
