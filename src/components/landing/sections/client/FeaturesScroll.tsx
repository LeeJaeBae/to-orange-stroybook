'use client';

import { type ReactNode } from 'react';
import { useScrollReveal } from '../../lib/useScrollReveal';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  카드 데이터 (기존 FeaturesScroll.tsx 에서 포팅)                     */
/* ------------------------------------------------------------------ */

const topRowCards: ReactNode[] = [
  /* User Profile Card */
  <div key="profile" className="flex h-48 w-64 shrink-0 flex-col rounded-2xl border border-border bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
    <div className="mb-3 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <span className="text-sm font-medium">김</span>
      </div>
      <div>
        <p className="font-semibold text-foreground">김지영</p>
        <p className="text-xs text-muted-foreground">가족</p>
      </div>
    </div>
    <div className="mb-4 flex gap-2">
      <span className="rounded bg-orange-50 px-2 py-1 text-xs text-orange-500">감사</span>
      <span className="rounded bg-orange-50 px-2 py-1 text-xs text-orange-500">응원</span>
    </div>
    <button className="mt-auto rounded-md border border-orange-200 px-4 py-2 text-sm text-orange-500 hover:bg-orange-50">
      편지 보내기
    </button>
  </div>,

  /* Progress Circle */
  <div key="progress" className="flex h-48 w-40 shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
    <div className="relative h-16 w-16">
      <svg className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6" fill="none" />
        <circle cx="32" cy="32" r="28" stroke="#f97316" strokeWidth="6" fill="none" strokeDasharray="176" strokeDashoffset="49" strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-bold text-foreground">72%</span>
    </div>
    <p className="mt-2 text-center text-xs text-muted-foreground">오렌지나무<br />성장</p>
  </div>,

  /* Time Capsule */
  <div key="capsule" className="flex h-48 w-40 shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl bg-orange-500 p-5 text-white shadow-lg shadow-orange-300/50 transition-all duration-300 hover:-translate-y-6 hover:scale-110 hover:rotate-1 hover:shadow-[0_30px_60px_rgba(249,115,22,0.7)]">
    <svg className="mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeWidth="2" d="M12 6v6l4 2" />
    </svg>
    <p className="text-lg font-bold">타임캡슐</p>
    <p className="text-sm opacity-80">함께 선물하기</p>
  </div>,

  /* Stats - Delivered Hearts */
  <div key="hearts" className="flex h-48 w-56 shrink-0 items-center rounded-2xl border border-border bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
    <div className="flex-1">
      <div className="mb-1 flex items-center gap-2">
        <svg className="h-4 w-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span className="text-xs text-green-500">+24.5%</span>
      </div>
      <span className="mb-1 inline-block rounded bg-orange-50 px-2 py-1 text-xs text-orange-500">인기</span>
      <p className="text-3xl font-bold text-orange-500">12,847</p>
      <p className="text-sm text-muted-foreground">전달된 마음</p>
    </div>
    <svg className="h-12 w-12 text-orange-100" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  </div>,

  /* Template Count */
  <div key="templates" className="flex h-48 w-40 shrink-0 flex-col justify-center rounded-2xl border border-border bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
    <p className="text-3xl font-bold text-foreground">100+</p>
    <p className="text-sm text-muted-foreground">편지지 템플릿</p>
    <svg className="mt-2 h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="2" />
      <path strokeWidth="2" d="m22 7-10 6L2 7" />
    </svg>
  </div>,

  /* Orange Tree Level */
  <div key="tree" className="flex h-48 w-40 shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl bg-orange-500 p-5 text-white shadow-lg shadow-orange-300/50 transition-all duration-300 hover:-translate-y-6 hover:scale-110 hover:rotate-1 hover:shadow-[0_30px_60px_rgba(249,115,22,0.7)]">
    <svg className="mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeWidth="2" d="M12 22v-7m-4 7h8M9 9a3 3 0 1 0 3-6 3 3 0 0 0-3 6zm-3 3a6 6 0 0 0 12 0c0-3-3-6-6-6s-6 3-6 6z" />
    </svg>
    <p className="text-3xl font-bold">Lv.3</p>
    <p className="text-sm opacity-80">오렌지나무</p>
  </div>,
];

