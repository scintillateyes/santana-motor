var auth = require('../utils/auth');
var user = require('../models/user');

// Routes for user management
module.exports = function(app, passport) {

  // Route untuk membuat akun admin (hanya bisa diakses oleh admin lain)
  app.post('/admin/create-admin', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    var { email, password, name, phone, address } = req.body;
    
    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }
    
    var userData = {
      email: email,
      password: password,
      name: name || '',
      phone: phone || '',
      address: address || '',
      role: 'admin'
    };
    
    user.signup(req, email, password, name, phone, address, function(err, newUser, message) {
      if (err) {
        console.error('Error creating admin:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat membuat akun admin' });
      }
      
      if (!newUser) {
        return res.status(400).json({ error: message });
      }
      
      res.status(201).json({ 
        message: 'Akun admin berhasil dibuat', 
        user: { 
          id: newUser.id, 
          email: newUser.email, 
          name: newUser.name,
          role: 'admin'
        } 
      });
    });
  });

  // Route untuk mendapatkan profil pengguna (termasuk data tambahan)
  app.get('/api/profile', auth.requireLogin, function(req, res, next) {
    user.getUserById(req.user.id, function(err, userData) {
      if (err) {
        console.error('Error getting user profile:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data profil' });
      }
      
      if (!userData) {
        return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
      }
      
      res.json(userData);
    });
  });

  // Route untuk memperbarui profil pengguna
  app.put('/api/profile', auth.requireLogin, function(req, res, next) {
    var userData = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address
    };
    
    user.updateUserProfile(req.user.id, userData, function(err, updatedUser) {
      if (err) {
        console.error('Error updating user profile:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui profil' });
      }
      
      res.json({ 
        message: 'Profil berhasil diperbarui', 
        user: updatedUser 
      });
    });
  });

  // Route untuk mendapatkan daftar semua pengguna (hanya untuk admin)
  app.get('/api/users', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    user.getAllUsers(function(err, users) {
      if (err) {
        console.error('Error getting users:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil daftar pengguna' });
      }
      
      res.json(users);
    });
  });
};