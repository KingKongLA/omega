// Offline support: keeps OMEGA's app files and the brain engine (wllama) on the device.
// The brain itself is saved by wllama in the browser's private file storage.
const CACHE = 'omega-shell-v34';
const ENGINE = 'omega-engine-v1';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'games.js', 'play.html', 'worker.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'video.js', 'ffmpeg/ffmpeg.js', 'ffmpeg/814.ffmpeg.js'];
// 'reload' skips the browser's 10-minute cache, so the saved copy is always the newest version
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => (k.startsWith('omega-shell-') && k !== CACHE) || (k.startsWith('omega-engine-') && k !== ENGINE)).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Multi-core brain: these headers make the page "cross-origin isolated", which lets the brain use several processor cores.
// Chrome/Firefox get 'credentialless' (outside images still load in apps); Safari gets 'require-corp'.
// Safari (iPhone/iPad/Mac) is left alone: its multi-core support is unreliable, and the single-core mode is proven there.
const CHROMIUM_OR_FIREFOX = /(Chrome|Chromium|Firefox)\//.test(self.navigator.userAgent) && !/CriOS|FxiOS|EdgiOS|iPhone|iPad/.test(self.navigator.userAgent);
const COEP = 'credentialless';
function isolate(resp, url) {
  if (!CHROMIUM_OR_FIREFOX) return resp;
  if (!resp || resp.status === 0 || resp.type === 'opaque' || resp.type === 'opaqueredirect' || url.pathname.endsWith('/play.html')) return resp; // play links stay normal pages
  const h = new Headers(resp.headers);
  h.set('Cross-Origin-Embedder-Policy', COEP); h.set('Cross-Origin-Opener-Policy', 'same-origin'); h.set('Cross-Origin-Resource-Policy', 'same-origin');
  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers: h });
}
const fromCache = req => caches.match(req).then(r => r || caches.match(req, { ignoreSearch: true }));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  // brain engine code from the CDN: pinned version, so save it once and serve it from the phone (works offline)
  if (u.hostname === 'cdn.jsdelivr.net' && (u.pathname.startsWith('/npm/@wllama/wllama@4.0.0/') || u.pathname.startsWith('/npm/@ffmpeg/core@0.12.10/'))) {
    e.respondWith(caches.open(ENGINE).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  if (u.origin !== location.origin) return; // never touch model downloads or live-info calls
  // app files: newest from the network; if offline or the network is too slow (4 s), the saved copy
  e.respondWith((async () => isolate(await (async () => {
    const net = fetch(e.request, { cache: 'no-cache' }).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; });
    try {
      const r = await Promise.race([net, new Promise(res => setTimeout(res, 4000, 'slow'))]);
      if (r !== 'slow') return r;
      return (await fromCache(e.request)) || await net; // slow network: use the saved copy if there is one
    } catch (err) {
      return (await fromCache(e.request)) || (await caches.match('index.html')) || Response.error(); // offline
    }
  })(), u))());
});
