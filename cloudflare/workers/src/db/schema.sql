-- BPTrack D1 Database Schema (SQLite)
-- Converted from PostgreSQL schema

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  medical_conditions TEXT DEFAULT '[]', -- JSON array stored as TEXT
  is_active INTEGER DEFAULT 0, -- SQLite uses INTEGER for boolean (0=false, 1=true)
  created_at INTEGER NOT NULL -- Unix timestamp in milliseconds
);

-- Index for finding active profile quickly
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Blood pressure readings table
CREATE TABLE IF NOT EXISTS blood_pressure_readings (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  systolic INTEGER NOT NULL,
  diastolic INTEGER NOT NULL,
  pulse INTEGER NOT NULL,
  weight INTEGER, -- Optional, in kg
  notes TEXT,
  reading_date INTEGER NOT NULL, -- Unix timestamp in milliseconds
  classification TEXT NOT NULL,
  pulse_pressure INTEGER NOT NULL,
  mean_arterial_pressure INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Indexes for blood pressure readings
CREATE INDEX IF NOT EXISTS idx_bp_readings_profile_id ON blood_pressure_readings(profile_id);
CREATE INDEX IF NOT EXISTS idx_bp_readings_reading_date ON blood_pressure_readings(reading_date DESC);
CREATE INDEX IF NOT EXISTS idx_bp_readings_profile_date ON blood_pressure_readings(profile_id, reading_date DESC);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  title TEXT NOT NULL,
  time TEXT NOT NULL, -- HH:MM format
  is_repeating INTEGER DEFAULT 0, -- SQLite boolean
  days_of_week TEXT DEFAULT '[]', -- JSON array stored as TEXT
  is_active INTEGER DEFAULT 1, -- SQLite boolean
  created_at INTEGER NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Index for reminders
CREATE INDEX IF NOT EXISTS idx_reminders_profile_id ON reminders(profile_id);
CREATE INDEX IF NOT EXISTS idx_reminders_is_active ON reminders(is_active);
