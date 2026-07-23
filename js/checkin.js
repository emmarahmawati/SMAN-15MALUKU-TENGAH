// ===== Check-in (Bangun / Tidur) =====
const CheckIn = {
  stream: null, photoData: null, mood: null, mode: null,

  render(mode) {
    this.mode = mode; this.photoData = null; this.mood = null;
    const isMorning = mode === 'bangun';
    const jam = State.settings?.[isMorning ? 'jam_bangun' : 'jam_tidur'] || (isMorning ? '05:00' : '22:00');
    const html = `
      <div class="checkin-hero ${isMorning ? 'morning' : 'night'}">
        <div class="sub">${isMorning ? '☀️ Program Bangun Pagi' : '🌙 Program Tidur Cepat'}</div>
        <div class="clock" id="live-clock">--:--</div>
        <div class="sub">Target: <b>${jam}</b> · ${UI.fmtDate()}</div>
      </div>

      <div class="card">
        <div class="section-title">Ambil foto selfie <small>Wajib dari kamera</small></div>
        <div class="cam-wrap" id="cam-wrap">
          <video id="cam-video" playsinline autoplay muted></video>
          <canvas id="cam-canvas" class="hidden"></canvas>
          <div class="wmark" id="cam-wm"></div>
        </div>
        <div class="cam-actions">
          <button class="btn-shot" id="btn-shot">📸 Ambil Foto</button>
          <button class="btn-outline hidden" id="btn-retake">Ulangi</button>
        </div>
      </div>

      ${!isMorning ? `
      <div class="card">
        <div class="section-title">Mood hari ini</div>
        <div class="moods" id="moods">
          ${['😀','🙂','😐','😴','😔'].map(m => `<button data-m="${m}">${m}</button>`).join('')}
        </div>
      </div>` : ''}

      <div class="card">
        <div class="section-title">Verifikasi</div>
        <div id="verify-status" style="font-size:13px;color:var(--muted);line-height:1.7">
          📍 Mendeteksi lokasi...<br/>⏱ Sinkron waktu server...
        </div>
        <button class="btn-primary" id="btn-submit" style="margin-top:14px" disabled>
          ${isMorning ? '✨ Saya Sudah Bangun' : '🌙 Saya Siap Tidur'}
        </button>
      </div>
    `;
    document.getElementById('siswa-main').innerHTML = html;

    // Live clock
    const clock = document.getElementById('live-clock');
    const tick = () => clock.textContent = UI.fmtTime();
    tick(); this._clock = setInterval(tick, 1000);

    this.initCam();
    this.initGPS();

    document.getElementById('btn-shot').addEventListener('click', () => this.takeShot());
    document.getElementById('btn-retake')?.addEventListener('click', () => this.retake());
    document.getElementById('btn-submit').addEventListener('click', () => this.submit());
    document.getElementById('moods')?.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      document.querySelectorAll('#moods button').forEach(x => x.classList.remove('on'));
      b.classList.add('on'); this.mood = b.dataset.m;
      this.checkReady();
    });
  },

  teardown() {
    clearInterval(this._clock);
    if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
  },

  async initCam() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 } }, audio: false
      });
      const v = document.getElementById('cam-video');
      v.srcObject = this.stream;
      document.getElementById('cam-wm').textContent =
        `${State.user.nama} · ${State.user.kelas} · ${UI.fmtDate()} ${UI.fmtTime()}`;
    } catch (e) {
      UI.toast('Izin kamera ditolak. Aktifkan kamera untuk lanjut.');
    }
  },

  initGPS() {
    if (!navigator.geolocation) return this.gpsFail('GPS tidak tersedia');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        this.coords = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy };
        document.getElementById('verify-status').innerHTML =
          `📍 Lokasi: ${this.coords.lat.toFixed(5)}, ${this.coords.lng.toFixed(5)} (±${Math.round(this.coords.acc)}m)<br/>⏱ Waktu server akan dipakai saat submit ✓`;
        this.checkReady();
      },
      (err) => this.gpsFail(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  },
  gpsFail(m) {
    document.getElementById('verify-status').innerHTML =
      `❌ GPS wajib aktif: ${m}<br/>Aktifkan lokasi lalu buka halaman ini lagi.`;
  },

  takeShot() {
    const v = document.getElementById('cam-video');
    const c = document.getElementById('cam-canvas');
    if (!v.videoWidth) return UI.toast('Kamera belum siap');
    this.photoData = UI.snapWithWatermark(v, c, {
      line1: `${State.user.nama} · ${State.user.kelas}`,
      line2: `${UI.fmtDate()} · ${UI.fmtTime()}`
    });
    v.classList.add('hidden'); c.classList.remove('hidden');
    document.getElementById('btn-shot').classList.add('hidden');
    document.getElementById('btn-retake').classList.remove('hidden');
    this.checkReady();
  },
  retake() {
    this.photoData = null;
    document.getElementById('cam-video').classList.remove('hidden');
    document.getElementById('cam-canvas').classList.add('hidden');
    document.getElementById('btn-shot').classList.remove('hidden');
    document.getElementById('btn-retake').classList.add('hidden');
    this.checkReady();
  },

  checkReady() {
    const needMood = this.mode === 'tidur';
    const ok = this.photoData && this.coords && (!needMood || this.mood);
    document.getElementById('btn-submit').disabled = !ok;
  },

  async submit() {
    try {
      const r = await API.call('checkin', {
        type: this.mode,
        photo: this.photoData,
        lat: this.coords.lat, lng: this.coords.lng, acc: this.coords.acc,
        mood: this.mood || null
      });
      UI.confetti();
      const msg = this.mode === 'bangun'
        ? '🌞 Selamat! Kamu berhasil bangun tepat waktu.'
        : '🌙 Selamat beristirahat. Sampai jumpa besok pagi.';
      UI.toast(`${msg} +${r.points} poin`);
      this.teardown();
      setTimeout(() => Dashboard.render(), 1500);
    } catch {}
  }
};