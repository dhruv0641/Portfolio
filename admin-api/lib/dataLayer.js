/**
 * SQLite-backed async data layer with one-time JSON migration.
 * Database path: admin-api/database/admin.db
 */
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const config = require('./config');
const { logger } = require('./logger');

const DATA_DIR = config.paths.data;
const DB_DIR = path.join(__dirname, '..', 'database');
const DB_PATH = path.join(DB_DIR, 'admin.db');

let db = null;

const COLLECTION_TABLES = {
  projects: 'projects',
  services: 'services',
  messages: 'messages',
  methodology: 'methodology',
  expertise: 'expertise',
  tools: 'tools',
  certificates: 'certificates',
};

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

function toEntity(row) {
  if (!row) return null;
  let data = {};
  try {
    data = row.data ? JSON.parse(row.data) : {};
  } catch {
    data = {};
  }
  return {
    ...data,
    id: row.id,
    tenantId: row.tenantId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function createSchema() {
  await db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS system_state (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customize (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customize_history (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      customization TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS methodology (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS expertise (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tools (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      action TEXT,
      adminId TEXT,
      ip TEXT,
      userAgent TEXT,
      resourceId TEXT,
      resourceType TEXT,
      details TEXT,
      requestId TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_projects_tenant ON projects(tenantId);
    CREATE INDEX IF NOT EXISTS idx_services_tenant ON services(tenantId);
    CREATE INDEX IF NOT EXISTS idx_messages_tenant ON messages(tenantId);
    CREATE INDEX IF NOT EXISTS idx_methodology_tenant ON methodology(tenantId);
    CREATE INDEX IF NOT EXISTS idx_expertise_tenant ON expertise(tenantId);
    CREATE INDEX IF NOT EXISTS idx_tools_tenant ON tools(tenantId);
    CREATE INDEX IF NOT EXISTS idx_certificates_tenant ON certificates(tenantId);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_ts ON audit_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
  `);
}

async function backupJsonFiles() {
  const backupDir = path.join(DATA_DIR, `backup-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  await ensureDir(backupDir);
  const files = await fs.readdir(DATA_DIR);
  await Promise.all(
    files
      .filter((f) => f.endsWith('.json'))
      .map(async (file) => {
        await fs.copyFile(path.join(DATA_DIR, file), path.join(backupDir, file));
      })
  );
  logger.info('JSON data backup created', { backupDir });
}

async function migrateCollection(fileName, tableName) {
  const raw = (await readJSON(fileName)) || [];
  if (!Array.isArray(raw) || !raw.length) return;
  const existing = await db.get(`SELECT COUNT(*) AS c FROM ${tableName}`);
  if (existing.c > 0) return;

  await db.exec('BEGIN');
  try {
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
      await db.run(
        `INSERT INTO ${tableName} (id, tenantId, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
        [id, tenantId, JSON.stringify(data), createdAt, updatedAt]
      );
    }
    await db.exec('COMMIT');
  } catch (err) {
    await db.exec('ROLLBACK');
    throw err;
  }
}

async function migrateSingleton(fileName, tableName) {
  const raw = (await readJSON(fileName)) || {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !Object.keys(raw).length) return;
  const existing = await db.get(`SELECT COUNT(*) AS c FROM ${tableName}`);
  if (existing.c > 0) return;

  const id = raw.id || crypto.randomUUID();
  const tenantId = raw.tenantId || 'default';
  const createdAt = raw.createdAt || new Date().toISOString();
  const updatedAt = raw.updatedAt || createdAt;
  const data = { ...raw };
  delete data.id;
  delete data.tenantId;
  delete data.createdAt;
  delete data.updatedAt;
  await db.run(
    `INSERT INTO ${tableName} (id, tenantId, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
    [id, tenantId, JSON.stringify(data), createdAt, updatedAt]
  );
}

async function migrateAuditLogs() {
  const raw = (await readJSON('audit_logs.json')) || [];
  if (!Array.isArray(raw) || !raw.length) return;
  const existing = await db.get('SELECT COUNT(*) AS c FROM audit_logs');
  if (existing.c > 0) return;

  await db.exec('BEGIN');
  try {
    for (const entry of raw) {
      await db.run(
        `INSERT INTO audit_logs (id, timestamp, action, adminId, ip, userAgent, resourceId, resourceType, details, requestId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id || crypto.randomUUID(),
          entry.timestamp || new Date().toISOString(),
          entry.action || null,
          entry.adminId || 'anonymous',
          entry.ip || 'unknown',
          (entry.userAgent || 'unknown').substring(0, 200),
          entry.resourceId || null,
          entry.resourceType || null,
          entry.details ? JSON.stringify(entry.details) : null,
          entry.requestId || null,
        ]
      );
    }
    await db.exec('COMMIT');
  } catch (err) {
    await db.exec('ROLLBACK');
    throw err;
  }
}

async function migrateCustomizeHistory() {
  const raw = (await readJSON('customize_history.json')) || [];
  if (!Array.isArray(raw) || !raw.length) return;
  const existing = await db.get('SELECT COUNT(*) AS c FROM customize_history');
  if (existing.c > 0) return;
  await db.exec('BEGIN');
  try {
    for (const entry of raw) {
      await db.run(
        'INSERT INTO customize_history (id, timestamp, customization) VALUES (?, ?, ?)',
        [
          entry.id || crypto.randomUUID(),
          entry.timestamp || new Date().toISOString(),
          JSON.stringify(entry.customization || {}),
        ]
      );
    }
    await db.exec('COMMIT');
  } catch (err) {
    await db.exec('ROLLBACK');
    throw err;
  }
}

async function runInitialMigrationIfNeeded() {
  const marker = await db.get("SELECT value FROM system_state WHERE key='json_migrated'");
  if (marker && marker.value === '1') return;

  await backupJsonFiles();
  await migrateCollection('projects.json', 'projects');
  await migrateCollection('services.json', 'services');
  await migrateCollection('messages.json', 'messages');
  await migrateCollection('methodology.json', 'methodology');
  await migrateCollection('expertise.json', 'expertise');
  await migrateCollection('tools.json', 'tools');
  await migrateCollection('certificates.json', 'certificates');
  await migrateSingleton('admin.json', 'admins');
  await migrateSingleton('settings.json', 'settings');
  await migrateSingleton('customize.json', 'customize');
  await migrateAuditLogs();
  await migrateCustomizeHistory();

  await db.run("INSERT OR REPLACE INTO system_state (key, value) VALUES ('json_migrated', '1')");
  logger.info('JSON to SQLite migration completed', { dbPath: DB_PATH });
}

async function initDatabase() {
  if (db) return db;
  await ensureDir(DB_DIR);
  await ensureDir(DATA_DIR);
  db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await createSchema();
  await runInitialMigrationIfNeeded();
  return db;
}

async function closeDatabase() {
  if (!db) return;
  await db.close();
  db = null;
}

class Repository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async getAll(tenantId = null) {
    const rows = tenantId
      ? await db.all(`SELECT * FROM ${this.tableName} WHERE tenantId = ?`, [tenantId])
      : await db.all(`SELECT * FROM ${this.tableName}`);
    return rows.map(toEntity);
  }

  async getById(id, tenantId = null) {
    const row = tenantId
      ? await db.get(`SELECT * FROM ${this.tableName} WHERE id = ? AND tenantId = ?`, [id, tenantId])
      : await db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return toEntity(row);
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

    await db.run(
      `INSERT INTO ${this.tableName} (id, tenantId, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
      [id, rowTenantId, JSON.stringify(data), createdAt, updatedAt]
    );
    return {
      ...data,
      id,
      tenantId: rowTenantId,
      createdAt,
      updatedAt,
    };
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

    await db.run(
      `UPDATE ${this.tableName} SET data = ?, updatedAt = ? WHERE id = ?`,
      [JSON.stringify(data), merged.updatedAt, id]
    );
    return merged;
  }

  async delete(id, tenantId = null) {
    const result = tenantId
      ? await db.run(`DELETE FROM ${this.tableName} WHERE id = ? AND tenantId = ?`, [id, tenantId])
      : await db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return result.changes > 0;
  }

  async count(tenantId = null) {
    const row = tenantId
      ? await db.get(`SELECT COUNT(*) AS c FROM ${this.tableName} WHERE tenantId = ?`, [tenantId])
      : await db.get(`SELECT COUNT(*) AS c FROM ${this.tableName}`);
    return row.c;
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
    const row = await db.get(`SELECT * FROM ${this.tableName} WHERE tenantId = ? LIMIT 1`, [tenantId]);
    const entity = toEntity(row);
    return entity || {};
  }

  async set(data, tenantId = null) {
    const id = data.id || crypto.randomUUID();
    const rowTenantId = tenantId || data.tenantId || 'default';
    const existing = await db.get(`SELECT id, createdAt FROM ${this.tableName} WHERE tenantId = ? LIMIT 1`, [rowTenantId]);
    const createdAt = existing?.createdAt || data.createdAt || new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const stored = { ...data };
    delete stored.id;
    delete stored.tenantId;
    delete stored.createdAt;
    delete stored.updatedAt;

    if (existing) {
      await db.run(
        `UPDATE ${this.tableName} SET data = ?, updatedAt = ? WHERE tenantId = ?`,
        [JSON.stringify(stored), updatedAt, rowTenantId]
      );
      return { ...stored, id: existing.id, tenantId: rowTenantId, createdAt, updatedAt };
    }

    await db.run(
      `INSERT INTO ${this.tableName} (id, tenantId, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
      [id, rowTenantId, JSON.stringify(stored), createdAt, updatedAt]
    );
    return { ...stored, id, tenantId: rowTenantId, createdAt, updatedAt };
  }

  async merge(updates, tenantId = 'default') {
    const current = await this.get(tenantId);
    const updated = { ...current, ...updates };
    return this.set(updated, tenantId);
  }
}

const customizeHistory = {
  async list() {
    const rows = await db.all('SELECT id, timestamp FROM customize_history ORDER BY timestamp DESC LIMIT 50');
    return rows;
  },

  async getById(id) {
    const row = await db.get('SELECT * FROM customize_history WHERE id = ? LIMIT 1', [id]);
    if (!row) return null;
    return {
      id: row.id,
      timestamp: row.timestamp,
      customization: JSON.parse(row.customization || '{}'),
    };
  },

  async create(customization) {
    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      customization: customization || {},
    };
    await db.run(
      'INSERT INTO customize_history (id, timestamp, customization) VALUES (?, ?, ?)',
      [entry.id, entry.timestamp, JSON.stringify(entry.customization)]
    );
    await db.run(
      `DELETE FROM customize_history
       WHERE id NOT IN (SELECT id FROM customize_history ORDER BY timestamp DESC LIMIT 50)`
    );
    return entry;
  },
};

const auditLogs = {
  async getAll() {
    const rows = await db.all('SELECT * FROM audit_logs ORDER BY timestamp ASC');
    return rows.map((r) => ({
      ...r,
      details: r.details ? JSON.parse(r.details) : null,
    }));
  },

  async create(entry) {
    await db.run(
      `INSERT INTO audit_logs (id, timestamp, action, adminId, ip, userAgent, resourceId, resourceType, details, requestId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id || crypto.randomUUID(),
        entry.timestamp || new Date().toISOString(),
        entry.action || null,
        entry.adminId || 'anonymous',
        entry.ip || 'unknown',
        (entry.userAgent || 'unknown').substring(0, 200),
        entry.resourceId || null,
        entry.resourceType || null,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.requestId || null,
      ]
    );
    await db.run(
      `DELETE FROM audit_logs
       WHERE id NOT IN (SELECT id FROM audit_logs ORDER BY timestamp DESC LIMIT 10000)`
    );
  },
};

module.exports = {
  initDatabase,
  closeDatabase,
  dbPath: DB_PATH,
  dataPath: DATA_DIR,

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

  readJSON,
  writeJSON,
  Repository,
  SingletonStore,
};