const bottomRowCards: ReactNode[] = [
  /* Notification Toggle */
  <div key="toggle" className="flex h-36 w-44 shrink-0 flex-col justify-center gap-3 rounded-2xl border border-border bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">알림</span>
      <div className="relative h-6 w-10 rounded-full bg-orange-500">
        <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
      </div>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">예약발송</span>
      <div className="relative h-6 w-10 rounded-full bg-border">
        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white" />
      </div>
    </div>
  </div>,

  /* Main Features */
  <div key="features" className="h-36 w-52 shrink-0 rounded-2xl border border-border bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
    <p className="mb-3 text-sm font-medium text-foreground">주요 기능</p>
    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5"><span className="text-orange-500">&#10024;</span><span>AI다듬기</span></div>
      <div className="flex items-center gap-1.5"><span className="text-orange-500">&#127818;</span><span>오렌지 나무</span></div>
      <div className="flex items-center gap-1.5"><span className="text-orange-500">&#128140;</span><span>타임캡슐</span></div>
      <div className="flex items-center gap-1.5"><span className="text-orange-500">&#9997;&#65039;</span><span>손편지 담기</span></div>
    </div>
  </div>,

  /* Users Today */
  <div key="users" className="flex h-36 w-48 shrink-0 items-center justify-center gap-3 rounded-2xl border border-border bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
    <div className="flex -space-x-2">
      {['김', '이', '박', '최'].map((name, i) => (
        <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-muted text-xs">{name}</div>
      ))}
    </div>
    <div>
      <p className="text-2xl font-bold text-foreground">+99</p>
      <p className="text-xs text-muted-foreground">오늘 발송</p>
    </div>
  </div>,

  /* Letter Writing Steps */
  <div key="steps" className="h-36 w-48 shrink-0 rounded-2xl border border-border bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
    <p className="mb-2 text-sm font-medium text-foreground">편지 작성 단계</p>
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center gap-2"><span className="text-orange-500">&#10003;</span><span className="text-muted-foreground">받는 사람</span></div>
      <div className="flex items-center gap-2"><span className="text-orange-500">&#10003;</span><span className="text-muted-foreground">편지지 선택</span></div>
      <div className="flex items-center gap-2"><span className="text-muted-foreground">&#9675;</span><span className="text-muted-foreground">편지 작성</span></div>
    </div>
  </div>,

  /* First Letter CTA */
  <div key="cta" className="flex h-36 w-52 shrink-0 items-center justify-between rounded-2xl border border-border bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
    <div>
      <p className="font-semibold text-foreground">첫 편지 보내기</p>
      <p className="text-xs text-muted-foreground">지금 시작하세요</p>
    </div>
    <button className="rounded-full bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600">시작</button>
  </div>,

  /* Sent Letters Count */
  <div key="count" className="flex h-36 w-36 shrink-0 items-center justify-center rounded-2xl border border-border bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
    <div className="text-center">
      <p className="text-3xl font-bold text-orange-500">24</p>
      <p className="text-xs text-muted-foreground">보낸 편지</p>
    </div>
  </div>,

  /* Postal Types */
  <div key="postal" className="h-36 w-56 shrink-0 rounded-2xl border border-border bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
    <p className="mb-3 text-sm font-medium text-foreground">우편 종류</p>
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="flex justify-between"><span className="text-orange-500">준등기</span><span className="text-muted-foreground">1,800원</span></div>
      <div className="flex justify-between"><span className="text-orange-500">일반등기</span><span className="text-muted-foreground">2,830원</span></div>
      <div className="flex justify-between"><span className="text-muted-foreground">일반우편</span><span className="text-muted-foreground">430원</span></div>
      <div className="flex justify-between"><span className="text-muted-foreground">익일특급</span><span className="text-muted-foreground">3,530원</span></div>
    </div>
  </div>,
];

/* ------------------------------------------------------------------ */
/*  무한 스크롤 Row                                                    */
/* ------------------------------------------------------------------ */
function ScrollRow({
  cards,
  direction,
  className = '',
}: {
  cards: ReactNode[];
  direction: 'left' | 'right';
  className?: string;
}) {
  const animClass = direction === 'left' ? 'animate-[scroll-left_30s_linear_infinite]' : 'animate-[scroll-right_30s_linear_infinite]';

  return (
    <div className={`relative overflow-x-clip overflow-y-visible py-3 ${className}`}>
      <div
        className={`flex w-fit gap-4 hover:[animation-play-state:paused] ${animClass}`}
      >
        {/* 원본 + 복제 (심리스 루프) */}
        {cards}
        {cards}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FeaturesScroll                                                     */
/* ------------------------------------------------------------------ */
export function FeaturesScroll() {
  const { ref, revealed } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={cn('scroll-reveal', revealed && 'revealed', 'bg-background py-6 lg:py-20')}
    >
      <div className="mx-auto mb-12 max-w-7xl px-6">
        <div className="reveal-child text-center">
          <p className="mb-2 font-medium text-orange-500">Features</p>
          <h2 className="mb-3 text-2xl font-bold text-foreground lg:text-3xl">
            편지쓰기의 모든 것
          </h2>
          <p className="text-muted-foreground">소중한 마음을 담아 편지를 써보세요</p>
        </div>
      </div>

      <div className="reveal-child space-y-4">
        {/* 상단 Row: 왼쪽으로 스크롤 (항상 표시) */}
        <ScrollRow cards={topRowCards} direction="left" />

        {/* 하단 Row: 오른쪽으로 스크롤 (lg 이상만 표시) */}
        <ScrollRow cards={bottomRowCards} direction="right" className="hidden lg:block" />
      </div>
    </section>
  );
}
