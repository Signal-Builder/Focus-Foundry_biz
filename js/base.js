/* Focus Foundry – clean embers (no burst), stable hearth, gentle motion */
(() => {
  const canvas = document.getElementById('bg');
  if (!canvas) {
    console.warn('No #bg canvas found');
    return;
  }
  const ctx = canvas.getContext('2d', { alpha: true });

  // --- Constants and State ---
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const ATTRACTION_PULL_FACTOR = 0.008;
  const ATTRACTION_PULL_CAP = 24;
  const DRAGON_FLY_FACTOR = 0.006;
  const PARTICLE_SPEED_MIN = 0.22;
  const PARTICLE_SPEED_MAX = 0.55;
  const PARTICLE_SIZE_MIN = 0.8;
  const PARTICLE_SIZE_MAX = 1.4;
  const HEARTH_RADIUS_MIN = 6;
  const HEARTH_RADIUS_MAX = 18;

  let width = 0,
    height = 0,
    time = 0;

  // --- Utility Functions ---
  const resize = () => {
    width = canvas.width = Math.max(1, Math.floor(innerWidth * DPR));
    height = canvas.height = Math.max(1, Math.floor(innerHeight * DPR));
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  };

  const getHearthPosition = () => {
    // The hearth now follows the brand-stamp logo
    const brandStamp = document.querySelector('.brand-stamp');
    if (brandStamp) {
      const rect = brandStamp.getBoundingClientRect();
      const x = (rect.left + rect.right) / 2;
      const y = (rect.top + rect.bottom) / 2 + scrollY;
      return { x: x * DPR, y: y * DPR };
    }
    // Fallback to center of canvas if logo not found
    return { x: width / 2, y: height / 2 };
  };

  // --- Particle Logic ---
  const getParticleCount = () => {
    if (innerWidth < 640) return 90;
    if (innerWidth < 1024) return 130;
    return 170;
  };

  const particles = [];
  const createParticle = (x, y) => ({
    x,
    y,
    r: (Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN) * DPR,
    s: Math.random() * (PARTICLE_SPEED_MAX - PARTICLE_SPEED_MIN) + PARTICLE_SPEED_MIN,
    a: Math.random() * Math.PI * 2,
  });

  const seedParticles = () => {
    particles.length = 0; // Clear existing particles
    const particleCount = getParticleCount();

    for (let i = 0; i < particleCount; i++) {
      // All particles will now be seeded randomly across the screen
      particles.push(createParticle(Math.random() * width, Math.random() * height));
    }
  };

  // --- Animation Loop ---
  const draw = () => {
    time += DRAGON_FLY_FACTOR;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);
    const hearth = getHearthPosition();

    for (const p of particles) {
      // Gentle drift and motion
      p.x += Math.cos(p.a) * p.s;
      p.y += Math.sin(p.a + time) * p.s;
      p.a += (Math.random() - 0.5) * 0.05;

      // Attraction to hearth
      const dx = hearth.x - p.x;
      const dy = hearth.y - p.y;
      const distSq = dx * dx + dy * dy + 1e-3;
      const pull = Math.min(ATTRACTION_PULL_FACTOR, ATTRACTION_PULL_CAP / distSq);
      p.x += dx * pull;
      p.y += dy * pull;

      // Wrap around screen
      if (p.x < 0) p.x += width;
      if (p.x > width) p.x -= width;
      if (p.y < 0) p.y += height;
      if (p.y > height) p.y -= height;

      // Draw particle
      const flicker = 1 + (Math.random() - 0.5) * 0.25;
      const coreRadius = p.r * 2.0 * flicker;
      const haloRadius = p.r * 8.0 * flicker;

      // Bright core
      ctx.globalCompositeOperation = 'source-over';
      let gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, coreRadius);
      gradient.addColorStop(0, 'rgba(255,240,170,0.75)');
      gradient.addColorStop(1, 'rgba(255,160,60,0.00)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Warm halo (additive blend)
      ctx.globalCompositeOperation = 'lighter';
      gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloRadius);
      gradient.addColorStop(0, 'rgba(255,200,80,0.16)');
      gradient.addColorStop(0.7, 'rgba(255,140,40,0.08)');
      gradient.addColorStop(1, 'rgba(255,140,40,0.00)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, haloRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  };

  // --- Setup ---
  addEventListener('resize', () => {
    resize();
    seedParticles();
  }, { passive: true });
  resize();
  seedParticles();
  draw();

  // Initial style application
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10',
    pointerEvents: 'none',
    display: 'block',
    background: 'transparent',
  });
})();

