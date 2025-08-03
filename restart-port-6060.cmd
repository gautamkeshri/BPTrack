@echo off
echo Changing application port to 6060...

echo Step 1: Stopping current PM2 process
pm2 delete blood-pressure-app 2>nul

echo Step 2: Starting with new port 6060
pm2 start ecosystem.config.cjs --env development

echo Step 3: Waiting for startup...
timeout /t 3 /nobreak >nul

echo Step 4: Checking PM2 status
pm2 status

echo Step 5: Displaying recent logs
pm2 logs blood-pressure-app --lines 5

echo.
echo Application is now running on: http://localhost:6060
echo API endpoints available at: http://localhost:6060/api/*