create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 120),
  status text not null default 'planning'
    check (status in ('planning', 'shopping', 'finished')),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shopping_lists_owner_created_at_idx
  on public.shopping_lists (owner_id, created_at desc);

alter table public.shopping_lists enable row level security;

create policy "Owners can view their shopping lists"
  on public.shopping_lists
  for select
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "Owners can create shopping lists"
  on public.shopping_lists
  for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Owners can update their shopping lists"
  on public.shopping_lists
  for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Owners can delete their shopping lists"
  on public.shopping_lists
  for delete
  to authenticated
  using (owner_id = (select auth.uid()));

revoke all on table public.shopping_lists from anon;
grant select, insert, update, delete on table public.shopping_lists to authenticated;
grant all on table public.shopping_lists to service_role;
