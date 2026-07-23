// ===== App Bootstrap & Routing =====
const App = {
  init() {
    // Splash
    setTimeout(() => document.getElementById('splash').classList.add('fade'), 900);
    setTimeout(() => document.getElementById('splash').remove(), 1500);

    State.load();
    Auth.init();

    // Bottom nav siswa
    document.querySelectorAll('#screen-siswa .nav-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('#screen-siswa .nav-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        this.gotoSiswa(b.dataset.page);
      });
    });
    // Bottom nav guru
    document.querySelectorAll('#screen-guru .nav-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('#screen-guru .nav-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        this.gotoGuru(b.dataset.gpage);
      });
    });
    document.getElementById('btn-profile').onclick = () => Dashboard.profil();
    document.getElementById('btn-logout-guru').onclick = () => Auth.logout();

    // Auto-resume
    if (State.token && State.role === 'siswa') this.enterSiswa();
    else if (State.token && State.role === 'guru') this.enterGuru();
    else UI.show('screen-login');
  },

  enterSiswa() {
    UI.show('screen-siswa');
    Dashboard.render();
  },
  enterGuru() {
    UI.show('screen-guru');
    Guru.overview();
  },

  gotoSiswa(page) {
    CheckIn.teardown();
    if (page === 'dashboard') Dashboard.render();
    else if (page === 'tidur') CheckIn.render('tidur');
    else if (page === 'bangun') CheckIn.render('bangun');
    else if (page === 'riwayat') Dashboard.riwayat();
    else if (page === 'reward') Dashboard.reward();
  },
  gotoGuru(page) {
    if (page === 'overview') Guru.overview();
    else if (page === 'siswa') Guru.siswa();
    else if (page === 'checkin') Guru.checkin();
    else if (page === 'laporan') Guru.laporan();
    else if (page === 'setting') Guru.setting();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());