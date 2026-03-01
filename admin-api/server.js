/**
 * Admin API Server — Dhruv Dobariya Cybersecurity Portfolio
 * Express + JWT Auth + JSON File Storage
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const DATA_DIR = path.join(__dirname, 'data');

// ─── Ensure data directory ───
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── Helper: read/write JSON ───
function readJSON(file) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Initialize default data ───
function initData() {
  if (!readJSON('admin.json')) {
    const hash = bcrypt.hashSync('admin123', 10);
    writeJSON('admin.json', {
      username: 'admin',
      passwordHash: hash,
      email: 'dobariyadhurvvipulbhai@gmail.com'
    });
    console.log('[INIT] Default admin created — username: admin, password: admin123');
  }

  if (!readJSON('projects.json')) {
    writeJSON('projects.json', [
      {
        id: '1',
        title: 'SOC Log Analysis Lab',
        description: 'Built a complete SOC analyst lab using Splunk with custom log ingestion pipelines. Analyzed Windows Event Logs, Sysmon data, and firewall logs to detect brute-force attacks, lateral movement, and data exfiltration.',
        technologies: ['Splunk', 'SIEM', 'Windows Event Logs', 'Sysmon'],
        emoji: '🔍',
        impact: 'Detected 15+ attack patterns across simulated enterprise network',
        githubLink: '#',
        featured: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Phishing Email Detection',
        description: 'Developed a phishing detection simulation analyzing email headers, URLs, and social engineering indicators.',
        technologies: ['Python', 'Email Analysis', 'Threat Intel', 'Social Engineering'],
        emoji: '🎣',
        impact: '94% accuracy identifying phishing across 500+ test emails',
        githubLink: '#',
        featured: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Network Traffic Analyzer',
        description: 'Network traffic analysis using Wireshark and tcpdump to capture, filter, and analyze packets.',
        technologies: ['Wireshark', 'tcpdump', 'Packet Analysis', 'DNS Security'],
        emoji: '📡',
        impact: 'Identified 8 types of network-based attacks in simulated captures',
        githubLink: '#',
        featured: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        title: 'AI Threat Report Generator',
        description: 'AI-assisted tool that automatically generates structured threat intelligence reports from raw security logs.',
        technologies: ['Python', 'AI/ML', 'NLP', 'Threat Intelligence'],
        emoji: '🤖',
        impact: 'Reduced manual report generation time by 70%',
        githubLink: '#',
        featured: false,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  if (!readJSON('services.json')) {
    writeJSON('services.json', [
      { id: '1', title: 'Security Log Investigation', icon: '🔍', description: 'Deep-dive SIEM log analysis to identify anomalies and potential security incidents.' },
      { id: '2', title: 'SOC Alert Review & Triage', icon: '🚨', description: 'Systematic security alert review and prioritization following NIST frameworks.' },
      { id: '3', title: 'Vulnerability Assessment', icon: '🛡️', description: 'Identifying security weaknesses through scanning, analysis, and remediation.' },
      { id: '4', title: 'Security Documentation', icon: '📋', description: 'Policies, incident response playbooks, and compliance documentation.' },
      { id: '5', title: 'Secure API Development', icon: '💻', description: 'Backend APIs with .NET Core implementing authentication and secure coding.' },
      { id: '6', title: 'AI Security Automation', icon: '🤖', description: 'AI/ML for automated threat detection and log correlation.' }
    ]);
  }

  if (!readJSON('messages.json')) {
    writeJSON('messages.json', []);
  }

  if (!readJSON('settings.json')) {
    writeJSON('settings.json', {
      siteName: 'DHRUV.SEC',
      fullName: 'Dhruv Dobariya',
      tagline: 'Cybersecurity Analyst | SOC Enthusiast | Cloud & AI Security',
      email: 'dobariyadhurvvipulbhai@gmail.com',
      location: 'Surat, Gujarat, India',
      linkedIn: 'https://www.linkedin.com/in/dhruvdobariya',
      github: 'https://github.com/dhruvdobariya',
      seoTitle: 'Dhruv Dobariya — Cybersecurity Analyst | SOC Enthusiast',
      seoDescription: 'Aspiring SOC Analyst specializing in SIEM, incident response, cloud security, and AI-driven threat detection.'
    });
  }
}

initData();

// ─── Middleware ───
app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:4200', 'http://127.0.0.1:3000'], credentials: true }));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Too many requests' } });
app.use('/api/', limiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many login attempts' } });

// ─── Auth Middleware ───
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Input Sanitization ───
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '').trim();
}

function sanitizeObject(obj) {
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      clean[key] = sanitize(value);
    } else if (Array.isArray(value)) {
      clean[key] = value.map(v => typeof v === 'string' ? sanitize(v) : v);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

// ═══════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const admin = readJSON('admin.json');
  if (!admin || admin.username !== username) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!bcrypt.compareSync(password, admin.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, username: admin.username, expiresIn: 86400 });
});

app.post('/api/auth/change-password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const admin = readJSON('admin.json');
  if (!bcrypt.compareSync(currentPassword, admin.passwordHash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  admin.passwordHash = bcrypt.hashSync(newPassword, 10);
  writeJSON('admin.json', admin);
  res.json({ message: 'Password changed successfully' });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const admin = readJSON('admin.json');
  res.json({ username: admin.username, email: admin.email });
});

// ═══════════════════════════════════════════
// PROJECTS CRUD
// ═══════════════════════════════════════════
app.get('/api/projects', (req, res) => {
  res.json(readJSON('projects.json') || []);
});

app.get('/api/projects/:id', (req, res) => {
  const projects = readJSON('projects.json') || [];
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

app.post('/api/projects', authenticate, (req, res) => {
  const projects = readJSON('projects.json') || [];
  const data = sanitizeObject(req.body);
  const newProject = {
    id: crypto.randomUUID(),
    title: data.title || '',
    description: data.description || '',
    technologies: data.technologies || [],
    emoji: data.emoji || '🔒',
    impact: data.impact || '',
    githubLink: data.githubLink || '#',
    featured: data.featured || false,
    createdAt: new Date().toISOString()
  };
  projects.push(newProject);
  writeJSON('projects.json', projects);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', authenticate, (req, res) => {
  const projects = readJSON('projects.json') || [];
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });

  const data = sanitizeObject(req.body);
  projects[index] = { ...projects[index], ...data, id: projects[index].id, createdAt: projects[index].createdAt };
  writeJSON('projects.json', projects);
  res.json(projects[index]);
});

app.delete('/api/projects/:id', authenticate, (req, res) => {
  let projects = readJSON('projects.json') || [];
  const len = projects.length;
  projects = projects.filter(p => p.id !== req.params.id);
  if (projects.length === len) return res.status(404).json({ error: 'Project not found' });
  writeJSON('projects.json', projects);
  res.json({ message: 'Project deleted' });
});

// ═══════════════════════════════════════════
// SERVICES CRUD
// ═══════════════════════════════════════════
app.get('/api/services', (req, res) => {
  res.json(readJSON('services.json') || []);
});

app.post('/api/services', authenticate, (req, res) => {
  const services = readJSON('services.json') || [];
  const data = sanitizeObject(req.body);
  const newService = {
    id: crypto.randomUUID(),
    title: data.title || '',
    icon: data.icon || '🔒',
    description: data.description || ''
  };
  services.push(newService);
  writeJSON('services.json', services);
  res.status(201).json(newService);
});

app.put('/api/services/:id', authenticate, (req, res) => {
  const services = readJSON('services.json') || [];
  const index = services.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Service not found' });

  const data = sanitizeObject(req.body);
  services[index] = { ...services[index], ...data, id: services[index].id };
  writeJSON('services.json', services);
  res.json(services[index]);
});

app.delete('/api/services/:id', authenticate, (req, res) => {
  let services = readJSON('services.json') || [];
  const len = services.length;
  services = services.filter(s => s.id !== req.params.id);
  if (services.length === len) return res.status(404).json({ error: 'Service not found' });
  writeJSON('services.json', services);
  res.json({ message: 'Service deleted' });
});

// ═══════════════════════════════════════════
// MESSAGES (Contact form submissions)
// ═══════════════════════════════════════════
app.get('/api/messages', authenticate, (req, res) => {
  const messages = readJSON('messages.json') || [];
  res.json(messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.post('/api/messages', (req, res) => {
  const messages = readJSON('messages.json') || [];
  const data = sanitizeObject(req.body);

  if (!data.name || !data.email || !data.message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const newMessage = {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    subject: data.subject || '',
    message: data.message,
    status: 'unread',
    createdAt: new Date().toISOString()
  };
  messages.push(newMessage);
  writeJSON('messages.json', messages);
  res.status(201).json({ message: 'Message sent successfully' });
});

app.patch('/api/messages/:id/read', authenticate, (req, res) => {
  const messages = readJSON('messages.json') || [];
  const msg = messages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  msg.status = 'read';
  writeJSON('messages.json', messages);
  res.json(msg);
});

app.delete('/api/messages/:id', authenticate, (req, res) => {
  let messages = readJSON('messages.json') || [];
  const len = messages.length;
  messages = messages.filter(m => m.id !== req.params.id);
  if (messages.length === len) return res.status(404).json({ error: 'Message not found' });
  writeJSON('messages.json', messages);
  res.json({ message: 'Message deleted' });
});

// ═══════════════════════════════════════════
// SETTINGS (Brand & SEO)
// ═══════════════════════════════════════════
app.get('/api/settings', (req, res) => {
  res.json(readJSON('settings.json') || {});
});

app.put('/api/settings', authenticate, (req, res) => {
  const data = sanitizeObject(req.body);
  const current = readJSON('settings.json') || {};
  const updated = { ...current, ...data };
  writeJSON('settings.json', updated);
  res.json(updated);
});

// ═══════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════
app.get('/api/dashboard/stats', authenticate, (req, res) => {
  const projects = readJSON('projects.json') || [];
  const services = readJSON('services.json') || [];
  const messages = readJSON('messages.json') || [];
  const unreadMessages = messages.filter(m => m.status === 'unread').length;

  res.json({
    totalProjects: projects.length,
    featuredProjects: projects.filter(p => p.featured).length,
    totalServices: services.length,
    totalMessages: messages.length,
    unreadMessages,
    recentMessages: messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  });
});

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Serve Admin Dashboard at /admin ───
const adminDir = path.join(__dirname, '..', 'admin');
app.use('/admin', express.static(adminDir));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(adminDir, 'index.html'));
});

// ─── Serve Portfolio Website at / ───
const siteDir = path.join(__dirname, '..', 'new   website');
app.use(express.static(siteDir));
app.get('/', (req, res) => {
  res.sendFile(path.join(siteDir, 'index.html'));
});

// ─── Start ───
app.listen(PORT, () => {
  console.log(`\n🛡️  Portfolio running at http://localhost:${PORT}`);
  console.log(`🖥️  Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(`🔐 Default login — username: admin, password: admin123\n`);
});
