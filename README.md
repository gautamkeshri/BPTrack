# Blood Pressure Monitoring Application

A comprehensive web application for tracking, analyzing, and managing blood pressure readings with multi-user support, medical-grade reporting, and data visualization following ACC/AHA 2017 guidelines.

## 🚀 Features

### Core Functionality
- **Multi-User Profiles**: Support for multiple family members under one account
- **Blood Pressure Tracking**: Log systolic, diastolic, and pulse readings with date/time
- **Medical Classification**: Automatic classification using ACC/AHA 2017 guidelines
- **Statistics & Analytics**: Comprehensive analysis with 30/60/90-day filtering
- **Data Visualization**: Interactive charts showing trends and distribution
- **Medical Reports**: Generate PDF and CSV reports for healthcare professionals
- **Profile Management**: Easy switching between family member profiles

### Medical Features
- **ACC/AHA 2017 Compliance**: Follows latest blood pressure classification guidelines
- **Calculated Metrics**: Automatic pulse pressure and mean arterial pressure calculation
- **Classification Categories**: Normal, Elevated, Hypertension Stage 1/2, Hypertensive Crisis
- **Trend Analysis**: Visual representation of blood pressure patterns over time
- **Distribution Charts**: See percentage breakdown of readings by classification

## 🛠️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom medical-themed design system
- **Shadcn/UI** components built on Radix UI primitives
- **TanStack Query** for server state management
- **Wouter** for lightweight client-side routing
- **Chart.js** for interactive data visualization
- **React Hook Form** with Zod validation

### Backend Stack
- **Node.js** with Express.js framework
- **TypeScript** with ES modules for full-stack type safety
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** with Neon Database (serverless)
- **Express Sessions** with PostgreSQL session store
- **RESTful API** design with structured error handling

### Data Storage
- **Development**: In-memory storage for fast prototyping
- **Production**: PostgreSQL with Drizzle ORM
- **Session Management**: PostgreSQL-backed sessions
- **Schema Validation**: Zod schemas for runtime type checking

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database (for production)
- Modern web browser with JavaScript enabled

## 🚀 Quick Start

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd blood-pressure-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5000`

### Development Mode

The application runs in development mode with:
- **Hot reload** for both frontend and backend
- **In-memory storage** with pre-populated sample data
- **Sample profiles**: John Doe (46), Dad (76, Diabetic), Mom (73)
- **No database setup required** for development

## 🗄️ Database Setup (Production)

### PostgreSQL Configuration

1. **Create a PostgreSQL database:**
   ```sql
   CREATE DATABASE blood_pressure_app;
   ```

2. **Set environment variables:**
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/blood_pressure_app"
   ```

3. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

### Database Schema

The application uses three main tables:

#### Profiles Table
```sql
- id (UUID, Primary Key)
- name (Text, Required)
- gender (Text: 'male' | 'female')
- age (Integer)
- medical_conditions (Text Array)
- is_active (Boolean)
- created_at (Timestamp)
```

#### Blood Pressure Readings Table
```sql
- id (UUID, Primary Key)
- profile_id (UUID, Foreign Key)
- systolic (Integer, 70-250 mmHg)
- diastolic (Integer, 40-150 mmHg)
- pulse (Integer, 40-200 BPM)
- reading_date (Timestamp)
- classification (Text)
- pulse_pressure (Integer, Calculated)
- mean_arterial_pressure (Integer, Calculated)
- created_at (Timestamp)
```

#### Reminders Table
```sql
- id (UUID, Primary Key)
- profile_id (UUID, Foreign Key)
- title (Text)
- time (Text, HH:MM format)
- is_repeating (Boolean)
- days_of_week (Text Array)
- is_active (Boolean)
- created_at (Timestamp)
```

## 🏗️ Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Shadcn/UI components
│   │   │   ├── charts/     # Chart components
│   │   │   └── *.tsx       # Feature components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main application component
│   └── index.html          # HTML entry point
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data storage interface
│   └── vite.ts             # Vite integration
├── shared/                 # Shared TypeScript types
│   └── schema.ts           # Database schemas and types
└── docs/                   # Documentation
```

## 🔌 API Endpoints

### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/active` - Get active profile
- `POST /api/profiles` - Create new profile
- `POST /api/profiles/:id/activate` - Set active profile

