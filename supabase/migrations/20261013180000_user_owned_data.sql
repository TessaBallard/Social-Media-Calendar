/* B-017: Keep each user's apps, posts, and settings on their own account.
   Run this in the Supabase SQL editor after enabling Email sign-in. */

alter table public.apps
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.posts
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
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

alter table public.user_settings
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create unique index if not exists user_settings_user_id_key
  on public.user_settings (user_id);

create index if not exists apps_user_id_idx on public.apps (user_id);
create index if not exists posts_user_id_idx on public.posts (user_id);

alter table public.apps enable row level security;
alter table public.posts enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "Allow read apps" on public.apps;
drop policy if exists "Allow insert apps" on public.apps;
drop policy if exists "Allow update apps" on public.apps;
drop policy if exists "Users can read own apps" on public.apps;
drop policy if exists "Users can insert own apps" on public.apps;
drop policy if exists "Users can update own apps" on public.apps;

create policy "Users can read own apps"
  on public.apps
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own apps"
  on public.apps
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own apps"
  on public.apps
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Allow read posts" on public.posts;
drop policy if exists "Allow insert posts" on public.posts;
drop policy if exists "Allow update posts" on public.posts;
drop policy if exists "Allow delete posts" on public.posts;
drop policy if exists "Users can read own posts" on public.posts;
drop policy if exists "Users can insert own posts" on public.posts;
drop policy if exists "Users can update own posts" on public.posts;
drop policy if exists "Users can delete own posts" on public.posts;

create policy "Users can read own posts"
  on public.posts
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own posts"
  on public.posts
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.apps
      where apps.id = posts.app_id
        and apps.user_id = auth.uid()
    )
  );

create policy "Users can update own posts"
  on public.posts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.apps
      where apps.id = posts.app_id
        and apps.user_id = auth.uid()
    )
  );

create policy "Users can delete own posts"
  on public.posts
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Allow read user settings" on public.user_settings;
drop policy if exists "Allow insert user settings" on public.user_settings;
drop policy if exists "Allow update user settings" on public.user_settings;
drop policy if exists "Users can read own settings" on public.user_settings;
drop policy if exists "Users can insert own settings" on public.user_settings;
drop policy if exists "Users can update own settings" on public.user_settings;

create policy "Users can read own settings"
  on public.user_settings
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on public.user_settings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

/* First signed-in account keeps apps/posts created before sign-in. */
create or replace function public.claim_orphan_planner_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  if exists (select 1 from public.apps where user_id is not null) then
    return;
  end if;

  update public.apps set user_id = auth.uid() where user_id is null;
  update public.posts set user_id = auth.uid() where user_id is null;
  update public.user_settings set user_id = auth.uid() where user_id is null;
end;
$$;

revoke all on function public.claim_orphan_planner_data() from public;
grant execute on function public.claim_orphan_planner_data() to authenticated;
