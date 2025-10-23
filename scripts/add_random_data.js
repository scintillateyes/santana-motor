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

console.log('Adding random data to fill the sales reports...');

// Arrays for generating random data
const firstNames = ['Michael', 'Sarah', 'David', 'Emily', 'James', 'Olivia', 'Robert', 'Sophia', 'William', 'Ava', 'Thomas', 'Isabella', 'Christopher', 'Mia', 'Charles', 'Charlotte', 'Daniel', 'Amelia', 'Matthew', 'Harper'];
const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];
const brands = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi', 'Hyundai', 'Kia', 'Volkswagen', 'Volvo', 'Lexus', 'Acura', 'Mazda', 'Subaru', 'Jeep', 'Tesla', 'Porsche', 'Ferrari'];
const models = ['Sedan', 'SUV', 'Truck', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Crossover', 'Sport'];
const colors = ['Red', 'Blue', 'Black', 'White', 'Silver', 'Gray', 'Green', 'Yellow', 'Orange', 'Purple', 'Brown', 'Pink'];
const conditions = ['baik', 'layak', 'butuh perbaikan'];

// Function to generate random data
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Function to insert random data
async function insertRandomData() {
  const connection = await pool.promise().getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('\\nAdding random vehicles...');
    // Add random vehicles
    for (let i = 0; i < 15; i++) {
      const brand = getRandomElement(brands);
      const model = getRandomElement(models);
      const vehicleName = `${brand} ${model}`;
      const year = getRandomInt(2015, 2024);
      const color = getRandomElement(colors);
      const transmission = Math.random() > 0.5 ? 'automatic' : 'manual';
      const mileage = getRandomInt(0, 100000);
      const condition = getRandomElement(conditions);
      const purchasePrice = getRandomFloat(10000, 40000);
      const sellingPrice = purchasePrice + getRandomFloat(2000, 10000);
      const stock = getRandomInt(1, 5);
      const description = `This is a ${year} ${vehicleName} in ${condition} condition.`;
      
      const vehicleQuery = `
        INSERT INTO vehicles (name, brand, model, year, color, transmission, mileage, \`condition\`, purchase_price, selling_price, stock, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await connection.execute(vehicleQuery, [
        vehicleName,
        brand,
        model,
        year,
        color,
        transmission,
        mileage,
        condition,
        purchasePrice,
        sellingPrice,
        stock,
        description
      ]);
      
      console.log(`✓ Added vehicle: ${vehicleName} (ID: ${result[0].insertId})`);
    }
    
    console.log('\\nAdding random customers...');
    // Add random customers
    const customerIds = [];
    for (let i = 0; i < 10; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 999)}@example.com`;
      const password = 'hashed_password';
      const role = 'customer';
      const phone = `555-${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`;
      const address = `${getRandomInt(100, 9999)} ${getRandomElement(['Main', 'Oak', 'Pine', 'Elm', 'Maple', 'Cedar', 'Birch', 'Spruce'])} St, ${getRandomElement(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'])}`;
      
      const userQuery = `
        INSERT INTO users (name, email, password, role, phone, address)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const result = await connection.execute(userQuery, [
        name,
        email,
        password,
        role,
        phone,
        address
      ]);
      
      customerIds.push(result[0].insertId);
      console.log(`✓ Added customer: ${name} (ID: ${result[0].insertId})`);
    }
    
    console.log('\\nAdding random transactions...');
    // Add random transactions
    for (let i = 0; i < 20; i++) {
      // Get a random vehicle (either from our new ones or existing ones)
      const vehicleResult = await connection.execute('SELECT id, selling_price, purchase_price FROM vehicles ORDER BY RAND() LIMIT 1');
      const vehicle = vehicleResult[0][0];
      
      // Get a random customer
      const customerResult = await connection.execute('SELECT id FROM users WHERE role = "customer" ORDER BY RAND() LIMIT 1');
      const customer = customerResult[0][0];
      
      // Get a random admin
      const adminResult = await connection.execute('SELECT id FROM users WHERE role = "admin" ORDER BY RAND() LIMIT 1');
      const admin = adminResult[0][0];
      
      const quantity = 1;
      const unitPrice = parseFloat(vehicle.selling_price);
      const totalPrice = unitPrice * quantity;
      const paymentMethods = ['cash', 'transfer', 'credit'];
      const paymentMethod = getRandomElement(paymentMethods);
      const statuses = ['pending', 'paid', 'cancelled'];
      const status = getRandomElement(statuses);
      const notes = `Random transaction for ${getRandomElement(['sale', 'rental', 'lease', 'trade-in'])}`;
      
      const transactionQuery = `
        INSERT INTO transactions (vehicle_id, customer_id, admin_id, quantity, unit_price, total_price, payment_method, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await connection.execute(transactionQuery, [
        vehicle.id,
        customer.id,
        admin.id,
        quantity,
        unitPrice,
        totalPrice,
        paymentMethod,
        status,
        notes
      ]);
      
      console.log(`✓ Added transaction: ID ${result[0].insertId} - Vehicle ${vehicle.id}, Customer ${customer.id}, Total: $${totalPrice}`);
      
      // Add corresponding bookkeeping entry
      if (status === 'paid') {
        const profit = parseFloat(vehicle.selling_price - vehicle.purchase_price);
        const bookkeepingQuery = `
          INSERT INTO bookkeeping (transaction_id, income, expense, profit, note)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        const bkResult = await connection.execute(bookkeepingQuery, [
          result[0].insertId,
          unitPrice,
          parseFloat(vehicle.purchase_price),
          profit,
          `Profit from random transaction ${result[0].insertId}`
        ]);
        
        console.log(`✓ Added bookkeeping entry: ID ${bkResult[0].insertId} - Profit: $${profit}`);
      }
    }
    
    console.log('\\nAdding random inventory logs...');
    // Add random inventory logs
    for (let i = 0; i < 10; i++) {
      const vehicleResult = await connection.execute('SELECT id FROM vehicles ORDER BY RAND() LIMIT 1');
      const vehicle = vehicleResult[0][0];
      
      const adminResult = await connection.execute('SELECT id FROM users WHERE role = "admin" OR role = "staff" ORDER BY RAND() LIMIT 1');
      const admin = adminResult[0][0];
      
      const types = ['add', 'remove', 'update'];
      const type = getRandomElement(types);
      const quantity = getRandomInt(1, 10);
      const description = `Random inventory ${type} for ${getRandomElement(['stock adjustment', 'delivery', 'service', 'transfer'])}`;
      
      const inventoryLogQuery = `
        INSERT INTO inventory_logs (vehicle_id, type, quantity, description, user_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const result = await connection.execute(inventoryLogQuery, [
        vehicle.id,
        type,
        quantity,
        description,
        admin.id
      ]);
      
      console.log(`✓ Added inventory log: ID ${result[0].insertId} - ${type} ${quantity} units for vehicle ${vehicle.id}`);
    }
    
    await connection.commit();
    console.log('\\n✓ All random data added successfully!');
    
  } catch (error) {
    console.error('\\nError adding random data:', error);
    await connection.rollback();
  } finally {
    connection.release();
    pool.end();
  }
}

// Run the function
insertRandomData();