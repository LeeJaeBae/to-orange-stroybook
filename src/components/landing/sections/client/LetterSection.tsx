'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { letterPreviews } from '../../lib/landing-data';
import { useScrollReveal } from '../../lib/useScrollReveal';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  편지 카드 내용                                                      */
/* ------------------------------------------------------------------ */
function LetterCardContent({ date }: { date: string }) {
  return (
    <>
      <div className="flex justify-between items-start mb-3 sm:mb-5 md:mb-6">
        <span className="text-[9px] sm:text-xs md:text-sm text-orange-500 font-semibold">
          To. 사랑하는 우리 아들에게
        </span>
        <span className="text-[8px] sm:text-[10px] md:text-[11px] text-[#C4B5A8]">{date}</span>
      </div>
      <div className="flex-1 space-y-2.5 sm:space-y-4 md:space-y-5">
        {[85, 70, 90, 60, 75].map((w, i) => (
          <div
            key={i}
            className="h-1.5 sm:h-2.5 shimmer-line rounded-md"
            style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  LetterSection                                                      */
/* ------------------------------------------------------------------ */
export function LetterSection() {
  const [isHovered, setIsHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { ref: revealRef, revealed } = useScrollReveal();

  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      sectionRef.current = node;
      (revealRef as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    [revealRef],
  );

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 스크롤 연동 애니메이션 (모바일 + PC)
  useEffect(() => {
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const wh = window.innerHeight;
        const enterStart = wh;
        const enterEnd = wh * 0.4;
        const exitStart = wh * 0.2;
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
  }, []);

  const expandAmount = Math.max(isHovered ? 1 : 0, scrollProgress);

  const getCardStyle = useCallback((index: number) => {
    const center = (letterPreviews.length - 1) / 2;
    const offset = index - center;

    const rotBase = offset * 4;
    const rotExp = offset * (isMobile ? 7 : 12);
    const txBase = offset * (isMobile ? 5 : 8);
    const txExp = offset * (isMobile ? 22 : 40);
    const tyBase = index * (isMobile ? 2 : 3);
    const tyExp = index * (isMobile ? -6 : -13);

    const rot = rotBase + (rotExp - rotBase) * expandAmount;
    const tx = txBase + (txExp - txBase) * expandAmount;
    const ty = tyBase + (tyExp - tyBase) * expandAmount;

    const baseSY = 2 + index;
    const baseSB = 8 + index * 2;
    const expSY = (isMobile ? 6 : 12) + index * (isMobile ? 2 : 3);
    const expSB = (isMobile ? 12 : 24) + index * (isMobile ? 3 : 6);
    const sy = baseSY + (expSY - baseSY) * expandAmount;
    const sb = baseSB + (expSB - baseSB) * expandAmount;

    return {
      boxShadow: `0 ${sy}px ${sb}px rgba(0,0,0,${0.04 + expandAmount * 0.02}), 0 ${4 + index}px ${8 + index * 2}px rgba(255,138,76,${expandAmount * 0.04})`,
      transform: `rotate(${rot}deg) translateX(${tx}px) translateY(${ty}px)`,
      zIndex: letterPreviews.length - index,
    };
  }, [expandAmount, isMobile]);

  return (
    <section
      ref={mergedRef}
      className={cn('scroll-reveal', revealed && 'revealed', 'relative overflow-x-hidden bg-gradient-to-b from-[#FFFBF7] to-[#FFF5EB] pt-4 sm:pt-16 pb-8 sm:pb-[84px]')}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-line {
          background: linear-gradient(90deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.3) 25%, rgba(253,186,116,0.4) 50%, rgba(249,115,22,0.3) 75%, rgba(249,115,22,0.15) 100%);
          background-size: 200% 100%;
          animation: shimmer 2.5s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-8 lg:gap-16">
          {/* 카드 스택 — 스크롤/호버에 따라 펼쳐짐 */}
          <div
            className="relative w-full shrink-0 h-[260px] sm:h-[320px] md:h-[420px] lg:flex-1 lg:h-[450px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {letterPreviews.map((letter, index) => (
              <div
                key={letter.id}
                className="absolute w-[160px] sm:w-[180px] md:w-[260px] lg:w-[288px] h-[210px] sm:h-[240px] md:h-[340px] lg:h-[378px] left-1/2 top-[20px] sm:top-1/2 -ml-[80px] sm:-ml-[90px] md:-ml-[130px] lg:-ml-[144px] sm:-mt-[120px] md:-mt-[170px] lg:-mt-[189px] bg-gradient-to-br from-white to-[#FDF9F5] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-5 lg:p-7 flex flex-col border border-orange-500/10 cursor-pointer transition-all duration-300 ease-out"
                style={getCardStyle(index)}
              >
                <LetterCardContent date={letter.date} />
              </div>
            ))}
          </div>

          {/* 우측: 문구 영역 */}
          <div className="flex-1 w-full max-w-lg text-center lg:text-left relative z-10">
            <p className="reveal-child text-[10px] sm:text-sm md:text-base text-orange-400 mb-1.5 sm:mb-3">
              무엇부터 써야 할지 몰라
            </p>
            <h2 className="reveal-child text-base sm:text-2xl md:text-[28px] font-bold text-foreground leading-snug mb-2 sm:mb-4">
              시작조차 하기 어려웠습니다.
            </h2>
            <p className="reveal-child text-[9px] sm:text-sm text-muted-foreground mb-5 sm:mb-10 md:mb-12">
              서울구치소 · 이OO 엄마
            </p>

            <div className="hidden sm:block w-full h-px bg-border mb-5 sm:mb-10 md:mb-12" />

            <div className="reveal-child mb-1.5 sm:mb-3">
              <p className="text-[10px] sm:text-sm md:text-base text-orange-500 mb-1 sm:mb-2">
                투오렌지에서 편지를 보낸 후
              </p>
              <h3 className="text-base sm:text-2xl md:text-3xl font-bold text-orange-500 leading-snug">
                매주 1통씩 편지를 쓰고 있습니다.
              </h3>
            </div>

            <p className="reveal-child text-[10px] sm:text-sm text-muted-foreground mb-5 sm:mb-8">
              2025.12 · 실제 투오렌지 이용후기 중에서
            </p>

            <div className="reveal-child">
              <Link
                href="/letter/compose/1"
                className="group relative inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white px-5 sm:px-10 py-2.5 sm:py-4 rounded-full text-xs sm:text-base font-semibold overflow-hidden transition-all hover:shadow-lg hover:shadow-orange-500/25"
              >
                <span className="relative z-10">나도 편지 보내기</span>
                <span className="relative z-10">&rarr;</span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-[#FFF5EB]" />
    </section>
  );
}
