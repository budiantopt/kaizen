-- Enable RLS (just in case)
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for admins" ON kpis;

-- Create insert policy for admins
CREATE POLICY "Enable insert for admins" ON kpis
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Also ensure admins can delete
DROP POLICY IF EXISTS "Enable delete for admins" ON kpis;
CREATE POLICY "Enable delete for admins" ON kpis
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Ensure admins can select (though usually specific select policies exist or are open)
-- Adding this to be safe if "Enable read access for all users" isn't sufficient or correct
DROP POLICY IF EXISTS "Enable select for admins" ON kpis;
CREATE POLICY "Enable select for admins" ON kpis
    FOR SELECT
    USING (
         EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
