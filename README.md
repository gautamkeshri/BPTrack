# Blood Pressure Monitoring Application

A comprehensive web application for tracking, analyzing, and sharing blood pressure readings with medical-grade accuracy following ACC/AHA 2017 guidelines.

## 🌟 Features

### 📊 Blood Pressure Tracking
- **Medical-Grade Classification**: Automatic categorization using ACC/AHA 2017 guidelines
- **Calculated Metrics**: Pulse Pressure and Mean Arterial Pressure computation
- **Date & Time Tracking**: Precise timestamp recording for each measurement
- **Validation**: Physiologically reasonable ranges (70-250/40-150 mmHg)

### 👥 Multi-User Profiles
- **Family Support**: Multiple profiles for different family members
- **Demographics**: Age, gender, and medical conditions tracking
- **Data Isolation**: Secure separation of data between profiles
- **Active Profile**: Quick switching between family members

### 📈 Data Visualization & Analytics
- **Interactive Charts**: Trend analysis with Chart.js visualization
- **Statistical Analysis**: Averages, ranges, and distribution analysis
- **Time Periods**: 30, 60, and 90-day analysis windows
- **Classification Distribution**: Visual breakdown by blood pressure category

### 📋 Medical Reports
- **PDF Generation**: Professional medical reports for healthcare providers
- **CSV Export**: Raw data export for clinical systems and spreadsheets
- **Complete History**: All readings with calculated metrics included
- **Medical Compliance**: ACC/AHA 2017 guideline references included

### ⏰ Reminder System
- **Medication Reminders**: Custom medication schedules
- **Appointment Alerts**: Healthcare appointment notifications
- **Flexible Scheduling**: Daily, weekly, or custom repeat patterns
- **Time Management**: 24-hour format with precise timing

## 🚀 Quick Start

### Development Setup
```bash
# Install dependencies
npm install

# Start development server (uses in-memory storage)
npm run dev

# Access application
open http://localhost:5000
```

### Production Setup with MySQL

#### 1. Database Setup
```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE blood_pressure_app;"

# Run schema setup
mysql -u root -p blood_pressure_app < database/schema.sql

# Load test data (optional)
mysql -u root -p blood_pressure_app < database/test_data.sql
```

#### 2. Environment Configuration
```bash
# Set environment variables
export DATABASE_URL="mysql://username:password@host:port/blood_pressure_app"
export NODE_ENV="production"
export DB_HOST="localhost"
export DB_PORT="3306"
export DB_USER="your_username"
export DB_PASSWORD="your_password"
export DB_NAME="blood_pressure_app"
```

#### 3. Start Production Server
```bash
npm run build
npm start
```

## 🔐 Test Credentials

The application includes comprehensive test data with simple, common passwords for easy testing:

### Default Login Credentials
**Password for all users**: `bloodpressure123`

### Test User Accounts

| Username | Email | Profile | Description |
|----------|--------|---------|-------------|
| `johndoe` | john.doe@email.com | John Doe (46M) | Normal BP readings, family profile |
| `janesmith` | jane.smith@email.com | Jane Smith (38F) | Diabetes + Hypertension, Stage 1 |
| `bobwilson` | bob.wilson@email.com | Bob Wilson (62M) | Heart Disease, Stage 2 Hypertension |
| `alicejohnson` | alice.johnson@email.com | Alice Johnson (54F) | Diabetes, improving BP control |
| `mikebrown` | mike.brown@email.com | Mike Brown (28M) | Healthy young adult, normal readings |

### Test Data Includes
- **5 User Accounts** with authentication
- **7 Family Profiles** covering various demographics
- **90+ Blood Pressure Readings** across all classification ranges
- **20+ Reminders** for medications and appointments

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom medical-themed design
- **Shadcn/UI** components built on Radix UI primitives
- **TanStack Query** for efficient state management
- **Chart.js** for interactive data visualization

### Backend Stack
- **Express.js** with TypeScript for API development
- **Drizzle ORM** for type-safe database operations
- **MySQL** with connection pooling for production
- **Zod** for runtime validation and type checking
- **Session-based** authentication and profile management

### Database Design
- **MySQL** with optimized indexes and constraints
- **Stored Procedures** for complex calculations
- **Views** for simplified data access
- **Triggers** for automated data management
- **JSON Columns** for flexible medical condition storage

