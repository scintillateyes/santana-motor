const db = require('./db');

// Model untuk Bookkeeping
const Bookkeeping = {
  // Membuat catatan buku besar baru
  create: (bookkeepingData, callback) => {
    const {
      transaction_id, income, expense, note
    } = bookkeepingData;
    
    // Hitung profit (income - expense)
    const profit = (income || 0) - (expense || 0);
    
    const query = `
      INSERT INTO bookkeeping (transaction_id, income, expense, profit, note)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
      transaction_id || null, 
      income || 0, 
      expense || 0, 
      profit, 
      note || null
    ];
    
    db.query(query, params, (err, result) => {
      if (err) return callback(err);
      // Get the inserted record with auto-generated ID
      const selectQuery = 'SELECT * FROM bookkeeping WHERE id = ?';
      db.query(selectQuery, [result.insertId], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows[0]);
      });
    });
  },

  // Mendapatkan semua catatan buku besar
  getAll: (filters = {}, callback) => {
    let query = `
      SELECT b.*, t.id as transaction_id, u.name as customer_name, 
             v.name as vehicle_name
      FROM bookkeeping b
      LEFT JOIN transactions t ON b.transaction_id = t.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN users u ON t.customer_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    // Menambahkan filter jika ada
    if (filters.startDate) {
      query += ' AND b.recorded_at >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ' AND b.recorded_at <= ?';
      params.push(filters.endDate);
    }
    
    if (filters.minIncome) {
      query += ' AND b.income >= ?';
      params.push(filters.minIncome);
    }
    
    if (filters.maxIncome) {
      query += ' AND b.income <= ?';
      params.push(filters.maxIncome);
    }
    
    if (filters.minExpense) {
      query += ' AND b.expense >= ?';
      params.push(filters.minExpense);
    }
    
    if (filters.maxExpense) {
      query += ' AND b.expense <= ?';
      params.push(filters.maxExpense);
    }
    
    if (filters.minProfit) {
      query += ' AND b.profit >= ?';
      params.push(filters.minProfit);
    }
    
    if (filters.maxProfit) {
      query += ' AND b.profit <= ?';
      params.push(filters.maxProfit);
    }
    
    query += ' ORDER BY b.recorded_at DESC';
    
    db.query(query, params, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  },

  // Mendapatkan catatan buku besar berdasarkan ID
  getById: (id, callback) => {
    const query = `
      SELECT b.*, t.id as transaction_id, u.name as customer_name, 
             v.name as vehicle_name
      FROM bookkeeping b
      LEFT JOIN transactions t ON b.transaction_id = t.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN users u ON t.customer_id = u.id
      WHERE b.id = ?
    `;
    db.query(query, [id], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0]);
    });
  },

  // Memperbarui catatan buku besar
  update: (id, bookkeepingData, callback) => {
    const {
      transaction_id, income, expense, note
    } = bookkeepingData;
    
    // Hitung profit (income - expense)
    const profit = (income || 0) - (expense || 0);
    
    const query = `
      UPDATE bookkeeping 
      SET transaction_id = ?, income = ?, expense = ?, 
          profit = ?, note = ?, recorded_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [
      transaction_id || null, 
      income || 0, 
      expense || 0, 
      profit, 
      note || null, 
      id
    ];
    
    db.query(query, params, (err, result) => {
      if (err) return callback(err);
      callback(null, { id, ...bookkeepingData, profit });
    });
  },

  // Menghapus catatan buku besar
  delete: (id, callback) => {
    const query = 'DELETE FROM bookkeeping WHERE id = ?';
    db.query(query, [id], (err, result) => {
      if (err) return callback(err);
      callback(null, { message: 'Bookkeeping record deleted successfully' });
    });
  }
};

module.exports = Bookkeeping;