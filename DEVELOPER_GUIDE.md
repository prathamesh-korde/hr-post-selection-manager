# HR Post-Selection Manager - Developer Guide

## Quick Start

### Development Environment Setup

1. **Clone/Extract the project**
   ```bash
   cd hr-desktop-app
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start development server**
   ```bash
   npm start
   ```

This will:
- Start React dev server on http://localhost:3000
- Start Express backend on http://localhost:3001
- Launch Electron application

### Available Scripts

```bash
# Development
npm start                 # Start dev mode (React + Electron)
npm run react-start      # Start React dev server only
npm run electron-start   # Start Electron only

# Building
npm run react-build      # Build React app for production
npm run electron-build   # Build Electron app for Windows/Linux
npm run build            # Full build (React + Electron)

# Testing
npm test                 # Run tests (when configured)
npm run react-test       # Run React tests only
```

## Project Architecture

### Frontend (React)

**Location**: `src/`

```
src/
├── App.jsx              # Main app component with routing
├── App.css              # Global styles
├── index.jsx            # React entry point
├── index.css            # Global CSS
├── components/
│   ├── Sidebar.jsx      # Navigation sidebar
│   └── TopBar.jsx       # Top navigation bar
└── pages/
    ├── LoginPage.jsx    # Authentication
    ├── Dashboard.jsx    # Main dashboard
    ├── CandidatePipeline.jsx
    ├── OfferLetters.jsx
    ├── SalaryStructure.jsx
    ├── PolicyManagement.jsx
    ├── Onboarding.jsx
    ├── InductionSchedule.jsx
    ├── Reports.jsx
    └── UserManagement.jsx
```

### Backend (Express.js)

**Location**: `public/api/routes.js`

Provides REST API endpoints for:
- Authentication (login, register)
- Candidates management
- Feedback collection
- Offer letters
- Salary structures
- Policies
- Onboarding
- Induction
- Communications
- Reports

### Desktop (Electron)

**Location**: `public/electron.js`

Handles:
- Application window management
- IPC communication between processes
- File system access
- System integration

## Database Schema

SQLite database with tables:

```
users                    # User accounts and authentication
candidates              # Candidate information
feedback                # Interview feedback
offer_letters           # Offer letter tracking
salary_structures       # Salary definitions
policies                # Company policies
policy_acknowledgments  # Policy acceptance tracking
onboarding_checklists   # Onboarding tasks
induction_sessions      # Induction events
induction_attendance    # Attendance tracking
communication_logs      # Email/SMS logs
```

## Key Features Implementation

### 1. Authentication

**File**: `src/authService.js` and `public/api/routes.js`

```javascript
// Login
POST /api/auth/login
{
  email: "user@example.com",
  password: "password123"
}

// Register
POST /api/auth/register
{
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  role: "HR Manager"
}
```

### 2. Candidate Management

**File**: `src/pages/CandidatePipeline.jsx`

Features:
- View all candidates
- Add new candidates
- Update candidate status
- Bulk import from CSV/Excel
- Status workflow tracking

### 3. Offer Letter Generation

**File**: `src/pages/OfferLetters.jsx`

Features:
- Create offer letters from templates
- Merge fields (name, role, salary, etc.)
- Generate PDF
- Send via email
- Track acceptance status

### 4. Salary Structure

**File**: `src/pages/SalaryStructure.jsx`

Features:
- Define earnings (Basic, HRA, DA, Special Allowance)
- Define deductions (PF, ESI, TDS, Professional Tax)
- Auto-calculate Gross, Net, Annual CTC
- Role-wise templates
- Revision history

### 5. Policy Management

**File**: `src/pages/PolicyManagement.jsx`

Features:
- Upload policies (PDF, DOCX, HTML)
- Categorize policies
- Track employee acknowledgments
- Version history

### 6. Onboarding

**File**: `src/pages/Onboarding.jsx`

Features:
- Joining day checklist
- Document collection
- System account creation
- Asset assignment
- Status tracking

### 7. Induction Scheduling

**File**: `src/pages/InductionSchedule.jsx`

Features:
- Calendar view
- Schedule induction sessions
- Send invitations
- Track attendance
- Upload materials

### 8. Reports

**File**: `src/pages/Reports.jsx`

Features:
- Hiring reports by type
- Offer acceptance ratio
- Pending tasks summary
- Induction attendance
- Export to Excel

## API Endpoints Reference

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Candidates
```
GET /api/candidates
POST /api/candidates
PUT /api/candidates/:id
```

### Feedback
```
POST /api/feedback
GET /api/feedback/:candidateId
```

### Offer Letters
```
POST /api/offer-letters
GET /api/offer-letters/:candidateId
PUT /api/offer-letters/:id/acceptance
```

### Salary Structure
```
POST /api/salary-structures
GET /api/salary-structures/:candidateId
```

### Policies
```
GET /api/policies
POST /api/policies
```

### Onboarding
```
POST /api/onboarding
PUT /api/onboarding/:id
```

### Induction
```
POST /api/induction-sessions
GET /api/induction-sessions
```

### Communications
```
POST /api/communications
GET /api/communications/:candidateId
```

### Reports
```
GET /api/reports/hiring
GET /api/reports/offer-acceptance
GET /api/reports/pending-tasks
```

## Configuration

### Environment Variables

Create `.env` file in project root:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001

# Database
DB_PATH=./hr-app.db

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Configuration (optional)
SMS_PROVIDER=twilio
SMS_ACCOUNT_SID=your-account-sid
SMS_AUTH_TOKEN=your-auth-token
SMS_FROM_NUMBER=+1234567890
```

