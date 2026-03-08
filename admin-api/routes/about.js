const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, aboutCreateSchema, aboutUpdateSchema } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler, ApiError } = require('../lib/errorHandler');

router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenantId || null;
  res.json(await db.about.getAll(tenantId));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const item = await db.about.getById(req.params.id);
  if (!item) throw new ApiError(404, 'About content not found');
  res.json(item);
}));

router.post('/', authenticate, validate(aboutCreateSchema), asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId || 'default';
  const created = await db.about.create(req.validatedBody, tenantId);
  logAudit({ ...getAuditMeta(req), action: AuditAction.SETTINGS_UPDATE, resourceType: 'about', resourceId: created.id });
  res.status(201).json(created);
}));

router.put('/:id', authenticate, validate(aboutUpdateSchema), asyncHandler(async (req, res) => {
  const updated = await db.about.update(req.params.id, req.validatedBody);
  if (!updated) throw new ApiError(404, 'About content not found');
  logAudit({ ...getAuditMeta(req), action: AuditAction.SETTINGS_UPDATE, resourceType: 'about', resourceId: req.params.id });
  res.json(updated);
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const deleted = await db.about.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'About content not found');
  logAudit({ ...getAuditMeta(req), action: AuditAction.SETTINGS_UPDATE, resourceType: 'about', resourceId: req.params.id });
  res.json({ message: 'About content deleted' });
}));

module.exports = router;
