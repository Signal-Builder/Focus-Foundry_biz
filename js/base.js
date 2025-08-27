function draw(){
  t += 0.005;

  // fully transparent clear (do NOT paint a dark veil)
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, W, H);

  const h = hearth();

  for (const p of P){
    // motion
    p.x += Math.cos(p.a) * p.s;
    p.y += (Math.sin(p.a + t) + 0.6) * p.s;
    p.a += (Math.random() - 0.5) * 0.05;

    // gentle attraction to logo
    const dx = h.x - p.x, dy = h.y - p.y;
    const dist = Math.hypot(dx,dy) + 1e-3;
    const pull = Math.min(0.02, 80 / (dist*dist));
    p.x += dx * pull;
    p.y += dy * pull;

    // wrap
    if (p.x < 0) p.x += W; if (p.x > W) p.x -= W;
    if (p.y < 0) p.y += H; if (p.y > H) p.y -= H;

    // brighter embers for visibility test
    const flick = 1 + (Math.random() - 0.5) * 0.3;
    const Rcore = p.r * 2.2 * flick;
    const Rhalo = p.r * 10  * flick;

    // bright core (normal blend so it shows on photo)
    ctx.globalCompositeOperation = 'source-over';
    let g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Rcore);
    g.addColorStop(0.0, 'rgba(255, 240, 150, 0.85)');
    g.addColorStop(1.0, 'rgba(255, 160, 60, 0.00)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, Rcore, 0, Math.PI*2); ctx.fill();

    // halo (additive for warmth)
    ctx.globalCompositeOperation = 'lighter';
    g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Rhalo);
    g.addColorStop(0.0, 'rgba(255,200,80,0.22)');
    g.addColorStop(0.7, 'rgba(255,140,40,0.10)');
    g.addColorStop(1.0, 'rgba(255,140,40,0.00)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, Rhalo, 0, Math.PI*2); ctx.fill();
  }

  ctx.globalCompositeOperation = 'source-over';
  requestAnimationFrame(draw);
}

