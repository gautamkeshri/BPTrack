# Deployment Guide - Blood Pressure Monitoring Application

## Overview
This guide covers deployment options for the Blood Pressure Monitoring Application, from development setup to production deployment on various platforms.

## Prerequisites

### System Requirements
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **PostgreSQL**: 13+ (for production)
- **Memory**: Minimum 512MB RAM
- **Storage**: 1GB available space

### Environment Variables
```bash
# Required for production
DATABASE_URL="postgresql://username:password@host:port/database"
NODE_ENV="production"
SESSION_SECRET="your-secure-session-secret"

# Optional
PORT=5000
PGPORT=5432
PGUSER=username
PGPASSWORD=password
PGDATABASE=blood_pressure_app
PGHOST=localhost
```

## Development Deployment

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd blood-pressure-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start with:
- **Frontend**: Vite dev server with hot reload
- **Backend**: Express server with nodemon
- **Storage**: In-memory storage with sample data
- **URL**: http://localhost:5000

### Development Features
- Hot module replacement for React components
- Automatic server restart on backend changes
- In-memory database with pre-populated sample data
- TypeScript compilation with error reporting
- Tailwind CSS with JIT compilation

## Production Deployment

### Build Process
```bash
# Install production dependencies
npm ci --only=production

# Build frontend assets
npm run build

# Run database migrations (if using PostgreSQL)
npm run db:migrate

# Start production server
npm start
```

### Production Optimizations
- **Minified Assets**: Optimized JavaScript and CSS bundles
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Dynamic imports for better loading
- **Compression**: Gzip compression for static assets
- **Caching**: Browser caching headers

## Platform-Specific Deployments

### Replit Deployment

#### Replit Configuration
Create `.replit` file:
```toml
[deployment]
run = "npm start"
deploymentTarget = "cloudrun"

[env]
NODE_ENV = "production"
```

#### Deployment Steps
1. **Setup Database**:
   ```bash
   # Use Replit's PostgreSQL service
   # Or connect to external PostgreSQL (Neon, Supabase)
   ```

2. **Configure Environment**:
   - Add `DATABASE_URL` in Replit Secrets
   - Add `SESSION_SECRET` in Replit Secrets

3. **Deploy**:
   - Click "Deploy" button in Replit
   - Select deployment configuration
   - Monitor deployment logs

### Vercel Deployment

#### Vercel Configuration
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Deployment Steps
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Heroku Deployment

#### Heroku Configuration
Create `Procfile`:
```
web: npm start
```

Create `package.json` scripts:
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "start": "node dist/server/index.js",
    "heroku-postbuild": "npm run build"
  }
}
```

#### Deployment Steps
```bash
# Install Heroku CLI
# Create Heroku app
heroku create blood-pressure-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-secret-key

# Deploy
git push heroku main
```

### DigitalOcean App Platform

#### App Spec Configuration
Create `.do/app.yaml`:
```yaml
name: blood-pressure-app
services:
  - name: web
    source_dir: /
    github:
      repo: your-username/blood-pressure-app
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
    http_port: 5000
databases:
  - engine: PG
    name: db
    num_nodes: 1
    size: db-s-dev-database
    version: "13"
```

### Railway Deployment

#### Railway Configuration
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

Add environment variables in Railway dashboard:
- `DATABASE_URL`
- `SESSION_SECRET`
- `NODE_ENV=production`

## Database Setup

### PostgreSQL (Production)

#### Local PostgreSQL Setup
```bash
# Install PostgreSQL
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Start PostgreSQL service
sudo systemctl start postgresql
# or
brew services start postgresql
```

#### Database Creation
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE blood_pressure_app;

-- Create user
CREATE USER bp_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE blood_pressure_app TO bp_user;
```

#### Migration Commands
```bash
# Generate migration
npm run db:generate

# Run migrations
npm run db:migrate

# View database
npm run db:studio
```

### Managed Database Services

#### Neon Database (Recommended)
```bash
# Get connection string from Neon dashboard
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
```

#### Supabase
```bash
# Get connection string from Supabase dashboard
DATABASE_URL="postgresql://postgres:password@hostname:5432/postgres"
```

#### PlanetScale (MySQL alternative)
```bash
# Note: Requires schema modifications for MySQL compatibility
DATABASE_URL="mysql://username:password@hostname:3306/database?sslmode=require"
```

## Environment Configuration

### Production Environment Variables
```bash
# Core application
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Security
SESSION_SECRET=your-very-secure-random-string-here

# Optional: Application settings
ALLOWED_ORIGINS=https://yourdomain.com
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Considerations
```bash
# Generate secure session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Set secure headers
HELMET_ENABLED=true

# Enable CORS protection
CORS_ORIGIN=https://yourdomain.com
```

## Monitoring & Logging

### Application Monitoring
```javascript
// Add to server/index.ts for production monitoring
if (process.env.NODE_ENV === 'production') {
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  });
  
  // Error tracking
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
  });
}
```

### Logging Configuration
```javascript
// Production logging setup
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Performance Optimization

### Frontend Optimizations
```javascript
// Vite production configuration
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          charts: ['chart.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### Backend Optimizations
```javascript
// Production middleware
if (process.env.NODE_ENV === 'production') {
  app.use(compression());
  app.use(helmet());
  app.use(express.static('client/dist', {
    maxAge: '1y',
    etag: true
  }));
}
```

## SSL/TLS Configuration

### Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare SSL
1. Add domain to Cloudflare
2. Update DNS records
3. Enable SSL/TLS encryption mode
4. Configure automatic HTTPS redirects

## Backup Strategy

### Database Backups
```bash
# Automated PostgreSQL backup
#!/bin/bash
BACKUP_DIR="/var/backups/blood-pressure-app"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "$BACKUP_DIR/backup_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### Application Backups
```bash
# Backup application files
tar -czf app_backup_$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  .
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Check environment variables
echo $DATABASE_URL
```

#### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

### Health Checks
```bash
# Application health check
curl http://localhost:5000/health

# Database health check
curl http://localhost:5000/api/profiles/active
```

## Scaling Considerations

### Horizontal Scaling
- **Load Balancer**: Nginx or cloud load balancer
- **Multiple Instances**: Docker containers or cloud instances
- **Session Store**: Redis for shared sessions
- **Database**: Connection pooling and read replicas

### Vertical Scaling
- **Memory**: Increase server RAM
- **CPU**: Upgrade to more cores
- **Storage**: SSD with higher IOPS

### CDN Integration
```javascript
// Configure CDN for static assets
const CDN_URL = process.env.CDN_URL || '';

app.use('/assets', express.static('client/dist/assets', {
  maxAge: '1y',
  setHeaders: (res) => {
    if (CDN_URL) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }
}));
```

This deployment guide provides comprehensive instructions for deploying the Blood Pressure Monitoring Application across various platforms and environments. Choose the deployment option that best fits your needs and infrastructure requirements.