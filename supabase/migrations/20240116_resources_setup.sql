
-- Add created_at column to projects table
alter table projects add column if not exists created_at timestamp with time zone default now();

-- Create resources table
create table if not exists resources (
  id serial primary key,
  title text not null,
  description text,
  link text not null,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id)
);

-- Enable RLS
alter table resources enable row level security;

-- Policies
create policy "Enable read access for all users" on resources for select using (true);

create policy "Enable insert for admins" on resources for insert with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

create policy "Enable update for admins" on resources for update using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

create policy "Enable delete for admins" on resources for delete using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
