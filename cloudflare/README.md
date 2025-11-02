# BPTrack - Cloudflare Workers Implementation

> Medical-grade blood pressure monitoring API running on Cloudflare's global edge network

This is the modernized version of BPTrack, migrated from a traditional Node.js/Express application to a serverless, globally-distributed architecture using Cloudflare Workers.

## 🌍 What's Different?

| Aspect | Legacy (Express) | Modern (Workers) |
|--------|-----------------|------------------|
| **Runtime** | Node.js server (single region) | Cloudflare Workers (275+ edge locations) |
| **Database** | PostgreSQL (centralized) | D1 SQLite (distributed edge database) |
| **Latency** | 100-500ms | 10-50ms |
| **Scalability** | Manual | Automatic, infinite |
| **Cost** | ~$14/month | $0/month (free tier) |
| **Cold Starts** | N/A (always running) | ~5ms (virtually instant) |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Cloudflare account (free tier works)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed

```bash
npm install -g wrangler
```

### Installation

1. **Navigate to the Workers directory**:
```bash
cd cloudflare/workers
```

2. **Install dependencies**:
```bash
npm install
```

3. **Login to Cloudflare**:
```bash
wrangler login
```

4. **Create D1 database**:
```bash
npm run d1:create
# Copy the database ID from output
```

5. **Update `wrangler.toml`** with your database ID:
```toml
[[d1_databases]]
binding = "DB"
database_name = "bptrack-db"
database_id = "your-database-id-here"  # <-- Paste here
```

6. **Create KV namespace for sessions**:
```bash
npm run kv:create
# Copy the namespace ID from output
```

7. **Update `wrangler.toml`** with your KV namespace ID:
```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "your-kv-namespace-id-here"  # <-- Paste here
```

8. **Initialize database schema**:
```bash
npm run d1:migrate
```

9. **Seed with sample data (optional)**:
```bash
npm run d1:seed
```

### Local Development

```bash
npm run dev
```

Your API will be available at: `http://localhost:8787`

### Deploy to Production

```bash
npm run deploy
```

Your API will be deployed to: `https://bptrack-api.<your-subdomain>.workers.dev`

## 📚 API Documentation

### Base URL
```
Local:      http://localhost:8787
Production: https://bptrack-api.<your-subdomain>.workers.dev
```

### Authentication

Sessions are managed using Workers KV. When you activate a profile, you receive a `sessionId`:

```bash
curl -X POST http://localhost:8787/api/profiles/{id}/activate
```

Response:
```json
{
  "success": true,
  "data": {
    "message": "Profile activated successfully",
    "profileId": "550e8400-...",
    "sessionId": "abc-123-..."
  }
}
```

Include the session ID in subsequent requests:
```bash
curl -H "Authorization: Bearer abc-123-..." \
  http://localhost:8787/api/readings
```

### Endpoints

#### Health Check
```http
GET /
```

#### Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles` | List all profiles |
| GET | `/api/profiles/active` | Get active profile |
| GET | `/api/profiles/:id` | Get profile by ID |
| POST | `/api/profiles` | Create new profile |
| POST | `/api/profiles/:id/activate` | Set active profile |
| PATCH | `/api/profiles/:id` | Update profile |
| DELETE | `/api/profiles/:id` | Delete profile |

#### Blood Pressure Readings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/readings` | List readings for active profile |
| GET | `/api/readings?profileId={id}` | List readings for specific profile |
| GET | `/api/readings?startDate=...&endDate=...` | Filter by date range |
| GET | `/api/readings/:id` | Get reading by ID |
| POST | `/api/readings` | Create new reading |
| PUT | `/api/readings/:id` | Update reading |
| DELETE | `/api/readings/:id` | Delete reading |

#### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/statistics` | Get statistics for active profile |
| GET | `/api/statistics?days=30` | Get statistics for last N days |

## 🧪 Testing

### Example: Create a Profile

```bash
curl -X POST http://localhost:8787/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "gender": "male",
    "age": 46,
    "medicalConditions": []
  }'
```

### Example: Activate Profile

```bash
curl -X POST http://localhost:8787/api/profiles/{profile-id}/activate
```

