/**
 * ═══════════════════════════════════════════════════════════
 * Admin Panel — State Management Module
 * ═══════════════════════════════════════════════════════════
 * Reactive state store with subscriber pattern.
 * All UI state flows through this module.
 */

const _subscribers = new Map();
let _state = {
  authenticated: false,
  user: null,
  currentPage: 'dashboard',
  authView: 'login',    // login | forgot | reset | 2fa
  pending2FA: null,
  pendingResetToken: null,
  layoutRendered: false,
  sidebarCollapsed: localStorage.getItem('sidebar_collapsed') === 'true',
  customizeDirty: false,
};

/**
 * Get a copy of the current state (or a single key).
 */
export function getState(key) {
  if (key) return _state[key];
  return { ..._state };
}

/**
 * Update state and notify subscribers for changed keys.
 * @param {Object} partial - Key/value pairs to merge into state
 */
export function setState(partial) {
  const changedKeys = [];
  for (const [key, value] of Object.entries(partial)) {
    if (_state[key] !== value) {
      _state[key] = value;
      changedKeys.push(key);
    }
  }

  // Notify subscribers
  for (const key of changedKeys) {
    const subs = _subscribers.get(key);
    if (subs) {
      subs.forEach(fn => fn(_state[key], _state));
    }
  }

  // Notify wildcard subscribers on any change
  if (changedKeys.length) {
    const wildcards = _subscribers.get('*');
    if (wildcards) {
      wildcards.forEach(fn => fn(_state, changedKeys));
    }
  }
}

/**
 * Subscribe to state changes for a specific key or '*' for all changes.
 * @param {string} key - State key to watch (or '*' for all)
 * @param {Function} callback - (newValue, fullState) => void
 * @returns {Function} Unsubscribe function
 */
export function subscribe(key, callback) {
  if (!_subscribers.has(key)) _subscribers.set(key, new Set());
  _subscribers.get(key).add(callback);
  return () => _subscribers.get(key).delete(callback);
}

/**
 * Reset auth state (used on logout).
 */
export function resetAuth() {
  setState({
    authenticated: false,
    user: null,
    currentPage: 'dashboard',
    authView: 'login',
    pending2FA: null,
    pendingResetToken: null,
    layoutRendered: false,
    customizeDirty: false,
  });
}
