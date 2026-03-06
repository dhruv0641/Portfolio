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

    /* ── Custom code block removed — raw CSS/HTML injection is an XSS vector.
       Theme styling is applied exclusively through structured CSS variables above. ── */
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
    var _savedY = 0;

    function openMenu() {
      _savedY = window.scrollY || window.pageYOffset || 0;
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      menu.classList.add('open');
      document.body.classList.add('menu-open');
      document.body.style.top = '-' + _savedY + 'px';
    }
    function closeMenu() {
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      document.body.classList.remove('menu-open');
      document.body.style.top = '';
      window.scrollTo(0, _savedY);
    }

    btn.addEventListener('click', function () {
      if (menu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close on link click
    qsa('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        closeMenu();
      }
    });

    // Close on tap outside — clicking the overlay background itself
    menu.addEventListener('click', function (e) {
      if (e.target === menu) {
        closeMenu();
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

  /* ======== DYNAMIC DATA LOADING ======== */
  function escapeHTML(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function renderProjectCard(p, index) {
    var delayClass = 'reveal-delay-' + ((index % 4) + 1);
    var tags = (p.technologies || []).map(function (t) {
      return '<span class="project-tag">' + escapeHTML(t) + '</span>';
    }).join('');
    var link = p.githubLink && p.githubLink !== '#'
      ? '<a href="' + escapeHTML(p.githubLink) + '" class="project-link" target="_blank" rel="noopener noreferrer">'
        + 'View on GitHub'
        + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
        + '</a>'
      : '';
    var impactHTML = p.impact
      ? '<div class="project-impact-bar">'
        + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'
        + '<span>' + escapeHTML(p.impact) + '</span></div>'
      : '';
    var featuredBadge = p.featured
      ? '<span class="risk-badge risk-critical">FEATURED</span>'
      : '';

    return '<article class="project-card tilt-card reveal ' + delayClass + '" aria-label="' + escapeHTML(p.title) + '">'
      + '<div class="scan-line" aria-hidden="true"></div>'
      + '<div class="project-header">'
      + '<div class="project-img-bg" aria-hidden="true"><span style="font-size:2.5rem">' + escapeHTML(p.emoji || '🔒') + '</span></div>'
      + featuredBadge
      + '</div>'
      + '<div class="project-info">'
      + '<p class="project-num">' + escapeHTML(String(index + 1).padStart(2, '0')) + '</p>'
      + '<h3 class="project-name">' + escapeHTML(p.title) + '</h3>'
      + '<p class="project-desc">' + escapeHTML(p.description) + '</p>'
      + impactHTML
      + '<div class="project-tags">' + tags + '</div>'
      + link
      + '</div></article>';
  }

  function renderServiceCard(s, index) {
    var delayClass = 'reveal-delay-' + ((index % 3) + 1);
    return '<div class="service-card tilt-card reveal ' + delayClass + '">'
      + '<div class="service-icon" aria-hidden="true"><span style="font-size:1.5rem">' + escapeHTML(s.icon || '🔒') + '</span></div>'
      + '<h3 class="service-name">' + escapeHTML(s.title) + '</h3>'
      + '<p class="service-desc">' + escapeHTML(s.description) + '</p>'
      + '</div>';
  }

  function loadProjects() {
    var container = qs('#projects-container');
    if (!container) return;
    fetch('/api/projects', { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (projects) {
        if (!projects || !projects.length) {
          container.innerHTML = '<p class="section-subtitle" style="text-align:center;grid-column:1/-1">Projects coming soon.</p>';
          return;
        }
        container.innerHTML = projects.map(renderProjectCard).join('');
        initReveals();
        initTiltCards();
      })
      .catch(function () { /* keep container empty on error */ });
  }

  function loadServices() {
    var container = qs('#services-container');
    if (!container) return;
    fetch('/api/services', { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (services) {
        if (!services || !services.length) {
          container.innerHTML = '<p class="section-subtitle" style="text-align:center;grid-column:1/-1">Services coming soon.</p>';
          return;
        }
        container.innerHTML = services.map(renderServiceCard).join('');
        initReveals();
        initTiltCards();
      })
      .catch(function () { /* keep container empty on error */ });
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
    loadProjects();
    loadServices();
  }

  /* ======== INIT IMMEDIATELY ======== */
  initMouseSpotlight();
  initHamburger();
  initSmoothScroll();
  initContactForm();
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Initial call

})();
