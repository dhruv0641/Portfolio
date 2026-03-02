/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Production-Grade Admin API Server
 * ═══════════════════════════════════════════════════════════
 * Express + JWT (access+refresh) + HTTP-only cookies + 2FA
 * + Audit Logs + AES-256 Encryption + Zod Validation
 * + Rate Limiting + Brute Force Protection + RBAC
 * + Abstract Data Layer (SaaS-ready)
 * ═══════════════════════════════════════════════════════════
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// ─── Load modular architecture ───
const config = require('./lib/config');
const { logger, requestIdMiddleware, requestLoggerMiddleware } = require('./lib/logger');
const db = require('./lib/dataLayer');
const { notFoundHandler, errorHandler } = require('./lib/errorHandler');

// ─── Route modules ───
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const serviceRoutes = require('./routes/services');
const messageRoutes = require('./routes/messages');
const settingsRoutes = require('./routes/settings');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// ═══════════════════════════════════════════
// MIDDLEWARE STACK (order matters)
// ═══════════════════════════════════════════

// 1. Request ID tracking
app.use(requestIdMiddleware);

// 2. Structured request logging
app.use(requestLoggerMiddleware);

// 3. Security headers (Helmet — production-safe CSP)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com", "https://esm.sh", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://lottie.host", "https://esm.sh", "https://dhruvkumar.tech"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,     // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xFrameOptions: { action: 'deny' },
}));

// 4. CORS (environment-driven origins)
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
}));

// 5. Cookie parser (for HTTP-only auth cookies)
app.use(cookieParser());

// 6. Body parser with size limit
app.use(express.json({ limit: '1mb' }));

// 7. Global rate limiter (no custom keyGenerator — Express 5 + express-rate-limit v7 compatible)
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// 8. Strict auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.rateLimit.authMax,
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ═══════════════════════════════════════════
// DATA INITIALIZATION
// ═══════════════════════════════════════════
function initData() {
  const existing = db.admin.get();
  if (!existing || !existing.username) {
    const hash = bcrypt.hashSync('admin123', 12);
    db.admin.set({
      username: 'admin',
      passwordHash: hash,
      email: 'dobariyadhurvvipulbhai@gmail.com',
      role: 'super_admin',
      tenantId: 'default',
    });
    logger.info('Default admin created', { username: 'admin', warning: 'CHANGE PASSWORD IMMEDIATELY' });
  }

  // ─── Safe admin credential reset via environment variable ───
  // Set RESET_ADMIN=true in Render env vars, deploy once, then REMOVE the var
  if (process.env.RESET_ADMIN === 'true') {
    const current = db.admin.get();
    const hash = bcrypt.hashSync('admin123', 12);
    db.admin.set({
      ...current,
      username: 'admin',
      passwordHash: hash,
    });
    logger.info('⚠️  Admin credentials reset via RESET_ADMIN env var', { username: 'admin' });
    logger.info('⚠️  REMOVE RESET_ADMIN env var immediately after deploy!');
  }

  if (!db.projects.getAll().length) {
    const defaultProjects = [
      {
        title: 'SOC Log Analysis Lab',
        description: 'Built a complete SOC analyst lab using Splunk with custom log ingestion pipelines. Analyzed Windows Event Logs, Sysmon data, and firewall logs to detect brute-force attacks, lateral movement, and data exfiltration.',
        technologies: ['Splunk', 'SIEM', 'Windows Event Logs', 'Sysmon'],
        emoji: '🔍',
        impact: 'Detected 15+ attack patterns across simulated enterprise network',
        githubLink: '#',
        featured: true,
      },
      {
        title: 'Phishing Email Detection',
        description: 'Developed a phishing detection simulation analyzing email headers, URLs, and social engineering indicators.',
        technologies: ['Python', 'Email Analysis', 'Threat Intel', 'Social Engineering'],
        emoji: '🎣',
        impact: '94% accuracy identifying phishing across 500+ test emails',
        githubLink: '#',
        featured: false,
      },
      {
        title: 'Network Traffic Analyzer',
        description: 'Network traffic analysis using Wireshark and tcpdump to capture, filter, and analyze packets.',
        technologies: ['Wireshark', 'tcpdump', 'Packet Analysis', 'DNS Security'],
        emoji: '📡',
        impact: 'Identified 8 types of network-based attacks in simulated captures',
        githubLink: '#',
        featured: false,
      },
      {
        title: 'AI Threat Report Generator',
        description: 'AI-assisted tool that automatically generates structured threat intelligence reports from raw security logs.',
        technologies: ['Python', 'AI/ML', 'NLP', 'Threat Intelligence'],
        emoji: '🤖',
        impact: 'Reduced manual report generation time by 70%',
        githubLink: '#',
        featured: false,
      },
    ];
    defaultProjects.forEach(p => db.projects.create(p));
  }

  if (!db.services.getAll().length) {
    const defaultServices = [
      { title: 'Security Log Investigation', icon: '🔍', description: 'Deep-dive SIEM log analysis to identify anomalies and potential security incidents.' },
      { title: 'SOC Alert Review & Triage', icon: '🚨', description: 'Systematic security alert review and prioritization following NIST frameworks.' },
      { title: 'Vulnerability Assessment', icon: '🛡️', description: 'Identifying security weaknesses through scanning, analysis, and remediation.' },
      { title: 'Security Documentation', icon: '📋', description: 'Policies, incident response playbooks, and compliance documentation.' },
      { title: 'Secure API Development', icon: '💻', description: 'Backend APIs with .NET Core implementing authentication and secure coding.' },
      { title: 'AI Security Automation', icon: '🤖', description: 'AI/ML for automated threat detection and log correlation.' },
    ];
    defaultServices.forEach(s => db.services.create(s));
  }

  if (!db.messages.getAll().length) {
    // Ensure messages.json exists
    db.writeJSON('messages.json', []);
  }

  const settings = db.settings.get();
  if (!settings.siteName) {
    db.settings.set({
      siteName: 'Dhruvkumar Dobariya',
      fullName: 'Dhruvkumar Dobariya',
      tagline: 'Cybersecurity Analyst | SOC Engineer | AI Security Specialist',
      email: 'dobariyadhurvvipulbhai@gmail.com',
      location: 'Surat, Gujarat, India',
      linkedIn: 'https://www.linkedin.com/in/dhruvdobariya',
      github: 'https://github.com/dhruvdobariya',
      seoTitle: 'Dhruvkumar Dobariya – Cybersecurity Analyst | SOC Engineer | AI Security',
      seoDescription: 'Dhruvkumar Dobariya — Cybersecurity Analyst & SOC Engineer specializing in SIEM, incident response, cloud security, and AI-driven threat detection. Surat, Gujarat, India.',
    });
  }

  // Initialize audit logs
  const auditPath = path.join(config.paths.data, 'audit_logs.json');
  if (!fs.existsSync(auditPath)) {
    fs.writeFileSync(auditPath, '[]', 'utf-8');
  }
}

