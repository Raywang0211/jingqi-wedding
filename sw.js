const CACHE_NAME = 'jingqi-wedding-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './image/web/hero.webp',
  './image/web/trip-map.jpg',
  './image/web/lover-lane.jpg',
  './image/web/senado-square.jpg',
  './image/web/macau-tower.jpg',
  './image/web/guia-couple.jpg',
  './image/web/penha-hill.jpg',
  './image/web/ama-temple.jpg',
  './image/web/ut-cheong.jpg',
  './image/web/san-hong-fat.jpg',
  './image/web/blooom.jpg',
  './image/web/dino-burger.jpg',
  './image/web/lord-stow.jpg',
  './image/web/sei-kee.jpg',
  './image/web/brew-lab.jpg',
  './image/web/momokawa.jpg',
  './image/web/icon-192.png',
  './image/web/icon-512.png',
  './image/web/apple-touch-icon.png',
  './image/web/favicon-32.png',
  './image/web/favicon-16.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(ASSETS.map(url => cache.add(url)))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
