# BPTrack Cloudflare Deployment Guide

## 🎉 Deployment Complete!

Your BPTrack application is now successfully deployed on Cloudflare's global edge network!

---

## 🌐 Live URLs

### Frontend (Cloudflare Pages)
- **Production**: https://bptrack.pages.dev
- **Latest Deployment**: https://4bdbefe1.bptrack.pages.dev

### Backend API (Cloudflare Workers)
- **API Base URL**: https://bptrack-api.gautamkeshri.workers.dev
- **Health Check**: https://bptrack-api.gautamkeshri.workers.dev/
- **Profiles**: https://bptrack-api.gautamkeshri.workers.dev/api/profiles
- **Readings**: https://bptrack-api.gautamkeshri.workers.dev/api/readings

---

## ✅ What's Been Deployed

### Backend (Cloudflare Workers)
- ✅ D1 Database initialized with schema and sample data
- ✅ KV namespace configured for session management
- ✅ CORS configured to allow frontend access (with wildcard support)
- ✅ 13 API endpoints deployed and tested
- ✅ Global distribution across 275+ locations

### Frontend (Cloudflare Pages)
- ✅ React app built and optimized for production
- ✅ Configured to communicate with Workers API
- ✅ SPA routing configured with _redirects
- ✅ Security headers added
- ✅ Deployed to Cloudflare's edge network

---

## 🚀 Accessing Your Application

### Option 1: Use the Latest Deployment URL
Visit: **https://4bdbefe1.bptrack.pages.dev**

This is your current deployment. Each deployment gets a unique URL.

### Option 2: Use the Production URL (Recommended)
Visit: **https://bptrack.pages.dev**

This URL always points to your latest production deployment.

---

## 🔧 Making Updates

### Update Backend (Workers API)

```bash
cd cloudflare/workers
npm run build
npx wrangler deploy
```

### Update Frontend (Cloudflare Pages)

```bash
# Build with production API URL
npm run build

# Deploy to Pages
npx wrangler pages deploy dist/public --project-name=bptrack --commit-dirty=true
```

---

## 🤖 Automatic Deployments (GitHub Actions)

Two GitHub Actions workflows have been configured:

### 1. Deploy Workers API
**File**: `.github/workflows/deploy-cloudflare.yml`
- Triggers on pushes to `main` affecting `cloudflare/` folder
- Automatically deploys Workers API

### 2. Deploy Frontend
**File**: `.github/workflows/deploy-pages.yml`
- Triggers on pushes to `main` affecting `client/` folder
- Automatically builds and deploys frontend to Pages

### Required Secrets

Add these to your GitHub repository (Settings → Secrets and variables → Actions):

1. **CLOUDFLARE_API_TOKEN**
   - Create at: https://dash.cloudflare.com/profile/api-tokens
   - Use template: "Edit Cloudflare Workers"
   - Or create custom with permissions:
     - Account → Workers Scripts → Edit
     - Account → D1 → Edit
     - Account → Cloudflare Pages → Edit

Once configured, every push to `main` will automatically deploy your changes!

---

## 📊 Database Management

### View Data in Production Database

```bash
cd cloudflare/workers

# List all profiles
npx wrangler d1 execute bptrack-db --remote --command "SELECT * FROM profiles"

# List all readings
npx wrangler d1 execute bptrack-db --remote --command "SELECT * FROM blood_pressure_readings LIMIT 10"

# Get statistics
npx wrangler d1 execute bptrack-db --remote --command "SELECT COUNT(*) as total FROM blood_pressure_readings"
```

### Add More Sample Data

```bash
# Run seed script again (adds more sample data)
npx wrangler d1 execute bptrack-db --remote --file=./src/db/seed.sql
```

### Reset Database

```bash
# Drop all data and recreate schema
npx wrangler d1 execute bptrack-db --remote --file=./src/db/schema.sql
npx wrangler d1 execute bptrack-db --remote --file=./src/db/seed.sql
```

---

## 🔍 Monitoring & Logs

### View Live Logs (Workers)

```bash
cd cloudflare/workers
npx wrangler tail
```

This shows real-time logs from your Workers API.

### View Deployment Logs (Pages)

```bash
npx wrangler pages deployment list --project-name=bptrack
```

### Cloudflare Dashboard

