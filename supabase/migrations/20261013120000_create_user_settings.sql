/* D-003 User Settings storage. Run this in the Supabase SQL editor. */

create table if not exists public.user_settings (
  id uuid primary key default '11111111-1111-4111-8111-111111111111'::uuid,
  calendar_view text not null default 'Month',
  filter_app_id text not null default '',
  filter_platform text not null default '',
  filter_status text not null default '',
  filter_priority text not null default '',
  remember_filters boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint user_settings_calendar_view_valid check (
    calendar_view in ('Day', 'Week', 'Month')
  )
);

alter table public.user_settings enable row level security;

/* Temporary public access until B-017 adds user accounts and tighter policies. */
drop policy if exists "Allow read user settings" on public.user_settings;
drop policy if exists "Allow insert user settings" on public.user_settings;
drop policy if exists "Allow update user settings" on public.user_settings;

create policy "Allow read user settings"
  on public.user_settings
  for select
  to anon, authenticated
  using (true);

create policy "Allow insert user settings"
  on public.user_settings
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow update user settings"
  on public.user_settings
  for update
  to anon, authenticated
  using (true)
  with check (true);
