# HR Post-Selection Manager - Windows Build Guide

## Overview

This guide provides step-by-step instructions to build the HR Post-Selection Manager desktop application as a Windows executable (.exe installer).

## Prerequisites

Before building for Windows, ensure you have the following installed:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Recommended: LTS version (v18 or v20)
   - Verify installation: `node --version` and `npm --version`

2. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

3. **Build Tools** (for native module compilation)
   - Windows Build Tools: `npm install --global windows-build-tools`
   - Or install Visual Studio Build Tools separately

## Project Structure

```
hr-desktop-app/
├── public/
│   ├── index.html
│   ├── electron.js          # Main Electron process
│   ├── preload.js           # Electron preload script
│   └── api/
│       └── routes.js        # Express API routes
├── src/
│   ├── App.jsx              # Main React component
│   ├── App.css              # Global styles
│   ├── index.jsx            # React entry point
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   └── TopBar.jsx
│   └── pages/
│       ├── LoginPage.jsx
│       ├── Dashboard.jsx
│       ├── CandidatePipeline.jsx
│       ├── OfferLetters.jsx
│       ├── SalaryStructure.jsx
│       ├── PolicyManagement.jsx
│       ├── Onboarding.jsx
│       ├── InductionSchedule.jsx
│       ├── Reports.jsx
│       └── UserManagement.jsx
├── package.json
├── .env
└── README.md
```

## Step-by-Step Build Instructions

### Step 1: Install Dependencies

Open Command Prompt (cmd) or PowerShell and navigate to the project directory:

```bash
cd path\to\hr-desktop-app
npm install --legacy-peer-deps
```

This will install all required dependencies including:
- React and React Router
- Electron (desktop framework)
- Express.js (backend server)
- SQLite3 (database)
- And other utilities

**Note**: The installation may take 5-10 minutes on first run. The `--legacy-peer-deps` flag is used to resolve dependency conflicts.

### Step 2: Verify Installation

After installation completes, verify that node_modules folder was created:

```bash
dir node_modules
```

You should see a large number of folders. If the installation failed, check the error messages and ensure all prerequisites are installed.

### Step 3: Build React Application

Build the React application for production:

```bash
npm run react-build
```

This creates an optimized production build in the `build/` directory. The build process:
- Minifies and optimizes all JavaScript and CSS
- Generates source maps for debugging
- Prepares assets for distribution

Expected output:
```
Compiled successfully.
File sizes after gzip:
  75.21 kB  build/static/js/main.xxxxx.js
  3.2 kB    build/static/css/main.xxxxx.css
```

### Step 4: Build Electron Application for Windows

Build the Electron application and create Windows installer:

```bash
npm run electron-build
```

This command will:
1. Rebuild the React application
2. Download Electron for Windows
3. Package the application
4. Create Windows installer (.exe) and portable executable

**Note**: This step downloads ~100MB of Electron binaries and may take 10-15 minutes depending on your internet speed.

### Step 5: Locate the Installer

After the build completes successfully, find the Windows installer in the `dist/` directory:

```bash
dir dist
```

You should see:
- `HR Post-Selection Manager Setup 1.0.0.exe` - NSIS installer (recommended)
- `HR Post-Selection Manager 1.0.0.exe` - Portable executable

### Step 6: Install the Application

Double-click the installer (.exe file) to install the application:

1. **Welcome Screen**: Click "Next" to proceed
2. **License Agreement**: Review and accept the license
3. **Installation Directory**: Choose where to install (default: `C:\Program Files\HR Post-Selection Manager`)
4. **Start Menu Folder**: Choose start menu folder
5. **Installation**: Click "Install" to begin installation
6. **Completion**: Click "Finish" to complete

The application will be installed and a shortcut will be created on your desktop and Start menu.

## Running the Application

### First Time Setup

1. Launch the application from the desktop shortcut or Start menu
2. The application will initialize the SQLite database automatically
3. Login with default credentials:
   - **Email**: admin@hr.com
   - **Password**: admin123

### Database Location

The SQLite database is stored at:
- **Windows**: `%APPDATA%\hr-post-selection-app\hr-app.db`
- Full path example: `C:\Users\YourUsername\AppData\Roaming\hr-post-selection-app\hr-app.db`

### Troubleshooting

#### Port Already in Use

If you get an error about port 3000 or 3001 being in use:

