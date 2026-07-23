// ===== API Client - Google Apps Script =====
const API = {
  async call(action, payload = {}) {
    UI.showLoader();
    try {
      const body = JSON.stringify({ action, token: State.token || null, ...payload });
      const res = await fetch(CONFIG.API_URL, {
        method: 'POST',
        // Gunakan text/plain untuk hindari CORS preflight ke GAS
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Terjadi kesalahan');
      return data;
    } catch (e) {
      UI.toast(e.message || 'Gagal terhubung ke server');
      throw e;
    } finally {
      UI.hideLoader();
    }
  }
};

// State singleton
const State = {
  role: null,        // 'siswa' | 'guru'
  token: null,
  user: null,        // profil siswa/guru
  settings: null,    // jam bangun/tidur
  save() {
    localStorage.setItem('kk_state', JSON.stringify({
      role: this.role, token: this.token, user: this.user
    }));
  },
  load() {
    try {
      const s = JSON.parse(localStorage.getItem('kk_state') || '{}');
      Object.assign(this, s);
    } catch {}
  },
  clear() {
    localStorage.removeItem('kk_state');
    this.role = this.token = this.user = null;
  }
};