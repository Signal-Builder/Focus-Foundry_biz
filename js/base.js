(() => {
  const c = document.getElementById('bg');
  if (!c) return console.warn('No #bg canvas');

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const ctx = c.getContext('2d', { alpha:true });
  let W=0, H=0, t=0;
  
  window.addEventListener('load', () => {
  const hero = document.getElementById('hero');
  if (hero) hero.classList.add('stamp');
  const h = hearth?.() || {x:W/2,y:H/3};

  // burst embers at the stamp
  for (let i=0;i<40;i++){
    const ang = Math.random()*Math.PI*2;
    const dist = (Math.random()*18 + 6) * dpr;
    P.push({
      x: h.x + Math.cos(ang)*dist,
      y: h.y + Math.sin(ang)*dist,
      r: (Math.random()*1.4 + 0.8) * dpr,
      s: Math.random()*0.6 + 0.25,
      a: Math.random()*Math.PI*2
    });
  }
});
  function resize(){
    W = c.width  = Math.max(1, Math.floor(innerWidth*dpr));
    H = c.height = Math.max(1, Math.floor(innerHeight*dpr));
    c.style.width  = innerWidth + 'px';
    c.style.height = innerHeight + 'px';
  }
  addEventListener('resize', resize, {passive:true}); resize();

  const P = [];
  for (let i=0;i<120;i++){
    P.push({
      x: Math.random()*W, y: Math.random()*H,
      r: (Math.random()*2 + .6)*dpr,
      s: Math.random()*.6 + .2, a: Math.random()*Math.PI*2
    });
  }
const logoEl = document.getElementById('brandLogo');
function hearth(){
  if (!logoEl) return { x: W/2, y: H/3 };
  const r = logoEl.getBoundingClientRect();
  const x = (r.left + r.right)/2;
  const y = (r.top  + r.bottom)/2 + window.scrollY;
  return { x: x*dpr, y: y*dpr };
}
  function draw(){
    t += 0.005;
    ctx.fillStyle = 'rgba(11,11,15,0.08)';
    ctx.fillRect(0,0,W,H);

    ctx.globalCompositeOperation = 'lighter';
    for (const p of P){
      p.x += Math.cos(p.a)*p.s;
      p.y += Math.sin(p.a + t)*p.s*0.6 + .2; // drift up slightly
      p.a += (Math.random()-.5)*.05;

      if (p.x<0) p.x+=W; if (p.x>W) p.x-=W;
      if (p.y<0) p.y+=H; if (p.y>H) p.y-=H;

      const R = p.r*6;
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,R);
      g.addColorStop(0,'rgba(255,200,80,.16)'); // ember core (warm)
      g.addColorStop(.5,'rgba(255,140,40,.10)');
      g.addColorStop(1,'rgba(255,140,40,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x,p.y,R,0,Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }
  draw();})();


