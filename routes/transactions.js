var auth = require('../utils/auth');
var Transaction = require('../models/transaction');

// Routes for vehicle transactions (customer facing)
module.exports = function(app) {

  // Membuat pesanan baru
  app.post('/api/transactions', auth.requireLogin, function(req, res, next) {
    const { vehicle_id, notes } = req.body;
    
    // Validasi input
    if (!vehicle_id) {
      return res.status(400).json({ error: 'ID kendaraan wajib diisi' });
    }
    
    // Ambil informasi kendaraan untuk mendapatkan harga
    const vehicleQuery = 'SELECT * FROM vehicles WHERE id = ?';
    const db = require('../models/db');
    
    db.query(vehicleQuery, [vehicle_id], function(err, rows) {
      if (err) {
        console.error('Error getting vehicle:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data kendaraan' });
      }
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Kendaraan tidak ditemukan' });
      }
      
      const vehicle = rows[0];
      
      // Pastikan kendaraan masih tersedia
      if (vehicle.stock <= 0 || vehicle.status === 'sold') {
        return res.status(400).json({ error: 'Kendaraan tidak tersedia untuk dipesan' });
      }
      
      // Buat data transaksi
      const transactionData = {
        customer_id: req.user.id, // ID pengguna saat ini
        vehicle_id: vehicle_id,
        price: vehicle.price, // Gunakan harga dari kendaraan
        notes: notes || ''
      };
      
      // Buat transaksi
      Transaction.create(transactionData, function(err, newTransaction) {
        if (err) {
          console.error('Error creating transaction:', err);
          return res.status(500).json({ error: 'Terjadi kesalahan saat membuat pesanan' });
        }
        
        res.status(201).json({ 
          message: 'Pesanan berhasil dibuat', 
          transaction: newTransaction 
        });
      });
    });
  });

  // Mendapatkan daftar pesanan untuk pengguna saat ini
  app.get('/api/transactions', auth.requireLogin, function(req, res, next) {
    const filters = {
      customer_id: req.user.id
    };
    
    Transaction.getAll(filters, function(err, transactions) {
      if (err) {
        console.error('Error getting transactions:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data pesanan' });
      }
      
      res.json(transactions);
    });
  });

  // Mendapatkan detail pesanan berdasarkan ID
  app.get('/api/transactions/:id', auth.requireLogin, function(req, res, next) {
    const transactionId = req.params.id;
    
    // Hanya pengguna yang membuat transaksi yang bisa melihat detailnya
    const query = `
      SELECT t.*, u.name as customer_name, u.email, u.phone, u.address,
             v.brand, v.model, v.year, v.description
      FROM transactions t
      LEFT JOIN users u ON t.customer_id = u.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      WHERE t.id = ? AND t.customer_id = ?
    `;
    
    const db = require('../models/db');
    
    db.query(query, [transactionId, req.user.id], function(err, rows) {
      if (err) {
        console.error('Error getting transaction:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data pesanan' });
      }
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Pesanan tidak ditemukan atau Anda tidak memiliki akses' });
      }
      
      res.json(rows[0]);
    });
  });
};