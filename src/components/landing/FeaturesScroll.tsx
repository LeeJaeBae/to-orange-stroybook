'use client';

import { useRef, useEffect, useState } from 'react';
import useScrollAnimation from '@/hooks/useScrollAnimation';

export default function FeaturesScroll() {
  const sectionRef = useScrollAnimation<HTMLElement>();
  const topRowRef = useRef<HTMLDivElement>(null);
  const bottomRowRef = useRef<HTMLDivElement>(null);
  const [topRowWidth, setTopRowWidth] = useState(0);
  const [bottomRowWidth, setBottomRowWidth] = useState(0);

  const topRowCards = [
    // User Profile Card
    <div key="profile" className="shrink-0 w-64 h-48 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-sm font-medium">김</span>
        </div>
        <div>
          <p className="font-semibold text-gray-900">김지영</p>
          <p className="text-xs text-gray-500">가족</p>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <span className="text-xs px-2 py-1 bg-orange-50 text-orange-500 rounded">감사</span>
        <span className="text-xs px-2 py-1 bg-orange-50 text-orange-500 rounded">응원</span>
      </div>
      <button className="mt-auto px-4 py-2 text-sm text-orange-500 border border-orange-200 rounded-md hover:bg-orange-50">
        편지 보내기
      </button>
    </div>,

    // Progress Circle
    <div key="progress" className="shrink-0 w-40 h-48 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col items-center justify-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6" fill="none" />
          <circle cx="32" cy="32" r="28" stroke="#f97316" strokeWidth="6" fill="none" strokeDasharray="176" strokeDashoffset="49" strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-bold text-gray-900">72%</span>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">오렌지나무<br />성장</p>
    </div>,

    // Time Capsule
    <div key="capsule" className="shrink-0 w-40 h-48 bg-orange-500 rounded-2xl p-5 text-white flex flex-col items-center justify-center shadow-lg shadow-orange-300/50 hover:shadow-[0_30px_60px_rgba(249,115,22,0.7)] hover:-translate-y-6 hover:scale-110 hover:rotate-1 transition-all duration-300 cursor-pointer">
      <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeWidth="2" d="M12 6v6l4 2" />
      </svg>
      <p className="font-bold text-lg">타임캡슐</p>
      <p className="text-sm opacity-80">함께 선물하기</p>
    </div>,

    // Stats - Delivered Hearts
    <div key="hearts" className="shrink-0 w-56 h-48 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="text-xs text-green-500">+24.5%</span>
        </div>
        <span className="inline-block text-xs px-2 py-1 bg-orange-50 text-orange-500 rounded mb-1">인기</span>
        <p className="text-3xl font-bold text-orange-500">12,847</p>
        <p className="text-sm text-gray-500">전달된 마음</p>
      </div>
      <svg className="w-12 h-12 text-orange-100" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>,

    // Template Count
    <div key="templates" className="shrink-0 w-40 h-48 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <p className="text-3xl font-bold text-gray-900">100+</p>
      <p className="text-sm text-gray-500">편지지 템플릿</p>
      <svg className="w-5 h-5 text-orange-500 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="2" />
        <path strokeWidth="2" d="m22 7-10 6L2 7" />
      </svg>
    </div>,

    // Orange Tree Level
    <div key="tree" className="shrink-0 w-40 h-48 bg-orange-500 rounded-2xl p-5 text-white flex flex-col items-center justify-center shadow-lg shadow-orange-300/50 hover:shadow-[0_30px_60px_rgba(249,115,22,0.7)] hover:-translate-y-6 hover:scale-110 hover:rotate-1 transition-all duration-300 cursor-pointer">
      <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeWidth="2" d="M12 22v-7m-4 7h8M9 9a3 3 0 1 0 3-6 3 3 0 0 0-3 6zm-3 3a6 6 0 0 0 12 0c0-3-3-6-6-6s-6 3-6 6z" />
      </svg>
      <p className="text-3xl font-bold">Lv.3</p>
      <p className="text-sm opacity-80">오렌지나무</p>
    </div>,
  ];

  const bottomRowCards = [
    // Notification Toggle
    <div key="toggle" className="shrink-0 w-44 h-36 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-center gap-3 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-900">알림</span>
        <div className="w-10 h-6 bg-orange-500 rounded-full relative">
          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">예약발송</span>
        <div className="w-10 h-6 bg-gray-200 rounded-full relative">
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
        </div>
      </div>
    </div>,

    // Main Features
    <div key="features" className="shrink-0 w-52 h-36 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <p className="text-sm font-medium text-gray-900 mb-3">주요 기능</p>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><span className="text-orange-500">✨</span><span>AI다듬기</span></div>
        <div className="flex items-center gap-1.5"><span className="text-orange-500">🍊</span><span>오렌지 나무</span></div>
        <div className="flex items-center gap-1.5"><span className="text-orange-500">💌</span><span>타임캡슐</span></div>
        <div className="flex items-center gap-1.5"><span className="text-orange-500">✍️</span><span>손편지 담기</span></div>
      </div>
    </div>,

    // Users Today
    <div key="users" className="shrink-0 w-48 h-36 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-center gap-3 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className="flex -space-x-2">
        {['김', '이', '박', '최'].map((name, i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs">{name}</div>
        ))}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">+99</p>
        <p className="text-xs text-gray-500">오늘 발송</p>
      </div>
    </div>,

    // Letter Writing Steps
    <div key="steps" className="shrink-0 w-48 h-36 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <p className="text-sm font-medium text-gray-900 mb-2">편지 작성 단계</p>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2"><span className="text-orange-500">✓</span><span className="text-gray-500">받는 사람</span></div>
        <div className="flex items-center gap-2"><span className="text-orange-500">✓</span><span className="text-gray-500">편지지 선택</span></div>
        <div className="flex items-center gap-2"><span className="text-gray-400">○</span><span className="text-gray-500">편지 작성</span></div>
      </div>
    </div>,

    // First Letter CTA
    <div key="cta" className="shrink-0 w-52 h-36 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div>
        <p className="font-semibold text-gray-900">첫 편지 보내기</p>
        <p className="text-xs text-gray-500">지금 시작하세요</p>
      </div>
      <button className="px-4 py-2 bg-orange-500 text-white text-sm rounded-full hover:bg-orange-600">시작</button>
    </div>,

    // Sent Letters Count
    <div key="count" className="shrink-0 w-36 h-36 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className="text-center">
        <p className="text-3xl font-bold text-orange-500">24</p>
        <p className="text-xs text-gray-500">보낸 편지</p>
      </div>
    </div>,

    // Postal Types
    <div key="postal" className="shrink-0 w-56 h-36 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <p className="text-sm font-medium text-gray-900 mb-3">우편 종류</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between"><span className="text-orange-500">준등기</span><span className="text-gray-500">1,800원</span></div>
        <div className="flex justify-between"><span className="text-orange-500">일반등기</span><span className="text-gray-500">2,830원</span></div>
        <div className="flex justify-between"><span className="text-gray-500">일반우편</span><span className="text-gray-500">430원</span></div>
        <div className="flex justify-between"><span className="text-gray-500">익일특급</span><span className="text-gray-500">3,530원</span></div>
      </div>
    </div>,
  ];

  // 카드 세트의 실제 너비 측정
  useEffect(() => {
    const measureWidths = () => {
      if (topRowRef.current) {
        // 첫 번째 카드 세트의 너비 = 전체 너비 / 2 (두 세트가 복제되어 있으므로)
        const topChildren = topRowRef.current.children;
        let width = 0;
        const gap = 16; // gap-4 = 16px
        for (let i = 0; i < topRowCards.length; i++) {
          if (topChildren[i]) {
            width += (topChildren[i] as HTMLElement).offsetWidth + gap;
          }
        }
        setTopRowWidth(width);
      }
      if (bottomRowRef.current) {
        const bottomChildren = bottomRowRef.current.children;
        let width = 0;
        const gap = 16;
        for (let i = 0; i < bottomRowCards.length; i++) {
          if (bottomChildren[i]) {
            width += (bottomChildren[i] as HTMLElement).offsetWidth + gap;
          }
        }
        setBottomRowWidth(width);
      }
    };

    // 초기 측정을 약간 지연시켜 정확한 값을 얻음
    const timer = setTimeout(measureWidths, 100);
    window.addEventListener('resize', measureWidths);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureWidths);
    };
  }, [topRowCards.length, bottomRowCards.length]);

  return (
    <section ref={sectionRef} className="py-6 md:py-20  bg-white">
      {/* CSS 애니메이션 정의 - CSS 변수 사용 */}
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(var(--scroll-width) * -1));
          }
        }
        @keyframes scroll-right {
          0% {
            transform: translateX(calc(var(--scroll-width) * -1));
          }
          100% {
            transform: translateX(0);
          }
        }
        .scroll-row-left {
          animation: scroll-left 30s linear infinite;
          will-change: transform;
        }
        .scroll-row-right {
          animation: scroll-right 30s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 ">
        <div className="text-center mb-12 fade-up">
          <p className="text-orange-500 font-medium mb-2">Features</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">편지쓰기의 모든 것</h2>
          <p className="text-gray-500">소중한 마음을 담아 편지를 써보세요</p>
        </div>
      </div>

      {/* Scrolling Rows */}
      <div className="space-y-4">
        {/* Top Row - Scroll Left */}
        <div className="relative overflow-hidden">
          <div
            ref={topRowRef}
            className={`flex gap-4 ${topRowWidth > 0 ? 'scroll-row-left' : ''}`}
            style={{
              '--scroll-width': `${topRowWidth}px`,
              width: 'fit-content',
            } as React.CSSProperties}
          >
            {topRowCards}
            {topRowCards}{topRowCards}
          </div>
        </div>

        {/* Bottom Row - Scroll Right (hidden on mobile) */}
        <div className="relative overflow-hidden hidden md:block">
          <div
            ref={bottomRowRef}
            className={`flex gap-4 ${bottomRowWidth > 0 ? 'scroll-row-right' : ''}`}
            style={{
              '--scroll-width': `${bottomRowWidth}px`,
              width: 'fit-content',
            } as React.CSSProperties}
          >
            {bottomRowCards}
            {bottomRowCards}{bottomRowCards}
          </div>
        </div>
      </div>
    </section>
  );
}
