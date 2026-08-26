/* VideoParser PWA Service Worker — cache app shell, pass through API calls */
const CACHE = 'videoparser-v9';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll([
        './',
        './video-parser.html',
        './manifest.json',
        './icon-192.png',
        './icon-512.png',
        './apple-touch-icon.png'
      ]);
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  // Same-origin: cache-first for app shell
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then(function(cached) { return cached || fetch(req); })
    );
    return;
  }
  // Cross-origin (DouParse API, CORS proxies): network only
  e.respondWith(fetch(req));
});
