/**
 * ═══════════════════════════════════════════════════════════
 * DHRUV.SEC — AES-256-GCM Encryption Utilities
 * ═══════════════════════════════════════════════════════════
 * Encrypts/decrypts sensitive data at rest.
 * Uses AES-256-GCM with random IV per encryption.
 */
const crypto = require('crypto');
const config = require('./config');

const ALGORITHM = config.encryption.algorithm; // 'aes-256-gcm'
const IV_LENGTH = 12; // GCM recommended IV size
const TAG_LENGTH = 16;

function getKey() {
  const hex = config.encryption.key;
  if (!hex || hex.length < 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-char hex string (32 bytes)');
  }
  return Buffer.from(hex.substring(0, 64), 'hex');
}

/**
 * Encrypt a plaintext string
 * @returns {string} Base64 encoded string: iv:encrypted:authTag
 */
function encrypt(plaintext) {
  if (!plaintext || typeof plaintext !== 'string') return plaintext;
  try {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
  } catch (err) {
    // If encryption fails (e.g., key not configured), return original
    console.error('[ENCRYPTION] Failed to encrypt:', err.message);
    return plaintext;
  }
}

/**
 * Decrypt a ciphertext string
 * @param {string} ciphertext - Format: iv:encrypted:authTag (all hex)
 * @returns {string} Decrypted plaintext
 */
function decrypt(ciphertext) {
  if (!ciphertext || typeof ciphertext !== 'string') return ciphertext;
  // If it doesn't look encrypted (no colons), return as-is
  if (!ciphertext.includes(':') || ciphertext.split(':').length !== 3) return ciphertext;
  try {
    const key = getKey();
    const [ivHex, encryptedHex, tagHex] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    // If decryption fails, return original (may be unencrypted legacy data)
    return ciphertext;
  }
}

/**
 * Check if a value appears to be encrypted
 */
function isEncrypted(value) {
  if (typeof value !== 'string') return false;
  const parts = value.split(':');
  return parts.length === 3 && /^[a-f0-9]+$/.test(parts[0]) && parts[0].length === IV_LENGTH * 2;
}

module.exports = { encrypt, decrypt, isEncrypted };
