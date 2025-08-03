# Technical Specification - Blood Pressure Monitoring Application

## System Overview

The Blood Pressure Monitoring Application is a full-stack TypeScript web application designed to provide medical-grade blood pressure tracking and analysis. The system follows modern web development practices with a focus on type safety, accessibility, and medical compliance.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React/Vite)  │◄──►│  (Express/TS)   │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Express.js    │    │ • Drizzle ORM   │
│ • TypeScript    │    │ • TypeScript    │    │ • Neon DB       │
│ • Tailwind CSS  │    │ • Zod Validation│    │ • Sessions      │
│ • TanStack Query│    │ • RESTful API   │    │ • Type Safety   │
│ • Chart.js      │    │ • Error Handling│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Data Models

### Profile Entity
```typescript
interface Profile {
  id: string;                    // UUID primary key
  name: string;                  // Patient full name
  gender: 'male' | 'female';     // Gender classification
  age: number;                   // Age in years
  medicalConditions: string[];   // Array of conditions
  isActive: boolean;             // Currently selected profile
  createdAt: Date;               // Record creation timestamp
}
```

### Blood Pressure Reading Entity
```typescript
interface BloodPressureReading {
  id: string;                    // UUID primary key
  profileId: string;             // Foreign key to profiles
  systolic: number;              // Systolic pressure (70-250 mmHg)
  diastolic: number;             // Diastolic pressure (40-150 mmHg)
  pulse: number;                 // Heart rate (40-200 BPM)
  readingDate: Date;             // When reading was taken
  classification: string;        // ACC/AHA classification
  pulseStressure: number;        // Calculated: systolic - diastolic
  meanArterialPressure: number;  // Calculated: diastolic + (PP/3)
  createdAt: Date;               // Record creation timestamp
}
```

### Reminder Entity
```typescript
interface Reminder {
  id: string;                    // UUID primary key
  profileId: string;             // Foreign key to profiles
  title: string;                 // Reminder description
  time: string;                  // Time in HH:MM format
  isRepeating: boolean;          // Whether reminder repeats
  daysOfWeek: string[];          // Days for repeating reminders
  isActive: boolean;             // Whether reminder is enabled
  createdAt: Date;               // Record creation timestamp
}
```

## Business Logic

### Blood Pressure Classification (ACC/AHA 2017)

```typescript
function classifyBloodPressure(systolic: number, diastolic: number): string {
  if (systolic >= 180 || diastolic >= 120) {
    return "Hypertensive Crisis";
  } else if (systolic >= 140 || diastolic >= 90) {
    return "Hypertension Stage 2";
  } else if (systolic >= 130 || diastolic >= 80) {
    return "Hypertension Stage 1";
  } else if (systolic >= 120 && diastolic < 80) {
    return "Elevated";
  } else {
    return "Normal";
  }
}
```

### Calculated Metrics

#### Pulse Pressure (PP)
```
PP = Systolic - Diastolic
Normal Range: 30-50 mmHg
```

#### Mean Arterial Pressure (MAP)
```
MAP = Diastolic + (Pulse Pressure / 3)
Normal Range: 70-100 mmHg
```

## API Specification

### Authentication & Sessions
- **Session Management**: Express sessions with PostgreSQL store
- **Profile Switching**: Active profile stored in session
- **Data Isolation**: All data queries filtered by active profile

### RESTful Endpoints

#### Profiles API
```
GET    /api/profiles           # List all profiles
GET    /api/profiles/active    # Get currently active profile
POST   /api/profiles           # Create new profile
POST   /api/profiles/:id/activate # Set active profile
```

#### Readings API
```
GET    /api/readings           # Get readings for active profile
GET    /api/readings?startDate=2024-01-01&endDate=2024-01-31
POST   /api/readings           # Create new reading
DELETE /api/readings/:id       # Delete specific reading
```

#### Statistics API
```
GET    /api/statistics?days=30 # Get aggregated statistics
```

#### Reminders API
```
GET    /api/reminders          # Get reminders for active profile
POST   /api/reminders          # Create new reminder
PUT    /api/reminders/:id      # Update reminder
DELETE /api/reminders/:id      # Delete reminder
```

