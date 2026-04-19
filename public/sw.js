// MyBank Service Worker - PWA offline support
const CACHE_VERSION = "mybank-v1"
const RUNTIME_CACHE = "mybank-runtime-v1"

// Assets to cache on install (app shell)
const PRECACHE_URLS = ["/", "/manifest.webmanifest", "/icon-512.jpg", "/apple-icon.jpg"]

// Install event - cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => null))
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_VERSION && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// Fetch event - network-first for API calls, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== "GET") return

  // Skip chrome-extension and non-http(s) requests
  const url = new URL(request.url)
  if (!url.protocol.startsWith("http")) return

  // Skip API/auth routes - always go to network (security critical)
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/_next/data/")
  ) {
    return
  }

  // Network-first for HTML pages (so users get fresh content)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
    )
    return
  }

  // Cache-first for static assets (images, fonts, scripts)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() => {
          // Return offline fallback for images
          if (request.destination === "image") {
            return new Response("", { status: 200, headers: { "Content-Type": "image/svg+xml" } })
          }
        })
    }),
  )
})

// Handle messages from client (e.g., skip waiting)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
