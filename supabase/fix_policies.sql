-- 1. Drop existing restrictive policies to avoid conflicts
drop policy if exists "Admins can create projects." on public.projects;
drop policy if exists "Assignees look update tasks." on public.tasks;

-- 2. PROJECTS: Allow any authenticated user to create projects
create policy "Authenticated users can create projects." 
on public.projects for insert 
with check ( auth.role() = 'authenticated' );

-- 3. PROJECTS: Allow creators to update their projects (in addition to admins if we had that)
create policy "Creators can update their projects." 
on public.projects for update 
using ( created_by = auth.uid() );

-- 4. TASKS: Allow any authenticated user to create tasks
create policy "Authenticated users can create tasks." 
on public.tasks for insert 
with check ( auth.role() = 'authenticated' );

-- 5. TASKS: Allow Assignees OR Admin OR Creator (implicit via business logic usually, but let's be safe) to update
-- Renaming for clarity and fixing the typo "look update" -> "can update"
create policy "Assignees and Admins can update tasks." 
on public.tasks for update 
using ( 
  auth.uid() = assignee_id or 
  exists ( select 1 from public.profiles where id = auth.uid() and role = 'admin' )
);

-- 6. KPIS: Allow users to create their own KPIs
create policy "Users can create own KPIs." 
on public.kpis for insert 
with check ( auth.uid() = user_id );

-- 7. KPIS: Allow users to update their own KPIs
create policy "Users can update own KPIs." 
on public.kpis for update 
using ( auth.uid() = user_id );
