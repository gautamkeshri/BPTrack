# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BPTrack is a medical-grade blood pressure monitoring web application that follows ACC/AHA 2017 guidelines. It provides multi-user profile support, blood pressure tracking with automatic classification, statistical analysis, PDF/CSV export, and medication reminders.

## Development Commands

### Setup and Development
```bash
# Install dependencies
npm install

# Start development server (uses in-memory storage)
npm run dev

# Access at http://localhost:5000 (or port specified in .env)
```

### Database Management
```bash
# Push schema changes to PostgreSQL (Replit/production)
npm run db:push

# Note: Development mode uses in-memory storage by default
# Production requires DATABASE_URL environment variable
```

### Build and Production
```bash
# Type check TypeScript
npm run check

# Build for production (frontend + backend)
npm run build

# Start production server
npm start
```

## Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Drizzle ORM) with in-memory fallback
- **UI Components**: Shadcn/UI (Radix UI primitives)
- **State Management**: TanStack Query
- **Visualization**: Chart.js + Recharts

### Project Structure
```
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       │   ├── ui/        # Shadcn/UI base components
│       │   └── charts/    # Chart.js visualizations
│       ├── pages/         # Application pages (home, not-found)
│       ├── lib/           # Core utilities
│       │   ├── blood-pressure.ts  # BP classification logic
│       │   ├── pdf-generator.ts   # PDF export
│       │   └── queryClient.ts     # TanStack Query config
│       └── hooks/         # Custom React hooks
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Storage abstraction layer
│   └── db.ts            # PostgreSQL connection
├── shared/               # Shared TypeScript types
│   └── schema.ts        # Drizzle ORM schema & Zod validators
└── migrations/          # Drizzle database migrations
```

### Storage Architecture

The app uses a **dual-storage system** with automatic fallback:

1. **DatabaseStorage (PostgreSQL)**: Production-ready storage using Replit PostgreSQL
   - Requires `DATABASE_URL` environment variable
   - Used in production when connection is successful

2. **MemStorage (In-Memory)**: Development fallback storage
   - Automatically used in development or when database unavailable
   - Includes sample data (John Doe, Dad, Mom profiles)
   - Data doesn't persist between restarts

The `storage.ts` module implements an `IStorage` interface with a Proxy that:
- Attempts database connection on initialization
- Falls back to in-memory storage on failure
- Automatically retries failed database operations

### Key Implementation Patterns

#### Blood Pressure Classification
Blood pressure is classified using ACC/AHA 2017 guidelines in `client/src/lib/blood-pressure.ts`:
- **Normal**: Systolic < 120 AND Diastolic < 80
- **Elevated**: Systolic 120-129 AND Diastolic < 80
- **Hypertension Stage 1**: Systolic 130-139 OR Diastolic 80-89
- **Hypertension Stage 2**: Systolic ≥ 140 OR Diastolic ≥ 90
- **Hypertensive Crisis**: Systolic > 180 OR Diastolic > 120

Calculated metrics:
- **Pulse Pressure**: Systolic - Diastolic
- **Mean Arterial Pressure**: Diastolic + (Pulse Pressure / 3)

#### Active Profile System
The app uses a single "active profile" model:
- Only one profile can be active at a time
- All readings/reminders are associated with the active profile
- Profile switching updates which profile is active
- API routes automatically use active profile when `profileId` not specified

#### Data Validation
All input validation uses Zod schemas defined in `shared/schema.ts`:
- `insertProfileSchema`: Profile creation validation
- `insertBloodPressureReadingSchema`: BP reading validation (70-250/40-150 mmHg)
- `insertReminderSchema`: Reminder creation validation

#### API Routes
All routes follow RESTful patterns in `server/routes.ts`:
- **Profiles**: `/api/profiles`, `/api/profiles/:id`, `/api/profiles/:id/activate`, `/api/profiles/active`
- **Readings**: `/api/readings`, `/api/readings/:id` (supports `profileId` and `startDate/endDate` query params)
- **Statistics**: `/api/statistics` (query param: `days=30/60/90`)
- **Reminders**: `/api/reminders`, `/api/reminders/:id`

## Medical Compliance

### ACC/AHA 2017 Guidelines
All blood pressure classification logic **must** follow ACC/AHA 2017 guidelines precisely. The `classifyBloodPressure()` function in `client/src/lib/blood-pressure.ts` is the single source of truth for classification.

### Physiological Validation Ranges
BP readings are validated to ensure physiologically reasonable values:
- Systolic: 70-250 mmHg
- Diastolic: 40-150 mmHg
- Pulse: 40-200 bpm
- Weight: 20-300 kg (optional)

### Critical Alerts
Readings in **Hypertensive Crisis** range (≥180/120) should display urgent medical attention warnings.

## Development Guidelines

### Environment Configuration
Create `.env` from `.env.example`:
```bash
# Required
NODE_ENV=development|production
PORT=5000

# Optional (for PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Required in production
SESSION_SECRET=change-this-in-production
```

### Windows Development
Windows users should reference `WINDOWS_SETUP.md` for platform-specific setup instructions. Key differences:
- Use `copy` instead of `cp` for file operations
- Path separators may differ in scripts

### TypeScript Paths
Vite is configured with path aliases:
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

### Working with Drizzle ORM
Schema changes require:
1. Update `shared/schema.ts`
2. Run `npm run db:push` to sync schema to database
3. Types are automatically generated from schema

### Date Formatting
The app displays dates in **day-month-year** format across all reports and displays. Use appropriate locale settings when formatting dates.

## Common Tasks

### Adding a New Blood Pressure Reading Field
1. Update `bloodPressureReadings` table in `shared/schema.ts`
2. Update `insertBloodPressureReadingSchema` Zod validator
3. Run `npm run db:push` to update database schema
4. Update `createReading()` in `server/storage.ts` (both DatabaseStorage and MemStorage)
5. Update frontend form in `client/src/components/reading-form.tsx`

### Adding a New API Route
1. Add route handler in `server/routes.ts`
2. Follow existing patterns (validation, error handling, active profile)
3. Use storage abstraction via `storage` proxy (never access `db` directly in routes)
4. Return appropriate HTTP status codes (200, 201, 404, 500)

### Creating New UI Components
1. Use Shadcn/UI base components from `client/src/components/ui/`
2. Follow existing component patterns for consistency
3. Use TailwindCSS classes (medical color scheme: green=normal, yellow=elevated, orange=stage1, red=stage2)
4. Ensure mobile responsiveness

### Modifying Blood Pressure Classification
**IMPORTANT**: Changes to classification logic must:
1. Maintain strict ACC/AHA 2017 guideline compliance
2. Update both frontend (`client/src/lib/blood-pressure.ts`) and backend (`server/storage.ts`)
3. Ensure color coding remains consistent across UI
4. Update tests and documentation

## Testing

### Test Data
Development mode includes sample profiles:
- **John Doe** (46M): Normal BP readings, family profile
- **Dad** (76M): Diabetic, various BP readings
- **Mom** (73F): Various BP readings

### Manual Testing
1. Start dev server: `npm run dev`
2. Navigate to profile selector
3. Create readings with various BP values to test classification
4. Export PDF/CSV reports to verify formatting
5. Test reminder creation with different schedules

## Notes

- The app supports both light and dark modes (next-themes)
- PDF generation uses jsPDF with medical report formatting
- CSV exports include all calculated metrics
- WebSocket support is included (ws package) but not currently used
- Session management uses express-session (in-memory in dev, database-backed in prod)
