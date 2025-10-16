const CACHE = "chat
git add service-worker.js
git commit -m "Fix offline mode with navigation fallback"
git push
perl -0777 -pe 's#</head>#  <link rel="icon" href="./icons/icon-192.png" type="image/png" sizes="192x192">\n  <link rel="icon" href="./icons/icon-512.png" type="image/png" sizes="512x512">\n</head>#' -i index.html
git add index.html
git commit -m "Add explicit favicon links"
git push
cd ~/Dokumente/chat-pwa
cat > offline.html <<'EOF'
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>PWA Chat – Offline</title>
  <link rel="stylesheet" href="styles.css" />
  <style>
    .offline-box{max-width:640px;margin:15vh auto;padding:24px;border-radius:12px;background:#1e1e1e;color:#eee;border:1px solid #333}
    .offline-box h1{margin:0 0 12px}
    .offline-box p{margin:0 0 8px;opacity:.9}
    .tip{opacity:.7;font-size:.95em}
  </style>
</head>
<body>
  <div class="offline-box">
    <h1>Du bist offline</h1>
    <p>Diese App braucht Internet. Wir zeigen dir diese Seite, solange keine Verbindung besteht.</p>
    <p class="tip">Tipp: Sobald du wieder online bist, einfach neu laden.</p>
  </div>
</body>
</html>
EOF
const CACHE = "chat-pwa-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./offline.html"   // ⬅️ neu
];

self.addEventListener("fetch", (e) => {
  // Für Seiten-Navigationen: Netzwerk versuchen, sonst offline.html
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/chat-pwa/offline.html") || caches.match("offline.html"))
    );
    return;
  }

  // Für andere Requests: Cache zuerst, sonst Netz
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
git add offline.html service-worker.js
git commit -m "Add offline fallback page + cache bump"
git push
cd ~/Dokumente/chat-pwa

cat > service-worker.js <<'JS'
const CACHE = "chat-pwa-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./offline.html",
];

// Install: precachen
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate: alte Caches löschen
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: zuerst Cache, sonst Netz – und sauberer Offline-Fallback
self.addEventListener("fetch", (e) => {
  const req = e.request;

  // Navigationsanfragen (HTML-Seiten) – bei Fehler -> offline.html
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => {
          // Erfolgreiche Antwort zusätzlich cachen (optional)
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return r;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          return cached || caches.match("./offline.html");
        })
    );
    return;
  }

  // Sonstige Requests (CSS/JS/Icons …): Cache-first, dann Netz, bei Netzfehler -> Cache oder noop
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((r) => {
          // erfolgreiche Antwort in Cache legen (nur GET)
          if (req.method === "GET" && r && r.status === 200) {
            const copy = r.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return r;
        })
        .catch(() => {
          // als letztes Mittel: kein harter Fehler werfen
          return caches.match("./offline.html");
        });
    })
  );
});
