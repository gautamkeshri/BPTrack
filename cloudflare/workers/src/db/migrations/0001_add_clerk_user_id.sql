-- Migration: Add Clerk user ID to profiles table
-- Date: 2025-12-10
-- Purpose: Link profiles to Clerk user accounts for OAuth authentication

-- Add clerk_user_id column to profiles table (nullable to support migration)
ALTER TABLE profiles ADD COLUMN clerk_user_id TEXT;

-- Create index for efficient lookup by Clerk user ID
CREATE INDEX idx_profiles_clerk_user_id ON profiles(clerk_user_id);
