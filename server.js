const { app: electronApp } = require('electron');
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

electronApp.on('ready', () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const dbPath = path.join(electronApp.getPath('userData'), 'hr-app.db');
  const db = new Database(dbPath);

  // Initialize missing tables
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

  const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@hr.com');
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, name, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(uuidv4(), 'admin@hr.com', hashedPassword, 'Super Admin', 'Super Admin');
  }

  // API Routes
  require('./public/api/routes')(app, db);

  // Serve React App
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build/index.html'));
  });

  app.listen(3001, () => {
    console.log('Production Web Server running on port 3001');
  });
});
