var auth = require('../utils/auth');

// Routes for admin HTML pages
module.exports = function(app) {
  // Admin customers page
  app.get('/admin/customers', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    res.render('admin_customers', { 
      title: 'Kelola Pelanggan',
      user: req.user 
    });
  });

  // Admin vehicles page
  app.get('/admin/vehicles', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    res.render('admin_vehicles', { 
      title: 'Kelola Kendaraan',
      user: req.user 
    });
  });

  // Admin transactions page
  app.get('/admin/transactions', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    res.render('admin_transactions', { 
      title: 'Kelola Transaksi',
      user: req.user 
    });
  });
};