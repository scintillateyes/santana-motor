var auth = require('../utils/auth');
var Vehicle = require('../models/vehicle');
var VehicleImage = require('../models/vehicle_image');

// Routes for vehicle catalog (customer facing)
module.exports = function(app) {

  // Mendapatkan semua kendaraan (dengan filter opsional)
  app.get('/api/vehicles', function(req, res, next) {
    // Ambil parameter filter dari query
    const filters = {
      brand: req.query.brand,
      minYear: req.query.minYear ? parseInt(req.query.minYear) : null,
      maxYear: req.query.maxYear ? parseInt(req.query.maxYear) : null,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
      fuel_type: req.query.fuel_type,
      transmission: req.query.transmission,
      available: true // Hanya tampilkan kendaraan yang tersedia (stock > 0)
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

  // Mendapatkan detail kendaraan berdasarkan ID
  app.get('/api/vehicles/:id', function(req, res, next) {
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
          images: images.map(img => img.image_url),
          primary_image: images.find(img => img.is_primary) ? images.find(img => img.is_primary).image_url : images[0]?.image_url || null
        };

        res.json(vehicleWithImages);
      });
    });
  });

  // Mencari kendaraan berdasarkan kata kunci
  app.get('/api/vehicles/search', function(req, res, next) {
    const keyword = req.query.q;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Parameter pencarian (q) wajib diisi' });
    }

    // Query untuk mencari kendaraan berdasarkan brand, model, atau deskripsi
    const query = `
      SELECT * FROM vehicles 
      WHERE (brand LIKE ? OR model LIKE ? OR description LIKE ?) 
      AND stock > 0
      ORDER BY created_at DESC
    `;
    
    const searchParam = `%${keyword}%`;
    const params = [searchParam, searchParam, searchParam];
    
    require('../models/db').query(query, params, function(err, rows) {
      if (err) {
        console.error('Error searching vehicles:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mencari kendaraan' });
      }

      // Untuk setiap kendaraan, tambahkan informasi gambar
      const vehiclePromises = rows.map(vehicle => {
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
};