'use client';

import Image from 'next/image';
import Link from 'next/link';
import { features } from '../../lib/landing-data';
import { useScrollReveal } from '../../lib/useScrollReveal';
import { useAuth } from '@/features/auth/index.client';
import { useProfile } from '@/features/auth/index.client';
import { cn } from '@/lib/utils';

export function SpecialFeatures() {
  const { ref, revealed } = useScrollReveal();
  const { user, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();

  // 로딩 중이면 렌더링 보류 (깜빡임 방지)
  if (authLoading || profileLoading) return null;

  // 비로그인 또는 관리자가 아니면 숨김
  if (!user || profile?.role !== 'ADMIN') return null;

  return (
    <section
      ref={ref}
      className={cn('scroll-reveal', revealed && 'revealed', 'bg-background py-16 px-4 lg:py-20')}
    >
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="reveal-child mb-12 text-center">
          <span className="text-sm font-semibold text-orange-500 lg:text-base">
            Special Features
          </span>
          <h2 className="mt-2 text-2xl font-bold text-foreground lg:text-3xl">
            마음을 전하는 특별한 기능
          </h2>
          <p className="mt-3 text-muted-foreground">
            자세히보기를 눌러 천천히 살펴보세요.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="reveal-child">
              <Link href={feature.link} className="group block">
                {/* Media area */}
                {feature.image.endsWith('.mp4') ? (
                  <video
                    src={feature.image}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full rounded-2xl bg-muted object-contain"
                  />
                ) : (
                  <div className="w-full overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={600}
                      height={400}
                      loading="lazy"
                      className="h-auto w-full object-contain"
                    />
                  </div>
                )}

                {/* Text area */}
                <div className="mt-6">
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-lg font-bold text-foreground">
                      {feature.title}
                    </h3>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {feature.subTitle}
                    </span>
                  </div>
                  <p className="mb-5 whitespace-pre-line leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#ffaa40]">
                    {feature.linkText}
                    <svg
                      className="h-[11px] w-[11px] transition-transform duration-300 group-hover:translate-x-1"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M1 1l4 4-4 4" />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
