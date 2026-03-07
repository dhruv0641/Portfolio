/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Dashboard Stats Routes
 * ═══════════════════════════════════════════════════════════
 */
const express = require('express');
const router = express.Router();
const db = require('../lib/dataLayer');
const { authenticate } = require('../lib/auth');
const { decrypt } = require('../lib/encryption');
const { readAuditLogs } = require('../lib/audit');
const { asyncHandler } = require('../lib/errorHandler');

// GET /api/dashboard/stats — Auth required
router.get('/stats', authenticate, asyncHandler(async (req, res) => {
  const projects = await db.projects.getAll();
  const services = await db.services.getAll();
  const messages = await db.messages.getAll();
  const unreadMessages = messages.filter(m => m.status === 'unread').length;

  // Decrypt messages for display
  const recentMessages = messages
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(m => ({
      ...m,
      email: decrypt(m.email),
      message: decrypt(m.message),
    }));

  res.json({
    totalProjects: projects.length,
    featuredProjects: projects.filter(p => p.featured).length,
    totalServices: services.length,
    totalMessages: messages.length,
    unreadMessages,
    recentMessages,
  });
}));

// GET /api/dashboard/audit-logs — Auth required
router.get('/audit-logs', authenticate, asyncHandler(async (req, res) => {
  const logs = await readAuditLogs();
  const limit = parseInt(req.query.limit || '100', 10);
  const offset = parseInt(req.query.offset || '0', 10);
  const action = req.query.action; // Optional filter

  let filtered = logs;
  if (action) {
    filtered = logs.filter(l => l.action.includes(action));
  }

  const sorted = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const paginated = sorted.slice(offset, offset + limit);

  res.json({
    total: filtered.length,
    offset,
    limit,
    logs: paginated,
  });
}));

module.exports = router;
