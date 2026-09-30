// Offline support; keep VERSION in sync with js/game.js, or installed apps stay on the old version
const VERSION = "1.16.2";
const CACHE = "fly-catch-" + VERSION;
const FONTS = "fly-catch-fonts";          // kept across versions

const CORE = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/game.js",
  "./lang/ar.json",
  "./lang/en.json",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

// Install: cache the whole game, straight from the network so a new version never picks up old files
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});

// Activate: delete caches from old versions
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page asks which version this worker holds, so it only offers "Update" when that's newer than what it runs
self.addEventListener("message", e => {
  if (e.data === "version" && e.source) e.source.postMessage({ version: VERSION });
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Google Fonts: network the first time, then always from cache
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(
      caches.open(FONTS).then(c => c.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok || res.type === "opaque") c.put(req, res.clone());
        return res;
      }).catch(() => hit)))
    );
    return;
  }

  if (url.origin !== location.origin) return;

  // Game files: serve from cache instantly (works offline), refresh in the background when online
  e.respondWith(
    caches.open(CACHE).then(c =>
      c.match(req, { ignoreSearch: true }).then(hit => {
        const net = fetch(req).then(res => {
          if (res.ok) c.put(req, res.clone());
          return res;
        }).catch(() => hit || (req.mode === "navigate" ? c.match("./index.html") : undefined));
        return hit || net;
      })
    )
  );
});
