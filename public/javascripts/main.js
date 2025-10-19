// JavaScript dasar untuk aplikasi PWA

// Fungsi untuk mengecek apakah aplikasi berjalan sebagai PWA
function isPWA() {
  return (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true);
}

// Inisialisasi aplikasi saat DOM siap
document.addEventListener('DOMContentLoaded', function() {
  console.log('Aplikasi siap!');
  
  // Tambahkan event listener untuk tombol back jika diperlukan
  // untuk menangani navigasi dalam PWA
  window.addEventListener('popstate', function(event) {
    // Tangani perubahan halaman jika diperlukan
  });
  
  // Cek apakah aplikasi berjalan sebagai PWA
  if (isPWA()) {
    console.log('Aplikasi berjalan sebagai PWA');
  } else {
    console.log('Aplikasi berjalan di browser web');
  }
});

// Fungsi untuk menangani offline/online status
window.addEventListener('load', function() {
  // Cek status koneksi
  function updateOnlineStatus() {
    const condition = navigator.onLine ? 'online' : 'offline';
    console.log('Status koneksi: ' + condition);
    
    // Tampilkan notifikasi status jika perlu
    if (!navigator.onLine) {
      // Tampilkan pesan bahwa aplikasi sedang offline
      console.log('Anda sedang offline. Beberapa fitur mungkin terbatas.');
    }
  }
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Cek status awal
  updateOnlineStatus();
});