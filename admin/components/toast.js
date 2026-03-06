/**
 * ═══════════════════════════════════════════════════════════
 * Admin Panel — Toast Notification Component
 * ═══════════════════════════════════════════════════════════
 */

let _counter = 0;
let _container = null;

function getContainer() {
  if (!_container) {
    _container = document.getElementById('toast-container');
    if (!_container) {
      _container = document.createElement('div');
      _container.id = 'toast-container';
      _container.setAttribute('role', 'status');
      _container.setAttribute('aria-live', 'polite');
      document.body.appendChild(_container);
    }
  }
  return _container;
}

/**
 * Show a toast notification.
 * @param {string} message - Toast message text
 * @param {'success'|'error'|'warning'|'info'} [type='success']
 * @param {number} [duration=4000] - Auto-dismiss time in ms
 */
export function showToast(message, type = 'success', duration = 4000) {
  _counter++;
  const container = getContainer();
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.setAttribute('role', 'alert');

  const TOAST_ICONS = {
    success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  el.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</span>
    <span class="toast-msg">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Dismiss">&times;</button>
  `;

  el.querySelector('.toast-close').addEventListener('click', () => dismiss(el));
  container.appendChild(el);

  // Auto-dismiss
  const timer = setTimeout(() => dismiss(el), duration);
  el._timer = timer;
}

function dismiss(el) {
  if (el._timer) clearTimeout(el._timer);
  el.classList.add('toast-exit');
  el.addEventListener('animationend', () => el.remove());
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
