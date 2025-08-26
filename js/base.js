window.ff={glitchFlash(){const b=document.body,prev=b.style.filter;
b.style.filter='contrast(140%) saturate(140%) hue-rotate(10deg)';
setTimeout(()=> b.style.filter=prev,120);}}