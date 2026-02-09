
-- Add is_completed column to kpis table
ALTER TABLE kpis ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow update by admin
DROP POLICY IF EXISTS "Enable update for admins" ON kpis;
CREATE POLICY "Enable update for admins" ON kpis
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
