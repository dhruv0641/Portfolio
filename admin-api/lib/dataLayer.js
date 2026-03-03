/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Abstract Data Layer
 * ═══════════════════════════════════════════════════════════
 * Abstracts JSON file storage behind a clean interface.
 * Prepared for future migration to MongoDB/PostgreSQL.
 * Supports multi-tenant filtering via tenantId.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');
const { logger } = require('./logger');

const DATA_DIR = config.paths.data;

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ─── Low-level JSON helpers ───
function readJSON(file) {
  const filePath = path.join(DATA_DIR, file);
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    logger.error(`Failed to read ${file}`, { error: err.message });
    return null;
  }
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    logger.error(`Failed to write ${file}`, { error: err.message });
    throw new Error(`Data persistence error: ${file}`);
  }
}

// ═══════════════════════════════════════════
// GENERIC COLLECTION REPOSITORY
// ═══════════════════════════════════════════
class Repository {
  constructor(filename) {
    this.filename = filename;
  }

  getAll(tenantId = null) {
    const data = readJSON(this.filename) || [];
    if (tenantId) return data.filter(item => item.tenantId === tenantId);
    return data;
  }

  getById(id, tenantId = null) {
    const data = this.getAll(tenantId);
    return data.find(item => item.id === id) || null;
  }

  create(item, tenantId = null) {
    const data = readJSON(this.filename) || [];
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      tenantId: tenantId || 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.push(newItem);
    writeJSON(this.filename, data);
    return newItem;
  }

  update(id, updates, tenantId = null) {
    const data = readJSON(this.filename) || [];
    const index = data.findIndex(item => {
      if (tenantId) return item.id === id && item.tenantId === tenantId;
      return item.id === id;
    });
    if (index === -1) return null;

    data[index] = {
      ...data[index],
      ...updates,
      id: data[index].id,           // Preserve immutable fields
      tenantId: data[index].tenantId,
      createdAt: data[index].createdAt,
      updatedAt: new Date().toISOString(),
    };
    writeJSON(this.filename, data);
    return data[index];
  }

  delete(id, tenantId = null) {
    const data = readJSON(this.filename) || [];
    const filtered = data.filter(item => {
      if (tenantId) return !(item.id === id && item.tenantId === tenantId);
      return item.id !== id;
    });
    if (filtered.length === data.length) return false;
    writeJSON(this.filename, filtered);
    return true;
  }

  count(tenantId = null) {
    return this.getAll(tenantId).length;
  }

  countWhere(predicate, tenantId = null) {
    return this.getAll(tenantId).filter(predicate).length;
  }
}

// ═══════════════════════════════════════════
// SINGLETON DOCUMENT STORE (for admin.json, settings.json)
// ═══════════════════════════════════════════
class SingletonStore {
  constructor(filename) {
    this.filename = filename;
  }

  get() {
    return readJSON(this.filename) || {};
  }

  set(data) {
    writeJSON(this.filename, data);
    return data;
  }

  merge(updates) {
    const current = this.get();
    const updated = { ...current, ...updates };
    writeJSON(this.filename, updated);
    return updated;
  }
}

// ═══════════════════════════════════════════
// EXPORT REPOSITORY INSTANCES
// ═══════════════════════════════════════════
module.exports = {
  // Repositories
  projects: new Repository('projects.json'),
  services: new Repository('services.json'),
  messages: new Repository('messages.json'),

  // Singleton stores
  admin: new SingletonStore('admin.json'),
  settings: new SingletonStore('settings.json'),
  customize: new SingletonStore('customize.json'),

  // For direct access (audit logs etc.)
  readJSON,
  writeJSON,

  // Classes for extension
  Repository,
  SingletonStore,
};
