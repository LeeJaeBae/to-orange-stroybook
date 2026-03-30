'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { staggerContainer, fadeUp } from '../../lib/animations';
import { track } from '@/lib/analytics/tracker';
import { HeroAIDemo } from './HeroAIDemo';
import { HeroBadge, relationshipData } from './HeroBadge';

// ---------------------------------------------------------------------------
// Hero-specific types (tightly coupled to presentation)
// ---------------------------------------------------------------------------

type TitleStyle = 'default' | 'subtitle-first' | 'highlight-line2';

interface TitleConfig {
  line1: string;
  line1Highlight?: string;
  line2: string;
  line3?: string;
  style: TitleStyle;
  highlightColor?: string;
}

interface ButtonConfig {
  text: string;
  link: string;
}

interface MagazineItem {
  label: string;
  cover: string;
  hover: string;
  full: string | null;
  comingSoon?: boolean;
}

interface MagazineData {
  maxim: MagazineItem[];
  giant: MagazineItem[];
}

interface ContentConfig {
  type: 'aiDemo' | 'image' | 'magazineTab';
  image?: string;
  imageAlt?: string;
  magazineData?: MagazineData;
}

interface CarouselSlide {
  id: string;
  badge: { type: 'relationship' | 'event' | 'care' | 'custom'; icon?: string; text?: string };
  title: TitleConfig;
  subtitle: string;
  button: ButtonConfig;
  content: ContentConfig;
  showLiveCounter?: boolean;
  grayscaleOnLoad?: boolean;
}

// ---------------------------------------------------------------------------
// Hero-specific data (not shared via landing-data)
// ---------------------------------------------------------------------------

interface RecentSender {
  name: string;
  prison: string;
  relation: string;
}

const recentSenders: RecentSender[] = [
  { name: '강O정', prison: '김천교도소', relation: '엄마' },
  { name: '이O수', prison: '서울구치소', relation: '친구' },
  { name: '박O현', prison: '대전교도소', relation: '형제' },
  { name: '김O민', prison: '부산교도소', relation: '아빠' },
  { name: '최O영', prison: '광주교도소', relation: '자매' },
  { name: '정O희', prison: '인천구치소', relation: '지인' },
  { name: '한O진', prison: '대구교도소', relation: '삼촌' },
  { name: '윤O서', prison: '청주교도소', relation: '조카' },
];

const LETTER_COUNT_TARGET = 3852;

