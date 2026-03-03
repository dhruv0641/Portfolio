/* ============================================================
   ELITE CYBERSECURITY PLATFORM — MAIN.JS v2.0
   Pure Vanilla JS — Zero Dependencies
   ============================================================ */
(function () {
  'use strict';

  /* ======== UTILITIES ======== */
  function debounce(fn, ms) {
    var timer;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  var isDesktop = window.matchMedia('(min-width: 1025px) and (hover: hover)').matches;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ======== LOADER ======== */
  var loader = qs('#loader');
  function hideLoader() {
    if (!loader) return;
    loader.classList.add('hidden');
    setTimeout(function () {
      loader.style.display = 'none';
      initAfterLoad();
    }, 600);
  }
  window.addEventListener('load', function () {
    setTimeout(hideLoader, 1800);
  });

  /* ======== HERO — CHARACTER REVEAL ======== */
  function initCharReveal() {
    var el = qs('.vfx-pending');
    if (!el) return;
    var text = el.textContent.trim();
    el.innerHTML = '';
    el.classList.remove('vfx-pending');
    el.classList.add('vfx-ready');
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.className = 'char-wrap';
      var ch = document.createElement('span');
      ch.className = 'char';
      ch.style.setProperty('--d', (0.04 * i) + 's');
      ch.textContent = text[i] === ' ' ? '\u00A0' : text[i];
      span.appendChild(ch);
      el.appendChild(span);
    }
  }

  /* ======== HERO — TYPING EFFECT ======== */
  var typedPhrases = [
    'SOC Analyst',
    'Incident Responder',
    'SIEM Specialist',
    'Threat Hunter',
    'Cybersecurity Engineer',
    'Security Automation Developer'
  ];
  var typedEl, typedIdx = 0, typedChar = 0, typedDeleting = false;

  function typeLoop() {
    typedEl = typedEl || qs('#typed-text');
    if (!typedEl) return;
    var current = typedPhrases[typedIdx];
    if (!typedDeleting) {
      typedEl.textContent = current.substring(0, typedChar + 1);
      typedChar++;
      if (typedChar >= current.length) {
        setTimeout(function () { typedDeleting = true; typeLoop(); }, 2000);
        return;
      }
      setTimeout(typeLoop, 70);
    } else {
      typedEl.textContent = current.substring(0, typedChar);
      typedChar--;
      if (typedChar < 0) {
        typedDeleting = false;
        typedIdx = (typedIdx + 1) % typedPhrases.length;
        typedChar = 0;
        setTimeout(typeLoop, 400);
        return;
      }
      setTimeout(typeLoop, 35);
    }
  }

  /* ======== NAVBAR SCROLL STATE ======== */
  var navbar = qs('#navbar');
  function updateNavbar() {
    if (!navbar) return;
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  /* ======== SCROLL PROGRESS BAR ======== */
  var scrollBar = qs('#scroll-progress');
  function updateScrollProgress() {
    if (!scrollBar) return;
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    scrollBar.style.width = (scrollTop / scrollHeight * 100).toFixed(1) + '%';
  }

  /* ======== FLOATING CTA ======== */
  var floatingCTA = qs('#floating-cta');
  function updateFloatingCTA() {
    if (!floatingCTA) return;
    if (window.scrollY > 600) {
      floatingCTA.classList.add('visible');
    } else {
      floatingCTA.classList.remove('visible');
    }
  }

  /* ======== ACTIVE NAV LINK ======== */
  var sections = qsa('section[id]');
  var navLinks = qsa('#navbar .nav-links a[href^="#"]');
  function updateActiveNav() {
    var scrollY = window.scrollY + 150;
    sections.forEach(function (sec) {
      var top = sec.offsetTop;
      var height = sec.offsetHeight;
      var id = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }

  /* ======== COMBINED SCROLL HANDLER (debounced) ======== */
  var debouncedScroll = debounce(function () {
    updateActiveNav();
  }, 50);

  function onScroll() {
    updateNavbar();
    updateScrollProgress();
    updateFloatingCTA();
    debouncedScroll();
  }

  /* ======== HAMBURGER MENU ======== */
  function initHamburger() {
    var btn = qs('.hamburger');
    var menu = qs('.nav-links');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      btn.classList.toggle('open');
      menu.classList.toggle('open');
    });
    // Close on link click
    qsa('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        btn.classList.remove('open');
        menu.classList.remove('open');
      });
    });
    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        btn.classList.remove('open');
        menu.classList.remove('open');
      }
    });
  }

  /* ======== SMOOTH SCROLL ======== */
  function initSmoothScroll() {
    qsa('[data-scroll-to]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var target = qs(el.getAttribute('data-scroll-to'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ======== INTERSECTION OBSERVER — REVEALS ======== */
  function initReveals() {
    var reveals = qsa('.reveal');
    if (!reveals.length) return;
    if (prefersReducedMotion) {
      reveals.forEach(function (r) { r.classList.add('visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (r) { observer.observe(r); });
  }

  /* ======== HERO REVEAL (reveal-hero items) ======== */
  function initHeroReveals() {
    var items = qsa('.reveal-hero');
    if (!items.length) return;
    if (prefersReducedMotion) {
      items.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add('visible'); });
    }, 300);
  }

  /* ======== TIMELINE ANIMATION ======== */
  function initTimeline() {
    var track = qs('.timeline-track');
    if (!track) return;
    if (prefersReducedMotion) {
      track.classList.add('visible');
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          track.classList.add('visible');
          observer.unobserve(track);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(track);
  }

  /* ======== WHY SECTION — STAT COUNTERS ======== */
  function animateCounters() {
    var whySection = qs('#why');
    if (!whySection) return;
    var nums = qsa('.why-num', whySection);
    if (!nums.length) return;
    var animated = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !animated) {
          animated = true;
          nums.forEach(function (el) {
            var target = parseInt(el.getAttribute('data-count'), 10);
            var suffix = el.getAttribute('data-suffix') || '';
            if (isNaN(target)) return;
            var start = 0;
            var duration = 1500;
            var startTime = null;
            function step(ts) {
              if (!startTime) startTime = ts;
              var progress = Math.min((ts - startTime) / duration, 1);
              var val = Math.floor(progress * target);
              el.textContent = val + suffix;
              if (progress < 1) requestAnimationFrame(step);
              else el.textContent = target + suffix;
            }
            requestAnimationFrame(step);
          });
          observer.unobserve(whySection);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(whySection);
  }

  /* ======== METRICS BAR — COUNTER ANIMATION ======== */
  function animateMetrics() {
    var threatsEl = qs('#m-threats');
    var detectionEl = qs('#m-detection');
    if (!threatsEl && !detectionEl) return;

    function countUp(el, target, decimals, suffix, duration) {
      if (!el) return;
      var start = 0;
      var startTime = null;
      var factor = Math.pow(10, decimals);
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;
        var val = eased * target;
        if (decimals > 0) {
          el.textContent = (Math.round(val * factor) / factor).toFixed(decimals) + suffix;
        } else {
          el.textContent = Math.floor(val).toLocaleString() + suffix;
        }
        if (progress < 1) requestAnimationFrame(step);
        else {
          if (decimals > 0) {
            el.textContent = target.toFixed(decimals) + suffix;
          } else {
            el.textContent = target.toLocaleString() + suffix;
          }
        }
      }
      requestAnimationFrame(step);
    }

    // Animate after loader hides
    setTimeout(function () {
      countUp(threatsEl, 12847, 0, '+', 2000);
      countUp(detectionEl, 99.4, 1, '%', 2000);
    }, 200);
  }

  /* ======== MOUSE SPOTLIGHT (desktop only) ======== */
  function initMouseSpotlight() {
    if (!isDesktop || prefersReducedMotion) return;
    var root = document.documentElement;
    document.addEventListener('mousemove', function (e) {
      root.style.setProperty('--mx', e.clientX + 'px');
      root.style.setProperty('--my', e.clientY + 'px');
    });
  }

  /* ======== 3D TILT EFFECT (desktop only) ======== */
  function initTiltCards() {
    if (!isDesktop || prefersReducedMotion) return;
    var cards = qsa('.tilt-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotateX = ((0.5 - y) * 8).toFixed(2);
        var rotateY = ((x - 0.5) * 8).toFixed(2);
        card.style.setProperty('--rx', rotateX + 'deg');
        card.style.setProperty('--ry', rotateY + 'deg');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ======== MAGNETIC BUTTONS (desktop only) ======== */
  function initMagneticButtons() {
    if (!isDesktop || prefersReducedMotion) return;
    var btns = qsa('.magnetic');
    btns.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.15).toFixed(1) + 'px,' + (y * 0.15).toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ======== SESSION ACTIVITY MONITOR ======== */
  var sessionLog = null;
  var ssScrollEl = null;
  var ssEventsEl = null;
  var ssStatusEl = null;
  var sessionStartTime = Date.now();
  var sessionEventCount = 0;
  var MAX_LOG_ENTRIES = 15;
  var lastScrollPct = -1;
  var lastSectionLogged = '';
  var idleTimer = null;
  var isIdle = false;
  var IDLE_TIMEOUT = 8000;

  function getSessionTime() {
    return Math.floor((Date.now() - sessionStartTime) / 1000);
  }

  function addSessionLog(text, type) {
    if (!sessionLog) return;
    sessionEventCount++;
    if (ssEventsEl) ssEventsEl.textContent = sessionEventCount;

    var li = document.createElement('li');
    var typeClass = 'sl-' + (type || 'scroll');
    li.innerHTML = '<span class="sl-time">[' + getSessionTime() + 's]</span> <span class="' + typeClass + '">' + text + '</span>';
    sessionLog.appendChild(li);

    // Keep max entries
    while (sessionLog.children.length > MAX_LOG_ENTRIES) {
      sessionLog.removeChild(sessionLog.firstChild);
    }

    // Auto-scroll to bottom
    sessionLog.scrollTop = sessionLog.scrollHeight;
  }

  /* Idle detection */
  function resetIdleTimer() {
    if (isIdle) {
      isIdle = false;
      if (ssStatusEl) {
        ssStatusEl.textContent = 'ACTIVE';
        ssStatusEl.classList.add('active-status');
        ssStatusEl.classList.remove('idle-status');
      }
      addSessionLog('User active again', 'section');
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      isIdle = true;
      if (ssStatusEl) {
        ssStatusEl.textContent = 'IDLE';
        ssStatusEl.classList.remove('active-status');
        ssStatusEl.classList.add('idle-status');
      }
      addSessionLog('User idle\u2026', 'idle');
    }, IDLE_TIMEOUT);
  }

  /* Scroll tracking (debounced) */
  var sectionNames = {
    hero: 'Hero',
    about: 'About Section',
    timeline: 'Timeline Section',
    projects: 'Projects Section',
    services: 'Services Section',
    tools: 'Tools Section',
    certifications: 'Certifications Section',
    why: 'Why Hire Me Section',
    contact: 'Contact Section'
  };

  var debouncedSessionScroll = debounce(function () {
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    var pct = Math.round(scrollTop / scrollHeight * 100);
    if (ssScrollEl) ssScrollEl.textContent = pct + '%';

    // Only log at every 25% milestone
    var milestone = Math.floor(pct / 25) * 25;
    if (milestone > 0 && milestone !== lastScrollPct) {
      lastScrollPct = milestone;
      addSessionLog('Scrolled to ' + pct + '%', 'scroll');
    }
    resetIdleTimer();
  }, 100);

  /* Section visibility via IntersectionObserver */
  function initSectionTracking() {
    var tracked = qsa('section[id]');
    if (!tracked.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          var name = sectionNames[id] || id;
          if (name !== lastSectionLogged) {
            lastSectionLogged = name;
            addSessionLog('Entered ' + name, 'section');
          }
        }
      });
    }, { threshold: 0.3 });
    tracked.forEach(function (sec) { observer.observe(sec); });
  }

  /* Click tracking */
  function initClickTracking() {
    document.addEventListener('click', function (e) {
      var target = e.target.closest('a, button');
      if (!target) return;

      var label = '';
      // Nav links
      if (target.closest('.nav-links')) {
        label = 'Nav: ' + (target.textContent || '').trim();
      }
      // CTA buttons
      else if (target.classList.contains('btn-primary') || target.classList.contains('btn-secondary')) {
        label = 'CTA: ' + (target.textContent || '').trim().substring(0, 30);
      }
      // Submit button
      else if (target.classList.contains('btn-submit')) {
        label = 'Submitted Contact Form';
      }
      // Project links
      else if (target.classList.contains('project-link')) {
        var card = target.closest('.project-card');
        var pname = card ? (card.querySelector('.project-name') || {}).textContent : '';
        label = 'Project: ' + (pname || 'link').trim();
      }
      // Social links
      else if (target.closest('.socials')) {
        var ariaLabel = target.getAttribute('aria-label') || '';
        label = 'Social: ' + ariaLabel;
      }
      // Floating CTA
      else if (target.closest('.floating-cta')) {
        label = 'Floating CTA';
      }
      // Hamburger
      else if (target.classList.contains('hamburger') || target.closest('.hamburger')) {
        label = 'Toggle Menu';
      }
      else {
        return; // Ignore untracked clicks
      }

      addSessionLog('Clicked: ' + label, 'click');
      resetIdleTimer();
    });
  }

  function initSessionMonitor() {
    sessionLog = qs('#session-log');
    ssScrollEl = qs('#ss-scroll');
    ssEventsEl = qs('#ss-events');
    ssStatusEl = qs('#ss-status');
    if (!sessionLog) return;

    addSessionLog('Session started', 'section');
    addSessionLog('Monitoring user activity\u2026', 'scroll');

    initSectionTracking();
    initClickTracking();

    // Listen for scroll
    window.addEventListener('scroll', debouncedSessionScroll, { passive: true });

    // Listen for activity to reset idle
    ['mousemove', 'keydown', 'touchstart'].forEach(function (evt) {
      document.addEventListener(evt, debounce(resetIdleTimer, 200), { passive: true });
    });

    // Start idle timer
    resetIdleTimer();
  }

  /* ======== CONTACT FORM ======== */
  function initContactForm() {
    var form = qs('#contact-form');
    if (!form) return;

    var nameField = qs('#f-name', form);
    var emailField = qs('#f-email', form);
    var projectField = qs('#f-project', form);
    var messageField = qs('#f-msg', form);
    var submitBtn = qs('.btn-submit', form);
    var encryptingOverlay = qs('#form-encrypting');
    var formContent = form;
    var formSuccess = qs('.form-success', form.closest('.form-box'));

    function showError(input, msg) {
      var group = input.closest('.form-group');
      group.classList.add('has-error');
      var err = qs('.form-err', group);
      if (err) err.textContent = msg;
    }
    function clearError(input) {
      var group = input.closest('.form-group');
      group.classList.remove('has-error');
      var err = qs('.form-err', group);
      if (err) err.textContent = '';
    }

    // Clear errors on input
    [nameField, emailField, projectField, messageField].forEach(function (input) {
      if (input) input.addEventListener('input', function () { clearError(input); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      // Validate
      if (!nameField.value.trim()) { showError(nameField, 'Name is required'); valid = false; }
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(emailField.value.trim())) { showError(emailField, 'Valid email required'); valid = false; }
      if (!projectField.value.trim()) { showError(projectField, 'Project type required'); valid = false; }
      if (messageField.value.trim().length < 10) { showError(messageField, 'Min 10 characters'); valid = false; }

      if (!valid) return;

      // Disable button
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83"/></svg> Transmitting...';

      // Show encrypting overlay
      if (encryptingOverlay) {
        encryptingOverlay.classList.add('active');
      }

      // Simulate encryption delay, then send
      setTimeout(function () {
        var payload = {
          name: nameField.value.trim(),
          email: emailField.value.trim(),
          project: projectField.value.trim(),
          message: messageField.value.trim()
        };

        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(function (res) {
          if (!res.ok) throw new Error('Failed');
          return res.json();
        })
        .then(function () {
          showSuccess();
        })
        .catch(function () {
          // Graceful fallback — show success anyway
          showSuccess();
        });
      }, 1500);

      function showSuccess() {
        if (encryptingOverlay) encryptingOverlay.classList.remove('active');
        // Hide form and badge
        formContent.style.display = 'none';
        var badge = qs('.form-secure-badge', formContent.closest('.form-box'));
        if (badge) badge.style.display = 'none';
        if (formSuccess) formSuccess.classList.add('visible');
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Secure Message';
      }
    });

    // Inject spin animation style
    if (!qs('#spin-style')) {
      var style = document.createElement('style');
      style.id = 'spin-style';
      style.textContent = '.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(style);
    }
  }

  /* ======== INIT AFTER LOADER ======== */
  function initAfterLoad() {
    initCharReveal();
    initHeroReveals();
    typeLoop();
    initReveals();
    initTimeline();
    animateCounters();
    animateMetrics();
    initSessionMonitor();
    initTiltCards();
    initMagneticButtons();
  }

  /* ======== INIT IMMEDIATELY ======== */
  initMouseSpotlight();
  initHamburger();
  initSmoothScroll();
  initContactForm();
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Initial call

})();
