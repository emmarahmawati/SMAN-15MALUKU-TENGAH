// ===== Auth =====
const Auth = {
  init() {
    document.querySelectorAll('#screen-login .tab').forEach(t => {
      t.addEventListener('click', () => {
        document.querySelectorAll('#screen-login .tab').forEach(x => x.classList.remove('active'));
        document.querySelectorAll('#screen-login .tab-panel').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        document.getElementById('form-login-' + t.dataset.tab).classList.add('active');
      });
    });
    document.getElementById('form-login-siswa').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      this.loginSiswa(f.get('nama').trim(), f.get('fase').trim(), f.get('kelas').trim());
    });
    document.getElementById('form-login-guru').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      this.loginGuru(f.get('nama').trim(), f.get('password'));
    });
  },
  async loginSiswa(nama, fase, kelas) {
    const r = await API.call('loginSiswa', { nama, fase, kelas });
    State.role = 'siswa'; State.token = r.token; State.user = r.user; State.save();
    UI.toast(`Selamat datang, ${r.user.nama.split(' ')[0]}!`);
    App.enterSiswa();
  },
  async loginGuru(nama, password) {
    const r = await API.call('loginGuru', { nama, password });
    State.role = 'guru'; State.token = r.token; State.user = r.user; State.save();
    UI.toast(`Selamat datang, ${r.user.nama}`);
    App.enterGuru();
  },
  logout() {
    State.clear();
    UI.show('screen-login');
  }
};