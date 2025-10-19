var auth = require('../utils/auth');
var Transaction = require('../models/transaction');

// Routes for transaction management (admin only)
module.exports = function(app) {

  // Mendapatkan semua transaksi (dengan filter opsional)
  app.get('/api/admin/transactions', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    // Ambil parameter filter dari query
    const filters = {
      customer_id: req.query.customer_id,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    Transaction.getAll(filters, function(err, transactions) {
      if (err) {
        console.error('Error getting transactions:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data transaksi' });
      }

      res.json(transactions);
    });
  });

  // Mendapatkan detail transaksi berdasarkan ID
  app.get('/api/admin/transactions/:id', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    const transactionId = req.params.id;

    Transaction.getById(transactionId, function(err, transaction) {
      if (err) {
        console.error('Error getting transaction:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data transaksi' });
      }

      if (!transaction) {
        return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
      }

      res.json(transaction);
    });
  });

  // Memperbarui status transaksi
  app.put('/api/admin/transactions/:id/status', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    const transactionId = req.params.id;
    const { status } = req.body;

    // Validasi status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid. Pilihan: pending, confirmed, completed, cancelled' });
    }

    Transaction.updateStatus(transactionId, status, function(err, updatedTransaction) {
      if (err) {
        console.error('Error updating transaction status:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui status transaksi' });
      }

      res.json({ 
        message: 'Status transaksi berhasil diperbarui', 
        transaction: updatedTransaction 
      });
    });
  });

  // Menghapus transaksi
  app.delete('/api/admin/transactions/:id', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    const transactionId = req.params.id;

    Transaction.delete(transactionId, function(err, result) {
      if (err) {
        console.error('Error deleting transaction:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat menghapus transaksi' });
      }

      res.json(result);
    });
  });
};