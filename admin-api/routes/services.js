/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Services Routes
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
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenantId || null;
  const visibleOnly = req.query.visible === 'true';
  const all = await db.services.getAll(tenantId);
  const filtered = visibleOnly ? all.filter((s) => s.enabled !== false) : all;
  filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(filtered);
}));

// POST /api/services — Auth required
router.post('/', authenticate, validate(serviceCreateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const tenantId = req.user.tenantId || 'default';
  const newService = await db.services.create(req.validatedBody, tenantId);

  logAudit({ ...meta, action: AuditAction.SERVICE_CREATE, resourceId: newService.id, resourceType: 'service' });
  res.status(201).json(newService);
}));

// PUT /api/services/:id — Auth required
router.put('/:id', authenticate, validate(serviceUpdateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const updated = await db.services.update(req.params.id, req.validatedBody);
  if (!updated) throw new ApiError(404, 'Service not found');

  logAudit({ ...meta, action: AuditAction.SERVICE_UPDATE, resourceId: req.params.id, resourceType: 'service' });
  res.json(updated);
}));

// PUT /api/services — Bulk reorder
router.put('/', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const items = req.body;
  if (!Array.isArray(items)) throw new ApiError(400, 'Expected an array of items with id and order');

  for (const { id, order } of items) {
    if (id && typeof order === 'number') {
      await db.services.update(id, { order });
    }
  }

  logAudit({ ...meta, action: AuditAction.SERVICE_REORDER, resourceType: 'service' });
  res.json({ message: 'Order updated' });
}));

// PATCH /api/services/:id/visibility — Auth required
router.patch('/:id/visibility', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const enabled = req.body && req.body.enabled;
  if (typeof enabled !== 'boolean') throw new ApiError(400, 'enabled must be boolean');
  const updated = await db.services.update(req.params.id, { enabled });
  if (!updated) throw new ApiError(404, 'Service not found');

  logAudit({ ...meta, action: AuditAction.SERVICE_UPDATE, resourceId: req.params.id, resourceType: 'service', details: { enabled } });
  res.json(updated);
}));

// DELETE /api/services/:id — Auth required
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const deleted = await db.services.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Service not found');

  logAudit({ ...meta, action: AuditAction.SERVICE_DELETE, resourceId: req.params.id, resourceType: 'service' });
  res.json({ message: 'Service deleted' });
}));

module.exports = router;
