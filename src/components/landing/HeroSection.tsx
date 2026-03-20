'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import * as gtag from '@/lib/gtag';
import { useVisibleInterval } from '@/hooks/useVisibleInterval';


interface AIDemoData {
  before: string;
  after: string;
  label: string;
}

interface RelationshipData {
  label: string;
  count: number;
  img: string;
}

interface RecentSender {
  name: string;
  prison: string;
  relation: string;
}

// 뱃지 설정
interface BadgeConfig {
  type: 'relationship' | 'event' | 'care' | 'custom';
  icon?: string;  // 이모지 또는 아이콘
  text?: string;  // 뱃지 텍스트
}

// 타이틀 스타일
type TitleStyle = 'default' | 'subtitle-first' | 'highlight-line2';

// 타이틀 설정
interface TitleConfig {
  line1: string;
  line1Highlight?: string;  // line1 뒤에 primary 색상으로 추가될 텍스트
  line2: string;
  line3?: string;
  style: TitleStyle;
  highlightColor?: string;  // highlight-line2 스타일용
}

// 버튼 설정
interface ButtonConfig {
  text: string;
  link: string;
  buttonStyle?: 'leaf-button' | 'default';

  disabled?: boolean;
}

// 갤러리 이미지 설정
interface GalleryImage {
  src: string;
  alt: string;
  hasOverlay?: boolean;  // 블러 오버레이 여부
  popupSrc?: string;     // 모달에서 보여줄 큰 이미지
}

// 잡지 탭 데이터
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

// 콘텐츠 설정
interface ContentConfig {
  type: 'aiDemo' | 'image' | 'gallery' | 'magazineTab';
  image?: string;
  imageAlt?: string;
  showLeafAnimation?: boolean;
  galleryImages?: GalleryImage[];  // 갤러리 이미지 배열
  popupImage?: string;  // 자세히보기 팝업용 이미지
  magazineData?: MagazineData;  // 잡지 탭 데이터
}

// 섹션 효과 설정
interface EffectsConfig {
  grayscaleOnLoad?: boolean;
  showLiveCounter?: boolean;
  showLeafOnButton?: boolean;
}

interface CarouselSlide {
  id: string;
  badge: BadgeConfig;
  title: TitleConfig;
  subtitle: string;
  notice?: string;
  button: ButtonConfig;
  content: ContentConfig;
  effects?: EffectsConfig;
}

const aiDemoData: Record<string, AIDemoData> = {
  greeting: {
    before: '아들아, 잘 지내고 있니?',
    after: '아들아, 엄마야. 요즘 하루가 어떻게 흘러가는지 자꾸 생각이 나더라. 잘 지내고 있는지, 밥은 거르지 않는지 궁금했어. 이렇게라도 안부를 전하고 싶어서 편지를 쓴다.',
    label: '인사말',
  },
  middle: {
    before: '거기 날씨는 어떤지 잘 모르겠네. 밥은 잘 챙겨 먹고 있는지 걱정된다.',
    after: '네가 있는 곳 한달치 날씨정보와 두뇌회전에 좋은 스도쿠를 보내. 스도쿠는 하루에 한 장씩만 풀어도 괜찮아. 시간이 멈춘 것처럼 느껴질 때, 머리를 잠깐 다른 데로 쓰는 것만으로도 숨이 트이더라. 너의 하루를 완전히 알 수는 없어도, 함께 살펴보고 있다는 건 꼭 전하고 싶었어.',
    label: '중간',
  },
  closing: {
    before: '몸 건강히 잘 지내고 있어. 항상 생각하고 있다.',
    after: '멀리 떨어져 있어도 엄마는 늘 네 하루를 생각하고 있어. 이 편지가 도착하는 순간만큼은 네가 혼자가 아니라는 걸 느꼈으면 좋겠다.',
    label: '마무리',
  },
};

