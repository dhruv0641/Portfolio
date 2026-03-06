/**
 * ═══════════════════════════════════════════════════════════
 * Prisma Client Singleton
 * ═══════════════════════════════════════════════════════════
 * Ensures a single PrismaClient instance is reused across requests.
 * Falls back to the JSON-based data layer when DATABASE_URL is not set,
 * allowing a zero-downtime migration path.
 */
const { PrismaClient } = require('@prisma/client');
const { logger } = require('../lib/logger');

let prisma;

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'production'
        ? [{ emit: 'event', level: 'error' }]
        : [{ emit: 'event', level: 'query' }, { emit: 'event', level: 'error' }],
    });

    prisma.$on('error', (e) => {
      logger.error('Prisma error', { message: e.message });
    });

    if (process.env.NODE_ENV !== 'production') {
      prisma.$on('query', (e) => {
        logger.debug('Prisma query', { query: e.query, duration: e.duration + 'ms' });
      });
    }
  }
  return prisma;
}

async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

module.exports = { getPrismaClient, disconnectPrisma };
