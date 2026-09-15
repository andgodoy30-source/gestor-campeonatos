const CACHE_NAME = 'gestor-campeonatos-v014-fix1';
const APP_SHELL = ['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
const EXTERNAL_LIBS = [
 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
 'https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js'
];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));
  const cache=await caches.open(CACHE_NAME);
  await Promise.allSettled(EXTERNAL_LIBS.map(url=>cache.add(url)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch', event => {
 if(event.request.method!=='GET') return;
 event.respondWith((async()=>{
  const cached=await caches.match(event.request);
  if(cached) return cached;
  try{
   const response=await fetch(event.request);
   if(response && (response.ok || response.type==='opaque')){
    const cache=await caches.open(CACHE_NAME); cache.put(event.request,response.clone());
   }
   return response;
  }catch(err){
   if(event.request.mode==='navigate') return caches.match('./index.html');
   throw err;
  }
 })());
});
