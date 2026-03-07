/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Auth Routes
 * ═══════════════════════════════════════════════════════════
 * Login, refresh, logout, change password, 2FA setup/verify.
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OTPAuth } = require('otpauth');
const QRCode = require('qrcode');
const router = express.Router();

const config = require('../lib/config');
const db = require('../lib/dataLayer');
const { logger } = require('../lib/logger');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { encrypt, decrypt } = require('../lib/encryption');
const { isEnabled } = require('../lib/featureFlags');
const { validate, loginSchema, changePasswordSchema, totpVerifySchema, forgotPasswordSchema, resetPasswordSchema } = require('../lib/validators');
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

  const admin = await db.admin.get();
  if (!admin || admin.username !== username) {
    logAudit({ ...meta, action: AuditAction.LOGIN_FAILED, details: { username, reason: 'invalid_username' } });
    throw new ApiError(401, 'Invalid credentials');
  }

  const validPassword = await bcrypt.compare(password, admin.passwordHash);
  if (!validPassword) {
    logAudit({ ...meta, action: AuditAction.LOGIN_FAILED, details: { username, reason: 'invalid_password' } });
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check if 2FA is enabled
  if (admin.totpSecret && await isEnabled('two_factor_auth')) {
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
    decoded = jwt.verify(authHeader.split(' ')[1], config.jwt.secret, { issuer: 'dhruvkumar.tech' });
  } catch {
    throw new ApiError(401, 'Invalid or expired temporary token');
  }

  const admin = await db.admin.get();
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
  const admin = await db.admin.get();

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
  await db.admin.set(admin);

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
  const admin = await db.admin.get();

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
  await db.admin.set(admin);

  logAudit({ ...meta, action: AuditAction.TOTP_SETUP, details: { status: 'activated' } });

  res.json({ message: '2FA activated successfully', enabled: true });
}));

// ═══════════════════════════════════════════
// POST /api/auth/disable-2fa
// ═══════════════════════════════════════════
router.post('/disable-2fa', authenticate, validate(totpVerifySchema), asyncHandler(async (req, res) => {
  const { token: totpCode } = req.validatedBody;
  const meta = getAuditMeta(req);
  const admin = await db.admin.get();

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
  await db.admin.set(admin);

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

  const admin = await db.admin.get();
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

  const admin = await db.admin.get();
  const validPassword = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!validPassword) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  await db.admin.set(admin);

  logAudit({ ...meta, action: AuditAction.PASSWORD_CHANGE });

  res.json({ message: 'Password changed successfully' });
}));

// ═══════════════════════════════════════════
// GET /api/auth/me
// ═══════════════════════════════════════════
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const admin = await db.admin.get();
  res.json({
    username: admin.username,
    email: decrypt(admin.email || admin.email),
    role: admin.role || 'admin',
    has2FA: !!admin.totpSecret,
    tenantId: admin.tenantId || 'default',
  });
}));

// ═══════════════════════════════════════════
// PASSWORD RESET — In-memory token store
// ═══════════════════════════════════════════
const resetTokens = new Map(); // tokenHash -> { username, expiresAt }
const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

function cleanExpiredResetTokens() {
  const now = Date.now();
  for (const [hash, record] of resetTokens.entries()) {
    if (now > record.expiresAt) resetTokens.delete(hash);
  }
}

// ═══════════════════════════════════════════
// POST /api/auth/forgot-password
// ═══════════════════════════════════════════
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(async (req, res) => {
  const { email } = req.validatedBody;
  const meta = getAuditMeta(req);

  cleanExpiredResetTokens();

  const admin = await db.admin.get();
  const storedEmail = (decrypt(admin.email) || admin.email || '').toLowerCase().trim();

  // Always return success to prevent email enumeration
  if (storedEmail !== email.toLowerCase().trim()) {
    logAudit({ ...meta, action: AuditAction.PASSWORD_CHANGE, details: { reason: 'forgot_password_wrong_email', email } });
    return res.json({ message: 'If an account with that email exists, a reset code has been generated. Check the server console.' });
  }

  // Generate secure reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Store hashed token
  resetTokens.set(tokenHash, {
    username: admin.username,
    expiresAt: Date.now() + RESET_TOKEN_EXPIRY_MS,
  });

  // Log the token to server console (no email service in this setup)
  logger.info('=== PASSWORD RESET TOKEN ===');
  logger.info(`Reset token for ${admin.username}: ${resetToken}`);
  logger.info(`Expires in 15 minutes. Use this token in the Reset Password form.`);
  logger.info('============================');

  logAudit({ ...meta, action: AuditAction.PASSWORD_CHANGE, details: { reason: 'forgot_password_requested', username: admin.username } });

  res.json({
    message: 'If an account with that email exists, a reset code has been generated. Check the server console.',
    // In development, return the token directly for convenience
    ...(process.env.NODE_ENV !== 'production' && { resetToken }),
  });
}));

// ═══════════════════════════════════════════
// POST /api/auth/reset-password
// ═══════════════════════════════════════════
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(async (req, res) => {
  const { token, newPassword } = req.validatedBody;
  const meta = getAuditMeta(req);

  cleanExpiredResetTokens();

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const record = resetTokens.get(tokenHash);

  if (!record) {
    logAudit({ ...meta, action: AuditAction.PASSWORD_CHANGE, details: { reason: 'reset_invalid_token' } });
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  if (Date.now() > record.expiresAt) {
    resetTokens.delete(tokenHash);
    throw new ApiError(400, 'Reset token has expired. Please request a new one.');
  }

  // Reset the password
  const admin = await db.admin.get();
  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  await db.admin.set(admin);

  // Invalidate the used token
  resetTokens.delete(tokenHash);

  logAudit({ ...meta, action: AuditAction.PASSWORD_CHANGE, details: { reason: 'password_reset_completed', username: record.username } });
  logger.info('Password reset successfully', { username: record.username });

  res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
}));

module.exports = router;
