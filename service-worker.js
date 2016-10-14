let cacheName = 'weatherPWA-v2'
let dataCacheName = 'weatherData-v2'
let api = 'http://api.openweathermap.org/data/2.5/weather?'
let filesToCache = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/scripts/localforage-1.4.0.js',
  '/styles/ud811.css',
  '/images/01d.png',
  '/images/02d.png',
  '/images/03d.png',
  '/images/04d.png',
  '/images/09d.png',
  '/images/10d.png',
  '/images/11d.png',
  '/images/13d.png',
  '/images/01n.png',
  '/images/02n.png',
  '/images/03n.png',
  '/images/04n.png',
  '/images/09n.png',
  '/images/10n.png',
  '/images/11n.png',
  '/images/13n.png',
  '/images/ic_add_white_24px.svg',
  '/images/ic_refresh_white_24px.svg'
]

self.addEventListener('install', function (e) {
  console.log('[ServiceWorker] Install')
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      console.log('[ServiceWorker] Caching app shell')
      return cache.addAll(filesToCache)
    })
  )
})

self.addEventListener('activate', function (e) {
  console.log('[ServiceWorker] Activate')
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key)
          return caches.delete(key)
        }
      }))
    })
  )
})

self.addEventListener('fetch', function (e) {
  if (e.request.url.startsWith(api)) {
    e.respondWith(
      fetch(e.request)
        .then(function (response) {
          return caches.open(dataCacheName).then(function (cache) {
            cache.put(e.request.url, response.clone())
            console.log('[ServiceWorker] Fetched & Cached', e.request.url)
            return response
          })
        }))
  } else {
    e.respondWith(
      caches.match(e.request).then(function (response) {
        console.log('[ServiceWorker] Fetch Only', e.request.url)
        return response || fetch(e.request)
      })
    )
  }
})
