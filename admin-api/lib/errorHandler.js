/**
 * ═══════════════════════════════════════════════════════════
 * DHRUV.SEC — Centralized Error Handler
 * ═══════════════════════════════════════════════════════════
 * Production-grade error handling middleware.
 * Catches all unhandled errors and returns clean responses.
 */
const { logger } = require('./logger');
const config = require('./config');

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

/**
 * Not Found handler (404)
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
  });
}

/**
 * Global error handler middleware
 * Must have 4 parameters for Express to recognize it as error handler
 */
function errorHandler(err, req, res, _next) {
  // Log the error
  const meta = {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    stack: config.isProduction ? undefined : err.stack,
  };

  if (err.isOperational) {
    logger.warn('Operational error', { ...meta, error: err.message });
  } else {
    logger.error('Unhandled error', { ...meta, error: err.message, stack: err.stack });
  }

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Build response
  const response = {
    error: err.isOperational ? err.message : 'Internal Server Error',
    requestId: req.requestId,
  };

  // Include details in development
  if (!config.isProduction) {
    response.stack = err.stack;
    if (err.details) response.details = err.details;
  }

  res.status(statusCode).json(response);
}

/**
 * Async route wrapper — catches async errors automatically
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { ApiError, notFoundHandler, errorHandler, asyncHandler };
