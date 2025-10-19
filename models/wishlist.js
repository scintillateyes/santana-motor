const db = require('./db');

// Model untuk Wishlist
const Wishlist = {
  // Membuat wishlist baru
  create: (wishlistData, callback) => {
    const {
      user_id, vehicle_id
    } = wishlistData;
    
    // Cek apakah sudah ada di wishlist
    const checkQuery = 'SELECT * FROM wishlist WHERE user_id = ? AND vehicle_id = ?';
    db.query(checkQuery, [user_id, vehicle_id], (err, rows) => {
      if (err) return callback(err);
      
      if (rows.length > 0) {
        // Sudah ada di wishlist
        return callback(null, { message: 'Item already in wishlist' });
      }
      
      const query = `
        INSERT INTO wishlist (user_id, vehicle_id)
        VALUES (?, ?)
      `;
      
      const params = [user_id, vehicle_id];
      
      db.query(query, params, (err, result) => {
        if (err) return callback(err);
        // Get the inserted record with auto-generated ID
        const selectQuery = `
          SELECT w.*, u.name as user_name, v.name as vehicle_name
          FROM wishlist w
          LEFT JOIN users u ON w.user_id = u.id
          LEFT JOIN vehicles v ON w.vehicle_id = v.id
          WHERE w.id = ?
        `;
        db.query(selectQuery, [result.insertId], (err, rows) => {
          if (err) return callback(err);
          callback(null, rows[0]);
        });
      });
    });
  },

  // Mendapatkan semua wishlist
  getAll: (filters = {}, callback) => {
    let query = `
      SELECT w.*, u.name as user_name, v.name as vehicle_name
      FROM wishlist w
      LEFT JOIN users u ON w.user_id = u.id
      LEFT JOIN vehicles v ON w.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    
    // Menambahkan filter jika ada
    if (filters.user_id) {
      query += ' AND w.user_id = ?';
      params.push(filters.user_id);
    }
    
    if (filters.vehicle_id) {
      query += ' AND w.vehicle_id = ?';
      params.push(filters.vehicle_id);
    }
    
    query += ' ORDER BY w.created_at DESC';
    
    db.query(query, params, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  },

  // Mendapatkan wishlist berdasarkan ID
  getById: (id, callback) => {
    const query = `
      SELECT w.*, u.name as user_name, v.name as vehicle_name
      FROM wishlist w
      LEFT JOIN users u ON w.user_id = u.id
      LEFT JOIN vehicles v ON w.vehicle_id = v.id
      WHERE w.id = ?
    `;
    db.query(query, [id], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0]);
    });
  },

  // Menghapus dari wishlist
  delete: (id, callback) => {
    const query = 'DELETE FROM wishlist WHERE id = ?';
    db.query(query, [id], (err, result) => {
      if (err) return callback(err);
      callback(null, { message: 'Wishlist item deleted successfully' });
    });
  },

  // Menghapus dari wishlist berdasarkan user_id dan vehicle_id
  deleteByUserAndVehicle: (user_id, vehicle_id, callback) => {
    const query = 'DELETE FROM wishlist WHERE user_id = ? AND vehicle_id = ?';
    db.query(query, [user_id, vehicle_id], (err, result) => {
      if (err) return callback(err);
      callback(null, { message: 'Wishlist item deleted successfully' });
    });
  }
};

module.exports = Wishlist;