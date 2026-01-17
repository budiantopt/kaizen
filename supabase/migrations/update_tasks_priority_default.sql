-- update existing tasks to have medium priority if null
UPDATE tasks 
SET priority = 'medium' 
WHERE priority IS NULL OR priority = '';

-- set default value for future tasks
ALTER TABLE tasks 
ALTER COLUMN priority 
SET DEFAULT 'medium';
