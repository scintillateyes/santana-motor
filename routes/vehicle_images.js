var auth = require('../utils/auth');
var VehicleImage = require('../models/vehicle_image');
var multer = require('multer');
var path = require('path');

// Konfigurasi multer untuk upload langsung ke folder public/uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Folder untuk upload langsung
  },
  filename: function (req, file, cb) {
    // Membuat nama file unik dengan timestamp
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Hanya menerima file gambar
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Maksimal 5MB
  }
});

// Routes for vehicle image upload
module.exports = function(app) {

  // Upload gambar untuk kendaraan
  app.post('/api/admin/vehicles/:vehicleId/images', 
    auth.requireLogin, 
    auth.requireAdmin,
    upload.array('images', 10), // Maksimal 10 gambar per upload
    function(req, res, next) {
      const vehicleId = req.params.vehicleId;
      
      // Validasi apakah kendaraan ada
      const db = require('../models/db');
      const vehicleQuery = 'SELECT id FROM vehicles WHERE id = ?';
      
      db.query(vehicleQuery, [vehicleId], function(err, rows) {
        if (err) {
          console.error('Error checking vehicle:', err);
          return res.status(500).json({ error: 'Terjadi kesalahan saat memvalidasi kendaraan' });
        }
        
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Kendaraan tidak ditemukan' });
        }
        
        // Jika tidak ada file yang diupload
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: 'Tidak ada file yang diupload' });
        }
        
        // Simpan setiap file lokal ke database
        const savePromises = req.files.map(file => {
          return new Promise((resolve, reject) => {
            // Gunakan path file lokal yang telah disimpan
            const imageUrl = `/uploads/${file.filename}`;
            
            // Simpan informasi gambar ke database
            const imageData = {
              vehicle_id: vehicleId,
              image_url: imageUrl,
              is_primary: false // Defaultnya bukan gambar utama
            };
            
            VehicleImage.create(imageData, (err, newImage) => {
              if (err) {
                console.error('Error saving image to DB:', err);
                reject(err);
              } else {
                resolve(newImage);
              }
            });
          });
        });
        
        Promise.all(savePromises)
          .then(results => {
            res.status(201).json({ 
              message: `${req.files.length} gambar berhasil diupload`, 
              images: results 
            });
          })
          .catch(err => {
            console.error('Error processing uploads:', err);
            res.status(500).json({ error: 'Terjadi kesalahan saat mengupload gambar' });
          });
      });
    });

  // Upload gambar utama untuk kendaraan
  app.put('/api/admin/vehicles/:vehicleId/primary-image', 
    auth.requireLogin, 
    auth.requireAdmin,
    upload.single('image'),
    function(req, res, next) {
      const vehicleId = req.params.vehicleId;
      
      // Validasi apakah kendaraan ada
      const db = require('../models/db');
      const vehicleQuery = 'SELECT id FROM vehicles WHERE id = ?';
      
      db.query(vehicleQuery, [vehicleId], function(err, rows) {
        if (err) {
          console.error('Error checking vehicle:', err);
          return res.status(500).json({ error: 'Terjadi kesalahan saat memvalidasi kendaraan' });
        }
        
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Kendaraan tidak ditemukan' });
        }
        
        // Jika tidak ada file yang diupload
        if (!req.file) {
          return res.status(400).json({ error: 'Tidak ada file yang diupload' });
        }
        
        // Gunakan path file lokal yang telah disimpan
        const imageUrl = `/uploads/${req.file.filename}`;
        
        // Simpan informasi gambar ke database sebagai gambar utama
        const imageData = {
          vehicle_id: vehicleId,
          image_url: imageUrl,
          is_primary: true // Ini adalah gambar utama
        };
        
        VehicleImage.create(imageData, (err, newImage) => {
          if (err) {
            console.error('Error saving primary image to DB:', err);
            return res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan gambar utama ke database' });
          }
          
          res.status(201).json({ 
            message: 'Gambar utama berhasil diupload', 
            image: newImage 
          });
        });
      });
    });

  // Menghapus gambar kendaraan
  app.delete('/api/admin/vehicles/:vehicleId/images/:imageId', 
    auth.requireLogin, 
    auth.requireAdmin,
    function(req, res, next) {
      const imageId = req.params.imageId;
      
      // Dapatkan informasi gambar dari database
      const imageQuery = 'SELECT * FROM vehicle_images WHERE id = ?';
      const db = require('../models/db');
      
      db.query(imageQuery, [imageId], function(err, rows) {
        if (err) {
          console.error('Error getting image:', err);
          return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data gambar' });
        }
        
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Gambar tidak ditemukan' });
        }
        
        const image = rows[0];

        // Hapus file lokal jika ada
        const fs = require('fs');
        const path = require('path');
        const imagePath = path.join(__dirname, '../public', image.image_url);
        
        // Cek apakah file ada sebelum mencoba menghapus
        fs.access(imagePath, fs.constants.F_OK, (err) => {
          if (!err) {
            // File exists, try to delete it
            fs.unlink(imagePath, (err) => {
              if (err) {
                console.error('Error deleting local image file:', err);
                // Tetap lanjutkan penghapusan dari database meskipun file lokal gagal dihapus
              }
              
              // Hapus dari database
              VehicleImage.delete(imageId, function(err, result) {
                if (err) {
                  console.error('Error deleting image from DB:', err);
                  return res.status(500).json({ error: 'Terjadi kesalahan saat menghapus gambar dari database' });
                }
                
                res.json({ message: 'Gambar berhasil dihapus' });
              });
            });
          } else {
            // File doesn't exist, just remove from database
            console.log('Image file not found, removing from database only:', imagePath);
            
            // Hapus dari database
            VehicleImage.delete(imageId, function(err, result) {
              if (err) {
                console.error('Error deleting image from DB:', err);
                return res.status(500).json({ error: 'Terjadi kesalahan saat menghapus gambar dari database' });
              }
              
              res.json({ message: 'Gambar berhasil dihapus dari database' });
            });
          }
        });
      });
    });
};