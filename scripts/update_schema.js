const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function updateSchema() {
  let connection;
  
  try {
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection(config);
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'vehicle_sales_db'}\`;`);
    console.log('Database created or already exists');
    
    // Use the database
    await connection.query(`USE \`${process.env.DB_NAME || 'vehicle_sales_db'}\`;`);
    
    // Drop existing tables if they exist (to match new schema)
    await connection.query('DROP TABLE IF EXISTS wishlist;');
    await connection.query('DROP TABLE IF EXISTS vehicle_images;');
    await connection.query('DROP TABLE IF EXISTS bookkeeping;');
    await connection.query('DROP TABLE IF EXISTS inventory_logs;');
    await connection.query('DROP TABLE IF EXISTS transactions;');
    await connection.query('DROP TABLE IF EXISTS users;');
    await connection.query('DROP TABLE IF EXISTS vehicles;');
    
    console.log('Old tables dropped');
    
    // Create new tables based on the sql.md schema
    
    // Create users table
    await connection.query(`
      CREATE TABLE \`users\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`name\` varchar(100) NOT NULL,
        \`email\` varchar(100) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`role\` enum('admin','staff','customer') NOT NULL DEFAULT 'customer',
        \`phone\` varchar(30) DEFAULT NULL,
        \`address\` text DEFAULT NULL,
        \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
        \`updated_at\` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log('Users table created');
    
    // Create vehicles table
    await connection.query(`
      CREATE TABLE \`vehicles\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`name\` varchar(150) NOT NULL,
        \`brand\` varchar(50) NOT NULL,
        \`model\` varchar(50) DEFAULT NULL,
        \`year\` int(11) DEFAULT NULL,
        \`color\` varchar(30) DEFAULT NULL,
        \`transmission\` enum('manual','automatic') DEFAULT 'manual',
        \`mileage\` int(11) DEFAULT 0,
        \`condition\` enum('baik','layak','butuh perbaikan') DEFAULT 'baik',
        \`purchase_price\` decimal(12,2) NOT NULL DEFAULT 0.00,
        \`selling_price\` decimal(12,2) NOT NULL DEFAULT 0.00,
        \`stock\` int(11) NOT NULL DEFAULT 1,
        \`description\` text DEFAULT NULL,
        \`image_url\` text DEFAULT NULL,
        \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
        \`updated_at\` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (\`id\`),
        KEY \`idx_vehicles_brand\` (\`brand\`),
        KEY \`idx_vehicles_year\` (\`year\`),
        KEY \`idx_vehicles_selling_price\` (\`selling_price\`),
        FULLTEXT KEY \`ft_vehicles_name_description\` (\`name\`,\`description\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log('Vehicles table created');
    
    // Create transactions table
    await connection.query(`
      CREATE TABLE \`transactions\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`vehicle_id\` int(11) NOT NULL,
        \`customer_id\` int(11) DEFAULT NULL,
        \`admin_id\` int(11) DEFAULT NULL,
        \`quantity\` int(11) NOT NULL DEFAULT 1,
        \`unit_price\` decimal(12,2) NOT NULL,
        \`total_price\` decimal(14,2) NOT NULL,
        \`payment_method\` enum('cash','transfer','credit') DEFAULT 'cash',
        \`transaction_date\` datetime NOT NULL DEFAULT current_timestamp(),
        \`status\` enum('pending','paid','cancelled') DEFAULT 'paid',
        \`notes\` text DEFAULT NULL,
        \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
        \`updated_at\` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (\`id\`),
        KEY \`admin_id\` (\`admin_id\`),
        KEY \`idx_transactions_vehicle\` (\`vehicle_id\`),
        KEY \`idx_transactions_customer\` (\`customer_id\`),
        KEY \`idx_transactions_date\` (\`transaction_date\`),
        CONSTRAINT \`transactions_ibfk_1\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\` (\`id\`),
        CONSTRAINT \`transactions_ibfk_2\` FOREIGN KEY (\`customer_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`transactions_ibfk_3\` FOREIGN KEY (\`admin_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log('Transactions table created');
    
    // Create bookkeeping table
    await connection.query(`
      CREATE TABLE \`bookkeeping\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`transaction_id\` int(11) DEFAULT NULL,
        \`income\` decimal(14,2) DEFAULT 0.00,
        \`expense\` decimal(14,2) DEFAULT 0.00,
        \`profit\` decimal(14,2) DEFAULT 0.00,
        \`recorded_at\` datetime NOT NULL DEFAULT current_timestamp(),
        \`note\` text DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`transaction_id\` (\`transaction_id\`),
        KEY \`idx_bookkeeping_date\` (\`recorded_at\`),
        CONSTRAINT \`bookkeeping_ibfk_1\` FOREIGN KEY (\`transaction_id\`) REFERENCES \`transactions\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log('Bookkeeping table created');
    
    // Create inventory_logs table
    await connection.query(`
      CREATE TABLE \`inventory_logs\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`vehicle_id\` int(11) NOT NULL,
        \`type\` enum('add','remove','update') NOT NULL,
        \`quantity\` int(11) NOT NULL,
        \`description\` text DEFAULT NULL,
        \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
        \`user_id\` int(11) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`user_id\` (\`user_id\`),
        KEY \`idx_inventory_vehicle\` (\`vehicle_id\`),
        CONSTRAINT \`inventory_logs_ibfk_1\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`inventory_logs_ibfk_2\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log('Inventory logs table created');
    
    // Create vehicle_images table
    await connection.query(`
      CREATE TABLE \`vehicle_images\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`vehicle_id\` int(11) NOT NULL,
        \`image_url\` text NOT NULL,
        \`is_main\` tinyint(1) NOT NULL DEFAULT 0,
        \`uploaded_at\` datetime NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`),
        KEY \`vehicle_id\` (\`vehicle_id\`),
        CONSTRAINT \`vehicle_images_ibfk_1\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log('Vehicle images table created');
    
    // Create wishlist table
    await connection.query(`
      CREATE TABLE \`wishlist\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) NOT NULL,
        \`vehicle_id\` int(11) NOT NULL,
        \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uniq_user_vehicle\` (\`user_id\`,\`vehicle_id\`),
        KEY \`vehicle_id\` (\`vehicle_id\`),
        CONSTRAINT \`wishlist_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`wishlist_ibfk_2\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log('Wishlist table created');
    
    console.log('All tables created successfully!');
    
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateSchema();