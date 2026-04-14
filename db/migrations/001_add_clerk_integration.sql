-- Migration: Add Clerk Integration
-- Date: 2024-08-23
-- Description: Add Clerk organization and user ID fields for multi-tenant support

-- 1. Add clerk_org_id to venues table
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS clerk_org_id VARCHAR(50) UNIQUE;

-- 2. Add index for clerk_org_id
CREATE INDEX IF NOT EXISTS idx_venues_clerk 
ON venues(clerk_org_id) 
WHERE clerk_org_id IS NOT NULL;

-- 3. Modify users table to support Clerk
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(50);

-- 4. Add indexes for Clerk user management
CREATE INDEX IF NOT EXISTS idx_users_clerk 
ON users(clerk_user_id) 
WHERE clerk_user_id IS NOT NULL;

-- 5. Create unique constraint for user-venue combination
-- This ensures one user can only have one record per venue
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_venue 
ON users(clerk_user_id, venue_id) 
WHERE clerk_user_id IS NOT NULL;

-- 6. Update email column to be nullable (some users might not have email)
ALTER TABLE users 
ALTER COLUMN phone DROP NOT NULL,
ADD COLUMN IF NOT EXISTS email VARCHAR(100);

-- 7. Add comment for documentation
COMMENT ON COLUMN venues.clerk_org_id IS 'Clerk Organization ID for multi-tenant support';
COMMENT ON COLUMN users.clerk_user_id IS 'Clerk User ID for authentication';