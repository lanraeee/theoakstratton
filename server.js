const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static('public'));

// Rate limiting for forms
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many form submissions from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: 'Too many requests from this IP',
});

app.use('/api/', apiLimiter);

// Initialize SQLite database for leads
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      name TEXT,
      company TEXT,
      phone TEXT,
      type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Validate reCAPTCHA token (optional)
async function verifyReCAPTCHA(token) {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    return true; // Skip if not configured
  }

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token
        }
      }
    );

    return response.data.success && response.data.score > 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// Input validation and sanitization
function validateInput(input, maxLength = 500) {
  if (!input || typeof input !== 'string') return null;
  return validator.trim(input).substring(0, maxLength);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Contact form endpoint
app.post('/api/contact', formLimiter, async (req, res) => {
  try {
    let { name, email, company, phone, message, recaptchaToken } = req.body;

    // Validate reCAPTCHA if token provided
    if (recaptchaToken) {
      const isValidCaptcha = await verifyReCAPTCHA(recaptchaToken);
      if (!isValidCaptcha) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed' });
      }
    }

    // Validate and sanitize inputs
    name = validateInput(name, 100);
    email = validateInput(email, 254);
    company = validateInput(company, 100);
    phone = validateInput(phone, 20);
    message = validateInput(message, 5000);

    // Validate required fields
    if (!name || !email || !company) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Escape HTML for email content
    const escapedName = escapeHtml(name);
    const escapedEmail = escapeHtml(email);
    const escapedCompany = escapeHtml(company);
    const escapedPhone = escapeHtml(phone || '');
    const escapedMessage = escapeHtml(message || '');

    // Save to database (using parameterized queries to prevent SQL injection)
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO leads (name, email, company, phone, type) VALUES (?, ?, ?, ?, ?)',
        [name, email, company, phone, 'contact'],
        function(err) {
          if (err && err.message !== 'UNIQUE constraint failed: leads.email') {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    // Send email to business owner
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || 'fawaz@belloite.com',
      subject: `New Contact: ${escapedName} from ${escapedCompany}`,
      html: `
        <h2>New inquiry from your BNPL landing page</h2>
        <p><strong>Name:</strong> ${escapedName}</p>
        <p><strong>Email:</strong> ${escapedEmail}</p>
        <p><strong>Company:</strong> ${escapedCompany}</p>
        <p><strong>Phone:</strong> ${escapedPhone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${escapedMessage || 'No message'}</p>
      `
    });

    // Send confirmation email to lead
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Thanks for reaching out - BNPL Solutions',
      html: `
        <h2>Thanks for your interest!</h2>
        <p>Hi ${escapedName},</p>
        <p>We've received your message and will be in touch within 24 hours.</p>
        <p>In the meantime, check out our full BNPL solutions guide for small businesses.</p>
        <p>Best regards,<br>The BNPL Solutions Team</p>
      `
    });

    res.status(200).json({ success: true, message: 'Thank you! We\'ll be in touch soon.' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to process your request' });
  }
});

// Waitlist endpoint
app.post('/api/waitlist', formLimiter, async (req, res) => {
  try {
    let { email, company, name, recaptchaToken } = req.body;

    // Validate reCAPTCHA if token provided
    if (recaptchaToken) {
      const isValidCaptcha = await verifyReCAPTCHA(recaptchaToken);
      if (!isValidCaptcha) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed' });
      }
    }

    // Validate and sanitize inputs
    email = validateInput(email, 254);
    company = validateInput(company, 100);
    name = validateInput(name, 100);

    // Validate required field
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Escape HTML for email content
    const escapedEmail = escapeHtml(email);
    const escapedCompany = escapeHtml(company || '');
    const escapedName = escapeHtml(name || '');

    // Save to database
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO leads (name, email, company, type) VALUES (?, ?, ?, ?)',
        [name || 'N/A', email, company || 'N/A', 'waitlist'],
        function(err) {
          if (err && err.message !== 'UNIQUE constraint failed: leads.email') {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    // Send confirmation to lead
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Welcome to our waitlist!',
      html: `
        <h2>You're on the list! 🎉</h2>
        <p>Thanks for joining the waitlist for BNPL solutions.</p>
        <p>We'll send you early access, exclusive tips, and a special launch discount when we open.</p>
        <p>Best regards,<br>The BNPL Solutions Team</p>
      `
    });

    // Notify admin
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || 'fawaz@belloite.com',
      subject: `New waitlist signup: ${escapedEmail}`,
      html: `
        <p><strong>Email:</strong> ${escapedEmail}</p>
        <p><strong>Company:</strong> ${escapedCompany || 'Not provided'}</p>
        <p><strong>Name:</strong> ${escapedName || 'Not provided'}</p>
      `
    });

    res.status(200).json({ success: true, message: 'Welcome to the waitlist!' });
  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

// Get leads - Protected with API key
app.get('/api/leads', (req, res) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.all('SELECT * FROM leads ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Security features enabled: Helmet, Rate Limiting, Input Validation');
});
