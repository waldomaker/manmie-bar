const CACHE_NAME = "manmie-bar-v3";
const STATIC_ASSETS = [
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") return;
  var url = event.request.url;

  // Don't cache Firebase requests at all - always go to network
  if (url.indexOf("firebaseio.com") !== -1 || url.indexOf("googleapis.com") !== -1 || url.indexOf("gstatic.com") !== -1) {
    return;
  }

  // Network-first for HTML and JS so content/admin changes show up immediately
  if (event.request.mode === "navigate" || url.endsWith(".html") || url.endsWith(".js")) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request).then(function(cached){
          return cached || caches.match("./index.html");
        });
      })
    );
    return;
  }

  // Cache-first for static assets (icons, manifest, fonts)
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        if (response && response.status === 200 && response.type !== "opaque") {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        }
        return response;
      });
    })
  );
});
