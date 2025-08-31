/* === Focus Foundry — single ember engine (full-screen, flicker/flare) === */
(() => {
  const cvs = document.getElementById('bg');
  if (!cvs) { console.warn('No #bg canvas'); return; }
  const ctx = cvs.getContext('2d', { alpha: true });

  // ---- Tweakables ----
  const SETTINGS = {
    countBase: 240,          // base ember count
    densityFactor: 0.00018,  // +embs per px^2 (bigger = more)
    sizeMin: 1.2,            // ember size range (px)
    sizeMax: 3.2,
    speedY: [-0.35, -0.9],   // upward drift (px/frame)
    speedX: [-0.25, 0.25],   // sideways drift
    lifeMin: 3.8,            // seconds
    lifeMax: 7.8,
    glowBlur: 18,            // halo blur
    tailFade: 0.10,          // 0–1: higher = longer trails
    // flicker/flare
    flickerFreqMin: 1.1,     // Hz
    flickerFreqMax: 2.2,
    flareChance: 0.012,      // ~1.2% per second
    flareBoost: 1.5
  };

  let DPR = 1, W = 0, H = 0, particles = [], last = 0;
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
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, window.innerWidth);
    H = Math.max(1, window.innerHeight);

    cvs.width = Math.floor(W * DPR);
    cvs.height = Math.floor(H * DPR);
    cvs.style.width = W + 'px';
    cvs.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const target = Math.round(SETTINGS.countBase + W * H * SETTINGS.densityFactor);
    if (particles.length > target) particles.length = target;
    while (particles.length < target) particles.push(spawnParticle());
  }

  function step(dt) {
    // motion blur for trails
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0,0,0,${SETTINGS.tailFade})`;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';

    for (let p of particles) {
      p.life += dt;
      if (p.life > p.lifeMax || p.y < -16 || p.x < -16 || p.x > W + 16) {
        Object.assign(p, spawnParticle());
        p.y = H + Math.random() * 48; // bias respawn from bottom
      }

      // drift
      p.x += p.vx;
      p.y += p.vy;

      // flicker + rare flare
      const t = p.life * p.freq + p.seed;
      const base = 0.65 + 0.35 * Math.sin(t * 6.283 + Math.sin(t * 2.7) * 0.7);
      if (Math.random() < SETTINGS.flareChance * dt) p.flare = 0.45;
      if (p.flare > 0) p.flare -= dt;
      const flare = p.flare > 0 ? SETTINGS.flareBoost : 1.0;

      // size + glow vary with flicker
      const rNow = p.r * (0.9 + 0.35 * base) * flare;
      const blurNow = SETTINGS.glowBlur * (0.7 + 0.6 * base) * flare;

      // hot core → orange → fade
      const hotAlpha = 0.92 * (0.8 + 0.2 * base);
      const midAlpha = 0.55 * (0.8 + 0.2 * base);

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rNow * 2.2);
      grad.addColorStop(0.00, `rgba(255,230,160,${hotAlpha})`);
      grad.addColorStop(0.35, `rgba(255,170,70,${midAlpha})`);
      grad.addColorStop(1.00, `rgba(120,20,0,0)`);

      ctx.save();
      ctx.shadowBlur = blurNow;
      ctx.shadowColor = `rgba(255,120,30,${0.55 * (0.8 + 0.2 * base)})`;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rNow * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function loop(ts) {
    if (!last) last = ts;
    const dt = Math.min(0.05, (ts - last) / 1000); // clamp for stability
    last = ts;
    step(dt);
    requestAnimationFrame(loop);
  }

  // init
  Object.assign(cvs.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10',
    pointerEvents: 'none',
    display: 'block',
    background: 'transparent'
  });

  resize();
  window.addEventListener('resize', resize, { passive: true });

  // soft clear (avoid first-frame flash)
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, W, H);

  requestAnimationFrame(loop);
})();

/* === Sticky nav (unchanged) === */
(() => {
  const nav = document.getElementById('site-nav') || document.querySelector('nav');
  if (!nav) return;
  const setStickyState = () => nav.classList.toggle('nav--scrolled', scrollY > 10);
  setStickyState();
  addEventListener('scroll', setStickyState, { passive: true });
})();

/* === Stamp trigger (unchanged) === */
(() => {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const activateStamp = () => hero.classList.add('play-stamp');

  window.addEventListener('load', () => setTimeout(activateStamp, 300));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { activateStamp(); observer.disconnect(); }
      });
    }, { threshold: 0.2 });
    observer.observe(hero);
  }
})();

