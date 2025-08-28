/* Focus Foundry – clean embers (no burst), stable hearth, gentle motion */
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

  // Hearth = center of .fire-title (stable anchor)
  function hearth(){
    const ft = document.querySelector('.fire-title');
    if (ft){
      const r = ft.getBoundingClientRect();
      const x = (r.left + r.right)/2;
      const y = (r.top + r.bottom)/2 + scrollY;
      return { x: x*dpr, y: y*dpr };
    }
    return { x: W/2, y: H/3 };
  }

  // Particles
  const baseCount = innerWidth < 640 ? 90 : innerWidth < 1024 ? 130 : 170;
  const P = [];

  function push(x,y){
    P.push({
      x, y,
      r: (Math.random()*1.4 + 0.8) * dpr,
      s: Math.random()*0.55 + 0.22,
      a: Math.random()*Math.PI*2
    });
  }

  // Seed particles: half near hearth, half anywhere
  for (let i=0;i<baseCount;i++){
    if (i < baseCount*0.5){
      const h = hearth();
      const ang = Math.random()*Math.PI*2;
      const dst = (Math.random()*18 + 6)*dpr;
      push(h.x + Math.cos(ang)*dst, h.y + Math.sin(ang)*dst);
    } else {
      push(Math.random()*W, Math.random()*H);
    }
  }

  function draw(){
    t += 0.006;

    // keep the canvas transparent each frame
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0,0,W,H);

    const h = hearth();

    for (const p of P){
      // random drift (no constant downward bias)
      p.x += Math.cos(p.a) * p.s;
      p.y += Math.sin(p.a + t) * p.s;
      p.a += (Math.random()-0.5) * 0.05;

      // gentle attraction to hearth
      const dx = h.x - p.x, dy = h.y - p.y;
      const dist = Math.hypot(dx, dy) + 1e-3;
      const pull = Math.min(0.008, 24/(dist*dist));
      p.x += dx * pull;
      p.y += dy * pull;

      // wrap around
      if (p.x < 0) p.x += W; if (p.x > W) p.x -= W;
      if (p.y < 0) p.y += H; if (p.y > H) p.y -= H;

      // appearance
      const flick = 1 + (Math.random()-0.5)*0.25;
      const Rcore = p.r * 2.0 * flick;
      const Rhalo = p.r * 8.0 * flick;

      // bright core (normal blend so it shows on photos)
      ctx.globalCompositeOperation = 'source-over';
      let g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,Rcore);
      g.addColorStop(0,'rgba(255,240,170,0.75)');
      g.addColorStop(1,'rgba(255,160, 60,0.00)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x,p.y,Rcore,0,Math.PI*2); ctx.fill();

      // warm halo (additive)
      ctx.globalCompositeOperation = 'lighter';
      g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,Rhalo);
      g.addColorStop(0,'rgba(255,200,80,0.16)');
      g.addColorStop(0.7,'rgba(255,140,40,0.08)');
      g.addColorStop(1,'rgba(255,140,40,0.00)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x,p.y,Rhalo,0,Math.PI*2); ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }
  draw();
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