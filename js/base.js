// --- Ember background with logo "hearth" ---
(() => {
  const c = document.getElementById('bg');
  if (!c) return;

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const ctx = c.getContext('2d', { alpha: true });
  let W = 0, H = 0, t = 0;

  // logo attractor (hearth)
  const logoEl = document.getElementById('brandLogo');
  function logoCenter() {
    if (!logoEl) return { x: W/2, y: H/3 };
    const r = logoEl.getBoundingClientRect();
    const x = (r.left + r.right) / 2;
    const y = (r.top  + r.bottom) / 2 + window.scrollY; // account for scroll
    // map to canvas coordinates (dpr)
    return { x: x * dpr, y: y * dpr };
  }

  function resize(){
    W = c.width  = Math.max(1, Math.floor(innerWidth  * dpr));
    H = c.height = Math.max(1, Math.floor(innerHeight * dpr));
    c.style.width  = innerWidth  + 'px';
    c.style.height = innerHeight + 'px';
  }
  addEventListener('resize', resize, { passive:true });
  addEventListener('scroll', () => { /* keeps hearth mapping correct */ }, { passive:true });
  resize();

  // particles
  const P = [];
  const COUNT = 150;

  function spawnAround(cx, cy, n=30){
    for (let i=0; i<n; i++){
      const ang = Math.random()*Math.PI*2;
      const dist = (Math.random()*18 + 6) * dpr; // start close to logo
      P.push({
        x: cx + Math.cos(ang)*dist,
        y: cy + Math.sin(ang)*dist,
        r: (Math.random()*1.4 + 0.8) * dpr,
        s: Math.random()*0.6 + 0.25,
        a: Math.random()*Math.PI*2
      });
    }
  }

  // initial population: some global, some near logo
  for (let i=0; i<COUNT; i++){
    if (i < COUNT*0.5){
      const {x:cx,y:cy} = logoCenter();
      spawnAround(cx, cy, 1);
    } else {
      P.push({
        x: Math.random()*W,
        y: Math.random()*H,
        r: (Math.random()*2 + 0.6) * dpr,
        s: Math.random()*0.6 + 0.2,
        a: Math.random()*Math.PI*2
      });
    }
  }

  // launch burst on load (matches the logo stamp beat)
  window.addEventListener('load', () => {
    const hero = document.getElementById('hero');
    if (hero) hero.classList.add('stamp');
    const {x:cx,y:cy} = logoCenter();
    spawnAround(cx, cy, 40);
  });

  function draw(){
    t += 0.005;

    // soft trail for persistence (smoky feel)
    ctx.fillStyle = 'rgba(11,11,15,0.08)';
    ctx.fillRect(0, 0, W, H);

    const hearth = logoCenter();

    ctx.globalCompositeOperation = 'lighter';
    for (const p of P){
      // gentle drift
      p.x += Math.cos(p.a) * p.s;
      p.y += (Math.sin(p.a + t) + 0.8) * p.s; // slight upward bias
      p.a += (Math.random() - 0.5) * 0.05;

      // attractor towards logo center (subtle)
      const dx = hearth.x - p.x;
      const dy = hearth.y - p.y;
      const dist = Math.hypot(dx, dy) + 1e-3;
      const pull = Math.min(0.015, 60 / (dist*dist)); // stronger near logo, tiny far away
      p.x += dx * pull;
      p.y += dy * pull;

      // wrap around screen edges
      if (p.x < 0) p.x += W;
      if (p.x > W) p.x -= W;
      if (p.y < 0) p.y += H;
      if (p.y > H) p.y -= H;

      // flicker
      const flicker = 1 + (Math.random() - 0.5) * 0.2;
      const R = p.r * 6 * flicker;

      // ember gradient (orange/yellow)
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
      g.addColorStop(0.0, 'rgba(255,200,80,0.18)');
      g.addColorStop(0.55,'rgba(255,140,40,0.10)');
      g.addColorStop(1.0, 'rgba(255,140,40,0.00)');
      ctx.fillStyle = g;

      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(draw);
  }
  draw();
})();
