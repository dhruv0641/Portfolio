const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, quoteCreateSchema, quoteUpdateSchema } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler, ApiError } = require('../lib/errorHandler');

// GET /api/quotes — Public
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenantId || null;
  const items = await db.quotes.getAll(tenantId);
  const visibleOnly = req.query.visible === 'true';
  const filtered = visibleOnly ? items.filter((q) => q.visible !== false) : items;
  filtered.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  res.json(filtered);
}));

// GET /api/quotes/:id — Public
router.get('/:id', asyncHandler(async (req, res) => {
  const item = await db.quotes.getById(req.params.id);
  if (!item) throw new ApiError(404, 'Quote not found');
  res.json(item);
}));

// POST /api/quotes — Auth required
router.post('/', authenticate, validate(quoteCreateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const tenantId = req.user.tenantId || 'default';
  const created = await db.quotes.create(req.validatedBody, tenantId);
  logAudit({ ...meta, action: AuditAction.QUOTE_CREATE, resourceType: 'quotes', resourceId: created.id });
  res.status(201).json(created);
}));

// PUT /api/quotes/:id — Auth required
router.put('/:id', authenticate, validate(quoteUpdateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const updated = await db.quotes.update(req.params.id, req.validatedBody);
  if (!updated) throw new ApiError(404, 'Quote not found');
  logAudit({ ...meta, action: AuditAction.QUOTE_UPDATE, resourceType: 'quotes', resourceId: updated.id });
  res.json(updated);
}));

// PATCH /api/quotes/:id/visibility — Auth required
router.patch('/:id/visibility', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const visible = req.body && req.body.visible;
  if (typeof visible !== 'boolean') throw new ApiError(400, 'visible must be boolean');
  const updated = await db.quotes.update(req.params.id, { visible });
  if (!updated) throw new ApiError(404, 'Quote not found');
  logAudit({ ...meta, action: AuditAction.QUOTE_UPDATE, resourceType: 'quotes', resourceId: updated.id, details: { visible } });
  res.json(updated);
}));

// PATCH /api/quotes/reorder — Auth required
router.patch('/reorder', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const items = req.body;
  if (!Array.isArray(items)) throw new ApiError(400, 'Expected array: [{ id, orderIndex }]');
  for (const item of items) {
    if (!item || !item.id || typeof item.orderIndex !== 'number') continue;
    await db.quotes.update(item.id, { orderIndex: item.orderIndex });
  }
  logAudit({ ...meta, action: AuditAction.QUOTE_REORDER, resourceType: 'quotes' });
  res.json({ message: 'Quote order updated' });
}));

// DELETE /api/quotes/:id — Auth required
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const deleted = await db.quotes.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Quote not found');
  logAudit({ ...meta, action: AuditAction.QUOTE_DELETE, resourceType: 'quotes', resourceId: req.params.id });
  res.json({ message: 'Quote deleted' });
}));

module.exports = router;
