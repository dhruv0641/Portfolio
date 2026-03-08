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
const customizeRoutes = require('./routes/customize');
const heroRoutes = require('./routes/hero');
const aboutRoutes = require('./routes/about');
const contactRoutes = require('./routes/contact');
const footerRoutes = require('./routes/footer');
const quoteRoutes = require('./routes/quotes');
const statRoutes = require('./routes/stats');
const mediaBlockRoutes = require('./routes/mediaBlocks');
const methodologyRoutes = require('./routes/methodology');
const expertiseRoutes = require('./routes/expertise');
const toolRoutes = require('./routes/tools');
const certificateRoutes = require('./routes/certificates');

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
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://lottie.host", "https://esm.sh", "https://dhruvkumar.tech"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      workerSrc: ["'self'", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
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

// ═══════════════════════════════════════════
// DATA INITIALIZATION
// ═══════════════════════════════════════════
async function initData() {
  const DEFAULT_SEED_KEY = 'defaults_seeded_v1';
  const existing = await db.admin.get();
  if (!existing || !existing.username) {
    // Admin credentials from environment variables — never hardcoded
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || '';
    if (!adminUser || !adminPass) {
      if (config.isProduction) {
        logger.error('FATAL: ADMIN_USERNAME and ADMIN_PASSWORD env vars required in production');
        process.exit(1);
      }
      logger.warn('No ADMIN_USERNAME/ADMIN_PASSWORD set — using development defaults. DO NOT use in production.');
    }
    const username = adminUser || 'admin';
    const password = adminPass || 'Dev_Temp_Pass_2026!';
    const hash = bcrypt.hashSync(password, 12);
    await db.admin.set({
      username,
      passwordHash: hash,
      email: adminEmail,
      role: 'super_admin',
      tenantId: 'default',
    });
    logger.info('Admin account initialized', { username });
  }

  const seedMarker = await db.systemState.get(DEFAULT_SEED_KEY);
  if (seedMarker === '1') {
    return;
  }

  const existingContentTotal =
    (await db.projects.count()) +
    (await db.services.count()) +
    (await db.methodology.count()) +
    (await db.expertise.count()) +
    (await db.tools.count()) +
    (await db.certificates.count()) +
    (await db.messages.count());

  if (existingContentTotal > 0) {
    await db.systemState.set(DEFAULT_SEED_KEY, '1');
    logger.info('Default seed disabled: existing content detected', { existingContentTotal });
    return;
  }

  if (!(await db.projects.getAll()).length) {
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
    for (const p of defaultProjects) await db.projects.create(p);
  }

  if (!(await db.services.getAll()).length) {
    const defaultServices = [
      { title: 'Security Log Investigation', icon: '🔍', description: 'Deep-dive SIEM log analysis to identify anomalies and potential security incidents.' },
      { title: 'SOC Alert Review & Triage', icon: '🚨', description: 'Systematic security alert review and prioritization following NIST frameworks.' },
      { title: 'Vulnerability Assessment', icon: '🛡️', description: 'Identifying security weaknesses through scanning, analysis, and remediation.' },
      { title: 'Security Documentation', icon: '📋', description: 'Policies, incident response playbooks, and compliance documentation.' },
      { title: 'Secure API Development', icon: '💻', description: 'Backend APIs with .NET Core implementing authentication and secure coding.' },
      { title: 'AI Security Automation', icon: '🤖', description: 'AI/ML for automated threat detection and log correlation.' },
    ];
    for (const s of defaultServices) await db.services.create(s);
  }

  if (!(await db.messages.getAll()).length) {
    // No-op: messages table already exists; empty state is valid
  }

  const settings = await db.settings.get();
  if (!settings.siteName) {
    await db.settings.set({
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

  // Seed methodology steps
  if (!(await db.methodology.getAll()).length) {
    const defaultMethodology = [
      { title: 'Detect', description: 'Monitor systems, analyze SIEM alerts, and identify potential security events requiring investigation.', icon: 'search', order: 1, enabled: true },
      { title: 'Analyze', description: 'Investigate alerts, correlate data across sources, and determine threat severity and scope of impact.', icon: 'activity', order: 2, enabled: true },
      { title: 'Contain', description: 'Isolate affected systems, block malicious activity, and prevent lateral movement within the network.', icon: 'shield', order: 3, enabled: true },
      { title: 'Eradicate', description: 'Remove threat artifacts, patch vulnerabilities, and eliminate root cause to prevent reinfection.', icon: 'trash', order: 4, enabled: true },
      { title: 'Recover', description: 'Restore operations, validate system integrity, document lessons learned, and update security controls.', icon: 'refresh', order: 5, enabled: true },
    ];
    for (const m of defaultMethodology) await db.methodology.create(m);
  }

  // Seed tools
  if (!(await db.expertise.getAll()).length) {
    const defaultExpertise = [
      { title: 'SIEM Investigation', description: 'Deep-dive log analysis using Splunk and Chronicle to identify suspicious patterns and security incidents.', icon: 'search', order: 1, enabled: true },
      { title: 'Incident Response', description: 'Alert triage, escalation procedures, and containment strategies following NIST frameworks.', icon: 'alert-triangle', order: 2, enabled: true },
      { title: 'Cloud Security', description: 'Security fundamentals for AWS/Azure/GCP including IAM, network policies, and compliance monitoring.', icon: 'cloud', order: 3, enabled: true },
      { title: 'AI-Driven Security', description: 'Leveraging machine learning for automated threat detection, log correlation, and anomaly identification.', icon: 'monitor', order: 4, enabled: true },
      { title: 'Network Security', description: 'Packet analysis, firewall rules, DNS security, and network traffic monitoring with Wireshark.', icon: 'globe', order: 5, enabled: true },
      { title: 'Secure Development', description: 'Backend development with secure coding practices, strict input validation, and API security hardening.', icon: 'code', order: 6, enabled: true },
    ];
    for (const e of defaultExpertise) await db.expertise.create(e);
  }

  // Seed tools
  if (!(await db.tools.getAll()).length) {
    const defaultTools = [
      { name: 'Splunk', category: 'SIEM', icon: 'search', order: 1, enabled: true },
      { name: 'Chronicle', category: 'Google SIEM', icon: 'eye', order: 2, enabled: true },
      { name: 'Wireshark', category: 'Packet Analysis', icon: 'globe', order: 3, enabled: true },
      { name: 'Python', category: 'Automation', icon: 'code', order: 4, enabled: true },
      { name: '.NET Core', category: 'Secure Dev', icon: 'terminal', order: 5, enabled: true },
      { name: 'Nmap', category: 'Network Scan', icon: 'alert-triangle', order: 6, enabled: true },
      { name: 'Burp Suite', category: 'Web Security', icon: 'shield', order: 7, enabled: true },
      { name: 'Kali Linux', category: 'Pen Testing', icon: 'terminal', order: 8, enabled: true },
      { name: 'Snort', category: 'IDS/IPS', icon: 'activity', order: 9, enabled: true },
      { name: 'AWS / Azure', category: 'Cloud Security', icon: 'cloud', order: 10, enabled: true },
      { name: 'TryHackMe', category: 'Training', icon: 'target', order: 11, enabled: true },
      { name: 'Git', category: 'Version Control', icon: 'code', order: 12, enabled: true },
    ];
    for (const t of defaultTools) await db.tools.create(t);
  }

  // Seed certificates
  if (!(await db.certificates.getAll()).length) {
    const defaultCerts = [
      { title: 'Google Cybersecurity Professional Certificate', issuer: 'Google · Coursera', date: '2025', credentialLink: '#', badgeIcon: 'shield-check', order: 1, enabled: true },
      { title: 'Hands-On Labs & Simulations', issuer: 'Self-Directed Learning', date: '2025', credentialLink: '', badgeIcon: 'terminal', order: 2, enabled: true },
    ];
    for (const c of defaultCerts) await db.certificates.create(c);
  }

  // Initialize customize defaults
  const customize = await db.customize.get();
  if (!customize || !customize.theme) {
    const defaultsPath = path.join(config.paths.data, 'customize.json');
    if (!fs.existsSync(defaultsPath)) {
      await db.customize.set({
        theme: { primaryColor: '#00F5FF', secondaryColor: '#0066FF', accentColor: '#10B981', bgColor: '#0B0F19' },
        hero: { title: 'CYBER COMMAND', subtitle: 'Dhruvkumar Dobariya' },
        animations: { globalSpeed: 1.0, particlesEnabled: true },
      });
    }
  }

  await db.systemState.set(DEFAULT_SEED_KEY, '1');
  logger.info('Default seed completed');
}

// ═══════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/customize', customizeRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/media-blocks', mediaBlockRoutes);
app.use('/api/methodology', methodologyRoutes);
app.use('/api/expertise', expertiseRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check (supports monitoring tools)
app.get('/api/health', (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: config.nodeEnv,
    uptime: Math.floor(process.uptime()),
    requestId: req.requestId,
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024),       // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    },
  });
});

// ═══════════════════════════════════════════
// STATIC FILE SERVING (order: admin → SEO → frontend → catch-all)
// ═══════════════════════════════════════════
const adminDir = path.join(__dirname, '..', 'admin');

// ─── Startup diagnostics (safe, no sensitive data) ───
logger.info('Admin directory resolved', {
  adminDir,
  exists: fs.existsSync(adminDir),
  indexExists: fs.existsSync(path.join(adminDir, 'index.html')),
  jsExists: fs.existsSync(path.join(adminDir, 'admin.js')),
  cssExists: fs.existsSync(path.join(adminDir, 'admin.css')),
});

// Admin static files served below (debug logging removed)

// Serve admin static files
// express.static handles: /admin → 301 /admin/ → serve index.html (redirect: true default)
app.use('/admin', express.static(adminDir, {
  index: 'index.html',
  fallthrough: true,
}));

// Explicit fallback: if express.static didn't find the file, serve admin/index.html for /admin or /admin/
// This prevents the SPA catch-all from intercepting admin routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(adminDir, 'index.html'));
});
app.get('/admin/', (req, res) => {
  res.sendFile(path.join(adminDir, 'index.html'));
});

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
// ERROR HANDLING + CATCH-ALL (Express 4 + 5 safe — must be LAST)
// ═══════════════════════════════════════════
app.use('/api', notFoundHandler);

// SPA catch-all: any unmatched GET serves the main frontend
// Must be AFTER /admin static, AFTER /api routes
// Uses middleware instead of route pattern for Express 4/5 compatibility
app.use((req, res, next) => {
  // Only handle GET requests
  if (req.method !== 'GET') return next();
  // Never override /admin or /api — those are handled above
  if (req.path.startsWith('/admin') || req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(siteDir, 'index.html'), (err) => {
    if (err) {
      logger.error('SPA catch-all sendFile error', { error: err.message, path: req.path });
      next(err);
    }
  });
});

app.use(errorHandler);

// ═══════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════
let server;

function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      try {
        await db.closeDatabase();
      } catch (_) {}
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
async function startServer() {
  try {
    await db.initDatabase();
    await initData();

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
        console.log(`⚠️  Running in development mode — set ADMIN_USERNAME/ADMIN_PASSWORD env vars\n`);
      }
    });
  } catch (err) {
    logger.error('Failed to initialize server', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

startServer();
