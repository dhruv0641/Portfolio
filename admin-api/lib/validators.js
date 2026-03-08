/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Request Validation Schemas (Zod)
 * ═══════════════════════════════════════════════════════════
 * Production-grade input validation using Zod.
 * Every API endpoint has strict schema validation.
 */
const { z } = require('zod');

// ─── Common validators ───
const safeString = z.string().transform(s => s.replace(/[<>]/g, '').trim());
const emailSchema = z.string().email('Invalid email format').transform(s => s.trim().toLowerCase());

// ═══════════════════════════════════════════
// AUTH SCHEMAS
// ═══════════════════════════════════════════
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required').max(128),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const totpVerifySchema = z.object({
  token: z.string().length(6, 'TOTP token must be 6 digits').regex(/^\d+$/, 'TOTP token must be numeric'),
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// ═══════════════════════════════════════════
// PROJECT SCHEMAS
// ═══════════════════════════════════════════
const projectCreateSchema = z.object({
  title: safeString.pipe(z.string().min(1, 'Title is required').max(200)),
  description: safeString.pipe(z.string().max(2000)).optional().default(''),
  technologies: z.array(safeString).max(20).optional().default([]),
  emoji: z.string().max(10).optional().default('🔒'),
  impact: safeString.pipe(z.string().max(500)).optional().default(''),
  githubLink: z.string().url().or(z.literal('#')).or(z.literal('')).optional().default('#'),
  featured: z.boolean().optional().default(false),
  order: z.number().int().min(0).optional().default(0),
  enabled: z.boolean().optional().default(true),
  tenantId: z.string().optional(),
});

const projectUpdateSchema = projectCreateSchema.partial();

// ═══════════════════════════════════════════
// SERVICE SCHEMAS
// ═══════════════════════════════════════════
const serviceCreateSchema = z.object({
  title: safeString.pipe(z.string().min(1, 'Title is required').max(200)),
  icon: z.string().max(10).optional().default('🔒'),
  description: safeString.pipe(z.string().max(1000)).optional().default(''),
  order: z.number().int().min(0).optional().default(0),
  enabled: z.boolean().optional().default(true),
  tenantId: z.string().optional(),
});

const serviceUpdateSchema = serviceCreateSchema.partial();

// ═══════════════════════════════════════════
// HERO / ABOUT / CONTACT / FOOTER SCHEMAS
// ═══════════════════════════════════════════
const heroCreateSchema = z.object({
  title: safeString.pipe(z.string().min(1, 'Title is required').max(200)),
  subtitle: safeString.pipe(z.string().max(200)).optional().default(''),
  description: safeString.pipe(z.string().max(2000)).optional().default(''),
  primaryCtaText: safeString.pipe(z.string().max(80)).optional().default(''),
  primaryCtaLink: z.string().max(300).optional().default(''),
  secondaryCtaText: safeString.pipe(z.string().max(80)).optional().default(''),
  secondaryCtaLink: z.string().max(300).optional().default(''),
  tenantId: z.string().optional(),
});
const heroUpdateSchema = heroCreateSchema.partial();

const aboutCreateSchema = z.object({
  heading: safeString.pipe(z.string().min(1, 'Heading is required').max(300)),
  description1: safeString.pipe(z.string().max(3000)).optional().default(''),
  description2: safeString.pipe(z.string().max(3000)).optional().default(''),
  tenantId: z.string().optional(),
});
const aboutUpdateSchema = aboutCreateSchema.partial();

const contactCreateSchema = z.object({
  email: emailSchema.optional().or(z.literal('')).default(''),
  location: safeString.pipe(z.string().max(300)).optional().default(''),
  linkedin: z.string().url().or(z.literal('')).optional().default(''),
  tenantId: z.string().optional(),
});
const contactUpdateSchema = contactCreateSchema.partial();

const footerCreateSchema = z.object({
  copyright: safeString.pipe(z.string().max(300)).optional().default(''),
  links: z.array(z.object({
    label: safeString.pipe(z.string().max(80)),
    href: z.string().max(300),
  })).max(20).optional().default([]),
  socialLinks: z.array(z.object({
    label: safeString.pipe(z.string().max(80)),
    href: z.string().max(300),
  })).max(20).optional().default([]),
  tenantId: z.string().optional(),
});
const footerUpdateSchema = footerCreateSchema.partial();

