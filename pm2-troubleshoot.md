# PM2 Troubleshooting - Blood Pressure App

## Current Status Analysis

Your PM2 shows the application with status "stopped" despite being launched. This typically happens when:

1. **Process is starting up** - npm scripts take a moment to initialize
2. **Port conflict** - Another process might be using port 5000
3. **Environment issues** - Missing dependencies or configuration

## Immediate Actions to Take

### 1. Check Detailed Logs
```cmd
pm2 logs blood-pressure-app --lines 20
```

### 2. Check if Port 5000 is in Use
```cmd
netstat -ano | findstr :5000
```

### 3. Restart the Application
```cmd
pm2 restart blood-pressure-app
```

### 4. Check Real-time Status
```cmd
pm2 monit
```

## Common Solutions

### Solution 1: Process Taking Time to Start
Wait 30-60 seconds, then check status again:
```cmd
pm2 status
```

### Solution 2: Port Conflict
If port 5000 is busy, kill the conflicting process:
```cmd
# Find the process ID (PID) from netstat output
taskkill /PID <process_id> /F
```

### Solution 3: Restart PM2 Process
```cmd
pm2 delete blood-pressure-app
pm2 start ecosystem.config.cjs --env development
```

### Solution 4: Direct npm Command
If PM2 continues having issues, try running directly:
```cmd
npm run dev
```

## Alternative PM2 Configuration

If the current setup doesn't work, try this simpler approach:

```cmd
pm2 start "npm run dev" --name "bp-app" --watch false
```

## Verification Steps

Once running, verify the application:

1. **Check PM2 status**: `pm2 status`
2. **View logs**: `pm2 logs blood-pressure-app`
3. **Test URL**: Open http://localhost:5000
4. **API test**: Visit http://localhost:5000/api/profiles/active

## Expected Output

When working correctly, you should see:
- PM2 status: "online" (green)
- Logs showing: "serving on port 5000"
- Application accessible at localhost:5000

## Next Steps

Run these commands in order and let me know the output:

1. `pm2 logs blood-pressure-app --lines 20`
2. `netstat -ano | findstr :5000`
3. `pm2 restart blood-pressure-app`
4. Wait 30 seconds, then: `pm2 status`

This will help identify the exact issue and get your application running properly.