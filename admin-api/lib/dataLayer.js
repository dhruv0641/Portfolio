/**
 * PostgreSQL-backed async data layer with one-time JSON migration.
 * Uses DATABASE_URL from environment.
 */
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');
const config = require('./config');
const { logger } = require('./logger');

const DATA_DIR = config.paths.data;
const DATABASE_URL = process.env.DATABASE_URL || '';

let pool = null;

const COLLECTION_TABLES = {
  hero: 'hero',
  about: 'about',
  aboutTags: 'about_tags',
  contact: 'contact',
  footer: 'footer',
  quotes: 'quotes',
  stats: 'stats',
  projects: 'projects',
  services: 'services',
  messages: 'messages',
  methodology: 'methodology',
  expertise: 'expertise',
  tools: 'tools',
  certificates: 'certificates',
};

function getSslConfig() {
  const raw = (process.env.PGSSL || process.env.PGSSLMODE || '').toLowerCase();
  if (raw === 'disable' || raw === 'false' || raw === '0') return false;
  if (raw === 'require' || raw === 'true' || raw === '1') return { rejectUnauthorized: false };
  return false;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJSON(file) {
  const filePath = path.join(DATA_DIR, file);
  try {
    if (!(await fileExists(filePath))) return null;
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    logger.error(`Failed to read ${file}`, { error: err.message });
    return null;
  }
}

async function writeJSON(file, data) {
  const filePath = path.join(DATA_DIR, file);
  try {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    logger.error(`Failed to write ${file}`, { error: err.message });
    throw new Error(`Data persistence error: ${file}`);
  }
}

function toIso(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function parseJsonMaybe(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function toEntity(row) {
  if (!row) return null;
  const data = parseJsonMaybe(row.data, {});
  return {
    ...data,
    id: row.id,
    tenantId: row.tenantId,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function baseSelect(tableName) {
  return `SELECT id, tenant_id AS "tenantId", data, created_at AS "createdAt", updated_at AS "updatedAt" FROM ${tableName}`;
}

async function createSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS system_state (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_tenant_unique ON admins(tenant_id);

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_tenant_unique ON settings(tenant_id);

    CREATE TABLE IF NOT EXISTS customize (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_customize_tenant_unique ON customize(tenant_id);

    CREATE TABLE IF NOT EXISTS customize_history (
      id TEXT PRIMARY KEY,
      timestamp TIMESTAMPTZ NOT NULL,
      customization JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS hero (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS about (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS about_tags (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS contact (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS footer (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stats (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS methodology (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS expertise (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tools (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TIMESTAMPTZ NOT NULL,
      action TEXT,
      admin_id TEXT,
      ip TEXT,
      user_agent TEXT,
      resource_id TEXT,
      resource_type TEXT,
      details JSONB,
      request_id TEXT
    );
    CREATE TABLE IF NOT EXISTS content_versions (
      id TEXT PRIMARY KEY,
      timestamp TIMESTAMPTZ NOT NULL,
      table_name TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload JSONB
    );

    CREATE INDEX IF NOT EXISTS idx_projects_tenant ON projects(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_hero_tenant ON hero(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_about_tenant ON about(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_about_tags_tenant ON about_tags(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_contact_tenant ON contact(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_footer_tenant ON footer(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_quotes_tenant ON quotes(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_stats_tenant ON stats(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_services_tenant ON services(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_messages_tenant ON messages(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_methodology_tenant ON methodology(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_expertise_tenant ON expertise(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_tools_tenant ON tools(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_tenant ON certificates(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_customize_history_ts ON customize_history(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_ts ON audit_logs(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
    CREATE INDEX IF NOT EXISTS idx_content_versions_ts ON content_versions(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_content_versions_table_entity ON content_versions(table_name, entity_id);
  `);
}

async function backupJsonFiles() {
  const dataDirExists = await fileExists(DATA_DIR);
  if (!dataDirExists) return;
  const files = await fs.readdir(DATA_DIR);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));
  if (!jsonFiles.length) return;

  const backupDir = path.join(DATA_DIR, `backup-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  await ensureDir(backupDir);
  await Promise.all(
    jsonFiles.map(async (file) => {
      await fs.copyFile(path.join(DATA_DIR, file), path.join(backupDir, file));
    })
  );
  logger.info('JSON data backup created', { backupDir });
}

async function tableCount(tableName, client = pool) {
  const { rows } = await client.query(`SELECT COUNT(*)::int AS c FROM ${tableName}`);
  return rows[0]?.c || 0;
}

async function migrateCollection(fileName, tableName, client) {
  const raw = (await readJSON(fileName)) || [];
  if (!Array.isArray(raw) || !raw.length) return;
  const count = await tableCount(tableName, client);
  if (count > 0) return;

  for (const item of raw) {
    const id = item.id || crypto.randomUUID();
    const tenantId = item.tenantId || 'default';
    const createdAt = item.createdAt || new Date().toISOString();
    const updatedAt = item.updatedAt || createdAt;
    const data = { ...item };
    delete data.id;
    delete data.tenantId;
    delete data.createdAt;
    delete data.updatedAt;

    await client.query(
      `INSERT INTO ${tableName} (id, tenant_id, data, created_at, updated_at)
       VALUES ($1, $2, $3::jsonb, $4::timestamptz, $5::timestamptz)`,
      [id, tenantId, JSON.stringify(data), createdAt, updatedAt]
    );
  }
}

async function migrateSingleton(fileName, tableName, client) {
  const raw = (await readJSON(fileName)) || {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !Object.keys(raw).length) return;
  const count = await tableCount(tableName, client);
  if (count > 0) return;

  const id = raw.id || crypto.randomUUID();
  const tenantId = raw.tenantId || 'default';
  const createdAt = raw.createdAt || new Date().toISOString();
  const updatedAt = raw.updatedAt || createdAt;
  const data = { ...raw };
  delete data.id;
  delete data.tenantId;
  delete data.createdAt;
  delete data.updatedAt;

  await client.query(
    `INSERT INTO ${tableName} (id, tenant_id, data, created_at, updated_at)
     VALUES ($1, $2, $3::jsonb, $4::timestamptz, $5::timestamptz)`,
    [id, tenantId, JSON.stringify(data), createdAt, updatedAt]
  );
}

async function migrateAuditLogs(client) {
  const raw = (await readJSON('audit_logs.json')) || [];
  if (!Array.isArray(raw) || !raw.length) return;
  const count = await tableCount('audit_logs', client);
  if (count > 0) return;

  for (const entry of raw) {
    await client.query(
      `INSERT INTO audit_logs (
        id, timestamp, action, admin_id, ip, user_agent, resource_id, resource_type, details, request_id
      ) VALUES ($1, $2::timestamptz, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)`,
      [
        entry.id || crypto.randomUUID(),
        entry.timestamp || new Date().toISOString(),
        entry.action || null,
        entry.adminId || 'anonymous',
        entry.ip || 'unknown',
        (entry.userAgent || 'unknown').substring(0, 200),
        entry.resourceId || null,
        entry.resourceType || null,
        JSON.stringify(entry.details || null),
        entry.requestId || null,
      ]
    );
  }
}

async function migrateCustomizeHistory(client) {
  const raw = (await readJSON('customize_history.json')) || [];
  if (!Array.isArray(raw) || !raw.length) return;
  const count = await tableCount('customize_history', client);
  if (count > 0) return;

  for (const entry of raw) {
    await client.query(
      `INSERT INTO customize_history (id, timestamp, customization)
       VALUES ($1, $2::timestamptz, $3::jsonb)`,
      [
        entry.id || crypto.randomUUID(),
        entry.timestamp || new Date().toISOString(),
        JSON.stringify(entry.customization || {}),
      ]
    );
  }
}

async function runInitialMigrationIfNeeded() {
  const marker = await pool.query("SELECT value FROM system_state WHERE key = 'json_migrated' LIMIT 1");
  if (marker.rows[0]?.value === '1') return;

  await backupJsonFiles();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await migrateCollection('projects.json', 'projects', client);
    await migrateCollection('hero.json', 'hero', client);
    await migrateCollection('about.json', 'about', client);
    await migrateCollection('about_tags.json', 'about_tags', client);
    await migrateCollection('aboutTags.json', 'about_tags', client);
    await migrateCollection('contact.json', 'contact', client);
    await migrateCollection('footer.json', 'footer', client);
    await migrateCollection('quotes.json', 'quotes', client);
    await migrateCollection('stats.json', 'stats', client);
    await migrateCollection('services.json', 'services', client);
    await migrateCollection('messages.json', 'messages', client);
    await migrateCollection('methodology.json', 'methodology', client);
    await migrateCollection('expertise.json', 'expertise', client);
    await migrateCollection('tools.json', 'tools', client);
    await migrateCollection('certificates.json', 'certificates', client);
    await migrateSingleton('admin.json', 'admins', client);
    await migrateSingleton('settings.json', 'settings', client);
    await migrateSingleton('customize.json', 'customize', client);
    await migrateAuditLogs(client);
    await migrateCustomizeHistory(client);
    await client.query(
      `INSERT INTO system_state (key, value) VALUES ('json_migrated', '1')
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
    );
    await client.query('COMMIT');
    logger.info('JSON to PostgreSQL migration completed');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function initDatabase() {
  if (pool) return pool;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is required for PostgreSQL data layer');
  }

  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: getSslConfig(),
    max: parseInt(process.env.PG_POOL_MAX || '10', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  await pool.query('SELECT 1');
  await createSchema();
  await runInitialMigrationIfNeeded();
  logger.info('PostgreSQL database initialized');
  return pool;
}

async function closeDatabase() {
  if (!pool) return;
  await pool.end();
  pool = null;
}

class Repository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async recordVersion(entityId, operation, payload) {
    try {
      await pool.query(
        `INSERT INTO content_versions (id, timestamp, table_name, entity_id, operation, payload)
         VALUES ($1, $2::timestamptz, $3, $4, $5, $6::jsonb)`,
        [
          crypto.randomUUID(),
          new Date().toISOString(),
          this.tableName,
          entityId,
          operation,
          JSON.stringify(payload || null),
        ]
      );
      await pool.query(
        `DELETE FROM content_versions
         WHERE id NOT IN (SELECT id FROM content_versions ORDER BY timestamp DESC LIMIT 50000)`
      );
    } catch (err) {
      logger.error('Failed to record content version', { table: this.tableName, entityId, operation, error: err.message });
    }
  }

  async getAll(tenantId = null) {
    const q = tenantId
      ? `${baseSelect(this.tableName)} WHERE tenant_id = $1`
      : `${baseSelect(this.tableName)}`;
    const vals = tenantId ? [tenantId] : [];
    const { rows } = await pool.query(q, vals);
    return rows.map(toEntity);
  }

  async getById(id, tenantId = null) {
    const q = tenantId
      ? `${baseSelect(this.tableName)} WHERE id = $1 AND tenant_id = $2 LIMIT 1`
      : `${baseSelect(this.tableName)} WHERE id = $1 LIMIT 1`;
    const vals = tenantId ? [id, tenantId] : [id];
    const { rows } = await pool.query(q, vals);
    return toEntity(rows[0]);
  }

  async create(item, tenantId = null) {
    const id = item.id || crypto.randomUUID();
    const rowTenantId = tenantId || item.tenantId || 'default';
    const createdAt = item.createdAt || new Date().toISOString();
    const updatedAt = item.updatedAt || createdAt;
    const data = { ...item };
    delete data.id;
    delete data.tenantId;
    delete data.createdAt;
    delete data.updatedAt;

    const { rows } = await pool.query(
      `INSERT INTO ${this.tableName} (id, tenant_id, data, created_at, updated_at)
       VALUES ($1, $2, $3::jsonb, $4::timestamptz, $5::timestamptz)
       RETURNING id, tenant_id AS "tenantId", data, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [id, rowTenantId, JSON.stringify(data), createdAt, updatedAt]
    );
    const entity = toEntity(rows[0]);
    await this.recordVersion(entity.id, 'create', entity);
    return entity;
  }

  async update(id, updates, tenantId = null) {
    const current = await this.getById(id, tenantId);
    if (!current) return null;
    const merged = {
      ...current,
      ...updates,
      id: current.id,
      tenantId: current.tenantId,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    };
    const data = { ...merged };
    delete data.id;
    delete data.tenantId;
    delete data.createdAt;
    delete data.updatedAt;

    const { rows } = await pool.query(
      `UPDATE ${this.tableName}
       SET data = $1::jsonb, updated_at = $2::timestamptz
       WHERE id = $3
       RETURNING id, tenant_id AS "tenantId", data, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [JSON.stringify(data), merged.updatedAt, id]
    );
    const entity = toEntity(rows[0]);
    await this.recordVersion(id, 'update', { before: current, after: entity });
    return entity;
  }

  async delete(id, tenantId = null) {
    const existing = await this.getById(id, tenantId);
    const q = tenantId
      ? `DELETE FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2`
      : `DELETE FROM ${this.tableName} WHERE id = $1`;
    const vals = tenantId ? [id, tenantId] : [id];
    const result = await pool.query(q, vals);
    if (result.rowCount > 0) {
      await this.recordVersion(id, 'delete', existing || null);
    }
    return result.rowCount > 0;
  }

  async count(tenantId = null) {
    const q = tenantId
      ? `SELECT COUNT(*)::int AS c FROM ${this.tableName} WHERE tenant_id = $1`
      : `SELECT COUNT(*)::int AS c FROM ${this.tableName}`;
    const vals = tenantId ? [tenantId] : [];
    const { rows } = await pool.query(q, vals);
    return rows[0]?.c || 0;
  }

  async countWhere(predicate, tenantId = null) {
    const all = await this.getAll(tenantId);
    return all.filter(predicate).length;
  }
}

class SingletonStore {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async get(tenantId = 'default') {
    const { rows } = await pool.query(
      `${baseSelect(this.tableName)} WHERE tenant_id = $1 LIMIT 1`,
      [tenantId]
    );
    return toEntity(rows[0]) || {};
  }

  async set(data, tenantId = null) {
    const id = data.id || crypto.randomUUID();
    const rowTenantId = tenantId || data.tenantId || 'default';
    const createdAt = data.createdAt || new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const stored = { ...data };
    delete stored.id;
    delete stored.tenantId;
    delete stored.createdAt;
    delete stored.updatedAt;

    const { rows } = await pool.query(
      `INSERT INTO ${this.tableName} (id, tenant_id, data, created_at, updated_at)
       VALUES ($1, $2, $3::jsonb, $4::timestamptz, $5::timestamptz)
       ON CONFLICT (tenant_id) DO UPDATE
       SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
       RETURNING id, tenant_id AS "tenantId", data, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [id, rowTenantId, JSON.stringify(stored), createdAt, updatedAt]
    );
    return toEntity(rows[0]);
  }

  async merge(updates, tenantId = 'default') {
    const current = await this.get(tenantId);
    const updated = { ...current, ...updates };
    return this.set(updated, tenantId);
  }
}

const customizeHistory = {
  async list() {
    const { rows } = await pool.query(
      `SELECT id, timestamp FROM customize_history ORDER BY timestamp DESC LIMIT 50`
    );
    return rows.map((r) => ({ id: r.id, timestamp: toIso(r.timestamp) }));
  },

  async getById(id) {
    const { rows } = await pool.query(
      `SELECT id, timestamp, customization FROM customize_history WHERE id = $1 LIMIT 1`,
      [id]
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      timestamp: toIso(row.timestamp),
      customization: parseJsonMaybe(row.customization, {}),
    };
  },

  async create(customization) {
    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      customization: customization || {},
    };
    await pool.query(
      `INSERT INTO customize_history (id, timestamp, customization)
       VALUES ($1, $2::timestamptz, $3::jsonb)`,
      [entry.id, entry.timestamp, JSON.stringify(entry.customization)]
    );
    await pool.query(
      `DELETE FROM customize_history
       WHERE id NOT IN (SELECT id FROM customize_history ORDER BY timestamp DESC LIMIT 50)`
    );
    return entry;
  },
};

const auditLogs = {
  async getAll() {
    const { rows } = await pool.query(
      `SELECT
         id,
         timestamp,
         action,
         admin_id AS "adminId",
         ip,
         user_agent AS "userAgent",
         resource_id AS "resourceId",
         resource_type AS "resourceType",
         details,
         request_id AS "requestId"
       FROM audit_logs
       ORDER BY timestamp ASC`
    );
    return rows.map((r) => ({
      ...r,
      timestamp: toIso(r.timestamp),
      details: parseJsonMaybe(r.details, null),
    }));
  },

  async create(entry) {
    await pool.query(
      `INSERT INTO audit_logs (
        id, timestamp, action, admin_id, ip, user_agent, resource_id, resource_type, details, request_id
      ) VALUES ($1, $2::timestamptz, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)`,
      [
        entry.id || crypto.randomUUID(),
        entry.timestamp || new Date().toISOString(),
        entry.action || null,
        entry.adminId || 'anonymous',
        entry.ip || 'unknown',
        (entry.userAgent || 'unknown').substring(0, 200),
        entry.resourceId || null,
        entry.resourceType || null,
        JSON.stringify(entry.details || null),
        entry.requestId || null,
      ]
    );
    await pool.query(
      `DELETE FROM audit_logs
       WHERE id NOT IN (SELECT id FROM audit_logs ORDER BY timestamp DESC LIMIT 10000)`
    );
  },
};

const systemState = {
  async get(key) {
    const { rows } = await pool.query(
      `SELECT value FROM system_state WHERE key = $1 LIMIT 1`,
      [key]
    );
    return rows[0]?.value || null;
  },

  async set(key, value) {
    await pool.query(
      `INSERT INTO system_state (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, String(value)]
    );
  },
};

const contentVersions = {
  async list(limit = 200, tableName = '', entityId = '') {
    const lim = Math.min(Math.max(parseInt(limit, 10) || 200, 1), 1000);
    const where = [];
    const vals = [];
    if (tableName) {
      vals.push(tableName);
      where.push(`table_name = $${vals.length}`);
    }
    if (entityId) {
      vals.push(entityId);
      where.push(`entity_id = $${vals.length}`);
    }
    vals.push(lim);
    const filter = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT id, timestamp, table_name AS "tableName", entity_id AS "entityId", operation, payload
       FROM content_versions
       ${filter}
       ORDER BY timestamp DESC
       LIMIT $${vals.length}`,
      vals
    );
    return rows.map((r) => ({
      ...r,
      timestamp: toIso(r.timestamp),
      payload: parseJsonMaybe(r.payload, null),
    }));
  },
};

module.exports = {
  initDatabase,
  closeDatabase,
  dbPath: null,
  dataPath: DATA_DIR,

  hero: new Repository(COLLECTION_TABLES.hero),
  about: new Repository(COLLECTION_TABLES.about),
  aboutTags: new Repository(COLLECTION_TABLES.aboutTags),
  contact: new Repository(COLLECTION_TABLES.contact),
  footer: new Repository(COLLECTION_TABLES.footer),
  quotes: new Repository(COLLECTION_TABLES.quotes),
  stats: new Repository(COLLECTION_TABLES.stats),
  projects: new Repository(COLLECTION_TABLES.projects),
  services: new Repository(COLLECTION_TABLES.services),
  messages: new Repository(COLLECTION_TABLES.messages),
  methodology: new Repository(COLLECTION_TABLES.methodology),
  expertise: new Repository(COLLECTION_TABLES.expertise),
  tools: new Repository(COLLECTION_TABLES.tools),
  certificates: new Repository(COLLECTION_TABLES.certificates),

  admin: new SingletonStore('admins'),
  settings: new SingletonStore('settings'),
  customize: new SingletonStore('customize'),

  customizeHistory,
  auditLogs,
  contentVersions,
  systemState,

  readJSON,
  writeJSON,
  Repository,
  SingletonStore,
};
