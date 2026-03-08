const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, mediaBlockCreateSchema, mediaBlockUpdateSchema } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler, ApiError } = require('../lib/errorHandler');

// GET /api/media-blocks — Public
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenantId || null;
  const section = (req.query.section || '').trim();
  const items = await db.mediaBlocks.getAll(tenantId);
  const visibleOnly = req.query.visible === 'true';
  let filtered = visibleOnly ? items.filter((b) => b.visible !== false) : items;
  if (section) filtered = filtered.filter((b) => (b.section || '').toLowerCase() === section.toLowerCase());
  filtered.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  res.json(filtered);
}));

// GET /api/media-blocks/:id — Public
router.get('/:id', asyncHandler(async (req, res) => {
  const item = await db.mediaBlocks.getById(req.params.id);
  if (!item) throw new ApiError(404, 'Media block not found');
  res.json(item);
}));

// POST /api/media-blocks — Auth required
router.post('/', authenticate, validate(mediaBlockCreateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const tenantId = req.user.tenantId || 'default';
  const created = await db.mediaBlocks.create(req.validatedBody, tenantId);
  logAudit({ ...meta, action: AuditAction.MEDIA_BLOCK_CREATE, resourceType: 'media_blocks', resourceId: created.id });
  res.status(201).json(created);
}));

// PUT /api/media-blocks/:id — Auth required
router.put('/:id', authenticate, validate(mediaBlockUpdateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const updated = await db.mediaBlocks.update(req.params.id, req.validatedBody);
  if (!updated) throw new ApiError(404, 'Media block not found');
  logAudit({ ...meta, action: AuditAction.MEDIA_BLOCK_UPDATE, resourceType: 'media_blocks', resourceId: updated.id });
  res.json(updated);
}));

// PATCH /api/media-blocks/:id/visibility — Auth required
router.patch('/:id/visibility', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const visible = req.body && req.body.visible;
  if (typeof visible !== 'boolean') throw new ApiError(400, 'visible must be boolean');
  const updated = await db.mediaBlocks.update(req.params.id, { visible });
  if (!updated) throw new ApiError(404, 'Media block not found');
  logAudit({ ...meta, action: AuditAction.MEDIA_BLOCK_UPDATE, resourceType: 'media_blocks', resourceId: updated.id, details: { visible } });
  res.json(updated);
}));

// PATCH /api/media-blocks/reorder — Auth required
router.patch('/reorder', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const items = req.body;
  if (!Array.isArray(items)) throw new ApiError(400, 'Expected array: [{ id, orderIndex }]');
  for (const item of items) {
    if (!item || !item.id || typeof item.orderIndex !== 'number') continue;
    await db.mediaBlocks.update(item.id, { orderIndex: item.orderIndex });
  }
  logAudit({ ...meta, action: AuditAction.MEDIA_BLOCK_REORDER, resourceType: 'media_blocks' });
  res.json({ message: 'Media block order updated' });
}));

// DELETE /api/media-blocks/:id — Auth required
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const deleted = await db.mediaBlocks.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Media block not found');
  logAudit({ ...meta, action: AuditAction.MEDIA_BLOCK_DELETE, resourceType: 'media_blocks', resourceId: req.params.id });
  res.json({ message: 'Media block deleted' });
}));

module.exports = router;
