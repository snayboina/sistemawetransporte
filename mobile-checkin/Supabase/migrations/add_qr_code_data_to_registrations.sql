-- Migration to add qr_code_data column to registrations table
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS qr_code_data TEXT;

-- Update existing records (if any) to have their ID as QR code data
UPDATE registrations SET qr_code_data = id::text WHERE qr_code_data IS NULL;