### Blood Pressure Readings
- `GET /api/readings` - Get readings for active profile
- `POST /api/readings` - Create new reading
- `DELETE /api/readings/:id` - Delete reading

### Statistics
- `GET /api/statistics?days=30` - Get statistics for specified period

### Reminders
- `GET /api/reminders` - Get reminders for active profile
- `POST /api/reminders` - Create new reminder

## 🎨 Design System

### Color Palette
The application uses a medical-grade color system:

- **Primary Blue**: `hsl(207, 90%, 54%)` - Medical professional theme
- **Blood Pressure Classifications**:
  - Normal: `hsl(142, 71%, 45%)` (Green)
  - Elevated: `hsl(45, 93%, 47%)` (Yellow)
  - Stage 1: `hsl(25, 95%, 53%)` (Orange)
  - Stage 2: `hsl(0, 73%, 41%)` (Red)
  - Crisis: `hsl(0, 84%, 35%)` (Dark Red)

### Typography
- **Font**: Inter (clean, medical-grade readability)
- **Size Scale**: Responsive typography with mobile-first approach
- **Weight**: Strategic use of font weights for hierarchy

## 📱 Mobile-First Design

The application is designed with mobile-first principles:
- **Responsive Layout**: Optimized for mobile devices
- **Touch-Friendly**: Large touch targets and intuitive gestures
- **Progressive Enhancement**: Works on all screen sizes
- **Accessibility**: ARIA compliance through Radix UI

## 🧪 Development Workflow

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run TypeScript compiler
npm run type-check

# Database operations
npm run db:generate    # Generate migrations
npm run db:migrate     # Run migrations
npm run db:studio      # Open Drizzle Studio
```

### Code Quality
- **TypeScript**: Full type safety across frontend and backend
- **ESLint**: Code linting with React and TypeScript rules
- **Prettier**: Automatic code formatting
- **Zod**: Runtime type validation for API requests

## 🔒 Security Features

### Data Validation
- **Zod Schemas**: Runtime validation for all inputs
- **Type Safety**: Compile-time type checking
- **Input Sanitization**: Automatic sanitization of user inputs

### Session Management
- **Express Sessions**: Secure session handling
- **PostgreSQL Store**: Session persistence in database
- **Profile Isolation**: Data access control by profile

## 📊 Blood Pressure Classifications

Following ACC/AHA 2017 Guidelines:

| Category | Systolic (mmHg) | Diastolic (mmHg) |
|----------|----------------|------------------|
| Normal | < 120 | AND < 80 |
| Elevated | 120-129 | AND < 80 |
| Stage 1 Hypertension | 130-139 | OR 80-89 |
| Stage 2 Hypertension | ≥ 140 | OR ≥ 90 |
| Hypertensive Crisis | > 180 | OR > 120 |

## 📋 Usage Guide

### Adding Blood Pressure Readings
1. Click "Add New Reading" button
2. Enter systolic pressure (70-250 mmHg)
3. Enter diastolic pressure (40-150 mmHg)
4. Enter pulse rate (40-200 BPM)
5. Set date and time
6. Save reading

### Viewing Statistics
1. Navigate to Statistics tab
2. Select time period (30, 60, or 90 days)
3. View average readings, ranges, and trends
4. See classification distribution

### Generating Reports
1. Go to Statistics view
2. Click "Export PDF" for medical report
3. Click "Export CSV" for data analysis
4. Reports include patient info and ACC/AHA compliance

### Managing Profiles
1. Click profile avatar in header
2. Select from existing profiles
3. Add new profiles with medical conditions
4. Switch between family members

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Add proper error handling
- Include accessibility features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check existing issues in the repository
- Create new issue for bugs or feature requests
- Follow the issue template for better assistance

## 🗺️ Roadmap

### Phase 2 Features
- [ ] Mobile application (React Native)
- [ ] Bluetooth device integration
- [ ] Apple Health / Google Fit sync
- [ ] Medication tracking
- [ ] Doctor appointment scheduling
- [ ] Email report sharing
- [ ] Advanced analytics dashboard
- [ ] Machine learning trend predictions

---

**Built with ❤️ for better health monitoring**