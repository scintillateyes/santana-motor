var auth = require('../utils/auth');
var Vehicle = require('../models/vehicle');
var Transaction = require('../models/transaction');
var User = require('../models/user');

// Routes for admin dashboard and reports
module.exports = function(app) {

  // Dashboard admin
  app.get('/admin', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    // Ambil statistik dasar untuk ditampilkan di dashboard
    const db = require('../models/db');
    
    // Query untuk mendapatkan jumlah kendaraan
    const vehicleCountQuery = 'SELECT COUNT(*) as count FROM vehicles';
    
    // Query untuk mendapatkan jumlah transaksi
    const transactionCountQuery = 'SELECT COUNT(*) as count FROM transactions';
    
    // Query untuk mendapatkan jumlah pelanggan
    const customerCountQuery = 'SELECT COUNT(*) as count FROM users WHERE role = "customer"';
    
    // Query untuk mendapatkan jumlah transaksi terbaru
    const recentTransactionsQuery = `
      SELECT t.*, u.name as customer_name, v.brand, v.model 
      FROM transactions t
      LEFT JOIN users u ON t.customer_id = u.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      ORDER BY t.transaction_date DESC
      LIMIT 5
    `;
    
    // Eksekusi semua query secara paralel
    Promise.all([
      new Promise((resolve, reject) => {
        db.query(vehicleCountQuery, [], (err, result) => {
          if (err) reject(err);
          else resolve(result[0].count);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(transactionCountQuery, [], (err, result) => {
          if (err) reject(err);
          else resolve(result[0].count);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(customerCountQuery, [], (err, result) => {
          if (err) reject(err);
          else resolve(result[0].count);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(recentTransactionsQuery, [], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      })
    ])
    .then(([vehicleCount, transactionCount, customerCount, recentTransactions]) => {
      res.render('admin', { 
        user: req.user, 
        vehicleCount,
        transactionCount,
        customerCount,
        recentTransactions
      });
    })
    .catch(err => {
      console.error('Error getting dashboard stats:', err);
      res.render('admin', { 
        user: req.user, 
        vehicleCount: 0,
        transactionCount: 0,
        customerCount: 0,
        recentTransactions: [],
        error: 'Terjadi kesalahan saat mengambil data dashboard'
      });
    });
  });

  // Route untuk laporan penjualan
  app.get('/api/admin/reports/sales', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    // Parameter filter opsional
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    const status = req.query.status || null;

    let query = `
      SELECT 
        t.id,
        t.transaction_date,
        t.price,
        t.status,
        u.name as customer_name,
        u.email as customer_email,
        v.brand,
        v.model,
        v.year
      FROM transactions t
      LEFT JOIN users u ON t.customer_id = u.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
    `;
    
    const params = [];
    let whereClause = ' WHERE 1=1 ';
    
    if (startDate) {
      whereClause += ' AND t.transaction_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      whereClause += ' AND t.transaction_date <= ?';
      params.push(endDate);
    }
    
    if (status) {
      whereClause += ' AND t.status = ?';
      params.push(status);
    }
    
    query += whereClause + ' ORDER BY t.transaction_date DESC';
    
    const db = require('../models/db');
    
    db.query(query, params, function(err, rows) {
      if (err) {
        console.error('Error getting sales reports:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil laporan penjualan' });
      }
      
      res.json(rows);
    });
  });

  // Route untuk ringkasan penjualan (total pendapatan, jumlah transaksi, dll)
  app.get('/api/admin/reports/sales/summary', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    // Parameter filter opsional
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    let query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_transactions,
        SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'completed' THEN price ELSE NULL END) as average_transaction_value
      FROM transactions
      WHERE 1=1
    `;
    
    const params = [];
    
    if (startDate) {
      query += ' AND transaction_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND transaction_date <= ?';
      params.push(endDate);
    }
    
    const db = require('../models/db');
    
    db.query(query, params, function(err, rows) {
      if (err) {
        console.error('Error getting sales summary:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil ringkasan penjualan' });
      }
      
      res.json(rows[0]);
    });
  });

  // Route untuk data untuk chart statistik (jumlah transaksi per bulan)
  app.get('/api/admin/reports/sales/chart', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    // Ambil data jumlah transaksi dan pendapatan per bulan
    const query = `
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        COUNT(*) as transaction_count,
        SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END) as revenue
      FROM transactions
      WHERE status = 'completed'
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month
    `;
    
    const db = require('../models/db');
    
    db.query(query, [], function(err, rows) {
      if (err) {
        console.error('Error getting sales chart data:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data chart penjualan' });
      }
      
      res.json(rows);
    });
  });
};