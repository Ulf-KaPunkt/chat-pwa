const CACHE = 'chat-pwa-v2';

const ASSETS = [
  '/chat-pwa/',
  '/chat-pwa/index.html',
  '/chat-pwa/styles.css',
  '/chat-pwa/manifest.json',
  '/chat-pwa/install.js',
  '/chat-pwa/offline.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).catch(() => {
        // Fallback nur für Seiten-Navigationen (Offline-Seite)
        const acceptsHTML = req.headers.get('accept')?.includes('text/html');
        if (req.mode === 'navigate' || (req.method === 'GET' && acceptsHTML)) {
          return caches.match('/chat-pwa/offline.html');
        }
      });
    })
  );
});
