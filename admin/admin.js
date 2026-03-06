/**
 * ADMIN.JS — Cybersecurity SOC Dashboard
 * Single-page app with client-side routing, JWT auth, full CRUD
 * SVG icon system · Hash routing · Custom modals · Animated UI
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     SVG ICON SYSTEM (Lucide-based)
     ═══════════════════════════════════════════ */
  var ICONS = {
    'dashboard':     '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    'shield':        '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    'shield-check':  '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    'lock':          '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',
    'mail':          '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>',
    'inbox':         '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>',
    'clipboard':     '<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
    'settings':      '<path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/><circle cx="12" cy="12" r="3"/>',
    'log-out':       '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    'cloud':         '<path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>',
    'alert-triangle':'<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'activity':      '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    'search':        '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    'filter':        '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    'plus':          '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    'edit':          '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    'trash':         '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>',
    'eye':           '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off':       '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
    'check':         '<polyline points="20 6 9 17 4 12"/>',
    'x':             '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
    'chevron-down':  '<polyline points="6 9 12 15 18 9"/>',
    'menu':          '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    'bell':          '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>',
    'star':          '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    'external-link': '<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    'user':          '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'key':           '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
    'globe':         '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>',
    'sidebar':       '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>',
    'refresh':       '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>',
    'info':          '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    'map-pin':       '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
    'link':          '<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>',
    'terminal':      '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
    'server':        '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
    'palette':       '<circle cx="13.5" cy="6.5" r="0.5"/><circle cx="17.5" cy="10.5" r="0.5"/><circle cx="8.5" cy="7.5" r="0.5"/><circle cx="6.5" cy="12.5" r="0.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    'sliders':       '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    'layout':        '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
    'type':          '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
    'zap':           '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    'code':          '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    'monitor':       '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    'target':        '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    'database':      '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>'
  };

  function icon(name, size) {
    var s = size || 20;
    var p = ICONS[name];
    if (!p) return '';
    return '<svg class="icon" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }

  /* ═══════════════════════════════════════════
     STATE
     ═══════════════════════════════════════════ */
  var API = window.location.origin + '/api';
  var app = document.getElementById('app');

  var token = localStorage.getItem('admin_token') || null;
  var currentPage = 'dashboard';
  var pending2FA = null;
  var authView = 'login';
  var pendingResetToken = null;
  var layoutRendered = false;
  var sidebarCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  var _customizeDirty = false;

  /* ═══════════════════════════════════════════
     API HELPER (supports cookie & Bearer auth)
     ═══════════════════════════════════════════ */
  async function api(endpoint, options) {
    options = options || {};
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    try {
      var res = await fetch(API + endpoint, {
        ...options,
        headers: headers,
        credentials: 'include'
      });

      if (res.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        var refreshed = await tryRefreshToken();
        if (refreshed) {
          if (token) headers['Authorization'] = 'Bearer ' + token;
          var retry = await fetch(API + endpoint, { ...options, headers: headers, credentials: 'include' });
          var retryData = await retry.json();
          if (!retry.ok) throw new Error(retryData.error || 'API Error');
          return retryData;
        }
        logout();
        throw new Error('Session expired');
      }

      var data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API Error');
      return data;
    } catch (err) {
      if (err.message !== 'Session expired') showToast(err.message, 'error');
      throw err;
    }
  }

  async function tryRefreshToken() {
    try {
      var res = await fetch(API + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!res.ok) return false;
      var data = await res.json();
      if (data.accessToken) {
        token = data.accessToken;
        localStorage.setItem('admin_token', token);
      }
      return true;
    } catch (e) { return false; }
  }

  /* ═══════════════════════════════════════════
     TOAST
     ═══════════════════════════════════════════ */
  var _toastCounter = 0;
  function showToast(msg, type) {
    type = type || 'success';
    _toastCounter++;
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'assertive');
    var ic = type === 'success' ? icon('check', 16) : icon('alert-triangle', 16);
    el.innerHTML = '<span class="toast-icon">' + ic + '</span><span class="toast-msg">' + escapeHtml(msg) + '</span><button class="toast-close" aria-label="Dismiss">' + icon('x', 14) + '</button>';
    document.body.appendChild(el);
    // Stack: position based on existing toasts
    var existingToasts = document.querySelectorAll('.toast');
    var bottomOffset = 24;
    for (var i = 0; i < existingToasts.length; i++) {
      if (existingToasts[i] !== el) bottomOffset += existingToasts[i].offsetHeight + 8;
    }
    el.style.bottom = bottomOffset + 'px';
    function removeToast() {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px) translateZ(0)';
      setTimeout(function() {
        if (el.parentNode) el.remove();
        repositionToasts();
      }, 200);
    }
    el.querySelector('.toast-close').addEventListener('click', removeToast);
    if (type !== 'error') {
      setTimeout(removeToast, 3500);
    }
  }

  function repositionToasts() {
    var toasts = document.querySelectorAll('.toast');
    var bottomOffset = 24;
    toasts.forEach(function(t) {
      t.style.bottom = bottomOffset + 'px';
      bottomOffset += t.offsetHeight + 8;
    });
  }

  /* ═══════════════════════════════════════════
     UTILITIES
     ═══════════════════════════════════════════ */
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function animateCounter(element, target, duration) {
    duration = duration || 800;
    var startTime = performance.now();
    function update(currentTime) {
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function skeleton(type, count) {
    count = count || 3;
    if (type === 'stats') {
      var cards = '';
      for (var i = 0; i < 5; i++) {
        cards += '<div class="stat-card skeleton-card"><div class="skeleton skeleton-circle" style="width:40px;height:40px;border-radius:10px"></div><div class="skeleton skeleton-text" style="width:50%;height:24px;margin-top:12px"></div><div class="skeleton skeleton-text" style="width:70%;height:12px;margin-top:8px"></div></div>';
      }
      return '<div class="stats-grid">' + cards + '</div>';
    }
    if (type === 'cards') {
      var items = '';
      for (var j = 0; j < count; j++) {
        items += '<div class="item-card skeleton-card"><div style="display:flex;gap:12px;align-items:center"><div class="skeleton skeleton-circle" style="width:42px;height:42px;border-radius:10px"></div><div style="flex:1"><div class="skeleton skeleton-text" style="width:65%;height:14px"></div><div class="skeleton skeleton-text" style="width:45%;height:11px;margin-top:8px"></div></div></div></div>';
      }
      return '<div class="item-cards">' + items + '</div>';
    }
    return '<div class="skeleton skeleton-text" style="width:100%;height:100px"></div>';
  }

  /* ═══════════════════════════════════════════
     DATA CACHE
     ═══════════════════════════════════════════ */
  var _cache = { projects: null, services: null, messages: null };
  function invalidateCache(key) {
    if (key) _cache[key] = null;
    else { _cache.projects = null; _cache.services = null; _cache.messages = null; }
  }

  /* ═══════════════════════════════════════════
     BUTTON LOADING STATE
     ═══════════════════════════════════════════ */
  function setButtonLoading(btn, loading, text) {
    if (!btn) return;
    if (loading) {
      btn._origHtml = btn._origHtml || btn.innerHTML;
      btn.disabled = true;
      btn.classList.add('btn-loading');
      btn.innerHTML = '<span class="btn-spinner"></span> ' + (text || 'Processing...');
    } else {
      btn.disabled = false;
      btn.classList.remove('btn-loading');
      btn.innerHTML = btn._origHtml || btn.innerHTML;
      delete btn._origHtml;
    }
  }

  /* ═══════════════════════════════════════════
     PAGINATION HELPER
     ═══════════════════════════════════════════ */
  function renderPagination(containerId, currentPg, totalPages, totalItems, itemName, onPageChange) {
    var el = document.getElementById(containerId);
    if (!el) return;
    if (totalPages <= 1) {
      el.innerHTML = totalItems > 0 ? '<div class="pagination"><span class="pagination-info">' + totalItems + ' ' + itemName + (totalItems !== 1 ? 's' : '') + '</span></div>' : '';
      return;
    }
    var html = '<div class="pagination">';
    html += '<button class="pagination-btn" data-pg="prev"' + (currentPg <= 1 ? ' disabled' : '') + '>&laquo;</button>';
    for (var i = 1; i <= totalPages; i++) {
      html += '<button class="pagination-btn' + (i === currentPg ? ' active' : '') + '" data-pg="' + i + '">' + i + '</button>';
    }
    html += '<button class="pagination-btn" data-pg="next"' + (currentPg >= totalPages ? ' disabled' : '') + '>&raquo;</button>';
    html += '<span class="pagination-info">' + totalItems + ' ' + itemName + (totalItems !== 1 ? 's' : '') + '</span>';
    html += '</div>';
    el.innerHTML = html;
    el.querySelectorAll('.pagination-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var pg = btn.dataset.pg;
        if (pg === 'prev') onPageChange(Math.max(1, currentPg - 1));
        else if (pg === 'next') onPageChange(Math.min(totalPages, currentPg + 1));
        else onPageChange(parseInt(pg, 10));
      });
    });
  }

  /* ═══════════════════════════════════════════
     OVERFLOW MENU (mobile card actions)
     ═══════════════════════════════════════════ */
  function showOverflowMenu(triggerBtn, actions) {
    closeOverflowMenu();
    var card = triggerBtn.closest('.item-card');
    if (!card) return;
    var backdrop = document.createElement('div');
    backdrop.className = 'overflow-menu-backdrop';
    var menu = document.createElement('div');
    menu.className = 'overflow-menu';
    menu.setAttribute('role', 'menu');
    actions.forEach(function(a) {
      var btn = document.createElement('button');
      btn.className = 'overflow-menu-item' + (a.danger ? ' overflow-menu-item--danger' : '');
      btn.setAttribute('role', 'menuitem');
      btn.innerHTML = icon(a.icon, 14) + ' ' + a.label;
      btn.addEventListener('click', function() { closeOverflowMenu(); a.action(); });
      menu.appendChild(btn);
    });
    // Backdrop on body for click-outside detection
    document.body.appendChild(backdrop);
    // Menu inside the card so it scrolls with it
    card.style.zIndex = '10';
    card.appendChild(menu);
    // Boundary: if menu goes below viewport, open upward
    var menuRect = menu.getBoundingClientRect();
    if (menuRect.bottom > window.innerHeight - 8) {
      menu.style.top = 'auto';
      menu.style.bottom = '100%';
      menu.style.marginTop = '0';
      menu.style.marginBottom = '4px';
    }
    // Boundary: if menu goes off right side
    if (menuRect.right > window.innerWidth - 8) {
      menu.style.right = '0';
    }
    backdrop.addEventListener('click', closeOverflowMenu);
    // Close on scroll
    var scrollContainer = document.querySelector('.main-content') || window;
    var scrollHandler = function() { closeOverflowMenu(); };
    scrollContainer.addEventListener('scroll', scrollHandler, { once: true, passive: true });
    window.addEventListener('scroll', scrollHandler, { once: true, capture: true });
    // Close on ESC
    var escHandler = function(e) { if (e.key === 'Escape') closeOverflowMenu(); };
    document.addEventListener('keydown', escHandler);
    menu._cleanup = function() {
      card.style.zIndex = '';
      scrollContainer.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('scroll', scrollHandler, { capture: true });
      document.removeEventListener('keydown', escHandler);
    };
  }

  function closeOverflowMenu() {
    var m = document.querySelector('.overflow-menu');
    var b = document.querySelector('.overflow-menu-backdrop');
    if (m) { if (m._cleanup) m._cleanup(); m.remove(); }
    if (b) b.remove();
  }

  /* ═══════════════════════════════════════════
     CUSTOM CONFIRM DIALOG
     ═══════════════════════════════════════════ */
  function customConfirm(message, options) {
    options = options || {};
    return new Promise(function (resolve) {
      var type = options.type || 'warning';
      var title = options.title || 'Confirm Action';
      var confirmText = options.confirmText || (type === 'danger' ? 'Delete' : 'Confirm');
      var ic = type === 'danger' ? icon('alert-triangle', 28) : icon('info', 28);

      var backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.setAttribute('role', 'dialog');
      backdrop.setAttribute('aria-modal', 'true');
      backdrop.innerHTML =
        '<div class="modal" style="max-width:420px">' +
          '<div class="modal-header">' +
            '<h3 class="modal-title">' + icon('shield', 18) + ' ' + escapeHtml(title) + '</h3>' +
          '</div>' +
          '<div class="modal-body" style="text-align:center;padding-top:var(--sp-8);padding-bottom:var(--sp-8)">' +
            '<div class="confirm-icon confirm-icon--' + type + '">' + ic + '</div>' +
            '<p class="confirm-message">' + escapeHtml(message) + '</p>' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button class="btn btn-ghost confirm-cancel">Cancel</button>' +
            '<button class="btn ' + (type === 'danger' ? 'btn-danger' : 'btn-primary') + ' confirm-ok">' + escapeHtml(confirmText) + '</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(backdrop);

      function cleanup(result) {
        document.removeEventListener('keydown', onKey);
        backdrop.remove();
        resolve(result);
      }

      backdrop.querySelector('.confirm-cancel').addEventListener('click', function () { cleanup(false); });
      backdrop.querySelector('.confirm-ok').addEventListener('click', function () { cleanup(true); });
      backdrop.addEventListener('click', function (e) { if (e.target === backdrop) cleanup(false); });

      function onKey(e) {
        if (e.key === 'Escape') cleanup(false);
      }
      document.addEventListener('keydown', onKey);

      trapFocus(backdrop);
      backdrop.querySelector('.confirm-ok').focus();
    });
  }

  /* ═══════════════════════════════════════════
     FOCUS TRAPPING
     ═══════════════════════════════════════════ */
  function trapFocus(element) {
    var focusable = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    element.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  // Scroll focused input into view when mobile keyboard opens
  function enableModalInputScroll(modalEl) {
    var body = modalEl.querySelector('.modal-body');
    if (!body) return;
    body.querySelectorAll('input, textarea, select').forEach(function(input) {
      input.addEventListener('focus', function() {
        setTimeout(function() {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      });
    });
  }

  /* ═══════════════════════════════════════════
     AUTH
     ═══════════════════════════════════════════ */
  async function logout() {
    try {
      await fetch(API + '/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
    } catch (e) { /* ignore */ }
    token = null;
    pending2FA = null;
    authView = 'login';
    pendingResetToken = null;
    layoutRendered = false;
    localStorage.removeItem('admin_token');
    window.location.hash = '';
    render();
  }

  function isLoggedIn() { return !!token; }

  /* ═══════════════════════════════════════════
     HASH ROUTER
     ═══════════════════════════════════════════ */
  function navigate(page) {
    closeOverflowMenu();
    currentPage = page;
    window.location.hash = page;
    renderContent();
  }

  function getPageFromHash() {
    var hash = window.location.hash.replace('#', '');
    var valid = ['dashboard', 'projects', 'services', 'messages', 'audit', 'settings', 'customize'];
    return valid.indexOf(hash) !== -1 ? hash : 'dashboard';
  }

  window.addEventListener('hashchange', function () {
    closeOverflowMenu();
    if (!isLoggedIn()) return;
    var page = getPageFromHash();
    if (page !== currentPage) {
      currentPage = page;
      renderContent();
    }
  });

  window.addEventListener('beforeunload', function (e) {
    if (_customizeDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  /* ═══════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════ */
  function render() {
    if (pending2FA) {
      layoutRendered = false;
      render2FAVerify();
    } else if (!isLoggedIn()) {
      layoutRendered = false;
      if (authView === 'forgot') renderForgotPassword();
      else if (authView === 'reset') renderResetPassword();
      else renderLogin();
    } else {
      if (!layoutRendered) {
        currentPage = getPageFromHash();
        renderDashboard();
        layoutRendered = true;
      }
      renderContent();
    }
  }

  function renderContent() {
    var pageContent = document.getElementById('page-content');
    if (!pageContent) {
      layoutRendered = false;
      currentPage = getPageFromHash();
      renderDashboard();
      layoutRendered = true;
      pageContent = document.getElementById('page-content');
      if (!pageContent) return;
    }
    updateActiveNav();
    updateTopbar();
    switch (currentPage) {
      case 'dashboard': renderOverview(pageContent); break;
      case 'projects':  renderProjects(pageContent); break;
      case 'services':  renderServices(pageContent); break;
      case 'messages':  renderMessages(pageContent); break;
      case 'audit':     renderAuditLog(pageContent); break;
      case 'settings':  renderSettings(pageContent); break;
      case 'customize': renderCustomize(pageContent); break;
      default:          renderOverview(pageContent);
    }
  }

  function updateActiveNav() {
    var links = document.querySelectorAll('#sidebar-nav a[data-page]');
    links.forEach(function (a) {
      var isActive = a.dataset.page === currentPage;
      a.classList.toggle('active', isActive);
      if (isActive) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function updateTopbar() {
    var names = { dashboard: 'Dashboard', projects: 'Projects', services: 'Services', messages: 'Messages', audit: 'Audit Log', settings: 'Settings', customize: 'Customize' };
    var title = names[currentPage] || 'Dashboard';
    var el = document.getElementById('topbar-title');
    if (el) el.textContent = title;
    var bc = document.getElementById('topbar-breadcrumb');
    if (bc) bc.textContent = '/ SOC / ' + title;
  }

  /* ═══════════════════════════════════════════
     CYBER BACKGROUND ANIMATION
     ═══════════════════════════════════════════ */
  function initCyberBackground() {
    if (window.innerWidth <= 768) return;
    var canvas = document.getElementById('cyber-bg');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var PARTICLE_COUNT = 40;
    var CONNECTION_DIST = 140;
    var animId = null;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.5 + 0.5,
          o: Math.random() * 0.4 + 0.1
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            var opacity = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.strokeStyle = 'rgba(0, 245, 255, ' + opacity + ')';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (var k = 0; k < particles.length; k++) {
        var p = particles[k];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 245, 255, ' + p.o + ')';
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    }

    resize();
    createParticles();
    animate();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
      } else {
        if (!animId) animate();
      }
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        createParticles();
      }, 200);
    });
  }

  /* ═══════════════════════════════════════════
     PASSWORD TOGGLE HELPER
     ═══════════════════════════════════════════ */
  function bindPasswordToggles(container) {
    (container || document).querySelectorAll('.toggle-pass').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = document.getElementById(btn.dataset.target);
        if (!input) return;
        var isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.innerHTML = isHidden ? icon('eye-off', 16) : icon('eye', 16);
        btn.title = isHidden ? 'Hide password' : 'Show password';
      });
    });
  }

  /* ═══════════════════════════════════════════
     LOGIN PAGE
     ═══════════════════════════════════════════ */
  function renderLogin() {
    app.innerHTML =
      '<div class="login-wrapper">' +
        '<div class="login-card">' +
          '<div class="shield-anim">' +
            '<div class="shield-ring"></div>' +
            '<div class="shield-ring" style="animation-delay:0.8s"></div>' +
            '<div class="shield-icon">' + icon('shield', 40) + '</div>' +
          '</div>' +
          '<div class="login-logo">Dhruvkumar Dobariya</div>' +
          '<p class="login-subtitle">Security Operations Center</p>' +
          '<form id="login-form">' +
            '<div class="form-group">' +
              '<label class="form-label">Username</label>' +
              '<input type="text" class="form-input" id="login-user" placeholder="admin" autocomplete="username" required>' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Password</label>' +
              '<div class="password-wrap">' +
                '<input type="password" class="form-input" id="login-pass" placeholder="Enter password" autocomplete="current-password" required>' +
                '<button type="button" class="toggle-pass" data-target="login-pass" title="Show password">' + icon('eye', 16) + '</button>' +
              '</div>' +
            '</div>' +
            '<button type="submit" class="btn btn-primary btn-block" style="margin-top:var(--sp-2)">' + icon('lock', 16) + ' Sign In</button>' +
            '<p id="login-error" class="form-error"></p>' +
            '<p style="text-align:center;margin-top:var(--sp-4)">' +
              '<a href="#" id="forgot-password-link" class="forgot-link">Forgot Password?</a>' +
            '</p>' +
          '</form>' +
        '</div>' +
      '</div>';

    bindPasswordToggles();

    document.getElementById('login-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var user = document.getElementById('login-user').value.trim();
      var pass = document.getElementById('login-pass').value;
      var errEl = document.getElementById('login-error');

      try {
        var res = await fetch(API + '/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username: user, password: pass })
        });
        var data = await res.json();

        if (!res.ok) {
          errEl.style.display = 'block';
          errEl.textContent = data.error || 'Invalid username or password';
          if (data.lockoutMinutes) {
            errEl.textContent += ' Account locked for ' + data.lockoutMinutes + ' minutes.';
          }
          return;
        }

        if (data.requires2FA) {
          pending2FA = { tempToken: data.tempToken };
          render();
          return;
        }

        token = data.accessToken || data.token;
        localStorage.setItem('admin_token', token);
        currentPage = 'dashboard';
        window.location.hash = 'dashboard';
        render();
      } catch (err) {
        errEl.style.display = 'block';
        errEl.textContent = 'Connection error. Is the API server running?';
      }
    });

    document.getElementById('forgot-password-link').addEventListener('click', function (e) {
      e.preventDefault();
      authView = 'forgot';
      render();
    });
  }

  /* ═══════════════════════════════════════════
     FORGOT PASSWORD PAGE
     ═══════════════════════════════════════════ */
  function renderForgotPassword() {
    app.innerHTML =
      '<div class="login-wrapper">' +
        '<div class="login-card">' +
          '<div class="shield-anim">' +
            '<div class="shield-ring"></div>' +
            '<div class="shield-ring" style="animation-delay:0.8s"></div>' +
            '<div class="shield-icon">' + icon('key', 36) + '</div>' +
          '</div>' +
          '<div class="login-logo">Dhruvkumar Dobariya</div>' +
          '<p class="login-subtitle">Password Recovery</p>' +
          '<p style="color:var(--text-muted);font-size:var(--text-sm);text-align:center;margin-bottom:var(--sp-6)">Enter your admin email to receive a reset code</p>' +
          '<form id="forgot-form">' +
            '<div class="form-group">' +
              '<label class="form-label">Email Address</label>' +
              '<input type="email" class="form-input" id="forgot-email" placeholder="your@email.com" autocomplete="email" required>' +
            '</div>' +
            '<button type="submit" class="btn btn-primary btn-block" style="margin-top:var(--sp-2)">' + icon('mail', 16) + ' Send Reset Code</button>' +
            '<p id="forgot-error" class="form-error"></p>' +
            '<p id="forgot-success" class="form-success"></p>' +
          '</form>' +
          '<div style="text-align:center;margin-top:var(--sp-5);display:flex;gap:var(--sp-4);justify-content:center">' +
            '<a href="#" id="back-to-login" class="forgot-link">' + icon('chevron-right', 14) + ' Back to Login</a>' +
            '<a href="#" id="have-reset-code" class="forgot-link">I have a code</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.getElementById('forgot-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var email = document.getElementById('forgot-email').value.trim();
      var errEl = document.getElementById('forgot-error');
      var successEl = document.getElementById('forgot-success');
      errEl.style.display = 'none';
      successEl.style.display = 'none';

      try {
        var res = await fetch(API + '/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: email })
        });
        var data = await res.json();

        if (!res.ok) {
          errEl.style.display = 'block';
          errEl.textContent = data.error || 'Something went wrong';
          return;
        }

        if (data.resetToken) pendingResetToken = data.resetToken;

        successEl.style.display = 'block';
        successEl.textContent = data.message || 'Check your server console for the reset code.';

        setTimeout(function () { authView = 'reset'; render(); }, 2000);
      } catch (err) {
        errEl.style.display = 'block';
        errEl.textContent = 'Connection error. Is the API server running?';
      }
    });

    document.getElementById('back-to-login').addEventListener('click', function (e) { e.preventDefault(); authView = 'login'; render(); });
    document.getElementById('have-reset-code').addEventListener('click', function (e) { e.preventDefault(); authView = 'reset'; render(); });
  }

  /* ═══════════════════════════════════════════
     RESET PASSWORD PAGE
     ═══════════════════════════════════════════ */
  function renderResetPassword() {
    app.innerHTML =
      '<div class="login-wrapper">' +
        '<div class="login-card">' +
          '<div class="shield-anim">' +
            '<div class="shield-ring"></div>' +
            '<div class="shield-ring" style="animation-delay:0.8s"></div>' +
            '<div class="shield-icon">' + icon('lock', 36) + '</div>' +
          '</div>' +
          '<div class="login-logo">Dhruvkumar Dobariya</div>' +
          '<p class="login-subtitle">Reset Password</p>' +
          '<p style="color:var(--text-muted);font-size:var(--text-sm);text-align:center;margin-bottom:var(--sp-6)">Enter your reset code and choose a new password</p>' +
          '<form id="reset-form">' +
            '<div class="form-group">' +
              '<label class="form-label">Reset Code</label>' +
              '<input type="text" class="form-input" id="reset-token" placeholder="Paste your reset code" value="' + (pendingResetToken || '') + '" required>' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">New Password</label>' +
              '<div class="password-wrap">' +
                '<input type="password" class="form-input" id="reset-new-pass" placeholder="Min 8 chars, mixed case + number" autocomplete="new-password" required>' +
                '<button type="button" class="toggle-pass" data-target="reset-new-pass" title="Show password">' + icon('eye', 16) + '</button>' +
              '</div>' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Confirm Password</label>' +
              '<div class="password-wrap">' +
                '<input type="password" class="form-input" id="reset-confirm-pass" placeholder="Re-enter password" autocomplete="new-password" required>' +
                '<button type="button" class="toggle-pass" data-target="reset-confirm-pass" title="Show password">' + icon('eye', 16) + '</button>' +
              '</div>' +
            '</div>' +
            '<button type="submit" class="btn btn-primary btn-block" style="margin-top:var(--sp-2)">' + icon('lock', 16) + ' Reset Password</button>' +
            '<p id="reset-error" class="form-error"></p>' +
            '<p id="reset-success" class="form-success"></p>' +
          '</form>' +
          '<p style="text-align:center;margin-top:var(--sp-5)">' +
            '<a href="#" id="back-to-login-reset" class="forgot-link">' + icon('chevron-right', 14) + ' Back to Login</a>' +
          '</p>' +
        '</div>' +
      '</div>';

    bindPasswordToggles();

    document.getElementById('reset-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var resetTokenVal = document.getElementById('reset-token').value.trim();
      var newPass = document.getElementById('reset-new-pass').value;
      var confirmPass = document.getElementById('reset-confirm-pass').value;
      var errEl = document.getElementById('reset-error');
      var successEl = document.getElementById('reset-success');
      errEl.style.display = 'none';
      successEl.style.display = 'none';

      if (newPass !== confirmPass) {
        errEl.style.display = 'block';
        errEl.textContent = 'Passwords do not match';
        return;
      }

      try {
        var res = await fetch(API + '/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token: resetTokenVal, newPassword: newPass })
        });
        var data = await res.json();

        if (!res.ok) {
          errEl.style.display = 'block';
          errEl.textContent = data.error || 'Reset failed';
          if (data.details) errEl.textContent = data.details.map(function (d) { return d.message; }).join('. ');
          return;
        }

        pendingResetToken = null;
        successEl.style.display = 'block';
        successEl.textContent = data.message || 'Password reset successfully!';

        setTimeout(function () { authView = 'login'; render(); }, 2500);
      } catch (err) {
        errEl.style.display = 'block';
        errEl.textContent = 'Connection error. Is the API server running?';
      }
    });

    document.getElementById('back-to-login-reset').addEventListener('click', function (e) {
      e.preventDefault();
      pendingResetToken = null;
      authView = 'login';
      render();
    });
  }

  /* ═══════════════════════════════════════════
     2FA VERIFICATION PAGE
     ═══════════════════════════════════════════ */
  function render2FAVerify() {
    app.innerHTML =
      '<div class="login-wrapper">' +
        '<div class="login-card">' +
          '<div class="shield-anim">' +
            '<div class="shield-ring"></div>' +
            '<div class="shield-ring" style="animation-delay:0.8s"></div>' +
            '<div class="shield-icon">' + icon('shield-check', 40) + '</div>' +
          '</div>' +
          '<div class="login-logo">Dhruvkumar Dobariya</div>' +
          '<p class="login-subtitle">Two-Factor Authentication</p>' +
          '<p style="color:var(--text-muted);font-size:var(--text-sm);text-align:center;margin-bottom:var(--sp-6)">Enter the 6-digit code from your authenticator app</p>' +
          '<form id="totp-form">' +
            '<div class="form-group">' +
              '<label class="form-label">Verification Code</label>' +
              '<input type="text" class="form-input" id="totp-code" placeholder="000000" maxlength="6" pattern="[0-9]{6}" autocomplete="one-time-code" inputmode="numeric" required style="text-align:center;font-size:1.5rem;letter-spacing:0.5rem">' +
            '</div>' +
            '<button type="submit" class="btn btn-primary btn-block" style="margin-top:var(--sp-2)">' + icon('shield-check', 16) + ' Verify</button>' +
            '<p id="totp-error" class="form-error"></p>' +
          '</form>' +
          '<button id="totp-cancel" style="background:none;border:none;color:var(--text-muted);font-size:var(--text-sm);cursor:pointer;margin-top:var(--sp-4);display:block;width:100%;text-align:center">' + icon('chevron-right', 14) + ' Back to Login</button>' +
        '</div>' +
      '</div>';

    var codeInput = document.getElementById('totp-code');
    codeInput.focus();

    document.getElementById('totp-cancel').addEventListener('click', function () { pending2FA = null; render(); });

    document.getElementById('totp-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var code = codeInput.value.trim();
      var errEl = document.getElementById('totp-error');

      if (!/^\d{6}$/.test(code)) {
        errEl.style.display = 'block';
        errEl.textContent = 'Please enter a 6-digit code';
        return;
      }

      try {
        var res = await fetch(API + '/auth/verify-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ tempToken: pending2FA.tempToken, totpCode: code })
        });
        var data = await res.json();

        if (!res.ok) {
          errEl.style.display = 'block';
          errEl.textContent = data.error || 'Invalid code';
          codeInput.value = '';
          codeInput.focus();
          return;
        }

        token = data.accessToken || data.token;
        localStorage.setItem('admin_token', token);
        pending2FA = null;
        currentPage = 'dashboard';
        window.location.hash = 'dashboard';
        render();
      } catch (err) {
        errEl.style.display = 'block';
        errEl.textContent = 'Connection error';
      }
    });
  }

  /* ═══════════════════════════════════════════
     MOBILE SIDEBAR HELPERS
     ═══════════════════════════════════════════ */
  function isMobile() { return window.innerWidth <= 768; }

  var _scrollY = 0; // saved scroll position for body lock

  function openSidebar() {
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.querySelector('.sidebar-overlay');
    var hamburger = document.getElementById('hamburger-btn');
    _scrollY = window.scrollY || window.pageYOffset || 0;
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    if (hamburger) hamburger.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('menu-open');
    document.body.style.top = '-' + _scrollY + 'px';
  }

  function closeSidebar() {
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.querySelector('.sidebar-overlay');
    var hamburger = document.getElementById('hamburger-btn');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    if (hamburger) hamburger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    window.scrollTo(0, _scrollY);
  }

  function toggleSidebarCollapse() {
    sidebarCollapsed = !sidebarCollapsed;
    localStorage.setItem('sidebar_collapsed', sidebarCollapsed);
    var layout = document.querySelector('.app-layout');
    if (layout) layout.classList.toggle('sidebar-collapsed', sidebarCollapsed);
  }

  /* ═══════════════════════════════════════════
     DASHBOARD LAYOUT (renders once)
     ═══════════════════════════════════════════ */
  function renderDashboard() {
    var navItems = [
      { page: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
      { page: 'projects',  icon: 'shield-check', label: 'Projects' },
      { page: 'services',  icon: 'server', label: 'Services' },
      { page: 'messages',  icon: 'mail', label: 'Messages' },
      { page: 'customize', icon: 'palette', label: 'Customize' },
      { page: 'audit',     icon: 'clipboard', label: 'Audit Log' },
      { page: 'settings',  icon: 'settings', label: 'Settings' }
    ];

    var navHtml = navItems.map(function (item) {
      return '<li><a href="#' + item.page + '" data-page="' + item.page + '" class="' + (currentPage === item.page ? 'active' : '') + '">' +
        '<span class="nav-icon">' + icon(item.icon, 18) + '</span>' +
        '<span class="nav-label">' + item.label + '</span>' +
      '</a></li>';
    }).join('');

    app.innerHTML =
      '<a class="skip-link" href="#page-content">Skip to content</a>' +
      '<div class="app-layout' + (sidebarCollapsed ? ' sidebar-collapsed' : '') + '">' +
        '<button class="hamburger-btn" id="hamburger-btn" aria-label="Open menu">' + icon('menu', 20) + '</button>' +
        '<div class="sidebar-overlay" id="sidebar-overlay"></div>' +
        '<aside class="sidebar" id="admin-sidebar" role="navigation">' +
          '<div class="sidebar-logo">' +
            '<span class="sidebar-logo-icon">' + icon('shield', 24) + '</span>' +
            '<span class="sidebar-logo-text">Dhruvkumar Dobariya<small>Security Operations</small></span>' +
          '</div>' +
          '<div class="sidebar-section-label">Navigation</div>' +
          '<ul class="sidebar-nav" id="sidebar-nav">' +
            navHtml +
            '<li style="margin-top:auto;padding-top:var(--sp-2)">' +
              '<button id="logout-btn">' +
                '<span class="nav-icon">' + icon('log-out', 18) + '</span>' +
                '<span class="nav-label">Logout</span>' +
              '</button>' +
            '</li>' +
          '</ul>' +
          '<div class="sidebar-footer">' +
            '<button class="sidebar-collapse-btn" id="sidebar-collapse-btn" title="Collapse sidebar">' +
              icon('sidebar', 16) + ' <span class="collapse-label">Collapse</span>' +
            '</button>' +
          '</div>' +
          '<div class="sidebar-user">' +
            '<span class="sidebar-user-avatar">DD</span>' +
            '<span class="sidebar-user-info">Logged in as <strong>admin</strong></span>' +
          '</div>' +
        '</aside>' +
        '<header class="topbar">' +
          '<div class="topbar-left">' +
            '<span class="topbar-title" id="topbar-title">Dashboard</span>' +
            '<span class="topbar-breadcrumb" id="topbar-breadcrumb">/ SOC / Dashboard</span>' +
          '</div>' +
          '<div class="topbar-right">' +
            '<button class="topbar-btn" id="topbar-logout-btn">' + icon('log-out', 14) + ' <span>Logout</span></button>' +
            '<div class="topbar-avatar">DD</div>' +
          '</div>' +
        '</header>' +
        '<main class="main-content" id="page-content"></main>' +
      '</div>';

    /* Event listeners */
    document.getElementById('hamburger-btn').addEventListener('click', function () {
      var sidebar = document.querySelector('.sidebar');
      if (sidebar && sidebar.classList.contains('open')) closeSidebar();
      else openSidebar();
    });

    document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);

    document.querySelectorAll('#sidebar-nav a[data-page]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (_customizeDirty && currentPage === 'customize') {
          customConfirm('Unsaved changes will be lost. Continue?', { title: 'Unsaved Changes', type: 'warning', confirmText: 'Continue' }).then(function(ok) {
            if (!ok) return;
            _customizeDirty = false;
            if (isMobile()) closeSidebar();
            navigate(a.dataset.page);
          });
          return;
        }
        if (isMobile()) closeSidebar();
        navigate(a.dataset.page);
      });
    });

    document.getElementById('logout-btn').addEventListener('click', function () {
      if (isMobile()) closeSidebar();
      logout();
    });

    document.getElementById('topbar-logout-btn').addEventListener('click', function () { logout(); });

    document.getElementById('sidebar-collapse-btn').addEventListener('click', function () {
      if (!isMobile()) toggleSidebarCollapse();
    });

    /* ESC to close sidebar on mobile */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isMobile()) closeSidebar();
    });

    /* Swipe left to close sidebar on mobile */
    (function() {
      var startX = 0, startY = 0, tracking = false;
      var sidebar = document.getElementById('admin-sidebar');
      if (!sidebar) return;
      sidebar.addEventListener('touchstart', function(e) {
        var t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        tracking = true;
      }, { passive: true });
      sidebar.addEventListener('touchend', function(e) {
        if (!tracking) return;
        tracking = false;
        var t = e.changedTouches[0];
        var dx = t.clientX - startX;
        var dy = Math.abs(t.clientY - startY);
        if (dx < -60 && dy < 80) closeSidebar();
      }, { passive: true });
    })();
  }

  /* ═══════════════════════════════════════════
     OVERVIEW PAGE
     ═══════════════════════════════════════════ */
  async function renderOverview(container) {
    container.innerHTML =
      '<div class="dashboard-hero">' +
        '<div class="hero-left">' +
          '<h1 class="page-title">Security Overview</h1>' +
          '<p class="page-subtitle">System status & threat monitoring</p>' +
          '<div class="health-indicator">' +
            '<span class="health-dot"></span>' +
            '<span>All Systems Operational</span>' +
          '</div>' +
        '</div>' +
        '<div class="hero-right">' +
          '<div class="threat-radar">' +
            '<div class="radar-center"></div>' +
            '<div class="radar-blip" style="top:25%;left:60%"></div>' +
            '<div class="radar-blip" style="top:65%;left:30%;animation-delay:1s"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      skeleton('stats') +
      '<div class="card">' +
        '<div class="card-header"><h3 class="card-title">' + icon('mail', 18) + ' Recent Messages</h3></div>' +
        '<div id="recent-messages">' + skeleton('cards', 2) + '</div>' +
      '</div>';

    try {
      var stats = await api('/dashboard/stats');
      var statsEl = container.querySelector('.stats-grid');
      if (!statsEl) return;

      statsEl.innerHTML =
        '<div class="stat-card"><div class="stat-icon">' + icon('shield-check', 20) + '</div><div class="stat-value" data-count="' + stats.totalProjects + '">0</div><div class="stat-label">Total Projects</div></div>' +
        '<div class="stat-card"><div class="stat-icon">' + icon('star', 20) + '</div><div class="stat-value" data-count="' + stats.featuredProjects + '">0</div><div class="stat-label">Featured</div></div>' +
        '<div class="stat-card"><div class="stat-icon">' + icon('server', 20) + '</div><div class="stat-value" data-count="' + stats.totalServices + '">0</div><div class="stat-label">Services</div></div>' +
        '<div class="stat-card"><div class="stat-icon">' + icon('mail', 20) + '</div><div class="stat-value" data-count="' + stats.totalMessages + '">0</div><div class="stat-label">Messages</div></div>' +
        '<div class="stat-card' + (stats.unreadMessages > 0 ? ' stat-card--alert' : '') + '"><div class="stat-icon">' + icon('bell', 20) + '</div><div class="stat-value" data-count="' + stats.unreadMessages + '">0</div><div class="stat-label">Unread</div>' + (stats.unreadMessages > 0 ? '<div class="scan-line"></div>' : '') + '</div>';

      /* Animated counters */
      statsEl.querySelectorAll('.stat-value[data-count]').forEach(function (el) {
        animateCounter(el, parseInt(el.dataset.count, 10));
      });

      var msgsEl = document.getElementById('recent-messages');
      if (!msgsEl) return;
      if (stats.recentMessages.length === 0) {
        msgsEl.innerHTML = '<div class="empty-state"><div class="empty-icon">' + icon('inbox', 36) + '</div><p>No messages yet</p></div>';
      } else {
        msgsEl.innerHTML = '<div class="item-cards item-cards--compact">' + stats.recentMessages.map(function (m) {
          return '<div class="item-card item-card--compact">' +
            '<div class="item-card-header">' +
              '<span class="item-card-icon" style="width:32px;height:32px">' + (m.status === 'unread' ? icon('bell', 16) : icon('mail', 16)) + '</span>' +
              '<div class="item-card-meta">' +
                '<h3 class="item-card-title" style="font-size:var(--text-sm)">' + escapeHtml(m.name) + '</h3>' +
                '<p class="item-card-desc" style="font-size:var(--text-xs)">' + escapeHtml(m.email) + '</p>' +
              '</div>' +
              '<span class="badge ' + (m.status === 'unread' ? 'badge-orange' : 'badge-green') + '">' + m.status + '</span>' +
            '</div>' +
          '</div>';
        }).join('') + '</div>';
      }
    } catch (err) {
      var sg = container.querySelector('.stats-grid');
      if (sg) sg.innerHTML = '<p style="color:var(--danger)">Failed to load stats. Is the API server running?</p>';
    }
  }

  /* ═══════════════════════════════════════════
     PROJECTS PAGE
     ═══════════════════════════════════════════ */
  async function renderProjects(container) {
    var _searchTerm = '';
    var _page = 1;
    var PER_PAGE = 10;

    container.innerHTML =
      '<div class="page-header">' +
        '<div><h1 class="page-title">Projects</h1><p class="page-subtitle">Manage your security lab projects</p></div>' +
        '<div class="page-header-actions">' +
          '<div class="search-bar"><span class="search-icon">' + icon('search', 16) + '</span><input class="form-input" id="projects-search" placeholder="Search projects..." type="text" aria-label="Search projects"></div>' +
          '<button class="btn btn-primary" id="add-project-btn">' + icon('plus', 16) + ' Add Project</button>' +
        '</div>' +
      '</div>' +
      '<div id="projects-list">' + skeleton('cards', 3) + '</div>' +
      '<div id="projects-pagination"></div>';

    document.getElementById('add-project-btn').addEventListener('click', function () { showProjectModal(); });

    try {
      var projects = _cache.projects || await api('/projects');
      _cache.projects = projects;

      function getFiltered() {
        if (!_searchTerm) return projects;
        var term = _searchTerm.toLowerCase();
        return projects.filter(function(p) {
          return (p.title || '').toLowerCase().indexOf(term) !== -1 ||
                 (p.description || '').toLowerCase().indexOf(term) !== -1 ||
                 (p.technologies || []).join(' ').toLowerCase().indexOf(term) !== -1;
        });
      }

      function renderList() {
        var listEl = document.getElementById('projects-list');
        if (!listEl) return;
        var filtered = getFiltered();

        if (filtered.length === 0) {
          listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">' + icon('shield', 36) + '</div><p>' + (_searchTerm ? 'No projects match your search.' : 'No projects yet. Add your first one!') + '</p></div>';
          var pe = document.getElementById('projects-pagination');
          if (pe) pe.innerHTML = '';
          return;
        }

        var totalPages = Math.ceil(filtered.length / PER_PAGE);
        if (_page > totalPages) _page = totalPages;
        var start = (_page - 1) * PER_PAGE;
        var pageItems = filtered.slice(start, start + PER_PAGE);

        listEl.innerHTML = '<div class="item-cards">' + pageItems.map(function (p) {
          return '<div class="item-card">' +
            '<div class="item-card-header">' +
              '<span class="item-card-icon">' + icon('shield-check', 20) + '</span>' +
              '<div class="item-card-meta">' +
                '<h3 class="item-card-title">' + escapeHtml(p.title) + '</h3>' +
                '<p class="item-card-desc">' + escapeHtml((p.description || '').substring(0, 120)) + '</p>' +
              '</div>' +
              (p.featured ? '<span class="badge badge-green">' + icon('star', 10) + ' Featured</span>' : '') +
            '</div>' +
            ((p.technologies || []).length ? '<div class="item-card-tags">' + (p.technologies || []).map(function (t) { return '<span class="badge badge-cyan">' + escapeHtml(t) + '</span>'; }).join('') + '</div>' : '') +
            '<div class="item-card-actions">' +
              '<button class="btn btn-sm btn-ghost view-project" data-id="' + p.id + '">' + icon('eye', 14) + ' View</button>' +
              '<button class="btn btn-sm btn-ghost edit-project" data-id="' + p.id + '">' + icon('edit', 14) + ' Edit</button>' +
              '<button class="btn btn-sm btn-danger delete-project" data-id="' + p.id + '">' + icon('trash', 14) + ' Delete</button>' +
            '</div>' +
            '<button class="overflow-menu-trigger" data-id="' + p.id + '" aria-label="Actions">⋮</button>' +
          '</div>';
        }).join('') + '</div>';

        renderPagination('projects-pagination', _page, totalPages, filtered.length, 'project', function(pg) { _page = pg; renderList(); });

        listEl.querySelectorAll('.view-project').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var p = projects.find(function (x) { return x.id === btn.dataset.id; });
            if (p) showDetailModal('Project Details', [
              { label: 'Title', value: p.title },
              { label: 'Description', value: p.description || '\u2014' },
              { label: 'Technologies', value: (p.technologies || []).join(', ') || '\u2014' },
              { label: 'Impact', value: p.impact || '\u2014' },
              { label: 'GitHub', value: p.githubLink || '\u2014', isLink: true },
              { label: 'Featured', value: p.featured ? 'Yes' : 'No' },
              { label: 'Created', value: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '\u2014' }
            ]);
          });
        });

        listEl.querySelectorAll('.edit-project').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var project = projects.find(function (p) { return p.id === btn.dataset.id; });
            if (project) showProjectModal(project);
          });
        });

        listEl.querySelectorAll('.delete-project').forEach(function (btn) {
          btn.addEventListener('click', async function () {
            var p = projects.find(function (x) { return x.id === btn.dataset.id; });
            var name = p ? p.title : 'this project';
            var confirmed = await customConfirm('Are you sure you want to delete "' + name + '"? This action cannot be undone.', { title: 'Delete Project', type: 'danger' });
            if (!confirmed) return;
            setButtonLoading(btn, true, 'Deleting...');
            try {
              await api('/projects/' + btn.dataset.id, { method: 'DELETE' });
              invalidateCache('projects');
              showToast('Project deleted');
              renderProjects(container);
            } catch (err) { setButtonLoading(btn, false); }
          });
        });

        listEl.querySelectorAll('.overflow-menu-trigger').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var id = btn.dataset.id;
            showOverflowMenu(btn, [
              { icon: 'eye', label: 'View', action: function () { listEl.querySelector('.view-project[data-id="' + id + '"]').click(); } },
              { icon: 'edit', label: 'Edit', action: function () { listEl.querySelector('.edit-project[data-id="' + id + '"]').click(); } },
              { icon: 'trash', label: 'Delete', danger: true, action: function () { listEl.querySelector('.delete-project[data-id="' + id + '"]').click(); } }
            ]);
          });
        });

        // Card tap-to-view (entire card clickable)
        listEl.querySelectorAll('.item-card').forEach(function(card) {
          card.addEventListener('click', function(e) {
            if (e.target.closest('button, a, .overflow-menu-trigger')) return;
            var viewBtn = card.querySelector('.view-project');
            if (viewBtn) viewBtn.click();
          });
        });
      }

      document.getElementById('projects-search').addEventListener('input', function(e) {
        _searchTerm = e.target.value.trim();
        _page = 1;
        renderList();
      });

      renderList();
    } catch (err) { /* */ }
  }

  /* ─── View Details Modal ─── */
  function showDetailModal(title, fields) {
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.innerHTML =
      '<div class="modal detail-modal">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title">' + icon('info', 18) + ' ' + escapeHtml(title) + '</h3>' +
          '<button class="btn-icon modal-close">' + icon('x', 18) + '</button>' +
        '</div>' +
        '<div class="modal-body">' +
          fields.map(function (f) {
            var val = f.isLink && f.value && f.value !== '\u2014'
              ? '<a href="' + (f.linkPrefix || '') + escapeHtml(f.value) + '" target="_blank" rel="noopener">' + escapeHtml(f.value) + '</a>'
              : escapeHtml(f.value);
            return '<div class="detail-row"><span class="detail-label">' + escapeHtml(f.label) + '</span><span class="detail-value">' + val + '</span></div>';
          }).join('') +
        '</div>' +
        '<div class="modal-footer"><button class="btn btn-ghost modal-close">Close</button></div>' +
      '</div>';

    document.body.appendChild(backdrop);
    backdrop.querySelectorAll('.modal-close').forEach(function (b) { b.addEventListener('click', function () { backdrop.remove(); }); });
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) backdrop.remove(); });

    function onEsc(e) { if (e.key === 'Escape') { document.removeEventListener('keydown', onEsc); backdrop.remove(); } }
    document.addEventListener('keydown', onEsc);
    trapFocus(backdrop);
  }

  /* ─── Project Modal ─── */
  function showProjectModal(project) {
    var isEdit = !!project;
    project = project || {};
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.innerHTML =
      '<div class="modal">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title">' + icon(isEdit ? 'edit' : 'plus', 18) + ' ' + (isEdit ? 'Edit' : 'Add') + ' Project</h3>' +
          '<button class="btn-icon modal-close">' + icon('x', 18) + '</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="form-row"><div class="form-group"><label class="form-label">Title</label><input class="form-input" id="p-title" value="' + escapeHtml(project.title || '') + '" placeholder="SOC Log Analysis Lab"></div><div class="form-group"><label class="form-label">Emoji</label><input class="form-input" id="p-emoji" value="' + (project.emoji || '') + '" placeholder="(optional)"></div></div>' +
          '<div class="form-group"><label class="form-label">Description</label><textarea class="form-input form-textarea" id="p-desc" placeholder="Describe the project...">' + escapeHtml(project.description || '') + '</textarea></div>' +
          '<div class="form-row"><div class="form-group"><label class="form-label">Technologies (comma separated)</label><input class="form-input" id="p-tech" value="' + (project.technologies || []).join(', ') + '" placeholder="Splunk, SIEM, Python"></div><div class="form-group"><label class="form-label">GitHub Link</label><input class="form-input" id="p-github" value="' + escapeHtml(project.githubLink || '') + '" placeholder="https://github.com/..."></div></div>' +
          '<div class="form-group"><label class="form-label">Impact</label><input class="form-input" id="p-impact" value="' + escapeHtml(project.impact || '') + '" placeholder="Detected 15+ attack patterns..."></div>' +
          '<div class="form-group"><label class="form-check"><input type="checkbox" id="p-featured" ' + (project.featured ? 'checked' : '') + '> Featured project</label></div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost modal-cancel">Cancel</button>' +
          '<button class="btn btn-primary" id="p-save">' + (isEdit ? 'Save Changes' : 'Create Project') + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(backdrop);

    backdrop.querySelector('.modal-close').addEventListener('click', function () { backdrop.remove(); });
    backdrop.querySelector('.modal-cancel').addEventListener('click', function () { backdrop.remove(); });
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) backdrop.remove(); });

    function onEsc(e) { if (e.key === 'Escape') { document.removeEventListener('keydown', onEsc); backdrop.remove(); } }
    document.addEventListener('keydown', onEsc);
    trapFocus(backdrop);
    enableModalInputScroll(backdrop);

    document.getElementById('p-save').addEventListener('click', async function () {
      var body = {
        title: document.getElementById('p-title').value.trim(),
        emoji: document.getElementById('p-emoji').value.trim() || '',
        description: document.getElementById('p-desc').value.trim(),
        technologies: document.getElementById('p-tech').value.split(',').map(function (t) { return t.trim(); }).filter(Boolean),
        githubLink: document.getElementById('p-github').value.trim() || '#',
        impact: document.getElementById('p-impact').value.trim(),
        featured: document.getElementById('p-featured').checked
      };

      if (!body.title) { showToast('Title is required', 'error'); return; }

      var saveBtn = this;
      setButtonLoading(saveBtn, true, isEdit ? 'Saving...' : 'Creating...');
      try {
        if (isEdit) {
          await api('/projects/' + project.id, { method: 'PUT', body: JSON.stringify(body) });
          showToast('Project updated');
        } else {
          await api('/projects', { method: 'POST', body: JSON.stringify(body) });
          showToast('Project created');
        }
        invalidateCache('projects');
        backdrop.remove();
        document.removeEventListener('keydown', onEsc);
        renderProjects(document.getElementById('page-content'));
      } catch (err) { setButtonLoading(saveBtn, false); }
    });
  }

  /* ═══════════════════════════════════════════
     SERVICES PAGE
     ═══════════════════════════════════════════ */
  async function renderServices(container) {
    var _searchTerm = '';
    var _page = 1;
    var PER_PAGE = 10;

    container.innerHTML =
      '<div class="page-header">' +
        '<div><h1 class="page-title">Services</h1><p class="page-subtitle">Manage your cybersecurity service offerings</p></div>' +
        '<div class="page-header-actions">' +
          '<div class="search-bar"><span class="search-icon">' + icon('search', 16) + '</span><input class="form-input" id="services-search" placeholder="Search services..." type="text" aria-label="Search services"></div>' +
          '<button class="btn btn-primary" id="add-service-btn">' + icon('plus', 16) + ' Add Service</button>' +
        '</div>' +
      '</div>' +
      '<div id="services-list">' + skeleton('cards', 3) + '</div>' +
      '<div id="services-pagination"></div>';

    document.getElementById('add-service-btn').addEventListener('click', function () { showServiceModal(); });

    try {
      var services = _cache.services || await api('/services');
      _cache.services = services;

      function getFiltered() {
        if (!_searchTerm) return services;
        var term = _searchTerm.toLowerCase();
        return services.filter(function(s) {
          return (s.title || '').toLowerCase().indexOf(term) !== -1 ||
                 (s.description || '').toLowerCase().indexOf(term) !== -1;
        });
      }

      function renderList() {
        var listEl = document.getElementById('services-list');
        if (!listEl) return;
        var filtered = getFiltered();

        if (filtered.length === 0) {
          listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">' + icon('server', 36) + '</div><p>' + (_searchTerm ? 'No services match your search.' : 'No services yet.') + '</p></div>';
          var pe = document.getElementById('services-pagination');
          if (pe) pe.innerHTML = '';
          return;
        }

        var totalPages = Math.ceil(filtered.length / PER_PAGE);
        if (_page > totalPages) _page = totalPages;
        var start = (_page - 1) * PER_PAGE;
        var pageItems = filtered.slice(start, start + PER_PAGE);

        listEl.innerHTML = '<div class="item-cards">' + pageItems.map(function (s) {
          return '<div class="item-card">' +
            '<div class="item-card-header">' +
              '<span class="item-card-icon">' + icon('server', 20) + '</span>' +
              '<div class="item-card-meta">' +
                '<h3 class="item-card-title">' + escapeHtml(s.title) + '</h3>' +
                '<p class="item-card-desc">' + escapeHtml((s.description || '').substring(0, 120)) + '</p>' +
              '</div>' +
            '</div>' +
            '<div class="item-card-actions">' +
              '<button class="btn btn-sm btn-ghost view-service" data-id="' + s.id + '">' + icon('eye', 14) + ' View</button>' +
              '<button class="btn btn-sm btn-ghost edit-service" data-id="' + s.id + '">' + icon('edit', 14) + ' Edit</button>' +
              '<button class="btn btn-sm btn-danger delete-service" data-id="' + s.id + '">' + icon('trash', 14) + ' Delete</button>' +
            '</div>' +
            '<button class="overflow-menu-trigger" data-id="' + s.id + '" aria-label="Actions">⋮</button>' +
          '</div>';
        }).join('') + '</div>';

        renderPagination('services-pagination', _page, totalPages, filtered.length, 'service', function(pg) { _page = pg; renderList(); });

        listEl.querySelectorAll('.view-service').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var s = services.find(function (x) { return x.id === btn.dataset.id; });
            if (s) showDetailModal('Service Details', [
              { label: 'Title', value: s.title },
              { label: 'Description', value: s.description || '\u2014' },
              { label: 'Created', value: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '\u2014' }
            ]);
          });
        });

        listEl.querySelectorAll('.edit-service').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var svc = services.find(function (s) { return s.id === btn.dataset.id; });
            if (svc) showServiceModal(svc);
          });
        });

        listEl.querySelectorAll('.delete-service').forEach(function (btn) {
          btn.addEventListener('click', async function () {
            var s = services.find(function (x) { return x.id === btn.dataset.id; });
            var name = s ? s.title : 'this service';
            var confirmed = await customConfirm('Are you sure you want to delete "' + name + '"? This cannot be undone.', { title: 'Delete Service', type: 'danger' });
            if (!confirmed) return;
            setButtonLoading(btn, true, 'Deleting...');
            try {
              await api('/services/' + btn.dataset.id, { method: 'DELETE' });
              invalidateCache('services');
              showToast('Service deleted');
              renderServices(container);
            } catch (err) { setButtonLoading(btn, false); }
          });
        });

        listEl.querySelectorAll('.overflow-menu-trigger').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var id = btn.dataset.id;
            showOverflowMenu(btn, [
              { icon: 'eye', label: 'View', action: function () { listEl.querySelector('.view-service[data-id="' + id + '"]').click(); } },
              { icon: 'edit', label: 'Edit', action: function () { listEl.querySelector('.edit-service[data-id="' + id + '"]').click(); } },
              { icon: 'trash', label: 'Delete', danger: true, action: function () { listEl.querySelector('.delete-service[data-id="' + id + '"]').click(); } }
            ]);
          });
        });

        // Card tap-to-view
        listEl.querySelectorAll('.item-card').forEach(function(card) {
          card.addEventListener('click', function(e) {
            if (e.target.closest('button, a, .overflow-menu-trigger')) return;
            var viewBtn = card.querySelector('.view-service');
            if (viewBtn) viewBtn.click();
          });
        });
      }

      document.getElementById('services-search').addEventListener('input', function(e) {
        _searchTerm = e.target.value.trim();
        _page = 1;
        renderList();
      });

      renderList();
    } catch (err) { /* */ }
  }

  /* ─── Service Modal ─── */
  function showServiceModal(service) {
    var isEdit = !!service;
    service = service || {};
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.innerHTML =
      '<div class="modal">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title">' + icon(isEdit ? 'edit' : 'plus', 18) + ' ' + (isEdit ? 'Edit' : 'Add') + ' Service</h3>' +
          '<button class="btn-icon modal-close">' + icon('x', 18) + '</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="form-row"><div class="form-group"><label class="form-label">Title</label><input class="form-input" id="s-title" value="' + escapeHtml(service.title || '') + '" placeholder="Security Investigation"></div><div class="form-group"><label class="form-label">Icon (Emoji)</label><input class="form-input" id="s-icon" value="' + (service.icon || '') + '" placeholder="(optional)"></div></div>' +
          '<div class="form-group"><label class="form-label">Description</label><textarea class="form-input form-textarea" id="s-desc">' + escapeHtml(service.description || '') + '</textarea></div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost modal-cancel">Cancel</button>' +
          '<button class="btn btn-primary" id="s-save">' + (isEdit ? 'Save' : 'Create') + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(backdrop);
    backdrop.querySelector('.modal-close').addEventListener('click', function () { backdrop.remove(); });
    backdrop.querySelector('.modal-cancel').addEventListener('click', function () { backdrop.remove(); });
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) backdrop.remove(); });

    function onEsc(e) { if (e.key === 'Escape') { document.removeEventListener('keydown', onEsc); backdrop.remove(); } }
    document.addEventListener('keydown', onEsc);
    trapFocus(backdrop);
    enableModalInputScroll(backdrop);

    document.getElementById('s-save').addEventListener('click', async function () {
      var body = {
        title: document.getElementById('s-title').value.trim(),
        icon: document.getElementById('s-icon').value.trim() || '',
        description: document.getElementById('s-desc').value.trim()
      };

      if (!body.title) { showToast('Title is required', 'error'); return; }

      var saveBtn = this;
      setButtonLoading(saveBtn, true, isEdit ? 'Saving...' : 'Creating...');
      try {
        if (isEdit) {
          await api('/services/' + service.id, { method: 'PUT', body: JSON.stringify(body) });
          showToast('Service updated');
        } else {
          await api('/services', { method: 'POST', body: JSON.stringify(body) });
          showToast('Service created');
        }
        invalidateCache('services');
        backdrop.remove();
        document.removeEventListener('keydown', onEsc);
        renderServices(document.getElementById('page-content'));
      } catch (err) { setButtonLoading(saveBtn, false); }
    });
  }

  /* ═══════════════════════════════════════════
     MESSAGES PAGE
     ═══════════════════════════════════════════ */
  async function renderMessages(container) {
    var _searchTerm = '';
    var _page = 1;
    var PER_PAGE = 10;

    container.innerHTML =
      '<div class="page-header">' +
        '<div><h1 class="page-title">Messages</h1><p class="page-subtitle">Contact form submissions</p></div>' +
        '<div class="page-header-actions">' +
          '<div class="search-bar"><span class="search-icon">' + icon('search', 16) + '</span><input class="form-input" id="messages-search" placeholder="Search messages..." type="text" aria-label="Search messages"></div>' +
        '</div>' +
      '</div>' +
      '<div id="messages-list">' + skeleton('cards', 4) + '</div>' +
      '<div id="messages-pagination"></div>';

    try {
      var messages = _cache.messages || await api('/messages');
      _cache.messages = messages;

      function getFiltered() {
        if (!_searchTerm) return messages;
        var term = _searchTerm.toLowerCase();
        return messages.filter(function(m) {
          return (m.name || '').toLowerCase().indexOf(term) !== -1 ||
                 (m.email || '').toLowerCase().indexOf(term) !== -1 ||
                 (m.message || '').toLowerCase().indexOf(term) !== -1;
        });
      }

      function renderList() {
        var listEl = document.getElementById('messages-list');
        if (!listEl) return;
        var filtered = getFiltered();

        if (filtered.length === 0) {
          listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">' + icon('inbox', 36) + '</div><p>' + (_searchTerm ? 'No messages match your search.' : 'No messages yet. They\'ll appear here when visitors contact you.') + '</p></div>';
          var pe = document.getElementById('messages-pagination');
          if (pe) pe.innerHTML = '';
          return;
        }

        var totalPages = Math.ceil(filtered.length / PER_PAGE);
        if (_page > totalPages) _page = totalPages;
        var start = (_page - 1) * PER_PAGE;
        var pageItems = filtered.slice(start, start + PER_PAGE);

        listEl.innerHTML = '<div class="item-cards">' + pageItems.map(function (m) {
          return '<div class="item-card' + (m.status === 'unread' ? ' item-card--unread' : '') + '">' +
            '<div class="item-card-header">' +
              '<span class="item-card-icon">' + (m.status === 'unread' ? icon('bell', 20) : icon('mail', 20)) + '</span>' +
              '<div class="item-card-meta">' +
                '<h3 class="item-card-title">' + escapeHtml(m.name) + '</h3>' +
                '<p class="item-card-desc">' + escapeHtml((m.message || '').substring(0, 120)) + '</p>' +
              '</div>' +
              '<span class="badge ' + (m.status === 'unread' ? 'badge-orange' : 'badge-green') + '">' + m.status + '</span>' +
            '</div>' +
            '<div class="item-card-footer">' +
              '<span class="item-card-sub"><a href="mailto:' + escapeHtml(m.email) + '">' + escapeHtml(m.email) + '</a> &middot; ' + new Date(m.createdAt).toLocaleDateString() + '</span>' +
              '<div class="item-card-actions-inline">' +
                '<button class="btn btn-sm btn-ghost view-msg" data-id="' + m.id + '">' + icon('eye', 14) + ' View</button>' +
                (m.status === 'unread' ? '<button class="btn btn-sm btn-ghost mark-read" data-id="' + m.id + '">' + icon('check', 14) + ' Read</button>' : '') +
                '<button class="btn btn-sm btn-danger delete-msg" data-id="' + m.id + '">' + icon('trash', 14) + '</button>' +
              '</div>' +
              '<button class="overflow-menu-trigger" data-id="' + m.id + '" data-unread="' + (m.status === 'unread' ? '1' : '0') + '" aria-label="Actions">&#8942;</button>' +
            '</div>' +
          '</div>';
        }).join('') + '</div>';

        renderPagination('messages-pagination', _page, totalPages, filtered.length, 'message', function(pg) { _page = pg; renderList(); });

        listEl.querySelectorAll('.view-msg').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var m = messages.find(function (x) { return x.id === btn.dataset.id; });
            if (m) showDetailModal('Message Details', [
              { label: 'From', value: m.name },
              { label: 'Email', value: m.email, isLink: true, linkPrefix: 'mailto:' },
              { label: 'Message', value: m.message || '\u2014' },
              { label: 'Status', value: m.status },
              { label: 'Received', value: m.createdAt ? new Date(m.createdAt).toLocaleString() : '\u2014' }
            ]);
          });
        });

        listEl.querySelectorAll('.mark-read').forEach(function (btn) {
          btn.addEventListener('click', async function () {
            setButtonLoading(btn, true, 'Updating...');
            try {
              await api('/messages/' + btn.dataset.id + '/read', { method: 'PATCH' });
              invalidateCache('messages');
              showToast('Marked as read');
              renderMessages(container);
            } catch (err) { setButtonLoading(btn, false); }
          });
        });

        listEl.querySelectorAll('.delete-msg').forEach(function (btn) {
          btn.addEventListener('click', async function () {
            var m = messages.find(function (x) { return x.id === btn.dataset.id; });
            var name = m ? m.name : 'this message';
            var confirmed = await customConfirm('Are you sure you want to delete the message from "' + name + '"? This cannot be undone.', { title: 'Delete Message', type: 'danger' });
            if (!confirmed) return;
            setButtonLoading(btn, true, 'Deleting...');
            try {
              await api('/messages/' + btn.dataset.id, { method: 'DELETE' });
              invalidateCache('messages');
              showToast('Message deleted');
              renderMessages(container);
            } catch (err) { setButtonLoading(btn, false); }
          });
        });

        listEl.querySelectorAll('.overflow-menu-trigger').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var id = btn.dataset.id;
            var isUnread = btn.dataset.unread === '1';
            var actions = [
              { icon: 'eye', label: 'View', action: function () { listEl.querySelector('.view-msg[data-id="' + id + '"]').click(); } }
            ];
            if (isUnread) {
              actions.push({ icon: 'check', label: 'Mark Read', action: function () { listEl.querySelector('.mark-read[data-id="' + id + '"]').click(); } });
            }
            actions.push({ icon: 'trash', label: 'Delete', danger: true, action: function () { listEl.querySelector('.delete-msg[data-id="' + id + '"]').click(); } });
            showOverflowMenu(btn, actions);
          });
        });

        // Card tap-to-view
        listEl.querySelectorAll('.item-card').forEach(function(card) {
          card.addEventListener('click', function(e) {
            if (e.target.closest('button, a, .overflow-menu-trigger')) return;
            var viewBtn = card.querySelector('.view-msg');
            if (viewBtn) viewBtn.click();
          });
        });
      }

      document.getElementById('messages-search').addEventListener('input', function(e) {
        _searchTerm = e.target.value.trim();
        _page = 1;
        renderList();
      });

      renderList();
    } catch (err) { /* */ }
  }

  /* ═══════════════════════════════════════════
     SETTINGS PAGE
     ═══════════════════════════════════════════ */
  async function renderSettings(container) {
    container.innerHTML =
      '<div class="page-header">' +
        '<div><h1 class="page-title">Settings</h1><p class="page-subtitle">Brand, SEO & account settings</p></div>' +
      '</div>' +
      '<div id="settings-content">' + skeleton('cards', 2) + '</div>';

    try {
      var settings = await api('/settings');
      var el = document.getElementById('settings-content');
      if (!el) return;

      el.innerHTML =
        '<div class="card">' +
          '<div class="card-header"><h3 class="card-title">' + icon('globe', 18) + ' Brand & Contact</h3></div>' +
          '<div class="form-row"><div class="form-group"><label class="form-label">Site Name / Logo Text</label><input class="form-input" id="set-siteName" value="' + escapeHtml(settings.siteName || '') + '"></div><div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="set-fullName" value="' + escapeHtml(settings.fullName || '') + '"></div></div>' +
          '<div class="form-group"><label class="form-label">Tagline</label><input class="form-input" id="set-tagline" value="' + escapeHtml(settings.tagline || '') + '"></div>' +
          '<div class="form-row"><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="set-email" value="' + escapeHtml(settings.email || '') + '"></div><div class="form-group"><label class="form-label">Location</label><input class="form-input" id="set-location" value="' + escapeHtml(settings.location || '') + '"></div></div>' +
          '<div class="form-row"><div class="form-group"><label class="form-label">LinkedIn URL</label><input class="form-input" id="set-linkedin" value="' + escapeHtml(settings.linkedIn || '') + '"></div><div class="form-group"><label class="form-label">GitHub URL</label><input class="form-input" id="set-github" value="' + escapeHtml(settings.github || '') + '"></div></div>' +
          '<button class="btn btn-primary" id="save-brand" style="margin-top:var(--sp-2)">' + icon('check', 16) + ' Save Brand Settings</button>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header"><h3 class="card-title">' + icon('search', 18) + ' SEO Settings</h3></div>' +
          '<div class="form-group"><label class="form-label">SEO Title</label><input class="form-input" id="set-seoTitle" value="' + escapeHtml(settings.seoTitle || '') + '"></div>' +
          '<div class="form-group"><label class="form-label">SEO Description</label><textarea class="form-input form-textarea" id="set-seoDesc">' + escapeHtml(settings.seoDescription || '') + '</textarea></div>' +
          '<button class="btn btn-primary" id="save-seo" style="margin-top:var(--sp-2)">' + icon('check', 16) + ' Save SEO Settings</button>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header"><h3 class="card-title">' + icon('key', 18) + ' Change Password</h3></div>' +
          '<div class="form-row"><div class="form-group"><label class="form-label">Current Password</label><div class="password-wrap"><input type="password" class="form-input" id="set-curPass" autocomplete="current-password"><button type="button" class="toggle-pass" data-target="set-curPass" title="Show password">' + icon('eye', 16) + '</button></div></div><div class="form-group"><label class="form-label">New Password</label><div class="password-wrap"><input type="password" class="form-input" id="set-newPass" autocomplete="new-password"><button type="button" class="toggle-pass" data-target="set-newPass" title="Show password">' + icon('eye', 16) + '</button></div></div></div>' +
          '<button class="btn btn-danger" id="change-pass" style="margin-top:var(--sp-2)">' + icon('lock', 16) + ' Change Password</button>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header"><h3 class="card-title">' + icon('shield-check', 18) + ' Two-Factor Authentication</h3></div>' +
          '<div id="totp-settings"><p style="color:var(--text-muted);font-size:var(--text-sm)">Loading 2FA status...</p></div>' +
        '</div>';

      bindPasswordToggles(el);

      /* 2FA Setup */
      (async function init2FA() {
        var totpEl = document.getElementById('totp-settings');
        if (!totpEl) return;
        try {
          var me = await api('/auth/me');
          if (me.totpEnabled) {
            totpEl.innerHTML =
              '<p style="color:var(--success);margin-bottom:var(--sp-4)">' + icon('shield-check', 16) + ' Two-factor authentication is <strong>enabled</strong></p>' +
              '<button class="btn btn-danger" id="disable-totp">' + icon('x', 14) + ' Disable 2FA</button>';
            document.getElementById('disable-totp').addEventListener('click', async function () {
              var confirmed = await customConfirm('Disable two-factor authentication? This makes your account less secure.', { title: 'Disable 2FA', type: 'danger', confirmText: 'Disable' });
              if (!confirmed) return;
              try {
                await api('/auth/disable-2fa', { method: 'POST' });
                showToast('2FA disabled');
                renderSettings(document.getElementById('page-content'));
              } catch (err) { /* */ }
            });
          } else {
            totpEl.innerHTML =
              '<p style="color:var(--text-muted);font-size:var(--text-sm);margin-bottom:var(--sp-4)">Protect your account with a TOTP authenticator app</p>' +
              '<button class="btn btn-primary" id="setup-totp">' + icon('shield', 14) + ' Setup 2FA</button>' +
              '<div id="totp-setup-ui" style="display:none;margin-top:var(--sp-5)">' +
                '<p style="color:var(--text-primary);font-size:var(--text-sm);margin-bottom:var(--sp-4)">Scan this QR code with your authenticator app:</p>' +
                '<div id="totp-qr" style="text-align:center;margin-bottom:var(--sp-4)"></div>' +
                '<p style="color:var(--text-muted);font-size:var(--text-xs);margin-bottom:var(--sp-2)">Or enter manually: <code id="totp-secret" style="user-select:all;color:var(--accent)"></code></p>' +
                '<div class="form-group" style="max-width:300px"><label class="form-label">Enter 6-digit code to confirm</label><input type="text" class="form-input" id="totp-confirm-code" placeholder="000000" maxlength="6" inputmode="numeric" style="text-align:center;font-size:1.2rem;letter-spacing:0.3rem"></div>' +
                '<button class="btn btn-primary" id="confirm-totp">' + icon('check', 14) + ' Confirm & Enable 2FA</button>' +
              '</div>';

            document.getElementById('setup-totp').addEventListener('click', async function () {
              try {
                var data = await api('/auth/setup-2fa', { method: 'POST' });
                var ui = document.getElementById('totp-setup-ui');
                if (ui) ui.style.display = 'block';
                var setupBtn = document.getElementById('setup-totp');
                if (setupBtn) setupBtn.style.display = 'none';
                var secretEl = document.getElementById('totp-secret');
                if (secretEl) secretEl.textContent = data.secret || '';
                var qrEl = document.getElementById('totp-qr');
                if (qrEl && data.qrCode) {
                  qrEl.innerHTML = '<img src="' + data.qrCode + '" alt="QR Code" style="max-width:200px;margin:0 auto;border-radius:8px">';
                }
              } catch (err) { /* */ }
            });

            var confirmBtn = document.getElementById('confirm-totp');
            if (confirmBtn) {
              confirmBtn.addEventListener('click', async function () {
                var codeEl = document.getElementById('totp-confirm-code');
                var code = codeEl ? codeEl.value.trim() : '';
                if (!/^\d{6}$/.test(code)) {
                  showToast('Enter a valid 6-digit code', 'error');
                  return;
                }
                try {
                  await api('/auth/confirm-2fa', { method: 'POST', body: JSON.stringify({ totpCode: code }) });
                  showToast('2FA enabled successfully!');
                  renderSettings(document.getElementById('page-content'));
                } catch (err) { /* */ }
              });
            }
          }
        } catch (err) {
          if (totpEl) totpEl.innerHTML = '<p style="color:var(--text-muted);font-size:var(--text-sm)">2FA management unavailable</p>';
        }
      })();

      /* Settings save handlers */
      document.getElementById('save-brand').addEventListener('click', async function () {
        var btn = this;
        setButtonLoading(btn, true, 'Saving...');
        try {
          await api('/settings', {
            method: 'PUT',
            body: JSON.stringify({
              siteName: document.getElementById('set-siteName').value.trim(),
              fullName: document.getElementById('set-fullName').value.trim(),
              tagline: document.getElementById('set-tagline').value.trim(),
              email: document.getElementById('set-email').value.trim(),
              location: document.getElementById('set-location').value.trim(),
              linkedIn: document.getElementById('set-linkedin').value.trim(),
              github: document.getElementById('set-github').value.trim()
            })
          });
          showToast('Brand settings saved');
        } catch (err) { /* */ }
        finally { setButtonLoading(btn, false); }
      });

      document.getElementById('save-seo').addEventListener('click', async function () {
        var btn = this;
        setButtonLoading(btn, true, 'Saving...');
        try {
          await api('/settings', {
            method: 'PUT',
            body: JSON.stringify({
              seoTitle: document.getElementById('set-seoTitle').value.trim(),
              seoDescription: document.getElementById('set-seoDesc').value.trim()
            })
          });
          showToast('SEO settings saved');
        } catch (err) { /* */ }
        finally { setButtonLoading(btn, false); }
      });

      document.getElementById('change-pass').addEventListener('click', async function () {
        var cur = document.getElementById('set-curPass').value;
        var nw = document.getElementById('set-newPass').value;
        if (!cur || !nw) { showToast('Both password fields required', 'error'); return; }
        if (nw.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

        var btn = this;
        setButtonLoading(btn, true, 'Changing...');
        try {
          await api('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword: cur, newPassword: nw })
          });
          showToast('Password changed successfully');
          document.getElementById('set-curPass').value = '';
          document.getElementById('set-newPass').value = '';
        } catch (err) { /* */ }
        finally { setButtonLoading(btn, false); }
      });
    } catch (err) { /* */ }
  }

  /* ═══════════════════════════════════════════
     CUSTOMIZE PAGE — Enterprise Customization Engine
     12 Levels: Theme, Hero, Sections, Projects, Services,
     Animations, Layout, SEO, Security, Custom Code, UX, Data Control
     ═══════════════════════════════════════════ */
  var customizeCache = null;
  var activeCustomizeTab = 'theme';

  function cuzColorInput(id, label, value) {
    return '<div class="cuz-field">' +
      '<label class="cuz-label">' + escapeHtml(label) + '</label>' +
      '<div class="cuz-color-wrap">' +
        '<input type="color" class="cuz-color" id="' + id + '" value="' + escapeHtml(value || '#00F5FF') + '">' +
        '<input type="text" class="form-input cuz-color-text" id="' + id + '-text" value="' + escapeHtml(value || '') + '" placeholder="#00F5FF">' +
      '</div>' +
    '</div>';
  }

  function cuzTextInput(id, label, value, placeholder) {
    return '<div class="cuz-field">' +
      '<label class="cuz-label">' + escapeHtml(label) + '</label>' +
      '<input type="text" class="form-input" id="' + id + '" value="' + escapeHtml(value || '') + '" placeholder="' + escapeHtml(placeholder || '') + '">' +
    '</div>';
  }

  function cuzNumberInput(id, label, value, min, max, step) {
    return '<div class="cuz-field">' +
      '<label class="cuz-label">' + escapeHtml(label) + '</label>' +
      '<div class="cuz-range-wrap">' +
        '<input type="range" class="cuz-range" id="' + id + '-range" value="' + (value || 0) + '" min="' + (min || 0) + '" max="' + (max || 100) + '" step="' + (step || 1) + '">' +
        '<input type="number" class="form-input cuz-number" id="' + id + '" value="' + (value || 0) + '" min="' + (min || 0) + '" max="' + (max || 100) + '" step="' + (step || 1) + '">' +
      '</div>' +
    '</div>';
  }

  function cuzToggle(id, label, checked) {
    return '<div class="cuz-field cuz-field--toggle">' +
      '<label class="cuz-label">' + escapeHtml(label) + '</label>' +
      '<label class="cuz-switch"><input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '><span class="cuz-slider"></span></label>' +
    '</div>';
  }

  function cuzSelect(id, label, value, options) {
    var opts = options.map(function (o) {
      return '<option value="' + escapeHtml(o.value || o) + '"' + ((value === (o.value || o)) ? ' selected' : '') + '>' + escapeHtml(o.label || o) + '</option>';
    }).join('');
    return '<div class="cuz-field">' +
      '<label class="cuz-label">' + escapeHtml(label) + '</label>' +
      '<select class="form-input form-select" id="' + id + '">' + opts + '</select>' +
    '</div>';
  }

  function cuzTextarea(id, label, value, placeholder, rows) {
    return '<div class="cuz-field cuz-field--full">' +
      '<label class="cuz-label">' + escapeHtml(label) + '</label>' +
      '<textarea class="form-input form-textarea" id="' + id + '" rows="' + (rows || 4) + '" placeholder="' + escapeHtml(placeholder || '') + '">' + escapeHtml(value || '') + '</textarea>' +
    '</div>';
  }

  function buildCustomizeTabs() {
    var tabs = [
      { id: 'theme', icon: 'palette', label: 'Theme' },
      { id: 'hero', icon: 'zap', label: 'Hero' },
      { id: 'sections', icon: 'layout', label: 'Sections' },
      { id: 'animations', icon: 'activity', label: 'Animations' },
      { id: 'layoutTab', icon: 'sidebar', label: 'Layout' },
      { id: 'seo', icon: 'search', label: 'SEO' },
      { id: 'security', icon: 'shield', label: 'Security' },
      { id: 'ux', icon: 'sliders', label: 'UX' },
      { id: 'customCode', icon: 'code', label: 'Custom Code' },
      { id: 'dataControl', icon: 'database', label: 'Data Control' },
      { id: 'preview', icon: 'monitor', label: 'Preview' }
    ];
    return '<div class="cuz-tabs">' + tabs.map(function (t) {
      return '<button class="cuz-tab' + (activeCustomizeTab === t.id ? ' active' : '') + '" data-tab="' + t.id + '">' +
        icon(t.icon, 14) + ' <span>' + t.label + '</span></button>';
    }).join('') + '</div>' +
    '<div class="cuz-mobile-select"><label for="cuz-tab-select" class="sr-only">Select tab</label><select id="cuz-tab-select" class="form-input form-select">' + tabs.map(function (t) {
      return '<option value="' + t.id + '"' + (activeCustomizeTab === t.id ? ' selected' : '') + '>' + t.label + '</option>';
    }).join('') + '</select></div>';
  }

  function buildThemePanel(cfg) {
    var t = cfg.theme || {};
    return '<div class="cuz-panel" data-panel="theme">' +
      '<h3 class="cuz-section-title">' + icon('palette', 18) + ' Global Theme Customization</h3>' +
      '<p class="cuz-section-desc">Control the visual identity of your entire website — colors, typography, and spacing.</p>' +
      '<div class="cuz-grid">' +
        cuzColorInput('cuz-primaryColor', 'Primary Color', t.primaryColor) +
        cuzColorInput('cuz-secondaryColor', 'Secondary Color', t.secondaryColor) +
        cuzColorInput('cuz-accentColor', 'Accent Color', t.accentColor) +
        cuzColorInput('cuz-successColor', 'Success Color', t.successColor) +
        cuzColorInput('cuz-dangerColor', 'Danger Color', t.dangerColor) +
        cuzColorInput('cuz-warningColor', 'Warning Color', t.warningColor) +
        cuzColorInput('cuz-bgColor', 'Background Color', t.bgColor) +
        cuzColorInput('cuz-textPrimary', 'Text Primary', t.textPrimary) +
        cuzColorInput('cuz-textSecondary', 'Text Secondary', t.textSecondary) +
      '</div>' +
      '<div class="cuz-divider"></div>' +
      '<h4 class="cuz-sub-title">' + icon('type', 16) + ' Typography</h4>' +
      '<div class="cuz-grid">' +
        cuzTextInput('cuz-fontPrimary', 'Primary Font', t.fontPrimary, 'Inter') +
        cuzTextInput('cuz-fontSecondary', 'Secondary Font', t.fontSecondary, 'Rajdhani') +
        cuzNumberInput('cuz-baseFontSize', 'Base Font Size (px)', t.baseFontSize, 10, 24, 1) +
        cuzNumberInput('cuz-headingScale', 'Heading Scale', t.headingScale, 1, 2, 0.05) +
        cuzNumberInput('cuz-borderRadius', 'Border Radius (px)', t.borderRadius, 0, 50, 1) +
        cuzNumberInput('cuz-glowOpacity', 'Glow Opacity', t.glowOpacity, 0, 1, 0.05) +
      '</div>' +
    '</div>';
  }

  function buildHeroPanel(cfg) {
    var h = cfg.hero || {};
    var phrases = (h.typingPhrases || []).join('\n');
    return '<div class="cuz-panel" data-panel="hero">' +
      '<h3 class="cuz-section-title">' + icon('zap', 18) + ' Hero Section Customization</h3>' +
      '<p class="cuz-section-desc">Configure the hero banner — title, typing phrases, CTAs, and layout.</p>' +
      '<div class="cuz-grid">' +
        cuzTextInput('cuz-heroTitle', 'Hero Title', h.title, 'CYBER COMMAND') +
        cuzTextInput('cuz-heroSubtitle', 'Subtitle', h.subtitle, 'Dhruvkumar Dobariya') +
        cuzSelect('cuz-heroLayout', 'Layout', h.layout, [
          { value: 'split', label: 'Split (Left/Right)' },
          { value: 'centered', label: 'Centered' },
          { value: 'fullscreen', label: 'Fullscreen' }
        ]) +
        cuzTextInput('cuz-heroStatusText', 'Status Badge Text', h.statusText, 'SYSTEMS ONLINE') +
      '</div>' +
      cuzTextarea('cuz-heroTyping', 'Typing Phrases (one per line)', phrases, 'SOC Analyst & Threat Hunter\nSIEM Engineer & Log Analyst', 5) +
      '<div class="cuz-grid">' +
        cuzTextInput('cuz-ctaPrimaryText', 'CTA Primary Text', h.ctaPrimaryText, 'View Operations') +
        cuzTextInput('cuz-ctaPrimaryLink', 'CTA Primary Link', h.ctaPrimaryLink, '#projects') +
        cuzTextInput('cuz-ctaSecondaryText', 'CTA Secondary Text', h.ctaSecondaryText, 'Contact HQ') +
        cuzTextInput('cuz-ctaSecondaryLink', 'CTA Secondary Link', h.ctaSecondaryLink, '#contact') +
      '</div>' +
      '<div class="cuz-grid">' +
        cuzToggle('cuz-heroShowStatus', 'Show Status Badge', h.showStatusBadge !== false) +
        cuzToggle('cuz-heroShowScan', 'Show Scan Line', h.showScanLine !== false) +
      '</div>' +
    '</div>';
  }

  function buildSectionsPanel(cfg) {
    var s = cfg.sections || {};
    var sectionKeys = Object.keys(s).sort(function (a, b) { return (s[a].order || 0) - (s[b].order || 0); });
    var rows = sectionKeys.map(function (key) {
      var sec = s[key] || {};
      return '<div class="cuz-section-row" data-section="' + key + '">' +
        '<span class="cuz-section-handle">' + icon('menu', 14) + '</span>' +
        '<span class="cuz-section-name">' + escapeHtml(sec.label || key) + '</span>' +
        '<span class="cuz-section-key">' + escapeHtml(key) + '</span>' +
        '<label class="cuz-switch"><input type="checkbox" class="section-visible" data-key="' + key + '"' + (sec.visible !== false ? ' checked' : '') + '><span class="cuz-slider"></span></label>' +
        '<input type="number" class="form-input cuz-order-input section-order" data-key="' + key + '" value="' + (sec.order || 1) + '" min="1" max="20">' +
        '<div class="cuz-move-btns">' +
          '<button class="cuz-move-btn" data-dir="up" data-key="' + key + '" aria-label="Move ' + escapeHtml(sec.label || key) + ' up">&uarr;</button>' +
          '<button class="cuz-move-btn" data-dir="down" data-key="' + key + '" aria-label="Move ' + escapeHtml(sec.label || key) + ' down">&darr;</button>' +
        '</div>' +
      '</div>';
    }).join('');
    return '<div class="cuz-panel" data-panel="sections">' +
      '<h3 class="cuz-section-title">' + icon('layout', 18) + ' Section Visibility & Order</h3>' +
      '<p class="cuz-section-desc">Toggle sections on/off and control their display order on the main website.</p>' +
      '<div class="cuz-sections-list">' +
        '<div class="cuz-sections-header"><span></span><span>Section</span><span>Key</span><span>Visible</span><span>Order</span></div>' +
        rows +
      '</div>' +
    '</div>';
  }

  function buildAnimationsPanel(cfg) {
    var a = cfg.animations || {};
    return '<div class="cuz-panel" data-panel="animations">' +
      '<h3 class="cuz-section-title">' + icon('activity', 18) + ' Animation Control Panel</h3>' +
      '<p class="cuz-section-desc">Fine-tune animation speed, particle effects, glow intensity, and reveal types.</p>' +
      '<div class="cuz-grid">' +
        cuzNumberInput('cuz-globalSpeed', 'Global Speed Multiplier', a.globalSpeed, 0.1, 5, 0.1) +
        cuzNumberInput('cuz-glowIntensity', 'Glow Intensity', a.glowIntensity, 0, 1, 0.05) +
        cuzNumberInput('cuz-particleCount', 'Particle Count', a.particleCount, 0, 300, 10) +
        cuzNumberInput('cuz-particleSpeed', 'Particle Speed', a.particleSpeed, 0, 5, 0.1) +
        cuzNumberInput('cuz-particleOpacity', 'Particle Opacity', a.particleOpacity, 0, 1, 0.05) +
        cuzNumberInput('cuz-typingSpeed', 'Typing Speed (ms)', a.typingSpeed, 20, 300, 10) +
        cuzSelect('cuz-revealType', 'Reveal Animation', a.revealType, [
          { value: 'fade-up', label: 'Fade Up' },
          { value: 'fade-in', label: 'Fade In' },
          { value: 'slide-left', label: 'Slide Left' },
          { value: 'slide-right', label: 'Slide Right' },
          { value: 'zoom', label: 'Zoom' },
          { value: 'none', label: 'None' }
        ]) +
      '</div>' +
      '<div class="cuz-divider"></div>' +
      '<h4 class="cuz-sub-title">Feature Toggles</h4>' +
      '<div class="cuz-grid">' +
        cuzToggle('cuz-glowEnabled', 'Glow Effects', a.glowEnabled !== false) +
        cuzToggle('cuz-particlesEnabled', 'Particles', a.particlesEnabled !== false) +
        cuzToggle('cuz-cursorBlink', 'Cursor Blink', a.cursorBlink !== false) +
        cuzToggle('cuz-smoothScroll', 'Smooth Scroll', a.smoothScroll !== false) +
        cuzToggle('cuz-parallaxEnabled', 'Parallax', a.parallaxEnabled !== false) +
        cuzToggle('cuz-tiltEnabled', '3D Tilt', a.tiltEnabled !== false) +
        cuzToggle('cuz-magneticButtons', 'Magnetic Buttons', a.magneticButtons !== false) +
      '</div>' +
    '</div>';
  }

  function buildLayoutPanel(cfg) {
    var l = cfg.layout || {};
    return '<div class="cuz-panel" data-panel="layoutTab">' +
      '<h3 class="cuz-section-title">' + icon('sidebar', 18) + ' Layout Control</h3>' +
      '<p class="cuz-section-desc">Glassmorphism, card styles, navbar, footer, spacing.</p>' +
      '<div class="cuz-grid">' +
        cuzToggle('cuz-glassmorphism', 'Glassmorphism', l.glassmorphism !== false) +
        cuzNumberInput('cuz-glassBgOpacity', 'Glass BG Opacity', l.glassBgOpacity, 0, 1, 0.05) +
        cuzNumberInput('cuz-glassBlur', 'Glass Blur (px)', l.glassBlur, 0, 50, 1) +
        cuzSelect('cuz-cardStyle', 'Card Style', l.cardStyle, [
          { value: 'glass', label: 'Glassmorphic' },
          { value: 'solid', label: 'Solid' },
          { value: 'outline', label: 'Outline' },
          { value: 'minimal', label: 'Minimal' }
        ]) +
        cuzSelect('cuz-navbarStyle', 'Navbar Style', l.navbarStyle, [
          { value: 'floating', label: 'Floating' },
          { value: 'fixed', label: 'Fixed' },
          { value: 'transparent', label: 'Transparent' },
          { value: 'solid', label: 'Solid' }
        ]) +
        cuzToggle('cuz-navbarBlur', 'Navbar Blur', l.navbarBlur !== false) +
        cuzSelect('cuz-footerStyle', 'Footer Style', l.footerStyle, [
          { value: 'minimal', label: 'Minimal' },
          { value: 'detailed', label: 'Detailed' },
          { value: 'hidden', label: 'Hidden' }
        ]) +
        cuzNumberInput('cuz-maxWidth', 'Max Width (px)', l.maxWidth, 800, 2400, 50) +
        cuzNumberInput('cuz-sectionSpacing', 'Section Spacing (px)', l.sectionSpacing, 40, 300, 10) +
        cuzToggle('cuz-showBackToTop', 'Back to Top Button', l.showBackToTop !== false) +
        cuzToggle('cuz-showProgressBar', 'Scroll Progress Bar', l.showProgressBar !== false) +
      '</div>' +
    '</div>';
  }

  function buildSeoPanel(cfg) {
    var s = cfg.seo || {};
    return '<div class="cuz-panel" data-panel="seo">' +
      '<h3 class="cuz-section-title">' + icon('search', 18) + ' SEO Control Panel</h3>' +
      '<p class="cuz-section-desc">Meta tags, Open Graph, Twitter Card, and structured data.</p>' +
      '<div class="cuz-grid">' +
        cuzTextInput('cuz-metaTitle', 'Meta Title', s.metaTitle, 'Dhruvkumar Dobariya — Cybersecurity') +
        cuzTextInput('cuz-canonicalUrl', 'Canonical URL', s.canonicalUrl, 'https://dhruvkumar.tech') +
      '</div>' +
      cuzTextarea('cuz-metaDescription', 'Meta Description', s.metaDescription, 'Cybersecurity Analyst & SOC Engineer...', 3) +
      '<div class="cuz-divider"></div>' +
      '<h4 class="cuz-sub-title">Open Graph</h4>' +
      '<div class="cuz-grid">' +
        cuzTextInput('cuz-ogTitle', 'OG Title', s.ogTitle, '') +
        cuzTextInput('cuz-ogImage', 'OG Image URL', s.ogImage, 'https://...') +
      '</div>' +
      cuzTextarea('cuz-ogDescription', 'OG Description', s.ogDescription, '', 2) +
      '<div class="cuz-divider"></div>' +
      '<h4 class="cuz-sub-title">Twitter Card</h4>' +
      '<div class="cuz-grid">' +
        cuzSelect('cuz-twitterCard', 'Card Type', s.twitterCard, [
          { value: 'summary', label: 'Summary' },
          { value: 'summary_large_image', label: 'Summary Large Image' }
        ]) +
        cuzTextInput('cuz-twitterHandle', 'Twitter Handle', s.twitterHandle, '@handle') +
      '</div>' +
      '<div class="cuz-divider"></div>' +
      '<h4 class="cuz-sub-title">Structured Data</h4>' +
      '<div class="cuz-grid">' +
        cuzSelect('cuz-structuredDataType', 'Schema Type', s.structuredDataType, [
          { value: 'Person', label: 'Person' },
          { value: 'Organization', label: 'Organization' },
          { value: 'WebSite', label: 'WebSite' }
        ]) +
        cuzTextInput('cuz-keywords', 'Keywords', s.keywords, 'cybersecurity, SOC, SIEM...') +
      '</div>' +
    '</div>';
  }

  function buildSecurityPanel(cfg) {
    var s = cfg.security || {};
    return '<div class="cuz-panel" data-panel="security">' +
      '<h3 class="cuz-section-title">' + icon('shield', 18) + ' Security Visual Options</h3>' +
      '<p class="cuz-section-desc">Security badges, trust indicators, and visual security elements.</p>' +
      '<div class="cuz-grid">' +
        cuzToggle('cuz-showSecurityBadges', 'Security Badges', s.showSecurityBadges !== false) +
        cuzToggle('cuz-showTrustIndicators', 'Trust Indicators', s.showTrustIndicators !== false) +
        cuzToggle('cuz-showEncryptionBadge', 'Encryption Badge', s.showEncryptionBadge !== false) +
        cuzToggle('cuz-showUptimeBadge', 'Uptime Badge', s.showUptimeBadge !== false) +
        cuzToggle('cuz-securityScoreVisible', 'Security Score', s.securityScoreVisible !== false) +
        cuzSelect('cuz-threatLevelDisplay', 'Threat Level Display', s.threatLevelDisplay, [
          { value: 'bar', label: 'Bar' },
          { value: 'badge', label: 'Badge' },
          { value: 'hidden', label: 'Hidden' }
        ]) +
        cuzSelect('cuz-badgeStyle', 'Badge Style', s.badgeStyle, [
          { value: 'pill', label: 'Pill' },
          { value: 'square', label: 'Square' },
          { value: 'rounded', label: 'Rounded' }
        ]) +
      '</div>' +
    '</div>';
  }

  function buildUxPanel(cfg) {
    var u = cfg.ux || {};
    return '<div class="cuz-panel" data-panel="ux">' +
      '<h3 class="cuz-section-title">' + icon('sliders', 18) + ' UX Settings</h3>' +
      '<p class="cuz-section-desc">Scroll behavior, cursor, loader, progress bar, buttons.</p>' +
      '<div class="cuz-grid">' +
        cuzNumberInput('cuz-smoothScrollSpeed', 'Smooth Scroll Speed (ms)', u.smoothScrollSpeed, 100, 3000, 100) +
        cuzToggle('cuz-customCursor', 'Custom Cursor', u.customCursor === true) +
        cuzSelect('cuz-cursorStyle', 'Cursor Style', u.cursorStyle, [
          { value: 'default', label: 'Default' },
          { value: 'dot', label: 'Dot' },
          { value: 'ring', label: 'Ring' },
          { value: 'crosshair', label: 'Crosshair' }
        ]) +
        cuzToggle('cuz-loaderEnabled', 'Loader Enabled', u.loaderEnabled !== false) +
        cuzSelect('cuz-loaderStyle', 'Loader Style', u.loaderStyle, [
          { value: 'cyber', label: 'Cyber' },
          { value: 'minimal', label: 'Minimal' },
          { value: 'pulse', label: 'Pulse' },
          { value: 'none', label: 'None' }
        ]) +
        cuzNumberInput('cuz-loaderDuration', 'Loader Duration (ms)', u.loaderDuration, 0, 10000, 100) +
        cuzToggle('cuz-progressBarEnabled', 'Progress Bar', u.progressBarEnabled !== false) +
        cuzColorInput('cuz-progressBarColor', 'Progress Bar Color', u.progressBarColor) +
        cuzSelect('cuz-buttonStyle', 'Button Style', u.buttonStyle, [
          { value: 'glow', label: 'Glow' },
          { value: 'solid', label: 'Solid' },
          { value: 'outline', label: 'Outline' },
          { value: 'gradient', label: 'Gradient' }
        ]) +
        cuzToggle('cuz-hoverEffects', 'Hover Effects', u.hoverEffects !== false) +
        cuzColorInput('cuz-focusRingColor', 'Focus Ring Color', u.focusRingColor) +
        cuzNumberInput('cuz-scrollRevealOffset', 'Scroll Reveal Offset', u.scrollRevealOffset, 0, 500, 10) +
      '</div>' +
    '</div>';
  }

  function buildCustomCodePanel(cfg) {
    var c = cfg.customCode || {};
    return '<div class="cuz-panel" data-panel="customCode">' +
      '<h3 class="cuz-section-title">' + icon('code', 18) + ' Custom CSS & HTML</h3>' +
      '<p class="cuz-section-desc">Inject custom CSS and HTML into the website. Validated and sanitized.</p>' +
      cuzTextarea('cuz-customCSS', 'Custom CSS', c.customCSS, '/* Custom styles here */\n.my-class { color: red; }', 8) +
      cuzTextarea('cuz-customHeadHTML', 'Custom Head HTML', c.customHeadHTML, '<!-- e.g. analytics scripts -->', 4) +
      cuzTextarea('cuz-customFooterHTML', 'Custom Footer HTML', c.customFooterHTML, '<!-- e.g. chat widget -->', 4) +
    '</div>';
  }

  function buildDataControlPanel(cfg) {
    var d = cfg.dataControl || {};
    return '<div class="cuz-panel" data-panel="dataControl">' +
      '<h3 class="cuz-section-title">' + icon('database', 18) + ' Data Control Settings</h3>' +
      '<p class="cuz-section-desc">Activity monitor, idle detection, analytics integration.</p>' +
      '<div class="cuz-grid">' +
        cuzToggle('cuz-activityMonitorEnabled', 'Activity Monitor', d.activityMonitorEnabled !== false) +
        cuzToggle('cuz-activityPanelVisible', 'Activity Panel Visible', d.activityPanelVisible !== false) +
        cuzNumberInput('cuz-idleTimeout', 'Idle Timeout (seconds)', d.idleTimeout, 30, 3600, 10) +
        cuzTextInput('cuz-idleMessage', 'Idle Message', d.idleMessage, 'Session Idle') +
        cuzToggle('cuz-showScrollProgress', 'Scroll Progress', d.showScrollProgress !== false) +
        cuzToggle('cuz-showSectionTracking', 'Section Tracking', d.showSectionTracking !== false) +
        cuzToggle('cuz-showClickTracking', 'Click Tracking', d.showClickTracking !== false) +
        cuzToggle('cuz-analyticsEnabled', 'Analytics Enabled', d.analyticsEnabled === true) +
        cuzTextInput('cuz-analyticsId', 'Analytics ID', d.analyticsId, 'G-XXXXXXXXXX') +
      '</div>' +
    '</div>';
  }

  function buildPreviewPanel() {
    return '<div class="cuz-panel" data-panel="preview">' +
      '<h3 class="cuz-section-title">' + icon('monitor', 18) + ' Live Preview</h3>' +
      '<p class="cuz-section-desc">Preview your website with current customization settings.</p>' +
      '<div class="cuz-preview-actions">' +
        '<button class="btn btn-primary" id="cuz-preview-refresh">' + icon('refresh', 14) + ' Refresh Preview</button>' +
        '<a class="btn btn-ghost" href="/" target="_blank" rel="noopener">' + icon('external-link', 14) + ' Open in New Tab</a>' +
      '</div>' +
      '<div class="cuz-preview-frame-wrap">' +
        '<iframe id="cuz-preview-iframe" src="/" class="cuz-preview-iframe" title="Website Preview"></iframe>' +
      '</div>' +
      '<div class="cuz-preview-mobile-msg">' +
        '<p>' + icon('monitor', 18) + ' Preview is optimized for desktop viewports.</p>' +
        '<a class="btn btn-primary" href="/" target="_blank" rel="noopener">' + icon('external-link', 14) + ' Open in New Tab</a>' +
      '</div>' +
    '</div>';
  }

  function collectCustomizeData() {
    var data = {};

    // Theme
    var theme = {};
    ['primaryColor','secondaryColor','accentColor','successColor','dangerColor','warningColor','bgColor','textPrimary','textSecondary'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k + '-text') || document.getElementById('cuz-' + k);
      if (el) theme[k] = el.value.trim();
    });
    ['fontPrimary','fontSecondary'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) theme[k] = el.value.trim();
    });
    ['baseFontSize','headingScale','borderRadius','glowOpacity'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) { var v = parseFloat(el.value); if (!isNaN(v)) theme[k] = v; }
    });
    if (Object.keys(theme).length) data.theme = theme;

    // Hero
    var hero = {};
    var heroTitle = document.getElementById('cuz-heroTitle');
    if (heroTitle) hero.title = heroTitle.value.trim();
    var heroSub = document.getElementById('cuz-heroSubtitle');
    if (heroSub) hero.subtitle = heroSub.value.trim();
    var heroLayout = document.getElementById('cuz-heroLayout');
    if (heroLayout) hero.layout = heroLayout.value;
    var heroStatus = document.getElementById('cuz-heroStatusText');
    if (heroStatus) hero.statusText = heroStatus.value.trim();
    var heroTyping = document.getElementById('cuz-heroTyping');
    if (heroTyping) hero.typingPhrases = heroTyping.value.split('\n').map(function(s) { return s.trim(); }).filter(Boolean);
    ['ctaPrimaryText','ctaPrimaryLink','ctaSecondaryText','ctaSecondaryLink'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) hero[k] = el.value.trim();
    });
    var heroShowStatus = document.getElementById('cuz-heroShowStatus');
    if (heroShowStatus) hero.showStatusBadge = heroShowStatus.checked;
    var heroShowScan = document.getElementById('cuz-heroShowScan');
    if (heroShowScan) hero.showScanLine = heroShowScan.checked;
    if (Object.keys(hero).length) data.hero = hero;

    // Sections
    var sections = {};
    document.querySelectorAll('.section-visible').forEach(function(el) {
      var key = el.dataset.key;
      if (!sections[key]) sections[key] = {};
      sections[key].visible = el.checked;
    });
    document.querySelectorAll('.section-order').forEach(function(el) {
      var key = el.dataset.key;
      if (!sections[key]) sections[key] = {};
      sections[key].order = parseInt(el.value, 10) || 1;
    });
    if (Object.keys(sections).length) data.sections = sections;

    // Animations
    var animations = {};
    ['globalSpeed','glowIntensity','particleCount','particleSpeed','particleOpacity','typingSpeed'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) { var v = parseFloat(el.value); if (!isNaN(v)) animations[k] = v; }
    });
    var revealType = document.getElementById('cuz-revealType');
    if (revealType) animations.revealType = revealType.value;
    ['glowEnabled','particlesEnabled','cursorBlink','smoothScroll','parallaxEnabled','tiltEnabled','magneticButtons'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) animations[k] = el.checked;
    });
    if (Object.keys(animations).length) data.animations = animations;

    // Layout
    var layout = {};
    ['glassBgOpacity','glassBlur','maxWidth','sectionSpacing'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) { var v = parseFloat(el.value); if (!isNaN(v)) layout[k] = v; }
    });
    ['glassmorphism','navbarBlur','showBackToTop','showProgressBar'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) layout[k] = el.checked;
    });
    ['cardStyle','navbarStyle','footerStyle'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) layout[k] = el.value;
    });
    if (Object.keys(layout).length) data.layout = layout;

    // SEO
    var seo = {};
    ['metaTitle','canonicalUrl','ogTitle','ogImage','twitterHandle','keywords'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) seo[k] = el.value.trim();
    });
    ['metaDescription','ogDescription'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) seo[k] = el.value.trim();
    });
    ['twitterCard','structuredDataType'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) seo[k] = el.value;
    });
    if (Object.keys(seo).length) data.seo = seo;

    // Security
    var security = {};
    ['showSecurityBadges','showTrustIndicators','showEncryptionBadge','showUptimeBadge','securityScoreVisible'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) security[k] = el.checked;
    });
    ['threatLevelDisplay','badgeStyle'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) security[k] = el.value;
    });
    if (Object.keys(security).length) data.security = security;

    // UX
    var ux = {};
    ['smoothScrollSpeed','loaderDuration','scrollRevealOffset'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) { var v = parseFloat(el.value); if (!isNaN(v)) ux[k] = v; }
    });
    ['customCursor','loaderEnabled','progressBarEnabled','hoverEffects'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) ux[k] = el.checked;
    });
    ['cursorStyle','loaderStyle','buttonStyle'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) ux[k] = el.value;
    });
    ['progressBarColor','focusRingColor'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k + '-text') || document.getElementById('cuz-' + k);
      if (el) ux[k] = el.value.trim();
    });
    if (Object.keys(ux).length) data.ux = ux;

    // Custom Code
    var customCode = {};
    ['customCSS','customHeadHTML','customFooterHTML'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) customCode[k] = el.value;
    });
    if (Object.keys(customCode).length) data.customCode = customCode;

    // Data Control
    var dataControl = {};
    ['activityMonitorEnabled','activityPanelVisible','showScrollProgress','showSectionTracking','showClickTracking','analyticsEnabled'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) dataControl[k] = el.checked;
    });
    ['idleTimeout'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) { var v = parseInt(el.value, 10); if (!isNaN(v)) dataControl[k] = v; }
    });
    ['idleMessage','analyticsId'].forEach(function(k) {
      var el = document.getElementById('cuz-' + k);
      if (el) dataControl[k] = el.value.trim();
    });
    if (Object.keys(dataControl).length) data.dataControl = dataControl;

    return data;
  }

  function bindCustomizeEvents(container) {
    // Tab switching
    function switchTab(tabId) {
      activeCustomizeTab = tabId;
      container.querySelectorAll('.cuz-tab').forEach(function(t) { t.classList.toggle('active', t.dataset.tab === tabId); });
      container.querySelectorAll('.cuz-panel').forEach(function(p) {
        p.style.display = p.dataset.panel === tabId ? '' : 'none';
      });
      var sel = document.getElementById('cuz-tab-select');
      if (sel) sel.value = tabId;
    }
    container.querySelectorAll('.cuz-tab').forEach(function(btn) {
      btn.addEventListener('click', function() { switchTab(btn.dataset.tab); });
    });
    var tabSelect = document.getElementById('cuz-tab-select');
    if (tabSelect) {
      tabSelect.addEventListener('change', function() { switchTab(tabSelect.value); });
    }

    // Show only active panel
    container.querySelectorAll('.cuz-panel').forEach(function(p) {
      p.style.display = p.dataset.panel === activeCustomizeTab ? '' : 'none';
    });

    // Color sync: color picker ↔ text input
    container.querySelectorAll('.cuz-color').forEach(function(colorInput) {
      var textInput = document.getElementById(colorInput.id + '-text');
      if (!textInput) return;
      colorInput.addEventListener('input', function() { textInput.value = colorInput.value; });
      textInput.addEventListener('input', function() {
        if (/^#[0-9a-fA-F]{6}$/.test(textInput.value)) colorInput.value = textInput.value;
      });
    });

    // Range ↔ number sync
    container.querySelectorAll('.cuz-range').forEach(function(range) {
      var numId = range.id.replace('-range', '');
      var numInput = document.getElementById(numId);
      if (!numInput) return;
      range.addEventListener('input', function() { numInput.value = range.value; });
      numInput.addEventListener('input', function() { range.value = numInput.value; });
    });

    // Track dirty state for unsaved changes detection
    container.querySelectorAll('input, textarea, select').forEach(function(el) {
      el.addEventListener('change', function() { _customizeDirty = true; });
      el.addEventListener('input', function() { _customizeDirty = true; });
    });

    // Save button
    var saveBtn = document.getElementById('cuz-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', async function() {
        var data = collectCustomizeData();
        setButtonLoading(saveBtn, true, 'Saving...');
        try {
          var result = await api('/customize', { method: 'PUT', body: JSON.stringify(data) });
          customizeCache = result;
          _customizeDirty = false;
          showToast('Customization saved successfully');
          var iframe = document.getElementById('cuz-preview-iframe');
          if (iframe) iframe.src = iframe.src;
        } catch(err) { /* toast shown by api() */ }
        finally {
          setButtonLoading(saveBtn, false);
        }
      });
    }

    // Reset button
    var resetBtn = document.getElementById('cuz-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', async function() {
        var confirmed = await customConfirm('Reset all customization to defaults? This cannot be undone.', { title: 'Reset Customization', type: 'danger', confirmText: 'Reset' });
        if (!confirmed) return;
        try {
          var result = await api('/customize/reset', { method: 'POST' });
          customizeCache = result;
          _customizeDirty = false;
          showToast('Customization reset to defaults');
          renderCustomize(document.getElementById('page-content'));
        } catch(err) { /* */ }
      });
    }

    // Preview refresh
    var previewRefresh = document.getElementById('cuz-preview-refresh');
    if (previewRefresh) {
      previewRefresh.addEventListener('click', function() {
        var iframe = document.getElementById('cuz-preview-iframe');
        if (iframe) iframe.src = iframe.src;
      });
    }

    // Section move buttons (mobile)
    container.querySelectorAll('.cuz-move-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var row = btn.closest('.cuz-section-row');
        var list = row.parentElement;
        var rows = Array.from(list.querySelectorAll('.cuz-section-row'));
        var idx = rows.indexOf(row);
        if (btn.dataset.dir === 'up' && idx > 0) {
          list.insertBefore(row, rows[idx - 1]);
        } else if (btn.dataset.dir === 'down' && idx < rows.length - 1) {
          list.insertBefore(rows[idx + 1], row);
        }
        // Sync order inputs to new visual order
        Array.from(list.querySelectorAll('.cuz-section-row')).forEach(function(r, i) {
          var orderInput = r.querySelector('.section-order');
          if (orderInput) orderInput.value = i + 1;
        });
        _customizeDirty = true;
      });
    });
  }

  async function renderCustomize(container) {
    container.innerHTML =
      '<div class="page-header">' +
        '<div><h1 class="page-title">' + icon('palette', 22) + ' Customize</h1><p class="page-subtitle">Enterprise Customization Engine — Control every visual element</p></div>' +
        '<div class="page-header-actions">' +
          '<button class="btn btn-ghost" id="cuz-reset">' + icon('refresh', 14) + ' Reset Defaults</button>' +
          '<button class="btn btn-primary" id="cuz-save">' + icon('check', 14) + ' Save All Changes</button>' +
        '</div>' +
      '</div>' +
      '<div id="cuz-content">' + skeleton('cards', 2) + '</div>';

    try {
      var cfg = customizeCache || await api('/customize');
      customizeCache = cfg;
      var cuzEl = document.getElementById('cuz-content');
      if (!cuzEl) return;

      cuzEl.innerHTML =
        buildCustomizeTabs() +
        '<div class="cuz-panels">' +
          buildThemePanel(cfg) +
          buildHeroPanel(cfg) +
          buildSectionsPanel(cfg) +
          buildAnimationsPanel(cfg) +
          buildLayoutPanel(cfg) +
          buildSeoPanel(cfg) +
          buildSecurityPanel(cfg) +
          buildUxPanel(cfg) +
          buildCustomCodePanel(cfg) +
          buildDataControlPanel(cfg) +
          buildPreviewPanel() +
        '</div>';

      bindCustomizeEvents(container);
    } catch(err) {
      var el = document.getElementById('cuz-content');
      if (el) el.innerHTML = '<p style="color:var(--danger);padding:var(--sp-4)">Failed to load customization settings. Is the API running?</p>';
    }
  }

  /* ═══════════════════════════════════════════
     AUDIT LOG PAGE
     ═══════════════════════════════════════════ */
  async function renderAuditLog(container) {
    container.innerHTML =
      '<div class="page-header">' +
        '<div><h1 class="page-title">Audit Log</h1><p class="page-subtitle">Security event tracking & activity history</p></div>' +
        '<select id="audit-filter" class="form-input form-select" style="width:auto;min-width:200px">' +
          '<option value="">All Actions</option>' +
          '<option value="LOGIN_SUCCESS">Login Success</option>' +
          '<option value="LOGIN_FAILED">Login Failed</option>' +
          '<option value="LOGIN_LOCKED">Account Locked</option>' +
          '<option value="PASSWORD_CHANGE">Password Change</option>' +
          '<option value="TOTP_SETUP">2FA Setup</option>' +
          '<option value="TOTP_VERIFY">2FA Verified</option>' +
          '<option value="PROJECT_CREATE">Project Created</option>' +
          '<option value="PROJECT_UPDATE">Project Updated</option>' +
          '<option value="PROJECT_DELETE">Project Deleted</option>' +
          '<option value="MESSAGE_DELETE">Message Deleted</option>' +
        '</select>' +
      '</div>' +
      '<div class="card">' +
        '<div id="audit-list">' + skeleton('cards', 4) + '</div>' +
      '</div>';

    var actionColors = {
      'LOGIN_SUCCESS': 'badge-green', 'LOGIN_FAILED': 'badge-red', 'LOGIN_LOCKED': 'badge-red',
      'PASSWORD_CHANGE': 'badge-orange', 'TOTP_SETUP': 'badge-cyan', 'TOTP_VERIFY': 'badge-green',
      'TOTP_FAILED': 'badge-red', 'PROJECT_CREATE': 'badge-cyan', 'PROJECT_UPDATE': 'badge-orange',
      'PROJECT_DELETE': 'badge-red', 'SERVICE_CREATE': 'badge-cyan', 'SERVICE_UPDATE': 'badge-orange',
      'SERVICE_DELETE': 'badge-red', 'MESSAGE_DELETE': 'badge-red', 'SETTINGS_UPDATE': 'badge-orange'
    };

    async function loadAuditLogs(action) {
      action = action || '';
      try {
        var query = action ? '?action=' + action + '&limit=50' : '?limit=50';
        var data = await api('/dashboard/audit-logs' + query);
        var listEl = document.getElementById('audit-list');
        if (!listEl) return;

        if (!data.logs || data.logs.length === 0) {
          listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">' + icon('clipboard', 36) + '</div><p>No audit logs found</p></div>';
          return;
        }

        listEl.innerHTML = '<div class="item-cards item-cards--compact">' + data.logs.map(function (log) {
          return '<div class="item-card item-card--compact">' +
            '<div class="item-card-header">' +
              '<span class="badge ' + (actionColors[log.action] || 'badge-cyan') + '">' + escapeHtml(log.action) + '</span>' +
              '<span class="item-card-sub">' + new Date(log.timestamp).toLocaleString() + '</span>' +
            '</div>' +
            '<div class="item-card-audit-details">' +
              '<span>' + icon('user', 12) + ' ' + escapeHtml(log.username || '\u2014') + '</span>' +
              '<span style="font-family:monospace;font-size:var(--text-xs)">' + icon('globe', 12) + ' ' + escapeHtml(log.ip || '\u2014') + '</span>' +
            '</div>' +
            (log.details ? '<p class="item-card-desc" style="margin-top:6px">' + escapeHtml(log.details) + '</p>' : '') +
          '</div>';
        }).join('') + '</div>';
      } catch (err) {
        var el = document.getElementById('audit-list');
        if (el) el.innerHTML = '<p style="color:var(--danger);padding:var(--sp-4)">Failed to load audit logs</p>';
      }
    }

    document.getElementById('audit-filter').addEventListener('change', function (e) {
      loadAuditLogs(e.target.value);
    });

    loadAuditLogs();
  }

  /* ═══════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════ */
  initCyberBackground();
  render();

})();
