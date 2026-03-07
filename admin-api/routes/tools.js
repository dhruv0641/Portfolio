/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Tools Routes
 * ═══════════════════════════════════════════════════════════
 */
const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, toolCreateSchema, toolUpdateSchema } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler, ApiError } = require('../lib/errorHandler');

// GET /api/tools — Public (returns items sorted by order)
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenantId || null;
  const all = await db.tools.getAll(tenantId);
  const sorted = all.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(sorted);
}));

// GET /api/tools/:id — Public
router.get('/:id', asyncHandler(async (req, res) => {
  const item = await db.tools.getById(req.params.id);
  if (!item) throw new ApiError(404, 'Tool not found');
  res.json(item);
}));

// POST /api/tools — Auth required
router.post('/', authenticate, validate(toolCreateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const tenantId = req.user.tenantId || 'default';
  const newItem = await db.tools.create(req.validatedBody, tenantId);

  logAudit({ ...meta, action: AuditAction.TOOL_CREATE, resourceId: newItem.id, resourceType: 'tool' });
  res.status(201).json(newItem);
}));

// PUT /api/tools/:id — Auth required
router.put('/:id', authenticate, validate(toolUpdateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const updated = await db.tools.update(req.params.id, req.validatedBody);
  if (!updated) throw new ApiError(404, 'Tool not found');

  logAudit({ ...meta, action: AuditAction.TOOL_UPDATE, resourceId: req.params.id, resourceType: 'tool' });
  res.json(updated);
}));

// PUT /api/tools — Bulk reorder
router.put('/', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const items = req.body;
  if (!Array.isArray(items)) throw new ApiError(400, 'Expected an array of items with id and order');

  for (const { id, order } of items) {
    if (id && typeof order === 'number') {
      await db.tools.update(id, { order });
    }
  }

  logAudit({ ...meta, action: AuditAction.TOOL_REORDER, resourceType: 'tool' });
  res.json({ message: 'Order updated' });
}));

// DELETE /api/tools/:id — Auth required
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const deleted = await db.tools.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Tool not found');

  logAudit({ ...meta, action: AuditAction.TOOL_DELETE, resourceId: req.params.id, resourceType: 'tool' });
  res.json({ message: 'Tool deleted' });
}));

module.exports = router;
