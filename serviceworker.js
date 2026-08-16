const CACHE_NAME = 'sumnova-v2-cache-v1';
const STATIC_ASSETS = [
    './index.html',
    './manifest.json',
    './css/style.css',
    './firebaseconfig.js',
    './js/app.js',
    './js/router.js',
    './js/auth.js',
    './js/firestore.js',
    './js/ai.js',
    './js/ui.js',
    './js/settings.js',
    './js/utils.js',
    './js/constants.js',
    './js/storage.js',
    './assets/davonium-technologies-logo.png',
    './assets/icon-192.png',
    './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Do NOT cache Firebase Auth, Firestore, or AI backend requests
    if (
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('firebaseapp.com') ||
        url.hostname.includes('identitytoolkit') ||
        url.hostname.includes('securetoken') ||
        url.pathname.includes('/api/summarize')
    ) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                return networkResponse;
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
