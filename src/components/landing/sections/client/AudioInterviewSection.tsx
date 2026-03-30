'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { interviews } from '../../lib/landing-data';
import { useScrollReveal } from '../../lib/useScrollReveal';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  AudioInterviewSection                                              */
/* ------------------------------------------------------------------ */
export function AudioInterviewSection() {
  const { ref, revealed } = useScrollReveal();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const current = interviews[currentIdx];

  /* -- Auto-play timer -- */
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIdx((idx) => (idx + 1) % interviews.length);
          return 0;
        }
        return prev + 1;
      });
    }, current.duration * 10);
    return () => clearInterval(interval);
  }, [isPlaying, currentIdx, current.duration]);

  /* -- Mobile tab auto-scroll -- */
  useEffect(() => {
    if (!tabsRef.current) return;
    const container = tabsRef.current;
    const buttons = container.querySelectorAll('button');
    const activeBtn = buttons[currentIdx];
    if (!activeBtn) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const scrollLeft =
      container.scrollLeft +
      btnRect.left -
      containerRect.left -
      containerRect.width / 2 +
      btnRect.width / 2;

    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }, [currentIdx]);

  const handleTabClick = (idx: number) => {
    setCurrentIdx(idx);
    setProgress(0);
  };

  /* -- Progress bar seek -- */
  const calculateProgress = (clientX: number) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    setProgress(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  };

  const handleProgressMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsPlaying(false);
    calculateProgress(e.clientX);
  };
  const handleProgressTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setIsPlaying(false);
    calculateProgress(e.touches[0].clientX);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => calculateProgress(e.clientX);
    const onTouchMove = (e: TouchEvent) => calculateProgress(e.touches[0].clientX);
    const onUp = () => setIsDragging(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging]);

  const currentTime = Math.floor((progress / 100) * current.duration);
  const fmt = (sec: number) => `0:${sec.toString().padStart(2, '0')}`;

  /* -- Soundbar heights -- */
  const barHeights = [4, 7, 5, 9, 6, 8, 5, 7, 4, 6, 8, 5, 9, 7, 4, 6, 5, 8, 7, 5, 9, 6, 4, 7, 8, 5, 6];

  /* -- Tab button (mobile / PC shared) -- */
  const TabButton = ({ idx, compact }: { idx: number; compact?: boolean }) => {
    const item = interviews[idx];
    const active = idx === currentIdx;
    return (
      <button
        onClick={() => handleTabClick(idx)}
        className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-left transition-all ${
          compact ? 'lg:gap-3 lg:px-12 lg:py-4' : ''
        } ${
          active
            ? 'border-2 border-orange-200 bg-orange-50'
            : 'border border-border bg-background hover:bg-muted'
        }`}
      >
        {/* Soundbar icon */}
        <div className="flex h-4 items-end gap-[1px] lg:h-5">
          {[3, 5, 4, 6, 3].map((h, i) => (
            <div
              key={i}
              className={`w-[2px] rounded-full transition-colors ${
                active ? 'bg-orange-500' : 'bg-muted-foreground/40'
              }`}
              style={{ height: `${h * 2}px` }}
            />
          ))}
        </div>
        <div>
          <p className={`text-sm font-semibold ${active ? 'text-orange-500' : 'text-foreground'}`}>
            {item.title}
          </p>
          <p className={`text-xs ${active ? 'text-orange-400' : 'text-muted-foreground'}`}>
            {item.subtitle}
          </p>
        </div>
      </button>
    );
  };

  return (
    <section
      ref={ref}
      className={cn('scroll-reveal', revealed && 'revealed', 'flex items-center justify-center bg-background px-4 py-8 lg:px-6 lg:py-20')}
    >
      <div className="flex w-full max-w-[1104px] flex-col items-center gap-8">

        {/* -- Mobile: top text -- */}
        <div className="reveal-child px-2 text-center lg:hidden">
          <p className="mb-4 font-medium text-orange-500">
            To Orange 인터넷편지 서비스
          </p>
          <h2 className="mb-4 text-2xl font-bold leading-[1.4] text-foreground">
            재소자들에게 바깥세상을
            <br />
            느끼게 해줄 유일한 창구
          </h2>
          <p className="text-sm text-muted-foreground">
            투오렌지 서비스는 단순히 편지를 전달하는 것을 넘어, 재소자가 고립된 공간에서도 세상의
            온기와 삶의 흐름을 느낄 수 있게 합니다.
          </p>
        </div>

        {/* -- Mobile: tab swipe -- */}
        <div className="reveal-child w-full lg:hidden">
          <div
            ref={tabsRef}
            className="w-full overflow-x-auto scrollbar-hide"
          >
            <div className="flex min-w-max gap-2 px-2 pb-2">
              {interviews.map((_, idx) => (
                <TabButton key={idx} idx={idx} />
              ))}
            </div>
          </div>
        </div>

        {/* -- Main content: PC 3-column -- */}
        <div
          className="reveal-child flex w-full flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8"
        >
          {/* PC left: copy */}
          <div className="hidden w-[300px] shrink-0 flex-col justify-end lg:flex">
            <p className="reveal-child mb-4 font-medium text-orange-500">
              To Orange 인터넷편지 서비스
            </p>
            <h2
              className="reveal-child mb-6 text-3xl font-bold leading-[1.4] text-foreground"
            >
              재소자들에게 바깥세상을
              <br />
              느끼게해줄 유일한 창구
            </h2>
            <p
              className="reveal-child mb-10 text-base leading-[1.8] text-muted-foreground"
            >
              투오렌지 서비스는
              <br />
              단순히 편지를 전달하는 것을 넘어,
              <br />
              <br />
              재소자가 고립된 공간에서도
              <br />
              세상의 온기와 삶의 흐름을 느낄 수 있게 합니다.
            </p>
            <div className="reveal-child">
              <Link
                href="/letter/compose/1"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
              >
                편지 쓰러가기
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* -- Center: interview card -- */}
          <div className="w-full lg:w-auto lg:max-w-md lg:flex-1">
            <div className="flex flex-col items-center">

              {/* Soundbar + notice */}
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-2 flex h-6 items-end gap-[2px]">
                  {barHeights.map((h, i) => (
                    <div
                      key={i}
                      className="w-[3px] animate-soundbar rounded-full bg-muted-foreground/40"
                      style={{ height: `${h * 2.5}px`, animationDelay: `${i * 0.05}s` }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                  <span>이 목소리는 바깥에서는 들리지 않습니다.</span>
                </div>
              </div>

              {/* Circle thumbnail */}
              <div
                className="group relative mb-4 h-[158px] w-[158px] cursor-pointer"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-3 overflow-hidden rounded-full bg-muted"
                  >
                    <Image
                      src={current.image}
                      alt={current.title}
                      fill
                      className="object-cover"
                      sizes="140px"
                    />
                    <div
                      className={`absolute inset-0 bg-black/40 transition-opacity ${
                        isPlaying ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Interview lines */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-1 text-center"
                >
                  {current.lines.map((line, idx) => {
                    const lineProgress = (progress / 100) * current.lines.length;
                    const isActive = Math.floor(lineProgress) === idx;
                    return (
                      <p
                        key={idx}
                        className={`text-lg leading-relaxed transition-colors duration-300 ${
                          isActive ? 'font-semibold text-orange-500' : 'text-foreground'
                        }`}
                      >
                        <em className="not-italic">{line}</em>
                      </p>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {/* Interviewee info */}
              <p className="mb-8 mt-1.5 text-xs font-normal text-muted-foreground">
                &mdash; {current.author} ({current.age}세) {current.detail}
              </p>

              {/* Playback controls */}
              <div className="flex w-full max-w-[280px] items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-[26px] w-[26px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-orange-500 transition-colors hover:bg-orange-600"
                >
                  {isPlaying ? (
                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="ml-0.5 h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>
                <span className="font-mono text-xs text-muted-foreground">{fmt(currentTime)}</span>
                <div
                  ref={progressBarRef}
                  className="group flex h-4 flex-1 cursor-pointer items-center"
                  onMouseDown={handleProgressMouseDown}
                  onTouchStart={handleProgressTouchStart}
                >
                  <div className="relative h-1 w-full rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${progress}%` }}
                    />
                    <div
                      className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-orange-500 shadow-md transition-transform ${
                        isDragging ? 'scale-125' : 'scale-100 group-hover:scale-110'
                      }`}
                      style={{ left: `calc(${progress}% - 6px)` }}
                    />
                  </div>
                </div>
                <span className="font-mono text-xs text-muted-foreground">{fmt(current.duration)}</span>
                <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* -- PC right: tab menu -- */}
          <div className="hidden shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-background lg:flex">
            {interviews.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleTabClick(idx)}
                className={`flex items-center gap-3 border-b border-border px-12 py-4 text-left transition-all last:border-b-0 ${
                  idx === currentIdx ? 'bg-orange-50' : 'bg-background hover:bg-muted'
                }`}
              >
                <div className="flex h-5 w-6 items-end gap-[1px]">
                  {[3, 5, 4, 6, 3].map((h, i) => (
                    <div
                      key={i}
                      className={`w-[2px] rounded-full transition-colors ${
                        idx === currentIdx ? 'bg-orange-500' : 'bg-muted-foreground/40'
                      }`}
                      style={{ height: `${h * 2.5}px` }}
                    />
                  ))}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${idx === currentIdx ? 'text-orange-500' : 'text-foreground'}`}>
                    {item.title}
                  </p>
                  <p className={`text-xs ${idx === currentIdx ? 'text-orange-400' : 'text-muted-foreground'}`}>
                    {item.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* -- Mobile: bottom CTA -- */}
        <div className="reveal-child lg:hidden">
          <Link
            href="/letter/compose/1"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
          >
            편지 쓰러가기
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