/* Sticky nav: adds a tighter style when scrolled */
(() => {
  const nav = document.getElementById('site-nav') || document.querySelector('nav');
  if (!nav) return;
  const setStickyState = () => nav.classList.toggle('nav--scrolled', scrollY > 10);
  setStickyState();
  addEventListener('scroll', setStickyState, { passive: true });
})();

/* Stamp trigger: reliable—fires on load and when hero is visible */
(() => {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const activateStamp = () => hero.classList.add('play-stamp');

  // Guaranteed to fire after page load
  window.addEventListener('load', () => setTimeout(activateStamp, 300));

  // Also fires when element becomes visible
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            activateStamp();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(hero);
  }
})();
/* ===== Full-screen ember layer (independent of logo) ===== */
(() => {
  const cvs = document.getElementById('bg');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');

  // ---- Tweakables ----
  const SETTINGS = {
    countBase: 220,                 // base number of embers
    densityFactor: 0.00016,         // adds embers as screen area grows
    sizeMin: 1.2,                   // ember radius (px)
    sizeMax: 2.8,
    speedY: [-0.35, -0.9],          // upward drift (px/frame)
    speedX: [-0.25, 0.25],          // horizontal jitter (px/frame)
    lifeMin: 3.5,                   // seconds
    lifeMax: 7.5,
    glowBlur: 18,                   // canvas shadow glow
    glowColor: 'rgba(255,120,30,0.55)',
    coreColor: 'rgba(255,170,70,0.96)',
    tailFade: 0.15,                 // 0..1 (lower = longer trails)
  };

  let DPR = 1, W = 0, H = 0, particles = [], last = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function choice(a,b){ return Math.random() < .5 ? a : b; }

  function resize() {
    DPR = window.devicePixelRatio || 1;
    W = Math.max(1, window.innerWidth);
    H = Math.max(1, window.innerHeight);

    cvs.width = Math.floor(W * DPR);
    cvs.height = Math.floor(H * DPR);
    cvs.style.width = W + 'px';
    cvs.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // target count grows with area
    const target = Math.round(
      SETTINGS.countBase + W * H * SETTINGS.densityFactor
    );

    // adjust pool size
    if (particles.length > target) particles.length = target;
    while (particles.length < target) particles.push(spawnParticle());
  }

  function spawnParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: rand(SETTINGS.sizeMin, SETTINGS.sizeMax),
      vx: rand(SETTINGS.speedX[0], SETTINGS.speedX[1]),
      vy: rand(SETTINGS.speedY[0], SETTINGS.speedY[1]),
      life: 0,
      lifeMax: rand(SETTINGS.lifeMin, SETTINGS.lifeMax)
    };
  }

  function step(dt) {
    // subtle motion blur for trails
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0,0,0,${SETTINGS.tailFade})`;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';

    for (let p of particles) {
      p.life += dt;
      if (p.life > p.lifeMax || p.y < -10 || p.x < -10 || p.x > W + 10) {
        // respawn anywhere on screen, slight bias from lower half
        p.x = Math.random() * W;
        p.y = choice(rand(H * 0.45, H), rand(0, H));  // mostly lower half
        p.r = rand(SETTINGS.sizeMin, SETTINGS.sizeMax);
        p.vx = rand(SETTINGS.speedX[0], SETTINGS.speedX[1]);
        p.vy = rand(SETTINGS.speedY[0], SETTINGS.speedY[1]);
        p.life = 0;
        p.lifeMax = rand(SETTINGS.lifeMin, SETTINGS.lifeMax);
      }

      // physics
      p.x += p.vx;
      p.y += p.vy;

      // draw ember
      ctx.save();
      ctx.shadowBlur = SETTINGS.glowBlur;
      ctx.shadowColor = SETTINGS.glowColor;
      ctx.fillStyle = SETTINGS.coreColor;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function loop(ts) {
    if (!last) last = ts;
    const dt = Math.min(0.05, (ts - last) / 1000); // clamp delta
    last = ts;
    step(dt);
    requestAnimationFrame(loop);
  }

  // init
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // start with a soft clear so first frame isn’t black-flash
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, W, H);
  requestAnimationFrame(loop);
})();
