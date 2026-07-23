// ===== UI Helpers =====
const UI = {
  toast(msg, ms = 2600) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._tt);
    this._tt = setTimeout(() => t.classList.remove('show'), ms);
  },
  showLoader() { document.getElementById('loader').classList.remove('hidden'); },
  hideLoader() { document.getElementById('loader').classList.add('hidden'); },
  show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
  },
  greeting() {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 19) return 'Selamat sore';
    return 'Selamat malam';
  },
  fmtDate(d = new Date()) {
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
  },
  fmtTime(d = new Date()) {
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(d));
  },
  confetti() {
    const c = document.getElementById('confetti');
    const ctx = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;
    const colors = ['#2563eb','#10b981','#facc15','#fb923c','#f43f5e'];
    const bits = Array.from({length: 120}, () => ({
      x: Math.random()*c.width, y: -20 - Math.random()*200,
      r: 4 + Math.random()*6, c: colors[(Math.random()*colors.length)|0],
      vy: 2 + Math.random()*4, vx: -2 + Math.random()*4, a: Math.random()*6.28
    }));
    let t0 = performance.now(), stop = false;
    (function loop(t) {
      ctx.clearRect(0,0,c.width,c.height);
      bits.forEach(b => {
        b.y += b.vy; b.x += b.vx; b.a += 0.1;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
        ctx.fillStyle = b.c; ctx.fillRect(-b.r/2, -b.r/2, b.r, b.r*1.4);
        ctx.restore();
      });
      if (!stop && t - t0 < 3000) requestAnimationFrame(loop);
      else ctx.clearRect(0,0,c.width,c.height);
    })(t0);
  },
  // Snap: draw video into canvas + watermark
  snapWithWatermark(video, canvas, wm) {
    const w = video.videoWidth, h = video.videoHeight;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    // watermark
    const pad = Math.round(w * 0.02);
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    const lines = [wm.line1, wm.line2].filter(Boolean);
    const fs = Math.round(w * 0.032);
    ctx.font = `600 ${fs}px sans-serif`;
    const hBox = fs * (lines.length + 0.6) + pad*2;
    ctx.fillRect(pad, h - hBox - pad, w - pad*2, hBox);
    ctx.fillStyle = '#fff';
    lines.forEach((l, i) => ctx.fillText(l, pad*2, h - hBox - pad + fs*(i+1) + 4));
    return canvas.toDataURL('image/jpeg', 0.75);
  }
};