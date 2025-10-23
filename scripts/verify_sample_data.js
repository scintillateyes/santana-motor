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

console.log('Verifying sample data in the database...\\n');

// Function to verify data
async function verifySampleData() {
  const connection = await pool.promise().getConnection();
  
  try {
    // Query users
    console.log('Users in the database:');
    const [users] = await connection.execute('SELECT id, name, email, role FROM users');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    console.log('\\nVehicles in the database:');
    const [vehicles] = await connection.execute('SELECT id, name, brand, year, selling_price FROM vehicles');
    vehicles.forEach(vehicle => {
      console.log(`- ID: ${vehicle.id}, Name: ${vehicle.name}, Brand: ${vehicle.brand}, Year: ${vehicle.year}, Price: $${vehicle.selling_price}`);
    });
    
    console.log('\\nTransactions in the database:');
    const [transactions] = await connection.execute('SELECT id, vehicle_id, customer_id, admin_id, total_price, status FROM transactions');
    transactions.forEach(transaction => {
      console.log(`- ID: ${transaction.id}, Vehicle ID: ${transaction.vehicle_id}, Customer ID: ${transaction.customer_id}, Admin ID: ${transaction.admin_id}, Total: $${transaction.total_price}, Status: ${transaction.status}`);
    });
    
    console.log('\\nBookkeeping entries in the database:');
    const [bookkeeping] = await connection.execute('SELECT id, transaction_id, income, expense, profit, note FROM bookkeeping');
    bookkeeping.forEach(entry => {
      console.log(`- ID: ${entry.id}, Transaction ID: ${entry.transaction_id}, Income: $${entry.income}, Expense: $${entry.expense}, Profit: $${entry.profit}, Note: ${entry.note}`);
    });
    
    console.log('\\nInventory logs in the database:');
    const [inventoryLogs] = await connection.execute('SELECT id, vehicle_id, type, quantity, description FROM inventory_logs');
    inventoryLogs.forEach(log => {
      console.log(`- ID: ${log.id}, Vehicle ID: ${log.vehicle_id}, Type: ${log.type}, Quantity: ${log.quantity}, Description: ${log.description}`);
    });
    
  } catch (error) {
    console.error('Error verifying sample data:', error);
  } finally {
    connection.release();
    pool.end();
  }
}

// Run the function
verifySampleData();