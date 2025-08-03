# Deployment Guide

## Local Development Setup

### Prerequisites
- Node.js 18 or higher
- MySQL 8.0 or higher (optional)
- Git

### Quick Start

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd blood-pressure-app
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
```

3. **Run the application**
```bash
# Development mode (uses in-memory storage)
npm run dev

# Open browser to http://localhost:6060
```

## MySQL Database Setup (Optional)

### 1. Create Database
```sql
CREATE DATABASE blood_pressure_app;
```

### 2. Configure Environment Variables
Edit `.env` file:
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blood_pressure_app
PORT=6060
```

### 3. Import Database Schema
```bash
mysql -u root -p blood_pressure_app < database/schema.sql
```

### 4. Import Test Data (Optional)
```bash
mysql -u root -p blood_pressure_app < database/test_data.sql
```

## Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
```env
NODE_ENV=production
DATABASE_URL=mysql://user:password@localhost:3306/blood_pressure_app
SESSION_SECRET=your-secure-secret-key
PORT=3000
HOST=0.0.0.0
```

## Application Features

- **Multi-user Profile Management**: Switch between family members
- **Blood Pressure Tracking**: ACC/AHA 2017 compliant classifications
- **Data Visualization**: Interactive charts and trend analysis
- **Medical Reports**: PDF and CSV export for healthcare providers
- **Reminder System**: Medication and appointment alerts
- **Responsive Design**: Works on desktop and mobile devices

## Database Migration

The application automatically detects MySQL availability:
- **MySQL Available**: Uses persistent database storage
- **MySQL Unavailable**: Falls back to in-memory storage

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change PORT in .env file
   - Default ports: 6060 (development), 3000 (production)

2. **MySQL Connection Failed**
   - Verify MySQL is running: `systemctl status mysql`
   - Check credentials in .env file
   - Ensure database exists

3. **Dependencies Issues**
   - Delete node_modules and package-lock.json
   - Run `npm install` again

### Support

For technical issues, refer to:
- README.md for feature documentation
- database/README.md for database setup
- Check application logs for error details