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
    'server':        '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>'
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
  function showToast(msg, type) {
    type = type || 'success';
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    var ic = type === 'success' ? icon('check', 16) : icon('alert-triangle', 16);
    el.innerHTML = '<span class="toast-icon">' + ic + '</span> ' + escapeHtml(msg);
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.remove(); }, 3500);
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
    currentPage = page;
    window.location.hash = page;
    renderContent();
  }

  function getPageFromHash() {
    var hash = window.location.hash.replace('#', '');
    var valid = ['dashboard', 'projects', 'services', 'messages', 'audit', 'settings'];
    return valid.indexOf(hash) !== -1 ? hash : 'dashboard';
  }

  window.addEventListener('hashchange', function () {
    if (!isLoggedIn()) return;
    var page = getPageFromHash();
    if (page !== currentPage) {
      currentPage = page;
      renderContent();
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
      default:          renderOverview(pageContent);
    }
  }

  function updateActiveNav() {
    var links = document.querySelectorAll('#sidebar-nav a[data-page]');
    links.forEach(function (a) {
      a.classList.toggle('active', a.dataset.page === currentPage);
    });
  }

  function updateTopbar() {
    var names = { dashboard: 'Dashboard', projects: 'Projects', services: 'Services', messages: 'Messages', audit: 'Audit Log', settings: 'Settings' };
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

  function openSidebar() {
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.classList.add('menu-open');
  }

  function closeSidebar() {
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
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
    container.innerHTML =
      '<div class="page-header">' +
        '<div><h1 class="page-title">Projects</h1><p class="page-subtitle">Manage your security lab projects</p></div>' +
        '<button class="btn btn-primary" id="add-project-btn">' + icon('plus', 16) + ' Add Project</button>' +
      '</div>' +
      '<div id="projects-list">' + skeleton('cards', 3) + '</div>';

    document.getElementById('add-project-btn').addEventListener('click', function () { showProjectModal(); });

    try {
      var projects = await api('/projects');
      var listEl = document.getElementById('projects-list');
      if (!listEl) return;

      if (projects.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">' + icon('shield', 36) + '</div><p>No projects yet. Add your first one!</p></div>';
        return;
      }

      listEl.innerHTML = '<div class="item-cards">' + projects.map(function (p) {
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
        '</div>';
      }).join('') + '</div>';

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
          var confirmed = await customConfirm('Are you sure you want to delete this project? This action cannot be undone.', { title: 'Delete Project', type: 'danger' });
          if (!confirmed) return;
          try {
            await api('/projects/' + btn.dataset.id, { method: 'DELETE' });
            showToast('Project deleted');
            renderProjects(container);
          } catch (err) { /* toast shown by api() */ }
        });
      });
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

      try {
        if (isEdit) {
          await api('/projects/' + project.id, { method: 'PUT', body: JSON.stringify(body) });
          showToast('Project updated');
        } else {
          await api('/projects', { method: 'POST', body: JSON.stringify(body) });
          showToast('Project created');
        }
        backdrop.remove();
        document.removeEventListener('keydown', onEsc);
        renderProjects(document.getElementById('page-content'));
      } catch (err) { /* */ }
    });
  }

  /* ═══════════════════════════════════════════
     SERVICES PAGE
     ═══════════════════════════════════════════ */
  async function renderServices(container) {
    container.innerHTML =
      '<div class="page-header">' +
        '<div><h1 class="page-title">Services</h1><p class="page-subtitle">Manage your cybersecurity service offerings</p></div>' +
        '<button class="btn btn-primary" id="add-service-btn">' + icon('plus', 16) + ' Add Service</button>' +
      '</div>' +
      '<div id="services-list">' + skeleton('cards', 3) + '</div>';

    document.getElementById('add-service-btn').addEventListener('click', function () { showServiceModal(); });

    try {
      var services = await api('/services');
      var listEl = document.getElementById('services-list');
      if (!listEl) return;

      if (services.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">' + icon('server', 36) + '</div><p>No services yet.</p></div>';
        return;
      }

      listEl.innerHTML = '<div class="item-cards">' + services.map(function (s) {
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
        '</div>';
      }).join('') + '</div>';

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
          var confirmed = await customConfirm('Delete this service? This cannot be undone.', { title: 'Delete Service', type: 'danger' });
          if (!confirmed) return;
          try {
            await api('/services/' + btn.dataset.id, { method: 'DELETE' });
            showToast('Service deleted');
            renderServices(container);
          } catch (err) { /* */ }
        });
      });
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

    document.getElementById('s-save').addEventListener('click', async function () {
      var body = {
        title: document.getElementById('s-title').value.trim(),
        icon: document.getElementById('s-icon').value.trim() || '',
        description: document.getElementById('s-desc').value.trim()
      };

      if (!body.title) { showToast('Title is required', 'error'); return; }

      try {
        if (isEdit) {
          await api('/services/' + service.id, { method: 'PUT', body: JSON.stringify(body) });
          showToast('Service updated');
        } else {
          await api('/services', { method: 'POST', body: JSON.stringify(body) });
          showToast('Service created');
        }
        backdrop.remove();
        document.removeEventListener('keydown', onEsc);
        renderServices(document.getElementById('page-content'));
      } catch (err) { /* */ }
    });
  }

  /* ═══════════════════════════════════════════
     MESSAGES PAGE
     ═══════════════════════════════════════════ */
  async function renderMessages(container) {
    container.innerHTML =
      '<div class="page-header">' +
        '<div><h1 class="page-title">Messages</h1><p class="page-subtitle">Contact form submissions</p></div>' +
      '</div>' +
      '<div id="messages-list">' + skeleton('cards', 4) + '</div>';

    try {
      var messages = await api('/messages');
      var listEl = document.getElementById('messages-list');
      if (!listEl) return;

      if (messages.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">' + icon('inbox', 36) + '</div><p>No messages yet. They\'ll appear here when visitors contact you.</p></div>';
        return;
      }

      listEl.innerHTML = '<div class="item-cards">' + messages.map(function (m) {
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
          '</div>' +
        '</div>';
      }).join('') + '</div>';

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
          try {
            await api('/messages/' + btn.dataset.id + '/read', { method: 'PATCH' });
            showToast('Marked as read');
            renderMessages(container);
          } catch (err) { /* */ }
        });
      });

      listEl.querySelectorAll('.delete-msg').forEach(function (btn) {
        btn.addEventListener('click', async function () {
          var confirmed = await customConfirm('Delete this message? This cannot be undone.', { title: 'Delete Message', type: 'danger' });
          if (!confirmed) return;
          try {
            await api('/messages/' + btn.dataset.id, { method: 'DELETE' });
            showToast('Message deleted');
            renderMessages(container);
          } catch (err) { /* */ }
        });
      });
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
      });

      document.getElementById('save-seo').addEventListener('click', async function () {
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
      });

      document.getElementById('change-pass').addEventListener('click', async function () {
        var cur = document.getElementById('set-curPass').value;
        var nw = document.getElementById('set-newPass').value;
        if (!cur || !nw) { showToast('Both password fields required', 'error'); return; }
        if (nw.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

        try {
          await api('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword: cur, newPassword: nw })
          });
          showToast('Password changed successfully');
          document.getElementById('set-curPass').value = '';
          document.getElementById('set-newPass').value = '';
        } catch (err) { /* */ }
      });
    } catch (err) { /* */ }
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
