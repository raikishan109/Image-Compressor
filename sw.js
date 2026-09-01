const CACHE_NAME = 'kbify-v1.0';

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/css/main.css',
    '/js/main.js',
    '/js/navigation.js',
    '/js/state.js',
    '/js/theme.js',
    '/js/sidebar.js',
    '/js/tools/registry.js',
    '/js/tools/common.js',
    '/js/tools/image/compressor.js',
    '/js/tools/image/converter.js',
    '/js/tools/pdf/compressor.js',
    '/js/tools/pdf/editor.js',
    '/js/tools/pdf/merger.js',
    '/js/tools/pdf/viewer.js',
    '/js/utils/file-utils.js',
    '/js/utils/ui-utils.js',
    '/js/components/Modal.js',
    '/assets/logo.svg',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=block'
];

// Install — pre-cache all static assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate — delete OLD caches only (not current)
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch — Cache First for same-origin, Network First for CDN
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;

    const url = new URL(e.request.url);
    const isSameOrigin = url.origin === self.location.origin;

    if (isSameOrigin) {
        // Cache First for own assets
        e.respondWith(
            caches.match(e.request).then(cached => {
                if (cached) return cached;
                return fetch(e.request).then(res => {
                    if (res.ok) {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                    }
                    return res;
                }).catch(() => caches.match('/index.html'));
            })
        );
    } else {
        // Network First for CDN (fonts, pdf-lib, etc.)
        e.respondWith(
            fetch(e.request)
                .then(res => {
                    if (res.ok) {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                    }
                    return res;
                })
                .catch(() => caches.match(e.request))
        );
    }
});
