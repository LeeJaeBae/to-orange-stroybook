'use client';

import Link from 'next/link';
import { ctaContent } from '../../lib/landing-data';
import { useScrollReveal } from '../../lib/useScrollReveal';
import { track } from '@/lib/analytics/tracker';
import { cn } from '@/lib/utils';

export function CTASection() {
  const { ref, revealed } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={cn('scroll-reveal', revealed && 'revealed', 'bg-gradient-to-br from-orange-500 to-orange-400 py-8 md:py-20')}
    >
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="reveal-child text-xl font-bold text-white md:text-3xl">
          {ctaContent.title}
        </h2>
        <p className="reveal-child mt-3 text-base text-white/80 md:text-lg">
          {ctaContent.subtitle}
        </p>
        <div className="reveal-child mt-8">
          <Link
            href={ctaContent.buttonLink}
            onClick={() => track.ctaClick('landing_bottom')}
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-orange-500 shadow-lg transition-colors hover:bg-gray-50"
          >
            {ctaContent.buttonText}
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
