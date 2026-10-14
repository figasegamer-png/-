// Offline-first application shell. Bump this version whenever the app changes.
const CACHE = 'gsm-offline-v9-20261014';
const APP_SHELL = ['./', './index.html', './icon.svg', './manifest.webmanifest', './emblem_48940.png'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(APP_SHELL.map(path => new Request(path, {cache: 'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('gsm-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const url = new URL(request.url);
    if (request.mode === 'navigate') {
      // The HTML is self-contained, so it is safe to serve offline.
      const cached = await cache.match(request, {ignoreSearch: true}) || await cache.match('./index.html') || await cache.match('./');
      if (cached) return cached;
      try { return await fetch(request); } catch (_) { return new Response('Приложението още не е запазено за офлайн работа.', {status: 503, headers: {'Content-Type':'text/plain; charset=utf-8'}}); }
    }
    const cached = await cache.match(request, {ignoreSearch: true});
    if (cached) return cached;
    try { return await fetch(request); } catch (_) { return new Response('Офлайн ресурсът не е наличен.', {status: 503}); }
  })());
});
