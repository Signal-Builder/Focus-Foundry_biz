(() => {
  const c = document.getElementById('bg');
  if (!c) { console.warn('No #bg'); return; }

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const ctx = c.getContext('2d', { alpha: true });

  function resize(){
    c.width  = Math.floor(innerWidth  * dpr);
    c.height = Math.floor(innerHeight * dpr);
    c.style.width  = innerWidth  + 'px';
    c.style.height = innerHeight + 'px';
  }
  addEventListener('resize', resize, { passive:true });
  resize();

  let t = 0;
  function draw(){
    t += 0.02;

    // clear with transparent veil (so background photo shows)
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0,0,c.width,c.height);

    // draw a very obvious circle moving left-right
    const x = (c.width  / 2) + Math.cos(t) * (c.width * 0.3);
    const y = (c.height / 3);

    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 0, 0.95)'; // bright yellow
    ctx.arc(x, y, 30 * dpr, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(draw);
  }
  draw();

  console.log('[diag] canvas test running');
})();

