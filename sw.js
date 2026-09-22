const CACHE_NAME = 'chipsy-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png'
];

// مرحلة التثبيت: حفظ الملفات الأساسية فوراً
self.addEventListener('install', event => {
  self.skipWaiting(); // إجبار المتصفح على تفعيل التحديث فوراً
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// مرحلة التفعيل: مسح أي كاش قديم لتنظيف مساحة الجهاز
self.addEventListener('activate', event => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// مرحلة جلب البيانات (Fetch): الشبكة أولاً، ثم الكاش
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // إذا نجح الاتصال بالإنترنت، قم بتحديث الكاش بالنسخة الجديدة بصمت
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // إذا كان المستخدم أوفلاين، اعرض النسخة المحفوظة في الكاش
        return caches.match(event.request);
      })
  );
});
