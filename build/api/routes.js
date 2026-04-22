const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your-secret-key-change-in-production';

module.exports = (app, db) => {
  // ==================== SYSTEM ROUTES ====================
  app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'HR Desktop App API is running normally on port 3001' });
  });

  // ==================== AUTH ROUTES ====================
  
  // Register user
  app.post('/api/auth/register', (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      
      if (!email || !password || !name || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const userId = uuidv4();

      const stmt = db.prepare(`
        INSERT INTO users (id, email, password, name, role)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(userId, email, hashedPassword, name, role);

      res.json({ success: true, userId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Login user
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;

      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(email);

      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, {
        expiresIn: '24h',
      });

      res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== USER ROUTES ====================

  // Get all users
  app.get('/api/users', (req, res) => {
    try {
      const stmt = db.prepare('SELECT id, email, name, role, department, created_at, updated_at FROM users');
      const users = stmt.all();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== CANDIDATE ROUTES ====================

  // Get all candidates
  app.get('/api/candidates', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM candidates ORDER BY created_at DESC');
      const candidates = stmt.all();
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single candidate
  app.get('/api/candidates/:id', (req, res) => {
    try {
      const { id } = req.params;
      const stmt = db.prepare('SELECT * FROM candidates WHERE id = ?');
      const candidate = stmt.get(id);
      if (candidate) {
        res.json(candidate);
      } else {
        res.status(404).json({ error: 'Candidate not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create candidate
  app.post('/api/candidates', (req, res) => {
    try {
      const { name, email, phone, role } = req.body;
      const candidateId = uuidv4();

      const stmt = db.prepare(`
        INSERT INTO candidates (id, name, email, phone, role)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(candidateId, name, email, phone, role);

      res.json({ success: true, candidateId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update candidate
  app.put('/api/candidates/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { hiring_status, hiring_type, joining_date } = req.body;

      const stmt = db.prepare(`
        UPDATE candidates 
        SET hiring_status = ?, hiring_type = ?, joining_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(hiring_status, hiring_type, joining_date, id);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== FEEDBACK ROUTES ====================

  // Submit feedback
  app.post('/api/feedback', (req, res) => {
    try {
      const {
        candidateId,
        round,
        technicalRating,
        behavioralRating,
        comments,
        goNoGo,
        submittedBy,
      } = req.body;

      const feedbackId = uuidv4();

      const stmt = db.prepare(`
        INSERT INTO feedback (
          id, candidate_id, round, technical_rating, behavioral_rating,
          comments, go_no_go, submitted_by, submitted_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      stmt.run(
        feedbackId,
        candidateId,
        round,
        technicalRating,
        behavioralRating,
        comments,
        goNoGo,
        submittedBy
      );

      // Update candidate status
      const updateStmt = db.prepare(`
        UPDATE candidates 
        SET hiring_status = 'Feedback Submitted', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      updateStmt.run(candidateId);

      res.json({ success: true, feedbackId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get feedback for candidate
  app.get('/api/feedback/:candidateId', (req, res) => {
    try {
      const { candidateId } = req.params;
      const stmt = db.prepare('SELECT * FROM feedback WHERE candidate_id = ?');
      const feedback = stmt.all(candidateId);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== OFFER LETTER ROUTES ====================

  // Create offer letter
  app.post('/api/offer-letters', (req, res) => {
    try {
      const { candidateId, templateId, salaryStructureId } = req.body;
      const offerId = uuidv4();

      const stmt = db.prepare(`
        INSERT INTO offer_letters (id, candidate_id, template_id, salary_structure_id)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run(offerId, candidateId, templateId, salaryStructureId);

      // Update candidate status
      const updateStmt = db.prepare(`
        UPDATE candidates 
        SET hiring_status = 'Offer Released', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      updateStmt.run(candidateId);

      res.json({ success: true, offerId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all offer letters
  app.get('/api/offer-letters', (req, res) => {
    try {
      const { candidateId } = req.query;
      let query = 'SELECT * FROM offer_letters';
      let args = [];
      if (candidateId) {
        query += ' WHERE candidate_id = ?';
        args.push(candidateId);
      }
      query += ' ORDER BY generated_at DESC';
      const stmt = db.prepare(query);
      const offers = stmt.all(...args);
      res.json(offers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get offer letter
  app.get('/api/offer-letters/:candidateId', (req, res) => {
    try {
      const { candidateId } = req.params;
      const stmt = db.prepare('SELECT * FROM offer_letters WHERE candidate_id = ? ORDER BY version DESC');
      const offers = stmt.all(candidateId);
      res.json(offers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update offer acceptance
  app.put('/api/offer-letters/:id/acceptance', (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const stmt = db.prepare(`
        UPDATE offer_letters 
        SET acceptance_status = ?
        WHERE id = ?
      `);

      stmt.run(status, id);

      // If accepted, update candidate status
      if (status === 'Accepted') {
        const offer = db.prepare('SELECT candidate_id FROM offer_letters WHERE id = ?').get(id);
        const updateStmt = db.prepare(`
          UPDATE candidates 
          SET hiring_status = 'Hired', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        updateStmt.run(offer.candidate_id);
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== SALARY STRUCTURE ROUTES ====================

  // Create salary structure
  app.post('/api/salary-structures', (req, res) => {
    try {
      const {
        candidateId,
        role,
        basic,
        hra,
        da,
        specialAllowance,
        pf,
        esi,
        tds,
        professionalTax,
      } = req.body;

      const salaryId = uuidv4();
      const gross = basic + hra + da + specialAllowance;
      const deductions = pf + esi + tds + professionalTax;
      const net = gross - deductions;
      const annual = gross * 12;

      const stmt = db.prepare(`
        INSERT INTO salary_structures (
          id, candidate_id, role, basic, hra, da, special_allowance,
          pf, esi, tds, professional_tax, gross_salary, net_salary, annual_ctc
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        salaryId,
        candidateId,
        role,
        basic,
        hra,
        da,
        specialAllowance,
        pf,
        esi,
        tds,
        professionalTax,
        gross,
        net,
        annual
      );

      res.json({ success: true, salaryId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all salary structures
  app.get('/api/salary-structures', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM salary_structures ORDER BY created_at DESC');
      const salaries = stmt.all();
      res.json(salaries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get salary structure
  app.get('/api/salary-structures/:candidateId', (req, res) => {
    try {
      const { candidateId } = req.params;
      const stmt = db.prepare('SELECT * FROM salary_structures WHERE candidate_id = ?');
      const salary = stmt.get(candidateId);
      res.json(salary || {});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== POLICY ROUTES ====================

  // Get all policies
  app.get('/api/policies', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM policies ORDER BY created_at DESC');
      const policies = stmt.all();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create policy
  app.post('/api/policies', (req, res) => {
    try {
      const { title, category, filePath } = req.body;
      const policyId = uuidv4();

      const stmt = db.prepare(`
        INSERT INTO policies (id, title, category, file_path)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run(policyId, title, category, filePath);

      res.json({ success: true, policyId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== ONBOARDING ROUTES ====================

  // Create onboarding checklist
  app.post('/api/onboarding', (req, res) => {
    try {
      const { candidateId } = req.body;
      const checklistId = uuidv4();

      const stmt = db.prepare(`
        INSERT INTO onboarding_checklists (id, candidate_id)
        VALUES (?, ?)
      `);

      stmt.run(checklistId, candidateId);

      res.json({ success: true, checklistId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update onboarding checklist
  app.put('/api/onboarding/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { documentCollection, systemAccountCreated, assetAssignment } = req.body;

      const stmt = db.prepare(`
        UPDATE onboarding_checklists 
        SET document_collection = ?, system_account_created = ?, asset_assignment = ?
        WHERE id = ?
      `);

      stmt.run(documentCollection, systemAccountCreated, assetAssignment, id);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== INDUCTION ROUTES ====================

  // Create induction session
  app.post('/api/induction-sessions', (req, res) => {
    try {
      const { title, scheduledDate, venueOrLink, agenda } = req.body;
      const sessionId = uuidv4();

      const stmt = db.prepare(`
        INSERT INTO induction_sessions (id, title, scheduled_date, venue_or_link, agenda)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(sessionId, title, scheduledDate, venueOrLink, agenda);

      res.json({ success: true, sessionId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all induction sessions
  app.get('/api/induction-sessions', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM induction_sessions ORDER BY scheduled_date ASC');
      const sessions = stmt.all();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== COMMUNICATION ROUTES ====================

  // Log communication
  app.post('/api/communications', (req, res) => {
    try {
      const { candidateId, type, subject, message, status } = req.body;
      const commId = uuidv4();

      const stmt = db.prepare(`
        INSERT INTO communication_logs (id, candidate_id, type, subject, message, status, sent_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      stmt.run(commId, candidateId, type, subject, message, status);

      res.json({ success: true, commId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all communication logs
  app.get('/api/communications', (req, res) => {
    try {
      const { candidateId } = req.query;
      let query = 'SELECT * FROM communication_logs';
      let args = [];
      if (candidateId) {
         query += ' WHERE candidate_id = ?';
         args.push(candidateId);
      }
      query += ' ORDER BY sent_at DESC';
      const stmt = db.prepare(query);
      const logs = stmt.all(...args);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get communication logs for specific candidate
  app.get('/api/communications/:candidateId', (req, res) => {
    try {
      const { candidateId } = req.params;
      const stmt = db.prepare('SELECT * FROM communication_logs WHERE candidate_id = ? ORDER BY sent_at DESC');
      const logs = stmt.all(candidateId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get communication templates
  app.get('/api/communication-templates', (req, res) => {
    res.json([
      { id: '1', name: 'Offer Letter', subject: 'Your Offer Letter from HR', body: 'Dear {name},\n\nWe are pleased to offer you the position...' },
      { id: '2', name: 'Interview Invite', subject: 'Interview Invitation', body: 'Dear {name},\n\nWe would like to invite you to...' },
      { id: '3', name: 'Rejection', subject: 'Update on your application', body: 'Dear {name},\n\nThank you for applying...' }
    ]);
  });

  // ==================== REPORTS ROUTES ====================

  // Get hiring report
  app.get('/api/reports/hiring', (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      let query = "SELECT hiring_type, COUNT(*) as count FROM candidates WHERE hiring_status = 'Hired'";
      if (startDate && endDate) {
        query += ` AND created_at BETWEEN '${startDate}' AND '${endDate}'`;
      }
      query += ' GROUP BY hiring_type';

      const stmt = db.prepare(query);
      const report = stmt.all();

      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get offer acceptance ratio
  app.get('/api/reports/offer-acceptance', (req, res) => {
    try {
      const stmt = db.prepare(`
        SELECT 
          acceptance_status,
          COUNT(*) as count
        FROM offer_letters
        GROUP BY acceptance_status
      `);

      const report = stmt.all();
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get pending tasks
  app.get('/api/reports/pending-tasks', (req, res) => {
    try {
      const pendingFeedback = db.prepare(`
        SELECT COUNT(*) as count FROM candidates WHERE hiring_status = 'Feedback Pending'
      `).get();

      const pendingOnboarding = db.prepare(`
        SELECT COUNT(*) as count FROM onboarding_checklists WHERE completed_at IS NULL
      `).get();

      res.json({
        pendingFeedback: pendingFeedback.count,
        pendingOnboarding: pendingOnboarding.count,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
