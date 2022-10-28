importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);

// self.addEventListener('install', (e) => {
//   console.log('[Service Worker] Install');
// });

// self.addEventListener('activate', event => {
//   console.log('Service Worker activating.');
// });

workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst()
);