'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Letter {
  id: number;
  preview: string;
  date: string;
}

const letters: Letter[] = [
  { id: 1, preview: "오늘 하루도 수고했어요...", date: "2025.12.22" },
  { id: 2, preview: "보고 싶은 마음을 담아...", date: "2025.12.15" },
  { id: 3, preview: "처음 만났던 그 날처럼...", date: "2025.12.08" },
  { id: 4, preview: "항상 고마워요...", date: "2025.12.01" },
];

export default function LetterSection() {
  const [isHovered, setIsHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 스크롤 연동 애니메이션 (rAF throttle) - PC 전용
  useEffect(() => {
    if (isMobile) {
      setScrollProgress(0);
      return;
    }

    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!sectionRef.current) return;

        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const enterStart = windowHeight;
        const enterEnd = windowHeight * 0.4;
        const exitStart = windowHeight * 0.2;
        const exitEnd = -rect.height * 0.3;

        let progress = 0;

        if (rect.top > enterEnd) {
          progress = Math.max(0, Math.min(1, (enterStart - rect.top) / (enterStart - enterEnd)));
        } else if (rect.top > exitEnd) {
          progress = 1;
        } else {
          progress = Math.max(0, Math.min(1, (rect.top - exitEnd) / (exitStart - exitEnd)));
        }

        setScrollProgress(progress);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  // 스크롤 또는 호버 중 하나라도 활성화되면 펼침 효과
  const expandAmount = Math.max(isHovered ? 1 : 0, scrollProgress);

  // 모바일/PC 분리된 애니메이션 계수
  const getCardStyle = useCallback((index: number) => {
    const center = 1.5;
    const offset = index - center;

    // 모바일: 값을 절반으로 축소
    const rotationBase = offset * 4;
    const rotationExpanded = offset * (isMobile ? 7 : 12);
    const translateXBase = offset * (isMobile ? 5 : 8);
    const translateXExpanded = offset * (isMobile ? 22 : 40);
    const translateYBase = index * (isMobile ? 2 : 3);
    const translateYExpanded = index * (isMobile ? -6 : -13);

    const rotation = rotationBase + (rotationExpanded - rotationBase) * expandAmount;
    const translateX = translateXBase + (translateXExpanded - translateXBase) * expandAmount;
    const translateY = translateYBase + (translateYExpanded - translateYBase) * expandAmount;

    const baseShadowY = 2 + index * 1;
    const baseShadowBlur = 8 + index * 2;
    const expandedShadowY = (isMobile ? 6 : 12) + index * (isMobile ? 2 : 3);
    const expandedShadowBlur = (isMobile ? 12 : 24) + index * (isMobile ? 3 : 6);
    const shadowY = baseShadowY + (expandedShadowY - baseShadowY) * expandAmount;
    const shadowBlur = baseShadowBlur + (expandedShadowBlur - baseShadowBlur) * expandAmount;

    return {
      boxShadow: `0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,${0.04 + expandAmount * 0.02}), 0 ${4 + index}px ${8 + index * 2}px rgba(255,138,76,${expandAmount * 0.04})`,
      transform: `rotate(${rotation}deg) translateX(${translateX}px) translateY(${translateY}px)`,
      zIndex: letters.length - index,
    };
  }, [expandAmount, isMobile]);

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-b from-[#FFFBF7] to-[#FFF5EB] pt-4 sm:pt-16 pb-8 sm:pb-[84px] overflow-x-hidden">
      {/* Shimmer 애니메이션 스타일 */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .shimmer-line {
          background: linear-gradient(
            90deg,
            rgba(249, 115, 22, 0.15) 0%,
            rgba(249, 115, 22, 0.3) 25%,
            rgba(253, 186, 116, 0.4) 50%,
            rgba(249, 115, 22, 0.3) 75%,
            rgba(249, 115, 22, 0.15) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2.5s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-8 lg:gap-16">
          {/* 좌측: 편지지 카드 스택 */}
          <div
            className="flex-1 relative w-full hidden sm:block h-[320px] md:h-[420px] lg:h-[450px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
          {letters.map((letter, index) => (
            <div
              key={letter.id}
              className="absolute w-[140px] sm:w-[180px] md:w-[260px] lg:w-[288px] h-[180px] sm:h-[240px] md:h-[340px] lg:h-[378px] left-1/2 top-[25px] sm:top-1/2 -ml-[70px] sm:-ml-[90px] md:-ml-[130px] lg:-ml-[144px] sm:-mt-[120px] md:-mt-[170px] lg:-mt-[189px] bg-gradient-to-br from-white to-[#FDF9F5] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-5 lg:p-7 flex flex-col border border-orange-500/10 cursor-pointer transition-all duration-300 ease-out"
              style={getCardStyle(index)}
            >
              {/* 편지 상단 장식 */}
              <div className="flex justify-between items-start mb-3 sm:mb-5 md:mb-6">
                <div className="text-size-9 sm:text-xs md:text-sm text-orange-500 font-semibold">
                  To. 사랑하는 우리 아들에게
                </div>
                <div className="text-size-8 sm:text-size-10 md:text-size-11 text-[#C4B5A8]">
                  {letter.date}
                </div>
              </div>

              {/* 편지 내용 영역 (shimmer 애니메이션 적용) */}
              <div className="flex-1 space-y-2.5 sm:space-y-4 md:space-y-5">
                <div className="w-[85%] h-1.5 sm:h-2.5 shimmer-line rounded-md" style={{ animationDelay: '0s' }} />
                <div className="w-[70%] h-1.5 sm:h-2.5 shimmer-line rounded-md" style={{ animationDelay: '0.1s' }} />
                <div className="w-[90%] h-1.5 sm:h-2.5 shimmer-line rounded-md" style={{ animationDelay: '0.2s' }} />
                <div className="w-[60%] h-1.5 sm:h-2.5 shimmer-line rounded-md" style={{ animationDelay: '0.3s' }} />
                <div className="w-[75%] h-1.5 sm:h-2.5 shimmer-line rounded-md" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          ))}
          </div>

          {/* 우측: 문구 영역 */}
          <div className="flex-1 w-full max-w-lg text-center lg:text-left relative z-10">
            {/* 서브 타이틀 */}
            <p className="text-size-10 sm:text-sm md:text-base text-orange-400 mb-1.5 sm:mb-3">
              무엇부터 써야 할지 몰라
            </p>

            {/* 메인 타이틀 */}
            <h2 className="text-base sm:text-2xl md:text-size-28 font-bold text-gray-900 leading-snug mb-2 sm:mb-4">
              시작조차 하기 어려웠습니다.
            </h2>

            {/* 출처 */}
            <p className="text-size-9 sm:text-sm text-gray-400 mb-5 sm:mb-10 md:mb-12">
              서울구치소 · 이OO 엄마
            </p>

            {/* 구분선 - 데스크탑만 표시 */}
            <div className="hidden sm:block w-full h-px bg-gray-200 mb-5 sm:mb-10 md:mb-12" />

            {/* 강조 문구 */}
            <div className="mb-1.5 sm:mb-3">
              <p className="text-size-10 sm:text-sm md:text-base text-orange-500 mb-1 sm:mb-2">
                투오렌지에서 편지를 보낸 후
              </p>
              <h3 className="text-base sm:text-2xl md:text-3xl font-bold text-orange-500 leading-snug">
                매주 1통씩 편지를 쓰고 있습니다.
              </h3>
            </div>

            {/* 후기 출처 */}
            <p className="text-size-10 sm:text-sm text-gray-400 mb-5 sm:mb-8">
              2025.12 · 실제 투오렌지 이용후기 중에서
            </p>

            {/* CTA 버튼 */}
            <Link
              href="/letter/compose/1"
              className="group relative inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white px-5 sm:px-10 py-2.5 sm:py-4 rounded-full text-xs sm:text-base font-semibold overflow-hidden transition-all hover:shadow-lg hover:shadow-orange-500/25"
            >
              <span className="relative z-10">나도 편지 보내기</span>
              <span className="relative z-10">→</span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </Link>
          </div>
        </div>
      </div>

      {/* 하단 미색 단색 마감 */}
      <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-[#FFF5EB]" />
    </section>
  );
}
