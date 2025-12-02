# BPTrack Deployment Script for Windows (PowerShell)
# This script builds and deploys both frontend and backend to Cloudflare

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "frontend", "backend", "api")]
    [string]$Target = "all"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 BPTrack Cloudflare Deployment Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

function Deploy-Backend {
    Write-Host "📦 Deploying Backend (Cloudflare Workers)..." -ForegroundColor Yellow
    Write-Host ""

    Set-Location "cloudflare\workers"

    Write-Host "  Building Workers bundle..." -ForegroundColor Gray
    npm run build

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend build failed!" -ForegroundColor Red
        exit 1
    }

    Write-Host "  Deploying to Cloudflare Workers..." -ForegroundColor Gray
    npx wrangler deploy

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend deployment failed!" -ForegroundColor Red
        exit 1
    }

    Set-Location "..\..\"
    Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
    Write-Host "   API URL: https://bptrack-api.gautamkeshri.workers.dev" -ForegroundColor Cyan
    Write-Host ""
}

function Deploy-Frontend {
    Write-Host "📦 Deploying Frontend (Cloudflare Pages)..." -ForegroundColor Yellow
    Write-Host ""

    Write-Host "  Building React frontend (using .env.production)..." -ForegroundColor Gray
    # Vite automatically picks up .env.production file during build
    npx vite build

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend build failed!" -ForegroundColor Red
        exit 1
    }

    Write-Host "  Adding SPA redirect rules..." -ForegroundColor Gray
    "/* /index.html 200" | Out-File -FilePath "dist\public\_redirects" -Encoding ASCII

    Write-Host "  Deploying to Cloudflare Pages..." -ForegroundColor Gray
    npx wrangler pages deploy dist/public --project-name=bptrack --commit-dirty=true

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
    Write-Host "   Site URL: https://bptrack.pages.dev" -ForegroundColor Cyan
    Write-Host ""
}

# Main deployment logic
switch ($Target) {
    "backend" {
        Deploy-Backend
    }
    "api" {
        Deploy-Backend
    }
    "frontend" {
        Deploy-Frontend
    }
    "all" {
        Deploy-Backend
        Deploy-Frontend
    }
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Your Application:" -ForegroundColor Cyan
Write-Host "   Frontend: https://bptrack.pages.dev" -ForegroundColor White
Write-Host "   API:      https://bptrack-api.gautamkeshri.workers.dev" -ForegroundColor White
Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Cyan
Write-Host "   - Visit your frontend to test the app" -ForegroundColor White
Write-Host "   - Check logs: cd cloudflare\workers && npx wrangler tail" -ForegroundColor White
Write-Host "   - View analytics: https://dash.cloudflare.com" -ForegroundColor White
Write-Host ""
