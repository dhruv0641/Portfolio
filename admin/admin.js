/**
 * ADMIN.JS — Dhruv Dobariya Portfolio Admin Dashboard
 * Single-page app with client-side routing, JWT auth, and full CRUD
 */
(function () {
  'use strict';

  const API = window.location.origin + '/api';
  const app = document.getElementById('app');

  // ─── State ───
  let token = localStorage.getItem('admin_token') || null;
  let currentPage = 'dashboard';
  let pending2FA = null; // Holds { tempToken } during 2FA flow
  let authView = 'login'; // 'login' | 'forgot' | 'reset'
  let pendingResetToken = null; // Holds reset token for reset form

  // ─── API Helper (supports both cookie & Bearer auth) ───
  async function api(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include' // Send cookies for HTTP-only JWT
      });
      
      // Handle token refresh on 401
      if (res.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          // Retry original request with new token
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const retry = await fetch(`${API}${endpoint}`, { ...options, headers, credentials: 'include' });
          const retryData = await retry.json();
          if (!retry.ok) throw new Error(retryData.error || 'API Error');
          return retryData;
        }
        logout();
        throw new Error('Session expired');
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API Error');
      return data;
    } catch (err) {
      if (err.message !== 'Session expired') showToast(err.message, 'error');
      throw err;
    }
  }

  // ─── Token Refresh ───
  async function tryRefreshToken() {
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.accessToken) {
        token = data.accessToken;
        localStorage.setItem('admin_token', token);
      }
      return true;
    } catch { return false; }
  }

  // ─── Toast ───
  function showToast(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<strong>${type === 'success' ? '✅' : '❌'}</strong> ${escapeHtml(msg)}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  // ─── Security: escape HTML ───
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Auth ───
  async function logout() {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
    } catch { /* ignore logout errors */ }
    token = null;
    pending2FA = null;
    authView = 'login';
    pendingResetToken = null;
    localStorage.removeItem('admin_token');
    render();
  }

  function isLoggedIn() { return !!token; }

  // ─── Router ───
  function navigate(page) {
    currentPage = page;
    render();
  }

  // ─── Main Render ───
  function render() {
    if (pending2FA) {
      render2FAVerify();
    } else if (!isLoggedIn()) {
      if (authView === 'forgot') {
        renderForgotPassword();
      } else if (authView === 'reset') {
        renderResetPassword();
      } else {
        renderLogin();
      }
    } else {
      renderDashboard();
    }
  }

  // ═══════════════════════════════════════════
  // LOGIN PAGE
  // ═══════════════════════════════════════════
  function renderLogin() {
    app.innerHTML = `
      <div class="login-wrapper">
        <div class="login-card">
          <div class="login-logo">Dhruvkumar Dobariya</div>
          <p class="login-subtitle">Admin Dashboard</p>
          <form id="login-form">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" class="form-input" id="login-user" placeholder="admin" autocomplete="username" required>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="password-wrap">
                <input type="password" class="form-input" id="login-pass" placeholder="••••••" autocomplete="current-password" required>
                <button type="button" class="toggle-pass" data-target="login-pass" title="Show password">👁️</button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:0.5rem">
              Sign In →
            </button>
            <p id="login-error" style="color:var(--red);font-size:0.8rem;text-align:center;margin-top:1rem;display:none"></p>
            <p style="text-align:center;margin-top:1rem">
              <a href="#" id="forgot-password-link" class="forgot-link">Forgot Password?</a>
            </p>
          </form>
        </div>
      </div>
    `;

    // Password toggle buttons
    document.querySelectorAll('.toggle-pass').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        if (!input) return;
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.textContent = isHidden ? '🙈' : '👁️';
        btn.title = isHidden ? 'Hide password' : 'Show password';
      });
    });

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = document.getElementById('login-user').value.trim();
      const pass = document.getElementById('login-pass').value;
      const errEl = document.getElementById('login-error');

      try {
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();
        
        if (!res.ok) {
          errEl.style.display = 'block';
          errEl.textContent = data.error || 'Invalid username or password';
          if (data.lockoutMinutes) {
            errEl.textContent += ` Account locked for ${data.lockoutMinutes} minutes.`;
          }
          return;
        }

        // Check if 2FA is required
        if (data.requires2FA) {
          pending2FA = { tempToken: data.tempToken };
          render();
          return;
        }

        // Normal login (no 2FA)
        token = data.accessToken || data.token;
        localStorage.setItem('admin_token', token);
        currentPage = 'dashboard';
        render();
      } catch (err) {
        errEl.style.display = 'block';
        errEl.textContent = 'Connection error. Is the API server running?';
      }
    });

    // Forgot password link
    document.getElementById('forgot-password-link').addEventListener('click', (e) => {
      e.preventDefault();
      authView = 'forgot';
      render();
    });
  }

  // ═══════════════════════════════════════════
  // FORGOT PASSWORD PAGE
  // ═══════════════════════════════════════════
  function renderForgotPassword() {
    app.innerHTML = `
      <div class="login-wrapper">
        <div class="login-card">
          <div class="login-logo">Dhruvkumar Dobariya</div>
          <p class="login-subtitle">Forgot Password</p>
          <p style="color:var(--text-muted);font-size:0.85rem;text-align:center;margin-bottom:1.5rem">
            Enter your admin email address to receive a reset code
          </p>
          <form id="forgot-form">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" id="forgot-email" placeholder="your@email.com" autocomplete="email" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:0.5rem">
              Send Reset Code →
            </button>
            <p id="forgot-error" style="color:var(--red);font-size:0.8rem;text-align:center;margin-top:1rem;display:none"></p>
            <p id="forgot-success" style="color:var(--green);font-size:0.8rem;text-align:center;margin-top:1rem;display:none"></p>
          </form>
          <div class="forgot-actions" style="text-align:center;margin-top:1.5rem;display:flex;gap:1rem;justify-content:center">
            <a href="#" id="back-to-login" class="forgot-link">← Back to Login</a>
            <a href="#" id="have-reset-code" class="forgot-link">I have a reset code</a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('forgot-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value.trim();
      const errEl = document.getElementById('forgot-error');
      const successEl = document.getElementById('forgot-success');
      errEl.style.display = 'none';
      successEl.style.display = 'none';

      try {
        const res = await fetch(`${API}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (!res.ok) {
          errEl.style.display = 'block';
          errEl.textContent = data.error || 'Something went wrong';
          return;
        }

        // If in dev mode, auto-fill the reset token
        if (data.resetToken) {
          pendingResetToken = data.resetToken;
        }

        successEl.style.display = 'block';
        successEl.textContent = data.message || 'Check your server console for the reset code.';

        // Show "enter reset code" option more prominently
        setTimeout(() => {
          authView = 'reset';
          render();
        }, 2000);
      } catch (err) {
        errEl.style.display = 'block';
        errEl.textContent = 'Connection error. Is the API server running?';
      }
    });

    document.getElementById('back-to-login').addEventListener('click', (e) => {
      e.preventDefault();
      authView = 'login';
      render();
    });

    document.getElementById('have-reset-code').addEventListener('click', (e) => {
      e.preventDefault();
      authView = 'reset';
      render();
    });
  }

  // ═══════════════════════════════════════════
  // RESET PASSWORD PAGE
  // ═══════════════════════════════════════════
  function renderResetPassword() {
    app.innerHTML = `
      <div class="login-wrapper">
        <div class="login-card">
          <div class="login-logo">Dhruvkumar Dobariya</div>
          <p class="login-subtitle">Reset Password</p>
          <p style="color:var(--text-muted);font-size:0.85rem;text-align:center;margin-bottom:1.5rem">
            Enter your reset code and choose a new password
          </p>
          <form id="reset-form">
            <div class="form-group">
              <label class="form-label">Reset Code</label>
              <input type="text" class="form-input" id="reset-token" placeholder="Paste your reset code" value="${pendingResetToken || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">New Password</label>
              <div class="password-wrap">
                <input type="password" class="form-input" id="reset-new-pass" placeholder="Min 8 chars, A-Z, a-z, 0-9" autocomplete="new-password" required>
                <button type="button" class="toggle-pass" data-target="reset-new-pass" title="Show password">👁️</button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <div class="password-wrap">
                <input type="password" class="form-input" id="reset-confirm-pass" placeholder="Re-enter password" autocomplete="new-password" required>
                <button type="button" class="toggle-pass" data-target="reset-confirm-pass" title="Show password">👁️</button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:0.5rem">
              Reset Password →
            </button>
            <p id="reset-error" style="color:var(--red);font-size:0.8rem;text-align:center;margin-top:1rem;display:none"></p>
            <p id="reset-success" style="color:var(--green);font-size:0.8rem;text-align:center;margin-top:1rem;display:none"></p>
          </form>
          <p style="text-align:center;margin-top:1.5rem">
            <a href="#" id="back-to-login-reset" class="forgot-link">← Back to Login</a>
          </p>
        </div>
      </div>
    `;

    // Password toggle buttons
    document.querySelectorAll('.toggle-pass').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        if (!input) return;
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.textContent = isHidden ? '🙈' : '👁️';
        btn.title = isHidden ? 'Hide password' : 'Show password';
      });
    });

    document.getElementById('reset-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const resetTokenVal = document.getElementById('reset-token').value.trim();
      const newPass = document.getElementById('reset-new-pass').value;
      const confirmPass = document.getElementById('reset-confirm-pass').value;
      const errEl = document.getElementById('reset-error');
      const successEl = document.getElementById('reset-success');
      errEl.style.display = 'none';
      successEl.style.display = 'none';

      if (newPass !== confirmPass) {
        errEl.style.display = 'block';
        errEl.textContent = 'Passwords do not match';
        return;
      }

      try {
        const res = await fetch(`${API}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token: resetTokenVal, newPassword: newPass })
        });
        const data = await res.json();

        if (!res.ok) {
          errEl.style.display = 'block';
          errEl.textContent = data.error || 'Reset failed';
          if (data.details) {
            errEl.textContent = data.details.map(d => d.message).join('. ');
          }
          return;
        }

        pendingResetToken = null;
        successEl.style.display = 'block';
        successEl.textContent = data.message || 'Password reset successfully!';

        // Redirect to login after success
        setTimeout(() => {
          authView = 'login';
          render();
        }, 2500);
      } catch (err) {
        errEl.style.display = 'block';
        errEl.textContent = 'Connection error. Is the API server running?';
      }
    });

    document.getElementById('back-to-login-reset').addEventListener('click', (e) => {
      e.preventDefault();
      pendingResetToken = null;
      authView = 'login';
      render();
    });
  }

  // ═══════════════════════════════════════════
  // 2FA VERIFICATION PAGE
  // ═══════════════════════════════════════════
  function render2FAVerify() {
    app.innerHTML = `
      <div class="login-wrapper">
        <div class="login-card">
          <div class="login-logo">Dhruvkumar Dobariya</div>
          <p class="login-subtitle">Two-Factor Authentication</p>
          <p style="color:var(--text-muted);font-size:0.85rem;text-align:center;margin-bottom:1.5rem">
            Enter the 6-digit code from your authenticator app
          </p>
          <form id="totp-form">
            <div class="form-group">
              <label class="form-label">Verification Code</label>
              <input type="text" class="form-input" id="totp-code" placeholder="000000" maxlength="6" pattern="[0-9]{6}" autocomplete="one-time-code" inputmode="numeric" required style="text-align:center;font-size:1.5rem;letter-spacing:0.5rem">
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:0.5rem">
              Verify →
            </button>
            <p id="totp-error" style="color:var(--red);font-size:0.8rem;text-align:center;margin-top:1rem;display:none"></p>
          </form>
          <button id="totp-cancel" style="background:none;border:none;color:var(--text-muted);font-size:0.8rem;cursor:pointer;margin-top:1rem;display:block;width:100%;text-align:center">
            ← Back to Login
          </button>
        </div>
      </div>
    `;

    const codeInput = document.getElementById('totp-code');
    codeInput.focus();

    document.getElementById('totp-cancel').addEventListener('click', () => {
      pending2FA = null;
      render();
    });

    document.getElementById('totp-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = codeInput.value.trim();
      const errEl = document.getElementById('totp-error');
      
      if (!/^\d{6}$/.test(code)) {
        errEl.style.display = 'block';
        errEl.textContent = 'Please enter a 6-digit code';
        return;
      }

      try {
        const res = await fetch(`${API}/auth/verify-2fa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ tempToken: pending2FA.tempToken, totpCode: code })
        });
        const data = await res.json();
        
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
        render();
      } catch (err) {
        errEl.style.display = 'block';
        errEl.textContent = 'Connection error';
      }
    });
  }

  // ═══════════════════════════════════════════
  // DASHBOARD LAYOUT
  // ═══════════════════════════════════════════
  function renderDashboard() {
    app.innerHTML = `
      <div class="app-layout">
        <aside class="sidebar">
          <div class="sidebar-logo">
            Dhruvkumar Dobariya
            <small>Admin Panel</small>
          </div>
          <ul class="sidebar-nav" id="sidebar-nav">
            <li><a href="#" data-page="dashboard" class="${currentPage === 'dashboard' ? 'active' : ''}"><span class="nav-icon">📊</span> Dashboard</a></li>
            <li><a href="#" data-page="projects" class="${currentPage === 'projects' ? 'active' : ''}"><span class="nav-icon">🔐</span> Projects</a></li>
            <li><a href="#" data-page="services" class="${currentPage === 'services' ? 'active' : ''}"><span class="nav-icon">⚙️</span> Services</a></li>
            <li><a href="#" data-page="messages" class="${currentPage === 'messages' ? 'active' : ''}"><span class="nav-icon">📬</span> Messages</a></li>
            <li><a href="#" data-page="audit" class="${currentPage === 'audit' ? 'active' : ''}"><span class="nav-icon">📋</span> Audit Log</a></li>
            <li><a href="#" data-page="settings" class="${currentPage === 'settings' ? 'active' : ''}"><span class="nav-icon">🛠️</span> Settings</a></li>
            <li style="margin-top:auto;border-top:1px solid var(--border);padding-top:0.5rem">
              <button id="logout-btn"><span class="nav-icon">🚪</span> Logout</button>
            </li>
          </ul>
          <div class="sidebar-user">Logged in as <strong>admin</strong></div>
        </aside>
        <main class="main-content" id="page-content"></main>
      </div>
    `;

    // Nav events
    document.querySelectorAll('#sidebar-nav a[data-page]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(a.dataset.page);
      });
    });

    document.getElementById('logout-btn').addEventListener('click', logout);

    // Render current page
    const pageContent = document.getElementById('page-content');
    switch (currentPage) {
      case 'dashboard': renderOverview(pageContent); break;
      case 'projects': renderProjects(pageContent); break;
      case 'services': renderServices(pageContent); break;
      case 'messages': renderMessages(pageContent); break;
      case 'audit': renderAuditLog(pageContent); break;
      case 'settings': renderSettings(pageContent); break;
      default: renderOverview(pageContent);
    }
  }

  // ═══════════════════════════════════════════
  // OVERVIEW PAGE
  // ═══════════════════════════════════════════
  async function renderOverview(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Overview of your cybersecurity portfolio</p>
        </div>
      </div>
      <div class="stats-grid" id="stats-grid">
        <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-value">—</div><div class="stat-label">Loading...</div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">Recent Messages</h3></div>
        <div id="recent-messages"><p style="color:var(--text-muted);font-size:0.85rem;padding:1rem">Loading...</p></div>
      </div>
    `;

    try {
      const stats = await api('/dashboard/stats');
      document.getElementById('stats-grid').innerHTML = `
        <div class="stat-card"><div class="stat-icon">🔐</div><div class="stat-value">${stats.totalProjects}</div><div class="stat-label">Projects</div></div>
        <div class="stat-card"><div class="stat-icon">⭐</div><div class="stat-value">${stats.featuredProjects}</div><div class="stat-label">Featured</div></div>
        <div class="stat-card"><div class="stat-icon">⚙️</div><div class="stat-value">${stats.totalServices}</div><div class="stat-label">Services</div></div>
        <div class="stat-card"><div class="stat-icon">📬</div><div class="stat-value">${stats.totalMessages}</div><div class="stat-label">Messages</div></div>
        <div class="stat-card"><div class="stat-icon">🔔</div><div class="stat-value">${stats.unreadMessages}</div><div class="stat-label">Unread</div></div>
      `;

      const msgsEl = document.getElementById('recent-messages');
      if (stats.recentMessages.length === 0) {
        msgsEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>No messages yet</p></div>';
      } else {
        msgsEl.innerHTML = `<table>
          <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>${stats.recentMessages.map(m => `
            <tr>
              <td>${escapeHtml(m.name)}</td>
              <td>${escapeHtml(m.email)}</td>
              <td><span class="badge ${m.status === 'unread' ? 'badge-orange' : 'badge-green'}">${m.status}</span></td>
              <td>${new Date(m.createdAt).toLocaleDateString()}</td>
            </tr>`).join('')}
          </tbody></table>`;
      }
    } catch (err) {
      document.getElementById('stats-grid').innerHTML = '<p style="color:var(--red)">Failed to load stats. Is the API server running?</p>';
    }
  }

  // ═══════════════════════════════════════════
  // PROJECTS PAGE
  // ═══════════════════════════════════════════
  async function renderProjects(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Projects</h1>
          <p class="page-subtitle">Manage your security lab projects</p>
        </div>
        <button class="btn btn-primary" id="add-project-btn">+ Add Project</button>
      </div>
      <div id="projects-list"><p style="color:var(--text-muted)">Loading...</p></div>
    `;

    document.getElementById('add-project-btn').addEventListener('click', () => showProjectModal());

    try {
      const projects = await api('/projects');
      const listEl = document.getElementById('projects-list');

      if (projects.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🔐</div><p>No projects yet. Add your first one!</p></div>';
        return;
      }

      listEl.innerHTML = `<div class="card"><table>
        <thead><tr><th></th><th>Title</th><th>Technologies</th><th>Featured</th><th>Actions</th></tr></thead>
        <tbody>${projects.map(p => `
          <tr>
            <td style="font-size:1.5rem">${p.emoji || '🔒'}</td>
            <td><strong>${escapeHtml(p.title)}</strong><br><small style="color:var(--text-muted)">${escapeHtml((p.description || '').substring(0, 80))}...</small></td>
            <td>${(p.technologies || []).map(t => `<span class="badge badge-cyan">${escapeHtml(t)}</span> `).join('')}</td>
            <td>${p.featured ? '<span class="badge badge-green">Yes</span>' : '<span class="badge badge-red">No</span>'}</td>
            <td>
              <button class="btn-icon edit-project" data-id="${p.id}" title="Edit">✏️</button>
              <button class="btn-icon delete-project" data-id="${p.id}" title="Delete" style="margin-left:4px">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody></table></div>`;

      listEl.querySelectorAll('.edit-project').forEach(btn => {
        btn.addEventListener('click', () => {
          const project = projects.find(p => p.id === btn.dataset.id);
          if (project) showProjectModal(project);
        });
      });

      listEl.querySelectorAll('.delete-project').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this project?')) return;
          try {
            await api(`/projects/${btn.dataset.id}`, { method: 'DELETE' });
            showToast('Project deleted');
            renderProjects(container);
          } catch (err) { /* toast shown by api() */ }
        });
      });

    } catch (err) { /* */ }
  }

  function showProjectModal(project = null) {
    const isEdit = !!project;
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit' : 'Add'} Project</h3>
          <button class="btn-icon modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Title</label>
              <input class="form-input" id="p-title" value="${escapeHtml(project?.title || '')}" placeholder="SOC Log Analysis Lab">
            </div>
            <div class="form-group">
              <label class="form-label">Emoji</label>
              <input class="form-input" id="p-emoji" value="${project?.emoji || '🔒'}" placeholder="🔍">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" id="p-desc" placeholder="Describe the project...">${escapeHtml(project?.description || '')}</textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Technologies (comma separated)</label>
              <input class="form-input" id="p-tech" value="${(project?.technologies || []).join(', ')}" placeholder="Splunk, SIEM, Python">
            </div>
            <div class="form-group">
              <label class="form-label">GitHub Link</label>
              <input class="form-input" id="p-github" value="${escapeHtml(project?.githubLink || '')}" placeholder="https://github.com/...">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Impact</label>
            <input class="form-input" id="p-impact" value="${escapeHtml(project?.impact || '')}" placeholder="Detected 15+ attack patterns...">
          </div>
          <div class="form-group">
            <label class="form-check">
              <input type="checkbox" id="p-featured" ${project?.featured ? 'checked' : ''}>
              Featured project
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="p-save">${isEdit ? 'Save Changes' : 'Create Project'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    backdrop.querySelector('.modal-close').addEventListener('click', () => backdrop.remove());
    backdrop.querySelector('.modal-cancel').addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });

    document.getElementById('p-save').addEventListener('click', async () => {
      const body = {
        title: document.getElementById('p-title').value.trim(),
        emoji: document.getElementById('p-emoji').value.trim() || '🔒',
        description: document.getElementById('p-desc').value.trim(),
        technologies: document.getElementById('p-tech').value.split(',').map(t => t.trim()).filter(Boolean),
        githubLink: document.getElementById('p-github').value.trim() || '#',
        impact: document.getElementById('p-impact').value.trim(),
        featured: document.getElementById('p-featured').checked
      };

      if (!body.title) { showToast('Title is required', 'error'); return; }

      try {
        if (isEdit) {
          await api(`/projects/${project.id}`, { method: 'PUT', body: JSON.stringify(body) });
          showToast('Project updated');
        } else {
          await api('/projects', { method: 'POST', body: JSON.stringify(body) });
          showToast('Project created');
        }
        backdrop.remove();
        renderProjects(document.getElementById('page-content'));
      } catch (err) { /* */ }
    });
  }

  // ═══════════════════════════════════════════
  // SERVICES PAGE
  // ═══════════════════════════════════════════
  async function renderServices(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Services</h1>
          <p class="page-subtitle">Manage your cybersecurity service offerings</p>
        </div>
        <button class="btn btn-primary" id="add-service-btn">+ Add Service</button>
      </div>
      <div id="services-list"><p style="color:var(--text-muted)">Loading...</p></div>
    `;

    document.getElementById('add-service-btn').addEventListener('click', () => showServiceModal());

    try {
      const services = await api('/services');
      const listEl = document.getElementById('services-list');

      if (services.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">⚙️</div><p>No services yet.</p></div>';
        return;
      }

      listEl.innerHTML = `<div class="card"><table>
        <thead><tr><th></th><th>Title</th><th>Description</th><th>Actions</th></tr></thead>
        <tbody>${services.map(s => `
          <tr>
            <td style="font-size:1.5rem">${s.icon || '🔒'}</td>
            <td><strong>${escapeHtml(s.title)}</strong></td>
            <td style="color:var(--text-secondary);max-width:300px">${escapeHtml((s.description || '').substring(0, 100))}...</td>
            <td>
              <button class="btn-icon edit-service" data-id="${s.id}" title="Edit">✏️</button>
              <button class="btn-icon delete-service" data-id="${s.id}" title="Delete" style="margin-left:4px">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody></table></div>`;

      listEl.querySelectorAll('.edit-service').forEach(btn => {
        btn.addEventListener('click', () => {
          const svc = services.find(s => s.id === btn.dataset.id);
          if (svc) showServiceModal(svc);
        });
      });

      listEl.querySelectorAll('.delete-service').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this service?')) return;
          try {
            await api(`/services/${btn.dataset.id}`, { method: 'DELETE' });
            showToast('Service deleted');
            renderServices(container);
          } catch (err) { /* */ }
        });
      });
    } catch (err) { /* */ }
  }

  function showServiceModal(service = null) {
    const isEdit = !!service;
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit' : 'Add'} Service</h3>
          <button class="btn-icon modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Title</label>
              <input class="form-input" id="s-title" value="${escapeHtml(service?.title || '')}" placeholder="Security Investigation">
            </div>
            <div class="form-group">
              <label class="form-label">Icon (Emoji)</label>
              <input class="form-input" id="s-icon" value="${service?.icon || '🔒'}" placeholder="🔍">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" id="s-desc">${escapeHtml(service?.description || '')}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="s-save">${isEdit ? 'Save' : 'Create'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    backdrop.querySelector('.modal-close').addEventListener('click', () => backdrop.remove());
    backdrop.querySelector('.modal-cancel').addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });

    document.getElementById('s-save').addEventListener('click', async () => {
      const body = {
        title: document.getElementById('s-title').value.trim(),
        icon: document.getElementById('s-icon').value.trim() || '🔒',
        description: document.getElementById('s-desc').value.trim()
      };

      if (!body.title) { showToast('Title is required', 'error'); return; }

      try {
        if (isEdit) {
          await api(`/services/${service.id}`, { method: 'PUT', body: JSON.stringify(body) });
          showToast('Service updated');
        } else {
          await api('/services', { method: 'POST', body: JSON.stringify(body) });
          showToast('Service created');
        }
        backdrop.remove();
        renderServices(document.getElementById('page-content'));
      } catch (err) { /* */ }
    });
  }

  // ═══════════════════════════════════════════
  // MESSAGES PAGE
  // ═══════════════════════════════════════════
  async function renderMessages(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Messages</h1>
          <p class="page-subtitle">Contact form submissions</p>
        </div>
      </div>
      <div id="messages-list"><p style="color:var(--text-muted)">Loading...</p></div>
    `;

    try {
      const messages = await api('/messages');
      const listEl = document.getElementById('messages-list');

      if (messages.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>No messages yet. They\'ll appear here when visitors contact you.</p></div>';
        return;
      }

      listEl.innerHTML = `<div class="card"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Message</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>${messages.map(m => `
          <tr style="${m.status === 'unread' ? 'background:rgba(6,182,212,0.03)' : ''}">
            <td><strong>${escapeHtml(m.name)}</strong></td>
            <td><a href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a></td>
            <td style="max-width:250px;color:var(--text-secondary)">${escapeHtml((m.message || '').substring(0, 80))}...</td>
            <td><span class="badge ${m.status === 'unread' ? 'badge-orange' : 'badge-green'}">${m.status}</span></td>
            <td>${new Date(m.createdAt).toLocaleDateString()}</td>
            <td>
              ${m.status === 'unread' ? `<button class="btn btn-sm btn-ghost mark-read" data-id="${m.id}">Mark Read</button>` : ''}
              <button class="btn-icon delete-msg" data-id="${m.id}" title="Delete" style="margin-left:4px">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody></table></div>`;

      listEl.querySelectorAll('.mark-read').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            await api(`/messages/${btn.dataset.id}/read`, { method: 'PATCH' });
            showToast('Marked as read');
            renderMessages(container);
          } catch (err) { /* */ }
        });
      });

      listEl.querySelectorAll('.delete-msg').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this message?')) return;
          try {
            await api(`/messages/${btn.dataset.id}`, { method: 'DELETE' });
            showToast('Message deleted');
            renderMessages(container);
          } catch (err) { /* */ }
        });
      });
    } catch (err) { /* */ }
  }

  // ═══════════════════════════════════════════
  // SETTINGS PAGE
  // ═══════════════════════════════════════════
  async function renderSettings(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Brand, SEO & account settings</p>
        </div>
      </div>
      <div id="settings-content"><p style="color:var(--text-muted)">Loading...</p></div>
    `;

    try {
      const settings = await api('/settings');
      const el = document.getElementById('settings-content');

      el.innerHTML = `
        <div class="card">
          <div class="card-header"><h3 class="card-title">Brand & Contact</h3></div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Site Name / Logo Text</label>
              <input class="form-input" id="set-siteName" value="${escapeHtml(settings.siteName || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input class="form-input" id="set-fullName" value="${escapeHtml(settings.fullName || '')}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Tagline</label>
            <input class="form-input" id="set-tagline" value="${escapeHtml(settings.tagline || '')}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" id="set-email" value="${escapeHtml(settings.email || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">Location</label>
              <input class="form-input" id="set-location" value="${escapeHtml(settings.location || '')}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">LinkedIn URL</label>
              <input class="form-input" id="set-linkedin" value="${escapeHtml(settings.linkedIn || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">GitHub URL</label>
              <input class="form-input" id="set-github" value="${escapeHtml(settings.github || '')}">
            </div>
          </div>
          <button class="btn btn-primary" id="save-brand" style="margin-top:0.5rem">Save Brand Settings</button>
        </div>

        <div class="card">
          <div class="card-header"><h3 class="card-title">SEO Settings</h3></div>
          <div class="form-group">
            <label class="form-label">SEO Title</label>
            <input class="form-input" id="set-seoTitle" value="${escapeHtml(settings.seoTitle || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">SEO Description</label>
            <textarea class="form-textarea" id="set-seoDesc">${escapeHtml(settings.seoDescription || '')}</textarea>
          </div>
          <button class="btn btn-primary" id="save-seo" style="margin-top:0.5rem">Save SEO Settings</button>
        </div>

        <div class="card">
          <div class="card-header"><h3 class="card-title">Change Password</h3></div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Current Password</label>
              <div class="password-wrap">
                <input type="password" class="form-input" id="set-curPass" autocomplete="current-password">
                <button type="button" class="toggle-pass" data-target="set-curPass" title="Show password">👁️</button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">New Password</label>
              <div class="password-wrap">
                <input type="password" class="form-input" id="set-newPass" autocomplete="new-password">
                <button type="button" class="toggle-pass" data-target="set-newPass" title="Show password">👁️</button>
              </div>
            </div>
          </div>
          <button class="btn btn-danger" id="change-pass" style="margin-top:0.5rem">Change Password</button>
        </div>

        <div class="card">
          <div class="card-header"><h3 class="card-title">Two-Factor Authentication (2FA)</h3></div>
          <div id="totp-settings">
            <p style="color:var(--text-muted);font-size:0.85rem">Loading 2FA status...</p>
          </div>
        </div>
      `;

      // Password toggle buttons
      document.querySelectorAll('.toggle-pass').forEach(btn => {
        btn.addEventListener('click', () => {
          const input = document.getElementById(btn.dataset.target);
          if (!input) return;
          const isHidden = input.type === 'password';
          input.type = isHidden ? 'text' : 'password';
          btn.textContent = isHidden ? '🙈' : '👁️';
          btn.title = isHidden ? 'Hide password' : 'Show password';
        });
      });

      // 2FA Setup
      (async function init2FA() {
        const totpEl = document.getElementById('totp-settings');
        try {
          const me = await api('/auth/me');
          if (me.totpEnabled) {
            totpEl.innerHTML = `
              <p style="color:var(--green);margin-bottom:1rem">✅ Two-factor authentication is <strong>enabled</strong></p>
              <button class="btn btn-danger" id="disable-totp">Disable 2FA</button>
            `;
            document.getElementById('disable-totp').addEventListener('click', async () => {
              if (!confirm('Disable two-factor authentication? This makes your account less secure.')) return;
              try {
                await api('/auth/disable-2fa', { method: 'POST' });
                showToast('2FA disabled');
                renderSettings(document.getElementById('page-content'));
              } catch (err) { /* toast shown by api() */ }
            });
          } else {
            totpEl.innerHTML = `
              <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">Protect your account with a TOTP authenticator app (Google Authenticator, Authy, etc.)</p>
              <button class="btn btn-primary" id="setup-totp">Setup 2FA</button>
              <div id="totp-setup-ui" style="display:none;margin-top:1.5rem">
                <p style="color:var(--text-primary);font-size:0.85rem;margin-bottom:1rem">Scan this QR code with your authenticator app:</p>
                <div id="totp-qr" style="text-align:center;margin-bottom:1rem"></div>
                <p style="color:var(--text-muted);font-size:0.75rem;margin-bottom:0.5rem">Or enter manually: <code id="totp-secret" style="user-select:all;color:var(--cyan)"></code></p>
                <div class="form-group" style="max-width:300px">
                  <label class="form-label">Enter 6-digit code to confirm</label>
                  <input type="text" class="form-input" id="totp-confirm-code" placeholder="000000" maxlength="6" inputmode="numeric" style="text-align:center;font-size:1.2rem;letter-spacing:0.3rem">
                </div>
                <button class="btn btn-primary" id="confirm-totp">Confirm &amp; Enable 2FA</button>
              </div>
            `;

            document.getElementById('setup-totp').addEventListener('click', async () => {
              try {
                const data = await api('/auth/setup-2fa', { method: 'POST' });
                const ui = document.getElementById('totp-setup-ui');
                ui.style.display = 'block';
                document.getElementById('setup-totp').style.display = 'none';
                document.getElementById('totp-secret').textContent = data.secret || '';
                const qrEl = document.getElementById('totp-qr');
                if (data.qrCode) {
                  qrEl.innerHTML = '<img src="' + data.qrCode + '" alt="QR Code" style="max-width:200px;margin:0 auto;border-radius:8px">';
                }
              } catch (err) { /* */ }
            });

            document.getElementById('confirm-totp')?.addEventListener('click', async () => {
              const code = document.getElementById('totp-confirm-code').value.trim();
              if (!/^\d{6}$/.test(code)) {
                showToast('Enter a valid 6-digit code', 'error');
                return;
              }
              try {
                await api('/auth/confirm-2fa', { method: 'POST', body: JSON.stringify({ totpCode: code }) });
                showToast('2FA enabled successfully! 🔒');
                renderSettings(document.getElementById('page-content'));
              } catch (err) { /* */ }
            });
          }
        } catch (err) {
          totpEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem">2FA management unavailable</p>';
        }
      })();

      document.getElementById('save-brand').addEventListener('click', async () => {
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

      document.getElementById('save-seo').addEventListener('click', async () => {
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

      document.getElementById('change-pass').addEventListener('click', async () => {
        const cur = document.getElementById('set-curPass').value;
        const nw = document.getElementById('set-newPass').value;
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

  // ═══════════════════════════════════════════
  // AUDIT LOG PAGE
  // ═══════════════════════════════════════════
  async function renderAuditLog(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Audit Log</h1>
          <p class="page-subtitle">Security event tracking &amp; activity history</p>
        </div>
        <select id="audit-filter" class="form-input" style="width:auto;min-width:200px">
          <option value="">All Actions</option>
          <option value="LOGIN_SUCCESS">Login Success</option>
          <option value="LOGIN_FAILED">Login Failed</option>
          <option value="LOGIN_LOCKED">Account Locked</option>
          <option value="PASSWORD_CHANGE">Password Change</option>
          <option value="TOTP_SETUP">2FA Setup</option>
          <option value="TOTP_VERIFY">2FA Verified</option>
          <option value="PROJECT_CREATE">Project Created</option>
          <option value="PROJECT_UPDATE">Project Updated</option>
          <option value="PROJECT_DELETE">Project Deleted</option>
          <option value="MESSAGE_DELETE">Message Deleted</option>
        </select>
      </div>
      <div class="card">
        <div id="audit-list"><p style="color:var(--text-muted);font-size:0.85rem;padding:1rem">Loading...</p></div>
      </div>
    `;

    async function loadAuditLogs(action = '') {
      try {
        const query = action ? `?action=${action}&limit=50` : '?limit=50';
        const data = await api(`/dashboard/audit-logs${query}`);
        const listEl = document.getElementById('audit-list');

        if (!data.logs || data.logs.length === 0) {
          listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No audit logs found</p></div>';
          return;
        }

        const actionColors = {
          'LOGIN_SUCCESS': 'badge-green', 'LOGIN_FAILED': 'badge-red', 'LOGIN_LOCKED': 'badge-red',
          'PASSWORD_CHANGE': 'badge-orange', 'TOTP_SETUP': 'badge-cyan', 'TOTP_VERIFY': 'badge-green',
          'TOTP_FAILED': 'badge-red', 'PROJECT_CREATE': 'badge-cyan', 'PROJECT_UPDATE': 'badge-orange',
          'PROJECT_DELETE': 'badge-red', 'SERVICE_CREATE': 'badge-cyan', 'SERVICE_UPDATE': 'badge-orange',
          'SERVICE_DELETE': 'badge-red', 'MESSAGE_DELETE': 'badge-red', 'SETTINGS_UPDATE': 'badge-orange'
        };

        listEl.innerHTML = `<table>
          <thead><tr><th>Time</th><th>Action</th><th>User</th><th>IP</th><th>Details</th></tr></thead>
          <tbody>${data.logs.map(log => `
            <tr>
              <td style="white-space:nowrap">${new Date(log.timestamp).toLocaleString()}</td>
              <td><span class="badge ${actionColors[log.action] || 'badge-cyan'}">${escapeHtml(log.action)}</span></td>
              <td>${escapeHtml(log.username || '—')}</td>
              <td style="font-family:monospace;font-size:0.8rem">${escapeHtml(log.ip || '—')}</td>
              <td style="font-size:0.8rem;color:var(--text-muted)">${escapeHtml(log.details || '—')}</td>
            </tr>`).join('')}
          </tbody></table>`;
      } catch (err) {
        document.getElementById('audit-list').innerHTML = '<p style="color:var(--red);padding:1rem">Failed to load audit logs</p>';
      }
    }

    document.getElementById('audit-filter').addEventListener('change', (e) => {
      loadAuditLogs(e.target.value);
    });

    loadAuditLogs();
  }

  // ─── Initial render ───
  render();
})();