const slides: CarouselSlide[] = [
  {
    id: 'ai',
    badge: { type: 'relationship' },
    title: {
      line1: 'AI가 당신의 마음을',
      line2: '더 따뜻하게 전해드려요',
      style: 'default',
    },
    subtitle: '편지 쓰기부터 발송까지, 온라인으로 한 번에',
    button: { text: '편지 쓰러 가기', link: '/letter/compose/1' },
    content: { type: 'aiDemo' },
    showLiveCounter: true,
    grayscaleOnLoad: true,
  },
  {
    id: 'event',
    badge: { type: 'event', icon: '📰', text: '월간 정기 게재' },
    title: {
      line1: 'MAXIM(맥심) 지면 광고',
      line2: '한 번이 아니라,',
      line3: '매달 이어지는 지면 게재',
      style: 'subtitle-first',
    },
    subtitle:
      '교정시설에 매달 전달되는 잡지!  투오렌지를 만나보세요.\n1월호 · 2월호에도 동일한 방식으로 정기 집행됩니다.',
    button: { text: '지면광고 자세히보기', link: '/event' },
    content: {
      type: 'magazineTab',
      magazineData: {
        maxim: [
          { label: '26년도 1월호', cover: '/maxim-banner/maxim_26_01_default.png', hover: '/maxim-banner/maxim_26_01_hover.png', full: '/maxim-banner/maxim-01-popup.png' },
          { label: '26년도 2월호', cover: '/maxim-banner/maxim_26_02_default.png', hover: '/maxim-banner/maxim_26_02_hover.png', full: '/maxim-banner/maxim-02-popup.png' },
        ],
        giant: [
          { label: '26년도 2월호', cover: '/giant-banner/giant_26_02.png', hover: '/giant-banner/giant_26_02_hover.png', full: '/giant-banner/giant-02-popup.png' },
          { label: '26년도 3월호', cover: '/giant-banner/giant_26_03.png', hover: '/giant-banner/giant_26_03.png', full: null, comingSoon: true },
        ],
      },
    },
  },
  {
    id: 'care',
    badge: { type: 'care', icon: '💌', text: '투오렌지만의 배려' },
    title: {
      line1: '한 통은 작아 보여도, 마음은 계속 이어지니까',
      line2: '통상요금 430원,',
      line3: '기본으로 포함했습니다',
      style: 'highlight-line2',
      highlightColor: 'text-primary',
    },
    subtitle:
      '작은 비용이지만 1년이면 부담이 됩니다.\n투오렌지는 반복되는 마음까지 고려했습니다.',
    button: { text: '편지 쓰러 가기', link: '/letter/compose/1' },
    content: {
      type: 'image',
      image: '/main/banner/care.png',
      imageAlt: '투오렌지 배려',
    },
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function GlowBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ transform: 'scaleX(-1)' }}
    >
      <div className="absolute -left-20 -top-20 h-[600px] w-[600px] animate-pulse">
        <div className="h-full w-full rounded-full bg-gradient-to-br from-primary/20 via-yellow-200/15 to-transparent blur-3xl" />
      </div>
      <div className="absolute -right-20 top-1/4 h-[500px] w-[500px] animate-pulse [animation-delay:1s]">
        <div className="h-full w-full rounded-full bg-gradient-to-bl from-yellow-300/15 via-primary/10 to-transparent blur-3xl" />
      </div>
      <div className="absolute -bottom-32 left-1/3 h-[400px] w-[700px] animate-pulse [animation-delay:2s]">
        <div className="h-full w-full rounded-full bg-gradient-to-t from-primary/10 via-yellow-100/8 to-transparent blur-3xl" />
      </div>
    </div>
  );
}

function HeroTitle({ config }: { config: TitleConfig }) {
  if (config.style === 'subtitle-first') {
    return (
      <>
        <span className="mb-2 block text-sm font-semibold text-muted-foreground md:text-lg">
          {config.line1}
          {config.line1Highlight && (
            <span className="text-primary"> {config.line1Highlight}</span>
          )}
        </span>
        <span className="block text-2xl font-bold text-foreground md:text-4xl">
          {config.line2}
        </span>
        {config.line3 && (
          <span className="block text-2xl font-bold text-foreground md:text-4xl">
            {config.line3}
          </span>
        )}
      </>
    );
  }

  if (config.style === 'highlight-line2') {
    return (
      <>
        <span className="mb-2 block text-sm font-semibold text-muted-foreground md:text-lg">
          {config.line1}
        </span>
        <span
          className={`block text-2xl font-bold md:text-4xl ${config.highlightColor ?? 'text-primary'}`}
        >
          {config.line2}
        </span>
        {config.line3 && (
          <span className="block text-2xl font-bold text-foreground md:text-4xl">
            {config.line3}
          </span>
        )}
      </>
    );
  }

  // default
  return (
    <>
      <span className="text-2xl font-bold text-foreground md:text-4xl">{config.line1}</span>
      <br />
      <span className="text-2xl font-bold text-foreground md:text-4xl">{config.line2}</span>
      {config.line3 && (
        <>
          <br />
          <span className="text-2xl font-bold text-foreground md:text-4xl">{config.line3}</span>
        </>
      )}
    </>
  );
}

