// Script untuk inisialisasi database
const mysql = require('mysql2/promise');
require('dotenv').config();

// Konfigurasi koneksi database
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'vehicle_sales_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function initDatabase() {
  let connection;
  
  try {
    // Buat koneksi tanpa menentukan database terlebih dahulu
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;
    
    connection = await mysql.createConnection(tempConfig);
    
    // Buat database jika belum ada
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log(`Database ${dbConfig.database} siap digunakan`);
    
    // Gunakan database
    await connection.query(`USE \`${dbConfig.database}\``);
    
    // Buat tabel users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        role ENUM('customer', 'admin') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabel users berhasil dibuat');
    
    // Buat tabel vehicles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id VARCHAR(36) PRIMARY KEY,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INT NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        mileage INT,
        condition ENUM('baru', 'bekas') DEFAULT 'bekas',
        fuel_type VARCHAR(50),
        transmission VARCHAR(50),
        color VARCHAR(50),
        description TEXT,
        stock INT DEFAULT 1,
        status ENUM('available', 'sold', 'reserved') DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabel vehicles berhasil dibuat');
    
    // Buat tabel vehicle_images
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vehicle_images (
        id VARCHAR(36) PRIMARY KEY,
        vehicle_id VARCHAR(36) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabel vehicle_images berhasil dibuat');
    
    // Buat tabel transactions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(36) PRIMARY KEY,
        customer_id VARCHAR(36) NOT NULL,
        vehicle_id VARCHAR(36) NOT NULL,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        price DECIMAL(15, 2) NOT NULL,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
      )
    `);
    console.log('Tabel transactions berhasil dibuat');
    
    // Buat indeks untuk performansi
    await connection.query('CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON vehicles(brand)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(price)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date)');
    
    console.log('Indeks berhasil dibuat');
    
    // Tambahkan pengguna admin default jika belum ada
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@vehiclesales.com']);
    
    if (rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const { v4: uuidv4 } = require('uuid');
      
      const adminId = uuidv4();
      const hashedPassword = bcrypt.hashSync('admin123', bcrypt.genSaltSync(8));
      
      await connection.query(`
        INSERT INTO users (id, email, password, name, phone, address, role) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [adminId, 'admin@vehiclesales.com', hashedPassword, 'Admin', '081234567890', 'Jl. Admin No. 1', 'admin']);
      
      console.log('Pengguna admin default berhasil dibuat (email: admin@vehiclesales.com, password: admin123)');
    } else {
      console.log('Pengguna admin sudah ada');
    }
    
    console.log('Inisialisasi database selesai');
  } catch (error) {
    console.error('Error saat inisialisasi database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Jalankan inisialisasi database
initDatabase();