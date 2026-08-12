// Service worker — dzięki niemu aplikacja działa offline i można ją zainstalować.
const CACHE_NAME = 'pwa-task-app-v3'
// Pliki zapisywane od razu podczas instalacji (podstawa działania aplikacji).
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icon-192.svg',
  './icon-512.svg',
]

// Instalacja: zapisujemy podstawowe pliki, żeby były nawet bez internetu.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

// Aktywacja: usuwamy stare wersje cache i przejmujemy kontrolę nad stroną.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

// Obsługa zapytań offline:
// - strona (navigate): najpierw sieć, gdy brak internetu wracamy do zapisanej kopii;
// - pliki JS/CSS: najpierw cache, a pierwszy raz pobieramy z sieci i zapisujemy.
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