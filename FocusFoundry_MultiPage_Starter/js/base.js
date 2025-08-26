// --- Cinematic background (particles/smoke hybrid) ---
(() => {
  const c = document.getElementById('bg');
  if (!c) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const ctx = c.getContext('2d');
  let W = 0, H = 0, t = 0;
  const P = []; // particles

  function resize(){
    W = c.width  = innerWidth * dpr;
    H = c.height = innerHeight * dpr;
    c.style.width = innerWidth + 'px';
    c.style.height = innerHeight + 'px';
  }
  addEventListener('resize', resize, { passive:true }); resize();

  // create particles
  for (let i=0; i<140; i++){
    P.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: (Math.random()*2+0.6)*dpr,
      s: Math.random()*0.6 + 0.2, // speed
      a: Math.random()*Math.PI*2
    });
  }

  function draw(){
    t += 0.005;
    // subtle smoky layer
    ctx.fillStyle = 'rgba(11,11,15,0.08)';
    ctx.fillRect(0,0,W,H);

    // additive particles
    ctx.globalCompositeOperation = 'lighter';
    for (const p of P){
      p.x += Math.cos(p.a)*p.s; 
      p.y += Math.sin(p.a + t)*p.s*0.6;
      p.a += (Math.random()-0.5)*0.05;

      if (p.x<0) p.x+=W; if (p.x>W) p.x-=W;
      if (p.y<0) p.y+=H; if (p.y>H) p.y-=H;

      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*6);
      g.addColorStop(0, 'rgba(102,224,255,0.12)');
      g.addColorStop(1, 'rgba(102,224,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*6,0,Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }
  draw();
})();

// --- Optional: reveal on scroll for sections with .reveal ---
(() => {
  const els = [...document.querySelectorAll('.reveal')];
  if (!els.length) return;
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e => e.isIntersecting && e.target.classList.add('in'));
  }, { threshold: 0.2 });
  els.forEach(el => io.observe(el));
})();

// Helper (used by various effects)
window.ff = window.ff || {};
window.ff.glitchFlash = () => {
  const b=document.body, prev=b.style.filter;
  b.style.filter='contrast(140%) saturate(140%) hue-rotate(10deg)';
  setTimeout(()=> b.style.filter=prev, 120);
};

