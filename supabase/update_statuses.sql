-- Drop the existing constraint
alter table public.tasks drop constraint if exists tasks_status_check;

-- Add the new constraint with expanded status list
-- We keep 'in_progress' and 'done' for backward compatibility, 
-- but we add the new ones requested: 'on_track', 'at_risk', 'off_track', 'on_hold', 'complete'
alter table public.tasks 
add constraint tasks_status_check 
check (status in (
  'todo', 
  'in_progress', 
  'done', 
  'on_track', 
  'at_risk', 
  'off_track', 
  'on_hold', 
  'complete'
));
