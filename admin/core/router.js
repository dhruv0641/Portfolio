/**
 * ═══════════════════════════════════════════════════════════
 * Admin Panel — Hash Router Module
 * ═══════════════════════════════════════════════════════════
 * Minimal SPA router using hash fragments.
 */

const VALID_PAGES = ['dashboard', 'projects', 'services', 'messages', 'audit', 'settings', 'customize'];
let _onNavigate = null;

/**
 * Register a callback invoked on every route change.
 * @param {Function} handler - (page: string) => void
 */
export function onNavigate(handler) {
  _onNavigate = handler;
}

/**
 * Navigate to a page by setting the hash.
 * @param {string} page - One of VALID_PAGES
 */
export function navigate(page) {
  if (!VALID_PAGES.includes(page)) page = 'dashboard';
  window.location.hash = page;
  if (_onNavigate) _onNavigate(page);
}

/**
 * Get the current page from the URL hash.
 * @returns {string}
 */
export function currentPage() {
  const hash = window.location.hash.replace('#', '');
  return VALID_PAGES.includes(hash) ? hash : 'dashboard';
}

/**
 * Init the router — listen for hash changes.
 */
export function initRouter() {
  window.addEventListener('hashchange', () => {
    const page = currentPage();
    if (_onNavigate) _onNavigate(page);
  });
}

export { VALID_PAGES };
