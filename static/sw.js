// Service Worker para Lumiar Linktree
const CACHE_NAME = 'lumiar-linktree-v1';
const urlsToCache = [
    '/',
    '/static/css/style.css',
    '/static/js/main.js',
    '/static/js/empreendimentos.js',
    '/static/images/placeholder.jpg',
    '/empreendimentos',
    '/campanhas',
    '/vagas',
    '/contato'
];

// Instalar Service Worker
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Buscar do cache
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - retorna resposta
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

// Atualizar Service Worker
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Push notifications (futuro)
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/static/images/icon-192.png',
            badge: '/static/images/badge-72.png',
            actions: [
                {
                    action: 'whatsapp',
                    title: 'Abrir WhatsApp',
                    icon: '/static/images/whatsapp-icon.png'
                },
                {
                    action: 'close',
                    title: 'Fechar'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Ação das notificações
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'whatsapp') {
        event.waitUntil(
            clients.openWindow('https://wa.me/5511999999999?text=Olá! Vi a notificação da Lumiar.')
        );
    } else if (event.action !== 'close') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});