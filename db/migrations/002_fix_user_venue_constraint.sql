-- Migration: Fix user-venue unique constraint
-- Date: 2024-08-23
-- Description: Add proper unique constraint for ON CONFLICT to work

-- Drop the existing unique index if it exists
DROP INDEX IF EXISTS idx_users_clerk_venue;

-- Add a proper unique constraint (this creates an index automatically)
ALTER TABLE users 
ADD CONSTRAINT unique_user_venue 
UNIQUE (clerk_user_id, venue_id);