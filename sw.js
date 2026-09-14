/* ScoreHub service worker — offline shell + runtime caching.
   Bump SW_VERSION to force-update all clients (it names both caches, so the
   precache is rebuilt and the old caches are dropped on activate). */
const SW_VERSION = 'v2';
const STATIC_CACHE = `scorehub-static-${SW_VERSION}`;
const RUNTIME_CACHE = `scorehub-runtime-${SW_VERSION}`;
const OFFLINE_URL = 'offline.html';

const PRECACHE = [
  './', 'index.html', 'offline.html', 'manifest.webmanifest',
  'style.css', 'app.js', 'i18n.js', 'seo.js', 'pwa.js', 'share.js',
  'match.html', 'match.js',
  'preview.html', 'preview.js', 'report.html', 'report.js',
  'previews.html', 'previews.js', 'standings.html', 'standings.js',
  'transfers.html', 'transfers.js', 'predictions.html', 'predictions.js',
  'story.html', 'story.js', 'shop.html', 'shop.js', 'about.html',
  'terms.html', 'privacy.html',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => Promise.allSettled(PRECACHE.map((u) => cache.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.indexOf('scorehub-') === 0 && k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function trimCache(name, max) {
  caches.open(name).then((cache) => cache.keys().then((keys) => {
    if (keys.length > max) cache.delete(keys[0]).then(() => trimCache(name, max));
  }));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Cross-origin (ESPN / Jolpica / CDNs): network first, fall back to runtime cache.
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(RUNTIME_CACHE).then((c) => { c.put(req, copy); trimCache(RUNTIME_CACHE, 80); });
        return res;
      }).catch(() => caches.match(req).then((hit) => hit || Response.error()))
    );
    return;
  }

  // Same-origin navigations: network first (keeps pages fresh), cache, then offline shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((hit) => hit || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Same-origin assets: cache first, then network (cached for next time).
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(RUNTIME_CACHE).then((c) => { c.put(req, copy); trimCache(RUNTIME_CACHE, 80); });
      return res;
    }).catch(() => (req.destination === 'image' ? caches.match('icon-192.png') : undefined)))
  );
});
