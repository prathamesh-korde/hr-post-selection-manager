const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;
const Database = require('better-sqlite3');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

let mainWindow;
let server;
let db;

// Initialize database
function initializeDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'hr-app.db');
  db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables
  createTables();

  // Seed default demo user
  const adminEmail = 'admin@hr.com';
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (id, email, password, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), adminEmail, hashedPassword, 'Super Admin', 'Super Admin');
  }
  
  return db;
}

function createTables() {
  // Users table
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
  `);

  // Candidates table
  db.exec(`
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Feedback table
  db.exec(`
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
      FOREIGN KEY (candidate_id) REFERENCES candidates(id),
      FOREIGN KEY (submitted_by) REFERENCES users(id)
    );
  `);

  // Offer Letters table
  db.exec(`
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
  `);

  // Salary Structure table
  db.exec(`
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
  `);

  // Policies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS policies (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      file_path TEXT,
      version INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Policy Acknowledgments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS policy_acknowledgments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      policy_id TEXT NOT NULL,
      acknowledged_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (policy_id) REFERENCES policies(id)
    );
  `);

  // Onboarding Checklist table
  db.exec(`
    CREATE TABLE IF NOT EXISTS onboarding_checklists (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      document_collection BOOLEAN DEFAULT 0,
      system_account_created BOOLEAN DEFAULT 0,
      asset_assignment BOOLEAN DEFAULT 0,
      completed_at DATETIME,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id)
    );
  `);

  // Induction Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS induction_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      scheduled_date DATETIME NOT NULL,
      venue_or_link TEXT,
      agenda TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Induction Attendance table
  db.exec(`
    CREATE TABLE IF NOT EXISTS induction_attendance (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      attended BOOLEAN DEFAULT 0,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id),
      FOREIGN KEY (session_id) REFERENCES induction_sessions(id)
    );
  `);

  // Communication Logs table
  db.exec(`
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
}

// Initialize Express server
function initializeServer() {
  const expressApp = express();
  
  expressApp.use(cors());
  expressApp.use(express.json());

  // API Routes
  require('./api/routes')(expressApp, db);

  server = expressApp.listen(3001, () => {
    console.log('Backend server running on port 3001');
  });

  return expressApp;
}

// Create window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event listeners
app.on('ready', () => {
  initializeDatabase();
  initializeServer();
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Create menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('get-app-version', () => app.getVersion());
