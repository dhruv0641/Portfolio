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
const crypto = require('crypto');
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


// Helper to save customization history
function saveCustomizationHistory(prevCustomization) {
  const historyPath = path.join(config.paths.data, 'customize_history.json');
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    } catch { history = []; }
  }
  const entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    customization: prevCustomization
  };
  history.unshift(entry); // newest first
  // Limit history to 50 entries
  if (history.length > 50) history = history.slice(0, 50);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8');
}

// PUT /api/customize (authenticated, validated)
router.put('/', authenticate, validate(customizeUpdateSchema), asyncHandler(async (req, res) => {
  const current = db.customize.get();
  // Save current state to history before updating
  saveCustomizationHistory(current);
  const updated = deepMerge(current, req.validatedBody);
  db.customize.set(updated);

  try {
    logAudit({ ...getAuditMeta(req), action: AuditAction.SETTINGS_UPDATE, resourceType: 'customize', details: 'Customization settings updated — sections: ' + Object.keys(req.validatedBody).join(', ') });
  } catch (_) { /* audit log failure must not block save */ }

  res.json(updated);
}));

// GET /api/customize/history (authenticated) — List customization history
router.get('/history', authenticate, asyncHandler(async (req, res) => {
  const historyPath = path.join(config.paths.data, 'customize_history.json');
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    } catch { history = []; }
  }
  // Only return id, timestamp, and a summary (omit full customization for list)
  const summarized = history.map(h => ({
    id: h.id,
    timestamp: h.timestamp,
    // Optionally add a summary of changes or sections here
  }));
  res.json(summarized);
}));

// GET /api/customize/history/:id (authenticated) — Get a specific history entry
router.get('/history/:id', authenticate, asyncHandler(async (req, res) => {
  const historyPath = path.join(config.paths.data, 'customize_history.json');
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    } catch { history = []; }
  }
  const entry = history.find(h => h.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'History entry not found' });
  res.json(entry);
}));

// POST /api/customize/history/restore/:id (authenticated) — Restore a previous customization
router.post('/history/restore/:id', authenticate, asyncHandler(async (req, res) => {
  const historyPath = path.join(config.paths.data, 'customize_history.json');
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    } catch { history = []; }
  }
  const entry = history.find(h => h.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'History entry not found' });
  // Save current state to history before restoring
  const current = db.customize.get();
  saveCustomizationHistory(current);
  db.customize.set(entry.customization);
  try {
    logAudit({ ...getAuditMeta(req), action: AuditAction.SETTINGS_UPDATE, resourceType: 'customize', details: 'Customization settings restored from history' });
  } catch (_) { /* audit log failure must not block restore */ }
  res.json(entry.customization);
}));


// ──────────────────────────────────────────────────────────────
// POST /api/customize/reset (authenticated)
// This endpoint ONLY resets UI customization settings (theme, layout, animations, typography, spacing, appearance, etc).
// It MUST NEVER modify, restore, or delete any content data (projects, services, tools, methodology, certificates, messages, admin, etc).
// Only the allowed UI customization keys are written. Any other keys are ignored.
// ──────────────────────────────────────────────────────────────
router.post('/reset', authenticate, asyncHandler(async (req, res) => {
  // ──────────────────────────────────────────────────────────────
  // PRODUCTION PROTECTION: Disable reset in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Reset Defaults is disabled in production.'
    });
  }

  // ──────────────────────────────────────────────────────────────
  // Only reset allowed UI customization keys
  const defaultsPath = path.join(config.paths.data, 'customize_defaults.json');
  let defaults = {};
  if (fs.existsSync(defaultsPath)) {
    defaults = JSON.parse(fs.readFileSync(defaultsPath, 'utf-8'));
  } else {
    defaults = JSON.parse(JSON.stringify(CUSTOMIZE_DEFAULTS));
  }

  // Strictly allowed keys for UI customization.
  // IMPORTANT: content/config branches (hero, sections, seo, etc.) must be preserved.
  const ALLOWED_KEYS = [
    'theme', 'layout', 'animations', 'typography', 'spacing', 'appearance'
  ];
  const current = db.customize.get() || {};
  saveCustomizationHistory(current);

  // Start from current config so content/config keys are never dropped.
  const next = { ...current };
  for (const key of ALLOWED_KEYS) {
    if (defaults[key] !== undefined) {
      next[key] = defaults[key];
    }
  }

  // Save merged config with content preserved and design reset.
  db.customize.set(next);

  try {
    logAudit({ ...getAuditMeta(req), action: AuditAction.SETTINGS_UPDATE, resourceType: 'customize', details: 'Customization settings reset to defaults (UI only)' });
  } catch (_) { /* audit log failure must not block reset */ }

  res.json(ensureDefaults(next));
}));

module.exports = router;
