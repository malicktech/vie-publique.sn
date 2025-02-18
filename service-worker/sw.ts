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

// self.__WB_MANIFEST is default injection point
const entries = self.__WB_MANIFEST
if (import.meta.env.DEV)
  entries.push({ url: '/', revision: Date.now().toString() });

precacheAndRoute(entries)

// clean old assets
cleanupOutdatedCaches()

let allowlist: undefined | RegExp[];
if (import.meta.env.DEV) allowlist = [/^\/$/, /^\/budget-senegal(\/.*)?$/];

// to allow work offline
if (import.meta.env.PROD) {
  // include webmanifest cache
  registerRoute(
    ({ request, sameOrigin }) =>
      sameOrigin && request.destination === 'manifest',
    new NetworkFirst({
      cacheName: 'vpsn-webmanifest',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        // we only need a few entries
        new ExpirationPlugin({ maxEntries: 100 }),
      ],
    }),
  )

  // Cache des API avec stratégie "Network First"
  registerRoute(
    ({ url }) => url.pathname.startsWith('/items/'),
    new NetworkFirst({
      cacheName: 'api-cache',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 3600 }), // 1h
      ],
    })
  )

  // Cache des images locales
  registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }), // Seules les réponses 200
        new ExpirationPlugin({
          maxEntries: 100, // Limite de stockage
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        }),
      ],
    })
  )

  // Cache des images du CMS
  registerRoute(
    ({ url }) => 
      url.origin === 'https://cms.vie-publique.sn' && 
      url.pathname.startsWith('/assets'),
    new StaleWhileRevalidate({
      cacheName: 'cms-assets-images',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }), // Uniquement les réponses 200 OK
        new ExpirationPlugin({
          maxEntries: 200, // Limite le nombre d'images stockées
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours de cache
        }),
      ],
    })
  )
}
registerRoute(new NavigationRoute(
  createHandlerBoundToURL('/'),
  { allowlist },
));


self.skipWaiting();
clientsClaim();
