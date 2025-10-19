require('dotenv').config();
const mysql = require('mysql2');

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'vehicle_sales_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Only add password if it's defined and not empty
if (process.env.DB_PASSWORD !== undefined && process.env.DB_PASSWORD !== '') {
  config.password = process.env.DB_PASSWORD;
}

// Create a connection pool
const pool = mysql.createPool(config);

console.log('Testing database connection with new schema...');

// Test connection by trying to query one of the new tables
pool.query('SELECT 1 + 1 AS solution', (err, results) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    console.log('Make sure MySQL is running and credentials in .env are correct.');
    pool.end();
    return;
  }
  
  console.log('Database connection successful!');
  console.log('Result of test query:', results[0].solution);
  
  // Test if tables exist
  pool.query('SHOW TABLES', (err, tables) => {
    if (err) {
      console.error('Error fetching table list:', err);
      pool.end();
      return;
    }
    
    console.log('\nTables in database:');
    tables.forEach(table => {
      console.log('-', Object.values(table)[0]);
    });
    
    // Check if key tables exist
    const requiredTables = ['users', 'vehicles', 'transactions', 'bookkeeping', 'inventory_logs', 'vehicle_images', 'wishlist'];
    const existingTables = tables.map(t => Object.values(t)[0]);
    
    console.log('\nChecking for required tables:');
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`✓ ${table} table exists`);
      } else {
        console.log(`✗ ${table} table missing`);
      }
    });
    
    // Test inserting a sample user
    const sampleUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password_here', // In real app, this would be bcrypt hash
      role: 'customer',
      phone: '1234567890',
      address: 'Test Address'
    };
    
    const insertUserQuery = `
      INSERT INTO users (name, email, password, role, phone, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    pool.query(insertUserQuery, [
      sampleUser.name,
      sampleUser.email,
      sampleUser.password,
      sampleUser.role,
      sampleUser.phone,
      sampleUser.address
    ], (err, result) => {
      if (err) {
        console.error('\nError inserting test user:', err);
      } else {
        console.log('\n✓ Successfully inserted test user with ID:', result.insertId);
        
        // Clean up: delete the test user
        pool.query('DELETE FROM users WHERE email = ?', [sampleUser.email], (err) => {
          if (err) {
            console.error('Error cleaning up test user:', err);
          } else {
            console.log('✓ Cleaned up test user');
          }
          
          pool.end();
          console.log('\nDatabase test completed!');
        });
      }
    });
  });
});