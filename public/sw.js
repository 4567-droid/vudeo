/* Service worker de Rumbo: funciona sin conexión y muestra las notificaciones. */

const VERSION = "rumbo-v1";
const PAGES = ["/", "/racha", "/plan"];
const ASSETS = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/badge-96.png",
];

// En desarrollo se registra con ?cache=off: solo notificaciones, sin caché.
const CACHE_ENABLED = new URL(self.location.href).searchParams.get("cache") !== "off";

function sameOriginStatic(url) {
  try {
    const u = new URL(url, self.location.origin);
    return u.origin === self.location.origin && u.pathname.startsWith("/_next/static/");
  } catch {
    return false;
  }
}

async function cacheQuietly(cache, urls) {
  await Promise.all(urls.map((url) => cache.add(url).catch(() => undefined)));
}

/** Guarda las páginas y todos los archivos de /_next/static/ que cada una usa. */
async function precache() {
  const cache = await caches.open(VERSION);
  await cacheQuietly(cache, ASSETS);
  const found = new Set();
  for (const page of PAGES) {
    try {
      const response = await fetch(page, { cache: "no-store" });
      if (!response.ok) continue;
      await cache.put(page, response.clone());
      const html = await response.text();
      for (const match of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) found.add(match[0]);
    } catch {
      /* sin red: se guarda en la próxima visita */
    }
  }
  await cacheQuietly(cache, [...found]);
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  if (CACHE_ENABLED) event.waitUntil(precache());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== VERSION || !CACHE_ENABLED).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

// La página avisa qué archivos cargó antes de que el service worker estuviera activo.
self.addEventListener("message", (event) => {
  const msg = event.data;
  if (!CACHE_ENABLED || !msg || msg.type !== "CACHE_URLS" || !Array.isArray(msg.urls)) return;
  event.waitUntil(
    caches.open(VERSION).then((cache) => cacheQuietly(cache, msg.urls.filter(sameOriginStatic))),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(VERSION);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached =
      (await cache.match(request, { ignoreSearch: true })) || (await cache.match("/"));
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached || Response.error());
  return cached || network;
}

if (CACHE_ENABLED) {
  self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Páginas: la versión nueva si hay red; si no, la guardada.
    if (request.mode === "navigate") {
      event.respondWith(networkFirst(request));
      return;
    }
    // Datos de navegación de Next (RSC): se dejan pasar. Sin red, Next recarga la página
    // completa y la sirve el caso anterior.
    if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

    // Archivos con hash en el nombre: no cambian nunca.
    if (url.pathname.startsWith("/_next/static/")) {
      event.respondWith(cacheFirst(request));
      return;
    }
    if (ASSETS.includes(url.pathname)) {
      event.respondWith(staleWhileRevalidate(request));
    }
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if ("focus" in client) {
          await client.focus();
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});