// ═══════════════════════════════════════════
// QUOTES / STATS SCHEMAS
// ═══════════════════════════════════════════
const quoteCreateSchema = z.object({
  quoteText: safeString.pipe(z.string().min(1, 'Quote text is required').max(3000)),
  author: safeString.pipe(z.string().max(200)).optional().default(''),
  role: safeString.pipe(z.string().max(200)).optional().default(''),
  visible: z.boolean().optional().default(true),
  orderIndex: z.number().int().min(0).optional().default(0),
  tenantId: z.string().optional(),
});
const quoteUpdateSchema = quoteCreateSchema.partial();

const statCreateSchema = z.object({
  label: safeString.pipe(z.string().min(1, 'Label is required').max(200)),
  value: z.number().int().min(0).max(1000000000),
  icon: z.string().max(50).optional().default('target'),
  animationType: z.enum(['count', 'static']).optional().default('count'),
  visible: z.boolean().optional().default(true),
  orderIndex: z.number().int().min(0).optional().default(0),
  tenantId: z.string().optional(),
});
const statUpdateSchema = statCreateSchema.partial();

// ═══════════════════════════════════════════
// METHODOLOGY SCHEMAS
// ═══════════════════════════════════════════
const methodologyCreateSchema = z.object({
  title: safeString.pipe(z.string().min(1, 'Title is required').max(200)),
  description: safeString.pipe(z.string().max(2000)).optional().default(''),
  icon: z.string().max(50).optional().default('shield'),
  order: z.number().int().min(0).optional().default(0),
  enabled: z.boolean().optional().default(true),
  tenantId: z.string().optional(),
});

const methodologyUpdateSchema = methodologyCreateSchema.partial();

// ═══════════════════════════════════════════
// EXPERTISE SCHEMAS
// ═══════════════════════════════════════════
const expertiseCreateSchema = z.object({
  title: safeString.pipe(z.string().min(1, 'Title is required').max(200)),
  description: safeString.pipe(z.string().max(2000)).optional().default(''),
  icon: z.string().max(50).optional().default('shield'),
  order: z.number().int().min(0).optional().default(0),
  enabled: z.boolean().optional().default(true),
  tenantId: z.string().optional(),
});

const expertiseUpdateSchema = expertiseCreateSchema.partial();

// ═══════════════════════════════════════════
// TOOLS SCHEMAS
// ═══════════════════════════════════════════
const toolCreateSchema = z.object({
  name: safeString.pipe(z.string().min(1, 'Name is required').max(200)),
  category: safeString.pipe(z.string().max(100)).optional().default(''),
  icon: z.string().max(50).optional().default('terminal'),
  order: z.number().int().min(0).optional().default(0),
  enabled: z.boolean().optional().default(true),
  tenantId: z.string().optional(),
});

const toolUpdateSchema = toolCreateSchema.partial();

// ═══════════════════════════════════════════
// CERTIFICATE SCHEMAS
// ═══════════════════════════════════════════
const certificateCreateSchema = z.object({
  title: safeString.pipe(z.string().min(1, 'Title is required').max(200)),
  issuer: safeString.pipe(z.string().max(200)).optional().default(''),
  date: safeString.pipe(z.string().max(50)).optional().default(''),
  credentialLink: z.string().url().or(z.literal('#')).or(z.literal('')).optional().default(''),
  badgeIcon: z.string().max(50).optional().default('shield-check'),
  order: z.number().int().min(0).optional().default(0),
  enabled: z.boolean().optional().default(true),
  tenantId: z.string().optional(),
});

const certificateUpdateSchema = certificateCreateSchema.partial();

// ═══════════════════════════════════════════
// MESSAGE SCHEMAS
// ═══════════════════════════════════════════
const messageCreateSchema = z.object({
  name: safeString.pipe(z.string().min(2, 'Name must be at least 2 characters').max(100)),
  email: emailSchema,
  subject: safeString.pipe(z.string().max(200)).optional().default(''),
  message: safeString.pipe(z.string().min(10, 'Message must be at least 10 characters').max(5000)),
});

// ═══════════════════════════════════════════
// SETTINGS SCHEMAS
// ═══════════════════════════════════════════
const settingsUpdateSchema = z.object({
  siteName: safeString.pipe(z.string().max(100)).optional(),
  fullName: safeString.pipe(z.string().max(100)).optional(),
  tagline: safeString.pipe(z.string().max(300)).optional(),
  email: emailSchema.optional(),
  location: safeString.pipe(z.string().max(200)).optional(),
  linkedIn: z.string().url().or(z.literal('')).optional(),
  github: z.string().url().or(z.literal('')).optional(),
  seoTitle: safeString.pipe(z.string().max(200)).optional(),
  seoDescription: safeString.pipe(z.string().max(500)).optional(),
}).strict();

