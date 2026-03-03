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
const { validate, customizeUpdateSchema } = require('../lib/validators');
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

// ─── GET /api/customize (public) ───
router.get('/', asyncHandler(async (req, res) => {
  const data = db.customize.get();
  res.json(data);
}));

// ─── PUT /api/customize (authenticated, validated) ───
router.put('/', authenticate, validate(customizeUpdateSchema), asyncHandler(async (req, res) => {
  const current = db.customize.get();
  const updated = deepMerge(current, req.validatedBody);
  db.customize.set(updated);

  logAudit(AuditAction.SETTINGS_UPDATE, {
    ...getAuditMeta(req),
    details: 'Customization settings updated — sections: ' + Object.keys(req.validatedBody).join(', '),
  });

  res.json(updated);
}));

// ─── POST /api/customize/reset (authenticated) ───
router.post('/reset', authenticate, asyncHandler(async (req, res) => {
  const defaultsPath = path.join(config.paths.data, 'customize_defaults.json');
  let defaults = {};

  // Try loading saved defaults, otherwise use hardcoded fallback
  if (fs.existsSync(defaultsPath)) {
    defaults = JSON.parse(fs.readFileSync(defaultsPath, 'utf-8'));
  } else {
    // Fallback: return the current customize.json as shipped
    defaults = {
      theme: {
        primaryColor: '#00F5FF',
        secondaryColor: '#0066FF',
        accentColor: '#10B981',
        successColor: '#00FF88',
        dangerColor: '#FF3B3B',
        warningColor: '#FF9F1A',
        bgColor: '#0B0F19',
        bgCardColor: 'rgba(13,20,40,0.65)',
        textPrimary: '#E8ECF4',
        textSecondary: '#94A3B8',
        fontPrimary: 'Inter',
        fontSecondary: 'Rajdhani',
        baseFontSize: 15,
        headingScale: 1.25,
        borderRadius: 12,
        glowOpacity: 0.15,
      },
      hero: {
        title: 'CYBER COMMAND',
        subtitle: 'Dhruvkumar Dobariya',
        typingPhrases: ['SOC Analyst & Threat Hunter', 'SIEM Engineer & Log Analyst', 'Incident Response Specialist', 'AI Security Researcher', 'Cloud Security Architect'],
        ctaPrimaryText: 'View Operations',
        ctaPrimaryLink: '#projects',
        ctaSecondaryText: 'Contact HQ',
        ctaSecondaryLink: '#contact',
        layout: 'split',
        showStatusBadge: true,
        statusText: 'SYSTEMS ONLINE',
        showScanLine: true,
      },
      animations: {
        globalSpeed: 1.0,
        glowEnabled: true,
        glowIntensity: 0.15,
        particlesEnabled: true,
        particleCount: 80,
        particleSpeed: 0.5,
        particleOpacity: 0.4,
        revealType: 'fade-up',
        typingSpeed: 80,
        cursorBlink: true,
        smoothScroll: true,
        parallaxEnabled: true,
        tiltEnabled: true,
        magneticButtons: true,
      },
    };
  }

  db.customize.set(defaults);

  logAudit(AuditAction.SETTINGS_UPDATE, {
    ...getAuditMeta(req),
    details: 'Customization settings reset to defaults',
  });

  res.json(defaults);
}));

module.exports = router;
