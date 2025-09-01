/* ===== Full-screen embers (robust) =================================== */
(() => {
  const canvas = document.getElementById('bg');
  if (!canvas) { console.warn('No #bg canvas found.'); return; }
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) { console.warn('No 2D context.'); return; }

  // ---- Tweakables ----
  const SETTINGS = {
    countBase: 200,
    densityFactor: 0.00022,     // more embers on big screens
    sizeMin: 1.2,
    sizeMax: 3.6,
    speedY: [-0.90, -0.35],     // upward drift
    speedX: [-0.25, 0.25],      // lateral meander
    lifeMin: 3.8,
    lifeMax: 7.8,
    glowBlur: 24,
    flickerFreqMin: 1.2,
    flickerFreqMax: 2.2,
    flareChance: 0.015,
    flareBoost: 1.6,

    // Fade strategy
    USE_DEST_OUT_TRAILS: false, // set true to try destination-out trails again
    tailFade: 0.10,             // used by destination-out
    veilAlpha: 0.035            // used by source-over (super light)
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

    // keep CSS size in lockstep (important for Safari/Edge)
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';

    const target = Math.round(SETTINGS.countBase + W * H * SETTINGS.densityFactor);
    if (particles.length > target) particles.length = target;
    while (particles.length < target) particles.push(spawnParticle());
  }

  function step(dt) {
    // ---- Fade previous frame ----
    if (SETTINGS.USE_DEST_OUT_TRAILS) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0,0,0,${SETTINGS.tailFade})`;
      ctx.fillRect(0, 0, W, H);
    } else {
      // ultra-light veil; doesn’t make the page look “darker”
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = SETTINGS.veilAlpha;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    // ---- Draw embers additively ----
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

      // flicker + flare
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
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    step(dt);
    requestAnimationFrame(loop);
  }

  // init
  resize();
  addEventListener('resize', resize, { passive: true });
  ctx.clearRect(0, 0, W, H);

  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10',
    pointerEvents: 'none',
    display: 'block',
    background: 'transparent'
  });

  document.addEventListener('visibilitychange', () => {
    const wasRunning = running;
    running = !document.hidden;
    if (running && !wasRunning) { lastTs = 0; requestAnimationFrame(loop); }
  }, { passive: true });

  requestAnimationFrame(loop);

  // handy debug
  window.embers = {
    count: () => particles.length,
    boost(n=80){ for (let i=0;i<n;i++) particles.push(spawnParticle()); },
    fewer(n=80){ particles.length = Math.max(0, particles.length - n); }
  };
})();
