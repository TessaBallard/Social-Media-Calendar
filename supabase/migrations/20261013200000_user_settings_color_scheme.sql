/* B-019: Remember the user's colour scheme with D-003 User Settings. */

alter table public.user_settings
  add column if not exists color_scheme text not null default 'System';

alter table public.user_settings
  drop constraint if exists user_settings_color_scheme_valid;

alter table public.user_settings
  add constraint user_settings_color_scheme_valid
  check (color_scheme in ('Light', 'Dark', 'System'));
