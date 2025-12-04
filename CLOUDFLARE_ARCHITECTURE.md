# BPTrack Cloudflare Architecture

## Overview

BPTrack is deployed as a fully serverless application on Cloudflare's edge network, leveraging multiple Cloudflare services for maximum performance, scalability, and global availability.

## Architecture Components

### 1. **Frontend - Cloudflare Pages**

**What it is:** Static site hosting for your React application

**Deployment URL:**
- Production: https://bptrack.pages.dev
- Custom Domain: https://bptrack.gautamlabs.in
- Preview Deployments: https://*.bptrack.pages.dev

**Technology Stack:**
- React 18 + TypeScript
- Vite (Build tool)
- TailwindCSS (Styling)
- TanStack Query (Data fetching)
- Shadcn/UI Components

**Build Process:**
```bash
# Frontend is built with Vite
npx vite build

# Output directory: dist/public/
# Contains: index.html, JavaScript bundles, CSS, assets
```

**Configuration:**
- Environment variables defined in `.env.production`
- API URL: `VITE_API_BASE_URL=https://bptrack-api.gautamkeshri.workers.dev`
- SPA routing handled by `_redirects` file: `/* /index.html 200`

**Deployment:**
```bash
npx wrangler pages deploy dist/public --project-name=bptrack
```

**Features:**
- Automatic HTTPS
- Global CDN distribution
- Instant cache invalidation
- Git-based deployments (optional)
- Preview deployments for each build

---

### 2. **Backend API - Cloudflare Workers**

**What it is:** Serverless JavaScript runtime running at the edge

**Deployment URL:** https://bptrack-api.gautamkeshri.workers.dev

**Technology Stack:**
- Hono (Web framework - fast, lightweight)
- TypeScript
- Drizzle ORM (Database ORM)
- Zod (Schema validation)

**Worker Configuration (`wrangler.toml`):**
```toml
name = "bptrack-api"
main = "dist/index.js"
compatibility_date = "2024-11-19"
account_id = "0564c338e25512b9a5a4f45585b8fa8b"

[vars]
ALLOWED_ORIGINS = "http://localhost:5173,http://localhost:5000,https://bptrack.pages.dev,https://*.pages.dev,https://bptrack.gautamlabs.in"
SESSION_SECRET = "development-secret-change-in-production"
```

**Build Process:**
```bash
# Workers code is bundled with esbuild
esbuild src/index.ts --bundle --format=esm --outfile=dist/index.js --platform=neutral
```

**API Endpoints:**

**Profiles:**
- `GET /api/profiles` - List all profiles
- `POST /api/profiles` - Create new profile
- `GET /api/profiles/:id` - Get specific profile
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile
- `POST /api/profiles/:id/activate` - Set active profile
- `GET /api/profiles/active` - Get currently active profile

**Blood Pressure Readings:**
- `GET /api/readings` - List all readings (with optional filters)
- `POST /api/readings` - Create new reading
- `GET /api/readings/:id` - Get specific reading
- `PUT /api/readings/:id` - Update reading
- `DELETE /api/readings/:id` - Delete reading

**Statistics:**
- `GET /api/statistics?days=30` - Get BP statistics (30/60/90 days)

**Reminders:**
- `GET /api/reminders` - List all reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

**Response Format:**
All API responses follow this structure:
```json
{
  "success": true,
  "data": { ... }
}
```

