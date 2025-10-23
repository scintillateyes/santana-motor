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

console.log('Inserting sample data into the database...');

// Sample data to insert
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashed_password_1',
    role: 'admin',
    phone: '1234567890',
    address: '123 Main St, City, Country'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'hashed_password_2',
    role: 'customer',
    phone: '0987654321',
    address: '456 Oak Ave, City, Country'
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    password: 'hashed_password_3',
    role: 'staff',
    phone: '5555555555',
    address: '789 Pine Rd, City, Country'
  }
];

const sampleVehicles = [
  {
    name: 'Toyota Camry',
    brand: 'Toyota',
    model: 'Camry',
    year: 2022,
    color: 'Silver',
    transmission: 'automatic',
    mileage: 15000,
    condition: 'baik',
    purchase_price: 20000.00,
    selling_price: 25000.00,
    stock: 3,
    description: 'Reliable family sedan with excellent fuel efficiency.'
  },
  {
    name: 'Honda Civic',
    brand: 'Honda',
    model: 'Civic',
    year: 2023,
    color: 'White',
    transmission: 'manual',
    mileage: 5000,
    condition: 'baik',
    purchase_price: 18000.00,
    selling_price: 22000.00,
    stock: 2,
    description: 'Compact and efficient vehicle with great handling.'
  },
  {
    name: 'Ford F-150',
    brand: 'Ford',
    model: 'F-150',
    year: 2021,
    color: 'Blue',
    transmission: 'automatic',
    mileage: 25000,
    condition: 'layak',
    purchase_price: 30000.00,
    selling_price: 35000.00,
    stock: 1,
    description: 'Powerful pickup truck for work and recreation.'
  }
];

// Function to insert sample data
async function insertSampleData() {
  const connection = await pool.promise().getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Insert sample users
    console.log('\\nInserting sample users...');
    const insertedUsers = [];
    for (const user of sampleUsers) {
      const query = `
        INSERT INTO users (name, email, password, role, phone, address)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const result = await connection.execute(query, [
        user.name,
        user.email,
        user.password,
        user.role,
        user.phone,
        user.address
      ]);
      const userId = result[0].insertId; // Get the actual insert ID
      insertedUsers.push({ ...user, id: userId });
      console.log(`✓ Inserted user: ${user.name} (ID: ${userId})`);
    }
    
    // Insert sample vehicles
    console.log('\\nInserting sample vehicles...');
    const insertedVehicles = [];
    for (const vehicle of sampleVehicles) {
      const query = `
        INSERT INTO vehicles (name, brand, model, year, color, transmission, mileage, \`condition\`, purchase_price, selling_price, stock, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const result = await connection.execute(query, [
        vehicle.name,
        vehicle.brand,
        vehicle.model,
        vehicle.year,
        vehicle.color,
        vehicle.transmission,
        vehicle.mileage,
        vehicle.condition,
        vehicle.purchase_price,
        vehicle.selling_price,
        vehicle.stock,
        vehicle.description
      ]);
      const vehicleId = result[0].insertId; // Get the actual insert ID
      insertedVehicles.push({ ...vehicle, id: vehicleId });
      console.log(`✓ Inserted vehicle: ${vehicle.name} (ID: ${vehicleId})`);
    }
    
    // Insert sample transactions
    console.log('\\nInserting sample transactions...');
    const transactionQuery = `
      INSERT INTO transactions (vehicle_id, customer_id, admin_id, quantity, unit_price, total_price, payment_method, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const transactionResult1 = await connection.execute(transactionQuery, [
      insertedVehicles[0].id, // vehicle_id - Toyota Camry
      insertedUsers[1].id, // customer_id - Jane Smith
      insertedUsers[0].id, // admin_id - John Doe
      1, // quantity
      25000.00, // unit_price
      25000.00, // total_price
      'cash', // payment_method
      'paid', // status
      'Sale of Toyota Camry'
    ]);
    console.log(`✓ Inserted transaction: ID ${transactionResult1[0].insertId}`);
    
    const transactionResult2 = await connection.execute(transactionQuery, [
      insertedVehicles[1].id, // vehicle_id - Honda Civic
      insertedUsers[1].id, // customer_id - Jane Smith
      insertedUsers[0].id, // admin_id - John Doe
      1, // quantity
      22000.00, // unit_price
      22000.00, // total_price
      'transfer', // payment_method
      'paid', // status
      'Sale of Honda Civic'
    ]);
    console.log(`✓ Inserted transaction: ID ${transactionResult2[0].insertId}`);
    
    // Insert sample bookkeeping entries
    console.log('\\nInserting sample bookkeeping entries...');
    const bookkeepingQuery = `
      INSERT INTO bookkeeping (transaction_id, income, expense, profit, note)
      VALUES (?, ?, ?, ?, ?)
    `;
    const bookkeepingResult1 = await connection.execute(bookkeepingQuery, [
      transactionResult1[0].insertId, // transaction_id
      25000.00, // income
      20000.00, // expense
      5000.00, // profit
      'Profit from Toyota Camry sale'
    ]);
    console.log(`✓ Inserted bookkeeping entry: ID ${bookkeepingResult1[0].insertId}`);
    
    const bookkeepingResult2 = await connection.execute(bookkeepingQuery, [
      transactionResult2[0].insertId, // transaction_id
      22000.00, // income
      18000.00, // expense
      4000.00, // profit
      'Profit from Honda Civic sale'
    ]);
    console.log(`✓ Inserted bookkeeping entry: ID ${bookkeepingResult2[0].insertId}`);
    
    // Insert sample inventory logs
    console.log('\\nInserting sample inventory logs...');
    const inventoryLogQuery = `
      INSERT INTO inventory_logs (vehicle_id, type, quantity, description, user_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const inventoryLogResult1 = await connection.execute(inventoryLogQuery, [
      insertedVehicles[0].id, // vehicle_id - Toyota Camry
      'add', // type
      5, // quantity
      'Initial stock of Toyota Camry',
      insertedUsers[0].id // user_id - John Doe
    ]);
    console.log(`✓ Inserted inventory log: ID ${inventoryLogResult1[0].insertId}`);
    
    const inventoryLogResult2 = await connection.execute(inventoryLogQuery, [
      insertedVehicles[1].id, // vehicle_id - Honda Civic
      'add', // type
      3, // quantity
      'Initial stock of Honda Civic',
      insertedUsers[0].id // user_id - John Doe
    ]);
    console.log(`✓ Inserted inventory log: ID ${inventoryLogResult2[0].insertId}`);
    
    await connection.commit();
    console.log('\\n✓ All sample data inserted successfully!');
    
  } catch (error) {
    console.error('\\nError inserting sample data:', error);
    await connection.rollback();
  } finally {
    connection.release();
    pool.end();
  }
}

// Run the function
insertSampleData();