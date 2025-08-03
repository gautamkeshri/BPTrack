# PM2 Setup Guide for Blood Pressure Monitoring Application

The application is already PM2-ready with no specific changes needed! Here's how to run it with PM2:

## Prerequisites

1. **Install PM2 globally** (if not already installed):
```bash
npm install -g pm2
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment** (copy and configure):
```bash
cp .env.example .env
# Edit .env with your MySQL credentials if using production mode
```

## PM2 Commands

### Using the PM2 Ecosystem File

**Development Mode:**
```bash
pm2 start ecosystem.config.cjs --env development
```

**Production Mode:**
```bash
pm2 start ecosystem.config.cjs --env production
```

**Alternative (if .cjs doesn't work):**
```bash
pm2 start ecosystem.config.js --env development
```

### Direct PM2 Commands (Alternative)

**Development Mode:**
```bash
pm2 start "npm run dev" --name "blood-pressure-app"
```

**Production Mode:**
```bash
# First build the application
npm run build

# Then start with PM2
pm2 start "npm start" --name "blood-pressure-app"
```

### PM2 Management Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs blood-pressure-app

# Restart application
pm2 restart blood-pressure-app

# Stop application
pm2 stop blood-pressure-app

# Delete application from PM2
pm2 delete blood-pressure-app

# Monitor in real-time
pm2 monit
```

## Environment Configuration

The application supports two modes:

### Development Mode (Default)
- Uses in-memory storage (no database required)
- Hot reload with Vite
- Detailed logging
- Environment: `NODE_ENV=development`

### Production Mode
- Requires MySQL database
- Optimized build
- Environment: `NODE_ENV=production`
- Database connection required

## Application URLs

- **Frontend**: http://localhost:6060
- **API**: http://localhost:6060/api/*

## Database Setup (Production Mode Only)

If running in production mode, ensure MySQL is set up:

1. **Create database**:
```sql
CREATE DATABASE blood_pressure_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Import schema**:
```bash
mysql -u root -p blood_pressure_app < database/schema.sql
```

3. **Import test data** (optional):
```bash
mysql -u root -p blood_pressure_app < database/test_data.sql
```

4. **Configure .env file**:
```env
NODE_ENV=production
DATABASE_URL=mysql://username:password@localhost:3306/blood_pressure_app
SESSION_SECRET=your-secure-secret-key
PORT=6060
```

## PM2 Process Management

**Auto-restart on crashes**: ✅ Enabled
**Memory limit**: 1GB (auto-restart if exceeded)
**Clustering**: Single instance (can be increased if needed)
**Logging**: Stored in `./logs/` directory

## Test Credentials (Development Mode)

When using test data, all users have the same password:
- **Password**: `bloodpressure123`
- **Users**: johndoe, janesmith, bobwilson, alicejohnson, mikebrown

## Troubleshooting

### Common Issues:

1. **Port already in use**:
```bash
# Kill process on port 6060
lsof -ti:6060 | xargs kill -9
```

2. **PM2 not starting**:
```bash
# Check PM2 status
pm2 status
pm2 logs blood-pressure-app --lines 50
```

3. **Database connection issues** (production mode):
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database and tables exist

4. **Memory issues**:
```bash
# Monitor memory usage
pm2 monit
```

## Performance Monitoring

PM2 provides built-in monitoring:

```bash
# Real-time monitoring
pm2 monit

# Process information
pm2 show blood-pressure-app

# Restart with 0 downtime
pm2 reload blood-pressure-app
```

## The Application is Ready!

No specific changes are needed for PM2 compatibility. The application already:

✅ **Handles environment variables properly**
✅ **Uses proper error handling**
✅ **Supports graceful shutdowns**
✅ **Binds to 0.0.0.0 for external access**
✅ **Includes comprehensive logging**
✅ **Supports both development and production modes**

Just run `pm2 start ecosystem.config.js --env development` and you're good to go!