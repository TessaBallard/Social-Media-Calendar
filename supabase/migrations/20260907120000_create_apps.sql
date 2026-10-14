/* D-001 App Information storage. Run this in the Supabase SQL editor. */

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  store_url text not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  constraint apps_name_not_blank check (char_length(trim(name)) > 0),
  constraint apps_store_url_not_blank check (char_length(trim(store_url)) > 0)
);

alter table public.apps enable row level security;

/* Temporary public access until B-017 adds user accounts and tighter policies. */
drop policy if exists "Allow read apps" on public.apps;
drop policy if exists "Allow insert apps" on public.apps;
drop policy if exists "Allow update apps" on public.apps;

create policy "Allow read apps"
  on public.apps
  for select
  to anon, authenticated
  using (true);

create policy "Allow insert apps"
  on public.apps
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow update apps"
  on public.apps
  for update
  to anon, authenticated
  using (true)
  with check (true);
