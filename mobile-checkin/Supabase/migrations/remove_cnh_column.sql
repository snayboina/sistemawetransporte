-- Migration: Remove cnh column from drivers table
ALTER TABLE drivers DROP COLUMN IF EXISTS cnh;
