const CACHE = "bp-diary-v15";
const SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/src/styles.css",
  "/src/data.jsx",
  "/src/chart.jsx",
  "/src/components.jsx",
  "/src/pdf-export.jsx",
  "/src/app.jsx",
  "/icons/icon.svg",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  // Network-first for HTML: always get a fresh index.html when online.
  // This prevents the PWA from running a stale shell indefinitely.
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for all other assets (JS, CSS, fonts, icons).
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      });
    })
  );
});
