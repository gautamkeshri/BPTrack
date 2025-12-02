#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'wrangler.toml');
if (!fs.existsSync(file)) {
  console.error('wrangler.toml not found in current directory.');
  process.exit(2);
}

const content = fs.readFileSync(file, 'utf8');

function checkAccountId() {
  const m = content.match(/^\s*account_id\s*=\s*"([^"]+)"/m);
  if (!m) return { ok: false, msg: 'account_id not set (uncomment and paste your account id)' };
  if (m[1].includes('your-account-id')) return { ok: false, msg: 'account_id contains placeholder value' };
  return { ok: true, msg: `account_id present: ${m[1]}` };
}

function checkD1Production() {
  const envBlock = content.split(/\[env\.production\]/)[1] || '';
  if (!envBlock) return { ok: false, msg: 'env.production block not configured' };
  const hasDb = /\[\[env\.production\.d1_databases\]\]/.test(content);
  if (!hasDb) return { ok: false, msg: 'production d1_databases not configured' };
  if (/your-production-database-id/.test(content)) return { ok: false, msg: 'production d1 database id contains placeholder' };
  return { ok: true, msg: 'production d1_databases appears configured (verify IDs)' };
}

const acc = checkAccountId();
const d1 = checkD1Production();

if (acc.ok && d1.ok) {
  console.log('OK: wrangler.toml looks configured for production (double-check IDs are correct).');
  process.exit(0);
} else {
  console.error('wrangler.toml verification failed:');
  if (!acc.ok) console.error(' -', acc.msg);
  if (!d1.ok) console.error(' -', d1.msg);
  process.exit(3);
}
