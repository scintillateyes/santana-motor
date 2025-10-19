const db = require('./db');

// Model untuk Gambar Kendaraan (Vehicle Images)
const VehicleImage = {
  // Membuat entri gambar kendaraan baru
  create: (imageData, callback) => {
    const {
      vehicle_id, image_url, is_primary
    } = imageData;
    
    // Jika gambar ini adalah gambar utama, pastikan tidak ada gambar utama lain untuk kendaraan ini
    if (is_primary) {
      // Hapus status primary dari gambar-gambar sebelumnya untuk kendaraan ini
      const resetPrimaryQuery = 'UPDATE vehicle_images SET is_primary = 0 WHERE vehicle_id = ?';
      db.query(resetPrimaryQuery, [vehicle_id], (err, result) => {
        if (err) return callback(err);
        
        // Insert gambar baru sebagai gambar utama
        const query = `
          INSERT INTO vehicle_images (vehicle_id, image_url, is_primary)
          VALUES (?, ?, ?)
        `;
        
        db.query(query, [vehicle_id, image_url, is_primary], (err, result) => {
          if (err) return callback(err);
          // Get the inserted record with auto-generated ID
          const selectQuery = 'SELECT * FROM vehicle_images WHERE id = ?';
          db.query(selectQuery, [result.insertId], (err, rows) => {
            if (err) return callback(err);
            callback(null, rows[0]);
          });
        });
      });
    } else {
      // Insert gambar biasa
      const query = `
        INSERT INTO vehicle_images (vehicle_id, image_url, is_primary)
        VALUES (?, ?, ?)
      `;
      
      db.query(query, [vehicle_id, image_url, is_primary], (err, result) => {
        if (err) return callback(err);
        // Get the inserted record with auto-generated ID
        const selectQuery = 'SELECT * FROM vehicle_images WHERE id = ?';
        db.query(selectQuery, [result.insertId], (err, rows) => {
          if (err) return callback(err);
          callback(null, rows[0]);
        });
      });
    }
  },

  // Mendapatkan semua gambar untuk kendaraan tertentu
  getByVehicleId: (vehicle_id, callback) => {
    const query = 'SELECT * FROM vehicle_images WHERE vehicle_id = ? ORDER BY is_primary DESC, created_at ASC';
    db.query(query, [vehicle_id], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  },

  // Mendapatkan gambar utama untuk kendaraan tertentu
  getPrimaryByVehicleId: (vehicle_id, callback) => {
    const query = 'SELECT * FROM vehicle_images WHERE vehicle_id = ? AND is_primary = TRUE LIMIT 1';
    db.query(query, [vehicle_id], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0]);
    });
  },

  // Menghapus gambar berdasarkan ID
  delete: (id, callback) => {
    const query = 'DELETE FROM vehicle_images WHERE id = ?';
    db.query(query, [id], (err, result) => {
      if (err) return callback(err);
      callback(null, { message: 'Vehicle image deleted successfully' });
    });
  },

  // Menghapus semua gambar untuk kendaraan tertentu
  deleteByVehicleId: (vehicle_id, callback) => {
    const query = 'DELETE FROM vehicle_images WHERE vehicle_id = ?';
    db.query(query, [vehicle_id], (err, result) => {
      if (err) return callback(err);
      callback(null, { message: 'All vehicle images deleted successfully' });
    });
  }
};

module.exports = VehicleImage;