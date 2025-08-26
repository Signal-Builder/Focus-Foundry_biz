// --- Cinematic ember background ---
(() => {
  const c = document.getElementById('bg');
  if (!c) return;

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const ctx = c.getContext('2d', { alpha: true });

  let W = 0, H = 0, t = 0;
  const P = []; // particles (embers)

  function resize(){
    W = c.width  = Math.max(1, Math.floor(innerWidth  * dpr));
    H = c.height = Math.max(1, Math.floor(innerHeight * dpr));
    c.style.width  = innerWidth  + 'px';
    c.style.height = innerHeight + 'px';
  }
  addEventListener('resize', resize, { passive:true });
  resize();

  // create embers
  const COUNT = 140;
  for (let i=0; i<COUNT; i++){
    P.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: (Math.random()*2 + 0.6) * dpr,   // radius base
      s: Math.random()*0.6 + 0.2,         // speed
      a: Math.random()*Math.PI*2          // drift angle
    });
  }

  function draw(){
    t += 0.005;

    // soft trail for smoke feel
    ctx.fillStyle = 'rgba(11,11,15,0.08)';
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';
    for (const p of P){
      // motion
      p.x += Math.cos(p.a) * p.s;
      p.y += (Math.sin(p.a + t) + 0.8) * p.s; // slight upward bias
      p.a += (Math.random() - 0.5) * 0.05;

      // wrap around
      if (p.x < 0)   p.x += W;
      if (p.x > W)   p.x -= W;
      if (p.y < 0)   p.y += H;
      if (p.y > H)   p.y -= H;

      // tiny flicker
      const flicker = 1 + (Math.random() - 0.5) * 0.2;

      // ember gradient (orange/yellow)
      const R = p.r * 6 * flicker;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
      g.addColorStop(0.0, 'rgba(255,200,80,0.18)');  // hot core
      g.addColorStop(0.5, 'rgba(255,140,40,0.10)');  // warm halo
      g.addColorStop(1.0, 'rgba(255,140,40,0.00)');  // fade
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

