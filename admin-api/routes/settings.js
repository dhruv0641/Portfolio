/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Settings Routes
 * ═══════════════════════════════════════════════════════════
 */
const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, settingsUpdateSchema } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler } = require('../lib/errorHandler');

// GET /api/settings — Public
router.get('/', asyncHandler(async (req, res) => {
  res.json(await db.settings.get());
}));

// PUT /api/settings — Auth required
router.put('/', authenticate, validate(settingsUpdateSchema), asyncHandler(async (req, res) => {
  const meta = getAuditMeta(req);
  const updated = await db.settings.merge(req.validatedBody);

  logAudit({ ...meta, action: AuditAction.SETTINGS_UPDATE, resourceType: 'settings', details: { fields: Object.keys(req.validatedBody) } });
  res.json(updated);
}));

module.exports = router;
