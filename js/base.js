/* ===== Full-screen embers ============================================ */
(() => {
  const canvas = document.getElementById('bg');
  if (!canvas) { console.warn('No #bg canvas found. Embers animation will not run.'); return; }
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) { console.warn('2D context not available. Embers animation will not run.'); return; }

  // ---- Tweakables (slightly brighter/bigger by default) ----
  const SETTINGS = {
    countBase: 200,
    densityFactor: 0.00020,
    sizeMin: 1.2,
    sizeMax: 3.4,            // was 3.0
    speedY: [-0.90, -0.35],
    speedX: [-0.25, 0.25],
    lifeMin: 3.8,
    lifeMax: 7.8,
    tailFade: 0.10,          // was 0.12 (longer trails, less fade-out look)
    glowBlur: 24,            // was 18
    flickerFreqMin: 1.2,
    flickerFreqMax: 2.2,
    flareChance: 0.015,
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
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Keep CSS size explicitly synced (improves Safari/Edge behavior)
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';

    const target = Math.round(SETTINGS.countBase + W * H * SETTINGS.densityFactor);
    if (particles.length > target) particles.length = target;
    while (particles.length < target) particles.push(spawnParticle());
  }

  function step(dt) {
    // Fade previous ember pixels only (does NOT dim the page behind)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgba(0,0,0,${SETTINGS.tailFade})`;
    ctx.fillRect(0, 0, W, H);

    // Draw glowing embers additively
    ctx.globalCompositeOperation = 'lighter';

    for (const p of particles) {
      p.life += dt;
      if (p.life > p.lifeMax || p.y < -16 || p.x < -16 || p.x > W + 16) {
        Object.assign(p, spawnParticle());
        p.y = H + Math.random() * 60; // respawn from bottom-ish
      }

      // motion
      p.x += p.vx;
      p.y += p.vy;

      // per-particle flicker + occasional flare
      const t = p.life * p.freq + p.seed;
      const base = 0.65 + 0.35 * Math.sin(t * 6.283 + Math.sin(t * 2.7) * 0.7);
      if (Math.random() < SETTINGS.flareChance * dt) p.flare = 0.5;
      if (p.flare > 0) p.flare -= dt;
      const flare = p.flare > 0 ? SETTINGS.flareBoost : 1.0;

      const rNow    = p.r * (0.9 + 0.35 * base) * flare;
      const blurNow = SETTINGS.glowBlur * (0.7 + 0.6 * base) * flare;

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
    const dt = Math.min(0.05, (ts - lastTs) / 1000); // clamp delta
    lastTs = ts;
    step(dt);
    requestAnimationFrame(loop);
  }

  // init
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // soft clear (avoid first-frame flash)
  ctx.clearRect(0, 0, W, H);

  // keep canvas pinned behind content
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
    running = !document.hidden;
    if (running) { lastTs = 0; requestAnimationFrame(loop); }
  }, { passive: true });

  requestAnimationFrame(loop);

  // quick console helpers
  window.embers = {
    start(){ if (!running){ running = true; lastTs = 0; requestAnimationFrame(loop); } },
    stop(){ running = false; }
  };
})();
