<#
.SYNOPSIS
  Interactive helper to deploy BPTrack Cloudflare services from your machine.

DESCRIPTION
  This script performs the following, interactively:
    - Installs deps in `cloudflare/workers`
    - Prompts to run `wrangler login`
    - Optionally creates a D1 database and a KV namespace (or you can paste existing IDs)
    - Updates `cloudflare/workers/wrangler.toml` production bindings with provided IDs
    - Runs D1 migrations and seed on the production DB
    - Deploys Workers (`npm run deploy:production`) using your provided API token
    - Optionally publishes Pages static site to Cloudflare Pages

  IMPORTANT: This script runs locally and requires you to provide your Cloudflare API token.
  It does NOT store secrets in this repository or upload them anywhere.

USAGE
  Open PowerShell, from repo root run:
    .\cloudflare\deploy-local.ps1

#>

function Ask-YesNo($message, $default=$true) {
  $yn = if ($default) { 'Y/n' } else { 'y/N' }
  $resp = Read-Host "$message [$yn]"
  if ([string]::IsNullOrWhiteSpace($resp)) { return $default }
  return $resp.ToLower().StartsWith('y')
}

Write-Host "BPTrack Cloudflare Local Deploy Helper" -ForegroundColor Cyan

Push-Location "$(Join-Path $PSScriptRoot 'workers')"

Write-Host "Installing dependencies in cloudflare/workers..." -ForegroundColor Yellow
npm ci

Write-Host "You will be prompted to login to Cloudflare (opens browser)." -ForegroundColor Yellow
if (Ask-YesNo "Run 'npx wrangler login' now?" $true) {
  npx wrangler login
} else {
  Write-Host "Skipping wrangler login. Ensure you are logged in before deploying." -ForegroundColor Yellow
}

# Create or ask for production IDs
$createD1 = Ask-YesNo "Create a new production D1 database (bptrack-db)?" $false
$prodDbId = $null
if ($createD1) {
  Write-Host "Creating D1 database... (you may be prompted in terminal/browser)" -ForegroundColor Yellow
  npx wrangler d1 create bptrack-db
  Write-Host "If creation succeeded, copy the 'database_id' from the output and paste it below." -ForegroundColor Yellow
  $prodDbId = Read-Host "Paste D1 database_id (or leave blank to cancel)"
} else {
  $prodDbId = Read-Host "If you already have a D1 database, paste its database_id here (or leave blank to skip)"
}

$createKV = Ask-YesNo "Create a new KV namespace for sessions (SESSIONS)?" $false
$kvId = $null
if ($createKV) {
  Write-Host "Creating KV namespace..." -ForegroundColor Yellow
  npx wrangler kv:namespace create SESSIONS
  Write-Host "If creation succeeded, copy the namespace id from the output and paste it below." -ForegroundColor Yellow
  $kvId = Read-Host "Paste KV namespace id (or leave blank to cancel)"
} else {
  $kvId = Read-Host "If you already have a KV namespace id, paste it here (or leave blank to skip)"
}

$accountId = Read-Host "Paste your Cloudflare Account ID (from dashboard) (or leave blank to skip)"
$apiToken = Read-Host "Paste your Cloudflare API token (used for deploy)" -AsSecureString
$pagesProject = Read-Host "Paste your Cloudflare Pages project name (optional)"

# Update wrangler.toml production block
$wtPath = Join-Path (Get-Location) '..\wrangler.toml'
if (-Not (Test-Path $wtPath)) { $wtPath = Join-Path (Get-Location) 'wrangler.toml' }
if (-Not (Test-Path $wtPath)) { Write-Host "Could not find wrangler.toml" -ForegroundColor Red; Pop-Location; exit 2 }

$wtText = Get-Content $wtPath -Raw

if ($accountId) {
  if ($wtText -match 'account_id\s*=') {
    $wtText = $wtText -replace 'account_id\s*=\s*"[^"]*"', "account_id = \"$accountId\""
  } else {
    $wtText = $wtText -replace '\[build\]', "account_id = \"$accountId\"`n`n[build]"
  }
}

if ($prodDbId) {
  $prodBlock = "[env.production]`n[[env.production.d1_databases]]`nbinding = \"DB\"`ndatabase_name = \"bptrack-db\"`ndatabase_id = \"$prodDbId\"`
  if ($wtText -match '\[env.production\]') {
    # remove existing env.production.d1_databases lines if placeholder
    $wtText = $wtText -replace '(?ms)\[env\.production\].*?(?=\[env\.|$)', "[env.production]`n$prodBlock"
  } else {
    $wtText += "`n`n$prodBlock"
  }
}

if ($kvId) {
  $kvBlock = "[[env.production.kv_namespaces]]`nbinding = \"SESSIONS\"`nid = \"$kvId\"`
  if ($wtText -match '\[env.production\]') {
    $wtText = $wtText -replace '(?ms)\[env\.production\].*?(?=\[env\.|$)', { param($m) $m.Value + "`n" + $kvBlock }
  } else {
    $wtText += "`n`n$kvBlock"
  }
}

Set-Content -Path $wtPath -Value $wtText -Force
Write-Host "Updated wrangler.toml (production bindings)." -ForegroundColor Green

# Set env var for API token for this session
$apiTokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiToken))
$env:CF_API_TOKEN = $apiTokenPlain

Write-Host "Running production DB migrations (if production DB provided)..." -ForegroundColor Yellow
if ($prodDbId) {
  npm run d1:migrate
  if (Ask-YesNo "Run seed on production DB?" $false) { npm run d1:seed }
}

Write-Host "Deploying Cloudflare Workers to production..." -ForegroundColor Yellow
npm run deploy:production

if ($pagesProject) {
  Write-Host "Publishing Pages static site..." -ForegroundColor Yellow
  # Using wrangler pages publish
  npx --yes @cloudflare/wrangler pages publish ..\dist\public --project-name "$pagesProject" --branch main --commit-sha "local-deploy" --account-id "$accountId"
}

Write-Host "Done. Verify your Workers and Pages in the Cloudflare dashboard." -ForegroundColor Green

Pop-Location
