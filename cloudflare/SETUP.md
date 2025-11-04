# BPTrack Cloudflare Setup Guide

## 🚀 Quick Setup (5 Minutes)

This guide will get you up and running with the Cloudflare Workers API.

### Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed ([Download](https://nodejs.org/))
- ✅ A Cloudflare account (free tier works) - [Sign up](https://dash.cloudflare.com/sign-up)

### Step-by-Step Setup

#### Step 1: Install Dependencies

```bash
cd cloudflare/workers
npm install
```

This installs:
- `wrangler` - Cloudflare CLI tool
- `hono` - Web framework
- `drizzle-orm` - Database ORM
- All other dependencies

**Wait for installation to complete** (takes ~1-2 minutes)

#### Step 2: Login to Cloudflare

```bash
npx wrangler login
```

This will:
1. Open your browser
2. Ask you to authorize Wrangler
3. Save your credentials locally

#### Step 3: Setup Local Development Environment

**For local development only** (no Cloudflare account needed):

```bash
# Create local environment variables file
copy .dev.vars.example .dev.vars

# Initialize local database with schema
npx wrangler d1 execute bptrack-db-local --local --file=./src/db/schema.sql

# Seed with sample data
npx wrangler d1 execute bptrack-db-local --local --file=./src/db/seed.sql

# Start development server
npm run dev
```

✅ **Your API is now running at** `http://localhost:8787`

#### Step 4: Test It Works

Open a new terminal and test:

```bash
# Health check
curl http://localhost:8787/

# List profiles (should show 3 sample profiles)
curl http://localhost:8787/api/profiles
```

You should see JSON responses! 🎉

---

## 📦 Production Setup (Optional)

Only needed if you want to deploy to Cloudflare's global network.

### Step 1: Get Your Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Copy your **Account ID** from the right sidebar
3. Open `wrangler.toml` and uncomment/update line 8:
   ```toml
   account_id = "paste-your-account-id-here"
   ```

### Step 2: Create Production D1 Database

```bash
npx wrangler d1 create bptrack-db
```

Output will look like:
```
✅ Successfully created DB 'bptrack-db'

[[d1_databases]]
binding = "DB"
database_name = "bptrack-db"
database_id = "abc-123-xyz-789"  # <-- Copy this ID
```

**Copy the database ID** and update `wrangler.toml` (line 25):
```toml
[[d1_databases]]
binding = "DB"
database_name = "bptrack-db"
database_id = "abc-123-xyz-789"  # <-- Paste here
```

### Step 3: Create KV Namespace

```bash
npx wrangler kv:namespace create "SESSIONS"
```

Output will look like:
```
✅ Successfully created KV namespace

[[kv_namespaces]]
binding = "SESSIONS"
id = "xyz-456-abc-123"  # <-- Copy this ID
```

**Copy the namespace ID** and update `wrangler.toml` (line 31):
```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "xyz-456-abc-123"  # <-- Paste here
```

### Step 4: Initialize Production Database

```bash
# Apply schema
npx wrangler d1 execute bptrack-db --file=./src/db/schema.sql

# Optionally seed with sample data
npx wrangler d1 execute bptrack-db --file=./src/db/seed.sql
```

### Step 5: Deploy to Production

```bash
npm run deploy
```

Your API will be deployed to:
```
https://bptrack-api.<your-subdomain>.workers.dev
```

🎉 **Your API is now live globally in 275+ locations!**

---

## 🧪 Testing Your API

### Create a Profile

```bash
curl -X POST http://localhost:8787/api/profiles \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"gender\":\"male\",\"age\":45,\"medicalConditions\":[]}"
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-...",
    "name": "Test User",
    "gender": "male",
    "age": 45,
    ...
  }
}
```

### Activate Profile (Get Session)

```bash
curl -X POST http://localhost:8787/api/profiles/{profile-id}/activate
```

Response includes `sessionId` - save this for authenticated requests.

### Create Blood Pressure Reading

```bash
curl -X POST http://localhost:8787/api/readings \
  -H "Content-Type: application/json" \
  -d "{\"systolic\":145,\"diastolic\":92,\"pulse\":78,\"readingDate\":\"2024-01-15T10:00:00Z\"}"
```

### Get Statistics

```bash
curl http://localhost:8787/api/statistics?days=30
```

---

## 🛠️ Development Commands

```bash
# Start local development server
npm run dev

# Type check (no errors = good)
npm run type-check

# Build for production
npm run build

# Deploy to production
npm run deploy

# View live logs
npx wrangler tail
```

---

## 🐛 Troubleshooting

### "npm: command not found"
**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)

### "wrangler: command not found" or "npm run d1:create doesn't work"
**Solution**: You forgot Step 1! Run `npm install` first to install wrangler.

### "Error: Not logged in"
**Solution**: Run `npx wrangler login`

### "No active profile found"
**Solution**:
1. Create a profile: `POST /api/profiles`
2. Activate it: `POST /api/profiles/{id}/activate`

### "Database binding DB not found"
**Solution**: You're using local dev mode. The local database is automatically available when you run `npm run dev`.

### Port 8787 already in use
**Solution**: Kill the existing process or change port:
```bash
npx wrangler dev --port 8788
```

### CORS errors from frontend
**Solution**: Update `.dev.vars` with your frontend URL:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 📊 Verify Installation

Run these commands to verify everything is installed:

```bash
# Check Node.js
node --version
# Should show: v18.x.x or higher

# Check npm
npm --version
# Should show: 9.x.x or higher

# Check dependencies installed
cd cloudflare/workers
npm list --depth=0
# Should show wrangler, hono, drizzle-orm, etc.

# Check wrangler works
npx wrangler --version
# Should show: wrangler 3.x.x
```

---

## 🎓 What's Next?

Once your local setup is working:

1. **Test all endpoints** - See [API Documentation](README.md#api-documentation)
2. **Deploy to production** - Follow Production Setup above
3. **Connect frontend** - Point your React app to the Workers API
4. **Monitor performance** - Check Cloudflare dashboard for metrics

---

## 💡 Pro Tips

### Faster Development
```bash
# Keep wrangler dev running in one terminal
npm run dev

# In another terminal, test your changes
curl http://localhost:8787/api/profiles
```

### Database Queries
```bash
# Query local database
npx wrangler d1 execute bptrack-db-local --local --command "SELECT * FROM profiles"

# Query production database
npx wrangler d1 execute bptrack-db --command "SELECT * FROM profiles"
```

### Reset Local Database
```bash
# Drop all tables and recreate
npx wrangler d1 execute bptrack-db-local --local --file=./src/db/schema.sql
npx wrangler d1 execute bptrack-db-local --local --file=./src/db/seed.sql
```

### View Live Logs
```bash
# In local development
# Logs appear in the terminal where you ran "npm run dev"

# In production
npx wrangler tail
```

---

## 📞 Need Help?

- Check [README.md](README.md) for full documentation
- See [PHASE1_COMPLETE.md](docs/PHASE1_COMPLETE.md) for implementation details
- Review [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

---

**Happy coding! 🚀**
