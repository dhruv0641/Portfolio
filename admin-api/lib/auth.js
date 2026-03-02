/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Authentication & Security Middleware
 * ═══════════════════════════════════════════════════════════
 * JWT access + refresh tokens, HTTP-only cookies,
 * brute-force protection, 2FA (TOTP), role-based access.
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('./config');
const db = require('./dataLayer');
const { logger } = require('./logger');
const { logAudit, AuditAction, getAuditMeta } = require('./audit');
const { encrypt, decrypt } = require('./encryption');

// ═══════════════════════════════════════════
// BRUTE FORCE PROTECTION (in-memory store)
// ═══════════════════════════════════════════
const loginAttempts = new Map(); // key: ip+username -> { count, lockedUntil }

function getBruteForceKey(ip, username) {
  return `${ip}:${username}`;
}

function isLockedOut(ip, username) {
  const key = getBruteForceKey(ip, username);
  const record = loginAttempts.get(key);
  if (!record) return false;
  if (record.lockedUntil && Date.now() < record.lockedUntil) return true;
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    loginAttempts.delete(key); // Lockout expired
    return false;
  }
  return false;
}

function recordFailedLogin(ip, username) {
  const key = getBruteForceKey(ip, username);
  const record = loginAttempts.get(key) || { count: 0, lockedUntil: null };
  record.count += 1;
  if (record.count >= config.bruteForce.maxAttempts) {
    record.lockedUntil = Date.now() + config.bruteForce.lockoutMinutes * 60 * 1000;
    logger.warn('Account locked due to brute force', { ip, username, lockoutMinutes: config.bruteForce.lockoutMinutes });
  }
  loginAttempts.set(key, record);
  return record;
}

function clearLoginAttempts(ip, username) {
  loginAttempts.delete(getBruteForceKey(ip, username));
}

// ═══════════════════════════════════════════
// REFRESH TOKEN STORE (in-memory, rotatable)
// ═══════════════════════════════════════════
const refreshTokens = new Map(); // tokenHash -> { username, family, createdAt }

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ═══════════════════════════════════════════
// TOKEN GENERATION
// ═══════════════════════════════════════════
function generateAccessToken(user) {
  return jwt.sign(
    { username: user.username, role: user.role || 'admin', tenantId: user.tenantId || 'default' },
    config.jwt.secret,
    { expiresIn: config.jwt.expiry, issuer: 'dhruvkumar.tech' }
  );
}

function generateRefreshToken(username) {
  const token = crypto.randomBytes(64).toString('hex');
  const family = crypto.randomUUID(); // Token family for rotation detection
  const tokenHash = hashToken(token);
  refreshTokens.set(tokenHash, {
    username,
    family,
    createdAt: Date.now(),
  });
  return { token, family };
}

function rotateRefreshToken(oldToken, username) {
  const oldHash = hashToken(oldToken);
  const oldRecord = refreshTokens.get(oldHash);

  if (!oldRecord) {
    // Possible token reuse attack — invalidate entire family
    logger.warn('Refresh token reuse detected, invalidating family', { username });
    // Invalidate all tokens for this user
    for (const [hash, record] of refreshTokens.entries()) {
      if (record.username === username) refreshTokens.delete(hash);
    }
    return null;
  }

  // Delete old token
  refreshTokens.delete(oldHash);

  // Issue new token in same family
  const newToken = crypto.randomBytes(64).toString('hex');
  const newHash = hashToken(newToken);
  refreshTokens.set(newHash, {
    username,
    family: oldRecord.family,
    createdAt: Date.now(),
  });

  return newToken;
}

function revokeRefreshToken(token) {
  refreshTokens.delete(hashToken(token));
}

// ═══════════════════════════════════════════
// COOKIE HELPERS
// ═══════════════════════════════════════════
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict',
  path: '/',
};

function setTokenCookies(res, accessToken, refreshToken) {
  res.cookie('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth', // Restrict refresh token path
  });
}

function clearTokenCookies(res) {
  res.clearCookie('access_token', COOKIE_OPTIONS);
  res.clearCookie('refresh_token', { ...COOKIE_OPTIONS, path: '/api/auth' });
}

// ═══════════════════════════════════════════
// AUTHENTICATION MIDDLEWARE
// ═══════════════════════════════════════════
function authenticate(req, res, next) {
  // Try cookie first, then Authorization header (backward compat)
  let token = req.cookies?.access_token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret, { issuer: 'dhruvkumar.tech' });
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ═══════════════════════════════════════════
// ROLE-BASED ACCESS CONTROL
// ═══════════════════════════════════════════
const ROLE_HIERARCHY = { 'super_admin': 3, 'admin': 2, 'editor': 1 };

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const userRole = req.user.role || 'editor';
    if (allowedRoles.includes(userRole) || ROLE_HIERARCHY[userRole] >= Math.max(...allowedRoles.map(r => ROLE_HIERARCHY[r] || 0))) {
      return next();
    }
    return res.status(403).json({ error: 'Insufficient permissions' });
  };
}

// ═══════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════
module.exports = {
  // Brute force
  isLockedOut,
  recordFailedLogin,
  clearLoginAttempts,
  // Tokens
  generateAccessToken,
  generateRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  // Cookies
  setTokenCookies,
  clearTokenCookies,
  // Middleware
  authenticate,
  requireRole,
  // Constants
  ROLE_HIERARCHY,
};
