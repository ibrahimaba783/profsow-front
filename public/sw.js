const CACHE_NAME = 'aliou-sow-academy-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignorer toutes les requêtes non-GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ne jamais intercepter les requêtes API backend, chrome-extension ou WebSocket
  if (
    url.pathname.startsWith('/api') ||
    url.port === '5000' ||
    !url.protocol.startsWith('http')
  ) {
    return;
  }

  // Pour les requêtes de navigation et les ressources statiques
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Mettre en cache uniquement les réponses valides et du même domaine
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // Si navigation et hors-ligne, essayer la racine en cache
        if (event.request.mode === 'navigate') {
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
        }

        // Toujours renvoyer un objet Response valide au lieu d'undefined
        return new Response('Réseau temporairement indisponible.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' }),
        });
      })
  );
});
