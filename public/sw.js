// Service Worker untuk PWA Sistem Penjualan Kendaraan

const CACHE_NAME = 'vehicle-sales-v1';
const urlsToCache = [
  '/',
  '/stylesheets/style.css',
  '/javascripts/main.js',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch dari cache atau jaringan
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika ditemukan di cache, return dari cache
        if (response) {
          return response;
        }

        // Jika tidak ditemukan di cache, fetch dari jaringan
        return fetch(event.request).then(
          response => {
            // Pastikan response valid
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response sebelum menyimpan ke cache
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Update Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});