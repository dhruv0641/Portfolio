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
  tenantId: z.string().optional(),
});

const serviceUpdateSchema = serviceCreateSchema.partial();

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
const cssUnit = z.number().min(0).max(9999);

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
  baseFontSize: z.number().min(10).max(24).optional(),
  headingScale: z.number().min(1).max(2).optional(),
  borderRadius: z.number().min(0).max(50).optional(),
  glowOpacity: z.number().min(0).max(1).optional(),
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
  order: z.number().min(1).max(20).optional(),
  label: safeString.pipe(z.string().max(60)).optional(),
}).strict();

const customizeSectionsSchema = z.record(z.string(), sectionConfigSchema).optional();

const customizeAnimationsSchema = z.object({
  globalSpeed: z.number().min(0.1).max(5).optional(),
  glowEnabled: z.boolean().optional(),
  glowIntensity: z.number().min(0).max(1).optional(),
  particlesEnabled: z.boolean().optional(),
  particleCount: z.number().min(0).max(300).optional(),
  particleSpeed: z.number().min(0).max(5).optional(),
  particleOpacity: z.number().min(0).max(1).optional(),
  revealType: z.enum(['fade-up', 'fade-in', 'slide-left', 'slide-right', 'zoom', 'none']).optional(),
  typingSpeed: z.number().min(20).max(300).optional(),
  cursorBlink: z.boolean().optional(),
  smoothScroll: z.boolean().optional(),
  parallaxEnabled: z.boolean().optional(),
  tiltEnabled: z.boolean().optional(),
  magneticButtons: z.boolean().optional(),
}).strict().optional();

const customizeLayoutSchema = z.object({
  glassmorphism: z.boolean().optional(),
  glassBgOpacity: z.number().min(0).max(1).optional(),
  glassBlur: z.number().min(0).max(50).optional(),
  cardStyle: z.enum(['glass', 'solid', 'outline', 'minimal']).optional(),
  navbarStyle: z.enum(['floating', 'fixed', 'transparent', 'solid']).optional(),
  navbarBlur: z.boolean().optional(),
  footerStyle: z.enum(['minimal', 'detailed', 'hidden']).optional(),
  maxWidth: z.number().min(800).max(2400).optional(),
  sectionSpacing: z.number().min(40).max(300).optional(),
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

const customizeCodeSchema = z.object({
  customCSS: z.string().max(10000).optional(),
  customHeadHTML: z.string().max(5000).optional(),
  customFooterHTML: z.string().max(5000).optional(),
}).strict().optional();

const customizeUxSchema = z.object({
  smoothScrollSpeed: z.number().min(100).max(3000).optional(),
  customCursor: z.boolean().optional(),
  cursorStyle: z.enum(['default', 'dot', 'ring', 'crosshair']).optional(),
  loaderEnabled: z.boolean().optional(),
  loaderStyle: z.enum(['cyber', 'minimal', 'pulse', 'none']).optional(),
  loaderDuration: z.number().min(0).max(10000).optional(),
  progressBarEnabled: z.boolean().optional(),
  progressBarColor: hexColor.optional(),
  buttonStyle: z.enum(['glow', 'solid', 'outline', 'gradient']).optional(),
  hoverEffects: z.boolean().optional(),
  focusRingColor: hexColor.optional(),
  scrollRevealOffset: z.number().min(0).max(500).optional(),
}).strict().optional();

const customizeDataControlSchema = z.object({
  activityMonitorEnabled: z.boolean().optional(),
  activityPanelVisible: z.boolean().optional(),
  idleTimeout: z.number().min(30).max(3600).optional(),
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
    maxDisplay: z.number().min(1).max(50).optional(),
    riskLevels: z.array(safeString).max(10).optional(),
  }).strict().optional(),
  servicesExtended: z.object({
    layout: z.enum(['grid', 'list', 'carousel']).optional(),
    columns: z.number().min(1).max(6).optional(),
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
  projectCreateSchema,
  projectUpdateSchema,
  serviceCreateSchema,
  serviceUpdateSchema,
  messageCreateSchema,
  settingsUpdateSchema,
  customizeUpdateSchema,
  // Middleware
  validate,
};
