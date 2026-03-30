// 기반 단계: 빈 Service Worker (설치 프롬프트용)
// 오프라인 캐싱 전략은 이후 단계에서 추가
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
