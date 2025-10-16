const CACHE = "chat-pwa-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json"
];

// Installations-Event – statische Dateien cachen
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Aktivierungs-Event – alte Caches löschen
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch-Event – erst aus dem Cache, dann aus dem Netz
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