## 📚 Documentation

### Core Documentation
- **[Technical Specification](docs/TECHNICAL_SPECIFICATION.md)** - Detailed system architecture
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete REST API reference
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Multi-platform deployment instructions
- **[Medical Guidelines](docs/MEDICAL_GUIDELINES.md)** - ACC/AHA 2017 compliance details
- **[User Guide](docs/USER_GUIDE.md)** - End-user documentation

### Database Documentation
- **[Database README](database/README.md)** - MySQL setup and configuration
- **[Schema File](database/schema.sql)** - Complete database structure
- **[Test Data](database/test_data.sql)** - Comprehensive test dataset

## 🩺 Medical Compliance

### ACC/AHA 2017 Guidelines
The application implements the latest American College of Cardiology and American Heart Association blood pressure guidelines:

| Classification | Systolic (mmHg) | Diastolic (mmHg) | Color Code |
|---------------|----------------|------------------|------------|
| Normal | < 120 | AND < 80 | 🟢 Green |
| Elevated | 120-129 | AND < 80 | 🟡 Yellow |
| Hypertension Stage 1 | 130-139 | OR 80-89 | 🟠 Orange |
| Hypertension Stage 2 | ≥ 140 | OR ≥ 90 | 🔴 Red |
| Hypertensive Crisis | > 180 | OR > 120 | ⚫ Dark Red |

### Calculated Clinical Metrics
- **Pulse Pressure**: Systolic - Diastolic (Normal: 30-50 mmHg)
- **Mean Arterial Pressure**: Diastolic + (Pulse Pressure ÷ 3) (Normal: 70-100 mmHg)

## 🔧 Development

### Project Structure
```
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
├── server/              # Express backend server
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Data storage implementations
│   └── db.ts           # MySQL database connection
├── shared/              # Shared TypeScript types
├── database/            # MySQL schema and test data
└── docs/               # Comprehensive documentation
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build production application
npm start            # Start production server
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:studio    # Open database studio
```

### Environment Modes
- **Development**: Uses in-memory storage with sample data
- **Production**: Requires MySQL database connection

## 🚀 Deployment Options

### Replit Deployment
1. Set `DATABASE_URL` in Replit Secrets
2. Click "Deploy" button
3. Configure environment variables

### Vercel Deployment
```bash
npm install -g vercel
vercel --prod
```

### Heroku Deployment
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Docker Deployment
```bash
docker build -t blood-pressure-app .
docker run -p 5000:5000 --env-file .env blood-pressure-app
```

## 🔒 Security & Privacy

### Data Protection
- **Profile Isolation**: Data access restricted by active profile
- **Input Validation**: Comprehensive validation of all user inputs
- **Session Security**: Secure session management with Express sessions
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM

### Medical Data Handling
- **HIPAA Considerations**: Following healthcare data best practices
- **Data Retention**: Configurable data retention policies
- **Audit Trail**: Comprehensive logging of data access
- **Export Control**: Secure PDF and CSV generation

## 📊 Performance Features

### Frontend Optimizations
- **Code Splitting**: Lazy loading for optimal bundle sizes
- **Caching Strategy**: TanStack Query for efficient data caching
- **Responsive Design**: Mobile-first responsive interface
- **Offline Support**: Service worker for offline functionality

### Backend Optimizations
- **Connection Pooling**: MySQL connection pool for performance
- **Database Indexing**: Optimized indexes for common queries
- **Compression**: Gzip compression for API responses
- **Caching Headers**: Browser caching for static assets

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript strict mode
2. Use existing component patterns
3. Maintain medical accuracy
4. Add comprehensive tests
5. Update documentation

### Medical Accuracy
- All calculations must follow ACC/AHA 2017 guidelines
- Blood pressure ranges must be physiologically valid
- Classifications must be medically accurate
- Terminology must use standard medical language

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

### Technical Issues
- Check the [User Guide](docs/USER_GUIDE.md) for common solutions
- Review [API Documentation](docs/API_DOCUMENTATION.md) for integration help
- Consult [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for setup issues

### Medical Questions
- This application provides data tracking, not medical diagnosis
- Always consult healthcare providers for medical decisions
- Seek immediate care for readings ≥180/120 mmHg

---

**Built with ❤️ for better cardiovascular health monitoring**