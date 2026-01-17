-- Add icon column to projects table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'icon') THEN 
        ALTER TABLE public.projects ADD COLUMN icon text default 'folder'; 
    END IF; 
END $$;
