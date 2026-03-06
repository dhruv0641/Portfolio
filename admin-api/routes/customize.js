/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Customize API Routes
 * ═══════════════════════════════════════════════════════════
 * GET  /api/customize       — Public: returns full customization config
 * PUT  /api/customize       — Auth: deep-merge update customization
 * POST /api/customize/reset — Auth: reset to defaults
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { validate, customizeUpdateSchema, CUSTOMIZE_DEFAULTS } = require('../lib/validators');
const { logAudit, AuditAction, getAuditMeta } = require('../lib/audit');
const { asyncHandler } = require('../lib/errorHandler');
const config = require('../lib/config');

/**
 * Deep merge helper — merges nested objects without overwriting entire sub-objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Ensure stored config has safe defaults for every section.
 * Protects against corrupted/partial data returning invalid values to the frontend.
 */
function ensureDefaults(data) {
  const safe = { ...data };
  for (const section of Object.keys(CUSTOMIZE_DEFAULTS)) {
    if (!safe[section] || typeof safe[section] !== 'object') {
      safe[section] = { ...CUSTOMIZE_DEFAULTS[section] };
    } else {
      safe[section] = { ...CUSTOMIZE_DEFAULTS[section], ...safe[section] };
    }
  }
  return safe;
}

// ─── GET /api/customize (public) ───
router.get('/', asyncHandler(async (req, res) => {
  const data = db.customize.get();
  res.json(ensureDefaults(data));
}));

// ─── PUT /api/customize (authenticated, validated) ───
router.put('/', authenticate, validate(customizeUpdateSchema), asyncHandler(async (req, res) => {
  const current = db.customize.get();
  const updated = deepMerge(current, req.validatedBody);
  db.customize.set(updated);

  try {
    logAudit({ ...getAuditMeta(req), action: AuditAction.SETTINGS_UPDATE, resourceType: 'customize', details: 'Customization settings updated — sections: ' + Object.keys(req.validatedBody).join(', ') });
  } catch (_) { /* audit log failure must not block save */ }

  res.json(updated);
}));

// ─── POST /api/customize/reset (authenticated) ───
router.post('/reset', authenticate, asyncHandler(async (req, res) => {
  const defaultsPath = path.join(config.paths.data, 'customize_defaults.json');
  let defaults = {};

  // Try loading saved defaults, otherwise use centralized CUSTOMIZE_DEFAULTS
  if (fs.existsSync(defaultsPath)) {
    defaults = JSON.parse(fs.readFileSync(defaultsPath, 'utf-8'));
  } else {
    defaults = JSON.parse(JSON.stringify(CUSTOMIZE_DEFAULTS));
  }

  db.customize.set(defaults);

  try {
    logAudit({ ...getAuditMeta(req), action: AuditAction.SETTINGS_UPDATE, resourceType: 'customize', details: 'Customization settings reset to defaults' });
  } catch (_) { /* audit log failure must not block reset */ }

  res.json(defaults);
}));

module.exports = router;
