/**
 * ═══════════════════════════════════════════════════════════
 * DHRUV.SEC — Auth Routes
 * ═══════════════════════════════════════════════════════════
 * Login, refresh, logout, change password, 2FA setup/verify.
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { OTPAuth } = require('otpauth');
const QRCode = require('qrcode');
const router = express.Router();

const config = require('../lib/config');
const db = require('../lib/dataLayer');
const { logger } = require('../lib/logger');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { encrypt, decrypt } = require('../lib/encryption');
const { isEnabled } = require('../lib/featureFlags');
const { validate, loginSchema, changePasswordSchema, totpVerifySchema } = require('../lib/validators');
const { ApiError, asyncHandler } = require('../lib/errorHandler');
const {
  authenticate,
  isLockedOut,
  recordFailedLogin,
  clearLoginAttempts,
  generateAccessToken,
  generateRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} = require('../lib/auth');

// ═══════════════════════════════════════════
// POST /api/auth/login
// ═══════════════════════════════════════════
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { username, password } = req.validatedBody;
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const meta = getAuditMeta(req);

  // Check brute force lockout
  if (isLockedOut(ip, username)) {
    logAudit({ ...meta, action: AuditAction.LOGIN_LOCKED, details: { username } });
    throw new ApiError(429, `Account temporarily locked. Try again in ${config.bruteForce.lockoutMinutes} minutes.`);
  }

  const admin = db.admin.get();
  if (!admin || admin.username !== username) {
    recordFailedLogin(ip, username);
    logAudit({ ...meta, action: AuditAction.LOGIN_FAILED, details: { username, reason: 'invalid_username' } });
    throw new ApiError(401, 'Invalid credentials');
  }

  const validPassword = await bcrypt.compare(password, admin.passwordHash);
  if (!validPassword) {
    recordFailedLogin(ip, username);
    logAudit({ ...meta, action: AuditAction.LOGIN_FAILED, details: { username, reason: 'invalid_password' } });
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check if 2FA is enabled
  if (admin.totpSecret && isEnabled('two_factor_auth')) {
    // Return partial auth — client must verify TOTP next
    const tempToken = generateAccessToken({ username: admin.username, role: admin.role || 'admin', pending2FA: true });
    return res.json({
      requires2FA: true,
      tempToken,
      message: 'Please provide your 2FA code',
    });
  }

  // No 2FA — issue full tokens
  clearLoginAttempts(ip, username);
  const accessToken = generateAccessToken({ username: admin.username, role: admin.role || 'admin' });
  const { token: refreshToken } = generateRefreshToken(admin.username);

  setTokenCookies(res, accessToken, refreshToken);
  logAudit({ ...meta, adminId: admin.username, action: AuditAction.LOGIN_SUCCESS });

  res.json({
    token: accessToken,          // For backward compatibility with admin.js
    refreshToken,                 // For token rotation
    username: admin.username,
    role: admin.role || 'admin',
    expiresIn: 900,              // 15 minutes
  });
}));

// ═══════════════════════════════════════════
// POST /api/auth/verify-2fa
// ═══════════════════════════════════════════
router.post('/verify-2fa', validate(totpVerifySchema), asyncHandler(async (req, res) => {
  const { token: totpCode } = req.validatedBody;
  const meta = getAuditMeta(req);

  // Get temp token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Temporary auth token required');
  }

  let decoded;
  try {
    const jwt = require('jsonwebtoken');
    decoded = jwt.verify(authHeader.split(' ')[1], config.jwt.secret, { issuer: 'dhruv.sec' });
  } catch {
    throw new ApiError(401, 'Invalid or expired temporary token');
  }

  const admin = db.admin.get();
  if (!admin || !admin.totpSecret) {
    throw new ApiError(400, '2FA is not configured');
  }

  // Verify TOTP
  const decryptedSecret = decrypt(admin.totpSecret);
  let totp;
  try {
    totp = new OTPAuth.TOTP({
      issuer: config.totp.issuer,
      label: admin.username,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(decryptedSecret),
    });
  } catch {
    // Fallback: try using secret directly
    totp = new OTPAuth.TOTP({
      issuer: config.totp.issuer,
      label: admin.username,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: decryptedSecret,
    });
  }

  const delta = totp.validate({ token: totpCode, window: 1 });
  if (delta === null) {
    logAudit({ ...meta, adminId: decoded.username, action: AuditAction.TOTP_FAILED });
    throw new ApiError(401, 'Invalid 2FA code');
  }

  // 2FA valid — issue full tokens
  const ip = req.ip || 'unknown';
  clearLoginAttempts(ip, decoded.username);
  const accessToken = generateAccessToken({ username: decoded.username, role: decoded.role || 'admin' });
  const { token: refreshToken } = generateRefreshToken(decoded.username);

  setTokenCookies(res, accessToken, refreshToken);
  logAudit({ ...meta, adminId: decoded.username, action: AuditAction.TOTP_VERIFY });

  res.json({
    token: accessToken,
    refreshToken,
    username: decoded.username,
    role: decoded.role || 'admin',
    expiresIn: 900,
  });
}));

// ═══════════════════════════════════════════
// POST /api/auth/setup-2fa
// ═══════════════════════════════════════════
router.post('/setup-2fa', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const admin = db.admin.get();

  // Generate new TOTP secret
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: config.totp.issuer,
    label: admin.username,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  const otpauthUrl = totp.toString();

  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  // Store encrypted secret (not yet activated — needs verification)
  admin._pendingTotpSecret = encrypt(secret.base32);
  db.admin.set(admin);

  logAudit({ ...meta, action: AuditAction.TOTP_SETUP, details: { status: 'pending' } });

  res.json({
    qrCode: qrCodeDataUrl,
    secret: secret.base32, // Show to user for manual entry
    message: 'Scan the QR code with Google Authenticator, then verify with a code',
  });
}));

// ═══════════════════════════════════════════
// POST /api/auth/confirm-2fa
// ═══════════════════════════════════════════
router.post('/confirm-2fa', authenticate, validate(totpVerifySchema), asyncHandler(async (req, res) => {
  const { token: totpCode } = req.validatedBody;
  const meta = getAuditMeta(req);
  const admin = db.admin.get();

  if (!admin._pendingTotpSecret) {
    throw new ApiError(400, 'No pending 2FA setup. Call /setup-2fa first.');
  }

  const decryptedSecret = decrypt(admin._pendingTotpSecret);
  const totp = new OTPAuth.TOTP({
    issuer: config.totp.issuer,
    label: admin.username,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(decryptedSecret),
  });

  const delta = totp.validate({ token: totpCode, window: 1 });
  if (delta === null) {
    throw new ApiError(401, 'Invalid verification code. 2FA not activated.');
  }

  // Activate 2FA
  admin.totpSecret = admin._pendingTotpSecret;
  delete admin._pendingTotpSecret;
  db.admin.set(admin);

  logAudit({ ...meta, action: AuditAction.TOTP_SETUP, details: { status: 'activated' } });

  res.json({ message: '2FA activated successfully', enabled: true });
}));

// ═══════════════════════════════════════════
// POST /api/auth/disable-2fa
// ═══════════════════════════════════════════
router.post('/disable-2fa', authenticate, validate(totpVerifySchema), asyncHandler(async (req, res) => {
  const { token: totpCode } = req.validatedBody;
  const meta = getAuditMeta(req);
  const admin = db.admin.get();

  if (!admin.totpSecret) {
    throw new ApiError(400, '2FA is not enabled');
  }

  // Verify code before disabling
  const decryptedSecret = decrypt(admin.totpSecret);
  const totp = new OTPAuth.TOTP({
    issuer: config.totp.issuer,
    label: admin.username,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(decryptedSecret),
  });

  const delta = totp.validate({ token: totpCode, window: 1 });
  if (delta === null) {
    throw new ApiError(401, 'Invalid 2FA code. Cannot disable.');
  }

  delete admin.totpSecret;
  delete admin._pendingTotpSecret;
  db.admin.set(admin);

  logAudit({ ...meta, action: AuditAction.TOTP_SETUP, details: { status: 'disabled' } });

  res.json({ message: '2FA disabled successfully', enabled: false });
}));

// ═══════════════════════════════════════════
// POST /api/auth/refresh
// ═══════════════════════════════════════════
router.post('/refresh', asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
  if (!oldRefreshToken) {
    throw new ApiError(401, 'Refresh token required');
  }

  const meta = getAuditMeta(req);

  // Rotate token
  // We need to decode the access token (even if expired) to get the username
  let username;
  try {
    const jwt = require('jsonwebtoken');
    const accessToken = req.cookies?.access_token || req.headers.authorization?.split(' ')[1];
    if (accessToken) {
      const decoded = jwt.decode(accessToken);
      username = decoded?.username;
    }
  } catch {}

  if (!username) {
    // Try to get username from refresh token store
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
    // We can't directly access the store, but rotateRefreshToken handles it
    throw new ApiError(401, 'Unable to identify user for token refresh');
  }

  const newRefreshToken = rotateRefreshToken(oldRefreshToken, username);
  if (!newRefreshToken) {
    clearTokenCookies(res);
    throw new ApiError(401, 'Invalid refresh token — possible token reuse detected');
  }

  const admin = db.admin.get();
  const accessToken = generateAccessToken({ username, role: admin.role || 'admin' });

  setTokenCookies(res, accessToken, newRefreshToken);
  logAudit({ ...meta, adminId: username, action: AuditAction.TOKEN_REFRESH });

  res.json({
    token: accessToken,
    refreshToken: newRefreshToken,
    expiresIn: 900,
  });
}));

// ═══════════════════════════════════════════
// POST /api/auth/logout
// ═══════════════════════════════════════════
router.post('/logout', (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (refreshToken) revokeRefreshToken(refreshToken);
  clearTokenCookies(res);
  res.json({ message: 'Logged out successfully' });
});

// ═══════════════════════════════════════════
// POST /api/auth/change-password
// ═══════════════════════════════════════════
router.post('/change-password', authenticate, validate(changePasswordSchema), asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validatedBody;
  const meta = getAuditMeta(req);

  const admin = db.admin.get();
  const validPassword = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!validPassword) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  db.admin.set(admin);

  logAudit({ ...meta, action: AuditAction.PASSWORD_CHANGE });

  res.json({ message: 'Password changed successfully' });
}));

// ═══════════════════════════════════════════
// GET /api/auth/me
// ═══════════════════════════════════════════
router.get('/me', authenticate, (req, res) => {
  const admin = db.admin.get();
  res.json({
    username: admin.username,
    email: decrypt(admin.email || admin.email),
    role: admin.role || 'admin',
    has2FA: !!admin.totpSecret,
    tenantId: admin.tenantId || 'default',
  });
});

module.exports = router;