Or on error:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": []
  }
}
```

**Deployment:**
```bash
cd cloudflare/workers
npx wrangler deploy
```

---

### 3. **Database - Cloudflare D1**

**What it is:** Distributed SQLite database running at the edge

**Database Details:**
- Name: `bptrack-db`
- Database ID: `4cf465e3-2786-4c6d-a0f1-ef2acf923d2a`
- Binding: `DB` (accessed in Workers as `c.env.DB`)

**Schema (SQLite):**

**Profiles Table:**
```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  medical_conditions TEXT NOT NULL DEFAULT '[]',  -- JSON array
  is_active INTEGER NOT NULL DEFAULT 0,           -- Boolean as 0/1
  created_at INTEGER NOT NULL                     -- Timestamp in ms
);
```

**Blood Pressure Readings Table:**
```sql
CREATE TABLE blood_pressure_readings (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  systolic INTEGER NOT NULL,
  diastolic INTEGER NOT NULL,
  pulse INTEGER NOT NULL,
  weight INTEGER,                                  -- Optional
  notes TEXT,                                      -- Optional
  reading_date INTEGER NOT NULL,                   -- Timestamp in ms
  classification TEXT NOT NULL,
  pulse_pressure INTEGER NOT NULL,
  mean_arterial_pressure INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
```

**Reminders Table:**
```sql
CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time TEXT NOT NULL,                              -- HH:MM format
  is_repeating INTEGER NOT NULL DEFAULT 0,
  days_of_week TEXT NOT NULL DEFAULT '[]',         -- JSON array
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);
```

**ORM Usage:**
```typescript
// Drizzle ORM example
const db = drizzle(c.env.DB);
const allProfiles = await db.select().from(profiles).all();
```

**Database Management:**
```bash
# List databases
npx wrangler d1 list

# Execute SQL
npx wrangler d1 execute bptrack-db --remote --command "SELECT * FROM profiles"

# Run migrations
npx wrangler d1 migrations apply bptrack-db --remote
```

---

### 4. **Session Storage - Cloudflare KV**

**What it is:** Global, low-latency key-value store for session data

**KV Details:**
- Namespace: `SESSIONS`
- Namespace ID: `55dc933c60534a52b641e13db27404f4`
- Binding: `SESSIONS` (accessed as `c.env.SESSIONS`)

**Usage:**
- Stores user session data
- Used for maintaining active profile state across requests
- Eventually consistent (typically within 60 seconds globally)

**Session Management:**
```typescript
// Store session
await c.env.SESSIONS.put(sessionId, JSON.stringify(sessionData), {
  expirationTtl: 86400 // 24 hours
});

// Retrieve session
const sessionData = await c.env.SESSIONS.get(sessionId);
```

---

## Data Flow

### 1. User Visits Application

```
User Browser
    ↓
Cloudflare Edge (nearest data center)
    ↓
Cloudflare Pages (serves index.html + static assets)
    ↓
React App loads in browser
```

### 2. User Creates Profile

```
React App (Frontend)
    ↓ POST /api/profiles
    ↓ {name: "John", age: 30, gender: "male"}
    ↓
Cloudflare Workers (Backend API)
    ↓ Validate with Zod schema
    ↓ Generate UUID
    ↓ Convert medicalConditions array → JSON string
    ↓
Cloudflare D1 Database
    ↓ INSERT INTO profiles
    ↓ Returns new profile
    ↓
Workers → {success: true, data: profile}
    ↓
Frontend unwraps response → profile data
    ↓
TanStack Query caches result
    ↓
UI updates with new profile
```

### 3. User Adds Blood Pressure Reading

```
React Form
    ↓ Submit: {systolic: 120, diastolic: 80, pulse: 72, weight: null, notes: null}
    ↓
Frontend POST /api/readings
    ↓
Workers Validation
    ↓ Schema accepts nullable weight/notes
    ↓ Calculate classification (ACC/AHA 2017)
    ↓ Calculate pulse pressure & MAP
    ↓
D1 Database
    ↓ INSERT INTO blood_pressure_readings
    ↓ Convert weight/notes: null → NULL in SQLite
    ↓
Workers Response
    ↓ {success: true, data: reading}
    ↓
Frontend
    ↓ Invalidate queries (readings, statistics)
    ↓ Refetch data
    ↓ Update UI (charts, statistics)
```

### 4. User Views Charts

```
React Charts View
    ↓ GET /api/statistics?days=30
    ↓
Workers
    ↓ Query D1: SELECT readings WHERE date > 30 days ago
    ↓ Calculate distribution by classification
    ↓ Count readings per category
    ↓
Frontend
    ↓ Unwrap: {success: true, data: stats} → stats
    ↓ Pass to Chart components
    ↓ Render Distribution & Trend charts
```

---

## CORS Configuration

**Problem:** Browsers block cross-origin requests by default

**Solution:** Workers CORS middleware allows specific origins

**Allowed Origins:**
- `http://localhost:5173` (local dev)
- `http://localhost:5000` (local dev)
- `https://bptrack.pages.dev` (production)
- `https://*.pages.dev` (preview deployments - wildcard)
- `https://bptrack.gautamlabs.in` (custom domain)

