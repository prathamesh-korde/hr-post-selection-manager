/**
 * HR Post-Selection Manager — Cloud Web Server
 * Standalone Express + SQLite server (no Electron dependency)
 * Deployable to Render.com, Railway, or any Node.js host
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Database Setup ────────────────────────────────────────────────────────────
// On Render free tier use /tmp; with a persistent disk mount use /data
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const dbPath = path.join(DATA_DIR, 'hr-app.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// ── Create Tables ─────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL,
    hr_round_status TEXT DEFAULT 'Pending',
    final_round_status TEXT DEFAULT 'Pending',
    hiring_status TEXT DEFAULT 'Feedback Pending',
    hiring_type TEXT,
    joining_date TEXT,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    round TEXT NOT NULL,
    technical_rating INTEGER,
    behavioral_rating INTEGER,
    comments TEXT,
    go_no_go TEXT,
    submitted_by TEXT,
    submitted_at DATETIME,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
  );

  CREATE TABLE IF NOT EXISTS offer_letters (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    template_id TEXT,
    salary_structure_id TEXT,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    acceptance_status TEXT DEFAULT 'Pending',
    version INTEGER DEFAULT 1,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
  );

  CREATE TABLE IF NOT EXISTS salary_structures (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    role TEXT NOT NULL,
    basic REAL,
    hra REAL,
    da REAL,
    special_allowance REAL,
    pf REAL,
    esi REAL,
    tds REAL,
    professional_tax REAL,
    gross_salary REAL,
    net_salary REAL,
    annual_ctc REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
  );

  CREATE TABLE IF NOT EXISTS policies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    file_path TEXT,
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS policy_acknowledgments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    policy_id TEXT NOT NULL,
    acknowledged_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (policy_id) REFERENCES policies(id)
  );

  CREATE TABLE IF NOT EXISTS onboarding_checklists (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    document_collection BOOLEAN DEFAULT 0,
    system_account_created BOOLEAN DEFAULT 0,
    asset_assignment BOOLEAN DEFAULT 0,
    completed_at DATETIME,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
  );

  CREATE TABLE IF NOT EXISTS induction_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    scheduled_date DATETIME NOT NULL,
    venue_or_link TEXT,
    agenda TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS induction_attendance (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    attended BOOLEAN DEFAULT 0,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    FOREIGN KEY (session_id) REFERENCES induction_sessions(id)
  );

  CREATE TABLE IF NOT EXISTS communication_logs (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    type TEXT NOT NULL,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'Pending',
    sent_at DATETIME,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
  );
`);

// ── Seed Admin User ───────────────────────────────────────────────────────────
const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@hr.com');
if (!adminExists) {
  const hashedPwd = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)')
    .run(uuidv4(), 'admin@hr.com', hashedPwd, 'Super Admin', 'Super Admin');
  console.log('✅ Admin user seeded: admin@hr.com / admin123');
}

// ── Load API Routes ───────────────────────────────────────────────────────────
require('./public/api/routes')(app, db);

// ── Serve React Production Build ──────────────────────────────────────────────
const buildPath = path.join(__dirname, 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  // React Router — serve index.html for all non-API routes
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ status: 'API running', note: 'Run npm run web-build to serve the frontend too' });
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 HR App Web Server running on port ${PORT}`);
});
