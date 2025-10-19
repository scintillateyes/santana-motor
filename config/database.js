require('dotenv').config();

// Konfigurasi database
module.exports = {
  'connection': {
    'host': process.env.DB_HOST || 'localhost',
    'user': process.env.DB_USER || 'root',
    'waitForConnections': true,
    'connectionLimit': 10,
    'queueLimit': 0
  },
  'database': process.env.DB_NAME || 'vehicle_sales_db'
};

// Only add password if it's defined in .env and not empty
if (process.env.DB_PASSWORD && process.env.DB_PASSWORD !== '') {
  module.exports.connection.password = process.env.DB_PASSWORD;
}
