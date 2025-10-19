# Panduan Pengujian Aplikasi Sistem Penjualan Kendaraan Bekas

## Prasyarat
- Node.js (versi 14 atau lebih tinggi)
- MySQL Server
- npm

## Instalasi
1. Clone atau buat proyek
2. Jalankan `npm install` untuk menginstal dependensi
3. Buat file `.env` dengan konfigurasi database
4. Jalankan script inisialisasi database
5. Jalankan aplikasi

## Konfigurasi Database
Buat file `.env` dengan konten berikut:
```
DB_HOST=localhost
DB_USER=nama_user_mysql
DB_PASSWORD=password_mysql
DB_NAME=vehicle_sales_db
PORT=3000
NODE_ENV=development
```

## Inisialisasi Database
Jalankan perintah berikut untuk membuat database dan tabel-tabel yang diperlukan:
```bash
node scripts/init_db.js
```

## Menjalankan Aplikasi
```bash
npm start
```
atau untuk mode pengembangan:
```bash
npm run dev
```

## Endpoint yang Tersedia

### Untuk Customer
- `GET /` - Halaman utama
- `GET /signup` - Halaman pendaftaran
- `POST /signup` - API pendaftaran pengguna
- `GET /login` - Halaman login
- `POST /login` - API login pengguna
- `GET /api/vehicles` - Katalog kendaraan
- `GET /api/vehicles/:id` - Detail kendaraan
- `GET /api/vehicles/search?q=keyword` - Pencarian kendaraan
- `POST /api/transactions` - Buat pesanan baru
- `GET /api/transactions` - Daftar pesanan pengguna
- `GET /api/transactions/:id` - Detail pesanan

### Untuk Admin
- `GET /admin` - Dashboard admin
- `GET /api/admin/vehicles` - Daftar kendaraan (admin)
- `POST /api/admin/vehicles` - Tambah kendaraan baru
- `PUT /api/admin/vehicles/:id` - Update kendaraan
- `DELETE /api/admin/vehicles/:id` - Hapus kendaraan
- `GET /api/admin/vehicles/:id` - Detail kendaraan (admin)
- `POST /api/admin/vehicles/:vehicleId/images` - Upload gambar kendaraan
- `PUT /api/admin/vehicles/:vehicleId/primary-image` - Upload gambar utama
- `DELETE /api/admin/vehicles/:vehicleId/images/:imageId` - Hapus gambar kendaraan
- `GET /api/admin/transactions` - Daftar transaksi
- `GET /api/admin/transactions/:id` - Detail transaksi
- `PUT /api/admin/transactions/:id/status` - Update status transaksi
- `DELETE /api/admin/transactions/:id` - Hapus transaksi
- `GET /api/admin/customers` - Daftar pelanggan
- `GET /api/admin/customers/:id` - Detail pelanggan
- `PUT /api/admin/customers/:id` - Update pelanggan
- `DELETE /api/admin/customers/:id` - Hapus pelanggan
- `GET /api/admin/reports/sales` - Laporan penjualan
- `GET /api/admin/reports/sales/summary` - Ringkasan penjualan
- `GET /api/admin/reports/sales/chart` - Data grafik penjualan
- `GET /admin/reports/sales` - Halaman laporan penjualan

## Fitur yang Diumplementasikan
1. ✅ Sistem autentikasi (registrasi/login customer & admin)
2. ✅ Katalog kendaraan dengan filter dan pencarian
3. ✅ Pemesanan kendaraan
4. ✅ Manajemen kendaraan (CRUD) untuk admin
5. ✅ Upload foto kendaraan dengan Cloudinary
6. ✅ Manajemen stok otomatis
7. ✅ Manajemen pelanggan
8. ✅ Laporan dan pembukuan penjualan
9. ✅ Dashboard statistik penjualan
10. ✅ Fitur PWA (Progressive Web App)

## Akun Default
Setelah inisialisasi database, akun admin default akan dibuat:
- Email: admin@vehiclesales.com
- Password: admin123

## Pengujian Manual
1. Buka browser dan akses `http://localhost:3000`
2. Coba mendaftar sebagai customer baru
3. Login sebagai customer dan lihat katalog kendaraan
4. Coba buat pesanan
5. Login sebagai admin (dengan akun default)
6. Tambahkan kendaraan baru
7. Upload gambar untuk kendaraan
8. Lihat dashboard admin dan laporan penjualan
9. Uji PWA dengan menginstal aplikasi di perangkat

## Teknologi yang Digunakan
- Backend: Node.js + Express
- Database: MySQL
- ORM: mysql2
- Authentication: Passport.js + JWT
- Storage: Cloudinary (untuk gambar kendaraan)
- Frontend: Handlebars + Bootstrap
- PWA: Service Worker + Manifest
- Chart: Chart.js