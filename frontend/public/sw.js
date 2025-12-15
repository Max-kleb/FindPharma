/**
 * FindPharma Service Worker
 * Gère le cache et le mode hors-ligne
 */

const CACHE_NAME = 'findpharma-v1';
const STATIC_CACHE = 'findpharma-static-v1';
const DYNAMIC_CACHE = 'findpharma-dynamic-v1';
const API_CACHE = 'findpharma-api-v1';

// Ressources statiques à pré-cacher
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico',
  '/offline.html'
];

// URLs API à cacher
const API_PATTERNS = [
  '/api/medicines/',
  '/api/pharmacies/',
  '/api/medicines/categories/',
  '/api/medicines/popular/'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pré-cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.log('[SW] Erreur pré-cache:', err))
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== API_CACHE)
            .map((key) => {
              console.log('[SW] Suppression ancien cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Stratégie de cache pour les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne pas intercepter les requêtes non-GET
  if (request.method !== 'GET') return;

  // Ignorer les extensions Chrome et les WebSocket
  if (url.protocol === 'chrome-extension:' || url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // Stratégie selon le type de ressource
  if (isAPIRequest(url)) {
    // API: Network First, fallback to cache
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  } else if (isStaticAsset(url)) {
    // Statique: Cache First
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else {
    // Autres: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// Vérifier si c'est une requête API
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || API_PATTERNS.some(pattern => url.pathname.includes(pattern));
}

// Vérifier si c'est une ressource statique
function isStaticAsset(url) {
  return (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2')
  );
}

// Stratégie: Cache First
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return caches.match('/offline.html');
  }
}

// Stratégie: Network First
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    // Pour les requêtes API, retourner une réponse d'erreur JSON
    if (isAPIRequest(new URL(request.url))) {
      return new Response(
        JSON.stringify({ 
          error: 'Hors ligne', 
          message: 'Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.',
          offline: true 
        }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return caches.match('/offline.html');
  }
}

// Stratégie: Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  return cachedResponse || fetchPromise || caches.match('/offline.html');
}

// Synchronisation en arrière-plan (si supporté)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync:', event.tag);
  
  if (event.tag === 'sync-reservations') {
    event.waitUntil(syncReservations());
  }
});

// Synchroniser les réservations en attente
async function syncReservations() {
  try {
    const pendingReservations = await getPendingReservations();
    
    for (const reservation of pendingReservations) {
      await fetch('/api/cart/reservations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation)
      });
    }
    
    // Nettoyer les réservations synchronisées
    await clearPendingReservations();
  } catch (error) {
    console.error('[SW] Erreur sync réservations:', error);
  }
}

// Notifications Push (si configuré)
self.addEventListener('push', (event) => {
  console.log('[SW] Push reçu:', event);
  
  let data = { title: 'FindPharma', body: 'Nouvelle notification' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.message,
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clic notification:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si une fenêtre est déjà ouverte, la focus
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Sinon ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Helpers pour IndexedDB (réservations hors-ligne)
async function getPendingReservations() {
  // Implémentation simplifiée - à étendre avec IndexedDB
  const stored = localStorage?.getItem('pendingReservations');
  return stored ? JSON.parse(stored) : [];
}

async function clearPendingReservations() {
  localStorage?.removeItem('pendingReservations');
}
