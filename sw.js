const CACHE='fintrack-shell-v10';
const ASSETS=['./','./index.html','./styles.css?v=7','./app.js?v=9','./finance.js?v=8','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok)cache.put(event.request,response.clone());return response}).catch(()=>cache.match('./index.html')))));});
