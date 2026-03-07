/**
 * seed-demo.js — Seed 4 patients + 3 doctors with realistic BP data
 * Run from cloudflare/workers/:
 *   node src/db/seed-demo.js           (remote D1)
 *   node src/db/seed-demo.js --local   (local D1)
 */

import { createHash } from 'node:crypto';
import { writeFileSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sha256(str) {
  return createHash('sha256').update(str).digest('hex');
}

// Simple LCG seeded PRNG — deterministic so the seed is reproducible
function makePrng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

function classify(systolic, diastolic) {
  if (systolic >= 180 || diastolic >= 120) return 'Hypertensive Crisis';
  if (systolic >= 140 || diastolic >= 90)  return 'Hypertension Stage 2';
  if (systolic >= 130 || diastolic >= 80)  return 'Hypertension Stage 1';
  if (systolic >= 120 && diastolic < 80)   return 'Elevated';
  return 'Normal';
}

function pulsePressure(s, d) { return s - d; }
function map(s, d) { return Math.round(d + (s - d) / 3); }

// ---------------------------------------------------------------------------
// Seed data definitions
// ---------------------------------------------------------------------------

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

// Keep passwords simple for demo access
const DOCTOR_PASS = 'doctor1234';
const PATIENT_PASS = 'demo1234';

const DOCTORS = [
  { id: 'a1000001-0000-0000-0000-000000000001', email: 'sarah.mitchell@demo.com', name: 'Dr. Sarah Mitchell', salt: 'a1b2c3d4e5f607182930a4b5c6d7e8f9', doctorId: 'DR-SM0001' },
  { id: 'a1000001-0000-0000-0000-000000000002', email: 'james.chen@demo.com',      name: 'Dr. James Chen',      salt: 'b2c3d4e5f607182930a4b5c6d7e8091a', doctorId: 'DR-JC0002' },
  { id: 'a1000001-0000-0000-0000-000000000003', email: 'priya.sharma@demo.com',    name: 'Dr. Priya Sharma',    salt: 'c3d4e5f607182930a4b5c6d7e8091ab2', doctorId: 'DR-PS0003' },
];

const PATIENTS = [
  {
    id:      'b2000001-0000-0000-0000-000000000001',
    profId:  'c3000001-0000-0000-0000-000000000001',
    email:   'alice.j@demo.com',
    name:    'Alice Johnson',
    salt:    'd4e5f607182930a4b5c6d7e8091ab2c3',
    profile: { gender: 'female', age: 58, conditions: ['Hypertension', 'Type 2 Diabetes'] },
    // Stage 1 hypertension
    bpRange: { sysMin: 130, sysMax: 145, diaMin: 82, diaMax: 92, pulseMin: 66, pulseMax: 80 },
    seed: 1001,
  },
  {
    id:      'b2000001-0000-0000-0000-000000000002',
    profId:  'c3000001-0000-0000-0000-000000000002',
    email:   'bob.m@demo.com',
    name:    'Bob Martinez',
    salt:    'e5f607182930a4b5c6d7e8091ab2c3d4',
    profile: { gender: 'male', age: 28, conditions: [] },
    // Normal BP
    bpRange: { sysMin: 108, sysMax: 120, diaMin: 65, diaMax: 78, pulseMin: 58, pulseMax: 72 },
    seed: 2002,
  },
  {
    id:      'b2000001-0000-0000-0000-000000000003',
    profId:  'c3000001-0000-0000-0000-000000000003',
    email:   'carol.w@demo.com',
    name:    'Carol Williams',
    salt:    'f607182930a4b5c6d7e8091ab2c3d4e5',
    profile: { gender: 'female', age: 45, conditions: ['Obesity'] },
    // Elevated
    bpRange: { sysMin: 121, sysMax: 129, diaMin: 74, diaMax: 82, pulseMin: 68, pulseMax: 80 },
    seed: 3003,
  },
  {
    id:      'b2000001-0000-0000-0000-000000000004',
    profId:  'c3000001-0000-0000-0000-000000000004',
    email:   'david.p@demo.com',
    name:    'David Park',
    salt:    '07182930a4b5c6d7e8091ab2c3d4e5f6',
    profile: { gender: 'male', age: 65, conditions: ['Hypertension', 'Coronary Artery Disease'] },
    // Stage 2 hypertension
    bpRange: { sysMin: 145, sysMax: 168, diaMin: 90, diaMax: 104, pulseMin: 70, pulseMax: 88 },
    seed: 4004,
  },
];

const READINGS_PER_PATIENT = 35; // ~1 every 2.5 days over 90 days

// ---------------------------------------------------------------------------
// Generate readings for a patient
// ---------------------------------------------------------------------------

function generateReadings(patient) {
  const rng = makePrng(patient.seed);
  const { sysMin, sysMax, diaMin, diaMax, pulseMin, pulseMax } = patient.bpRange;
  const rows = [];

  for (let i = 0; i < READINGS_PER_PATIENT; i++) {
    // Space readings roughly every 2-3 days going backward from today
    const daysBack = Math.round(i * (90 / READINGS_PER_PATIENT) + rng() * 1.5);
    // Morning (6-9am) or evening (6-9pm) reading
    const hour = rng() < 0.5 ? randInt(rng, 6, 9) : randInt(rng, 18, 21);
    const minute = randInt(rng, 0, 59);
    const ts = NOW - daysBack * DAY + hour * 3600000 + minute * 60000;

    const sys   = randInt(rng, sysMin, sysMax);
    const dia   = randInt(rng, diaMin, diaMax);
    const pulse = randInt(rng, pulseMin, pulseMax);
    const pp    = pulsePressure(sys, dia);
    const mapVal = map(sys, dia);
    const cls   = classify(sys, dia);

    const readId = `d${patient.seed}-read-${String(i).padStart(4, '0')}-${ts.toString(16).slice(-8)}`;

    rows.push(
      `INSERT OR IGNORE INTO blood_pressure_readings ` +
      `(id, profile_id, systolic, diastolic, pulse, reading_date, classification, pulse_pressure, mean_arterial_pressure, created_at) VALUES ` +
      `('${readId}', '${patient.profId}', ${sys}, ${dia}, ${pulse}, ${ts}, '${cls}', ${pp}, ${mapVal}, ${NOW});`
    );
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Build SQL
// ---------------------------------------------------------------------------

const lines = [
  '-- BPTrack demo seed — auto-generated by seed-demo.js',
  '-- Safe to re-run: uses INSERT OR IGNORE throughout',
  '',
];

// Doctors
lines.push('-- ===== DOCTORS =====');
for (const d of DOCTORS) {
  const hash = sha256(DOCTOR_PASS + d.salt);
  lines.push(
    `INSERT OR IGNORE INTO users (id, email, password_hash, salt, role, name, doctor_id, created_at) VALUES ` +
    `('${d.id}', '${d.email}', '${hash}', '${d.salt}', 'doctor', '${d.name}', '${d.doctorId}', ${NOW});`
  );
}

// Set doctor_id on the existing demo doctor (doctor@demo.com) if not already set
lines.push(
  `UPDATE users SET doctor_id = 'DR-DEMO01' WHERE email = 'doctor@demo.com' AND (doctor_id IS NULL OR doctor_id = '');`
);
lines.push('');

// Patients + profiles
lines.push('-- ===== PATIENTS =====');
for (const p of PATIENTS) {
  const hash = sha256(PATIENT_PASS + p.salt);
  const conditions = JSON.stringify(p.profile.conditions);

  lines.push(
    `INSERT OR IGNORE INTO users (id, email, password_hash, salt, role, name, created_at) VALUES ` +
    `('${p.id}', '${p.email}', '${hash}', '${p.salt}', 'patient', '${p.name}', ${NOW});`
  );
  lines.push(
    `INSERT OR IGNORE INTO profiles (id, user_id, name, gender, age, medical_conditions, is_active, created_at) VALUES ` +
    `('${p.profId}', '${p.id}', '${p.name}', '${p.profile.gender}', ${p.profile.age}, '${conditions}', 1, ${NOW});`
  );
}
lines.push('');

// Readings
lines.push('-- ===== READINGS =====');
for (const p of PATIENTS) {
  lines.push(`-- ${p.name}`);
  lines.push(...generateReadings(p));
}

const sql = lines.join('\n');

// ---------------------------------------------------------------------------
// Write SQL to temp file and execute via wrangler
// ---------------------------------------------------------------------------

const isLocal = process.argv.includes('--local');
const tmpFile = 'src/db/_seed_demo_tmp.sql';

writeFileSync(tmpFile, sql, 'utf8');
console.log(`\nSeed SQL written (${lines.length} lines).`);
console.log(`Executing against ${isLocal ? 'LOCAL' : 'REMOTE'} D1...\n`);

try {
  const flag = isLocal ? '--local' : '--remote';
  const out = execSync(
    `npx wrangler d1 execute bptrack-db ${flag} --file=${tmpFile}`,
    { stdio: 'pipe', encoding: 'utf8' }
  );
  console.log(out);
  console.log('Seed complete.');
} catch (err) {
  console.error('Seed failed:\n', err.stderr || err.message);
  process.exit(1);
} finally {
  unlinkSync(tmpFile);
}
