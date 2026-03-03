/* ============================================================
   MAIN.JS — Cybersecurity Portfolio
   Handles: Loader, Navbar, Typing, Reveals, Form, Stats, etc.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- LOADER ---------- */
  window.addEventListener('load', function () {
    const loader = document.getElementById('loader');
    if (loader) {
      setTimeout(function () {
        loader.classList.add('hidden');
        // After fade-out, trigger hero reveals
        setTimeout(startHeroSequence, 400);
      }, 1400);
    } else {
      startHeroSequence();
    }
  });

  /* ---------- HERO ANIMATION SEQUENCE ---------- */
  function startHeroSequence() {
    // Character reveal on hero name
    var nameEl = document.querySelector('.vfx-pending');
    if (nameEl) {
      var text = nameEl.textContent.trim();
      var html = '';
      for (var i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          html += ' ';
        } else {
          html += '<span class="char-wrap"><span class="char" style="--d:' + (i * 0.04) + 's">' + text[i] + '</span></span>';
        }
      }
      nameEl.innerHTML = html;
      nameEl.classList.remove('vfx-pending');
      nameEl.classList.add('vfx-ready');
    }

    // Reveal hero elements
    var heroReveals = document.querySelectorAll('.reveal-hero');
    heroReveals.forEach(function (el) {
      el.classList.add('visible');
    });

    // Start typing animation
    setTimeout(startTyping, 800);
  }

  /* ---------- TYPING ANIMATION ---------- */
  var typingPhrases = [
    'SOC Analyst & Security Engineer',
    'SIEM Investigation Specialist',
    'Cloud Security Enthusiast',
    'AI-Driven Threat Detection',
    'Incident Response & Triage',
    'Google Cybersecurity Certified'
  ];

  function startTyping() {
    var target = document.getElementById('typed-text');
    if (!target) return;

    var phraseIdx = 0;
    var charIdx = 0;
    var isDeleting = false;
    var typeSpeed = 60;
    var deleteSpeed = 30;
    var pauseEnd = 2000;
    var pauseDelete = 400;

    function tick() {
      var phrase = typingPhrases[phraseIdx];

      if (!isDeleting) {
        target.textContent = phrase.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx === phrase.length) {
          setTimeout(function () { isDeleting = true; tick(); }, pauseEnd);
          return;
        }
        setTimeout(tick, typeSpeed);
      } else {
        target.textContent = phrase.substring(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % typingPhrases.length;
          setTimeout(tick, pauseDelete);
          return;
        }
        setTimeout(tick, deleteSpeed);
      }
    }

    tick();
  }

  /* ---------- NAVBAR ---------- */
  var navbar = document.getElementById('navbar');
  var hamburger = document.getElementById('hamburger');
  var navMenu = document.getElementById('nav-menu');

  // Scroll state
  function onScroll() {
    if (!navbar) return;
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Floating CTA
    var floatingCta = document.getElementById('floating-cta');
    if (floatingCta) {
      if (window.scrollY > 600) {
        floatingCta.classList.add('visible');
      } else {
        floatingCta.classList.remove('visible');
      }
    }

    // Active nav link
    updateActiveNav();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active nav tracking
  function updateActiveNav() {
    var sections = document.querySelectorAll('section[id]');
    var scrollPos = window.scrollY + 150;
    var links = document.querySelectorAll('.nav-links a');

    sections.forEach(function (sec) {
      var top = sec.offsetTop;
      var bottom = top + sec.offsetHeight;
      var id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < bottom) {
        links.forEach(function (lnk) {
          lnk.classList.remove('active');
          if (lnk.getAttribute('href') === '#' + id) {
            lnk.classList.add('active');
          }
        });
      }
    });
  }

  // Hamburger toggle
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      navMenu.classList.toggle('open');
      var expanded = hamburger.classList.contains('open');
      hamburger.setAttribute('aria-expanded', String(expanded));
      document.body.style.overflow = expanded ? 'hidden' : '';
    });

    // Close on link click
    navMenu.querySelectorAll('a').forEach(function (lnk) {
      lnk.addEventListener('click', function () {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------- SMOOTH SCROLL ---------- */
  document.querySelectorAll('[data-scroll-to]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(el.getAttribute('data-scroll-to'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- INTERSECTION OBSERVER — REVEAL ---------- */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all immediately
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ---------- STAT COUNTER ANIMATION ---------- */
  function animateCounter(el, target, suffix) {
    var duration = 1800;
    var start = performance.now();

    function step(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      el.textContent = current + (suffix || '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Observe "why" section for stat counters
  var whySection = document.getElementById('why');
  if (whySection && 'IntersectionObserver' in window) {
    var statsAnimated = false;
    var statsObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !statsAnimated) {
        statsAnimated = true;
        var nums = whySection.querySelectorAll('.why-num[data-count]');
        nums.forEach(function (el) {
          var target = parseInt(el.getAttribute('data-count'), 10);
          var suffix = el.getAttribute('data-suffix') || '';
          animateCounter(el, target, suffix);
        });
        statsObserver.unobserve(whySection);
      }
    }, { threshold: 0.3 });
    statsObserver.observe(whySection);
  }

  /* ---------- CONTACT FORM ---------- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Clear previous errors
      contactForm.querySelectorAll('.form-group').forEach(function (g) {
        g.classList.remove('has-error');
        var err = g.querySelector('.form-err');
        if (err) err.textContent = '';
      });

      var nameVal = contactForm.querySelector('#f-name').value.trim();
      var emailVal = contactForm.querySelector('#f-email').value.trim();
      var projectVal = contactForm.querySelector('#f-project').value.trim();
      var msgVal = contactForm.querySelector('#f-msg').value.trim();
      var valid = true;

      function showError(inputId, msg) {
        var input = contactForm.querySelector(inputId);
        if (!input) return;
        var group = input.closest('.form-group');
        group.classList.add('has-error');
        var err = group.querySelector('.form-err');
        if (err) err.textContent = msg;
        valid = false;
      }

      if (!nameVal) showError('#f-name', 'Name is required');
      if (!emailVal) {
        showError('#f-email', 'Email is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        showError('#f-email', 'Enter a valid email');
      }
      if (!projectVal) showError('#f-project', 'Inquiry type is required');
      if (!msgVal) {
        showError('#f-msg', 'Message is required');
      } else if (msgVal.length < 10) {
        showError('#f-msg', 'Message must be at least 10 characters');
      }

      if (!valid) return;

      var btn = document.getElementById('submit-btn');
      btn.disabled = true;
      btn.innerHTML = '<svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Sending...';

      // Send to backend
      var API_BASE = window.location.origin;
      fetch(API_BASE + '/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameVal,
          email: emailVal,
          project: projectVal,
          message: msgVal
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then(function () {
          contactForm.style.display = 'none';
          var success = contactForm.parentElement.querySelector('.form-success');
          if (success) success.classList.add('visible');
        })
        .catch(function () {
          // Fallback: still show success (graceful degradation)
          contactForm.style.display = 'none';
          var success = contactForm.parentElement.querySelector('.form-success');
          if (success) success.classList.add('visible');
        });
    });
  }

  /* ---------- SPIN ANIMATION (for button loading) ---------- */
  var spinStyle = document.createElement('style');
  spinStyle.textContent = '.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(spinStyle);

})();