### Request/Response Formats

#### Create Reading Request
```json
{
  "systolic": 120,
  "diastolic": 80,
  "pulse": 72,
  "readingDate": "2024-01-15T08:30:00.000Z"
}
```

#### Statistics Response
```json
{
  "totalReadings": 30,
  "averages": {
    "systolic": 125,
    "diastolic": 82,
    "pulse": 74,
    "pulseStressure": 43,
    "meanArterialPressure": 96
  },
  "ranges": {
    "systolic": { "min": 110, "max": 140 },
    "diastolic": { "min": 70, "max": 95 },
    "pulse": { "min": 65, "max": 85 }
  },
  "distribution": {
    "Normal": 10,
    "Elevated": 5,
    "Hypertension Stage 1": 12,
    "Hypertension Stage 2": 3
  },
  "period": {
    "startDate": "2023-12-16T00:00:00.000Z",
    "endDate": "2024-01-15T23:59:59.999Z",
    "days": 30
  }
}
```

## Frontend Architecture

### Component Hierarchy
```
App
├── Router (Wouter)
├── QueryClientProvider (TanStack Query)
├── TooltipProvider (Radix UI)
└── Pages
    ├── Home
    │   ├── Header
    │   ├── Tabs (Readings | Statistics | Charts)
    │   ├── ReadingsList
    │   ├── StatisticsView
    │   └── ChartsView
    └── NotFound

Components
├── ReadingForm (Modal)
├── ProfileSelector (Modal)
├── Charts
│   ├── TrendChart (Chart.js)
│   └── DistributionChart
└── UI Components (Shadcn/UI)
```

### State Management Strategy

#### Server State (TanStack Query)
- **Caching**: Automatic caching with stale-while-revalidate
- **Synchronization**: Optimistic updates for mutations
- **Error Handling**: Centralized error states
- **Background Refetching**: Keep data fresh

#### Client State (React State)
- **UI State**: Modal visibility, form states
- **Local Preferences**: Chart display options
- **Temporary Data**: Form inputs before submission

### Query Key Structure
```typescript
// Hierarchical query keys for proper cache invalidation
['/api/profiles']                    // All profiles
['/api/profiles/active']             // Active profile
['/api/readings']                    // All readings for active profile
['/api/readings', profileId]         // Readings for specific profile
['/api/statistics', days]            // Statistics with time filter
['/api/reminders']                   // All reminders for active profile
```

## Database Design

