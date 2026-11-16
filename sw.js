/* Print Care ऐप-पेज: सिर्फ अपनी 5 फ़ाइलें याद रखता है (ऐप का डेटा नहीं) — Install के लिए ज़रूरी */
const C = 'pc-shell-v4';
const FILES = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/icon-180.png', '/icon-maskable-512.png', '/favicon-32.png', '/logo.webp'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  /* पहले नेट से (नया), न मिले तो याद वाला */
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then(m => m || caches.match('/'))));
});
/* 🔔 Push आया (ऐप बंद / पीछे) → फ़ोन की सूचना; ऐप सामने खुला हो तो नहीं (वहाँ घंटी है) */
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = {}; }
  const p = d.data || d.notification || d;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    if (cs.some(c => c.visibilityState === 'visible' && c.focused)) return;
    return self.registration.showNotification(p.title || 'Print Care', { body: p.body || '', tag: p.tag || undefined, renotify: !!p.tag, icon: '/icon-192.png', badge: '/icon-192.png', data: { link: p.link || '/' } });
  }));
});
/* 🔔 सूचना दबाई = ऐप खोलो */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => { for (const c of cs) { if ('focus' in c) return c.focus(); } return self.clients.openWindow('/'); }));
});
