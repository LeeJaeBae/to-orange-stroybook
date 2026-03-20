'use client';

import Link from 'next/link';
import useScrollAnimation from '@/hooks/useScrollAnimation';
import * as gtag from '@/lib/gtag';

export default function CTASection() {
  const sectionRef = useScrollAnimation<HTMLElement>();

  return (
    <section ref={sectionRef} className="bg-gradient-to-br from-orange-500 to-orange-400 py-8 md:py-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-xl md:text-3xl font-bold text-white mb-3 fade-up">오늘, 한 통 보내볼까요?</h2>
        <p className="text-white/80 text-base md:text-lg mb-8 fade-up fade-up-delay-1">처음 쓰는 편지도, 매주 보내는 안부도, 특별한 날도</p>
        <Link
          href="/letter/compose/1"
          onClick={() => gtag.trackCtaClick('편지 쓰러 가기', 'cta_section')}
          className="inline-flex items-center justify-center bg-white text-orange-500 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg fade-up fade-up-delay-2"
        >
          편지 쓰러 가기
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
