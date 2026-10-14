/* D-002 Social Media Post storage. Run this in the Supabase SQL editor. */

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  app_id uuid not null references public.apps(id) on delete restrict,
  platform text not null,
  due_date date not null,
  status text not null,
  priority text not null,
  notes text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_title_not_blank check (char_length(trim(title)) > 0),
  constraint posts_platform_valid check (
    platform in ('Instagram', 'Facebook', 'TikTok', 'YouTube', 'X', 'LinkedIn', 'Other')
  ),
  constraint posts_status_valid check (
    status in ('Planned', 'In Progress', 'Ready', 'Posted', 'Cancelled')
  ),
  constraint posts_priority_valid check (
    priority in ('Low', 'Normal', 'High', 'Urgent')
  )
);

alter table public.posts enable row level security;

/* Temporary public access until B-017 adds user accounts and tighter policies. */
drop policy if exists "Allow read posts" on public.posts;
drop policy if exists "Allow insert posts" on public.posts;
drop policy if exists "Allow update posts" on public.posts;
drop policy if exists "Allow delete posts" on public.posts;

create policy "Allow read posts"
  on public.posts
  for select
  to anon, authenticated
  using (true);

create policy "Allow insert posts"
  on public.posts
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow update posts"
  on public.posts
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Allow delete posts"
  on public.posts
  for delete
  to anon, authenticated
  using (true);
