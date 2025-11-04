#!/usr/bin/env node

/**
 * BPTrack Setup Verification Script
 * Run this to check if everything is installed correctly
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const checks = [];

function addCheck(name, status, message) {
  checks.push({ name, status, message });
}

async function checkNodeVersion() {
  try {
    const { stdout } = await execAsync('node --version');
    const version = stdout.trim();
    const majorVersion = parseInt(version.slice(1).split('.')[0]);

    if (majorVersion >= 18) {
      addCheck('Node.js', '✅', `${version} (OK)`);
    } else {
      addCheck('Node.js', '❌', `${version} (Need v18+)`);
    }
  } catch (error) {
    addCheck('Node.js', '❌', 'Not installed');
  }
}

async function checkNpmInstalled() {
  try {
    const { stdout } = await execAsync('npm --version');
    addCheck('npm', '✅', `v${stdout.trim()} (OK)`);
  } catch (error) {
    addCheck('npm', '❌', 'Not installed');
  }
}

async function checkDependencies() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packagePath)) {
      addCheck('Dependencies', '❌', 'package.json not found');
      return;
    }

    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      addCheck('Dependencies', '❌', 'Run "npm install" first');
      return;
    }

    const wranglerPath = path.join(nodeModulesPath, '.bin', 'wrangler');
    const wranglerPathCmd = path.join(nodeModulesPath, '.bin', 'wrangler.cmd');

    if (fs.existsSync(wranglerPath) || fs.existsSync(wranglerPathCmd)) {
      addCheck('Dependencies', '✅', 'All installed (OK)');
    } else {
      addCheck('Dependencies', '⚠️', 'Wrangler not found - run "npm install"');
    }
  } catch (error) {
    addCheck('Dependencies', '❌', 'Error checking dependencies');
  }
}

async function checkWrangler() {
  try {
    const { stdout } = await execAsync('npx wrangler --version');
    addCheck('Wrangler CLI', '✅', `${stdout.trim()} (OK)`);
  } catch (error) {
    addCheck('Wrangler CLI', '❌', 'Run "npm install" to get wrangler');
  }
}

async function checkConfigFiles() {
  const files = [
    { name: 'wrangler.toml', required: true },
    { name: 'package.json', required: true },
    { name: 'tsconfig.json', required: true },
    { name: '.dev.vars', required: false },
    { name: 'src/index.ts', required: true },
  ];

  let allFound = true;
  const missing = [];

  for (const file of files) {
    const filePath = path.join(process.cwd(), file.name);
    if (!fs.existsSync(filePath)) {
      if (file.required) {
        allFound = false;
        missing.push(file.name);
      }
    }
  }

  if (allFound) {
    addCheck('Config Files', '✅', 'All present (OK)');
  } else {
    addCheck('Config Files', '❌', `Missing: ${missing.join(', ')}`);
  }

  // Check for .dev.vars
  if (!fs.existsSync(path.join(process.cwd(), '.dev.vars'))) {
    addCheck('.dev.vars', '⚠️', 'Copy .dev.vars.example to .dev.vars');
  } else {
    addCheck('.dev.vars', '✅', 'Environment file exists');
  }
}

async function checkDatabaseFiles() {
  const dbFiles = [
    'src/db/schema.sql',
    'src/db/seed.sql',
    'src/db/schema.ts',
  ];

  let allFound = true;
  for (const file of dbFiles) {
    if (!fs.existsSync(path.join(process.cwd(), file))) {
      allFound = false;
      break;
    }
  }

  if (allFound) {
    addCheck('Database Files', '✅', 'Schema and seed files present');
  } else {
    addCheck('Database Files', '❌', 'Missing database files');
  }
}

async function checkTypeScript() {
  try {
    await execAsync('npx tsc --noEmit');
    addCheck('TypeScript', '✅', 'No type errors (OK)');
  } catch (error) {
    if (error.message.includes('Cannot find module')) {
      addCheck('TypeScript', '⚠️', 'Run "npm install" first');
    } else {
      addCheck('TypeScript', '⚠️', 'Type errors found (will still work)');
    }
  }
}

function printResults() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║        BPTrack Cloudflare Workers Setup Check            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  checks.forEach(check => {
    const padding = ' '.repeat(20 - check.name.length);
    console.log(`${check.status} ${check.name}${padding}${check.message}`);
  });

  console.log('\n' + '─'.repeat(60) + '\n');

  const failed = checks.filter(c => c.status === '❌').length;
  const warnings = checks.filter(c => c.status === '⚠️').length;
  const passed = checks.filter(c => c.status === '✅').length;

  if (failed === 0 && warnings === 0) {
    console.log('✅ All checks passed! You\'re ready to go!\n');
    console.log('Next steps:');
    console.log('  1. npm run dev          (start development server)');
    console.log('  2. Test: curl http://localhost:8787/\n');
  } else if (failed === 0 && warnings > 0) {
    console.log(`⚠️  Setup is OK, but ${warnings} warning(s) found.\n`);
    console.log('Next steps:');
    console.log('  1. Address warnings above (optional)');
    console.log('  2. npm run dev          (start development server)\n');
  } else {
    console.log(`❌ ${failed} check(s) failed. Please fix the issues above.\n`);
    console.log('Common fixes:');
    console.log('  • Run "npm install" to install dependencies');
    console.log('  • Make sure you\'re in the cloudflare/workers directory');
    console.log('  • Install Node.js 18+ if not installed\n');
  }
}

async function main() {
  console.log('Checking your BPTrack Cloudflare Workers setup...\n');

  await checkNodeVersion();
  await checkNpmInstalled();
  await checkDependencies();
  await checkWrangler();
  await checkConfigFiles();
  await checkDatabaseFiles();
  await checkTypeScript();

  printResults();
}

main().catch(console.error);
