// LexiLog Service Worker for PWA functionality
// Version 1.0

const CACHE_NAME = 'lexilog-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  // Firebase SDKs
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js',
  // Tesseract.js for OCR
  'https://unpkg.com/tesseract.js@v4.1.1/dist/tesseract.min.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('LexiLog Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('LexiLog Service Worker: Caching app shell');
        return cache.addAll(urlsToCache.map(url => {
          return new Request(url, { cache: 'reload' });
        }));
      })
      .catch((error) => {
        console.error('LexiLog Service Worker: Cache failed:', error);
      })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('LexiLog Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('LexiLog Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Ensure the service worker takes control immediately
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('firebasejs') &&
      !event.request.url.includes('tailwindcss') &&
      !event.request.url.includes('tesseract')) {
    return;
  }

  // Handle dictionary API requests
  if (event.request.url.includes('api.dictionaryapi.dev')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If online, cache the response and return it
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, try to get from cache
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return a custom offline response for API calls
              return new Response(
                JSON.stringify({
                  error: 'Offline',
                  message: 'Dictionary search requires internet connection'
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response.ok) {
              return response;
            }
            
            // Clone the response since it's a stream
            const responseClone = response.clone();
            
            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Only cache GET requests
                if (event.request.method === 'GET') {
                  cache.put(event.request, responseClone);
                }
              });
            
            return response;
          })
          .catch((error) => {
            console.log('LexiLog Service Worker: Fetch failed:', error);
            
            // For navigation requests, show a custom offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/') || new Response(
                '<!DOCTYPE html><html><head><title>LexiLog - Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui;text-align:center;padding:2rem;background:#f8fafc}h1{color:#3B82F6;margin-bottom:1rem}p{color:#6b7280;margin-bottom:2rem}.btn{background:#3B82F6;color:white;padding:0.75rem 1.5rem;border:none;border-radius:0.5rem;cursor:pointer}.btn:hover{background:#2563eb}</style></head><body><h1>📚 LexiLog</h1><p>You are currently offline. Your saved vocabulary is still available!</p><button class="btn" onclick="location.reload()">Try Again</button></body></html>',
                {
                  headers: { 'Content-Type': 'text/html' }
                }
              );
            }
            
            // For other requests, return a generic offline response
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background sync for saving vocabulary when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-vocabulary') {
    console.log('LexiLog Service Worker: Background sync triggered');
    event.waitUntil(syncVocabulary());
  }
});

// Sync vocabulary data when back online
async function syncVocabulary() {
  try {
    // Get pending vocabulary items from IndexedDB or localStorage
    // This would sync with Firebase when connection is restored
    console.log('LexiLog Service Worker: Syncing vocabulary data');
  } catch (error) {
    console.error('LexiLog Service Worker: Sync failed:', error);
  }
}

// Push notification handling (for future daily word notifications)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1'
      },
      actions: [
        {
          action: 'explore',
          title: 'Learn Word',
          icon: '/icon-192.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icon-192.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification('LexiLog - Word of the Day', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app to the word of the day
    event.waitUntil(
      clients.openWindow('/?view=daily')
    );
  } else {
    // Open the main app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('LexiLog Service Worker: Loaded successfully');
