@echo off
echo Fixing PM2 TypeScript execution issue...

echo Step 1: Stopping current PM2 process
pm2 delete blood-pressure-app

echo Step 2: Starting with corrected TypeScript configuration
pm2 start ecosystem.config.cjs --env development

echo Step 3: Checking status
pm2 status

echo Step 4: Showing logs
pm2 logs blood-pressure-app --lines 10

echo Done! Check if the application is now running properly.