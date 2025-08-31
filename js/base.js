/* ================= Focus Foundry – unified JS ===========================
   - Full-screen embers (gentle trails, flicker, occasional flares)
   - Independent of logo position (no hearth/attraction)
   - Sticky nav tightening on scroll
   - Hero stamp trigger
   ===================================================================== */

/* ===== Full-screen embers ============================================ */
(() => {
  const canvas = document.getElementById('bg');
  if (!canvas) { console.warn('No #bg canvas found'); return; }
  const ctx = canvas.getContext('2d');

  // ---- Tweakables ----
  const SETTINGS = {
    countBase: 240,             // base particle count
    densityFactor: 0.00018,     // added with screen area; raise for more embers
    sizeMin: 1.2,               // ember size bounds
    sizeMax: 3.0,
    speedY: [-0.90, -0.35],     // upward drift (negative = up)
    speedX: [-0.25, 0.25],      // lateral drift
    lifeMin: 3.8,               // seconds
    lifeMax: 7.8,
    tailFade: 0.12,             // 0.08–0.16 = longer trails
    glowBlur: 18,               // base shadowBlur
    // flicker tuning
    flickerFreqMin: 1.2,        // Hz
    flickerFreqMax: 2.2,
    flareChance: 0.015,         // ~1.5% per second
    flareBoost: 1.6
  };

  const DPR_MAX = 2;
  let DPR = 1, W = 0, H = 0, lastTs = 0, running = true;
  const particles = [];

  const rand = (a, b) => a + Math.random() * (b - a);

  function spawnParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: rand(SETTINGS.sizeMin, SETTINGS.sizeMax),
      vx: rand(SETTINGS.speedX[0], SETTINGS.speedX[1]),
      vy: rand(SETTINGS.speedY[0], SETTINGS.speedY[1]),
      life: 0,
      lifeMax: rand(SETTINGS.lifeMin, SETTINGS.lifeMax),
      seed: Math.random() * 1000,
      freq: rand(SETTINGS.flickerFreqMin, SETTINGS.flickerFreqMax),
      flare: 0
    };
  }

  function resize() {
    DPR = Math.min(DPR_MAX, window.devicePixelRatio || 1);
    W = Math.max(1, window.innerWidth);
    H = Math.max(1, window.innerHeight);

    canvas.width  = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const target = Math.round(SETTINGS.countBase + W * H * SETTINGS.densityFactor);
    if (particles.length > target) particles.length = target;
    while (particles.length < target) particles.push(spawnParticle());
  }

  function step(dt) {
    // subtle motion blur for trails
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0,0,0,${SETTINGS.tailFade})`;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';

    for (let p of particles) {
      p.life += dt;
      if (p.life > p.lifeMax || p.y < -16 || p.x < -16 || p.x > W + 16) {
        Object.assign(p, spawnParticle());
        p.y = H + Math.random() * 60; // respawn from bottom-ish
      }

      // physics
      p.x += p.vx;
      p.y += p.vy;

      // per-particle flicker
      const t = p.life * p.freq + p.seed;
      const base = 0.65 + 0.35 * Math.sin(t * 6.283 + Math.sin(t * 2.7) * 0.7);

      // occasional brief flare
      if (Math.random() < SETTINGS.flareChance * dt) p.flare = 0.5; // seconds
      if (p.flare > 0) p.flare -= dt;
      const flare = p.flare > 0 ? SETTINGS.flareBoost : 1.0;

      // radius + glow flicker
      const rNow    = p.r * (0.9 + 0.35 * base) * flare;
      const blurNow = SETTINGS.glowBlur * (0.7 + 0.6 * base) * flare;

      // warm color ramp (center = hot)
      const hotAlpha = 0.92 * (0.8 + 0.2 * base);
      const midAlpha = 0.55 * (0.8 + 0.2 * base);

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rNow * 2.2);
      grad.addColorStop(0.00, `rgba(255,230,160,${hotAlpha})`);
      grad.addColorStop(0.35, `rgba(255,170,70,${midAlpha})`);
      grad.addColorStop(1.00, `rgba(120,20,0,0)`);

      ctx.save();
      ctx.shadowBlur  = blurNow;
      ctx.shadowColor = `rgba(255,120,30,${0.55 * (0.8 + 0.2 * base)})`;
      ctx.fillStyle   = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rNow * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function loop(ts) {
    if (!running) return;
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    step(dt);
    requestAnimationFrame(loop);
  }

  // init
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // soft clear (avoid first-frame black flash)
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, W, H);

  // style canvas
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10',
    pointerEvents: 'none',
    display: 'block',
    background: 'transparent'
  });

  // pause/resume on tab visibility
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else {
      running = true;
      lastTs = 0;
      requestAnimationFrame(loop);
    }
  }, { passive: true });

  requestAnimationFrame(loop);
})();

/* ===== Sticky nav: tighten when scrolled =============================== */
(() => {
  const nav = document.getElementById('site-nav') || document.querySelector('nav');
  if (!nav) return;
  const setSticky = () => nav.classList.toggle('nav--scrolled', window.scrollY > 10);
  setSticky();
  window.addEventListener('scroll', setSticky, { passive: true });
})();

/* ===== Stamp trigger: add .play-stamp once hero is visible/loaded ====== */
(() => {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const activate = () => hero.classList.add('play-stamp');

  // after load (guarantee)
  window.addEventListener('load', () => setTimeout(activate, 300), { passive: true });

  // when visible first time
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        activate();
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(hero);
  }
})();
