/* Service worker mínimo: torna o app instalável e mantém o shell offline. */
const CACHE = "cashclub-shell-v3";
const SHELL = ["/app/inicio", "/icons/icon-192.png", "/icons/icon-512.png", "/logo-cash-club.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL).catch(() => undefined)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // navegações: rede primeiro, cache como rede de segurança
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match("/app/inicio"))),
    );
    return;
  }

  // estáticos: rede primeiro (chunks do Next mudam a cada build), cache só como fallback offline
  if (/\.(png|svg|ico|webp|jpg|woff2?|css|js|mp3)$/.test(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          return res;
        })
        .catch(() => caches.match(request)),
    );
  }
});
