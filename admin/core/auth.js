/**
 * ═══════════════════════════════════════════════════════════
 * Admin Panel — Auth Module
 * ═══════════════════════════════════════════════════════════
 * Login, logout, 2FA verification, session management.
 * All token storage is cookie-based (HTTP-only).
 */
import { api, checkSession } from './apiClient.js';
import { setState, getState, resetAuth } from './state.js';

const API_BASE = window.location.origin + '/api';

/**
 * Attempt login with username/password.
 * On success, the server sets HTTP-only cookies.
 * @returns {{ requires2FA?: boolean, tempToken?: string }}
 */
export async function login(username, password) {
  const res = await fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Login failed');
    err.lockoutMinutes = data.lockoutMinutes;
    throw err;
  }

  if (data.requires2FA) {
    setState({ pending2FA: { tempToken: data.tempToken }, authView: '2fa' });
    return { requires2FA: true };
  }

  setState({ authenticated: true, user: { username }, currentPage: 'dashboard' });
  window.location.hash = 'dashboard';
  return { requires2FA: false };
}

/**
 * Verify 2FA TOTP code.
 */
export async function verify2FA(totpCode) {
  const pending = getState('pending2FA');
  if (!pending) throw new Error('No pending 2FA session');

  const res = await fetch(API_BASE + '/auth/verify-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempToken: pending.tempToken, totpCode }),
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Invalid code');

  setState({ authenticated: true, pending2FA: null, user: { username: 'admin' }, currentPage: 'dashboard' });
  window.location.hash = 'dashboard';
}

/**
 * Logout — clear cookies server-side and reset local state.
 */
export async function logout() {
  try {
    await fetch(API_BASE + '/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  } catch { /* ignore */ }
  resetAuth();
  window.location.hash = '';
}

/**
 * Restore session on page load using HTTP-only cookie.
 * @returns {boolean} true if session is active
 */
export async function restoreSession() {
  const { authenticated, user } = await checkSession();
  if (authenticated) {
    setState({ authenticated: true, user });
  }
  return authenticated;
}
