/* صيد الذباب — التشغيل بلا إنترنت
   ⚠️ مع كل إصدار جديد للعبة: غيّر الرقم هون كمان (نفس VERSION بـ index.html)،
   وإلا الأجهزة اللي ثبّتت اللعبة بتضل على النسخة القديمة. */
const VERSION = "1.14.1";
const CACHE = "fly-catch-" + VERSION;
const FONTS = "fly-catch-fonts";          // الخط بيضل محفوظ بين الإصدارات

const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

// التثبيت: نخزّن اللعبة كاملة
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

// التفعيل: نمسح نسخ الإصدارات القديمة
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // الخط من جوجل: أول مرة من النت، وبعدها من الجهاز دائماً
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

  // ملفات اللعبة: من الجهاز فوراً (بتشتغل بلا نت)، وبنحدّثها بالخلفية إذا في نت
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
