window.ff={glitchFlash(){const b=document.body,prev=b.style.filter;
b.style.filter='contrast(140%) saturate(140%) hue-rotate(10deg)';
setTimeout(()=> b.style.filter=prev,120);}}
// replace the gradient colors inside draw()
// old (cyan): 'rgba(102,224,255,0.12)'
// new (ember): warm orange/yellow
const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
g.addColorStop(0, 'rgba(255,200,80,0.18)');   // bright ember core
g.addColorStop(0.5,'rgba(255,140,40,0.10)');  // warm halo
g.addColorStop(1, 'rgba(255,140,40,0)');      // fade out
ctx.fillStyle = g;
ctx.beginPath(); ctx.arc(p.x,p.y,p.r*6,0,Math.PI*2); ctx.fill();
// subtle flicker
p.r += (Math.random() - 0.5) * 0.12;
if (p.r < 0.6) p.r = 0.6;