### Build Configuration

Edit `package.json` `build` section:

```json
"build": {
  "appId": "com.hr.postselection",
  "productName": "HR Post-Selection Manager",
  "files": [
    "build/**/*",
    "public/electron.js",
    "node_modules/**/*"
  ],
  "win": {
    "target": ["nsis", "portable"]
  }
}
```

## Development Workflow

### Adding a New Feature

1. **Create React component** in `src/pages/`
   ```jsx
   import React, { useState } from 'react';
   import './NewFeature.css';
   
   function NewFeature() {
     const [data, setData] = useState([]);
     
     return (
       <div className="new-feature-container">
         {/* Component JSX */}
       </div>
     );
   }
   
   export default NewFeature;
   ```

2. **Add CSS styling** in `src/pages/NewFeature.css`

3. **Add API route** in `public/api/routes.js`
   ```javascript
   app.get('/api/new-feature', (req, res) => {
     // Implementation
   });
   ```

4. **Add route in App.jsx**
   ```jsx
   import NewFeature from './pages/NewFeature';
   
   <Route path="/new-feature" element={<NewFeature />} />
   ```

5. **Add navigation link** in `src/components/Sidebar.jsx`

### Testing Locally

1. Start development server: `npm start`
2. Test in Electron window
3. Use browser DevTools (Ctrl+Shift+I) for debugging
4. Check console for errors

### Debugging

**React Components**:
- Use React DevTools browser extension
- Add console.log statements
- Check Network tab for API calls

**Backend**:
- Check terminal output for errors
- Add console.log in routes.js
- Test endpoints with Postman

**Database**:
- Use SQLite browser to inspect database
- Check database file at `%APPDATA%\hr-post-selection-app\hr-app.db`

## Common Tasks

### Adding a New Database Table

1. Edit `public/api/routes.js`
2. Add table creation in initialization code:
   ```javascript
   db.exec(`
     CREATE TABLE IF NOT EXISTS new_table (
       id INTEGER PRIMARY KEY,
       name TEXT NOT NULL,
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
     )
   `);
   ```

### Adding a New API Endpoint

1. Edit `public/api/routes.js`
2. Add endpoint:
   ```javascript
   app.post('/api/new-endpoint', (req, res) => {
     try {
       // Implementation
       res.json({ success: true, data: result });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   ```

### Styling Components

Use CSS modules or global styles:

```css
.component-container {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.component-container button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 3px;
  cursor: pointer;
}

.component-container button:hover {
  background-color: #0056b3;
}
```

## Performance Optimization

### Code Splitting

Use React.lazy for large components:

```javascript
const HeavyComponent = React.lazy(() => import('./pages/HeavyComponent'));

<Suspense fallback={<div>Loading...</div>}>
  <HeavyComponent />
</Suspense>
```

### Database Queries

Use indexes for frequently queried columns:

```javascript
db.exec('CREATE INDEX idx_candidate_status ON candidates(status)');
```

### Bundle Size

Check bundle size:

```bash
npm install -g source-map-explorer
source-map-explorer 'build/static/js/*.js'
```

## Troubleshooting

### Issue: Module not found

**Solution**: 
```bash
npm install
npm start
```

### Issue: Port already in use

**Solution**: 
- Change port in `.env`
- Or kill process using the port

### Issue: Database locked

**Solution**: 
- Close all instances of the app
- Delete database file and restart

### Issue: Electron won't start

**Solution**:
- Check that Express server is running
- Verify port 3001 is available
- Check electron.js for errors

## Best Practices

1. **Keep components small** - Each component should have single responsibility
2. **Use meaningful variable names** - Code should be self-documenting
3. **Add error handling** - Always handle API errors gracefully
4. **Validate inputs** - Check user input before processing
5. **Use environment variables** - Never hardcode sensitive data
6. **Write comments** - Explain complex logic
7. **Test thoroughly** - Test all features before committing
8. **Keep dependencies updated** - Regularly update npm packages

## Resources

- [React Documentation](https://react.dev/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Node.js Documentation](https://nodejs.org/docs/)

## Getting Help

1. Check the README.md for feature documentation
2. Review existing code for examples
3. Check error messages in console
4. Use browser DevTools for debugging
5. Consult team members or documentation

---

**Version**: 1.0.0  
**Last Updated**: April 2026