const relationshipData: RelationshipData[] = [
  {
    label: '엄마',
    count: 156,
    img: '/main/banner/mother.png'
  },
  {
    label: '아빠',
    count: 89,
    img: '/main/banner/father.png'
  },
  {
    label: '연인',
    count: 67,
    img: '/main/banner/gf.png'
  },
  {
    label: '친구',
    count: 42,
    img: '/main/banner/friend.png'
  },
];

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

const carouselSlides: CarouselSlide[] = [
  {
    id: 'ai',
    badge: { type: 'relationship' },
    title: {
      line1: 'AI가 당신의 마음을',
      line2: '더 따뜻하게 전해드려요',
      style: 'default',
    },
    subtitle: '편지 쓰기부터 발송까지, 온라인으로 한 번에',
    button: {
      text: '편지 쓰러 가기',
      link: '/letter/compose/1',
      buttonStyle: 'leaf-button',
    },
    content: { type: 'aiDemo' },
    effects: {
      grayscaleOnLoad: true,
      showLiveCounter: true,
      showLeafOnButton: true,
    },
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
    subtitle: '교정시설에 매달 전달되는 잡지!  투오렌지를 만나보세요.\n1월호 · 2월호에도 동일한 방식으로 정기 집행됩니다.',

    button: {
      text: '지면광고 자세히보기',
      link: '/event',
    },
    content: {
      type: 'magazineTab' as const,
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
      highlightColor: 'text-orange-500',
    },
    subtitle: '작은 비용이지만 1년이면 부담이 됩니다.\n투오렌지는 반복되는 마음까지 고려했습니다.',
    button: {
      text: '편지 쓰러 가기',
      link: '/letter/compose/1',
    },
    content: {
      type: 'image',
      image: '/main/banner/care.png',
      imageAlt: '투오렌지 배려',
    },
  },
];

