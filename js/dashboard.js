// ===== Dashboard Siswa & sub-pages =====
const Dashboard = {
  async render() {
    const r = await API.call('siswaOverview');
    State.settings = r.settings;
    const u = r.user, s = r.stats;
    const lv = GAME.levelOf(s.points);
    const badges = GAME.earnedBadges(s.points);
    const motiv = MOTIVASI[Math.floor(Math.random()*MOTIVASI.length)];

    document.getElementById('greeting').textContent = `${UI.greeting()}, ${u.nama.split(' ')[0]}`;
    document.getElementById('siswa-nama').textContent = `${u.fase} · ${u.kelas} · Wali: ${u.wali || '-'}`;

    document.getElementById('siswa-main').innerHTML = `
      <div class="card-hero">
        <h3>Total poin kamu</h3>
        <div class="big">${s.points}</div>
        <div class="sub">${lv.current.name}${lv.next ? ` → ${lv.next.name}` : ' · MAX'}</div>
        <div class="progress"><span style="width:${lv.pct}%"></span></div>
        <div class="sub" style="margin-top:8px">Disiplin ${s.disiplin_pct}% · Streak ${s.streak} hari</div>
      </div>

      <div class="motiv"><small>Motivasi hari ini</small><p>"${motiv}"</p></div>

      <div class="grid-2">
        <div class="stat"><div class="icon">🌙</div><div class="val">${s.tidur_ontime}</div><div class="lbl">Tidur tepat waktu</div></div>
        <div class="stat"><div class="icon">☀️</div><div class="val">${s.bangun_ontime}</div><div class="lbl">Bangun tepat waktu</div></div>
        <div class="stat"><div class="icon">⚠️</div><div class="val">${s.telat}</div><div class="lbl">Terlambat</div></div>
        <div class="stat"><div class="icon">🎯</div><div class="val">${s.target_pct}%</div><div class="lbl">Target minggu ini</div></div>
      </div>

      <div class="card">
        <div class="section-title">Badge saya <small>${badges.length}/${GAME.badges.length}</small></div>
        <div class="badges-row">
          ${badges.length ? badges.map(b => `<span class="badge gold">${b.name}</span>`).join('') : '<span class="badge">Belum ada · kumpulkan poin!</span>'}
        </div>
      </div>

      <div class="card">
        <div class="section-title">Kalender disiplin <small>${new Date().toLocaleString('id-ID',{month:'long', year:'numeric'})}</small></div>
        ${this.calendarHTML(r.calendar)}
      </div>

      <div class="card">
        <div class="section-title">Aktivitas terbaru</div>
        ${r.recent.length ? r.recent.map(x => `
          <div class="list-item">
            <div class="dot">${x.type === 'bangun' ? '☀️' : '🌙'}</div>
            <div class="meta"><b>${x.type === 'bangun' ? 'Bangun pagi' : 'Tidur cepat'}</b><small>${UI.fmtDate(x.at)} · ${UI.fmtTime(x.at)}</small></div>
            <span class="pill ${x.status === 'ontime' ? 'ok' : x.status === 'late' ? 'late' : 'no'}">
              ${x.status === 'ontime' ? 'Tepat' : x.status === 'late' ? 'Telat' : '-'}
            </span>
          </div>`).join('') : '<p style="color:var(--muted);font-size:13px">Belum ada aktivitas.</p>'}
      </div>
    `;
  },

  calendarHTML(map) {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const first = new Date(y, m, 1).getDay(); // 0=Sun
    const days = new Date(y, m+1, 0).getDate();
    const heads = ['M','S','S','R','K','J','S'];
    let html = '<div class="cal">' + heads.map(h => `<div class="d head">${h}</div>`).join('');
    for (let i = 0; i < first; i++) html += '<div class="d"></div>';
    for (let d = 1; d <= days; d++) {
      const key = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const s = map[key];
      const cls = s === 'ok' ? 'ok' : s === 'late' ? 'late' : s === 'no' ? 'no' : '';
      html += `<div class="d ${cls}">${d}</div>`;
    }
    return html + '</div>';
  },

  async riwayat() {
    const r = await API.call('siswaRiwayat');
    document.getElementById('siswa-main').innerHTML = `
      <div class="card">
        <div class="section-title">Riwayat check-in <small>${r.items.length} entri</small></div>
        ${r.items.length ? r.items.map(x => `
          <div class="list-item">
            ${x.photo ? `<img src="${x.photo}" style="width:44px;height:44px;border-radius:10px;object-fit:cover" alt=""/>` : `<div class="dot">${x.type==='bangun'?'☀️':'🌙'}</div>`}
            <div class="meta"><b>${x.type === 'bangun' ? 'Bangun' : 'Tidur'} · +${x.points}</b><small>${UI.fmtDate(x.at)} · ${UI.fmtTime(x.at)}<br/>📍 ${x.lat?.toFixed?.(4)}, ${x.lng?.toFixed?.(4)}</small></div>
            <span class="pill ${x.status === 'ontime' ? 'ok' : 'late'}">${x.status}</span>
          </div>`).join('') : '<p style="color:var(--muted)">Belum ada riwayat.</p>'}
      </div>`;
  },

  async reward() {
    const r = await API.call('leaderboard');
    const lv = GAME.levelOf(State.user.points || 0);
    document.getElementById('siswa-main').innerHTML = `
      <div class="card-hero"><h3>Level kamu</h3><div class="big">${lv.current.name}</div>
        <div class="progress"><span style="width:${lv.pct}%"></span></div>
        <div class="sub">${lv.next ? `${Math.round(lv.pct)}% menuju ${lv.next.name}` : 'Level maksimum!'}</div>
      </div>
      <div class="card">
        <div class="section-title">🏆 Leaderboard Kelas</div>
        ${r.kelas.map((x,i) => `<div class="list-item"><div class="dot">${i+1}</div><div class="meta"><b>${x.nama}</b><small>${x.kelas}</small></div><b>${x.points}</b></div>`).join('') || '<p style="color:var(--muted)">Kosong</p>'}
      </div>
      <div class="card">
        <div class="section-title">🌍 Ranking Sekolah <small>Top 20</small></div>
        ${r.sekolah.map((x,i) => `<div class="list-item"><div class="dot">${i+1}</div><div class="meta"><b>${x.nama}</b><small>${x.kelas} · ${x.wali||''}</small></div><b>${x.points}</b></div>`).join('')}
      </div>
      <div class="card">
        <div class="section-title">🎖 Semua Badge</div>
        <div class="badges-row">${GAME.badges.map(b => `<span class="badge ${(State.user.points||0)>=b.min?'gold':''}">${b.name} · ${b.min}p</span>`).join('')}</div>
      </div>`;
  },

  profil() {
    const u = State.user;
    document.getElementById('siswa-main').innerHTML = `
      <div class="card" style="text-align:center">
        <div style="width:88px;height:88px;border-radius:28px;background:var(--gradient-hero);margin:6px auto 12px;display:grid;place-items:center;font-size:44px;color:white">🎓</div>
        <h2>${u.nama}</h2>
        <p style="color:var(--muted);margin-top:4px">${u.fase} · ${u.kelas}</p>
      </div>
      <div class="card">
        <div class="list-item"><div class="dot">👨‍🏫</div><div class="meta"><b>Guru Wali</b><small>${u.wali || '-'}</small></div></div>
        <div class="list-item"><div class="dot">📞</div><div class="meta"><b>Kontak Orang Tua</b><small>${u.wa_ortu || '-'}</small></div></div>
        <div class="list-item"><div class="dot">🆔</div><div class="meta"><b>NIS</b><small>${u.nis || '-'}</small></div></div>
      </div>
      <button class="btn-primary" id="btn-logout">Keluar</button>`;
    document.getElementById('btn-logout').onclick = () => Auth.logout();
  }
};