- **Workers**: https://dash.cloudflare.com/0564c338e25512b9a5a4f45585b8fa8b/workers/overview
- **Pages**: https://dash.cloudflare.com/0564c338e25512b9a5a4f45585b8fa8b/pages
- **D1 Database**: https://dash.cloudflare.com/0564c338e25512b9a5a4f45585b8fa8b/workers/d1
- **Analytics**: https://dash.cloudflare.com/0564c338e25512b9a5a4f45585b8fa8b/analytics

---

## 🛠️ Configuration Files

### Environment Variables

#### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://bptrack-api.gautamkeshri.workers.dev
```

#### Backend (wrangler.toml)
```toml
[vars]
ALLOWED_ORIGINS = "http://localhost:5173,http://localhost:5000"
SESSION_SECRET = "development-secret-change-in-production"

[env.production.vars]
ALLOWED_ORIGINS = "https://bptrack.pages.dev,https://*.pages.dev"
SESSION_SECRET = "change-this-to-secure-random-string"
```

### CORS Configuration

The Workers API supports wildcard CORS origins:
- `https://bptrack.pages.dev` - Main production URL
- `https://*.pages.dev` - All Pages preview deployments
- `http://localhost:5173` - Local development

---

## 🔒 Security Considerations

### 1. Update Session Secret

The default session secret should be changed in production:

```bash
# Generate a secure random secret
openssl rand -base64 32

# Update in wrangler.toml [env.production.vars]
SESSION_SECRET = "your-secure-random-secret-here"

# Redeploy
cd cloudflare/workers && npx wrangler deploy
```

### 2. CORS Origins

Review and restrict CORS origins in `wrangler.toml` if needed:
- Remove wildcard patterns for tighter security
- Add only specific deployment URLs

### 3. Security Headers

The frontend includes security headers in `_headers`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

---

## 📈 Performance

### Current Setup

- **Workers API**: ~7ms startup time, global distribution
- **Pages Frontend**: Cached at the edge, instant global delivery
- **D1 Database**: SQLite at the edge, low latency reads
- **KV Sessions**: Global key-value store for sessions

### Optimization Tips

1. **Enable Caching**: Add Cache-Control headers for static responses
2. **Use Smart Placement**: D1 smart placement for optimal database location
3. **Monitor Performance**: Check Cloudflare Analytics dashboard

---

## 🐛 Troubleshooting

### Frontend Can't Connect to API

**Symptom**: Network errors, CORS errors in browser console

**Solutions**:
1. Check CORS settings in `cloudflare/workers/wrangler.toml`
2. Verify API URL in `.env.production`
3. Check browser console for specific error messages
4. Test API directly: `curl https://bptrack-api.gautamkeshri.workers.dev/`

### Database Errors

**Symptom**: "No active profile found" or database connection errors

**Solutions**:
1. Verify database is initialized:
   ```bash
   npx wrangler d1 execute bptrack-db --remote --command "SELECT * FROM profiles"
   ```
2. Re-run migrations if needed:
   ```bash
   npx wrangler d1 execute bptrack-db --remote --file=./src/db/schema.sql
   ```

### Deployment Failures

**Symptom**: `wrangler deploy` or `wrangler pages deploy` fails

**Solutions**:
1. Ensure you're logged in: `npx wrangler whoami`
2. Check account ID is correct in configuration files
3. Verify you have necessary permissions
4. Check build output for errors

---

## 📞 Support Resources

- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **D1 Database Docs**: https://developers.cloudflare.com/d1/
- **Community Discord**: https://discord.cloudflare.com

---

## 🎯 Next Steps

### Recommended Actions

1. **Set up custom domain** (optional):
   - Add your domain in Cloudflare Pages settings
   - Configure DNS to point to your Pages deployment

2. **Enable GitHub Actions**:
   - Add `CLOUDFLARE_API_TOKEN` secret to GitHub
   - Push to `main` to trigger automatic deployments

3. **Monitor usage**:
   - Check Cloudflare dashboard for request analytics
   - Review D1 database usage
   - Monitor Workers CPU time

4. **Add features**:
   - Implement email notifications (using Cloudflare Email Workers)
   - Add PDF export via Workers (using pdf-lib)
   - Integrate with health APIs

### Cost Estimate (Cloudflare Free Tier)

- **Workers**: 100,000 requests/day (FREE)
- **Pages**: Unlimited requests (FREE)
- **D1**: 5M rows read/day (FREE)
- **KV**: 100,000 reads/day (FREE)

Your current usage is well within free tier limits! 🎉

---

**Happy monitoring! 🏥✨**

Your medical-grade blood pressure tracking app is now running globally on Cloudflare's edge network!
