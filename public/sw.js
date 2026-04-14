/* FORMA Coach — offline cache for static assets, fonts, and SPA shell */
const CACHE_NAME = 'forma-coach-pwa-v1'
const FONT_CSS = [
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Syne:wght@400..800&display=swap',
]

const PRECACHE_URLS = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll(PRECACHE_URLS).catch(() => {})
      for (const url of FONT_CSS) {
        try {
          const res = await fetch(url, { mode: 'cors', credentials: 'omit' })
          if (res.ok) await cache.put(url, res)
        } catch {
          /* offline at install — runtime will cache */
        }
      }
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

function isFontRequest(url) {
  return (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  )
}

function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|eot)$/i.test(pathname)
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  if (isFontRequest(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME)
        const cached = await cache.match(event.request)
        if (cached) return cached
        try {
          const res = await fetch(event.request)
          if (res.ok) await cache.put(event.request, res.clone())
          return res
        } catch (e) {
          return cached || Promise.reject(e)
        }
      })(),
    )
    return
  }

  if (url.origin !== self.location.origin) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)

      if (event.request.mode === 'navigate') {
        try {
          const networkResponse = await fetch(event.request)
          if (networkResponse.ok) {
            await cache.put(event.request, networkResponse.clone())
          }
          return networkResponse
        } catch {
          const fallback = (await cache.match('/')) || (await cache.match('/index.html'))
          if (fallback) return fallback
          return new Response('Offline', { status: 503, statusText: 'Offline' })
        }
      }

      const cached = await cache.match(event.request)
      if (cached && (isStaticAsset(url.pathname) || url.pathname.startsWith('/assets/'))) {
        fetch(event.request)
          .then((res) => {
            if (res.ok) cache.put(event.request, res.clone())
          })
          .catch(() => {})
        return cached
      }

      try {
        const networkResponse = await fetch(event.request)
        if (networkResponse.ok) {
          await cache.put(event.request, networkResponse.clone())
        }
        return networkResponse
      } catch {
        if (cached) return cached
        const shell = (await cache.match('/')) || (await cache.match('/index.html'))
        if (shell) return shell
        return new Response('Offline', { status: 503, statusText: 'Offline' })
      }
    })(),
  )
})
