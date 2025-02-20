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
}

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

self.skipWaiting();
clientsClaim();