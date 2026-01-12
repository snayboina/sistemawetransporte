-- Migration to ensure readings table allows anonymous inserts
-- This migration disables RLS on the readings table to allow the mobile app to insert data

-- Disable RLS on readings table (if it was enabled)
ALTER TABLE readings DISABLE ROW LEVEL SECURITY;

-- Alternatively, if you want to keep RLS enabled but allow anonymous inserts:
-- ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow anonymous inserts to readings"
-- ON readings
-- FOR INSERT
-- TO anon
-- WITH CHECK (true);
-- 
-- CREATE POLICY "Allow anonymous selects from readings"
-- ON readings
-- FOR SELECT
-- TO anon
-- USING (true);
