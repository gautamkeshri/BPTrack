# PM2 Status Check for Blood Pressure App

## ✅ Current Status: RUNNING

Your application has been successfully launched with PM2! Here's what you can do:

### Check Application Status
```cmd
pm2 status
```

### View Application Logs
```cmd
pm2 logs blood-pressure-app
```

### Access Your Application
- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api/*

### PM2 Management Commands
```cmd
# View real-time logs
pm2 logs blood-pressure-app --lines 50

# Monitor processes
pm2 monit

# Restart application
pm2 restart blood-pressure-app

# Stop application
pm2 stop blood-pressure-app

# Delete from PM2
pm2 delete blood-pressure-app
```

### Environment Notes
- **Current Environment**: Development mode
- **Storage**: In-memory (no database required)
- **Auto-restart**: Enabled
- **Log Location**: `./logs/` directory

### Test Credentials
All users have the same password: `bloodpressure123`
- johndoe / john.doe@email.com
- janesmith / jane.smith@email.com
- bobwilson / bob.wilson@email.com
- alicejohnson / alice.johnson@email.com
- mikebrown / mike.brown@email.com

### Troubleshooting
If you encounter any issues:
1. Check logs: `pm2 logs blood-pressure-app`
2. Restart: `pm2 restart blood-pressure-app`
3. Check process status: `pm2 status`

Your blood pressure monitoring application is now running under PM2 management!