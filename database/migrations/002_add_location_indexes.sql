-- Module 2 Migration: Courier Location Services
-- Run this after schema.sql if you haven't already.

-- Ensure PostGIS extensions are present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Partial index: only index couriers who are currently available
-- This makes ST_DWithin queries dramatically faster on large datasets.
CREATE INDEX IF NOT EXISTS idx_courier_location_available
  ON courier_profiles USING GIST (current_location)
  WHERE is_available = TRUE;

-- Index for last_active to power pulse/timeout queries
CREATE INDEX IF NOT EXISTS idx_courier_last_active
  ON courier_profiles (last_active DESC)
  WHERE is_available = TRUE;

-- Ensure gps columns exist (safe if they already do)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='courier_profiles' AND column_name='current_location'
  ) THEN
    ALTER TABLE courier_profiles ADD COLUMN current_location GEOGRAPHY(POINT, 4326);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='courier_profiles' AND column_name='last_active'
  ) THEN
    ALTER TABLE courier_profiles ADD COLUMN last_active TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;
