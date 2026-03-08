/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Production Configuration Module
 * ═══════════════════════════════════════════════════════════
 * Centralized, environment-aware configuration.
 * All secrets sourced from environment variables.
 */
const crypto = require('crypto');
const path = require('path');

// Load .env in development
try { require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); } catch {}

const isProduction = process.env.NODE_ENV === 'production';

// Collect ALL missing vars before exiting — so one deploy attempt shows every problem
const _missingEnvVars = [];

function requireEnvInProd(key, fallback) {
  const val = process.env[key];
  if (!val && isProduction) {
    if (!fallback) {
      _missingEnvVars.push(key);
      return undefined; // Collected — will exit after all checks
    }
    console.warn(`[WARN] ${key} not set in production — using fallback. Set this properly!`);
  }
  return val || fallback;
}

const config = {
  // Server
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,

  // JWT — secrets MUST be set in production (no fallback)
  jwt: {
    secret: requireEnvInProd('JWT_SECRET', isProduction ? undefined : crypto.randomBytes(64).toString('hex')),
    refreshSecret: requireEnvInProd('JWT_REFRESH_SECRET', isProduction ? undefined : crypto.randomBytes(64).toString('hex')),
    expiry: process.env.JWT_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // Encryption (AES-256-GCM)
  encryption: {
    key: requireEnvInProd('ENCRYPTION_KEY', crypto.randomBytes(32).toString('hex')),
    algorithm: 'aes-256-gcm',
  },

  // CORS — production excludes localhost
  cors: {
    origins: isProduction
      ? (process.env.ALLOWED_ORIGINS || 'https://dhruvkumar.tech').split(',').map(s => s.trim())
      : ['http://localhost:3000', 'http://localhost:4200', 'http://127.0.0.1:3000', 'http://localhost:4000'],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '20', 10),
  },

  // Brute Force Protection
  bruteForce: {
    maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '10', 10),
    lockoutMinutes: parseInt(process.env.LOGIN_LOCKOUT_MINUTES || '15', 10),
  },

  // 2FA
  totp: {
    issuer: process.env.TOTP_ISSUER || 'Dhruvkumar Dobariya Admin',
  },

  // Paths
  paths: {
    data: path.join(__dirname, '..', 'data'),
    admin: path.join(__dirname, '..', '..', 'admin'),
    site: path.join(__dirname, '..', '..', 'new   website'),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Warn if using auto-generated secrets in production
if (isProduction && !process.env.JWT_SECRET) {
  console.warn('[WARN] JWT_SECRET not set — using random key (tokens will invalidate on restart)');
}

// Exit with ALL missing vars listed at once (saves repeated deploy attempts)
if (_missingEnvVars.length > 0) {
  console.error('\n══════════════════════════════════════════════════');
  console.error('[FATAL] Missing required environment variables:');
  _missingEnvVars.forEach(v => console.error(`  • ${v}`));
  console.error('\nSet these in your hosting platform (Render → Environment tab).');
  console.error('Generate secrets with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  console.error('══════════════════════════════════════════════════\n');
  process.exit(1);
}

module.exports = config;
