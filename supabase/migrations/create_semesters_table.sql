create table if not exists semesters (
  id bigint primary key generated always as identity,
  name text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamp with time zone default now()
);

alter table semesters enable row level security;

create policy "Enable read access for all users" on semesters for select using (true);
create policy "Enable insert for admins" on semesters for insert with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Seed default
insert into semesters (id, name, start_date, end_date)
overriding system value
values (1, 'Semester 1 2026', '2026-01-01', '2026-06-30')
on conflict (id) do nothing;