function LiveCounter({
  letterCount,
  currentSender,
}: {
  letterCount: number;
  currentSender: RecentSender;
}) {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 lg:items-start md:mt-8 md:gap-3">
      {/* Letter count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-3 w-3 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <span>어제 발송된 편지</span>
        <span className="tabular-nums font-bold text-primary">{letterCount.toLocaleString()}</span>
      </div>

      {/* Recent sender */}
      <div className="flex h-5 items-center gap-2 overflow-hidden text-sm">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={currentSender.name}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="text-muted-foreground"
          >
            {currentSender.name}님({currentSender.relation}) {currentSender.prison}로 편지를
            보냈습니다.
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main HeroSection
// ---------------------------------------------------------------------------

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [relationIdx, setRelationIdx] = useState(0);
  const [senderIdx, setSenderIdx] = useState(0);
  const [letterCount, setLetterCount] = useState(0);
  const [isGrayscale, setIsGrayscale] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [magazineTab, setMagazineTab] = useState<'maxim' | 'giant'>('maxim');
  const [modalImage, setModalImage] = useState<string | null>(null);
  const touchStartX = useRef(0);

  const slide = slides[currentSlide];
  const currentRelation = relationshipData[relationIdx];
  const currentSender = recentSenders[senderIdx];

  // Letter count animation
  useEffect(() => {
    const duration = 2000;
    const start = Date.now();
    let raf: number;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setLetterCount(Math.floor(LETTER_COUNT_TARGET * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setLetterCount(LETTER_COUNT_TARGET);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Relationship roller
  useEffect(() => {
    const id = setInterval(() => {
      setRelationIdx((i) => (i + 1) % relationshipData.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Sender roller
  useEffect(() => {
    const id = setInterval(() => {
      setSenderIdx((i) => (i + 1) % recentSenders.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // Carousel auto-play (paused on hover)
  useEffect(() => {
    if (isHovered || slides.length < 2) return;
    const id = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % slides.length);
    }, 8000);
    return () => clearInterval(id);
  }, [isHovered]);

  // Navigation helpers
  const goTo = useCallback((idx: number) => {
    track.ctaClick(`hero_slide_${slides[idx].id}`);
    setCurrentSlide(idx);
  }, []);

  const next = useCallback(() => goTo((currentSlide + 1) % slides.length), [currentSlide, goTo]);
  const prev = useCallback(
    () => goTo((currentSlide - 1 + slides.length) % slides.length),
    [currentSlide, goTo],
  );

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  };

  return (
    <section
      className={`relative overflow-hidden bg-background py-6 transition-all duration-[2000ms] md:py-20 ${
        slide.grayscaleOnLoad && isGrayscale ? 'grayscale' : ''
      }`}
    >
      <GlowBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-4 lg:px-6">
        <div
          className="flex min-h-[560px] flex-col items-center gap-6 md:min-h-[480px] lg:min-h-[420px] lg:flex-row lg:gap-16"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* ====== Left column: copy + CTA ====== */}
          <div className="flex flex-1 flex-col text-center lg:text-left">
            {/* Slide content — absolute positioned to prevent layout shift */}
            <div className="relative flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col justify-center lg:absolute lg:inset-0"
                >
                  {/* Badge */}
                  <div className="mb-4 inline-flex h-6 items-center gap-2 lg:mb-6 lg:h-8 lg:gap-3">
                    <HeroBadge badge={slide.badge} currentRelation={currentRelation} />
                  </div>

                  {/* Title */}
                  <h1 className="mb-4 leading-tight">
                    <HeroTitle config={slide.title} />
                  </h1>

                  {/* Subtitle */}
                  <p className="mb-4 mt-3 whitespace-pre-line text-xs text-muted-foreground md:mb-8 md:mt-6 md:text-base">
                    {slide.subtitle}
                  </p>

                  {/* CTA */}
                  <div className="h-[50px]">
                    <Button
                      asChild
                      size="lg"
                      className={`group relative rounded-full px-5 text-base font-semibold shadow-lg transition-all hover:scale-105 ${
                        slide.id === 'ai' && isGrayscale
                          ? 'bg-foreground text-background shadow-foreground/40 hover:bg-foreground/90'
                          : 'bg-primary text-primary-foreground shadow-primary/30 hover:shadow-xl hover:shadow-primary/40'
                      }`}
                      onClick={() => track.ctaClick(`hero_${slide.id}`)}
                    >
                      <Link href={slide.button.link}>
                        {slide.id === 'ai' && (
                          <span className="leaf-1 absolute -top-4 right-0 scale-0 opacity-0 transition-all delay-100 duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:scale-100 group-hover:opacity-100">
                            <svg className="h-7 w-7 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                            </svg>
                          </span>
                        )}
                        {slide.button.text}
                        <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </Button>
                  </div>

                  {/* Live counter (AI slide only) */}
                  {slide.showLiveCounter && (
                    <LiveCounter letterCount={letterCount} currentSender={currentSender} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* ====== Right column: interactive content ====== */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${slide.id}`}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex h-[260px] w-full max-w-lg flex-1 flex-col overflow-hidden md:h-[340px] lg:h-full"
            >
              {slide.content.type === 'aiDemo' ? (
                <HeroAIDemo onGrayscaleChange={setIsGrayscale} />
              ) : slide.content.type === 'magazineTab' && slide.content.magazineData ? (
                <div className="flex h-full flex-col items-center justify-center gap-4">
                  {/* Tab switcher */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMagazineTab('maxim')}
                      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                        magazineTab === 'maxim'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      MAXIM
                    </button>
                    <button
                      type="button"
                      onClick={() => setMagazineTab('giant')}
                      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                        magazineTab === 'giant'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      GIANT
                    </button>
                  </div>
                  {/* Magazine covers */}
                  <div className="flex gap-4">
                    {slide.content.magazineData[magazineTab].map((item, idx) => (
                      <div
                        key={`${magazineTab}-${idx}`}
                        className="group relative cursor-pointer overflow-hidden rounded-xl"
                        onClick={() => {
                          if (item.full && !item.comingSoon) setModalImage(item.full);
                        }}
                      >
                        <Image
                          src={item.cover}
                          alt={item.label}
                          width={180}
                          height={240}
                          className="h-auto w-[140px] object-contain transition-opacity group-hover:opacity-0 md:w-[180px]"
                        />
                        <Image
                          src={item.hover}
                          alt={`${item.label} hover`}
                          width={180}
                          height={240}
                          className="absolute inset-0 h-auto w-[140px] object-contain opacity-0 transition-opacity group-hover:opacity-100 md:w-[180px]"
                        />
                        {item.comingSoon && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-bold text-white">
                            Coming Soon
                          </div>
                        )}
                        <p className="mt-2 text-center text-xs text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : slide.content.type === 'image' && slide.content.image ? (
                <div className="flex h-full flex-col items-center justify-center">
                  <Image
                    src={slide.content.image}
                    alt={slide.content.imageAlt ?? '슬라이드 이미지'}
                    width={500}
                    height={420}
                    priority={currentSlide === 0}
                    sizes="(max-width: 768px) 75vw, 500px"
                    className="max-h-[280px] max-w-[75%] object-contain md:max-h-[420px] md:max-w-[85%]"
                  />
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ====== Indicators — bottom of hero, outside both columns ====== */}
        {slides.length > 1 && (
          <div className="mt-6">
            {/* Desktop progress bar */}
            <div className="hidden items-center gap-4 md:flex">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary">
                  {String(currentSlide + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-muted-foreground/40">|</span>
                <span className="text-sm text-muted-foreground">
                  {String(slides.length).padStart(2, '0')}
                </span>
              </div>
              <div className="relative h-[3px] w-32 overflow-hidden rounded-full bg-muted md:w-40">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={prev} className="text-muted-foreground hover:text-primary">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button type="button" onClick={next} className="ml-2.5 text-muted-foreground hover:text-primary">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile dot indicators */}
            <div className="flex justify-center gap-2 md:hidden">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === i ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Magazine full-size modal */}
      <Dialog open={!!modalImage} onOpenChange={() => setModalImage(null)}>
        <DialogContent className="max-w-2xl p-2 sm:p-4">
          <DialogTitle className="sr-only">매거진 광고 확대</DialogTitle>
          {modalImage && (
            <Image
              src={modalImage}
              alt="매거진 광고"
              width={800}
              height={1100}
              className="h-auto w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
