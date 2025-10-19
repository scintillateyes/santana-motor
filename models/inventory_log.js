const db = require('./db');

// Model untuk Inventory Logs
const InventoryLog = {
  // Membuat log inventaris baru
  create: (logData, callback) => {
    const {
      vehicle_id, type, quantity, description, user_id
    } = logData;
    
    const query = `
      INSERT INTO inventory_logs (vehicle_id, type, quantity, description, user_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
      vehicle_id, 
      type, 
      quantity, 
      description || null, 
      user_id || null
    ];
    
    db.query(query, params, (err, result) => {
      if (err) return callback(err);
      // Get the inserted record with auto-generated ID
      const selectQuery = 'SELECT * FROM inventory_logs WHERE id = ?';
      db.query(selectQuery, [result.insertId], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows[0]);
      });
    });
  },

  // Mendapatkan semua log inventaris
  getAll: (filters = {}, callback) => {
    let query = `
      SELECT il.*, u.name as user_name, v.name as vehicle_name
      FROM inventory_logs il
      LEFT JOIN users u ON il.user_id = u.id
      LEFT JOIN vehicles v ON il.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    
    // Menambahkan filter jika ada
    if (filters.vehicle_id) {
      query += ' AND il.vehicle_id = ?';
      params.push(filters.vehicle_id);
    }
    
    if (filters.user_id) {
      query += ' AND il.user_id = ?';
      params.push(filters.user_id);
    }
    
    if (filters.type) {
      query += ' AND il.type = ?';
      params.push(filters.type);
    }
    
    if (filters.startDate) {
      query += ' AND il.created_at >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ' AND il.created_at <= ?';
      params.push(filters.endDate);
    }
    
    query += ' ORDER BY il.created_at DESC';
    
    db.query(query, params, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  },

  // Mendapatkan log inventaris berdasarkan ID
  getById: (id, callback) => {
    const query = `
      SELECT il.*, u.name as user_name, v.name as vehicle_name
      FROM inventory_logs il
      LEFT JOIN users u ON il.user_id = u.id
      LEFT JOIN vehicles v ON il.vehicle_id = v.id
      WHERE il.id = ?
    `;
    db.query(query, [id], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0]);
    });
  },

  // Menghapus log inventaris
  delete: (id, callback) => {
    const query = 'DELETE FROM inventory_logs WHERE id = ?';
    db.query(query, [id], (err, result) => {
      if (err) return callback(err);
      callback(null, { message: 'Inventory log deleted successfully' });
    });
  }
};

module.exports = InventoryLog;