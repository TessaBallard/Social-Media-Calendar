/* Temporary public delete access until B-017 adds user accounts and tighter policies. */

drop policy if exists "Allow delete posts" on public.posts;

create policy "Allow delete posts"
  on public.posts
  for delete
  to anon, authenticated
  using (true);
