# Quick Start (2 Minutes)

Get BPTrack running locally in 2 minutes.

## Prerequisites

- Node.js 18+ installed

## Commands

```bash
# 1. Navigate to workers directory
cd cloudflare/workers

# 2. Install dependencies (takes ~1 minute)
npm install

# 3. Verify setup
npm run verify

# 4. Setup local database
npm run setup:local

# 5. Start dev server
npm run dev
```

✅ **Done!** API is running at `http://localhost:8787`

## Test It

Open a new terminal:

```bash
# Health check
curl http://localhost:8787/

# Get sample profiles
curl http://localhost:8787/api/profiles
```

You should see JSON responses with sample data! 🎉

## What's Next?

- See [SETUP.md](SETUP.md) for detailed setup guide
- See [README.md](README.md) for full API documentation
- See [docs/PHASE1_COMPLETE.md](docs/PHASE1_COMPLETE.md) for implementation details

## Troubleshooting

### "npm: command not found"
Install Node.js from [nodejs.org](https://nodejs.org/)

### "npm run setup:local" fails
Make sure you ran `npm install` first!

### Port 8787 already in use
Kill the existing process or use a different port:
```bash
npx wrangler dev --port 8788
```

## Deploy to Production

See [SETUP.md](SETUP.md#production-setup-optional) for production deployment.
