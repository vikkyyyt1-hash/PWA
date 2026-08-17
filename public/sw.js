// Service worker — makes the app work offline and installable.
const CACHE_NAME = 'pwa-task-app-v3'
// Core files saved at install, available even without internet.
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icon-192.svg',
  './icon-512.svg',
]

// Install: cache the core files.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

// Activate: delete old caches, take control of pages.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

// Fetch offline:
// - page (navigate): network first, fall back to the cached copy offline;
// - JS/CSS files: cache first, fetch + cache on first use.
self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy))
          return response
        })
        .catch(() => caches.match('./index.html'))
    )
    return
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
    )
  )
})