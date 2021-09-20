const self = this;

const cacheName = "cache-v1";
const precacheResources = ["/", "/public/index.html"];

self.addEventListener("install", (event) => {
  console.log("service worker installed");
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(precacheResources))
  );
});

self.addEventListener("activate", () => {
  console.log("service worker activated.");
});

self.addEventListener("fetch", (event) => {
  console.log(`user requsted for ${event.request.url}`);
  event.respondWith(
    caches.match(event.request).then((result) => {
      return result ? result : fetch(event.request);
    })
  );
});
