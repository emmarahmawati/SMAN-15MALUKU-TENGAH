// ===== Guru Wali Dashboard =====
const Guru = {
  async overview() {
    const r = await API.call('guruOverview');
    document.getElementById('guru-nama').textContent = State.user.nama;
    document.getElementById('guru-main').innerHTML = `
      <div class="card-hero">
        <h3>Ringkasan hari ini</h3>
        <div class="big">${r.today.ontime}/${r.total}</div>
        <div class="sub">siswa sudah check-in tepat waktu</div>
        <div class="progress"><span style="width:${r.total?r.today.ontime/r.total*100:0}%"></span></div>
      </div>
      <div class="grid-2">
        <div class="stat"><div class="icon">👥</div><div class="val">${r.total}</div><div class="lbl">Total siswa</div></div>
        <div class="stat"><div class="icon">☀️</div><div class="val">${r.today.bangun}</div><div class="lbl">Sudah bangun</div></div>
        <div class="stat"><div class="icon">🌙</div><div class="val">${r.today.tidur}</div><div class="lbl">Sudah tidur</div></div>
        <div class="stat"><div class="icon">⚠️</div><div class="val">${r.today.late}</div><div class="lbl">Terlambat</div></div>
      </div>
      <div class="card">
        <div class="section-title">📢 Kirim pengumuman</div>
        <div class="form-inline">
          <input id="ann" placeholder="Pesan untuk semua siswa bimbingan"/>
          <button class="btn-sm primary" id="btn-ann">Kirim</button>
        </div>
      </div>
      <div class="card">
        <div class="section-title">Statistik kelas <small>7 hari terakhir</small></div>
        ${this.miniChart(r.chart)}
      </div>
    `;
    document.getElementById('btn-ann').onclick = async () => {
      const msg = document.getElementById('ann').value.trim();
      if (!msg) return;
      await API.call('kirimPengumuman', { message: msg });
      UI.toast('Pengumuman terkirim ke siswa bimbingan');
      document.getElementById('ann').value = '';
    };
  },

  miniChart(data) {
    if (!data?.length) return '<p style="color:var(--muted)">Belum ada data.</p>';
    const max = Math.max(...data.map(d => d.count), 1);
    return `<div style="display:flex;gap:6px;align-items:end;height:120px;margin-top:10px">
      ${data.map(d => `
        <div style="flex:1;text-align:center">
          <div style="height:${d.count/max*100}px;background:var(--gradient-hero);border-radius:8px 8px 0 0;min-height:4px"></div>
          <small style="color:var(--muted);font-size:10px">${d.label}</small>
        </div>`).join('')}
    </div>`;
  },

  async siswa() {
    const r = await API.call('guruListSiswa');
    document.getElementById('guru-main').innerHTML = `
      <div class="card">
        <div class="section-title">Tambah siswa bimbingan</div>
        <div class="form-inline">
          <input id="s-nama" placeholder="Nama lengkap"/>
          <div class="row">
            <input id="s-fase" placeholder="Fase (E/F)"/>
            <input id="s-kelas" placeholder="Kelas"/>
          </div>
          <input id="s-nis" placeholder="NIS (opsional)"/>
          <input id="s-wa" placeholder="WhatsApp orang tua (opsional)"/>
          <button class="btn-sm primary" id="btn-add">+ Tambah</button>
        </div>
      </div>
      <div class="card">
        <div class="section-title">Siswa bimbingan <small>${r.items.length}</small></div>
        <table><thead><tr><th>Nama</th><th>Kelas</th><th>Poin</th><th></th></tr></thead><tbody>
        ${r.items.map(s => `<tr>
          <td><b>${s.nama}</b><br/><small style="color:var(--muted)">${s.wa_ortu||'-'}</small></td>
          <td>${s.fase}·${s.kelas}</td>
          <td>${s.points||0}</td>
          <td><button class="btn-sm danger" data-del="${s.id}">Hapus</button></td>
        </tr>`).join('')}
        </tbody></table>
      </div>`;
    document.getElementById('btn-add').onclick = async () => {
      const payload = {
        nama: document.getElementById('s-nama').value.trim(),
        fase: document.getElementById('s-fase').value.trim(),
        kelas: document.getElementById('s-kelas').value.trim(),
        nis: document.getElementById('s-nis').value.trim(),
        wa_ortu: document.getElementById('s-wa').value.trim()
      };
      if (!payload.nama || !payload.fase || !payload.kelas) return UI.toast('Lengkapi nama, fase, kelas');
      await API.call('guruAddSiswa', payload);
      UI.toast('Siswa ditambahkan'); this.siswa();
    };
    document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      if (!confirm('Hapus siswa ini?')) return;
      await API.call('guruDelSiswa', { id: b.dataset.del }); this.siswa();
    });
  },

  async checkin() {
    const r = await API.call('guruCheckinToday');
    document.getElementById('guru-main').innerHTML = `
      <div class="card">
        <div class="section-title">Check-in hari ini <small>${UI.fmtDate()}</small></div>
        ${r.items.map(x => `
          <div class="list-item">
            ${x.photo ? `<img src="${x.photo}" style="width:44px;height:44px;border-radius:10px;object-fit:cover"/>` : `<div class="dot">${x.type==='bangun'?'☀️':'🌙'}</div>`}
            <div class="meta"><b>${x.nama}</b><small>${x.kelas} · ${x.type} · ${UI.fmtTime(x.at)}</small></div>
            <span class="pill ${x.status==='ontime'?'ok':'late'}">${x.status}</span>
          </div>`).join('') || '<p style="color:var(--muted)">Belum ada check-in.</p>'}
      </div>
      <div class="card">
        <div class="section-title">Belum check-in <small>${r.missing.length}</small></div>
        ${r.missing.map(s => `<div class="list-item"><div class="dot">😴</div><div class="meta"><b>${s.nama}</b><small>${s.kelas}</small></div><span class="pill no">Belum</span></div>`).join('') || '<p style="color:var(--muted)">Semua sudah check-in 🎉</p>'}
      </div>`;
  },

  async laporan() {
    document.getElementById('guru-main').innerHTML = `
      <div class="card">
        <div class="section-title">Ekspor laporan</div>
        <p style="color:var(--muted);font-size:13px">Unduh rekap semua siswa bimbingan.</p>
        <div class="row" style="margin-top:12px">
          <button class="btn-sm primary" id="btn-csv">⬇ Excel/CSV</button>
          <button class="btn-sm" id="btn-pdf">🖨 Cetak PDF</button>
        </div>
      </div>`;
    document.getElementById('btn-csv').onclick = async () => {
      const r = await API.call('guruExport');
      const blob = new Blob([r.csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `laporan_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
    };
    document.getElementById('btn-pdf').onclick = () => window.print();
  },

  async setting() {
    const r = await API.call('getSettings');
    document.getElementById('guru-main').innerHTML = `
      <div class="card">
        <div class="section-title">Jam program</div>
        <div class="form-inline">
          <label>Jam bangun</label>
          <input id="j-bangun" type="time" value="${r.jam_bangun || '05:00'}"/>
          <label>Jam tidur</label>
          <input id="j-tidur" type="time" value="${r.jam_tidur || '22:00'}"/>
          <label>Toleransi keterlambatan (menit)</label>
          <input id="j-tol" type="number" min="0" max="120" value="${r.toleransi_menit || 15}"/>
          <button class="btn-sm primary" id="btn-save">Simpan</button>
        </div>
      </div>
      <div class="card">
        <div class="section-title">Akun</div>
        <button class="btn-sm danger" id="btn-out">Keluar</button>
      </div>`;
    document.getElementById('btn-save').onclick = async () => {
      await API.call('saveSettings', {
        jam_bangun: document.getElementById('j-bangun').value,
        jam_tidur: document.getElementById('j-tidur').value,
        toleransi_menit: +document.getElementById('j-tol').value
      });
      UI.toast('Pengaturan tersimpan');
    };
    document.getElementById('btn-out').onclick = () => Auth.logout();
  }
};