**CORS Headers Set by Workers:**
```
Access-Control-Allow-Origin: https://bptrack.gautamlabs.in
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Cookie
```

**Wildcard Support:**
The CORS middleware converts patterns like `https://*.pages.dev` to regex for matching:
```typescript
const pattern = allowed.replace(/\*/g, '.*');
const regex = new RegExp(`^${pattern}$`);
return regex.test(origin);
```

---

## Schema Validation

### Frontend Schema (`client/src/components/`)
```typescript
// Reading form validation
const readingSchema = z.object({
  systolic: z.number().min(70).max(250),
  diastolic: z.number().min(40).max(150),
  pulse: z.number().min(40).max(200),
  weight: z.number().optional().or(z.literal(0)),
  notes: z.string().optional(),
});
```

### Workers Schema (`cloudflare/workers/src/db/schema.ts`)
```typescript
// API validation
export const insertBloodPressureReadingSchema = z.object({
  profileId: z.string().optional(),
  systolic: z.number().min(70).max(250),
  diastolic: z.number().min(40).max(150),
  pulse: z.number().min(40).max(200),
  weight: z.number().min(20).max(300).optional().nullable()
    .or(z.literal('').transform(() => undefined)),
  notes: z.string().optional().nullable().or(z.literal('')),
  readingDate: z.coerce.date(),
});
```

**Key Points:**
- Frontend sends `null` for empty optional fields
- Workers schema accepts: `number | null | undefined | ''`
- Empty strings transformed to `undefined`
- Validation happens before database operations

---

## Deployment Process

### Quick Deployment (PowerShell Script)

**Deploy Everything:**
```powershell
.\deploy.ps1
```

**Deploy Backend Only:**
```powershell
.\deploy.ps1 -Target backend
```

**Deploy Frontend Only:**
```powershell
.\deploy.ps1 -Target frontend
```

### Manual Deployment

**Backend (Workers):**
```bash
cd cloudflare/workers
npm run build          # Build with esbuild
npx wrangler deploy    # Deploy to Cloudflare
```

**Frontend (Pages):**
```bash
npx vite build                                      # Build React app
echo "/* /index.html 200" > dist/public/_redirects  # SPA routing
npx wrangler pages deploy dist/public --project-name=bptrack
```

---

## Performance Benefits

### 1. **Global Edge Network**
- Both Workers and Pages run at 300+ Cloudflare edge locations
- Users connect to nearest data center (~95% within 50ms)
- Low latency worldwide

### 2. **Serverless Scaling**
- Workers auto-scale based on demand
- No server management required
- Pay only for actual usage

### 3. **Built-in CDN**
- Static assets cached globally
- Automatic cache invalidation on new deployments
- Optimized asset delivery

### 4. **D1 Database Benefits**
- SQLite-based (fast, lightweight)
- Automatic replication across regions
- No connection pooling issues
- Bundled with Workers (no network hop)

### 5. **Security**
- Automatic HTTPS/TLS
- DDoS protection included
- CORS protection
- Input validation (Zod schemas)

---

## Cost Structure

### Free Tier Limits (Current Usage)

**Workers:**
- 100,000 requests/day (FREE)
- 10ms CPU time per request
- Current usage: Well within limits

**Pages:**
- Unlimited requests (FREE)
- 500 builds/month
- Unlimited bandwidth

**D1 Database:**
- 5 GB storage (FREE)
- 5 million reads/day
- 100,000 writes/day

**KV:**
- 100,000 reads/day (FREE)
- 1,000 writes/day
- 1 GB storage

**Current Cost: $0/month** ✅

---

## Environment Variables

### Frontend (`.env.production`)
```env
VITE_API_BASE_URL=https://bptrack-api.gautamkeshri.workers.dev
```

### Workers (`wrangler.toml`)
```toml
[vars]
ALLOWED_ORIGINS = "https://bptrack.gautamlabs.in,..."
SESSION_SECRET = "your-secret-here"
```

**Note:** Never commit secrets to git. Use Wrangler secrets for sensitive data:
```bash
npx wrangler secret put SESSION_SECRET
```

---

## Monitoring & Debugging

