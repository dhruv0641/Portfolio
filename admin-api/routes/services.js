/**
 * ═══════════════════════════════════════════════════════════
 * DHRUV.SEC — Services Routes
 * ═══════════════════════════════════════════════════════════
 */
const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, serviceCreateSchema, serviceUpdateSchema } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler, ApiError } = require('../lib/errorHandler');

// GET /api/services — Public
router.get('/', (req, res) => {
  const tenantId = req.query.tenantId || null;
  res.json(db.services.getAll(tenantId));
});

// POST /api/services — Auth required
router.post('/', authenticate, validate(serviceCreateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const tenantId = req.user.tenantId || 'default';
  const newService = db.services.create(req.validatedBody, tenantId);

  logAudit({ ...meta, action: AuditAction.SERVICE_CREATE, resourceId: newService.id, resourceType: 'service' });
  res.status(201).json(newService);
}));

// PUT /api/services/:id — Auth required
router.put('/:id', authenticate, validate(serviceUpdateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const updated = db.services.update(req.params.id, req.validatedBody);
  if (!updated) throw new ApiError(404, 'Service not found');

  logAudit({ ...meta, action: AuditAction.SERVICE_UPDATE, resourceId: req.params.id, resourceType: 'service' });
  res.json(updated);
}));

// DELETE /api/services/:id — Auth required
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const deleted = db.services.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Service not found');

  logAudit({ ...meta, action: AuditAction.SERVICE_DELETE, resourceId: req.params.id, resourceType: 'service' });
  res.json({ message: 'Service deleted' });
}));

module.exports = router;
