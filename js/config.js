// ===== KONFIGURASI APLIKASI =====
// Ganti API_URL dengan URL Web App Google Apps Script Anda setelah deploy
window.CONFIG = {
  APP_NAME: 'Kokurikuler SMAN 15 Maluku Tengah',
  API_URL: 'https://script.google.com/macros/s/PASTE_YOUR_DEPLOYMENT_ID/exec',
  VERSION: '1.0.0',
  // Radius toleransi GPS (meter) - untuk validasi sekolah, 0 = tidak dicek
  GPS_STRICT: false,
  SCHOOL_LAT: -3.5,
  SCHOOL_LNG: 128.9,
  GPS_RADIUS_M: 5000
};

window.MOTIVASI = [
  "Hari yang hebat dimulai dengan bangun lebih awal.",
  "Disiplin adalah kunci kesuksesan.",
  "Kebiasaan kecil hari ini menentukan masa depanmu.",
  "Tidur cukup adalah investasi untuk otakmu.",
  "Menang atas diri sendiri adalah kemenangan terbesar.",
  "Konsistensi mengalahkan intensitas.",
  "Mulai dari langkah kecil, capai mimpi besar."
];