window.ff = {
  glitchFlash(){
    const b=document.body, prev=b.style.filter;
    b.style.filter='contrast(140%) saturate(140%) hue-rotate(10deg)';
    setTimeout(()=> b.style.filter=prev, 120);
  },
  capture(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const db = JSON.parse(localStorage.getItem('ff-captures') || '[]');
      db.push({ ...data, ts: new Date().toISOString() });
      localStorage.setItem('ff-captures', JSON.stringify(db));
      form.reset();
      const msg = form.querySelector('.form-msg'); if(msg){ msg.textContent='Thanks! You are on the list.'; msg.style.opacity='1';}
      ff.glitchFlash();
    });
  }
};
