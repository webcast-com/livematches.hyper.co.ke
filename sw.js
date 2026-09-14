/* ScoreHub service worker — offline shell + runtime caching.
   SW_VERSION names both caches, so bumping it rebuilds the precache and drops
   the old caches on activate. Bumping is no longer *required* to ship a new
   style.css/app.js: same-origin assets are served stale-while-revalidate, so
   the copy behind the precache refreshes itself on the next visit (it used to
   be cache-first, which pinned whatever was installed until someone bumped
   this string). Bump it when the precache list itself changes. */
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

/* Where is this request already cached? The precache (install-time app shell)
   comes first, then anything picked up at runtime. The returned name is where a
   refreshed copy has to go back so the stale copy is actually replaced. */
async function cacheLookup(req) {
  for (const name of [STATIC_CACHE, RUNTIME_CACHE]) {
    const hit = await caches.open(name).then((cache) => cache.match(req));
    if (hit) return { hit, name };
  }
  return { hit: null, name: null };
}

/* Fetch and refresh the stored copy in whichever cache holds it (the runtime
   cache for anything new). Cache-write failures never affect the response we
   hand back — 206/redirect responses cannot be stored and that is fine. */
async function revalidate(req, cacheName) {
  const res = await fetch(req);
  if (res && res.status === 200) {
    const name = cacheName || RUNTIME_CACHE;
    caches.open(name)
      .then((cache) => cache.put(req, res.clone()).then(() => trimCache(name, 80)))
      .catch(() => null);
  }
  return res;
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

  // Same-origin assets: stale-while-revalidate — the cached copy is served
  // immediately (instant paint, still works offline) while a fresh copy is
  // fetched and stored for the next visit.
  event.respondWith((async () => {
    const { hit, name } = await cacheLookup(req);
    if (hit) {
      event.waitUntil(revalidate(req, name).catch(() => null));
      return hit;
    }
    try {
      return await revalidate(req, null);
    } catch (e) {
      const fallback = req.destination === 'image' ? await caches.match('icon-192.png') : null;
      return fallback || Response.error();
    }
  })());
});
