# 🚀 BPTrack - Quick Deployment Guide

## Your App is Live! 🎉

### Frontend (React App)
**URL**: https://bptrack.pages.dev

### Backend (API)
**URL**: https://bptrack-api.gautamkeshri.workers.dev

---

## ✅ What's Deployed

- ✅ **Frontend**: React app on Cloudflare Pages
- ✅ **Backend**: API on Cloudflare Workers
- ✅ **Database**: D1 SQLite with sample data (3 profiles, 40+ readings)
- ✅ **Sessions**: KV namespace for session management
- ✅ **CORS**: Configured for frontend-backend communication
- ✅ **Global CDN**: Your app runs on 275+ edge locations worldwide

---

## 🎯 Quick Actions

### Deploy Updates

#### Option 1: Use PowerShell Script (Easiest)
```powershell
# Deploy everything
.\deploy.ps1

# Deploy only frontend
.\deploy.ps1 -Target frontend

# Deploy only backend
.\deploy.ps1 -Target backend
```

#### Option 2: Manual Deployment

**Backend:**
```bash
cd cloudflare/workers
npm run build
npx wrangler deploy
```

**Frontend:**
```bash
npm run build
npx wrangler pages deploy dist/public --project-name=bptrack
```

### View Live Logs
```bash
cd cloudflare/workers
npx wrangler tail
```

### Check Database
```bash
cd cloudflare/workers
npx wrangler d1 execute bptrack-db --remote --command "SELECT * FROM profiles"
```

---

## 🤖 Automatic Deployments (GitHub Actions)

1. Add `CLOUDFLARE_API_TOKEN` to GitHub Secrets
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Create token with "Edit Cloudflare Workers" template
   - Add to: GitHub repo → Settings → Secrets → `CLOUDFLARE_API_TOKEN`

2. Push to `main` branch
   - Frontend auto-deploys when `client/` changes
   - Backend auto-deploys when `cloudflare/` changes

---

## 📊 Cloudflare Dashboard

- **Workers**: https://dash.cloudflare.com/0564c338e25512b9a5a4f45585b8fa8b/workers
- **Pages**: https://dash.cloudflare.com/0564c338e25512b9a5a4f45585b8fa8b/pages
- **D1 Database**: https://dash.cloudflare.com/0564c338e25512b9a5a4f45585b8fa8b/workers/d1
- **Analytics**: https://dash.cloudflare.com/0564c338e25512b9a5a4f45585b8fa8b/analytics

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `.env.production` | Frontend API URL configuration |
| `cloudflare/workers/wrangler.toml` | Workers configuration (CORS, env vars) |
| `.github/workflows/deploy-cloudflare.yml` | Auto-deploy backend |
| `.github/workflows/deploy-pages.yml` | Auto-deploy frontend |

---

## 📖 Full Documentation

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Detailed deployment instructions
- Database management
- Troubleshooting guide
- Security best practices
- Performance optimization tips

---

## 🆘 Quick Troubleshooting

### Frontend shows error connecting to API
1. Check CORS in `cloudflare/workers/wrangler.toml`
2. Verify API URL in `.env.production`
3. Test API: `curl https://bptrack-api.gautamkeshri.workers.dev/`

### No profiles showing
1. Check database: `npx wrangler d1 execute bptrack-db --remote --command "SELECT * FROM profiles"`
2. Reseed if needed: `npx wrangler d1 execute bptrack-db --remote --file=./src/db/seed.sql`

---

## 🎊 You're All Set!

Visit **https://bptrack.pages.dev** to see your app live!

Your medical-grade blood pressure monitoring app is now running globally! 🏥✨
