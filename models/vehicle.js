const db = require('./db');

// Model untuk Kendaraan (Vehicles)
const Vehicle = {
  // Membuat kendaraan baru
  create: (vehicleData, callback) => {
    const {
      name, brand, model, year, color, transmission, 
      mileage, condition, purchase_price, selling_price, 
      stock, description, image_url
    } = vehicleData;
    
    const query = `
      INSERT INTO vehicles (name, brand, model, year, color, transmission,
      mileage, condition, purchase_price, selling_price, 
      stock, description, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      name, brand, model, year, color, transmission,
      mileage, condition, purchase_price, selling_price, 
      stock, description, image_url
    ];
    
    db.query(query, params, (err, result) => {
      if (err) return callback(err);
      // Get the inserted vehicle with auto-generated ID
      const selectQuery = 'SELECT * FROM vehicles WHERE id = ?';
      db.query(selectQuery, [result.insertId], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows[0]);
      });
    });
  },

  // Mendapatkan semua kendaraan
  getAll: (filters = {}, callback) => {
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];
    
    // Menambahkan filter jika ada
    if (filters.brand) {
      query += ' AND brand = ?';
      params.push(filters.brand);
    }
    
    if (filters.minYear) {
      query += ' AND year >= ?';
      params.push(filters.minYear);
    }
    
    if (filters.maxYear) {
      query += ' AND year <= ?';
      params.push(filters.maxYear);
    }
    
    if (filters.minPurchasePrice) {
      query += ' AND purchase_price >= ?';
      params.push(filters.minPurchasePrice);
    }
    
    if (filters.maxPurchasePrice) {
      query += ' AND purchase_price <= ?';
      params.push(filters.maxPurchasePrice);
    }
    
    if (filters.minSellingPrice) {
      query += ' AND selling_price >= ?';
      params.push(filters.minSellingPrice);
    }
    
    if (filters.maxSellingPrice) {
      query += ' AND selling_price <= ?';
      params.push(filters.maxSellingPrice);
    }
    
    if (filters.transmission) {
      query += ' AND transmission = ?';
      params.push(filters.transmission);
    }
    
    if (filters.condition) {
      query += ' AND condition = ?';
      params.push(filters.condition);
    }
    
    // Filter untuk kendaraan yang tersedia (stock > 0) jika available filter diaktifkan
    if (filters.available) {
      query += ' AND stock > 0';
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.query(query, params, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  },

  // Mendapatkan kendaraan berdasarkan ID
  getById: (id, callback) => {
    const query = 'SELECT * FROM vehicles WHERE id = ?';
    db.query(query, [id], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0]);
    });
  },

  // Memperbarui data kendaraan
  update: (id, vehicleData, callback) => {
    const {
      name, brand, model, year, color, transmission,
      mileage, condition, purchase_price, selling_price,
      stock, description, image_url
    } = vehicleData;
    
    const query = `
      UPDATE vehicles 
      SET name = ?, brand = ?, model = ?, year = ?, color = ?, 
          transmission = ?, mileage = ?, condition = ?, 
          purchase_price = ?, selling_price = ?, stock = ?, 
          description = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [
      name, brand, model, year, color, transmission,
      mileage, condition, purchase_price, selling_price,
      stock, description, image_url, id
    ];
    
    db.query(query, params, (err, result) => {
      if (err) return callback(err);
      callback(null, { id, ...vehicleData });
    });
  },

  // Menghapus kendaraan
  delete: (id, callback) => {
    const query = 'DELETE FROM vehicles WHERE id = ?';
    db.query(query, [id], (err, result) => {
      if (err) return callback(err);
      callback(null, { message: 'Vehicle deleted successfully' });
    });
  }
};

module.exports = Vehicle;