/**
 * ═══════════════════════════════════════════════════════════
 * DHRUV.SEC — Request Validation Schemas (Zod)
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
        const errors = err.errors.map(e => ({
          field: e.path.join('.'),
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
  projectCreateSchema,
  projectUpdateSchema,
  serviceCreateSchema,
  serviceUpdateSchema,
  messageCreateSchema,
  settingsUpdateSchema,
  // Middleware
  validate,
};
