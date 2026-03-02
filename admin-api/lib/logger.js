/**
 * ═══════════════════════════════════════════════════════════
 * DHRUV.SEC — Structured Logger with Request ID Tracking
 * ═══════════════════════════════════════════════════════════
 * Production-grade structured logging.
 * Each request gets a unique ID for traceability.
 */
const crypto = require('crypto');
const config = require('./config');

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LOG_LEVELS[config.logLevel] ?? LOG_LEVELS.info;

function formatLog(level, message, meta = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  });
}

const logger = {
  error(msg, meta) { if (currentLevel >= LOG_LEVELS.error) console.error(formatLog('ERROR', msg, meta)); },
  warn(msg, meta) { if (currentLevel >= LOG_LEVELS.warn) console.warn(formatLog('WARN', msg, meta)); },
  info(msg, meta) { if (currentLevel >= LOG_LEVELS.info) console.log(formatLog('INFO', msg, meta)); },
  debug(msg, meta) { if (currentLevel >= LOG_LEVELS.debug) console.log(formatLog('DEBUG', msg, meta)); },
};

/**
 * Express middleware — attaches a unique requestId to each request
 */
function requestIdMiddleware(req, res, next) {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
}

/**
 * Express middleware — logs each request with timing
 */
function requestLoggerMiddleware(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const meta = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent']?.substring(0, 100),
    };
    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', meta);
    } else {
      logger.info('Request completed', meta);
    }
  });
  next();
}

module.exports = { logger, requestIdMiddleware, requestLoggerMiddleware };
