/**
 * ═══════════════════════════════════════════════════════════
 * Standardized API Response Helper
 * ═══════════════════════════════════════════════════════════
 * Every API response uses this format for consistency:
 * { success: boolean, data?: any, error?: string, meta?: object }
 */

function success(res, data, statusCode = 200, meta) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

function created(res, data) {
  return success(res, data, 201);
}

function paginated(res, data, { page, limit, total }) {
  return success(res, data, 200, {
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

function error(res, message, statusCode = 400, details) {
  const body = { success: false, error: message };
  if (details) body.details = details;
  return res.status(statusCode).json(body);
}

function notFound(res, resource = 'Resource') {
  return error(res, `${resource} not found`, 404);
}

function unauthorized(res, message = 'Unauthorized') {
  return error(res, message, 401);
}

function forbidden(res, message = 'Forbidden') {
  return error(res, message, 403);
}

function serverError(res, message = 'Internal server error') {
  return error(res, message, 500);
}

module.exports = { success, created, paginated, error, notFound, unauthorized, forbidden, serverError };
