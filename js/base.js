/* Focus Foundry – Embers from all sides (no logo attraction), slightly larger */
(() => {
  const c = document.getElementById('bg');
  if (!c) { console.warn('No #bg canvas found'); return; }
  const ctx = c.getContext('2d', { alpha: true });

  // DPR + sizing
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0, t = 0;

  function resize(){
    W = c.width  = Math.max(1, Math.floor(innerWidth  * dpr));
    H = c.height = Math.max(1, Math.floor(innerHeight * dpr));
    c.style.width  = innerWidth  + 'px';
    c.style.height = innerHeight + 'px';
  }
  addEventListener('resize', resize, { passive:true });
  resize();

  // Layer: behind content, above body bg
  Object.assign(c.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10',
    pointerEvents: 'none',
    display: 'block',
    background: 'transparent'
  });

  // Particle model
  const baseCount = innerWidth < 640 ? 90 : innerWidth < 1024 ? 130 : 170;
  const P = [];
  const EDGE_MARGIN = 4 * dpr;     // spawn just outside the view
  const CENTER = () => ({ x: W * 0.5, y: H * 0.5 });

  function spawnFromEdge() {
    // pick an edge: 0=top,1=right,2=bottom,3=left
    const edge = Math.floor(Math.random() * 4);
    let x, y;

    if (edge === 0) {               // top
      x = Math.random() * W;
      y = -EDGE_MARGIN;
    } else if (edge === 1) {        // right
      x = W + EDGE_MARGIN;
      y = Math.random() * H;
    } else if (edge === 2) {        // bottom
      x = Math.random() * W;
      y = H + EDGE_MARGIN;
    } else {                        // left
      x = -EDGE_MARGIN;
      y = Math.random() * H;
    }

    // direction primarily toward the center, with some spread
    const c = CENTER();
    const dx = c.x - x, dy = c.y - y;
    const len = Math.hypot(dx, dy) || 1;
    const dirx = dx / len, diry = dy / len;

    // base speed (inward) and slight random angle (spread)
    const speed = (0.35 + Math.random() * 0.55) * dpr; // 0.35..0.9
    const spread = (Math.random() - 0.5) * 0.6;        // +/- ~0.3 rad
    const cs = Math.cos(spread), sn = Math.sin(spread);

    const vx = (dirx * cs - diry * sn) * speed;
    const vy = (dirx * sn + diry * cs) * speed;

    // slightly bigger sparks than before
    const r = (Math.random() * 2.0 + 1.2) * dpr;       // ↑ size ~15–25%

    P.push({
      x, y,
      vx, vy,
      r,
      a: Math.random() * Math.PI * 2,                  // angle for noise
      wob: Math.random() * 2 * Math.PI                 // phase offset
    });
  }

  // Seed particles (half from edges right now, half from all edges quickly)
  for (let i = 0; i < baseCount; i++) spawnFromEdge();

  function update(p, dt) {
    // gentle curl noise around the velocity vector
    const curlStrength = 0.08 * dpr;                   // subtle
    const nx = -p.vy;                                  // perpendicular to velocity
    const ny =  p.vx;
    const nlen = Math.hypot(nx, ny) || 1;
    const nux = nx / nlen, nuy = ny / nlen;

    p.a += (Math.random() - 0.5) * 0.05;               // random jitter to vary sin phase
    const wobble = Math.sin(t * 1.3 + p.wob + p.a) * curlStrength;

    // advance
    p.x += p.vx + nux * wobble;
    p.y += p.vy + nuy * wobble;

    // if particle reaches near the center or exits far outside, respawn from an edge
    const c = CENTER();
    const distToCenter = Math.hypot(p.x - c.x, p.y - c.y);
    const nearCenter = distToCenter < Math.min(W, H) * 0.12;  // reached the hearth zone
    const offscreen = (p.x < -EDGE_MARGIN*2 || p.x > W + EDGE_MARGIN*2 ||
                       p.y < -EDGE_MARGIN*2 || p.y > H + EDGE_MARGIN*2);

    if (nearCenter || offscreen) {
      // recycle this particle
      const idx = P.indexOf(p);
      if (idx !== -1) {
        P.splice(idx, 1);
        spawnFromEdge();
      }
    }
  }

  function drawParticle(p) {
    // flicker & radii
    const flick = 1 + (Math.random() - 0.5) * 0.25;
    const Rcore = p.r * 2.5 * flick;   // was ~2.2
    const Rhalo = p.r * 10.5 * flick;  // was ~9.0

    // bright core (normal blend)
    ctx.globalCompositeOperation = 'source-over';
    let g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Rcore);
    g.addColorStop(0.0, 'rgba(255, 240, 170, 0.80)');
    g.addColorStop(1.0, 'rgba(255, 160,  60, 0.00)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, Rcore, 0, Math.PI * 2); ctx.fill();

    // warm halo (additive)
    ctx.globalCompositeOperation = 'lighter';
    g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Rhalo);
    g.addColorStop(0.0, 'rgba(255, 200, 80, 0.18)');
    g.addColorStop(0.70,'rgba(255, 140, 40, 0.09)');
    g.addColorStop(1.0, 'rgba(255, 140, 40, 0.00)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, Rhalo, 0, Math.PI * 2); ctx.fill();
  }

  function frame(){
    t += 0.006;

    // keep the canvas transparent each frame
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);

    // update & draw
    // (loop over a copy so we can splice/recycle safely)
    const copy = P.slice();
    for (const p of copy) {
      update(p, t);
      drawParticle(p);
    }

    requestAnimationFrame(frame);
  }
  frame();
})();

/* Sticky nav: adds a tighter style when scrolled */
(() => {
  const nav = document.getElementById('site-nav') || document.querySelector('nav');
  if (!nav) return;
  const set = () => nav.classList.toggle('nav--scrolled', scrollY > 10);
  set();
  addEventListener('scroll', set, { passive:true });
})();

/* Stamp trigger: reliable—fires on load and when hero is visible */
(() => {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const activate = () => hero.classList.add('play-stamp');

  // Guaranteed after load
  window.addEventListener('load', () => setTimeout(activate, 300));

  // Also when visible (covers SPA/back/anchors)
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { activate(); io.disconnect(); } });
    }, { threshold: 0.2 });
    io.observe(hero);
  }
})();
