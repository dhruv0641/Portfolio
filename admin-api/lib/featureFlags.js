/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Feature Flag System
 * ═══════════════════════════════════════════════════════════
 * Simple but powerful feature flag system.
 * Supports per-tenant and global flags.
 */
const db = require('./dataLayer');

// Default feature flags
const DEFAULT_FLAGS = {
  'two_factor_auth': true,
  'audit_logging': true,
  'data_encryption': true,
  'multi_tenant': false,
  'subscription_billing': false,
  'api_rate_limiting': true,
  'contact_form': true,
  'public_api': true,
};

/**
 * Check if a feature is enabled
 * @param {string} flag - Feature flag name
 * @param {string} [tenantId] - Optional tenant ID for per-tenant flags
 * @returns {boolean}
 */
function isEnabled(flag, tenantId = null) {
  // Check tenant-specific override first
  if (tenantId) {
    const settings = db.settings.get();
    const tenantFlags = settings.featureFlags?.[tenantId];
    if (tenantFlags && flag in tenantFlags) {
      return !!tenantFlags[flag];
    }
  }

  // Check global flags
  const settings = db.settings.get();
  if (settings.featureFlags?.global && flag in settings.featureFlags.global) {
    return !!settings.featureFlags.global[flag];
  }

  // Fallback to defaults
  return DEFAULT_FLAGS[flag] ?? false;
}

/**
 * Express middleware — check feature flag before route handler
 */
function requireFeature(flag) {
  return (req, res, next) => {
    const tenantId = req.user?.tenantId;
    if (!isEnabled(flag, tenantId)) {
      return res.status(403).json({ error: `Feature '${flag}' is not enabled` });
    }
    next();
  };
}

module.exports = { isEnabled, requireFeature, DEFAULT_FLAGS };
