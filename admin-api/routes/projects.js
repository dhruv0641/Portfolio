/**
 * ═══════════════════════════════════════════════════════════
 * DHRUV.SEC — Projects Routes
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
router.get('/', (req, res) => {
  const tenantId = req.query.tenantId || null;
  res.json(db.projects.getAll(tenantId));
});

// GET /api/projects/:id — Public
router.get('/:id', (req, res) => {
  const project = db.projects.getById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  res.json(project);
});

// POST /api/projects — Auth required
router.post('/', authenticate, validate(projectCreateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const tenantId = req.user.tenantId || 'default';
  const newProject = db.projects.create(req.validatedBody, tenantId);

  logAudit({ ...meta, action: AuditAction.PROJECT_CREATE, resourceId: newProject.id, resourceType: 'project' });
  res.status(201).json(newProject);
}));

// PUT /api/projects/:id — Auth required
router.put('/:id', authenticate, validate(projectUpdateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const updated = db.projects.update(req.params.id, req.validatedBody);
  if (!updated) throw new ApiError(404, 'Project not found');

  logAudit({ ...meta, action: AuditAction.PROJECT_UPDATE, resourceId: req.params.id, resourceType: 'project' });
  res.json(updated);
}));

// DELETE /api/projects/:id — Auth required
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const deleted = db.projects.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Project not found');

  logAudit({ ...meta, action: AuditAction.PROJECT_DELETE, resourceId: req.params.id, resourceType: 'project' });
  res.json({ message: 'Project deleted' });
}));

module.exports = router;