### View Workers Logs (Real-time)
```bash
cd cloudflare/workers
npx wrangler tail
```

### View D1 Database
```bash
npx wrangler d1 execute bptrack-db --remote --command "SELECT COUNT(*) FROM profiles"
```

### Check Deployments
```bash
# Workers
npx wrangler deployments list

# Pages
npx wrangler pages deployments list --project-name=bptrack
```

### Cloudflare Dashboard
- Analytics: https://dash.cloudflare.com
- Workers: https://dash.cloudflare.com → Workers & Pages
- D1: https://dash.cloudflare.com → D1
- Logs: Available in dashboard with filtering

---

## Key Files

### Frontend Configuration
- `vite.config.ts` - Vite build configuration
- `.env.production` - Production environment variables
- `client/src/config.ts` - API URL configuration
- `client/src/lib/queryClient.ts` - TanStack Query + API unwrapping

### Workers Configuration
- `cloudflare/workers/wrangler.toml` - Workers configuration
- `cloudflare/workers/src/index.ts` - Main entry point
- `cloudflare/workers/src/db/schema.ts` - Database schema + Zod validation
- `cloudflare/workers/src/routes/` - API route handlers
- `cloudflare/workers/src/middleware/cors.ts` - CORS middleware

### Deployment
- `deploy.ps1` - PowerShell deployment script
- `package.json` - Build scripts

---

## Common Issues & Solutions

### Issue: "CORS Error"
**Cause:** Origin not in allowed list
**Fix:** Add domain to `ALLOWED_ORIGINS` in `wrangler.toml`, redeploy Workers

### Issue: "400 Bad Request on optional fields"
**Cause:** Schema doesn't accept `null` values
**Fix:** Add `.nullable()` to schema definition

### Issue: "Environment variable not defined"
**Cause:** `.env.production` not loaded during build
**Fix:** Vite config uses `loadEnv()` and explicit `define` block

### Issue: "Charts showing undefined"
**Cause:** API response not unwrapped
**Fix:** Query function extracts `data` property from `{success: true, data: ...}`

### Issue: "medicalConditions validation error"
**Cause:** Frontend sends array, Workers expects string
**Fix:** Workers schema accepts array, converts to JSON string before DB insert

---

## Blood Pressure Classification Logic

**ACC/AHA 2017 Guidelines:**

```typescript
function classifyBloodPressure(systolic: number, diastolic: number): string {
  if (systolic > 180 || diastolic > 120) return "Hypertensive Crisis";
  if (systolic >= 140 || diastolic >= 90) return "Hypertension Stage 2";
  if (systolic >= 130 || diastolic >= 80) return "Hypertension Stage 1";
  if (systolic >= 120 && diastolic < 80) return "Elevated";
  return "Normal";
}
```

**Calculated Metrics:**
- **Pulse Pressure:** `systolic - diastolic`
- **Mean Arterial Pressure:** `diastolic + (pulse_pressure / 3)`

---

## Future Enhancements

### Potential Improvements
1. **Wrangler v4 Upgrade:** Update from v3.114.15 to v4.51.0
2. **Authentication:** Add user authentication (Cloudflare Access)
3. **Email Reminders:** Use Cloudflare Email Workers
4. **Analytics:** Custom analytics with Workers Analytics Engine
5. **Backup:** Automated D1 database backups
6. **Rate Limiting:** Implement rate limiting per user
7. **Caching:** Add Workers Cache API for frequently accessed data

---

## Summary

BPTrack runs entirely on Cloudflare's edge network:

✅ **Frontend** → Cloudflare Pages (React SPA)
✅ **Backend** → Cloudflare Workers (Hono API)
✅ **Database** → Cloudflare D1 (SQLite)
✅ **Sessions** → Cloudflare KV (Key-Value Store)
✅ **Cost** → $0/month (Free tier)
✅ **Performance** → Global edge network, <50ms latency
✅ **Security** → HTTPS, CORS, Input validation, DDoS protection

**Your Application URLs:**
- **Production Site:** https://bptrack.gautamlabs.in
- **Cloudflare Pages:** https://bptrack.pages.dev
- **API Endpoint:** https://bptrack-api.gautamkeshri.workers.dev

The application is fully serverless, globally distributed, and scales automatically! 🚀
