-- 1. Create the join table
create table public.task_assignees (
  task_id bigint references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  assigned_at timestamp with time zone default now(),
  primary key (task_id, user_id)
);

-- 2. Migrate existing data (preserve current assignees)
insert into public.task_assignees (task_id, user_id)
select id, assignee_id from public.tasks;

-- 3. Make the old column optional (deprecated)
alter table public.tasks alter column assignee_id drop not null;

-- 4. Enable RLS on the new table
alter table public.task_assignees enable row level security;

-- 5. RLS Policies for task_assignees
-- Everyone can view assignees
create policy "Task assignees are viewable by everyone." 
on public.task_assignees for select using ( true );

-- Authenticated users (or just admins/creators ideally, but relaxed for this app) can add/remove assignees
create policy "Authenticated users can manage assignees." 
on public.task_assignees for all 
using ( auth.role() = 'authenticated' );
