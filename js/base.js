// Focus Foundry – Ember background with logo hearth + stamp burst
(() => {
  const c = document.getElementById('bg');
  if (!c) { console.warn('No #bg canvas found'); return; }
  const ctx = c.getContext('2d', { alpha: true });

  // DPR sizing
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0, t = 0;

  function resize() {
    W = c.width  = Math.max(1, Math.floor(innerWidth  * dpr));
    H = c.height = Math.max(1, Math.floor(innerHeight * dpr));
    c.style.width  = innerWidth  + 'px';
    c.style.height = innerHeight + 'px';
  }
  addEventListener('resize', resize, { passive: true });
  resize();

  // Ensure layering
  Object.assign(c.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '0',           // canvas behind content (CSS puts content z-index higher)
    pointerEvents: 'none',
    display: 'block'
  });

  // Hearth = logo center (falls back to screen upper third)
  function hearth() {
    const logoEl = document.getElementById('brandLogo');
    if (!logoEl) return { x: (W / 2), y: (H / 3) };
    const r = logoEl.getBoundingClientRect();
    const x = (r.left + r.right) / 2;
    const y = (r.top  + r.bottom) / 2 + window.scrollY;
    return { x: x * dpr, y: y * dpr };
  }

  // Particles
  const baseCount = innerWidth < 640 ? 110 : innerWidth < 1024 ? 150 : 190;
  const P = [];

  function spawn(cx, cy, n) {
    for (let i = 0; i < n; i++) {
      const ang  = Math.random() * Math.PI * 2;
      const dist = (Math.random() * 18 + 6) * dpr;
      P.push({
        x: cx + Math.cos(ang) * dist,
        y: cy + Math.sin(ang) * dist,
        r: (Math.random() * 1.6 + 0.9) * dpr,
        s: Math.random() * 0.6 + 0.25,
        a: Math.random() * Math.PI * 2
      });
    }
  }

  // Initial population
  for (let i = 0; i < baseCount; i++) {
    if (i < baseCount * 0.5) {
      const h = hearth(); spawn(h.x, h.y, 1);
    } else {
      P.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: (Math.random() * 1.6 + 0.9) * dpr,
        s: Math.random() * 0.6 + 0.25,
        a: Math.random() * Math.PI * 2
      });
    }
  }

  // Initial stamp burst near hearth after load
  window.addEventListener('load', () => {
    const hero = document.getElementById('hero');
    if (hero) hero.classList.add('stamp');
    const h = hearth();
    spawn(h.x, h.y, 40);
  });

  // Draw loop
  function draw() {
    t += 0.006;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H); // keep canvas transparent between frames

    const h = hearth();

    for (const p of P) {
      // motion
      p.x += Math.cos(p.a) * p.s;
      p.y += (Math.sin(p.a + t) + 0.6) * p.s;
      p.a += (Math.random() - 0.5) * 0.05;

      // attraction towards hearth
      const dx = h.x - p.x, dy = h.y - p.y;
      const dist = Math.hypot(dx, dy) + 1e-3;
      const pull = Math.min(0.02, 80 / (dist * dist));
      p.x += dx * pull;
      p.y += dy * pull;

      // wrap
      if (p.x < 0) p.x += W; if (p.x > W) p.x -= W;
      if (p.y < 0) p.y += H; if (p.y > H) p.y -= H;

      // draw
      const flick = 1 + (Math.random() - 0.5) * 0.25;
      const Rcore = p.r * 2.2 * flick;
      const Rhalo = p.r * 9.0 * flick;

      // bright core (normal blend)
      ctx.globalCompositeOperation = 'source-over';
      let g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Rcore);
      g.addColorStop(0.0, 'rgba(255, 240, 170, 0.85)');
      g.addColorStop(1.0, 'rgba(255, 160,  60, 0.00)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, Rcore, 0, Math.PI * 2); ctx.fill();

      // warm halo (additive)
      ctx.globalCompositeOperation = 'lighter';
      g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Rhalo);
      g.addColorStop(0.0, 'rgba(255, 200, 80, 0.20)');
      g.addColorStop(0.70,'rgba(255, 140, 40, 0.10)');
      g.addColorStop(1.0, 'rgba(255, 140, 40, 0.00)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, Rhalo, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }
  draw();

  console.log('Embers started ✓', { dpr, particles: P.length });
})();

// Nav scroll state
(() => {
  const nav = document.getElementById('site-nav') || document.querySelector('nav');
  if (!nav) return;
  const set = () => nav.classList.toggle('nav--scrolled', window.scrollY > 10);
  set();
  addEventListener('scroll', set, { passive: true });
})();

const play = () => hero.classList.add('play-stamp');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { play(); io.disconnect(); } });
    }, { threshold: 0.6 });
    io.observe(hero);
  } else {
    window.addEventListener('load', () => setTimeout(play, 300));
  }

  // Hearth = center of the fire title (stable)
  function hearth() {
    const ft = document.querySelector('.fire-title');
    if (ft) {
      const r = ft.getBoundingClientRect();
      const x = (r.left + r.right) / 2;
      const y = (r.top + r.bottom) / 2 + window.scrollY;
      return { x: x * dpr, y: y * dpr };
    }
    return { x: W / 2, y: H / 3 };
  }