export default function HeroSection() {
  const [currentRelation, setCurrentRelation] = useState(relationshipData[0]);
  const [relationVisible, setRelationVisible] = useState(true);
  const [currentSender, setCurrentSender] = useState(recentSenders[0]);
  const [senderVisible, setSenderVisible] = useState(true);
  const [letterCount, setLetterCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [activePart, setActivePart] = useState<string>('greeting');
  const [beforeText, setBeforeText] = useState('');
  const [afterText, setAfterText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAfter, setShowAfter] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isGrayscale, setIsGrayscale] = useState(true);
  const [slideAnimating, setSlideAnimating] = useState(true);
  const [galleryPopupImage, setGalleryPopupImage] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [magazineTab, setMagazineTab] = useState<'maxim' | 'giant'>('maxim');
  const [popupImages, setPopupImages] = useState<string[] | null>(null);
  const [popupIndex, setPopupIndex] = useState(0);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);

  const [popupFading, setPopupFading] = useState(false);
  const [popupDisplaySrc, setPopupDisplaySrc] = useState<string>('');

  // 팝업 키보드 네비게이션 + 스크롤 잠금
  useEffect(() => {
    if (!popupImages) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPopupIndex(i => (i - 1 + popupImages.length) % popupImages.length);
      else if (e.key === 'ArrowRight') setPopupIndex(i => (i + 1) % popupImages.length);
      else if (e.key === 'Escape') setPopupImages(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [popupImages]);

  // 슬라이드 전환 시 fade 효과
  useEffect(() => {
    if (!popupImages) return;
    setPopupFading(true);
    const t = setTimeout(() => {
      setPopupDisplaySrc(popupImages[popupIndex]);
      setPopupFading(false);
    }, 150);
    return () => clearTimeout(t);
  }, [popupIndex, popupImages]);

  const slide = carouselSlides[currentSlide];

  // Slide transition animation trigger
  useEffect(() => {
    setSlideAnimating(true);
    const timer = setTimeout(() => setSlideAnimating(false), 50);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  // Typing animation
  const typeText = useCallback((text: string, setter: React.Dispatch<React.SetStateAction<string>>, isHtml = false, callback?: () => void) => {
    setIsTyping(true);
    let i = 0;
    let current = '';

    const type = () => {
      if (i < text.length) {
        if (isHtml && text.substr(i, 4) === '<br>') {
          current += '<br>';
          i += 4;
        } else {
          current += text.charAt(i);
          i++;
        }
        setter(current);
        setTimeout(type, Math.random() * 30 + 20);
      } else {
        setIsTyping(false);
        callback?.();
      }
    };
    type();
  }, []);

  const applyAI = useCallback(
    (part: string) => {
      if (isTyping) return;

      setActivePart(part);
      setBeforeText('');
      setAfterText('');
      setIsLoading(false);
      setShowAfter(false);
      setIsGrayscale(true);

      const data = aiDemoData[part];

      typeText(data.before, setBeforeText, false, () => {
        setIsLoading(true);

        setTimeout(() => {
          setIsLoading(false);
          setShowAfter(true);
          setIsGrayscale(false);
          typeText(data.after, setAfterText, true);
        }, 1500);
      });
    },
    [isTyping, typeText]
  );

  // Auto-play loop
  const aiDemoIndexRef = useRef(0);
  const aiDemoRunningRef = useRef(false);

  const runDemo = useCallback(() => {
    if (aiDemoRunningRef.current) return;
    aiDemoRunningRef.current = true;

    const parts = ['greeting', 'middle', 'closing'];
    const part = parts[aiDemoIndexRef.current];
    aiDemoIndexRef.current = (aiDemoIndexRef.current + 1) % parts.length;

    setActivePart(part);
    setBeforeText('');
    setAfterText('');
    setIsLoading(false);
    setShowAfter(false);
    setIsGrayscale(true);

    const data = aiDemoData[part];

    let i = 0;
    let current = '';
    setIsTyping(true);
    const beforeDelay = 2000 / data.before.length;

    const typeBefore = () => {
      if (i < data.before.length) {
        current += data.before.charAt(i);
        i++;
        setBeforeText(current);
        setTimeout(typeBefore, beforeDelay + Math.random() * 30);
      } else {
        setIsTyping(false);

        setTimeout(() => {
          setIsLoading(true);
        }, 1000);

        setTimeout(() => {
          setIsLoading(false);
          setShowAfter(true);
          setIsGrayscale(false);

          let j = 0;
          let afterCurrent = '';
          setIsTyping(true);

          const typeAfter = () => {
            if (j < data.after.length) {
              if (data.after.substr(j, 4) === '<br>') {
                afterCurrent += '<br>';
                j += 4;
              } else {
                afterCurrent += data.after.charAt(j);
                j++;
              }
              setAfterText(afterCurrent);
              setTimeout(typeAfter, Math.random() * 40 + 30);
            } else {
              setIsTyping(false);
              aiDemoRunningRef.current = false;
            }
          };
          typeAfter();
        }, 4000);
      }
    };
    typeBefore();
  }, []);

  // Initial demo trigger
  useEffect(() => {
    const initialTimer = setTimeout(runDemo, 500);
    return () => clearTimeout(initialTimer);
  }, [runDemo]);

  useVisibleInterval(sectionRef, runDemo, 14000);

  // Relationship roller
  useVisibleInterval(sectionRef, () => {
    setRelationVisible(false);
    setTimeout(() => {
      setCurrentRelation((prev) => {
        const idx = relationshipData.indexOf(prev);
        return relationshipData[(idx + 1) % relationshipData.length];
      });
      setRelationVisible(true);
    }, 300);
  }, 3000);

  // Sender roller
  useVisibleInterval(sectionRef, () => {
    setSenderVisible(false);
    setTimeout(() => {
      setCurrentSender((prev) => {
        const idx = recentSenders.indexOf(prev);
        return recentSenders[(idx + 1) % recentSenders.length];
      });
      setSenderVisible(true);
    }, 300);
  }, 3500);

  // Carousel auto-play (호버 시 일시정지)
  // Note: isHovered changes cause useVisibleInterval to not handle pause,
  // so we keep useEffect for this one but add visibility check
  useEffect(() => {
    if (isHovered) return;

    const el = sectionRef.current;
    if (!el) return;

    let autoPlayInterval: ReturnType<typeof setInterval> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!autoPlayInterval) {
            autoPlayInterval = setInterval(() => {
              setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
            }, 8000);
          }
        } else {
          if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (autoPlayInterval) clearInterval(autoPlayInterval);
    };
  }, [isHovered]);

  // Letter count animation
  useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();
    let rafId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = LETTER_COUNT_TARGET * easeOut;

      setLetterCount(Math.floor(currentValue));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setLetterCount(LETTER_COUNT_TARGET);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const nextSlide = () => {
    const next = (currentSlide + 1) % carouselSlides.length;
    gtag.trackHeroSlideView(carouselSlides[next].id, next);
    setCurrentSlide(next);
  };

  const prevSlide = () => {
    const prev = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
    gtag.trackHeroSlideView(carouselSlides[prev].id, prev);
    setCurrentSlide(prev);
  };

  const goToSlide = (index: number) => {
    gtag.trackHeroSlideView(carouselSlides[index].id, index);
    setCurrentSlide(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`bg-white py-6 md:py-20 max-h-[calc(100dvh-104px)] md:max-h-none overflow-hidden md:overflow-visible relative transition-all duration-[2000ms] ${
        slide.effects?.grayscaleOnLoad && isGrayscale ? 'grayscale' : ''
      }`}
    >
      {/* Animated Glow Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ transform: 'scaleX(-1)' }}>
        <div className="absolute -top-20 -left-20 w-[600px] h-[600px] animate-glow-move">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-300/25 via-yellow-200/20 to-transparent blur-3xl"></div>
        </div>
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] animate-glow-pulse">
          <div className="w-full h-full rounded-full bg-gradient-to-bl from-yellow-300/20 via-orange-200/15 to-transparent blur-3xl"></div>
        </div>
        <div className="absolute -bottom-32 left-1/3 w-[700px] h-[400px] animate-glow-scale">
          <div className="w-full h-full rounded-full bg-gradient-to-t from-orange-200/15 via-yellow-100/10 to-transparent blur-3xl"></div>
        </div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] animate-glow-fade">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400/15 to-yellow-300/10 blur-2xl"></div>
        </div>
        <div className="absolute top-1/2 -left-10 w-[400px] h-[400px] animate-glow-pulse">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-lime-300/10 via-green-200/8 to-transparent blur-3xl"></div>
        </div>
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] animate-glow-move">
          <div className="w-full h-full rounded-full bg-gradient-to-bl from-emerald-200/8 via-lime-100/6 to-transparent blur-3xl"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div
          className="flex flex-col lg:flex-row items-center gap-6 md:gap-12 lg:gap-16"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Left: Text + Button */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge Area */}
            <div className={`inline-flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6 h-6 lg:h-8 transition-all duration-700 ease-out ${
              slideAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`} style={{ transitionDelay: '0ms' }}>
              {slide.badge.type === 'relationship' && (
                <>
                  <div className="flex items-center gap-1 lg:gap-1.5">
                  <div className={`transition-all duration-300 ${
                    relationVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}>
                    <img
                      src={currentRelation.img}
                      alt={currentRelation.label}
                      className="w-6 h-6 lg:w-8 lg:h-8 rounded-full object-cover"
                    />
                  </div>
                  <span className="relative flex h-1.5 w-1.5 lg:h-2 lg:w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 lg:h-2 lg:w-2 bg-orange-500"></span>
                  </span>
                  <div className="text-xs lg:text-sm text-gray-600 overflow-hidden h-4 lg:h-5 min-w-[140px] lg:min-w-[180px]">
                    <p className={`transition-all duration-300 ${
                      relationVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                    }`}>
                      <span className="text-gray-500">현재 </span>
                      <span className="font-bold text-orange-500">{currentRelation.count}</span>
                      <span className="text-gray-500">명 접속 중</span>
                    </p>
                  </div>
                </div>
                </>
              )}
              {slide.badge.type === 'event' && (
                <>
                  <span className="text-xl lg:text-2xl">{slide.badge.icon}</span>
                  <span className="relative flex h-1.5 w-1.5 lg:h-2 lg:w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 lg:h-2 lg:w-2 bg-orange-500"></span>
                  </span>
                  <span className="text-sm lg:text-base text-primary font-medium">{slide.badge.text}</span>
                </>
              )}
              {slide.badge.type === 'care' && (
                <>
                  <span className="text-lg lg:text-xl">{slide.badge.icon}</span>
                  <span className="text-sm lg:text-base text-gray-600 font-medium">{slide.badge.text}</span>
                </>
              )}
            </div>

            <h1 className={`text-gray-900 leading-tight mb-4 transition-all duration-700 ease-out ${
              slideAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`} style={{ transitionDelay: '100ms' }}>
              {slide.title.style === 'subtitle-first' ? (
                <>
                  <span className="text-size-14 md:text-size-19 text-gray-600 font-semibold block mb-2">
                    {slide.title.line1}
                    {slide.title.line1Highlight && <span className="text-primary"> {slide.title.line1Highlight}</span>}
                  </span>
                  <span className="text-size-22 md:text-size-36 font-bold block">{slide.title.line2}</span>
                  {slide.title.line3 && <span className="text-size-22 md:text-size-36 font-bold block">{slide.title.line3}</span>}
                </>
              ) : slide.title.style === 'highlight-line2' ? (
                <>
                  <span className="text-size-14 md:text-size-19 text-gray-600 font-semibold block mb-2">{slide.title.line1}</span>
                  <span className={`text-size-22 md:text-size-36 font-bold block ${slide.title.highlightColor || 'text-orange-500'}`}>{slide.title.line2}</span>
                  {slide.title.line3 && <span className="text-size-22 md:text-size-36 font-bold text-gray-900 block">{slide.title.line3}</span>}
                </>
              ) : (
                <>
                  <span className="text-size-22 md:text-size-36 font-bold">{slide.title.line1}</span>
                  <br />
                  <span className="text-size-22 md:text-size-36 font-bold">{slide.title.line2}</span>
                  {slide.title.line3 && <><br /><span className="text-size-22 md:text-size-36 font-bold">{slide.title.line3}</span></>}
                </>
              )}
            </h1>
            <p className={`text-gray-600 mb-4 md:mb-8 whitespace-pre-line text-size-12 md:text-size-18 mt-3 md:mt-6 transition-all duration-700 ease-out ${
              slideAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`} style={{ transitionDelay: '200ms' }}>{slide.subtitle}</p>

            {/* Button Area */}
            <div className={`h-[50px] transition-all duration-700 ease-out ${
              slideAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`} style={{ transitionDelay: '300ms' }}>
              {(slide.id === 'ai' || slide.id === 'care') && (
                 <Link
                 href={slide.button.link}
                 onClick={() => gtag.trackCtaClick(slide.button.text, `hero_${slide.id}`)}
                 className={`cta-btn group relative inline-flex items-center justify-center px-5 h-[50px] rounded-full text-size-16 font-semibold hover:scale-105 ${
                   currentSlide === 0 && isGrayscale
                     ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/40'
                     : 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40'
                 } transition-all duration-700 ease-out ${
                   slideAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                 }`}
                 style={{ filter: 'none', transitionDelay: '300ms' }}
               >
                 {currentSlide === 0 && (
                   <span className="leaf-1 absolute -top-4 right-0 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 delay-100 group-hover:-translate-y-1 group-hover:translate-x-1">
                     <svg className="w-7 h-7 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                     </svg>
                   </span>
                 )}
                 {slide.button.text}
                 <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                 </svg>
               </Link>
              )}
              {slide.badge.type === 'event' && slide.content.magazineData && (
                <button
                  onClick={() => {
                    // 모든 탭의 광고 이미지를 모아서 슬라이드로
                    const allImages: string[] = [];
                    const data = slide.content.magazineData!;
                    for (const tab of ['maxim', 'giant'] as const) {
                      data[tab].filter(i => !i.comingSoon && i.full).forEach(i => allImages.push(i.full!));
                    }
                    if (allImages.length > 0) {
                      // 현재 탭 첫 이미지 인덱스부터 시작
                      const currentTabFirstImage = data[magazineTab].find(i => !i.comingSoon && i.full)?.full;
                      const startIdx = currentTabFirstImage ? allImages.indexOf(currentTabFirstImage) : 0;
                      setPopupIndex(Math.max(0, startIdx));
                      setPopupImages(allImages);
                    }
                  }}
                  className={`inline-flex items-center bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 ${
                    slideAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                  }`}
                  style={{ filter: 'none', transitionDelay: '300ms' }}
                >
                  {slide.button.text}
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              
            </div>

            {/* Live Counter + Sender info */}
            {slide.effects?.showLiveCounter && (
              <div className="mt-4 md:mt-8 flex flex-col items-center lg:items-start gap-2 md:gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>어제 발송된 편지</span>
                  <span className="font-bold text-orange-500 tabular-nums">
                    {letterCount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm overflow-hidden h-5">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <span className={`text-gray-600 transition-all duration-300 ${senderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                    {currentSender.name}님({currentSender.relation}) {currentSender.prison}로 편지를 보냈습니다.
                  </span>
                </div>
              </div>
            )}

            {/* Carousel Progress Bar (PC) */}
            <div className="hidden md:flex items-center justify-center lg:justify-start gap-4 mt-8">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-orange-500">
                  {String(currentSlide + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-gray-300">|</span>
                <span className="text-sm text-gray-400">
                  {String(carouselSlides.length).padStart(2, '0')}
                </span>
              </div>
              <div className="relative w-32 md:w-40 h-[3px] bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${((currentSlide + 1) / carouselSlides.length) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-1">
                <button onClick={prevSlide} className="text-gray-400 hover:text-orange-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={nextSlide} className="text-gray-400 hover:text-orange-500 transition-colors ml-2.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Dot Indicator (모바일 전용) */}
            <div className="flex md:hidden justify-center gap-2 mt-4">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-orange-500 w-6' : 'bg-gray-300 w-2'
                  }`}
                />
              ))}
            </div>

          </div>

          {/* Right: Content Area */}
          <div className={`flex-1 w-full max-w-lg flex flex-col min-h-[280px] md:min-h-[420px] transition-all duration-700 ease-out ${
            slideAnimating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
          }`} style={{ transitionDelay: '150ms' }}>
            {slide.content.type === 'aiDemo' ? (
              <div className="w-full">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 md:px-4 md:py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 md:space-x-2">
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-size-10 md:text-xs text-gray-400">{aiDemoData[activePart].label} 다듬기</span>
                    <div className="w-12 md:w-16"></div>
                  </div>

                  <div className="p-4 md:p-5 min-h-[240px] md:min-h-[300px]">
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm md:text-base font-bold transition-all duration-700 ${
                          showAfter ? 'text-orange-500' : 'text-gray-500'
                        }`}>
                          {showAfter ? 'AFTER' : 'BEFORE'}
                        </span>
                        <span className={`text-xs md:text-sm font-medium transition-all duration-700 ${
                          showAfter ? 'text-orange-400' : 'text-gray-400'
                        }`}>
                          {showAfter ? 'AI가 다듬은 문장' : '내가 쓴 문장'}
                        </span>
                      </div>

                      <div className={`rounded-xl p-3 md:p-4 min-h-[140px] md:min-h-[180px] transition-all duration-1000 ease-out ${
                        showAfter
                          ? 'bg-orange-50 border border-orange-200'
                          : 'bg-gray-100 border border-gray-200'
                      }`}>
                        {!isLoading && !showAfter && (
                          <p className="text-gray-600 leading-relaxed text-xs md:text-sm">
                            {beforeText}
                            {isTyping && (
                              <span className="inline-block w-0.5 h-4 md:h-5 bg-gray-400 ml-0.5 animate-pulse"></span>
                            )}
                          </p>
                        )}

                        {isLoading && (
                          <div className="flex items-center justify-center gap-2 md:gap-3 min-h-[116px] md:min-h-[148px]">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span className="text-sm md:text-base text-orange-500 font-semibold">당신이 이렇게 쓰면</span>
                          </div>
                        )}

                        {showAfter && (
                          <div>
                            <p className="text-gray-700 leading-relaxed text-xs md:text-sm">
                              <span dangerouslySetInnerHTML={{ __html: afterText }} />
                              {isTyping && (
                                <span className="inline-block w-0.5 h-4 md:h-5 bg-orange-500 ml-0.5 align-middle animate-pulse"></span>
                              )}
                            </p>
                            {!isTyping && (
                              <p className="text-sm md:text-base text-orange-600 font-semibold mt-4 md:mt-6 pt-3 md:pt-4 border-t border-orange-300 text-center animate-fade-in">✨ 이렇게 전해집니다</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 md:mt-5 pt-3 md:pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs md:text-sm text-gray-500 font-medium">✨ AI 다듬기</span>
                      <div className="flex gap-1.5 md:gap-2">
                        {Object.entries(aiDemoData).map(([key, val]) => (
                          <button
                            key={key}
                            onClick={() => applyAI(key)}
                            className={`text-size-10 md:text-xs px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all duration-200 flex items-center gap-1 md:gap-1.5 active:scale-95 ${
                              activePart === key
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'bg-gray-50 text-gray-600 hover:bg-orange-100 hover:text-orange-600'
                            }`}
                          >
                            {val.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-400 mt-3 md:mt-4 text-center">버튼을 눌러 AI 다듬기를 체험해보세요</p>
              </div>
            ) : slide.content.type === 'image' ? (
              <div className="w-full min-h-[420px] flex flex-col justify-center">
                <div className="flex items-center justify-center relative">
                  {/* 나뭇잎 애니메이션 (옵션) */}
                  {slide.content.showLeafAnimation && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <svg className="absolute w-6 h-6 text-green-400/60 animate-leaf-fall-1" style={{ left: '10%', top: '-10%' }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                      </svg>
                      <svg className="absolute w-5 h-5 text-green-500/50 animate-leaf-fall-2" style={{ left: '80%', top: '-5%' }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                      </svg>
                      <svg className="absolute w-4 h-4 text-orange-400/50 animate-leaf-fall-3" style={{ left: '50%', top: '-8%' }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                      </svg>
                      <svg className="absolute w-5 h-5 text-yellow-500/40 animate-leaf-fall-4" style={{ left: '30%', top: '-12%' }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                      </svg>
                      <svg className="absolute w-4 h-4 text-green-300/50 animate-leaf-fall-5" style={{ left: '70%', top: '-6%' }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                      </svg>
                    </div>
                  )}
                  {slide.content.image ? (
                    <img
                      src={slide.content.image}
                      alt={slide.content.imageAlt || '슬라이드 이미지'}
                      className={`max-w-[75%] md:max-w-[85%] max-h-[280px] md:max-h-[420px] object-contain relative z-10 transition-all duration-1000 ease-out cursor-pointer ${
                        slideAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                      }`}
                      style={{ transitionDelay: '200ms' }}
                      onClick={() => setGalleryPopupImage(slide.content.image!)}
                    />
                  ) : (
                    <div className="text-center p-6 md:p-8">
                      <span className="text-6xl md:text-8xl mb-3 md:mb-4 block">{slide.badge.icon || '📷'}</span>
                      <p className="text-gray-400 text-xs md:text-sm">이미지가 들어갈 자리입니다</p>
                    </div>
                  )}
                </div>
                {slide.notice && (
                  <p className="text-size-14 text-gray-500 text-center mt-4">{slide.notice}</p>
                )}
              </div>
            ) : slide.content.type === 'magazineTab' && slide.content.magazineData ? (
              /* 지면광고 - 탭 전환 방식 */
              <div className="w-full min-h-[420px] flex flex-col justify-center">
                {/* 탭 버튼 */}
                <div className="inline-flex gap-4 mb-5">
                  <button
                    onClick={() => setMagazineTab('maxim')}
                    className={`pb-2 text-sm font-semibold transition-colors relative ${
                      magazineTab === 'maxim'
                        ? 'text-orange-500'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    맥심(MAXIM)
                    {magazineTab === 'maxim' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => setMagazineTab('giant')}
                    className={`pb-2 text-sm font-semibold transition-colors relative ${
                      magazineTab === 'giant'
                        ? 'text-orange-500'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    자이언트(GIANT)
                    {magazineTab === 'giant' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                    )}
                  </button>
                </div>

                {/* 카드 2장 */}
                <div className="grid grid-cols-2 gap-4">
                  {slide.content.magazineData[magazineTab].map((item, idx) => (
                    <div
                      key={`${magazineTab}-${idx}`}
                      className={`group/card relative ${item.comingSoon ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                      onClick={() => {
                        if (!item.comingSoon && item.full) {
                          const allImages: string[] = [];
                          const data = slide.content.magazineData!;
                          for (const tab of ['maxim', 'giant'] as const) {
                            data[tab].filter(i => !i.comingSoon && i.full).forEach(i => allImages.push(i.full!));
                          }
                          const startIdx = allImages.indexOf(item.full);
                          setPopupIndex(Math.max(0, startIdx));
                          setPopupImages(allImages);
                        }
                      }}
                    >
                      {item.comingSoon ? (
                        <>
                          <img
                            src={item.cover}
                            alt={item.label}
                            className="w-full h-auto object-contain"
                          />
                          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-800/70 text-white text-xs px-3 py-1 rounded-full">
                            공개 예정
                          </div>
                        </>
                      ) : (
                        <div className="relative">
                          <img
                            src={item.cover}
                            alt={item.label}
                            className="w-full h-auto object-contain transition-opacity duration-300 group-hover/card:opacity-0"
                          />
                          <img
                            src={item.hover}
                            alt={`${item.label} hover`}
                            className="w-full h-auto object-contain absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

          </div>
        </div>
      </div>

      {/* Gallery Popup Modal (single image) */}
      {galleryPopupImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer"
          onClick={() => setGalleryPopupImage(null)}
        >
          <img
            src={galleryPopupImage}
            alt="광고 상세"
            className="max-w-[95vw] max-h-[95vh] rounded-lg shadow-2xl object-contain animate-popup-in cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* 지면광고 팝업 모달 (슬라이드) */}
      {popupImages && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm overscroll-none touch-none"
          onClick={() => setPopupImages(null)}
          onTouchMove={(e) => e.preventDefault()}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] animate-popup-in flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setPopupImages(null)}
              className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 이전 버튼 */}
            {popupImages.length > 1 && (
              <button
                onClick={() => setPopupIndex((popupIndex - 1 + popupImages.length) % popupImages.length)}
                className="absolute -left-5 md:-left-14 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg hidden md:flex items-center justify-center hover:bg-white transition-colors z-10"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* 이미지 (스와이프 지원) */}
            <img
              src={popupDisplaySrc || popupImages[popupIndex]}
              alt={`지면광고 ${popupIndex + 1}/${popupImages.length}`}
              className={`max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain transition-all duration-300 ease-in-out select-none ${popupFading ? 'opacity-0 scale-[0.97]' : 'opacity-100 scale-100'}`}
              draggable={false}
              onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchStart === null) return;
                const diff = e.changedTouches[0].clientX - touchStart;
                if (Math.abs(diff) > 20) {
                  if (diff < 0) setPopupIndex((popupIndex + 1) % popupImages.length);
                  else setPopupIndex((popupIndex - 1 + popupImages.length) % popupImages.length);
                }
                setTouchStart(null);
              }}
            />

            {/* 다음 버튼 */}
            {popupImages.length > 1 && (
              <button
                onClick={() => setPopupIndex((popupIndex + 1) % popupImages.length)}
                className="absolute -right-5 md:-right-14 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg hidden md:flex items-center justify-center hover:bg-white transition-colors z-10"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* 인디케이터 */}
            {popupImages.length > 1 && (
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {popupImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPopupIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === popupIndex ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
