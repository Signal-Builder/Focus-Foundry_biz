// Ember background with logo "hearth" + stamp trigger
(() => {
  const c = document.getElementById('bg');
  if (!c) { console.warn('No #bg canvas found'); return; }

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const ctx = c.getContext('2d', { alpha:true });
  let W=0, H=0, t=0;

  function resize(){
    W = c.width  = Math.max(1, Math.floor(innerWidth  * dpr));
    H = c.height = Math.max(1, Math.floor(innerHeight * dpr));
    c.style.width  = innerWidth  + 'px';
    c.style.height = innerHeight + 'px';
  }
  addEventListener('resize', resize, { passive:true });
  resize();

  const logoEl = document.getElementById('brandLogo');
  function hearth(){
    if (!logoEl) return { x: W/2, y: H/3 };
    const r = logoEl.getBoundingClientRect();
    const x = (r.left + r.right)/2;
    const y = (r.top  + r.bottom)/2 + window.scrollY;
    return { x: x*dpr, y: y*dpr };
  }

  // particles
  const P = [];
  const COUNT = 150;

  function spawn(cx, cy, n){
    for (let i=0;i<n;i++){
      const ang = Math.random()*Math.PI*2;
      const dist = (Math.random()*18 + 6) * dpr;
      P.push({
        x: cx + Math.cos(ang)*dist,
        y: cy + Math.sin(ang)*dist,
        r: (Math.random()*1.4 + 0.8) * dpr,
        s: Math.random()*0.6 + 0.25,
        a: Math.random()*Math.PI*2
      });
    }
  }

  // init: half near logo, half anywhere
  for (let i=0;i<COUNT;i++){
    if (i < COUNT*0.5){
      const h = hearth(); spawn(h.x, h.y, 1);
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

  // stamp beat + ember burst on load
  window.addEventListener('load', () => {
    const hero = document.getElementById('hero');
    if (hero) hero.classList.add('stamp');
    const h = hearth();
    spawn(h.x, h.y, 40);
  });

  function draw(){
  t += 0.005;

  // ultra-light veil to create a bit of contrast but not hide the photo
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(0,0,0,0.03)';   // keep very low
  ctx.fillRect(0, 0, W, H);

  const h = hearth();

  for (const p of P){
    // motion
    p.x += Math.cos(p.a) * p.s;
    p.y += (Math.sin(p.a + t) + 0.8) * p.s;
    p.a += (Math.random() - 0.5) * 0.05;

    // attraction
    const dx = h.x - p.x, dy = h.y - p.y;
    const dist = Math.hypot(dx, dy) + 1e-3;
    const pull = Math.min(0.015, 60 / (dist * dist));
    p.x += dx * pull;
    p.y += dy * pull;

    // wrap
    if (p.x < 0) p.x += W; if (p.x > W) p.x -= W;
    if (p.y < 0) p.y += H; if (p.y > H) p.y -= H;

    // flicker/size
    const flick = 1 + (Math.random() - 0.5) * 0.25;
    const Rcore = p.r * 2 * flick;   // tight bright core
    const Rhalo = p.r * 8 * flick;   // wide soft halo

    // 1) Bright core (draw on top of photo, not additive)
    ctx.globalCompositeOperation = 'source-over';
    let g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Rcore);
    g.addColorStop(0.0, 'rgba(255,220,120,0.55)'); // hot center
    g.addColorStop(1.0, 'rgba(255,160,60,0.00)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, Rcore, 0, Math.PI * 2); ctx.fill();

    // 2) Soft halo (additive glow for warmth)
    ctx.globalCompositeOperation = 'lighter';
    g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Rhalo);
    g.addColorStop(0.0, 'rgba(255,200,80,0.16)');
    g.addColorStop(0.6, 'rgba(255,140,40,0.08)');
    g.addColorStop(1.0, 'rgba(255,140,40,0.00)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, Rhalo, 0, Math.PI * 2); ctx.fill();
  }

  // return to normal for next frame
  ctx.globalCompositeOperation = 'source-over';
  requestAnimationFrame(draw);
}
  requestAnimationFrame(draw);

  console.log('Embers started ✓');
})();
