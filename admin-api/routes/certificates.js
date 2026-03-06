/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Certificates Routes
 * ═══════════════════════════════════════════════════════════
 */
const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, certificateCreateSchema, certificateUpdateSchema } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler, ApiError } = require('../lib/errorHandler');

// GET /api/certificates — Public (returns items sorted by order)
router.get('/', (req, res) => {
  const tenantId = req.query.tenantId || null;
  const all = db.certificates.getAll(tenantId);
  const sorted = all.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(sorted);
});

// GET /api/certificates/:id — Public
router.get('/:id', (req, res) => {
  const item = db.certificates.getById(req.params.id);
  if (!item) throw new ApiError(404, 'Certificate not found');
  res.json(item);
});

// POST /api/certificates — Auth required
router.post('/', authenticate, validate(certificateCreateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const tenantId = req.user.tenantId || 'default';
  const newItem = db.certificates.create(req.validatedBody, tenantId);

  logAudit({ ...meta, action: AuditAction.CERTIFICATE_CREATE, resourceId: newItem.id, resourceType: 'certificate' });
  res.status(201).json(newItem);
}));

// PUT /api/certificates/:id — Auth required
router.put('/:id', authenticate, validate(certificateUpdateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const updated = db.certificates.update(req.params.id, req.validatedBody);
  if (!updated) throw new ApiError(404, 'Certificate not found');

  logAudit({ ...meta, action: AuditAction.CERTIFICATE_UPDATE, resourceId: req.params.id, resourceType: 'certificate' });
  res.json(updated);
}));

// PUT /api/certificates — Bulk reorder
router.put('/', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const items = req.body;
  if (!Array.isArray(items)) throw new ApiError(400, 'Expected an array of items with id and order');

  items.forEach(({ id, order }) => {
    if (id && typeof order === 'number') {
      db.certificates.update(id, { order });
    }
  });

  logAudit({ ...meta, action: AuditAction.CERTIFICATE_REORDER, resourceType: 'certificate' });
  res.json({ message: 'Order updated' });
}));

// DELETE /api/certificates/:id — Auth required
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const deleted = db.certificates.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Certificate not found');

  logAudit({ ...meta, action: AuditAction.CERTIFICATE_DELETE, resourceId: req.params.id, resourceType: 'certificate' });
  res.json({ message: 'Certificate deleted' });
}));

module.exports = router;
