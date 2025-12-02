#!/usr/bin/env node
/**
 * Simple converter: exported Postgres JSON (profiles/readings/reminders)
 * -> D1-compatible SQL INSERTS
 *
 * Usage:
 *  node scripts/pg-to-d1.js exported.json > out.sql
 */
const fs = require('fs');

function esc(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function toMillis(value) {
  if (!value) return '0';
  const n = Number(value);
  if (!Number.isNaN(n)) return String(Math.floor(n));
  const d = new Date(value);
  if (!isNaN(d.getTime())) return String(d.getTime());
  return '0';
}

if (process.argv.length < 3) {
  console.error('Usage: node scripts/pg-to-d1.js <export.json>');
  process.exit(1);
}

const inputPath = process.argv[2];
const raw = fs.readFileSync(inputPath, 'utf8');
const data = JSON.parse(raw);

const out = [];

// Profiles
if (Array.isArray(data.profiles)) {
  data.profiles.forEach(p => {
    const id = esc(p.id);
    const name = esc(p.name);
    const gender = esc(p.gender || 'unknown');
    const age = Number(p.age) || 0;
    const medical = esc(JSON.stringify(p.medicalConditions || p.medical_conditions || []));
    const is_active = p.is_active || p.isActive || (p.isActive === 1 ? 1 : 0);
    const created_at = toMillis(p.created_at || p.createdAt || p.createdAt);
    out.push(`INSERT INTO profiles (id, name, gender, age, medical_conditions, is_active, created_at) VALUES (${id}, ${name}, ${gender}, ${age}, ${medical}, ${is_active}, ${created_at});`);
  });
}

// Readings
if (Array.isArray(data.readings)) {
  data.readings.forEach(r => {
    const id = esc(r.id);
    const profile_id = esc(r.profile_id || r.profileId || r.profile);
    const systolic = Number(r.systolic) || 0;
    const diastolic = Number(r.diastolic) || 0;
    const pulse = Number(r.pulse) || 0;
    const weight = (r.weight === undefined || r.weight === null) ? 'NULL' : Number(r.weight);
    const notes = esc(r.notes || null);
    const reading_date = toMillis(r.reading_date || r.readingDate || r.date);
    const pulse_pressure = systolic - diastolic;
    const map = Math.round(diastolic + (pulse_pressure / 3));
    const classification = esc(r.classification || 'Unknown');
    const created_at = toMillis(r.created_at || r.createdAt || reading_date);

    out.push(`INSERT INTO blood_pressure_readings (id, profile_id, systolic, diastolic, pulse, weight, notes, reading_date, classification, pulse_pressure, mean_arterial_pressure, created_at) VALUES (${id}, ${profile_id}, ${systolic}, ${diastolic}, ${pulse}, ${weight === 'NULL' ? 'NULL' : weight}, ${notes}, ${reading_date}, ${classification}, ${pulse_pressure}, ${map}, ${created_at});`);
  });
}

// Reminders
if (Array.isArray(data.reminders)) {
  data.reminders.forEach(r => {
    const id = esc(r.id);
    const profile_id = esc(r.profile_id || r.profileId || r.profile);
    const title = esc(r.title || 'Reminder');
    const time = esc(r.time || r.at || '09:00');
    const is_repeating = r.is_repeating || r.isRepeating ? 1 : 0;
    const days_of_week = esc(JSON.stringify(r.days_of_week || r.daysOfWeek || []));
    const is_active = (r.is_active === undefined) ? 1 : (r.is_active ? 1 : 0);
    const created_at = toMillis(r.created_at || r.createdAt);

    out.push(`INSERT INTO reminders (id, profile_id, title, time, is_repeating, days_of_week, is_active, created_at) VALUES (${id}, ${profile_id}, ${title}, ${time}, ${is_repeating}, ${days_of_week}, ${is_active}, ${created_at});`);
  });
}

console.log(out.join('\n'));
