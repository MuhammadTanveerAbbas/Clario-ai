/* Clario no-op service worker (satisfies legacy registrations, no caching) */
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
