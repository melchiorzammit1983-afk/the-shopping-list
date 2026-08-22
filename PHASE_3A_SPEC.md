# Phase 3a — Storage Structure (Rooms & Shelves) + Item Photos

## What this phase builds

Every location contains Rooms, every Room contains Shelves, stock is
tracked per shelf. Items can also have a photo, reusing the same upload
pattern already built for recipe photos.

## Data model

### rooms

- `id` (uuid, primary key)
- `location_id` (uuid, references locations)
- `name` (text)
- `created_at` (timestamptz)

### shelves

- `id` (uuid, primary key)
- `room_id` (uuid, references rooms)
- `name` (text)
- `created_at` (timestamptz)

### stock_entries (replaces location_items)

- `id` (uuid, primary key)
- `shelf_id` (uuid, references shelves)
- `item_id` (uuid, references items)
- `quantity` (numeric)
- `unit` (text) — e.g. g, kg, ml, l, each
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### items table — add

- `image_url` (text, nullable)

## Migration (don't lose existing data)

For every existing location, create one default room "General" with one
default shelf "General", move all existing `location_items` rows into
`stock_entries` under that shelf.

## Unit totaling

Sum all `stock_entries` for an item across every shelf, converting
compatible units (g+kg, ml+l) into one readable total.

## Reuse existing code

The item photo feature should reuse the exact upload/preview/storage
pattern already built for recipe photos (same hook, same approach) — do
not build this from scratch.

## Screens

1. Location screen — shows list of Rooms, "Add room"
2. Room detail — list of Shelves, "Add shelf"
3. Shelf detail — items on that shelf with quantity/unit, +/- to adjust,
   "Add item" (search-or-create, with optional photo)
4. Item total view — total across all shelves with a breakdown, shows
   photo if set

## Out of scope (do not build yet)

- Cook Mode, visual room map, barcode scanning

## Instructions for Claude Code

- Branch: `phase-3a-storage-structure`
- Build the full migration and all screens in one pass — do not stop
  partway through unless genuinely blocked
- Stop once, at the end, for testing before merge
- Test the migration carefully — confirm existing Home data (milk,
  flour) still shows correctly under "General"
- Wait for explicit "merge" — do not merge on your own
- Do not start anything beyond what's described here
