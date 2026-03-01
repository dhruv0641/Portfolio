/**
 * MAIN.JS — Dhruv Dobariya Cybersecurity Portfolio
 * Handles: Loader, Nav, Scroll Reveal, Form, VFX Name Animation
 */
(function () {
    'use strict';

    /* ============================================
       LOADER SEQUENCE
    ============================================ */
    function initLoader() {
        const loader = document.getElementById('loader');
        if (!loader) return;

        // CSS handles the line-wipe animation (starts at 0.4s, duration 1.1s → done at 1.5s)
        // Sub text fades in at 1.65s — hide loader at 2.3s then fire arrow
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => initArrowThenName(), 500);
        }, 2300);
    }


    /* ============================================
       ARROW VFX → NAME REVEAL
       1. Neon arrow shoots left→right (CSS anim)
       2. Impact burst at center
       3. Name + subtitle fade in
    ============================================ */
    function initArrowThenName() {
        const arrowEl = document.getElementById('arrow-vfx');
        const nameEl = document.getElementById('hero-heading');
        const titleEl = document.querySelector('.hero-title');

        // Show arrow and start its CSS animations
        if (arrowEl) {
            arrowEl.classList.add('active');
        }

        // After arrow + impact burst completes (~1100ms) → reveal name
        setTimeout(() => {
            if (arrowEl) {
                arrowEl.style.opacity = '0';
                arrowEl.style.transition = 'opacity 0.3s ease';
                setTimeout(() => { arrowEl.style.display = 'none'; }, 350);
            }
            if (nameEl) nameEl.classList.add('vfx-ready');
            if (titleEl) titleEl.classList.add('vfx-ready');
        }, 1100);
    }

    /* ============================================
       HERO NAME — CINEMATIC VFX SCRAMBLE
       Letters scramble through random chaos chars
       then lock one-by-one with neon glow burst
    ============================================ */
    function initNameVFX() {
        const nameEl = document.getElementById('hero-heading');
        if (!nameEl) return;

        // Chaos character pool
        const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>/\\|[]{}^~';
        const rnd = () => CHARS[Math.floor(Math.random() * CHARS.length)];

        // Split name preserving <br> — collect word lines
        // Original: "MEET<br>KOTHIYA"  →  two lines
        const lines = nameEl.innerHTML.split(/<br\s*\/?>/i);

        // Build spans for each letter, wrapped in line divs
        nameEl.innerHTML = '';
        const allSpans = [];

        lines.forEach((lineText, li) => {
            const lineDiv = document.createElement('div');
            lineDiv.style.display = 'block';
            const chars = lineText.trim().split('');
            chars.forEach(ch => {
                if (ch === ' ') {
                    const sp = document.createElement('span');
                    sp.textContent = '\u00a0'; // non-breaking space
                    sp.classList.add('vfx-letter', 'vfx-space');
                    lineDiv.appendChild(sp);
                    allSpans.push({ el: sp, char: '\u00a0', isSpace: true });
                } else {
                    const sp = document.createElement('span');
                    sp.classList.add('vfx-letter');
                    sp.textContent = rnd(); // start as chaos
                    sp.setAttribute('data-char', ch);
                    lineDiv.appendChild(sp);
                    allSpans.push({ el: sp, char: ch, isSpace: false });
                }
            });
            nameEl.appendChild(lineDiv);
            // Add <br> effect between lines
            if (li < lines.length - 1) {
                // already block divs, no extra needed
            }
        });

        // Phase 1: Rapid scramble all letters for 600ms
        let scrambleRaf;
        const startTime = performance.now();
        const SCRAMBLE_DURATION = 600;

        function scrambleAll(now) {
            const elapsed = now - startTime;
            allSpans.forEach(({ el, isSpace }) => {
                if (!isSpace && !el.classList.contains('vfx-locked')) {
                    el.textContent = rnd();
                }
            });
            if (elapsed < SCRAMBLE_DURATION) {
                scrambleRaf = requestAnimationFrame(scrambleAll);
            } else {
                cancelAnimationFrame(scrambleRaf);
                lockLetters();
            }
        }
        scrambleRaf = requestAnimationFrame(scrambleAll);

        // Phase 2: Lock letters one-by-one left to right
        function lockLetters() {
            const nonSpaces = allSpans.filter(s => !s.isSpace);
            const LOCK_INTERVAL = 85; // ms per letter

            // Continue scrambling unlocked letters
            let miniScramble;
            function scrambleUnlocked(now) {
                nonSpaces.forEach(({ el }) => {
                    if (!el.classList.contains('vfx-locked')) {
                        el.textContent = rnd();
                    }
                });
                miniScramble = requestAnimationFrame(scrambleUnlocked);
            }
            miniScramble = requestAnimationFrame(scrambleUnlocked);

            nonSpaces.forEach(({ el, char }, i) => {
                setTimeout(() => {
                    el.textContent = char;
                    el.classList.add('vfx-locked');
                    el.classList.add('vfx-flash');
                    setTimeout(() => el.classList.remove('vfx-flash'), 400);

                    // Last letter: cancel scramble + do final glitch pulse
                    if (i === nonSpaces.length - 1) {
                        cancelAnimationFrame(miniScramble);
                        setTimeout(() => {
                            nameEl.classList.add('vfx-glitch');
                            setTimeout(() => {
                                nameEl.classList.remove('vfx-glitch');
                                nameEl.classList.add('vfx-complete');
                            }, 500);
                        }, 120);
                    }
                }, i * LOCK_INTERVAL);
            });
        }
    }

    /* ============================================
       NAVIGATION
    ============================================ */
    function initNav() {
        const navbar = document.getElementById('navbar');
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const links = document.querySelectorAll('.nav-links a[href^="#"]');

        // Scroll state
        function onScroll() {
            if (!navbar) return;
            if (window.scrollY > 60) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            updateActiveLink();
        }

        // Active link tracking
        function updateActiveLink() {
            const sections = document.querySelectorAll('section[id]');
            let current = '';
            sections.forEach(sec => {
                if (window.scrollY >= sec.offsetTop - 140) {
                    current = sec.getAttribute('id');
                }
            });
            links.forEach(a => {
                a.classList.toggle('active', a.getAttribute('href') === '#' + current);
            });
        }

        // Hamburger toggle
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('open');
                navLinks.classList.toggle('open');
                document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
            });
        }

        // Close mobile menu on link click
        links.forEach(a => {
            a.addEventListener('click', e => {
                e.preventDefault();
                const target = document.querySelector(a.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                hamburger && hamburger.classList.remove('open');
                navLinks && navLinks.classList.remove('open');
                document.body.style.overflow = '';
            });
        });

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ============================================
       SCROLL REVEAL (IntersectionObserver)
    ============================================ */
    function initScrollReveal() {
        const els = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window)) {
            els.forEach(el => el.classList.add('visible'));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        els.forEach(el => observer.observe(el));
    }

    /* ============================================
       CONTACT FORM
    ============================================ */
    function initForm() {
        const form = document.getElementById('contact-form');
        const successEl = document.querySelector('.form-success');
        if (!form) return;

        function validateField(group, input, condition, msg) {
            const errEl = group.querySelector('.form-err');
            if (!condition) {
                group.classList.add('error');
                if (errEl) errEl.textContent = msg;
                return false;
            }
            group.classList.remove('error');
            return true;
        }

        function clearError(group) {
            group.classList.remove('error');
        }

        // Real-time clearing
        form.querySelectorAll('input, textarea').forEach(inp => {
            inp.addEventListener('input', () => clearError(inp.closest('.form-group')));
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = form.querySelector('#f-name');
            const emailInput = form.querySelector('#f-email');
            const projectInput = form.querySelector('#f-project');
            const msgInput = form.querySelector('#f-msg');

            const nameGroup = nameInput?.closest('.form-group');
            const emailGroup = emailInput?.closest('.form-group');
            const projectGroup = projectInput?.closest('.form-group');
            const msgGroup = msgInput?.closest('.form-group');

            let valid = true;
            if (nameGroup) valid &= validateField(nameGroup, nameInput, nameInput.value.trim().length >= 2, 'Please enter your name');
            if (emailGroup) valid &= validateField(emailGroup, emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value), 'Enter a valid email address');
            if (projectGroup) valid &= validateField(projectGroup, projectInput, projectInput.value.trim().length >= 2, 'Please describe your project');
            if (msgGroup) valid &= validateField(msgGroup, msgInput, msgInput.value.trim().length >= 10, 'Message must be at least 10 characters');

            if (!valid) return;

            const btn = form.querySelector('.btn-submit');
            if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

            // Simulate send (replace with actual endpoint)
            await new Promise(r => setTimeout(r, 1200));

            if (btn) { btn.disabled = false; btn.textContent = "Send Message →"; }
            if (successEl) successEl.classList.add('show');
        });
    }

    /* ============================================
       ANIMATED COUNTERS
    ============================================ */
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                const suffix = el.dataset.suffix || '';
                const duration = 1800;
                const start = performance.now();
                function update(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(eased * target) + suffix;
                    if (progress < 1) requestAnimationFrame(update);
                }
                requestAnimationFrame(update);
                observer.unobserve(el);
            });
        }, { threshold: 0.5 });

        counters.forEach(c => observer.observe(c));
    }

    /* ============================================
       SMOOTH CTA BUTTONS (non-link)
    ============================================ */
    function initCTAButtons() {
        document.querySelectorAll('[data-scroll-to]').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = document.querySelector(btn.dataset.scrollTo);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    /* ============================================
       INIT
    ============================================ */
    document.addEventListener('DOMContentLoaded', () => {
        initLoader();
        initNav();
        initScrollReveal();
        initForm();
        initCounters();
        initCTAButtons();
    });
})();
