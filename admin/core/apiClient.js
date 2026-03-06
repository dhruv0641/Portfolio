/**
 * ═══════════════════════════════════════════════════════════
 * Admin Panel — API Client Module
 * ═══════════════════════════════════════════════════════════
 * Centralized API communication with automatic token refresh,
 * error handling, and request/response interceptors.
 * All auth is cookie-based (HTTP-only) — no localStorage.
 */

const API_BASE = window.location.origin + '/api';

let _onUnauthorized = null;

/**
 * Set the handler called when a 401 is received and refresh fails.
 * Typically this triggers a logout/redirect to login.
 */
export function onUnauthorized(handler) {
  _onUnauthorized = handler;
}

/**
 * Core API request function.
 * Automatically sends cookies, retries on 401 via refresh, and parses JSON.
 * @param {string} endpoint - API path (e.g. '/projects')
 * @param {RequestInit} [options] - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function api(endpoint, options = {}) {
  const url = API_BASE + endpoint;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Always send HTTP-only cookies
  };

  let res = await fetch(url, config);

  // Auto-refresh on 401 (except for auth endpoints themselves)
  if (res.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/refresh')) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await fetch(url, config);
    } else {
      if (_onUnauthorized) _onUnauthorized();
      throw new Error('Session expired');
    }
  }

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || `API Error (${res.status})`);
    err.status = res.status;
    err.details = data.details;
    throw err;
  }

  return data;
}

/**
 * Attempt to refresh the access token using the refresh cookie.
 * @returns {Promise<boolean>} true if refresh succeeded
 */
async function tryRefresh() {
  try {
    const res = await fetch(API_BASE + '/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Convenience methods
export const get = (endpoint) => api(endpoint, { method: 'GET' });
export const post = (endpoint, body) => api(endpoint, { method: 'POST', body: JSON.stringify(body) });
export const put = (endpoint, body) => api(endpoint, { method: 'PUT', body: JSON.stringify(body) });
export const patch = (endpoint, body) => api(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
export const del = (endpoint) => api(endpoint, { method: 'DELETE' });

/**
 * Check if the current session is active (cookie-based).
 * @returns {Promise<{authenticated: boolean, user: object|null}>}
 */
export async function checkSession() {
  try {
    const res = await fetch(API_BASE + '/auth/me', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      return { authenticated: true, user: data };
    }
  } catch { /* ignore */ }
  return { authenticated: false, user: null };
}
