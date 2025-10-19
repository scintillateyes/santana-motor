App Summary – Sistem Penjualan Kendaraan Bekas (PWA Dealer)
1. Deskripsi Singkat

Aplikasi berbasis web (PWA) untuk mengelola penjualan kendaraan bekas.
Sistem ini memungkinkan customer untuk melihat katalog kendaraan, melakukan pemesanan, dan melihat detail unit; sementara admin dapat mengelola stok, transaksi, dan pembukuan secara online.

2. Tujuan Pengembangan

Meningkatkan efisiensi pengelolaan data penjualan kendaraan bekas.

Mempermudah pelanggan mencari dan membeli kendaraan secara online.

Menyediakan sistem pembukuan otomatis agar laporan penjualan dan stok selalu terupdate.

Membantu dealer memiliki sistem digital berbasis web yang bisa diakses dari mana saja.

3. Fitur Utama
Untuk Pengguna (Customer)

Registrasi dan login akun.

Lihat katalog kendaraan (list dan detail).

Filter & pencarian (berdasarkan merek, tahun, harga, tipe).

Pemesanan kendaraan / transaksi pembelian.

Notifikasi status pesanan.

Progressive Web App (PWA): bisa diinstal di HP, offline caching.

Untuk Admin

Login admin.

Manajemen kendaraan (CRUD data unit).

Upload foto kendaraan.

Manajemen stok otomatis (stok berkurang saat ada transaksi).

Manajemen pelanggan.

Laporan dan pembukuan penjualan.

Dashboard statistik penjualan (opsional pakai chart).

4. Teknologi yang Digunakan
Komponen	Teknologi	Keterangan
Frontend	Next.js (React)	Mendukung PWA, SEO-friendly, modern UI
Backend API	Node.js + Express	REST API server-side logic
Database	MySQL	Relasional, stabil, cocok untuk transaksi
ORM / Query	mysql2/promise (native query)	Ringan, async
Authentication	JWT (JSON Web Token)	Login user & admin
Storage	Cloudinary / lokal folder	Simpan foto kendaraan
Styling UI	Tailwind CSS	Responsif dan cepat
Chart / Visualisasi	Recharts / Chart.js	Statistik penjualan
Testing (opsional)	Jest / Postman	Uji endpoint dan fungsi
Deployment	Vercel (frontend), Render / Railway (backend), PlanetScale / Neon (database)	Cloud hosting gratis atau freemium