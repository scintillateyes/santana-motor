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

console.log('Database Summary for Santana Motor Sales Reports:\\n');

// Function to get database summary
async function getDatabaseSummary() {
  const connection = await pool.promise().getConnection();
  
  try {
    // Count records in each table
    const tables = ['users', 'vehicles', 'transactions', 'bookkeeping', 'inventory_logs'];
    
    for (const table of tables) {
      const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table.charAt(0).toUpperCase() + table.slice(1)}: ${result[0].count} records`);
    }
    
    console.log('\\nSales Summary:');
    // Total sales (paid transactions)
    const [totalSales] = await connection.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(total_price) as total_revenue,
        AVG(total_price) as average_sale,
        MIN(transaction_date) as first_sale,
        MAX(transaction_date) as last_sale
      FROM transactions 
      WHERE status = 'paid'
    `);
    
    console.log(`Total Paid Transactions: ${totalSales[0].total_transactions}`);
    console.log(`Total Revenue: $${totalSales[0].total_revenue ? parseFloat(totalSales[0].total_revenue).toFixed(2) : '0.00'}`);
    console.log(`Average Sale Value: $${totalSales[0].average_sale ? parseFloat(totalSales[0].average_sale).toFixed(2) : '0.00'}`);
    console.log(`First Sale Date: ${totalSales[0].first_sale ? totalSales[0].first_sale.toISOString().split('T')[0] : 'N/A'}`);
    console.log(`Last Sale Date: ${totalSales[0].last_sale ? totalSales[0].last_sale.toISOString().split('T')[0] : 'N/A'}`);
    
    console.log('\\nProfit Summary:');
    // Total profit
    const [totalProfit] = await connection.execute(`
      SELECT 
        COUNT(*) as total_entries,
        SUM(income) as total_income,
        SUM(expense) as total_expense,
        SUM(profit) as total_profit
      FROM bookkeeping
    `);
    
    console.log(`Bookkeeping Entries: ${totalProfit[0].total_entries}`);
    console.log(`Total Income: $${totalProfit[0].total_income ? parseFloat(totalProfit[0].total_income).toFixed(2) : '0.00'}`);
    console.log(`Total Expenses: $${totalProfit[0].total_expense ? parseFloat(totalProfit[0].total_expense).toFixed(2) : '0.00'}`);
    console.log(`Total Profit: $${totalProfit[0].total_profit ? parseFloat(totalProfit[0].total_profit).toFixed(2) : '0.00'}`);
    
    console.log('\\nTop Selling Vehicles:');
    // Top selling vehicles
    const [topVehicles] = await connection.execute(`
      SELECT 
        v.name,
        COUNT(t.id) as sales_count,
        SUM(t.total_price) as total_revenue
      FROM vehicles v
      JOIN transactions t ON v.id = t.vehicle_id
      WHERE t.status = 'paid'
      GROUP BY v.id
      ORDER BY sales_count DESC
      LIMIT 5
    `);
    
    topVehicles.forEach((vehicle, index) => {
      console.log(`${index + 1}. ${vehicle.name}: ${vehicle.sales_count} sales, $${parseFloat(vehicle.total_revenue).toFixed(2)} revenue`);
    });
    
    console.log('\\nCustomer Summary:');
    // Customer stats
    const [customerStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_customers,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
        (SELECT COUNT(*) FROM users WHERE role = 'staff') as total_staff
      FROM users 
      WHERE role = 'customer'
    `);
    
    console.log(`Total Customers: ${customerStats[0].total_customers}`);
    console.log(`Total Admins: ${customerStats[0].total_admins}`);
    console.log(`Total Staff: ${customerStats[0].total_staff}`);
    
  } catch (error) {
    console.error('Error getting database summary:', error);
  } finally {
    connection.release();
    pool.end();
  }
}

// Run the function
getDatabaseSummary();