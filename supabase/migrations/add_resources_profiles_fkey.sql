
-- Add explicit Foreign Key to profiles to allow embedding/joining 'profiles' via 'resources'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'resources_created_by_profiles_fkey'
    ) THEN
        ALTER TABLE resources 
        ADD CONSTRAINT resources_created_by_profiles_fkey 
        FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;
