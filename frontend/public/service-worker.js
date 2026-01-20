/* eslint-disable no-restricted-globals */

// Enhanced Service Worker for MDRRMO Pio Duran PWA with Full Offline Support
const CACHE_NAME = 'mdrrmo-pio-duran-v2';
const RUNTIME_CACHE = 'mdrrmo-runtime-v2';
const API_CACHE = 'mdrrmo-api-v2';
const IMAGE_CACHE = 'mdrrmo-images-v2';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/logome.webp',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Cache size limits
const MAX_CACHE_SIZE = {
  [RUNTIME_CACHE]: 50,
  [API_CACHE]: 100,
  [IMAGE_CACHE]: 50
};

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v2 with enhanced offline support...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(
          STATIC_ASSETS.map(url => new Request(url, { credentials: 'same-origin' }))
        ).catch((error) => {
          console.warn('[Service Worker] Some assets failed to cache:', error);
          // Continue anyway - we'll cache them on demand
        });
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, API_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Trim cache to max size
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxItems);
  }
}

// Determine cache strategy based on request
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // Google API requests - network first, cache fallback
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('google.com')) {
    return 'networkFirst';
  }
  
  // Images - cache first
  if (request.destination === 'image' || /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname)) {
    return 'cacheFirst';
  }
  
  // CSS, JS, Fonts - cache first with network update
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'font' ||
      /\.(css|js|woff2?|ttf|eot)$/i.test(url.pathname)) {
    return 'staleWhileRevalidate';
  }
  
  // Default - network first
  return 'networkFirst';
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
      await trimCache(cacheName, MAX_CACHE_SIZE[cacheName] || 50);
    }
    return response;
  } catch (error) {
    console.log('[Service Worker] Fetch failed for:', request.url);
    // Return cached version of index.html as fallback
    return cache.match('/index.html');
  }
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
      await trimCache(cacheName, MAX_CACHE_SIZE[cacheName] || 100);
    }
    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache for:', request.url);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // If it's a navigation request, return the cached index.html
    if (request.mode === 'navigate') {
      return cache.match('/index.html');
    }
    
    throw error;
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
      trimCache(cacheName, MAX_CACHE_SIZE[cacheName] || 50);
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests except for Google APIs
  if (!url.origin.includes(self.location.origin) && 
      !url.hostname.includes('googleapis.com') &&
      !url.hostname.includes('google.com') &&
      !url.hostname.includes('gstatic.com')) {
    return;
  }
  
  // Determine which cache to use
  let cacheName = RUNTIME_CACHE;
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('google.com')) {
    cacheName = API_CACHE;
  } else if (request.destination === 'image' || /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname)) {
    cacheName = IMAGE_CACHE;
  }
  
  // Apply appropriate caching strategy
  const strategy = getCacheStrategy(request);
  
  event.respondWith(
    (async () => {
      switch (strategy) {
        case 'cacheFirst':
          return cacheFirst(request, cacheName);
        case 'networkFirst':
          return networkFirst(request, cacheName);
        case 'staleWhileRevalidate':
          return staleWhileRevalidate(request, cacheName);
        default:
          return networkFirst(request, cacheName);
      }
    })()
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[Service Worker] Syncing data in background...');
  // This can be used to sync any pending data when connection is restored
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_COMPLETE' });
  });
}

// Handle messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    // Cache specific URLs on demand
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        self.clients.matchAll().then((clients) => {
          clients.forEach(client => {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        });
      })
    );
  }
});
