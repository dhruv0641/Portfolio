/**
 * PARTICLE SYSTEM — Cinematic Star Field
 * Features: Twinkle, parallax, performance-adaptive density
 */
(function () {
  'use strict';

  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Detect low-end device
  const isLowEnd = navigator.hardwareConcurrency < 4;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const PARTICLE_COUNT = isLowEnd ? 60 : (isMobile ? 80 : 160);
  const ENABLE_PARALLAX = !isMobile && !isLowEnd;

  let W = 0, H = 0;
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  let particles = [];
  let raf;

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;
  }

  function createParticle() {
    const colorRand = Math.random();
    let color;
    if (colorRand < 0.50) {
      // Cyan stars (dominant — matches --accent #00F5FF)
      color = `rgb(${Math.floor(Math.random() * 40)},${Math.floor(200 + Math.random() * 55)},${Math.floor(220 + Math.random() * 35)})`;
    } else if (colorRand < 0.75) {
      // White/silver stars
      const g = Math.floor(180 + Math.random() * 75);
      color = `rgb(${g},${g},${g + Math.floor(Math.random() * 15)})`;
    } else if (colorRand < 0.90) {
      // Blue tinted (matches --cyber-blue #0066FF)
      color = `rgb(${Math.floor(Math.random() * 50)},${Math.floor(80 + Math.random() * 60)},255)`;
    } else {
      // Green tinted (matches --neon-green #10B981)
      color = `rgb(${Math.floor(Math.random() * 40)},${Math.floor(160 + Math.random() * 60)},${Math.floor(100 + Math.random() * 60)})`;
    }

    return {
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 1.6 + 0.4,
      baseOpacity: Math.random() * 0.5 + 0.15,
      opacity: 0,
      color,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
      speedX: (Math.random() - 0.5) * 0.08,
      speedY: (Math.random() - 0.5) * 0.05 - 0.02,
      parallaxFactor: Math.random() * 0.025 + 0.005,
    };
  }

  function init() {
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
    // Start with 0 opacity, fade in
    particles.forEach(p => { p.opacity = 0; });
  }

  let fadeInTime = 0;
  const FADE_IN_DURATION = 1200; // ms

  function draw(timestamp) {
    ctx.clearRect(0, 0, W, H);

    // Smooth mouse interpolation
    if (ENABLE_PARALLAX) {
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;
    }

    // Fade in particles
    const fadeProgress = Math.min(fadeInTime / FADE_IN_DURATION, 1);
    if (fadeInTime < FADE_IN_DURATION) {
      fadeInTime += 16; // ~60fps
    }

    particles.forEach(p => {
      // Move
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Twinkle
      const twinkle = Math.sin(timestamp * p.twinkleSpeed + p.twinkleOffset);
      const targetOpacity = p.baseOpacity + twinkle * (p.baseOpacity * 0.5);
      p.opacity += (targetOpacity - p.opacity) * 0.05;

      // Apply fade in
      const finalOpacity = p.opacity * fadeProgress;

      // Parallax offset
      const px = ENABLE_PARALLAX
        ? p.x + (mouseX - W / 2) * p.parallaxFactor
        : p.x;
      const py = ENABLE_PARALLAX
        ? p.y + (mouseY - H / 2) * p.parallaxFactor
        : p.y;

      // Draw star
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, finalOpacity));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Glow for brighter stars
      if (p.size > 1.2 && finalOpacity > 0.4) {
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4);
        gradient.addColorStop(0, p.color.replace('rgb', 'rgba').replace(')', `,${finalOpacity * 0.3})`));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    raf = requestAnimationFrame(draw);
  }

  function onMouseMove(e) {
    if (!ENABLE_PARALLAX) return;
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  }

  function onResize() {
    resize();
    // Reposition out-of-bounds particles
    particles.forEach(p => {
      if (p.x > W) p.x = Math.random() * W;
      if (p.y > H) p.y = Math.random() * H;
    });
  }

  // Init
  resize();
  init();
  raf = requestAnimationFrame(draw);
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('mousemove', onMouseMove, { passive: true });
})();
