/**
 * ═══════════════════════════════════════════════════════════
 * Admin Panel — DOM Utilities
 * ═══════════════════════════════════════════════════════════
 * Shared DOM helpers used across pages and components.
 */

/**
 * querySelector shorthand.
 */
export function qs(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * querySelectorAll as array.
 */
export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * Escape HTML entities to prevent XSS.
 */
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Create a skeleton loading element.
 * @param {number} [lines=3]
 * @returns {string} HTML string with skeleton lines
 */
export function skeleton(lines = 3) {
  return Array.from({ length: lines }, () =>
    '<div class="skeleton-line"></div>'
  ).join('');
}

/**
 * Animate a number counting up.
 * @param {HTMLElement} el
 * @param {number} target
 * @param {string} [suffix='']
 * @param {number} [duration=1200]
 */
export function animateCounter(el, target, suffix = '', duration = 1200) {
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    el.textContent = Math.floor(progress * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(step);
}

/**
 * Set a button into loading state.
 * @param {HTMLButtonElement} btn
 * @param {boolean} loading
 * @param {string} [loadingText='Loading...']
 */
export function setButtonLoading(btn, loading, loadingText = 'Loading...') {
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> ${escapeHtml(loadingText)}`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
    delete btn.dataset.originalText;
  }
}

/**
 * Format a date string for display.
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Time ago helper.
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
export function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}