### Example: Create a Reading

```bash
curl -X POST http://localhost:8787/api/readings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {session-id}" \
  -d '{
    "systolic": 120,
    "diastolic": 80,
    "pulse": 72,
    "readingDate": "2024-01-15T10:30:00Z"
  }'
```

### Example: Get Statistics

```bash
curl http://localhost:8787/api/statistics?days=30
```

## 🏗️ Project Structure

```
cloudflare/workers/
├── src/
│   ├── index.ts              # Main entry point
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── db/
│   │   ├── schema.sql        # SQL schema for D1
│   │   ├── seed.sql          # Sample data
│   │   └── schema.ts         # Drizzle ORM schema
│   ├── routes/
│   │   ├── profiles.ts       # Profile endpoints
│   │   └── readings.ts       # Reading endpoints
│   ├── middleware/
│   │   ├── cors.ts           # CORS handling
│   │   ├── error-handler.ts  # Error handling
│   │   └── logger.ts         # Request logging
│   └── utils/
│       ├── blood-pressure.ts # BP classification (ACC/AHA 2017)
│       └── session.ts        # Session management
├── wrangler.toml             # Cloudflare Workers config
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

## 🔧 Database Commands

```bash
# Local development
npm run d1:migrate:local      # Apply schema to local D1
npm run d1:seed:local         # Seed local database

# Production
npm run d1:migrate            # Apply schema to production D1
npm run d1:seed               # Seed production database

# Query database directly
wrangler d1 execute bptrack-db --command "SELECT * FROM profiles"
wrangler d1 execute bptrack-db-local --local --command "SELECT * FROM profiles"
```

## 📊 Performance Comparison

Test your API performance from different locations:

```bash
# From your location
time curl https://bptrack-api.<subdomain>.workers.dev/api/profiles

# Expected: ~20-50ms globally (vs. 200-500ms for traditional server)
```

## 🌐 Global Distribution

Your API automatically runs in 275+ Cloudflare edge locations:

- North America: 50+ locations
- Europe: 60+ locations
- Asia: 40+ locations
- South America: 15+ locations
- Africa: 10+ locations
- Oceania: 10+ locations

**Result**: Users get <50ms response times from anywhere in the world.

## 🔐 Environment Variables

Create `.dev.vars` for local development:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`:
```env
SESSION_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5000
ENVIRONMENT=development
```

For production, set secrets using:
```bash
wrangler secret put SESSION_SECRET
```

## 🚦 Deployment Environments

### Local Development
```bash
npm run dev
# http://localhost:8787
```

### Staging
```bash
npm run deploy:staging
# https://staging.bptrack-api.<subdomain>.workers.dev
```

### Production
```bash
npm run deploy:production
# https://bptrack-api.<subdomain>.workers.dev
```

## 📈 Monitoring

View your Workers analytics:
```bash
wrangler tail  # Live logs
```

Or visit: https://dash.cloudflare.com/ → Workers & Pages → Your Worker → Metrics

## 🐛 Troubleshooting

### "Database binding not found"
- Ensure you've created the D1 database: `npm run d1:create`
- Update `wrangler.toml` with the correct database ID

### "KV namespace not found"
- Create KV namespace: `npm run kv:create`
- Update `wrangler.toml` with the correct namespace ID

### "No active profile found"
- Create a profile first: `POST /api/profiles`
- Activate it: `POST /api/profiles/{id}/activate`

### CORS errors
- Check `ALLOWED_ORIGINS` in `.dev.vars`
- Verify your frontend URL is in the allowed origins list

## 📝 Next Steps

1. **Phase 2**: Migrate remaining endpoints (reminders)
2. **Phase 3**: Deploy frontend to Cloudflare Pages
3. **Phase 4**: Add PWA features
4. **Phase 5**: Implement offline-first architecture
5. **Phase 6**: Performance optimization and demo

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Hono Framework](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Migration Roadmap](../CLOUDFLARE_MIGRATION_ROADMAP.md)

## 🤝 Contributing

This is part of a technology demonstration project. See the [Migration Roadmap](../CLOUDFLARE_MIGRATION_ROADMAP.md) for the complete vision.

## 📄 License

MIT
