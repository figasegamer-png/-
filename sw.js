// Version 6: network-first for HTML to prevent showing outdated calculations.
const CACHE='gsm-v6-20261013';
const ASSETS=['./icon.svg','./manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys()){if(key!==CACHE)await caches.delete(key)}await self.clients.claim()})())});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 if(request.mode==='navigate'||request.destination==='document'){
   event.respondWith(fetch(new Request(request,{cache:'no-store'})).catch(()=>caches.match(request)));
   return;
 }
 event.respondWith(fetch(request).catch(()=>caches.match(request)));
});
