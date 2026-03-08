const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, aboutUpdateSchema, aboutTagCreateSchema, aboutTagUpdateSchema } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler, ApiError } = require('../lib/errorHandler');

router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenantId || null;
  const sections = await db.about.getAll(tenantId);
  const section = sections[0] || null;
  const tags = await db.aboutTags.getAll(tenantId);
  const expertiseTags = tags
    .filter((t) => t.visible !== false)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  res.json({
    section,
    expertiseTags,
  });
}));

router.put('/', authenticate, validate(aboutUpdateSchema), asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId || 'default';
  const meta = getAuditMeta(req);
  const rows = await db.about.getAll(tenantId);
  const existing = rows[0] || null;
  const payload = { ...req.validatedBody };
  if (!payload.title && payload.heading) payload.title = payload.heading;

  let saved;
  if (existing) {
    saved = await db.about.update(existing.id, payload, tenantId);
  } else {
    saved = await db.about.create(payload, tenantId);
  }

  logAudit({ ...meta, action: AuditAction.SETTINGS_UPDATE, resourceType: 'about', resourceId: saved.id });
  res.json(saved);
}));

// GET /api/about/tags
router.get('/tags', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenantId || null;
  const tags = await db.aboutTags.getAll(tenantId);
  tags.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  res.json(tags);
}));

// POST /api/about/tags
router.post('/tags', authenticate, validate(aboutTagCreateSchema), asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId || 'default';
  const meta = getAuditMeta(req);
  const created = await db.aboutTags.create(req.validatedBody, tenantId);
  logAudit({ ...meta, action: AuditAction.SETTINGS_UPDATE, resourceType: 'about_tag', resourceId: created.id });
  res.status(201).json(created);
}));

// PUT /api/about/tags/:id
router.put('/tags/:id', authenticate, validate(aboutTagUpdateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const updated = await db.aboutTags.update(req.params.id, req.validatedBody);
  if (!updated) throw new ApiError(404, 'Tag not found');
  logAudit({ ...meta, action: AuditAction.SETTINGS_UPDATE, resourceType: 'about_tag', resourceId: updated.id });
  res.json(updated);
}));

// PATCH /api/about/tags/reorder
router.patch('/tags/reorder', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const items = req.body;
  if (!Array.isArray(items)) throw new ApiError(400, 'Expected array: [{id, orderIndex}]');
  for (const item of items) {
    if (!item || !item.id || typeof item.orderIndex !== 'number') continue;
    await db.aboutTags.update(item.id, { orderIndex: item.orderIndex });
  }
  logAudit({ ...meta, action: AuditAction.SETTINGS_UPDATE, resourceType: 'about_tag' });
  res.json({ message: 'Tag order updated' });
}));

// PATCH /api/about/tags/:id/visibility
router.patch('/tags/:id/visibility', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const visible = req.body && req.body.visible;
  if (typeof visible !== 'boolean') throw new ApiError(400, 'visible must be boolean');
  const updated = await db.aboutTags.update(req.params.id, { visible });
  if (!updated) throw new ApiError(404, 'Tag not found');
  logAudit({ ...meta, action: AuditAction.SETTINGS_UPDATE, resourceType: 'about_tag', resourceId: updated.id, details: { visible } });
  res.json(updated);
}));

// DELETE /api/about/tags/:id
router.delete('/tags/:id', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const deleted = await db.aboutTags.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Tag not found');
  logAudit({ ...meta, action: AuditAction.SETTINGS_UPDATE, resourceType: 'about_tag', resourceId: req.params.id });
  res.json({ message: 'Tag deleted' });
}));

module.exports = router;