// ═══════════════════════════════════════════
// CUSTOMIZE SCHEMAS
// ═══════════════════════════════════════════
const hexColor = z.string().regex(/^#([0-9a-fA-F]{3,8})$|^rgba?\(/).or(z.string().max(50));

/**
 * Clamped number: coerces to number, clamps to [min,max], falls back to defaultVal.
 * NEVER rejects — always produces a valid value.
 */
function clampedNumber(min, max, defaultVal) {
  return z.any().transform(v => {
    const n = typeof v === 'number' ? v : parseFloat(v);
    if (isNaN(n)) return defaultVal;
    return Math.max(min, Math.min(max, n));
  }).pipe(z.number());
}

// ─── Centralized defaults (used by schema, route, and sanitization) ───
const CUSTOMIZE_DEFAULTS = {
  theme: {
    primaryColor: '#00F5FF', secondaryColor: '#0066FF', accentColor: '#10B981',
    successColor: '#00FF88', dangerColor: '#FF3B3B', warningColor: '#FF9F1A',
    bgColor: '#0B0F19', bgCardColor: 'rgba(13,20,40,0.65)',
    textPrimary: '#E8ECF4', textSecondary: '#94A3B8',
    fontPrimary: 'Inter', fontSecondary: 'Rajdhani',
    baseFontSize: 15, headingScale: 1.25, borderRadius: 12, glowOpacity: 0.15,
  },
  hero: {
    title: 'CYBER COMMAND', subtitle: 'Dhruvkumar Dobariya',
    typingPhrases: ['SOC Analyst & Threat Hunter', 'SIEM Engineer & Log Analyst', 'Incident Response Specialist', 'AI Security Researcher', 'Cloud Security Architect'],
    ctaPrimaryText: 'View Operations', ctaPrimaryLink: '#projects',
    ctaSecondaryText: 'Contact HQ', ctaSecondaryLink: '#contact',
    layout: 'split', showStatusBadge: true, statusText: 'SYSTEMS ONLINE', showScanLine: true,
  },
  animations: {
    globalSpeed: 1.0, glowEnabled: true, glowIntensity: 0.15,
    particlesEnabled: true, particleCount: 80, particleSpeed: 0.5, particleOpacity: 0.4,
    revealType: 'fade-up', typingSpeed: 80, cursorBlink: true,
    smoothScroll: true, parallaxEnabled: true, tiltEnabled: true, magneticButtons: true,
  },
  layout: {
    glassmorphism: true, glassBgOpacity: 0.65, glassBlur: 20,
    cardStyle: 'glass', navbarStyle: 'floating', navbarBlur: true,
    footerStyle: 'minimal', maxWidth: 1400, sectionSpacing: 120,
    showBackToTop: true, showProgressBar: true,
  },
  ux: {
    smoothScrollSpeed: 800, customCursor: false, cursorStyle: 'default',
    loaderEnabled: true, loaderStyle: 'cyber', loaderDuration: 2000,
    progressBarEnabled: true, progressBarColor: '#00F5FF',
    buttonStyle: 'glow', hoverEffects: true, focusRingColor: '#00F5FF', scrollRevealOffset: 100,
  },
  dataControl: {
    activityMonitorEnabled: true, activityPanelVisible: true, idleTimeout: 300,
    idleMessage: 'Session Idle', showScrollProgress: true, showSectionTracking: true,
    showClickTracking: true, analyticsEnabled: false, analyticsId: '',
  },
};

const customizeThemeSchema = z.object({
  primaryColor: hexColor.optional(),
  secondaryColor: hexColor.optional(),
  accentColor: hexColor.optional(),
  successColor: hexColor.optional(),
  dangerColor: hexColor.optional(),
  warningColor: hexColor.optional(),
  bgColor: hexColor.optional(),
  bgCardColor: z.string().max(100).optional(),
  textPrimary: hexColor.optional(),
  textSecondary: hexColor.optional(),
  fontPrimary: safeString.pipe(z.string().max(60)).optional(),
  fontSecondary: safeString.pipe(z.string().max(60)).optional(),
  baseFontSize: clampedNumber(10, 24, 15).optional(),
  headingScale: clampedNumber(1, 2, 1.25).optional(),
  borderRadius: clampedNumber(0, 50, 12).optional(),
  glowOpacity: clampedNumber(0, 1, 0.15).optional(),
}).strict().optional();

const customizeHeroSchema = z.object({
  title: safeString.pipe(z.string().max(200)).optional(),
  subtitle: safeString.pipe(z.string().max(200)).optional(),
  typingPhrases: z.array(safeString.pipe(z.string().max(200))).max(10).optional(),
  ctaPrimaryText: safeString.pipe(z.string().max(60)).optional(),
  ctaPrimaryLink: z.string().max(200).optional(),
  ctaSecondaryText: safeString.pipe(z.string().max(60)).optional(),
  ctaSecondaryLink: z.string().max(200).optional(),
  layout: z.enum(['split', 'centered', 'fullscreen']).optional(),
  showStatusBadge: z.boolean().optional(),
  statusText: safeString.pipe(z.string().max(60)).optional(),
  showScanLine: z.boolean().optional(),
}).strict().optional();

const sectionConfigSchema = z.object({
  visible: z.boolean().optional(),
  order: clampedNumber(1, 20, 1).optional(),
  label: safeString.pipe(z.string().max(60)).optional(),
}).strict();

const customizeSectionsSchema = z.record(z.string(), sectionConfigSchema).optional();

const customizeAnimationsSchema = z.object({
  globalSpeed: clampedNumber(0.1, 5, 1.0).optional(),
  glowEnabled: z.boolean().optional(),
  glowIntensity: clampedNumber(0, 1, 0.15).optional(),
  particlesEnabled: z.boolean().optional(),
  particleCount: clampedNumber(0, 300, 80).optional(),
  particleSpeed: clampedNumber(0, 5, 0.5).optional(),
  particleOpacity: clampedNumber(0, 1, 0.4).optional(),
  revealType: z.enum(['fade-up', 'fade-in', 'slide-left', 'slide-right', 'zoom', 'none']).optional(),
  typingSpeed: clampedNumber(20, 300, 80).optional(),
  cursorBlink: z.boolean().optional(),
  smoothScroll: z.boolean().optional(),
  parallaxEnabled: z.boolean().optional(),
  tiltEnabled: z.boolean().optional(),
  magneticButtons: z.boolean().optional(),
}).strict().optional();

const customizeLayoutSchema = z.object({
  glassmorphism: z.boolean().optional(),
  glassBgOpacity: clampedNumber(0, 1, 0.65).optional(),
  glassBlur: clampedNumber(0, 50, 20).optional(),
  cardStyle: z.enum(['glass', 'solid', 'outline', 'minimal']).optional(),
  navbarStyle: z.enum(['floating', 'fixed', 'transparent', 'solid']).optional(),
  navbarBlur: z.boolean().optional(),
  footerStyle: z.enum(['minimal', 'detailed', 'hidden']).optional(),
  maxWidth: clampedNumber(800, 2400, 1400).optional(),
  sectionSpacing: clampedNumber(40, 300, 120).optional(),
  showBackToTop: z.boolean().optional(),
  showProgressBar: z.boolean().optional(),
}).strict().optional();

const customizeSeoSchema = z.object({
  metaTitle: safeString.pipe(z.string().max(200)).optional(),
  metaDescription: safeString.pipe(z.string().max(500)).optional(),
  ogTitle: safeString.pipe(z.string().max(200)).optional(),
  ogDescription: safeString.pipe(z.string().max(500)).optional(),
  ogImage: z.string().max(500).optional(),
  twitterCard: z.enum(['summary', 'summary_large_image']).optional(),
  twitterHandle: z.string().max(50).optional(),
  canonicalUrl: z.string().max(300).optional(),
  structuredDataType: z.enum(['Person', 'Organization', 'WebSite']).optional(),
  keywords: safeString.pipe(z.string().max(500)).optional(),
}).strict().optional();

const customizeSecuritySchema = z.object({
  showSecurityBadges: z.boolean().optional(),
  showTrustIndicators: z.boolean().optional(),
  showEncryptionBadge: z.boolean().optional(),
  showUptimeBadge: z.boolean().optional(),
  threatLevelDisplay: z.enum(['bar', 'badge', 'hidden']).optional(),
  securityScoreVisible: z.boolean().optional(),
  badgeStyle: z.enum(['pill', 'square', 'rounded']).optional(),
}).strict().optional();

// NOTE: customCSS / customHeadHTML / customFooterHTML REMOVED — raw CSS/HTML injection is an XSS vector.
const customizeCodeSchema = z.object({}).strict().optional();

const customizeUxSchema = z.object({
  smoothScrollSpeed: clampedNumber(100, 3000, 800).optional(),
  customCursor: z.boolean().optional(),
  cursorStyle: z.enum(['default', 'dot', 'ring', 'crosshair']).optional(),
  loaderEnabled: z.boolean().optional(),
  loaderStyle: z.enum(['cyber', 'minimal', 'pulse', 'none']).optional(),
  loaderDuration: clampedNumber(0, 10000, 2000).optional(),
  progressBarEnabled: z.boolean().optional(),
  progressBarColor: hexColor.optional(),
  buttonStyle: z.enum(['glow', 'solid', 'outline', 'gradient']).optional(),
  hoverEffects: z.boolean().optional(),
  focusRingColor: hexColor.optional(),
  scrollRevealOffset: clampedNumber(0, 500, 100).optional(),
}).strict().optional();

const customizeDataControlSchema = z.object({
  activityMonitorEnabled: z.boolean().optional(),
  activityPanelVisible: z.boolean().optional(),
  idleTimeout: clampedNumber(30, 3600, 300).optional(),
  idleMessage: safeString.pipe(z.string().max(100)).optional(),
  showScrollProgress: z.boolean().optional(),
  showSectionTracking: z.boolean().optional(),
  showClickTracking: z.boolean().optional(),
  analyticsEnabled: z.boolean().optional(),
  analyticsId: z.string().max(50).optional(),
}).strict().optional();

const customizeUpdateSchema = z.object({
  theme: customizeThemeSchema,
  hero: customizeHeroSchema,
  sections: customizeSectionsSchema,
  projectsExtended: z.object({
    showBadges: z.boolean().optional(),
    showRiskLevel: z.boolean().optional(),
    cardStyle: z.enum(['glassmorphic', 'solid', 'outline']).optional(),
    maxDisplay: clampedNumber(1, 50, 6).optional(),
    riskLevels: z.array(safeString).max(10).optional(),
  }).strict().optional(),
  servicesExtended: z.object({
    layout: z.enum(['grid', 'list', 'carousel']).optional(),
    columns: clampedNumber(1, 6, 3).optional(),
    showIcons: z.boolean().optional(),
    cardStyle: z.enum(['glassmorphic', 'solid', 'outline']).optional(),
  }).strict().optional(),
  animations: customizeAnimationsSchema,
  layout: customizeLayoutSchema,
  seo: customizeSeoSchema,
  security: customizeSecuritySchema,
  customCode: customizeCodeSchema,
  ux: customizeUxSchema,
  dataControl: customizeDataControlSchema,
});

// ═══════════════════════════════════════════
// VALIDATION MIDDLEWARE FACTORY
// ═══════════════════════════════════════════
/**
 * Creates Express middleware that validates req.body against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.parse(req.body);
      req.validatedBody = result; // Use this instead of req.body
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const issues = err.issues || err.errors || [];
        const errors = issues.map(e => ({
          field: (e.path || []).join('.'),
          message: e.message,
        }));
        console.warn(`[VALIDATION] ${req.method} ${req.originalUrl} — ${errors.length} error(s):`, errors);
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }
      return res.status(400).json({ error: 'Invalid request body' });
    }
  };
}

module.exports = {
  // Schemas
  loginSchema,
  changePasswordSchema,
  totpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  CUSTOMIZE_DEFAULTS,
  projectCreateSchema,
  projectUpdateSchema,
  serviceCreateSchema,
  serviceUpdateSchema,
  heroCreateSchema,
  heroUpdateSchema,
  aboutCreateSchema,
  aboutUpdateSchema,
  contactCreateSchema,
  contactUpdateSchema,
  footerCreateSchema,
  footerUpdateSchema,
  quoteCreateSchema,
  quoteUpdateSchema,
  statCreateSchema,
  statUpdateSchema,
  methodologyCreateSchema,
  methodologyUpdateSchema,
  expertiseCreateSchema,
  expertiseUpdateSchema,
  toolCreateSchema,
  toolUpdateSchema,
  certificateCreateSchema,
  certificateUpdateSchema,
  messageCreateSchema,
  settingsUpdateSchema,
  customizeUpdateSchema,
  // Middleware
  validate,
};
