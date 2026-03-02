/**
 * ═══════════════════════════════════════════════════════════
 * DHRUV.SEC — Audit Log System
 * ═══════════════════════════════════════════════════════════
 * Tracks all admin actions for security compliance.
 * Stored in audit_logs.json with rotation support.
 */
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { logger } = require('./logger');

const AUDIT_FILE = path.join(config.paths.data, 'audit_logs.json');
const MAX_LOGS = 10000; // Rotate after 10K entries

/**
 * Action types for audit logging
 */
const AuditAction = {
  // Auth
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILED: 'auth.login.failed',
  LOGIN_LOCKED: 'auth.login.locked',
  LOGOUT: 'auth.logout',
  PASSWORD_CHANGE: 'auth.password.change',
  TOKEN_REFRESH: 'auth.token.refresh',
  TOTP_SETUP: 'auth.totp.setup',
  TOTP_VERIFY: 'auth.totp.verify',
  TOTP_FAILED: 'auth.totp.failed',

  // Projects
  PROJECT_CREATE: 'project.create',
  PROJECT_UPDATE: 'project.update',
  PROJECT_DELETE: 'project.delete',

  // Services
  SERVICE_CREATE: 'service.create',
  SERVICE_UPDATE: 'service.update',
  SERVICE_DELETE: 'service.delete',

  // Messages
  MESSAGE_READ: 'message.read',
  MESSAGE_DELETE: 'message.delete',

  // Settings
  SETTINGS_UPDATE: 'settings.update',
};

/**
 * Read current audit logs
 */
function readAuditLogs() {
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      return JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
    }
  } catch (err) {
    logger.error('Failed to read audit logs', { error: err.message });
  }
  return [];
}

/**
 * Write audit logs with rotation
 */
function writeAuditLogs(logs) {
  try {
    // Rotate: keep only latest MAX_LOGS entries
    const trimmed = logs.slice(-MAX_LOGS);
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (err) {
    logger.error('Failed to write audit logs', { error: err.message });
  }
}

/**
 * Log an audit event
 * @param {Object} params
 * @param {string} params.action - Action type from AuditAction
 * @param {string} [params.adminId] - Admin username
 * @param {string} [params.ip] - Client IP address
 * @param {string} [params.userAgent] - Client user agent
 * @param {string} [params.resourceId] - Affected resource ID
 * @param {string} [params.resourceType] - Type of resource
 * @param {Object} [params.details] - Additional details
 * @param {string} [params.requestId] - Request correlation ID
 */
function logAudit({ action, adminId, ip, userAgent, resourceId, resourceType, details, requestId }) {
  const entry = {
    id: require('crypto').randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    adminId: adminId || 'anonymous',
    ip: ip || 'unknown',
    userAgent: (userAgent || 'unknown').substring(0, 200),
    resourceId: resourceId || null,
    resourceType: resourceType || null,
    details: details || null,
    requestId: requestId || null,
  };

  const logs = readAuditLogs();
  logs.push(entry);
  writeAuditLogs(logs);

  // Also log to structured logger
  logger.info(`AUDIT: ${action}`, {
    adminId: entry.adminId,
    ip: entry.ip,
    resourceId: entry.resourceId,
    requestId: entry.requestId,
  });

  return entry;
}

/**
 * Helper to extract audit metadata from Express request
 */
function getAuditMeta(req) {
  return {
    adminId: req.user?.username || 'anonymous',
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    requestId: req.requestId,
  };
}

module.exports = { AuditAction, logAudit, getAuditMeta, readAuditLogs };