### Schema Definition (Drizzle)
```typescript
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  gender: text("gender").notNull(),
  age: integer("age").notNull(),
  medicalConditions: text("medical_conditions").array().default([]),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bloodPressureReadings = pgTable("blood_pressure_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => profiles.id),
  systolic: integer("systolic").notNull(),
  diastolic: integer("diastolic").notNull(),
  pulse: integer("pulse").notNull(),
  readingDate: timestamp("reading_date").notNull(),
  classification: text("classification").notNull(),
  pulseStressure: integer("pulse_pressure").notNull(),
  meanArterialPressure: integer("mean_arterial_pressure").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Indexing Strategy
```sql
-- Performance optimization indexes
CREATE INDEX idx_readings_profile_date ON blood_pressure_readings(profile_id, reading_date DESC);
CREATE INDEX idx_readings_classification ON blood_pressure_readings(classification);
CREATE INDEX idx_reminders_profile_active ON reminders(profile_id, is_active);
```

### Data Integrity Constraints
- **Foreign Key Constraints**: Ensure referential integrity
- **Check Constraints**: Validate blood pressure ranges
- **Not Null Constraints**: Ensure required fields
- **Unique Constraints**: Prevent duplicate data

## Security Considerations

### Input Validation
```typescript
// Zod schema validation for API requests
const insertBloodPressureReadingSchema = z.object({
  systolic: z.number().min(70).max(250),
  diastolic: z.number().min(40).max(150),
  pulse: z.number().min(40).max(200),
  readingDate: z.string().datetime(),
});
```

### Data Protection
- **Session Security**: Secure session cookies
- **Profile Isolation**: Data access control by profile
- **Input Sanitization**: Prevent injection attacks
- **Type Safety**: Compile-time type checking

### HIPAA Considerations
- **Data Encryption**: Encrypt sensitive data at rest
- **Access Logging**: Audit trail for data access
- **User Consent**: Clear data usage policies
- **Data Retention**: Configurable retention policies

## Performance Optimization

### Frontend Optimizations
- **Code Splitting**: Lazy loading for routes
- **Bundle Optimization**: Vite's optimized bundling
- **Image Optimization**: Responsive images
- **Caching Strategy**: Service worker for offline support

### Backend Optimizations
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Response Compression**: Gzip compression
- **Caching Headers**: Browser caching strategy

### Monitoring & Analytics
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Core Web Vitals monitoring
- **User Analytics**: Usage pattern analysis
- **Health Checks**: Application health monitoring

## Deployment Architecture

### Development Environment
```yaml
Environment: Development
Database: In-memory storage
Session Store: Memory store
Hot Reload: Enabled
Debug Mode: Enabled
```

### Production Environment
```yaml
Environment: Production
Database: PostgreSQL (Neon)
Session Store: PostgreSQL
SSL: Enabled
Compression: Enabled
Logging: Structured JSON logs
Monitoring: Application metrics
```

### CI/CD Pipeline
```yaml
Stages:
  - Lint & Type Check
  - Unit Tests
  - Integration Tests
  - Build Production Bundle
  - Database Migration
  - Deploy to Staging
  - E2E Tests
  - Deploy to Production
  - Health Check Verification
```

## Error Handling Strategy

### Frontend Error Boundaries
```typescript
// React Error Boundary for graceful failure
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Application Error:', error, errorInfo);
  }
}
```

### Backend Error Middleware
```typescript
// Centralized error handling
app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  
  // Log error with context
  logger.error({ error, request: req.url, method: req.method });
  
  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
});
```

## Testing Strategy

### Unit Testing
- **Frontend**: React Testing Library + Jest
- **Backend**: Node.js test runner
- **Utilities**: Pure function testing
- **Coverage**: 80% minimum coverage

### Integration Testing
- **API Tests**: Supertest for endpoint testing
- **Database Tests**: In-memory database testing
- **Component Tests**: React component integration

### End-to-End Testing
- **User Flows**: Critical path testing
- **Cross-Browser**: Chrome, Firefox, Safari
- **Mobile Testing**: Responsive design validation

## Accessibility Standards

### WCAG 2.1 Compliance
- **Level AA**: Target compliance level
- **Screen Readers**: Full compatibility
- **Keyboard Navigation**: Complete keyboard accessibility
- **Color Contrast**: 4.5:1 minimum ratio

### Implementation
- **Semantic HTML**: Proper element usage
- **ARIA Labels**: Comprehensive labeling
- **Focus Management**: Logical tab order
- **Alternative Text**: Image descriptions

## Medical Compliance

### ACC/AHA 2017 Guidelines
- **Classification**: Accurate blood pressure categorization
- **Thresholds**: Clinically validated ranges
- **Terminology**: Standard medical terminology
- **Units**: Consistent mmHg and BPM units

### Clinical Features
- **Trend Analysis**: Long-term pattern recognition
- **Risk Assessment**: Classification-based risk levels
- **Report Generation**: Medical-grade PDF reports
- **Data Export**: CSV format for clinical systems

## Maintenance & Support

### Code Quality
- **TypeScript**: Full type coverage
- **ESLint**: Strict linting rules
- **Prettier**: Consistent code formatting
- **Documentation**: Comprehensive inline docs

### Monitoring
- **Health Checks**: Application status monitoring
- **Error Tracking**: Real-time error notifications
- **Performance**: Response time monitoring
- **Uptime**: Service availability tracking

### Updates & Patches
- **Dependency Updates**: Regular security updates
- **Feature Releases**: Quarterly feature updates
- **Bug Fixes**: Hot fixes for critical issues
- **Documentation**: Keep docs current with changes