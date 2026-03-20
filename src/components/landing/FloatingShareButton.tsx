'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FloatingShareButton() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 모바일 감지 (화면 크기 + 터치 지원)
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice && isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleShare = () => {
    // 항상 toorange.co.kr 도메인으로 공유
    // 공유 링크는 항상 루트 URL만 사용
    const canonicalUrl = 'https://toorange.co.kr';

    if (isMobile) {
      // 모바일: 공유 페이지로 이동
      const shareUrl = encodeURIComponent(canonicalUrl);
      const shareTitle = encodeURIComponent(document.title || '투오렌지');
      router.push(`/share?url=${shareUrl}&title=${shareTitle}`);
    } else {
      // 데스크탑: 링크 복사
      navigator.clipboard.writeText(canonicalUrl).then(() => {
        // 토스트 대신 간단한 알림
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-[60] animate-fade-in';
        toast.textContent = '링크가 복사되었습니다';
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.classList.add('animate-fade-out');
          setTimeout(() => toast.remove(), 300);
        }, 2000);
      });
    }
  };

  return (
    <button
      onClick={handleShare}
      className="fixed bottom-[90px] md:bottom-[70px] right-4 md:right-6 z-50 bg-orange-500 text-white w-11 h-11 md:w-12 md:h-12 rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-105 flex items-center justify-center"
      aria-label="링크 공유"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    </button>
  );
}
