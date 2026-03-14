-- Create app_settings table
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default now()
);

-- RLS
alter table public.app_settings enable row level security;

-- Admins can do everything
create policy "Admins can manage app settings." 
  on public.app_settings for all 
  using ( exists ( select 1 from public.profiles where id = auth.uid() and role = 'admin' ) );

-- Anyone can read settings (needed for cron if not using admin client, but cron uses admin client usually)
create policy "Anyone can read app settings."
  on public.app_settings for select
  using ( true );

-- Initial data: Enable digest email by default
insert into public.app_settings (key, value) 
values ('digest_email_enabled', 'true'::jsonb)
on conflict (key) do nothing;
