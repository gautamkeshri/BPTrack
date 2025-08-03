@echo off
echo Blood Pressure App - Database Migration Tool
echo =============================================
echo.

echo Checking for MySQL connection...
echo.

echo Running database migration script...
node scripts/migrate.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database migration completed successfully!
    echo.
    echo You can now:
    echo - Start the application: npm run dev
    echo - Use test accounts with password: bloodpressure123
    echo.
) else (
    echo.
    echo ❌ Migration failed. Please check the error messages above.
    echo.
    echo Common solutions:
    echo - Ensure MySQL server is running
    echo - Check database credentials in .env file
    echo - Create database manually: CREATE DATABASE blood_pressure_app;
    echo.
)

pause