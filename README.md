# HR Post-Selection Manager - Desktop Application

A comprehensive desktop application for managing post-selection HR processes including candidate feedback, offer letters, onboarding, salary structures, and automated communications.

## Features

### 1. **Candidate Pipeline Management**
- Dashboard showing candidates who cleared the final round
- Manual or bulk import of candidates (CSV/Excel)
- Candidate profile with contact information and role details
- Real-time status tracking: Feedback Pending → Feedback Submitted → Selected → Offer Released → Hired

### 2. **Feedback Management**
- Structured feedback fields (Technical rating, Behavioral rating, Comments)
- Go/No-Go decision tracking
- Multiple round support (HR Round, Final Round)
- Interviewer and HR feedback collection

### 3. **Offer Letter Generation & Release**
- Template-based offer letter generator
- Merge fields: Candidate name, role, hiring type, salary, joining date, reporting manager
- PDF generation and email distribution
- Offer acceptance tracking (Accepted/Declined/Pending)
- Version control for offer letters

### 4. **Hiring Type & Contract Definition**
- Support for Permanent, Internship, and Contract hiring types
- Contract terms management (notice period, probation, working hours)
- Renewal options for contract employees

### 5. **Salary Structure Management**
- Earnings: Basic, HRA, DA, Special Allowance
- Deductions: PF, ESI, TDS, Professional Tax
- Automatic calculation of Gross, Net, and Annual CTC
- Role-wise salary templates
- Salary revision history

### 6. **Onboarding Management**
- Joining day checklist:
  - Document collection (ID proof, degree certificates)
  - System account creation
  - Asset assignment (laptop, access card)
- Employee status tracking
- Joining report generation

### 7. **Induction Scheduling**
- Calendar view for induction sessions
- Schedule induction with date, time, venue/Zoom link, and agenda
- Auto-email/SMS invitations with calendar attachments
- Attendance tracking
- Material uploads (PPT, videos, handbooks)

### 8. **Policy Management**
- Upload company policies (PDF, DOCX, HTML)
- Policy categories: Leave, Code of Conduct, IT Security, POSH, etc.
- Employee acknowledgment tracking with timestamps
- Version history of policies

### 9. **Communication Engine**
- Configurable templates for:
  - Offer letter release
  - Re-joining intimation
  - Induction invitation & reminder
  - Policy acknowledgment request
- SMS/Email logs with delivery status
- Test connection for SMTP and SMS gateway

### 10. **Reports & Analytics**
- Candidates hired (Permanent/Internship/Contract) by date range
- Offer letter acceptance ratio
- Pending feedback & pending onboarding reports
- Induction attendance summary
- Salary structure export (Excel/CSV)
- Communication history per candidate

## User Roles

1. **Super Admin** - Full system control, master data configuration
2. **HR Manager** - Offer letter release, salary definition, policy uploads, onboarding scheduling
3. **Recruiter** - Update candidate feedback, change hiring status
4. **Interviewer** - View feedback, add comments (limited access)
5. **Candidate (External)** - Receive emails/SMS, view offer letter, acknowledge documents

## Technology Stack

- **Frontend**: React 18, React Router, Axios
- **Desktop Framework**: Electron
- **Backend**: Express.js, Node.js
- **Database**: SQLite3 (better-sqlite3)
- **Authentication**: JWT, bcryptjs
- **UI Framework**: Custom CSS with responsive design
- **PDF Generation**: PDFKit
- **Excel Export**: XLSX
- **Email**: Nodemailer
- **Charts**: Recharts

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
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
   - Start the React development server on http://localhost:3000
   - Start the Electron app
   - Start the Express backend on http://localhost:3001

### Building for Production

```bash
npm run build
```

This will create:
- Optimized React build in `build/` directory
- Electron executable in `dist/` directory

### Creating Installer (Windows)

```bash
npm run electron-build
```

This generates:
- `.exe` installer file
- Portable `.exe` file

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

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Candidates
- `GET /api/candidates` - Get all candidates
- `POST /api/candidates` - Create new candidate
- `PUT /api/candidates/:id` - Update candidate

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/:candidateId` - Get feedback for candidate

### Offer Letters
- `POST /api/offer-letters` - Create offer letter
- `GET /api/offer-letters/:candidateId` - Get offer letters
- `PUT /api/offer-letters/:id/acceptance` - Update offer acceptance

### Salary Structure
- `POST /api/salary-structures` - Create salary structure
- `GET /api/salary-structures/:candidateId` - Get salary structure

### Policies
- `GET /api/policies` - Get all policies
- `POST /api/policies` - Create policy

### Onboarding
- `POST /api/onboarding` - Create onboarding checklist
- `PUT /api/onboarding/:id` - Update onboarding checklist

### Induction
- `POST /api/induction-sessions` - Create induction session
- `GET /api/induction-sessions` - Get all induction sessions

### Communications
- `POST /api/communications` - Log communication
- `GET /api/communications/:candidateId` - Get communication logs

### Reports
- `GET /api/reports/hiring` - Get hiring report
- `GET /api/reports/offer-acceptance` - Get offer acceptance report
- `GET /api/reports/pending-tasks` - Get pending tasks

## Demo Credentials

- **Email**: admin@hr.com
- **Password**: admin123

## Database

The application uses SQLite3 for data storage. The database file is created automatically at:
- **Windows**: `%APPDATA%/hr-post-selection-app/hr-app.db`
- **macOS**: `~/Library/Application Support/hr-post-selection-app/hr-app.db`
- **Linux**: `~/.config/hr-post-selection-app/hr-app.db`

## Features Roadmap

- [ ] Digital signature integration for offer letters
- [ ] Background verification (BGV) status tracking
- [ ] Reminders & notifications for incomplete tasks
- [ ] Comprehensive audit log of all changes
- [ ] Role-based access control (RBAC) enhancements
- [ ] Dark mode UI
- [ ] Offline mode with cloud sync
- [ ] SMS integration (Twilio, MSG91)
- [ ] Advanced reporting with charts
- [ ] Bulk operations (import/export)

## Troubleshooting

### Port Already in Use
If port 3000 or 3001 is already in use, update the ports in:
- `package.json` (ELECTRON_START_URL)
- `public/electron.js` (server.listen port)

### Database Issues
Delete the database file to reset:
- Windows: `%APPDATA%/hr-post-selection-app/hr-app.db`

### Build Errors
Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Support & Contribution

For issues, feature requests, or contributions, please contact the development team.

## License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0  
**Last Updated**: April 2026
