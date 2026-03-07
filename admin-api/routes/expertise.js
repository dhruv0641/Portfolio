/**
 * Dhruvkumar Dobariya — Expertise Routes
 */
const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, expertiseCreateSchema, expertiseUpdateSchema } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler, ApiError } = require('../lib/errorHandler');

// GET /api/expertise — Public (returns items sorted by order)
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenantId || null;
  const all = await db.expertise.getAll(tenantId);
  const sorted = all.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(sorted);
}));

// GET /api/expertise/:id — Public
router.get('/:id', asyncHandler(async (req, res) => {
  const item = await db.expertise.getById(req.params.id);
  if (!item) throw new ApiError(404, 'Expertise not found');
  res.json(item);
}));

// POST /api/expertise — Auth required
router.post('/', authenticate, validate(expertiseCreateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const tenantId = req.user.tenantId || 'default';
  const newItem = await db.expertise.create(req.validatedBody, tenantId);

  logAudit({ ...meta, action: AuditAction.EXPERTISE_CREATE, resourceId: newItem.id, resourceType: 'expertise' });
  res.status(201).json(newItem);
}));

// PUT /api/expertise/:id — Auth required
router.put('/:id', authenticate, validate(expertiseUpdateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const updated = await db.expertise.update(req.params.id, req.validatedBody);
  if (!updated) throw new ApiError(404, 'Expertise not found');

  logAudit({ ...meta, action: AuditAction.EXPERTISE_UPDATE, resourceId: req.params.id, resourceType: 'expertise' });
  res.json(updated);
}));

// PUT /api/expertise — Bulk reorder
router.put('/', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const items = req.body;
  if (!Array.isArray(items)) throw new ApiError(400, 'Expected an array of items with id and order');

  for (const { id, order } of items) {
    if (id && typeof order === 'number') {
      await db.expertise.update(id, { order });
    }
  }

  logAudit({ ...meta, action: AuditAction.EXPERTISE_REORDER, resourceType: 'expertise' });
  res.json({ message: 'Order updated' });
}));

// DELETE /api/expertise/:id — Auth required
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const deleted = await db.expertise.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Expertise not found');

  logAudit({ ...meta, action: AuditAction.EXPERTISE_DELETE, resourceId: req.params.id, resourceType: 'expertise' });
  res.json({ message: 'Expertise deleted' });
}));

module.exports = router;
