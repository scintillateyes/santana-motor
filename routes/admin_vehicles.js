var auth = require('../utils/auth');
var Vehicle = require('../models/vehicle');
var VehicleImage = require('../models/vehicle_image');

// Routes for vehicle management (admin only)
module.exports = function(app) {

  // Mendapatkan semua kendaraan (untuk admin - termasuk yang tidak tersedia)
  app.get('/api/admin/vehicles', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    // Ambil parameter filter dari query
    const filters = {
      brand: req.query.brand,
      minYear: req.query.minYear ? parseInt(req.query.minYear) : null,
      maxYear: req.query.maxYear ? parseInt(req.query.maxYear) : null,
      minPurchasePrice: req.query.minPurchasePrice ? parseFloat(req.query.minPurchasePrice) : null,
      maxPurchasePrice: req.query.maxPurchasePrice ? parseFloat(req.query.maxPurchasePrice) : null,
      minSellingPrice: req.query.minSellingPrice ? parseFloat(req.query.minSellingPrice) : null,
      maxSellingPrice: req.query.maxSellingPrice ? parseFloat(req.query.maxSellingPrice) : null,
      transmission: req.query.transmission,
      condition: req.query.condition
    };

    Vehicle.getAll(filters, function(err, vehicles) {
      if (err) {
        console.error('Error getting vehicles:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data kendaraan' });
      }

      // Untuk setiap kendaraan, tambahkan informasi gambar
      const vehiclePromises = vehicles.map(vehicle => {
        return new Promise((resolve, reject) => {
          VehicleImage.getPrimaryByVehicleId(vehicle.id, (err, primaryImage) => {
            if (err) {
              console.error('Error getting vehicle image:', err);
              resolve({ ...vehicle, primary_image: null });
            } else {
              resolve({ ...vehicle, primary_image: primaryImage ? primaryImage.image_url : null });
            }
          });
        });
      });

      Promise.all(vehiclePromises)
        .then(results => {
          res.json(results);
        })
        .catch(err => {
          console.error('Error processing vehicle images:', err);
          res.status(500).json({ error: 'Terjadi kesalahan saat memproses data gambar kendaraan' });
        });
    });
  });

  // Mendapatkan detail kendaraan berdasarkan ID (untuk admin)
  app.get('/api/admin/vehicles/:id', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    const vehicleId = req.params.id;

    Vehicle.getById(vehicleId, function(err, vehicle) {
      if (err) {
        console.error('Error getting vehicle:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data kendaraan' });
      }

      if (!vehicle) {
        return res.status(404).json({ error: 'Kendaraan tidak ditemukan' });
      }

      // Ambil semua gambar untuk kendaraan ini
      VehicleImage.getByVehicleId(vehicleId, function(err, images) {
        if (err) {
          console.error('Error getting vehicle images:', err);
          return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data gambar kendaraan' });
        }

        // Tambahkan informasi gambar ke dalam objek kendaraan
        const vehicleWithImages = {
          ...vehicle,
          images: images.map(img => ({ id: img.id, url: img.image_url, is_primary: img.is_primary })),
          primary_image: images.find(img => img.is_primary) ? images.find(img => img.is_primary).image_url : images[0]?.image_url || null
        };

        res.json(vehicleWithImages);
      });
    });
  });

  // Membuat kendaraan baru
  app.post('/api/admin/vehicles', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    const {
      name, brand, model, year, color, transmission, 
      mileage, condition, purchase_price, selling_price, 
      stock, description, image_url
    } = req.body;

    // Validasi input
    if (!name || !brand || !model || !year || !purchase_price || !selling_price) {
      return res.status(400).json({ error: 'Name, brand, model, year, purchase_price, dan selling_price wajib diisi' });
    }

    const vehicleData = {
      name,
      brand,
      model,
      year: parseInt(year),
      color: color || null,
      transmission: transmission || 'manual',
      mileage: mileage ? parseInt(mileage) : 0,
      condition: condition || 'baik',
      purchase_price: parseFloat(purchase_price),
      selling_price: parseFloat(selling_price),
      stock: stock ? parseInt(stock) : 1,
      description: description || null,
      image_url: image_url || null
    };

    Vehicle.create(vehicleData, function(err, newVehicle) {
      if (err) {
        console.error('Error creating vehicle:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat membuat kendaraan baru' });
      }

      res.status(201).json({ 
        message: 'Kendaraan berhasil dibuat', 
        vehicle: newVehicle 
      });
    });
  });

  // Memperbarui data kendaraan
  app.put('/api/admin/vehicles/:id', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    const vehicleId = req.params.id;
    const {
      name, brand, model, year, color, transmission,
      mileage, condition, purchase_price, selling_price,
      stock, description, image_url
    } = req.body;

    // Validasi input
    if (!name || !brand || !model || !year || !purchase_price || !selling_price) {
      return res.status(400).json({ error: 'Name, brand, model, year, purchase_price, dan selling_price wajib diisi' });
    }

    const vehicleData = {
      name,
      brand,
      model,
      year: parseInt(year),
      color: color || null,
      transmission: transmission || 'manual',
      mileage: mileage ? parseInt(mileage) : 0,
      condition: condition || 'baik',
      purchase_price: parseFloat(purchase_price),
      selling_price: parseFloat(selling_price),
      stock: stock ? parseInt(stock) : 1,
      description: description || null,
      image_url: image_url || null
    };

    Vehicle.update(vehicleId, vehicleData, function(err, updatedVehicle) {
      if (err) {
        console.error('Error updating vehicle:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui data kendaraan' });
      }

      res.json({ 
        message: 'Data kendaraan berhasil diperbarui', 
        vehicle: updatedVehicle 
      });
    });
  });

  // Menghapus kendaraan
  app.delete('/api/admin/vehicles/:id', auth.requireLogin, auth.requireAdmin, function(req, res, next) {
    const vehicleId = req.params.id;

    // Hapus semua gambar kendaraan terlebih dahulu
    VehicleImage.deleteByVehicleId(vehicleId, function(err) {
      if (err) {
        console.error('Error deleting vehicle images:', err);
        // Tetap lanjutkan penghapusan kendaraan meskipun gambar gagal dihapus
      }

      // Hapus kendaraan
      Vehicle.delete(vehicleId, function(err, result) {
        if (err) {
          console.error('Error deleting vehicle:', err);
          return res.status(500).json({ error: 'Terjadi kesalahan saat menghapus kendaraan' });
        }

        res.json(result);
      });
    });
  });
};