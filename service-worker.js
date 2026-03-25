/**
 * Rádio FilispiM - Service Worker
 * 
 * Service Worker mínimo para permitir a instalación como PWA.
 * Chrome require un SW rexistrado para mostrar o banner de instalación.
 */

// Nome da caché
// IMPORTANTE: Cambiar o número de versión cando se actualice o SW para forzar a actualización
const CACHE_NAME = 'radio-filispim-v2';

// Arquivos a cachear (só os esenciais)
const FILES_TO_CACHE = [
    './',
    './index.html',
    './app.js',
    './styles.css',
    './texts.config.js'
];

/**
 * Evento de instalación: cachea os archivos esenciais
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

/**
 * Evento de activación: limpa cachés antigas
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => {
                return Promise.all(
                    keys.filter((key) => key !== CACHE_NAME)
                        .map((key) => caches.delete(key))
                );
            })
            .then(() => self.clients.claim())
    );
});

/**
 * Evento fetch: serve desde caché se existe, se non, fetch da rede
 * EXCEPCIÓN: As peticións a api.php sempre van á rede (non se cachean)
 * para garantir que os datos de programación estean sempre actualizados.
 */
self.addEventListener('fetch', (event) => {
    // Ignorar peticións a APIs externas (Google Calendar, RSS, streaming)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    // IGNORAR peticións á API local: sempre ir á rede
    // Isto garante que a programación e o "now playing" estean sempre actualizados
    if (event.request.url.includes('api.php')) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Devolver desde caché se existe
                if (response) {
                    return response;
                }
                // Se non, fetch da rede
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Gardar na caché para futuras peticións
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => cache.put(event.request, responseClone));
                        }
                        return networkResponse;
                    });
            })
    );
});
