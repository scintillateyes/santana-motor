var auth = require('../utils/auth');

// Routes for sales report page (admin only)
module.exports = function(app) {

  // Halaman laporan penjualan
  app.get('/admin/reports/sales', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    res.render('sales_report');
  });
};