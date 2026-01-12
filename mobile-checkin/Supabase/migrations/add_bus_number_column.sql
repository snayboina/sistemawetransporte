-- Migration to add missing bus_number column to readings table
-- This fixes the error: "could not find the bus_number column of readings in the schema cache"

-- Add bus_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'readings' 
        AND column_name = 'bus_number'
    ) THEN
        ALTER TABLE readings ADD COLUMN bus_number TEXT NOT NULL DEFAULT 'N/A';
        
        -- Remove the default after adding the column
        ALTER TABLE readings ALTER COLUMN bus_number DROP DEFAULT;
    END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_readings_bus_number ON readings(bus_number);
