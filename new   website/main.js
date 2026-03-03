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

  /* ======== CUSTOMIZATION ENGINE ======== */
  var siteConfig = null;

  function applyCustomization(cfg) {
    if (!cfg) return;
    siteConfig = cfg;
    var root = document.documentElement;

    /* ── Theme colors ── */
    var t = cfg.theme;
    if (t) {
      if (t.primaryColor)   root.style.setProperty('--accent', t.primaryColor);
      if (t.primaryColor)   root.style.setProperty('--accent-dim', t.primaryColor + '1f');
      if (t.primaryColor)   root.style.setProperty('--accent-mid', t.primaryColor + '40');
      if (t.secondaryColor) root.style.setProperty('--cyber-blue', t.secondaryColor);
      if (t.accentColor)    root.style.setProperty('--neon-green', t.accentColor);
      if (t.successColor)   root.style.setProperty('--success', t.successColor);
      if (t.dangerColor)    root.style.setProperty('--danger', t.dangerColor);
      if (t.warningColor)   root.style.setProperty('--warning', t.warningColor);
      if (t.bgColor)        root.style.setProperty('--bg-void', t.bgColor);
      if (t.textPrimary)    root.style.setProperty('--text-primary', t.textPrimary);
      if (t.textSecondary)  root.style.setProperty('--text-secondary', t.textSecondary);
      if (t.baseFontSize)   root.style.setProperty('font-size', t.baseFontSize + 'px');
      if (t.borderRadius != null) {
        root.style.setProperty('--r-sm', Math.round(t.borderRadius * 0.5) + 'px');
        root.style.setProperty('--r-md', t.borderRadius + 'px');
        root.style.setProperty('--r-lg', Math.round(t.borderRadius * 1.33) + 'px');
      }
      if (t.fontPrimary) root.style.setProperty('--font-primary', t.fontPrimary + ', system-ui, sans-serif');
      if (t.fontSecondary) root.style.setProperty('--font-heading', "'" + t.fontSecondary + "', sans-serif");
    }

    /* ── Hero content ── */
    var h = cfg.hero;
    if (h) {
      var heroTitle = qs('.vfx-pending, .vfx-ready, .hero-title');
      if (heroTitle && h.title) heroTitle.textContent = h.title;
      var heroSub = qs('.hero-subtitle');
      if (heroSub && h.subtitle) heroSub.textContent = h.subtitle;
      if (h.typingPhrases && h.typingPhrases.length) {
        typedPhrases = h.typingPhrases;
      }
      var ctaPrimary = qs('.hero-cta .btn-primary, .hero-actions .btn-primary');
      if (ctaPrimary) {
        if (h.ctaPrimaryText) {
          var pSvg = ctaPrimary.querySelector('svg');
          ctaPrimary.textContent = '';
          if (pSvg) ctaPrimary.appendChild(pSvg);
          ctaPrimary.appendChild(document.createTextNode(' ' + h.ctaPrimaryText));
        }
        if (h.ctaPrimaryLink) ctaPrimary.setAttribute('data-scroll-to', h.ctaPrimaryLink);
      }
      var ctaSecondary = qs('.hero-cta .btn-secondary, .hero-actions .btn-secondary');
      if (ctaSecondary) {
        if (h.ctaSecondaryText) {
          var sSvg = ctaSecondary.querySelector('svg');
          ctaSecondary.textContent = '';
          if (sSvg) ctaSecondary.appendChild(sSvg);
          ctaSecondary.appendChild(document.createTextNode(' ' + h.ctaSecondaryText));
        }
        if (h.ctaSecondaryLink) ctaSecondary.setAttribute('data-scroll-to', h.ctaSecondaryLink);
      }
      var statusBadge = qs('.status-badge');
      if (statusBadge) {
        if (h.showStatusBadge === false) statusBadge.style.display = 'none';
        if (h.statusText) {
          var statusSpan = statusBadge.querySelector('span') || statusBadge;
          statusSpan.textContent = h.statusText;
        }
      }
      var scanLine = qs('.scan-line');
      if (scanLine && h.showScanLine === false) scanLine.style.display = 'none';
    }

    /* ── Section visibility & order ── */
    var sec = cfg.sections;
    if (sec) {
      Object.keys(sec).forEach(function (key) {
        var sectionCfg = sec[key];
        var el = qs('#' + key) || qs('[data-section="' + key + '"]');
        if (!el) return;
        if (sectionCfg.visible === false) {
          el.style.display = 'none';
        } else {
          el.style.display = '';
        }
        if (sectionCfg.order) {
          el.style.order = sectionCfg.order;
        }
      });
    }

    /* ── Animation settings ── */
    var an = cfg.animations;
    if (an) {
      if (an.globalSpeed && an.globalSpeed !== 1) {
        root.style.setProperty('--anim-speed', (1 / an.globalSpeed) + 's');
      }
      if (an.glowEnabled === false) {
        root.style.setProperty('--glow-size', '0px');
        root.style.setProperty('--shadow-glow', 'none');
      } else if (an.glowIntensity != null) {
        root.style.setProperty('--glow-opacity', an.glowIntensity);
      }
      if (an.typingSpeed) typingSpeedMs = an.typingSpeed;
      if (an.particlesEnabled === false) {
        var pCanvas = qs('#particle-canvas');
        if (pCanvas) pCanvas.style.display = 'none';
      }
      if (an.smoothReveal === false) {
        root.style.setProperty('--reveal-offset', '0px');
        qsa('.reveal').forEach(function (el) {
          el.classList.add('visible');
        });
      }
    }

    /* ── Layout ── */
    var lay = cfg.layout;
    if (lay) {
      if (lay.glassmorphism === false) {
        root.style.setProperty('--bg-glass', 'rgba(17,24,39,0.95)');
      } else if (lay.glassBgOpacity != null) {
        root.style.setProperty('--bg-glass', 'rgba(17,24,39,' + lay.glassBgOpacity + ')');
      }
      if (lay.maxWidth) root.style.setProperty('--max-w', lay.maxWidth + 'px');
      if (lay.sectionSpacing) root.style.setProperty('--section-spacing', lay.sectionSpacing + 'px');
      if (lay.showProgressBar === false) {
        var prog = qs('#scroll-progress');
        if (prog) prog.style.display = 'none';
      }
      if (lay.showBackToTop === false) {
        var btt = qs('#floating-cta');
        if (btt) btt.style.display = 'none';
      }
    }

    /* ── SEO meta ── */
    var seo = cfg.seo;
    if (seo) {
      if (seo.metaTitle) document.title = seo.metaTitle;
      setMeta('description', seo.metaDescription);
      setMeta('keywords', seo.keywords);
      setMetaOG('og:title', seo.ogTitle);
      setMetaOG('og:description', seo.ogDescription);
      setMetaOG('og:image', seo.ogImage);
      setMetaOG('twitter:card', seo.twitterCard);
      setMetaOG('twitter:site', seo.twitterHandle);
      if (seo.canonicalUrl) {
        var canon = qs('link[rel="canonical"]');
        if (canon) canon.href = seo.canonicalUrl;
        else {
          canon = document.createElement('link');
          canon.rel = 'canonical';
          canon.href = seo.canonicalUrl;
          document.head.appendChild(canon);
        }
      }
    }

    /* ── UX settings ── */
    var ux = cfg.ux;
    if (ux) {
      if (ux.progressBarColor) root.style.setProperty('--progress-color', ux.progressBarColor);
      if (ux.focusRingColor) root.style.setProperty('--focus-ring', ux.focusRingColor);
    }

    /* ── Custom CSS injection ── */
    var cc = cfg.customCode;
    if (cc && cc.customCSS) {
      var existing = qs('#custom-css-inject');
      if (existing) existing.remove();
      var styleTag = document.createElement('style');
      styleTag.id = 'custom-css-inject';
      styleTag.textContent = cc.customCSS;
      document.head.appendChild(styleTag);
    }
  }

  function setMeta(name, content) {
    if (!content) return;
    var el = qs('meta[name="' + name + '"]');
    if (el) el.setAttribute('content', content);
    else {
      el = document.createElement('meta');
      el.name = name;
      el.content = content;
      document.head.appendChild(el);
    }
  }

  function setMetaOG(property, content) {
    if (!content) return;
    var el = qs('meta[property="' + property + '"]') || qs('meta[name="' + property + '"]');
    if (el) el.setAttribute('content', content);
    else {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      el.content = content;
      document.head.appendChild(el);
    }
  }

  /* Fetch customization on load */
  var typingSpeedMs = 70;
  (function loadCustomization() {
    fetch('/api/customize')
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (cfg) { if (cfg) applyCustomization(cfg); })
      .catch(function () { /* graceful fallback — use defaults */ });
  })();

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
      setTimeout(typeLoop, typingSpeedMs);
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
      setTimeout(typeLoop, Math.round(typingSpeedMs / 2));
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
    if (siteConfig && siteConfig.animations && siteConfig.animations.tiltEnabled === false) return;
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
    if (siteConfig && siteConfig.animations && siteConfig.animations.magneticButtons === false) return;
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
          subject: projectField.value.trim(),
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
        .catch(function (err) {
          if (encryptingOverlay) encryptingOverlay.classList.remove('active');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Secure Message';
          var errEl = qs('.form-error-banner');
          if (!errEl) {
            errEl = document.createElement('div');
            errEl.className = 'form-error-banner';
            form.prepend(errEl);
          }
          errEl.textContent = 'Message failed to send. Please try again or email directly.';
          errEl.style.display = 'block';
          setTimeout(function () { errEl.style.display = 'none'; }, 6000);
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
    initTiltCards();
    initMagneticButtons();
  }

  /* ======== INIT IMMEDIATELY ======== */
  initMouseSpotlight();
  initHamburger();
  initSmoothScroll();
  initContactForm();
  initFrontendShield();
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Initial call

  /* ======== FRONTEND SHIELD — CLIENT-SIDE PROTECTION ======== */
  function initFrontendShield() {
    // Skip protection for bots / crawlers (preserve SEO)
    var ua = navigator.userAgent || '';
    if (/bot|crawl|spider|slurp|facebookexternalhit|Mediapartners|Googlebot/i.test(ua)) return;

    // 1. Disable right-click context menu (except on inputs/textareas for usability)
    document.addEventListener('contextmenu', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      e.preventDefault();
    }, false);

    // 2. Block DevTools keyboard shortcuts silently
    document.addEventListener('keydown', function (e) {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); return; }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && /^[IJCijc]$/.test(e.key)) { e.preventDefault(); return; }
      // Ctrl+U (view source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U') && !e.shiftKey) { e.preventDefault(); return; }
      // Ctrl+S (save page)
      if (e.ctrlKey && (e.key === 's' || e.key === 'S') && !e.shiftKey) { e.preventDefault(); return; }
      // Cmd equivalents for macOS
      if (e.metaKey && e.altKey && /^[IJCijc]$/.test(e.key)) { e.preventDefault(); return; }
      if (e.metaKey && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); return; }
    }, true);

    // 3. DevTools detection via window outer/inner size difference
    var devToolsOpen = false;
    var shieldOverlay = null;
    var CHECK_INTERVAL = 1500;

    function createShieldOverlay() {
      if (shieldOverlay) return shieldOverlay;
      shieldOverlay = document.createElement('div');
      shieldOverlay.id = 'shield-overlay';
      shieldOverlay.setAttribute('aria-hidden', 'true');
      shieldOverlay.innerHTML =
        '<div style="text-align:center;max-width:440px;padding:0 20px">' +
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:16px"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
        '<h2 style="font-size:1.4rem;font-weight:700;color:#fff;margin:0 0 8px">Inspection Disabled</h2>' +
        '<p style="font-size:0.9rem;color:#8892B0;line-height:1.6;margin:0">Developer tools are not available on this site.<br>Close DevTools to continue browsing.</p>' +
        '</div>';
      var s = shieldOverlay.style;
      s.position = 'fixed'; s.inset = '0'; s.zIndex = '999999';
      s.background = 'rgba(11,15,25,0.97)';
      s.display = 'none'; s.alignItems = 'center'; s.justifyContent = 'center';
      s.fontFamily = 'Inter,system-ui,sans-serif';
      document.body.appendChild(shieldOverlay);
      return shieldOverlay;
    }

    function checkDevTools() {
      var widthDiff = window.outerWidth - window.innerWidth > 160;
      var heightDiff = window.outerHeight - window.innerHeight > 160;
      var isOpen = widthDiff || heightDiff;

      if (isOpen && !devToolsOpen) {
        devToolsOpen = true;
        var overlay = createShieldOverlay();
        overlay.style.display = 'flex';
      } else if (!isOpen && devToolsOpen) {
        devToolsOpen = false;
        if (shieldOverlay) shieldOverlay.style.display = 'none';
      }
    }

    // Only run detection on desktop (mobile has variable chrome heights)
    var isDesktop = window.innerWidth > 768 && !/Mobi|Android|iPhone|iPad/i.test(ua);
    if (isDesktop) {
      setInterval(checkDevTools, CHECK_INTERVAL);
    }
  }

})();
