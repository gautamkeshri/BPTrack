-- Migration: Add doctor_id to users + access_grants table
-- Run (remote): npx wrangler d1 execute bptrack-db --remote --file=./src/db/migration-add-doctor-access.sql
-- Run (local):  npx wrangler d1 execute bptrack-db --local  --file=./src/db/migration-add-doctor-access.sql

-- Add doctor_id to users — nullable TEXT, unique, only populated for role='doctor'
-- Format: 'DR-XXXXXX' (6 uppercase hex chars), e.g. 'DR-A1B2C3'
-- NOTE: SQLite does not allow UNIQUE in ALTER TABLE ADD COLUMN.
--       Uniqueness is enforced by the index below instead.
ALTER TABLE users ADD COLUMN doctor_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_doctor_id ON users(doctor_id);

-- Access grants: patient grants a doctor read-only access to their BP data
CREATE TABLE IF NOT EXISTS access_grants (
  id          TEXT PRIMARY KEY,
  patient_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'revoked'
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  UNIQUE(patient_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_access_grants_patient   ON access_grants(patient_id);
CREATE INDEX IF NOT EXISTS idx_access_grants_doctor    ON access_grants(doctor_id);
CREATE INDEX IF NOT EXISTS idx_access_grants_status    ON access_grants(status);
