const db = require('./db');

// Model untuk Transaksi (Transactions)
const Transaction = {
  // Membuat transaksi baru
  create: (transactionData, callback) => {
    const {
      vehicle_id, customer_id, admin_id, quantity, unit_price, 
      total_price, payment_method, notes
    } = transactionData;
    
    // Default values
    const q = quantity || 1;
    const method = payment_method || 'cash';
    
    // Mulai transaksi database
    db.getConnection((err, conn) => {
      if (err) return callback(err);
      
      conn.beginTransaction((err) => {
        if (err) {
          conn.release();
          return callback(err);
        }
        
        // Insert transaksi
        const insertQuery = `
          INSERT INTO transactions (vehicle_id, customer_id, admin_id, quantity, 
          unit_price, total_price, payment_method, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        conn.query(insertQuery, [vehicle_id, customer_id, admin_id, q, 
          unit_price, total_price, method, notes], (err, result) => {
          if (err) {
            conn.rollback(() => {
              conn.release();
            });
            return callback(err);
          }
          
          const transactionId = result.insertId;
          
          // Update stok kendaraan
          const updateStockQuery = `
            UPDATE vehicles 
            SET stock = stock - ? 
            WHERE id = ?
          `;
          
          conn.query(updateStockQuery, [q, vehicle_id], (err, result) => {
            if (err) {
              conn.rollback(() => {
                conn.release();
              });
              return callback(err);
            }
            
            // Create bookkeeping record
            const bookkeepingQuery = `
              INSERT INTO bookkeeping (transaction_id, income, note)
              VALUES (?, ?, ?)
            `;
            
            conn.query(bookkeepingQuery, [transactionId, total_price, `Sale of vehicle ID ${vehicle_id}`], (err, result) => {
              if (err) {
                conn.rollback(() => {
                  conn.release();
                });
                return callback(err);
              }
              
              // Create inventory log
              const inventoryLogQuery = `
                INSERT INTO inventory_logs (vehicle_id, type, quantity, description, user_id)
                VALUES (?, 'remove', ?, ?, ?)
              `;
              
              conn.query(inventoryLogQuery, [vehicle_id, q, `Sold ${q} units`, admin_id || customer_id], (err, result) => {
                if (err) {
                  conn.rollback(() => {
                    conn.release();
                  });
                  return callback(err);
                }
                
                conn.commit((err) => {
                  if (err) {
                    conn.rollback(() => {
                      conn.release();
                    });
                    return callback(err);
                  }
                  
                  conn.release();
                  
                  // Get the inserted transaction
                  const selectQuery = `
                    SELECT t.*, u.name as customer_name, v.name as vehicle_name
                    FROM transactions t
                    LEFT JOIN users u ON t.customer_id = u.id
                    LEFT JOIN vehicles v ON t.vehicle_id = v.id
                    WHERE t.id = ?
                  `;
                  
                  db.query(selectQuery, [transactionId], (err, rows) => {
                    if (err) return callback(err);
                    callback(null, rows[0]);
                  });
                });
              });
            });
          });
        });
      });
    });
  },

  // Mendapatkan semua transaksi
  getAll: (filters = {}, callback) => {
    let query = `
      SELECT t.*, u.name as customer_name, v.name as vehicle_name 
      FROM transactions t
      LEFT JOIN users u ON t.customer_id = u.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    
    // Menambahkan filter jika ada
    if (filters.customer_id) {
      query += ' AND t.customer_id = ?';
      params.push(filters.customer_id);
    }
    
    if (filters.vehicle_id) {
      query += ' AND t.vehicle_id = ?';
      params.push(filters.vehicle_id);
    }
    
    if (filters.admin_id) {
      query += ' AND t.admin_id = ?';
      params.push(filters.admin_id);
    }
    
    if (filters.status) {
      query += ' AND t.status = ?';
      params.push(filters.status);
    }
    
    if (filters.payment_method) {
      query += ' AND t.payment_method = ?';
      params.push(filters.payment_method);
    }
    
    if (filters.startDate) {
      query += ' AND t.transaction_date >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ' AND t.transaction_date <= ?';
      params.push(filters.endDate);
    }
    
    query += ' ORDER BY t.transaction_date DESC';
    
    db.query(query, params, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  },

  // Mendapatkan transaksi berdasarkan ID
  getById: (id, callback) => {
    const query = `
      SELECT t.*, u.name as customer_name, u.email, u.phone, u.address,
             v.name as vehicle_name, v.brand, v.model, v.year, v.description
      FROM transactions t
      LEFT JOIN users u ON t.customer_id = u.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      WHERE t.id = ?
    `;
    db.query(query, [id], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0]);
    });
  },

  // Memperbarui status transaksi
  updateStatus: (id, status, callback) => {
    const query = 'UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.query(query, [status, id], (err, result) => {
      if (err) return callback(err);
      callback(null, { id, status });
    });
  },

  // Menghapus transaksi
  delete: (id, callback) => {
    const query = 'DELETE FROM transactions WHERE id = ?';
    db.query(query, [id], (err, result) => {
      if (err) return callback(err);
      callback(null, { message: 'Transaction deleted successfully' });
    });
  }
};

module.exports = Transaction;