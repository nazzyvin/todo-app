const CACHE_NAME = 'blueflow-v1';
const STATIC_ASSETS = [
    '/',
    '/login/',
    '/dashboard/',
    '/settings/',
    '/static/css/style.css',
    '/static/js/script.js',
    '/static/js/auth.js',
    '/static/js/settings.js',
    '/static/js/dashboard,js',
    '/static/js/theme.js',
];

// Install — cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', event => {
    // Skip API calls — always fetch from network
    if (event.request.url.includes('/api/')) return;

    event.respondWith(
        caches.match(event.request).then(caches => {
            return cached || fetch(event.request).then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME). then(cache => cache.put(event.request, clone));
                return response;
            });
        })
    );
});
