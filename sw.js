const CACHE_NAME = 'kbify-v3.0';

// Install Event - NO cache.addAll to avoid broken state
self.addEventListener('install', (e) => {
    self.skipWaiting(); // Activate immediately
});

// Activate Event - Clear ALL old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map(key => caches.delete(key)))
        ).then(() => self.clients.claim())
    );
});

// Fetch Event - Network First, cache as fallback only
self.addEventListener('fetch', (e) => {
    // Only handle GET requests over http/https
    if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;

    e.respondWith(
        fetch(e.request)
            .then((res) => {
                // Cache only same-origin successful responses
                if (res.ok && res.type === 'basic') {
                    const clone = res.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(e.request, clone))
                        .catch(() => {}); // silently ignore
                }
                return res;
            })
            .catch(() => caches.match(e.request)) // offline fallback
    );
});
