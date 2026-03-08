const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, heroCreateSchema, heroUpdateSchema } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler, ApiError } = require('../lib/errorHandler');

router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenantId || null;
  res.json(await db.hero.getAll(tenantId));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const item = await db.hero.getById(req.params.id);
  if (!item) throw new ApiError(404, 'Hero content not found');
  res.json(item);
}));

router.post('/', authenticate, validate(heroCreateSchema), asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId || 'default';
  const created = await db.hero.create(req.validatedBody, tenantId);
  logAudit({ ...getAuditMeta(req), action: AuditAction.SETTINGS_UPDATE, resourceType: 'hero', resourceId: created.id });
  res.status(201).json(created);
}));

router.put('/:id', authenticate, validate(heroUpdateSchema), asyncHandler(async (req, res) => {
  const updated = await db.hero.update(req.params.id, req.validatedBody);
  if (!updated) throw new ApiError(404, 'Hero content not found');
  logAudit({ ...getAuditMeta(req), action: AuditAction.SETTINGS_UPDATE, resourceType: 'hero', resourceId: req.params.id });
  res.json(updated);
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const deleted = await db.hero.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Hero content not found');
  logAudit({ ...getAuditMeta(req), action: AuditAction.SETTINGS_UPDATE, resourceType: 'hero', resourceId: req.params.id });
  res.json({ message: 'Hero content deleted' });
}));

module.exports = router;
