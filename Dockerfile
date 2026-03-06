# ═══════════════════════════════════════════════════════════
# Dhruvkumar Dobariya — Production Dockerfile
# Multi-stage build: install deps → production image
# ═══════════════════════════════════════════════════════════

# ── Stage 1: Build (install deps, generate Prisma client) ──
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY admin-api/package.json admin-api/package-lock.json* ./admin-api/
WORKDIR /app/admin-api

# Install all deps (including devDependencies for Prisma generate)
RUN npm ci --ignore-scripts && npm cache clean --force

# Copy Prisma schema and generate client
COPY admin-api/prisma ./prisma
RUN npx prisma generate


# ── Stage 2: Production image ──
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -D appuser

# Install dumb-init for proper signal forwarding
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy node_modules from builder
COPY --from=builder /app/admin-api/node_modules ./admin-api/node_modules

# Copy application code
COPY admin-api/ ./admin-api/
COPY admin/ ./admin/
COPY new\ \ \ website/ ./new\ \ \ website/

# Set ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

WORKDIR /app/admin-api

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
