/**
 * Generates seed SQL for demo users.
 * Run with: node seed-demo-users.mjs
 * Then apply: npx wrangler d1 execute bptrack-db --remote --file=seed-demo-users.sql
 */
import crypto from 'crypto';

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function uuid() {
  return crypto.randomUUID();
}

const now = Date.now();

const users = [
  { email: 'patient@demo.com', password: 'demo1234',   name: 'Demo Patient', role: 'patient' },
  { email: 'doctor@demo.com',  password: 'doctor1234', name: 'Demo Doctor',  role: 'doctor'  },
];

const inserts = users.map(u => {
  const id   = uuid();
  const salt = generateSalt();
  const hash = hashPassword(u.password, salt);
  return `INSERT OR IGNORE INTO users (id, email, password_hash, salt, role, name, created_at) VALUES ('${id}', '${u.email}', '${hash}', '${salt}', '${u.role}', '${u.name}', ${now});`;
});

const sql = inserts.join('\n') + '\n';

import { writeFileSync } from 'fs';
writeFileSync(new URL('./seed-demo-users.sql', import.meta.url), sql, 'utf8');

console.log('seed-demo-users.sql written:');
console.log(sql);
