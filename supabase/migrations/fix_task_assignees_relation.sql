-- Ensure task_assignees table exists
CREATE TABLE IF NOT EXISTS task_assignees (
    task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, user_id)
);

-- Add explicit Foreign Key to profiles to allow embedding/joining 'profiles' via 'task_assignees'
-- PostgREST requires a direct FK to embed 'profiles'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'task_assignees_user_id_profiles_fkey'
    ) THEN
        ALTER TABLE task_assignees 
        ADD CONSTRAINT task_assignees_user_id_profiles_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON task_assignees;
CREATE POLICY "Allow read access for authenticated users" ON task_assignees
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow all access for authenticated users" ON task_assignees;
CREATE POLICY "Allow all access for authenticated users" ON task_assignees
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
