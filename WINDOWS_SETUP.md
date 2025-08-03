# Windows Setup Guide

This guide provides Windows-specific instructions for setting up and running the Blood Pressure Monitoring Application.

## 🖥️ Windows Environment Setup

### 1. Prerequisites
- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **MySQL 8.0+**: Download from [mysql.com](https://dev.mysql.com/downloads/mysql/)
- **Git**: Download from [git-scm.com](https://git-scm.com/)

### 2. Project Setup
```cmd
# Clone the repository
git clone <repository-url>
cd blood-pressure-app

# Install dependencies
npm install
```

### 3. Environment Configuration

#### Create .env File
Copy the example environment file and configure it:
```cmd
copy .env.example .env
```

#### Edit .env File
Open `.env` in your text editor and configure:

```bash
# Environment Mode
NODE_ENV=development

# MySQL Database Configuration (for production)
DATABASE_URL=mysql://root:your_password@localhost:3306/blood_pressure_app
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=blood_pressure_app

# Session Configuration
SESSION_SECRET=your-secret-key-change-this-in-production

# Server Configuration
PORT=5000
HOST=0.0.0.0
```

### 4. Database Setup (Optional for Production)

#### Using MySQL Command Line
```cmd
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE blood_pressure_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blood_pressure_app;

# Exit MySQL
exit;

# Import schema
mysql -u root -p blood_pressure_app < database/schema.sql

# Import test data (optional)
mysql -u root -p blood_pressure_app < database/test_data.sql
```

#### Using MySQL Workbench
1. Open MySQL Workbench
2. Create new connection to localhost
3. Create database: `blood_pressure_app`
4. Import `database/schema.sql`
5. Import `database/test_data.sql` (optional)

#### Troubleshooting Schema Import
If you encounter errors during schema import:

1. **DELIMITER issues**: The schema file is now corrected with proper DELIMITER usage
2. **UUID() function errors**: Requires MySQL 8.0+. Consider upgrading your MySQL version
3. **JSON column errors**: Requires MySQL 5.7.8+
4. **Generated columns errors**: Requires MySQL 5.7+

**For older MySQL versions**, see `database/README.md` for compatibility alternatives.

### 5. Running the Application

#### Development Mode (In-Memory Storage)
```cmd
# Start development server
npm run dev

# Application will be available at:
# http://localhost:5000
```

#### Production Mode (MySQL Database)
```cmd
# Set environment for production
# Edit .env file and set NODE_ENV=production

# Build the application
npm run build

# Start production server
npm start
```

### 6. Windows-Specific Commands

#### Using Command Prompt (CMD)
```cmd
# Set environment variables temporarily
set NODE_ENV=production
set DATABASE_URL=mysql://root:password@localhost:3306/blood_pressure_app
npm start
```

#### Using PowerShell
```powershell
# Set environment variables temporarily
$env:NODE_ENV="production"
$env:DATABASE_URL="mysql://root:password@localhost:3306/blood_pressure_app"
npm start
```

#### Using .env File (Recommended)
The application now supports `.env` files, which is the recommended approach for Windows users:

1. Copy `.env.example` to `.env`
2. Edit `.env` with your configuration
3. Run `npm start` (environment variables are loaded automatically)

## 🔧 Troubleshooting Windows Issues

### Node.js Path Issues
If you get "'NODE_ENV' is not recognized as an internal or external command":

1. **Solution 1**: Use the `.env` file (recommended)
   ```cmd
   # Copy example file
   copy .env.example .env
   # Edit .env file with your settings
   npm start
   ```

2. **Solution 2**: Install cross-env globally
   ```cmd
   npm install -g cross-env
   # Then use cross-env in commands
   cross-env NODE_ENV=production npm start
   ```

3. **Solution 3**: Use PowerShell with proper syntax
   ```powershell
   $env:NODE_ENV="production"; npm start
   ```

### MySQL Connection Issues
If you get database connection errors:

1. **Check MySQL Service**
   ```cmd
   # Check if MySQL is running
   sc query MySQL80
   
   # Start MySQL service if stopped
   net start MySQL80
   ```

2. **Test Database Connection**
   ```cmd
   # Connect to test the database
   mysql -u root -p -h localhost -P 3306
   ```

3. **Verify Database Exists**
   ```sql
   SHOW DATABASES;
   USE blood_pressure_app;
   SHOW TABLES;
   ```

### Port Already in Use
If port 5000 is already in use:

1. **Check what's using the port**
   ```cmd
   netstat -ano | findstr :5000
   ```

2. **Kill the process** (replace PID with actual process ID)
   ```cmd
   taskkill /PID <process_id> /F
   ```

3. **Use a different port** (edit `.env` file)
   ```bash
   PORT=3000
   ```

### Firewall and Antivirus
- Allow Node.js through Windows Firewall
- Add project folder to antivirus exclusions
- Ensure MySQL port 3306 is accessible

## 📁 File Locations

### Environment File
- **Location**: Root directory of the project
- **Filename**: `.env`
- **Template**: `.env.example`

### Database Files
- **Schema**: `database/schema.sql`
- **Test Data**: `database/test_data.sql`
- **Documentation**: `database/README.md`

### Logs and Data
- **Application Logs**: Console output
- **Session Data**: In-memory (development) or MySQL (production)
- **Uploads**: Not applicable for this application

## 🎯 Quick Start for Windows Users

1. **Install Node.js and MySQL**
2. **Clone the project**
3. **Run setup commands**:
   ```cmd
   npm install
   copy .env.example .env
   ```
4. **Edit `.env` file** with your MySQL credentials
5. **Start the application**:
   ```cmd
   npm run dev
   ```
6. **Open browser** to `http://localhost:5000`

## 🔐 Test Credentials

All test users use the same password: **`bloodpressure123`**

### Available Test Accounts:
- `johndoe` - Normal BP readings
- `janesmith` - Diabetes + Hypertension  
- `bobwilson` - Heart Disease
- `alicejohnson` - Diabetes
- `mikebrown` - Healthy young adult

## 🆘 Getting Help

### Common Issues
1. **"NODE_ENV not recognized"** → Use `.env` file
2. **"Cannot connect to MySQL"** → Check MySQL service and credentials
3. **"Port already in use"** → Change port in `.env` file
4. **"Module not found"** → Run `npm install`

### Support Resources
- **Project Documentation**: `README.md`
- **Database Setup**: `database/README.md`
- **API Reference**: `docs/API_DOCUMENTATION.md`
- **User Guide**: `docs/USER_GUIDE.md`

---

**Windows-specific setup complete! The application should now run properly on your Windows machine.**