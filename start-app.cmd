@echo off
echo Starting Blood Pressure Monitoring Application...

echo Checking if port 5000 is available...
netstat -ano | findstr :5000

echo.
echo Stopping any existing PM2 processes...
pm2 delete blood-pressure-app 2>nul

echo.
echo Starting application with PM2...
pm2 start "npx tsx server/index.ts" --name "blood-pressure-app" --env NODE_ENV=development

echo.
echo Waiting 5 seconds for startup...
timeout /t 5 /nobreak >nul

echo.
echo Checking PM2 status...
pm2 status

echo.
echo Checking application logs...
pm2 logs blood-pressure-app --lines 5

echo.
echo Application should be running at: http://localhost:5000
echo.
echo To view logs: pm2 logs blood-pressure-app
echo To stop: pm2 stop blood-pressure-app
echo To restart: pm2 restart blood-pressure-app