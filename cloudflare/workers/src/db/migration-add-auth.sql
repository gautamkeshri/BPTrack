-- Migration: Add users table and replace clerk_user_id with user_id in profiles
-- Run: npx wrangler d1 execute bptrack-db --local --file=./src/db/migration-add-auth.sql

-- Users table for email+password auth (patients + doctors unified)
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'patient',  -- 'patient' | 'doctor'
  name          TEXT NOT NULL,
  created_at    INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add user_id to profiles (safe migration — nullable)
ALTER TABLE profiles ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
