var auth = require('../utils/auth');
var User = require('../models/user');

// Routes for customer management (admin only)
module.exports = function(app) {

  // Mendapatkan semua pelanggan
  app.get('/api/admin/customers', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    // Query untuk mendapatkan semua pengguna dengan role customer
    const query = `
      SELECT id, email, name, phone, address, role, created_at 
      FROM users 
      WHERE role = 'customer' 
      ORDER BY created_at DESC
    `;
    
    const db = require('../models/db');
    
    db.query(query, [], function(err, rows) {
      if (err) {
        console.error('Error getting customers:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data pelanggan' });
      }
      
      res.json(rows);
    });
  });

  // Mendapatkan detail pelanggan berdasarkan ID
  app.get('/api/admin/customers/:id', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    const userId = req.params.id;

    User.getUserById(userId, function(err, user) {
      if (err) {
        console.error('Error getting user:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data pelanggan' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
      }
      
      // Pastikan hanya pelanggan yang dikembalikan
      if (user.role !== 'customer') {
        return res.status(404).json({ error: 'Pengguna bukan pelanggan' });
      }

      res.json(user);
    });
  });

  // Memperbarui data pelanggan
  app.put('/api/admin/customers/:id', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    const userId = req.params.id;
    const { name, phone, address } = req.body;

    // Validasi input
    if (!name) {
      return res.status(400).json({ error: 'Nama wajib diisi' });
    }

    const userData = {
      name: name,
      phone: phone || null,
      address: address || null
    };

    User.updateUserProfile(userId, userData, function(err, updatedUser) {
      if (err) {
        console.error('Error updating customer:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui data pelanggan' });
      }
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
      }

      res.json({ 
        message: 'Data pelanggan berhasil diperbarui', 
        user: updatedUser 
      });
    });
  });

  // Menghapus pelanggan
  app.delete('/api/admin/customers/:id', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    const userId = req.params.id;
    
    // Cek apakah pengguna adalah pelanggan sebelum dihapus
    User.getUserById(userId, function(err, user) {
      if (err) {
        console.error('Error getting user:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data pelanggan' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
      }
      
      if (user.role !== 'customer') {
        return res.status(400).json({ error: 'Hanya pelanggan yang dapat dihapus' });
      }
      
      // Hapus pelanggan
      User.deleteUser(userId, function(err) {
        if (err) {
          console.error('Error deleting user:', err);
          return res.status(500).json({ error: 'Terjadi kesalahan saat menghapus pelanggan' });
        }
        
        res.json({ message: 'Pelanggan berhasil dihapus' });
      });
    });
  });
};