1. Open the `.env` file in the project directory
2. Change the port numbers:
   ```
   REACT_APP_API_URL=http://localhost:3002
   ```
3. Rebuild the application

#### Database Issues

To reset the database:
1. Delete the database file at `%APPDATA%\hr-post-selection-app\hr-app.db`
2. Restart the application
3. The database will be recreated automatically

#### Build Errors

If you encounter build errors:

1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete node_modules and reinstall:
   ```bash
   rmdir /s /q node_modules
   del package-lock.json
   npm install --legacy-peer-deps
   ```

3. Try building again:
   ```bash
   npm run electron-build
   ```

## Advanced Build Options

### Custom Build Configuration

Edit `package.json` to customize the build:

```json
"build": {
  "appId": "com.hr.postselection",
  "productName": "HR Post-Selection Manager",
  "win": {
    "target": ["nsis", "portable"],
    "certificateFile": "path/to/certificate.pfx",
    "certificatePassword": "password"
  }
}
```

### Code Signing (Optional)

To sign the executable with a digital certificate:

1. Obtain a code signing certificate
2. Update `package.json` with certificate details
3. Rebuild the application

### Auto-Update Configuration

The application is configured for auto-updates. To enable:

1. Set up a release server
2. Configure the update URL in `electron.js`
3. Users will be notified of updates automatically

## Distribution

### Creating Installation Media

To distribute the application:

1. Copy the `.exe` installer from the `dist/` folder
2. Create a setup package with:
   - Installation instructions
   - System requirements
   - License agreement
   - Support contact information

### System Requirements

- **OS**: Windows 7 or higher (Windows 10/11 recommended)
- **RAM**: Minimum 2 GB (4 GB recommended)
- **Disk Space**: 500 MB free space
- **Internet**: Required for initial setup and email/SMS features
- **.NET Framework**: Not required (Electron includes all dependencies)

### Deployment Checklist

- [ ] Test installation on clean Windows machine
- [ ] Verify database initialization
- [ ] Test all modules and features
- [ ] Verify email/SMS integration
- [ ] Test PDF generation
- [ ] Test Excel export
- [ ] Verify user authentication
- [ ] Test role-based access control
- [ ] Verify data persistence
- [ ] Test uninstallation process

## Development Mode

To run the application in development mode (for testing/debugging):

```bash
npm start
```

This will:
1. Start React development server on http://localhost:3000
2. Start Express backend on http://localhost:3001
3. Launch Electron application

**Note**: Development mode is slower and includes debugging tools. Use production build for distribution.

## Updating the Application

To update the application after making code changes:

1. Make your changes to React components or backend code
2. Rebuild: `npm run electron-build`
3. The new installer will be created in the `dist/` folder
4. Distribute the new installer to users

## Support and Documentation

- **README.md**: Feature documentation
- **PROJECT_SUMMARY.md**: Project overview and statistics
- **API Documentation**: See `public/api/routes.js` for API endpoints

## Troubleshooting Common Issues

### Issue: "Module not found" error

**Solution**: 
```bash
npm install --legacy-peer-deps
npm run react-build
```

### Issue: Electron fails to start

**Solution**: 
1. Check that port 3001 is not in use
2. Verify Node.js installation
3. Delete `node_modules` and reinstall

### Issue: Database not initializing

**Solution**:
1. Delete the database file
2. Restart the application
3. The database will be recreated automatically

### Issue: Build takes too long

**Solution**:
- Ensure you have at least 2 GB free disk space
- Close other applications to free up RAM
- Use a wired internet connection for faster downloads

## Next Steps

After successful installation:

1. **Configure Email Integration**: Set up SMTP credentials in the backend
2. **Configure SMS Gateway**: Add Twilio or MSG91 API keys
3. **Import Initial Data**: Use bulk import to add candidates
4. **Set Up User Accounts**: Create user accounts for team members
5. **Configure Policies**: Upload company policies
6. **Test All Features**: Verify all modules are working correctly

## Additional Resources

- **Electron Documentation**: https://www.electronjs.org/docs
- **React Documentation**: https://react.dev/
- **Node.js Documentation**: https://nodejs.org/docs/
- **SQLite Documentation**: https://www.sqlite.org/docs.html

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the README.md file
3. Check the PROJECT_SUMMARY.md for feature details
4. Contact the development team for additional support

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Status**: Production Ready
