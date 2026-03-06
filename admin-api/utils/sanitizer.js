/**
 * ═══════════════════════════════════════════════════════════
 * Theme Sanitizer — Safe CSS Variable Generation
 * ═══════════════════════════════════════════════════════════
 * Replaces raw CSS injection with structured theme config
 * that generates ONLY CSS custom property assignments.
 * No arbitrary CSS is ever passed through.
 */

// Allowlisted CSS property names that the theme engine may set
const ALLOWED_PROPERTIES = new Set([
  '--accent', '--accent-dim', '--accent-mid',
  '--cyber-blue', '--neon-green',
  '--success', '--danger', '--warning',
  '--bg-void', '--bg-glass',
  '--text-primary', '--text-secondary',
  '--font-primary', '--font-heading',
  '--r-sm', '--r-md', '--r-lg',
  '--glow-size', '--shadow-glow', '--glow-opacity',
  '--anim-speed', '--reveal-offset',
  '--max-w', '--section-spacing',
  '--progress-color', '--focus-ring',
]);

// Strict hex/rgba color pattern
const COLOR_RE = /^#[0-9a-fA-F]{3,8}$|^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\)$/;

// Strict numeric+unit pattern (px, rem, em, s, ms, %)
const UNIT_RE = /^\d+(\.\d+)?(px|rem|em|s|ms|%)$/;

// Font family pattern (alphanumeric, spaces, quotes, commas)
const FONT_RE = /^['"]?[A-Za-z0-9 ,\-_]+['"]?(,\s*[A-Za-z0-9 ,\-_]+)*$/;

/**
 * Validate a single CSS custom property value.
 * Returns the value if safe, null otherwise.
 */
function sanitizeValue(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length > 200) return null;
  if (trimmed === 'none' || trimmed === 'inherit' || trimmed === 'initial') return trimmed;
  if (COLOR_RE.test(trimmed)) return trimmed;
  if (UNIT_RE.test(trimmed)) return trimmed;
  if (FONT_RE.test(trimmed)) return trimmed;
  // Reject anything containing potential CSS injection characters
  if (/[;{}()\\<>]/.test(trimmed)) return null;
  return trimmed;
}

/**
 * Convert structured theme config into safe CSS variable string.
 * Only allowlisted property names and sanitized values are emitted.
 * @param {Object} themeConfig - { '--accent': '#00F5FF', ... }
 * @returns {string} Safe CSS text containing only :root { --var: value; }
 */
function buildThemeCSS(themeConfig) {
  if (!themeConfig || typeof themeConfig !== 'object') return '';

  const declarations = [];
  for (const [prop, rawValue] of Object.entries(themeConfig)) {
    if (!ALLOWED_PROPERTIES.has(prop)) continue;
    const safe = sanitizeValue(String(rawValue));
    if (safe !== null) {
      declarations.push(`  ${prop}: ${safe};`);
    }
  }

  if (!declarations.length) return '';
  return `:root {\n${declarations.join('\n')}\n}`;
}

module.exports = { sanitizeValue, buildThemeCSS, ALLOWED_PROPERTIES };
