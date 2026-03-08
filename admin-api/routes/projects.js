/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Projects Routes
 * ═══════════════════════════════════════════════════════════
 */
const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, projectCreateSchema, projectUpdateSchema } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler, ApiError } = require('../lib/errorHandler');

// GET /api/projects — Public
router.get('/', asyncHandler(async (req, res) => {
  const tenantId = req.query.tenantId || null;
  const visibleOnly = req.query.visible === 'true';
  const all = await db.projects.getAll(tenantId);
  const filtered = visibleOnly ? all.filter((p) => p.enabled !== false) : all;
  filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(filtered);
}));

// GET /api/projects/:id — Public
router.get('/:id', asyncHandler(async (req, res) => {
  const project = await db.projects.getById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  res.json(project);
}));

// POST /api/projects — Auth required
router.post('/', authenticate, validate(projectCreateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const tenantId = req.user.tenantId || 'default';
  const newProject = await db.projects.create(req.validatedBody, tenantId);

  logAudit({ ...meta, action: AuditAction.PROJECT_CREATE, resourceId: newProject.id, resourceType: 'project' });
  res.status(201).json(newProject);
}));

// PUT /api/projects/:id — Auth required
router.put('/:id', authenticate, validate(projectUpdateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const updated = await db.projects.update(req.params.id, req.validatedBody);
  if (!updated) throw new ApiError(404, 'Project not found');

  logAudit({ ...meta, action: AuditAction.PROJECT_UPDATE, resourceId: req.params.id, resourceType: 'project' });
  res.json(updated);
}));

// PUT /api/projects — Bulk reorder
router.put('/', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const items = req.body;
  if (!Array.isArray(items)) throw new ApiError(400, 'Expected an array of items with id and order');

  for (const { id, order } of items) {
    if (id && typeof order === 'number') {
      await db.projects.update(id, { order });
    }
  }

  logAudit({ ...meta, action: AuditAction.PROJECT_REORDER, resourceType: 'project' });
  res.json({ message: 'Order updated' });
}));

// PATCH /api/projects/:id/visibility — Auth required
router.patch('/:id/visibility', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const enabled = req.body && req.body.enabled;
  if (typeof enabled !== 'boolean') throw new ApiError(400, 'enabled must be boolean');
  const updated = await db.projects.update(req.params.id, { enabled });
  if (!updated) throw new ApiError(404, 'Project not found');

  logAudit({ ...meta, action: AuditAction.PROJECT_UPDATE, resourceId: req.params.id, resourceType: 'project', details: { enabled } });
  res.json(updated);
}));

// DELETE /api/projects/:id — Auth required
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const deleted = await db.projects.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Project not found');

  logAudit({ ...meta, action: AuditAction.PROJECT_DELETE, resourceId: req.params.id, resourceType: 'project' });
  res.json({ message: 'Project deleted' });
}));

module.exports = router;
