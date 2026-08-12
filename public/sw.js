const CACHE='inspectflow-v8-shell';
const CORE=['/','/dashboard','/field','/icon.svg'];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE).catch(()=>{})))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);if(url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});return response}).catch(async()=>await caches.match(request)||await caches.match('/dashboard')||await caches.match('/')));return;
 }
 if(url.pathname.startsWith('/_next/static/')||url.pathname==='/icon.svg'){
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});return response})));return;
 }
 event.respondWith(fetch(request).catch(()=>caches.match(request)));
});
