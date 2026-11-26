// Offline support: keeps OMEGA's app files and the brain engine (wllama) on the device.
// The brain itself is saved by wllama in the browser's private file storage.
const CACHE = 'omega-shell-v12';
const ENGINE = 'omega-engine-v1';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'worker.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => (k.startsWith('omega-shell-') && k !== CACHE) || (k.startsWith('omega-engine-') && k !== ENGINE)).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  // brain engine code from the CDN: pinned version, so save it once and serve it from the phone (works offline)
  if (u.hostname === 'cdn.jsdelivr.net' && u.pathname.startsWith('/npm/@wllama/wllama@4.0.0/')) {
    e.respondWith(caches.open(ENGINE).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  if (u.origin !== location.origin) return; // never touch model downloads or live-info calls
  // app files: try the network first (to get updates), fall back to the saved copy when offline
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
