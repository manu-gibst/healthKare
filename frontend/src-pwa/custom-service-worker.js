/* eslint-env serviceworker */

/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config file > pwa > workboxMode is set to "InjectManifest"
 */

import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'

self.skipWaiting()
clientsClaim()

if ('permissions' in navigator && 'query' in navigator.permissions) {
  console.log("Has permissions");
}

console.log("ASKING...");
const status = await navigator.permissions.query({
  name: 'periodic-background-sync',
});
if (status.state === 'granted') {
  console.log("Periodic background sync can be used.");
} else {
  console.log("Periodic background sync cannot be used.");
}
console.log("ASKED");

// const registration = await navigator.serviceWorker.ready;
// if ('periodicSync' in registration) {
//   try {
//     await registration.periodicSync.register('content-sync', {
//       // An interval of one day.
//       minInterval: 24 * 60 * 60 * 1000,
//     });
//   } catch (error) {
//     // Periodic background sync cannot be used.
//   }
// }

self.addEventListener('periodicsync', event => {
  if (event.tag === 'your-sync-tag') {
    event.waitUntil(() => console.log("aaaaaaaa..."));
  }
});

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

// Non-SSR fallbacks to index.html
// Production SSR fallbacks to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      { denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/] }
    )
  )
}
