/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

declare let self: ServiceWorkerGlobalScope;
const WORKBOX_CACHES = [
  'html-cache',
  'vpsn-webmanifest',
  'api-cache',
  'images-cache',
  'cms-assets-images',
  'workbox-precache',
];

// self.__WB_MANIFEST est le point d'injection par défaut
const entries = self.__WB_MANIFEST;

const rootEntry = { url: '/', revision: null };
if (!entries.some(entry => entry.url === '/')) {
  entries.push(rootEntry);
}

precacheAndRoute(entries);

cleanupOutdatedCaches();

let allowlist: undefined | RegExp[];
if (import.meta.env.DEV) {
  allowlist = [/^\/$/, /^\/budget-senegal(\/.*)?$/];
} else {
  allowlist = [/^\/$/, /^\/budget-senegal(\/.*)?$/];
}

// Configuration pour le offline
if (import.meta.env.PROD) {
  // Cache du manifest
  registerRoute(
    ({ request, sameOrigin }) => sameOrigin && request.destination === 'manifest',
    new NetworkFirst({
      cacheName: 'vpsn-webmanifest',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxEntries: 100 }),
      ],
    })
  );

  // Cache des API
  registerRoute(
    ({ url }) => url.pathname.startsWith('/items/'),
    new NetworkFirst({
      cacheName: 'api-cache',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 3600 }),
      ],
    })
  );

  // Cache des images locales
  registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    })
  );

  // Cache des assets du CMS
  registerRoute(
    ({ url }) => 
      url.origin === 'https://cms.vie-publique.sn' && 
      url.pathname.startsWith('/assets'),
    new StaleWhileRevalidate({
      cacheName: 'cms-assets-images',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    })
  );

  registerRoute(
    new NavigationRoute(
      new NetworkFirst({
        cacheName: 'html-cache',
        plugins: [
          new CacheableResponsePlugin({ statuses: [200] }),
        ],
      }),
      { allowlist }
    )
  );

  registerRoute(
    ({url}) => url.host.startsWith('fonts.g'),
    new CacheFirst({
      cacheName: 'google-fonts',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 30,
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200]
        }),
      ],
    })
  );
}

// Gestion des mises à jour
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (!WORKBOX_CACHES.includes(cacheName)) {
          return caches.delete(cacheName);
        }
      })
    )).then(() => self.clients.claim())
  );
});

// Communication avec le client
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    self.clients.claim().then(() => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage('reload'));
      });
    });
  }
});

/*
  events - push
*/

self.addEventListener('push', event => {
  console.log('Push message received:', event)
  if (event.data) {
    let data = JSON.parse(event.data.text())
    event.waitUntil(
      self.registration.showNotification(
        data.title,
        {
          body: data.body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          image: data.imageUrl,
          data: {
            openUrl: data.openUrl
          }
        }
      )
    )
  }
})

/*
events - notifications
*/

self.addEventListener('notificationclick', event => {
  let notification = event.notification
  let action = event.action

  if (action == 'ramadan') {
    console.log('Ramadan button was clicked')
  }
  else if (action == 'goodbye') {
    console.log('Goodbye button was clicked')
  }
  else {
    event.waitUntil(
      self.clients.matchAll().then(clis => {
        let clientUsingApp = clis.find(cli => {
          return cli.visibilityState === 'visible'
        })
        if (clientUsingApp) {
          clientUsingApp.navigate(notification.data.openUrl)
          clientUsingApp.focus()
        }
        else {
          self.clients.openWindow(notification.data.openUrl)
        }
      })
    ) 
  }
  notification.close()
})

self.addEventListener('notificationclose', event => {
  console.log('Notification was closed', event)
})


self.skipWaiting();
clientsClaim();