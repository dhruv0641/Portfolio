const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, statCreateSchema, statUpdateSchema } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler, ApiError } = require('../lib/errorHandler');

// GET /api/stats — Public
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenantId || null;
  const items = await db.stats.getAll(tenantId);
  const visibleOnly = req.query.visible === 'true';
  const filtered = visibleOnly ? items.filter((s) => s.visible !== false) : items;
  filtered.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  res.json(filtered);
}));

// GET /api/stats/:id — Public
router.get('/:id', asyncHandler(async (req, res) => {
  const item = await db.stats.getById(req.params.id);
  if (!item) throw new ApiError(404, 'Stat not found');
  res.json(item);
}));

// POST /api/stats — Auth required
router.post('/', authenticate, validate(statCreateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const tenantId = req.user.tenantId || 'default';
  const created = await db.stats.create(req.validatedBody, tenantId);
  logAudit({ ...meta, action: AuditAction.STAT_CREATE, resourceType: 'stats', resourceId: created.id });
  res.status(201).json(created);
}));

// PUT /api/stats/:id — Auth required
router.put('/:id', authenticate, validate(statUpdateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const updated = await db.stats.update(req.params.id, req.validatedBody);
  if (!updated) throw new ApiError(404, 'Stat not found');
  logAudit({ ...meta, action: AuditAction.STAT_UPDATE, resourceType: 'stats', resourceId: updated.id });
  res.json(updated);
}));

// PATCH /api/stats/:id/visibility — Auth required
router.patch('/:id/visibility', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const visible = req.body && req.body.visible;
  if (typeof visible !== 'boolean') throw new ApiError(400, 'visible must be boolean');
  const updated = await db.stats.update(req.params.id, { visible });
  if (!updated) throw new ApiError(404, 'Stat not found');
  logAudit({ ...meta, action: AuditAction.STAT_UPDATE, resourceType: 'stats', resourceId: updated.id, details: { visible } });
  res.json(updated);
}));

// PATCH /api/stats/reorder — Auth required
router.patch('/reorder', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const items = req.body;
  if (!Array.isArray(items)) throw new ApiError(400, 'Expected array: [{ id, orderIndex }]');
  for (const item of items) {
    if (!item || !item.id || typeof item.orderIndex !== 'number') continue;
    await db.stats.update(item.id, { orderIndex: item.orderIndex });
  }
  logAudit({ ...meta, action: AuditAction.STAT_REORDER, resourceType: 'stats' });
  res.json({ message: 'Stat order updated' });
}));

// DELETE /api/stats/:id — Auth required
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const deleted = await db.stats.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Stat not found');
  logAudit({ ...meta, action: AuditAction.STAT_DELETE, resourceType: 'stats', resourceId: req.params.id });
  res.json({ message: 'Stat deleted' });
}));

module.exports = router;
