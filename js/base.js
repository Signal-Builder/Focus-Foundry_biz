// Focus Foundry – Ember background + logo hearth + stamp burst
(() => {
  // ----- DOM & canvas -----
  const c = document.getElementById('bg');
  if (!c) { console.warn('No #bg canvas found'); return; }
  const ctx = c.getContext('2d', { alpha: true });

  // device pixel ratio (cap at 2 for perf)
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

  // Ensure canvas sits above page BG but behind content (CSS should also set this)
  c.style.position = 'fixed';
  c.style.inset = '0';
  c.style.zIndex = '0';
  c.style.pointerEvents = 'none';
  c.style.display = 'block';

  // ----- Hearth = logo center (where embers bias toward) -----
  const logoEl = document.getElementById('brandLogo');
  function hearth() {
    if (!logoEl) return { x: W / 2, y: H / 3 };
    const r = logoEl.getBoundingClientRect();
    const x = (r.left + r.right) / 2;
    const y = (r.top  + r.bottom) / 2 + window.scrollY;
    return { x: x * dpr, y: y * dpr };
  }
  addEventListener('scroll', () => {}, { passive: true }); // keep mapping accurate

  // ----- Particles -----
  const baseCount = innerWidth < 640 ? 110 : innerWidth < 1024 ? 150 : 190;
  const P = [];

  function spawn(cx, cy, n) {
    for (let i = 0; i < n; i++) {
      const ang  = Math.random() * Math.PI * 2;
      const dist = (Math.random() * 18 + 6) * dpr;   // start near hearth
      P.push({
        x: cx + Math.cos(ang) * dist,
        y: cy + Math.sin(ang) * dist,
        r: (Math.random() * 1.6 + 0.9) * dpr,
        s: Math.random() * 0.6 + 0.25,
        a: Math.random() * Math.PI * 2
      });
    }
  }

  // initial population (half near hearth, half anywhere)
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

  // ----- Stamp beat + ember burst -----
  window.addEventListener('load', () => {
    const hero = document.getElementById('hero');
    if (hero) hero.classList.add('stamp');
    const h = hearth();
    spawn(h.x, h.y, 40); // launch burst
  });

  // ----- Draw loop -----
  function draw() {
    t += 0.006;

    // Keep the photo visible: clear fully (no dark veil)
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);

    const h = hearth();

    for (const p of P) {
      // base motion + a little drift upward
      p.x += Math.cos(p.a) * p.s;
      p.y += (Math.sin(p.a + t) + 0.6) * p.s;
      p.a += (Math.random() - 0.5) * 0.05;

      // subtle attraction to hearth (stronger when closer)
      const dx = h.x - p.x, dy = h.y - p.y;
      const dist = Math.hypot(dx, dy) + 1e-3;
      const pull = Math.min(0.02, 80 / (dist * dist));
      p.x += dx * pull;
      p.y += dy * pull;

      // wrap around viewport
      if (p.x < 0) p.x += W; if (p.x > W) p.x -= W;
      if (p.y < 0) p.y += H; if (p.y > H) p.y -= H;

      // appearance
      const flick = 1 + (Math.random() - 0.5) * 0.25;
      const Rcore = p.r * 2.2 * flick;  // bright tight core
      const Rhalo = p.r * 9.0 * flick;  // wide soft halo

      // 1) Core (normal blend so it shows even over photos)
      ctx.globalCompositeOperation = 'source-over';
      let g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Rcore);
      g.addColorStop(0.0, 'rgba(255, 240, 170, 0.85)'); // hot center
      g.addColorStop(1.0, 'rgba(255, 160,  60, 0.00)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, Rcore, 0, Math.PI * 2); ctx.fill();

      // 2) Halo (additive glow for warmth)
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


