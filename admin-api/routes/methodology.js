/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Methodology Routes
 * ═══════════════════════════════════════════════════════════
 */
const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, methodologyCreateSchema, methodologyUpdateSchema } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler, ApiError } = require('../lib/errorHandler');

// GET /api/methodology — Public (returns enabled items sorted by order)
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenantId || null;
  const all = await db.methodology.getAll(tenantId);
  const sorted = all.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(sorted);
}));

// GET /api/methodology/:id — Public
router.get('/:id', asyncHandler(async (req, res) => {
  const item = await db.methodology.getById(req.params.id);
  if (!item) throw new ApiError(404, 'Methodology step not found');
  res.json(item);
}));

// POST /api/methodology — Auth required
router.post('/', authenticate, validate(methodologyCreateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const tenantId = req.user.tenantId || 'default';
  const newItem = await db.methodology.create(req.validatedBody, tenantId);

  logAudit({ ...meta, action: AuditAction.METHODOLOGY_CREATE, resourceId: newItem.id, resourceType: 'methodology' });
  res.status(201).json(newItem);
}));

// PUT /api/methodology/:id — Auth required
router.put('/:id', authenticate, validate(methodologyUpdateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const updated = await db.methodology.update(req.params.id, req.validatedBody);
  if (!updated) throw new ApiError(404, 'Methodology step not found');

  logAudit({ ...meta, action: AuditAction.METHODOLOGY_UPDATE, resourceId: req.params.id, resourceType: 'methodology' });
  res.json(updated);
}));

// PUT /api/methodology — Bulk reorder
router.put('/', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const items = req.body;
  if (!Array.isArray(items)) throw new ApiError(400, 'Expected an array of items with id and order');

  for (const { id, order } of items) {
    if (id && typeof order === 'number') {
      await db.methodology.update(id, { order });
    }
  }

  logAudit({ ...meta, action: AuditAction.METHODOLOGY_REORDER, resourceType: 'methodology' });
  res.json({ message: 'Order updated' });
}));

// DELETE /api/methodology/:id — Auth required
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const deleted = await db.methodology.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Methodology step not found');

  logAudit({ ...meta, action: AuditAction.METHODOLOGY_DELETE, resourceId: req.params.id, resourceType: 'methodology' });
  res.json({ message: 'Methodology step deleted' });
}));

module.exports = router;
