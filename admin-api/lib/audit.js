/**
 * Audit Log System backed by SQLite.
 */
const crypto = require('crypto');
const db = require('./dataLayer');
const { logger } = require('./logger');

const AuditAction = {
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILED: 'auth.login.failed',
  LOGIN_LOCKED: 'auth.login.locked',
  LOGOUT: 'auth.logout',
  PASSWORD_CHANGE: 'auth.password.change',
  TOKEN_REFRESH: 'auth.token.refresh',
  TOTP_SETUP: 'auth.totp.setup',
  TOTP_VERIFY: 'auth.totp.verify',
  TOTP_FAILED: 'auth.totp.failed',

  PROJECT_CREATE: 'project.create',
  PROJECT_UPDATE: 'project.update',
  PROJECT_DELETE: 'project.delete',
  PROJECT_REORDER: 'project.reorder',

  SERVICE_CREATE: 'service.create',
  SERVICE_UPDATE: 'service.update',
  SERVICE_DELETE: 'service.delete',
  SERVICE_REORDER: 'service.reorder',

  MESSAGE_READ: 'message.read',
  MESSAGE_DELETE: 'message.delete',

  SETTINGS_UPDATE: 'settings.update',

  METHODOLOGY_CREATE: 'methodology.create',
  METHODOLOGY_UPDATE: 'methodology.update',
  METHODOLOGY_DELETE: 'methodology.delete',
  METHODOLOGY_REORDER: 'methodology.reorder',

  EXPERTISE_CREATE: 'expertise.create',
  EXPERTISE_UPDATE: 'expertise.update',
  EXPERTISE_DELETE: 'expertise.delete',
  EXPERTISE_REORDER: 'expertise.reorder',

  TOOL_CREATE: 'tool.create',
  TOOL_UPDATE: 'tool.update',
  TOOL_DELETE: 'tool.delete',
  TOOL_REORDER: 'tool.reorder',

  CERTIFICATE_CREATE: 'certificate.create',
  CERTIFICATE_UPDATE: 'certificate.update',
  CERTIFICATE_DELETE: 'certificate.delete',
  CERTIFICATE_REORDER: 'certificate.reorder',

  QUOTE_CREATE: 'quote.create',
  QUOTE_UPDATE: 'quote.update',
  QUOTE_DELETE: 'quote.delete',
  QUOTE_REORDER: 'quote.reorder',

  STAT_CREATE: 'stat.create',
  STAT_UPDATE: 'stat.update',
  STAT_DELETE: 'stat.delete',
  STAT_REORDER: 'stat.reorder',

  MEDIA_BLOCK_CREATE: 'media_block.create',
  MEDIA_BLOCK_UPDATE: 'media_block.update',
  MEDIA_BLOCK_DELETE: 'media_block.delete',
  MEDIA_BLOCK_REORDER: 'media_block.reorder',
};

async function readAuditLogs() {
  try {
    return await db.auditLogs.getAll();
  } catch (err) {
    logger.error('Failed to read audit logs', { error: err.message });
    return [];
  }
}

function logAudit({ action, adminId, ip, userAgent, resourceId, resourceType, details, requestId }) {
  const entry = {
    id: crypto.randomUUID(),
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

  db.auditLogs.create(entry).catch((err) => {
    logger.error('Failed to persist audit log', { error: err.message, action: entry.action });
  });

  logger.info(`AUDIT: ${action}`, {
    adminId: entry.adminId,
    ip: entry.ip,
    resourceId: entry.resourceId,
    requestId: entry.requestId,
  });

  return entry;
}

function getAuditMeta(req) {
  return {
    adminId: req.user?.username || 'anonymous',
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    requestId: req.requestId,
  };
}

module.exports = { AuditAction, logAudit, getAuditMeta, readAuditLogs };
