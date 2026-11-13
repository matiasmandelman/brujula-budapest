/* Brújula Budapest: funciona sin cobertura (metro, festival, roaming lento).
   - La app: primero red y, si no hay, la copia guardada.
   - three.js y el mapa de OpenStreetMap: copia guardada primero (no cambian). */
const V='brujula-v3',APP=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(APP)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  const keep=res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res};
  if(u.hostname==='cdn.jsdelivr.net'||u.hostname==='tile.openstreetmap.org'){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(keep)));return;
  }
  if(u.origin===location.origin||u.hostname==='api.open-meteo.com'||u.hostname==='api.frankfurter.app'||u.hostname==='overpass-api.de'){
    e.respondWith(fetch(r).then(keep).catch(()=>caches.match(r).then(hit=>hit||(r.mode==='navigate'?caches.match('./index.html'):Response.error()))));
  }
});
