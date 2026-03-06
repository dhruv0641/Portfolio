/**
 * ═══════════════════════════════════════════════════════════
 * Repository Layer — Prisma-backed data access
 * ═══════════════════════════════════════════════════════════
 * Clean replacement for the JSON file-based dataLayer.js.
 * Each repository class provides CRUD operations for one entity.
 * All return plain JS objects (no Prisma model leakage).
 */
const { getPrismaClient } = require('./prismaClient');

// ─── Base Repository (shared CRUD logic) ───
class BaseRepository {
  constructor(modelName) {
    this._modelName = modelName;
  }

  get _model() {
    return getPrismaClient()[this._modelName];
  }

  async findById(id) {
    return this._model.findUnique({ where: { id } });
  }

  async findAll({ tenantId = 'default', orderBy, where = {}, skip, take } = {}) {
    return this._model.findMany({
      where: { tenantId, ...where },
      orderBy: orderBy || { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async count({ tenantId = 'default', where = {} } = {}) {
    return this._model.count({ where: { tenantId, ...where } });
  }

  async create(data) {
    return this._model.create({ data });
  }

  async update(id, data) {
    return this._model.update({ where: { id }, data });
  }

  async delete(id) {
    return this._model.delete({ where: { id } });
  }
}

// ─── Project Repository ───
class ProjectRepository extends BaseRepository {
  constructor() { super('project'); }

  async findFeatured(tenantId = 'default') {
    return this._model.findMany({
      where: { tenantId, featured: true },
      orderBy: { sortOrder: 'asc' },
    });
  }
}

// ─── Service Repository ───
class ServiceRepository extends BaseRepository {
  constructor() { super('service'); }
}

// ─── Message Repository ───
class MessageRepository extends BaseRepository {
  constructor() { super('message'); }

  async findByStatus(status, tenantId = 'default') {
    return this._model.findMany({
      where: { tenantId, status },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id, status) {
    return this._model.update({ where: { id }, data: { status } });
  }

  async countByStatus(tenantId = 'default') {
    const [unread, read, archived] = await Promise.all([
      this._model.count({ where: { tenantId, status: 'unread' } }),
      this._model.count({ where: { tenantId, status: 'read' } }),
      this._model.count({ where: { tenantId, status: 'archived' } }),
    ]);
    return { unread, read, archived, total: unread + read + archived };
  }
}

// ─── Admin Repository ───
class AdminRepository {
  get _model() { return getPrismaClient().admin; }

  async findByUsername(username) {
    return this._model.findUnique({ where: { username } });
  }

  async upsert(username, data) {
    return this._model.upsert({
      where: { username },
      create: { username, ...data },
      update: data,
    });
  }

  async updatePassword(username, passwordHash) {
    return this._model.update({
      where: { username },
      data: { passwordHash },
    });
  }

  async setTotpSecret(username, totpSecret) {
    return this._model.update({
      where: { username },
      data: { totpSecret },
    });
  }
}

// ─── Settings Repository (singleton per tenant) ───
class SettingsRepository {
  get _model() { return getPrismaClient().siteSettings; }

  async get(tenantId = 'default') {
    return this._model.findUnique({ where: { tenantId } });
  }

  async upsert(tenantId = 'default', data) {
    return this._model.upsert({
      where: { tenantId },
      create: { tenantId, ...data },
      update: data,
    });
  }
}

// ─── Customize Repository (singleton per tenant) ───
class CustomizeRepository {
  get _model() { return getPrismaClient().customize; }

  async get(tenantId = 'default') {
    const row = await this._model.findUnique({ where: { tenantId } });
    return row ? row.config : null;
  }

  async upsert(tenantId = 'default', config) {
    return this._model.upsert({
      where: { tenantId },
      create: { tenantId, config },
      update: { config },
    });
  }
}

// ─── Audit Log Repository (append-only) ───
class AuditLogRepository {
  get _model() { return getPrismaClient().auditLog; }

  async create(entry) {
    return this._model.create({ data: entry });
  }

  async findRecent({ take = 100, skip = 0, action, adminId } = {}) {
    const where = {};
    if (action) where.action = action;
    if (adminId) where.adminId = adminId;
    return this._model.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  async count(where = {}) {
    return this._model.count({ where });
  }
}

// ─── Refresh Token Repository ───
class RefreshTokenRepository {
  get _model() { return getPrismaClient().refreshToken; }

  async create(data) {
    return this._model.create({ data });
  }

  async findByHash(tokenHash) {
    return this._model.findUnique({ where: { tokenHash } });
  }

  async deleteByFamily(family) {
    return this._model.deleteMany({ where: { family } });
  }

  async deleteByUsername(username) {
    return this._model.deleteMany({ where: { username } });
  }

  async deleteExpired() {
    return this._model.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  }
}

// ─── Export singleton instances ───
module.exports = {
  projectRepo: new ProjectRepository(),
  serviceRepo: new ServiceRepository(),
  messageRepo: new MessageRepository(),
  adminRepo: new AdminRepository(),
  settingsRepo: new SettingsRepository(),
  customizeRepo: new CustomizeRepository(),
  auditLogRepo: new AuditLogRepository(),
  refreshTokenRepo: new RefreshTokenRepository(),
};
