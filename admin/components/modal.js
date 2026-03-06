/**
 * ═══════════════════════════════════════════════════════════
 * Admin Panel — Modal / Confirm Dialog Component
 * ═══════════════════════════════════════════════════════════
 * Accessible modal with focus trapping and keyboard support.
 */

let _activeModal = null;
let _previousFocus = null;
let _trapHandler = null;

/**
 * Show a confirmation dialog.
 * @param {Object} options
 * @param {string} options.title - Modal title
 * @param {string} options.message - Modal body text
 * @param {string} [options.confirmText='Confirm']
 * @param {string} [options.cancelText='Cancel']
 * @param {'danger'|'warning'|'info'} [options.variant='danger']
 * @returns {Promise<boolean>} Resolves true on confirm, false on cancel
 */
export function confirm({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger' }) {
  return new Promise((resolve) => {
    close(); // Close any existing modal

    _previousFocus = document.activeElement;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', title);

    overlay.innerHTML = `
      <div class="modal-content modal-${variant}">
        <h3 class="modal-title">${escapeHtml(title)}</h3>
        <p class="modal-message">${escapeHtml(message)}</p>
        <div class="modal-actions">
          <button class="btn btn-cancel" data-action="cancel">${escapeHtml(cancelText)}</button>
          <button class="btn btn-${variant}" data-action="confirm">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    _activeModal = overlay;

    // Handle button clicks
    overlay.addEventListener('click', (e) => {
      const action = e.target.getAttribute('data-action');
      if (action === 'confirm') { close(); resolve(true); }
      if (action === 'cancel') { close(); resolve(false); }
      if (e.target === overlay) { close(); resolve(false); } // Click backdrop
    });

    // Keyboard: Escape to cancel, Tab trapping
    _trapHandler = (e) => {
      if (e.key === 'Escape') { close(); resolve(false); return; }
      if (e.key === 'Tab') {
        const focusable = overlay.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', _trapHandler);

    document.body.appendChild(overlay);

    // Focus first button
    const firstBtn = overlay.querySelector('button');
    if (firstBtn) firstBtn.focus();
  });
}

/**
 * Close the active modal.
 */
export function close() {
  if (_trapHandler) {
    document.removeEventListener('keydown', _trapHandler);
    _trapHandler = null;
  }
  if (_activeModal) {
    _activeModal.remove();
    _activeModal = null;
  }
  if (_previousFocus) {
    _previousFocus.focus();
    _previousFocus = null;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
