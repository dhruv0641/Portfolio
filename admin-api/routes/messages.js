/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Messages Routes
 * ═══════════════════════════════════════════════════════════
 */
const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, messageCreateSchema } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler, ApiError } = require('../lib/errorHandler');
const { encrypt, decrypt } = require('../lib/encryption');
const { isEnabled } = require('../lib/featureFlags');

// GET /api/messages — Auth required
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const messages = await db.messages.getAll();
  // Decrypt sensitive fields
  const decrypted = messages.map(m => ({
    ...m,
    email: decrypt(m.email),
    message: decrypt(m.message),
  }));
  const sorted = decrypted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted);
}));

// POST /api/messages — Public (contact form)
router.post('/', validate(messageCreateSchema), asyncHandler(async (req, res) => {
  if (!(await isEnabled('contact_form'))) {
    throw new ApiError(403, 'Contact form is currently disabled');
  }

  const data = req.validatedBody;

  // Encrypt sensitive fields
  const encryptedData = {
    name: data.name,
    email: (await isEnabled('data_encryption')) ? encrypt(data.email) : data.email,
    subject: data.subject || '',
    message: (await isEnabled('data_encryption')) ? encrypt(data.message) : data.message,
    status: 'unread',
  };

  await db.messages.create(encryptedData);
  res.status(201).json({ message: 'Message sent successfully' });
}));

// PATCH /api/messages/:id/read — Auth required
router.patch('/:id/read', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const updated = await db.messages.update(req.params.id, { status: 'read' });
  if (!updated) throw new ApiError(404, 'Message not found');

  logAudit({ ...meta, action: AuditAction.MESSAGE_READ, resourceId: req.params.id, resourceType: 'message' });
  res.json({ ...updated, email: decrypt(updated.email), message: decrypt(updated.message) });
}));

// DELETE /api/messages/:id — Auth required
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const deleted = await db.messages.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Message not found');

  logAudit({ ...meta, action: AuditAction.MESSAGE_DELETE, resourceId: req.params.id, resourceType: 'message' });
  res.json({ message: 'Message deleted' });
}));

module.exports = router;