initData();

// ═══════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: config.nodeEnv,
    uptime: Math.floor(process.uptime()),
    requestId: req.requestId,
  });
});

// ═══════════════════════════════════════════
// STATIC FILE SERVING (order: admin → SEO → frontend → catch-all)
// ═══════════════════════════════════════════
const adminDir = path.join(__dirname, '..', 'admin');

// Redirect /admin → /admin/ so relative paths (admin.js, admin.css) resolve correctly
app.get('/admin', (req, res) => {
  res.redirect(301, '/admin/');
});

// Serve admin static files (index.html auto-served for /admin/)
app.use('/admin', express.static(adminDir, { index: 'index.html' }));

// Serve SEO files
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
});

app.get('/sitemap.xml', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const now = new Date().toISOString().split('T')[0];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/#about</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/#projects</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/#services</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/#contact</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
</urlset>`);
});

const siteDir = path.join(__dirname, '..', 'new   website');
app.use(express.static(siteDir));
app.get('/', (req, res) => {
  res.sendFile(path.join(siteDir, 'index.html'));
});

// ═══════════════════════════════════════════
// ERROR HANDLING (Express 5 — no wildcard in app.use)
// ═══════════════════════════════════════════
app.use('/api', notFoundHandler);
app.use(errorHandler);

// ═══════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════
let server;

function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(() => {
      logger.info('Server closed. Goodbye.');
      process.exit(0);
    });
    // Force close after 10 seconds
    setTimeout(() => {
      logger.warn('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { error: String(reason) });
});

// ═══════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════
server = app.listen(config.port, () => {
  logger.info('Server started', {
    port: config.port,
    environment: config.nodeEnv,
    version: '2.0.0',
  });
  console.log(`\n🛡️  Dhruvkumar Dobariya API running at http://localhost:${config.port}`);
  console.log(`🖥️  Admin Dashboard: http://localhost:${config.port}/admin`);
  console.log(`🔐 Environment: ${config.nodeEnv}`);
  if (!config.isProduction) {
    console.log(`⚠️  Default login — admin / admin123 (CHANGE IMMEDIATELY)\n`);
  }
});
