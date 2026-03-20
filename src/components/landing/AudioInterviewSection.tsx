'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface InterviewItem {
  title: string;
  subtitle: string;
  image: string;
  author: string;
  age: number;
  detail: string;
  lines: string[];
  duration: number;
}

const items: InterviewItem[] = [
  {
    title: '월간식단표',
    subtitle: '달력형, 2개월치 식단 정보',
    image: '/main/interview/sikdanpyo.jpg',
    author: '김OO씨',
    age: 38,
    detail: '3년수감 2024년 출소',
    lines: [
      '미리 알 수 있다는 것만으로도',
      '하루를 준비하는 기준이 생깁니다.',
      '뭘 먹을지 알면 그날이 기다려져요.',
    ],
    duration: 4,
  },
  {
    title: '스도쿠',
    subtitle: '두뇌 훈련 게임',
    image: '/main/interview/sudoku.png',
    author: '김OO씨',
    age: 37,
    detail: '3년수감 2024년 출소',
    lines: [
      '머리 안 쓰면 진짜 굳어요.',
      '그거 풀면서 버텼어요.',
      '놀이가 아닌 생존방법이죠.',
    ],
    duration: 4,
  },
  {
    title: '보라미 영화',
    subtitle: 'TV 시청 편성표',
    image: '/main/interview/movie.png',
    author: '이OO씨',
    age: 42,
    detail: '4년수감 2023년 출소',
    lines: [
      '기다릴 수 있는 무언가가 있다는 건',
      '시간을 버티는 힘이 됩니다.',
      '영화 뭐 하는지 아는 게 소소한 행복이에요.',
    ],
    duration: 4,
  },
  {
    title: '가석방 계산기',
    subtitle: '형기/점수 관리 시뮬레이션',
    image: '/main/interview/calculator.png',
    author: '최OO씨',
    age: 41,
    detail: '4년수감 2023년 출소',
    lines: [
      '나가는 날을 알고 나서부터',
      '준비할 수 있었어요.',
      '날짜가 생기니까 계획이 생기더라고요.',
    ],
    duration: 4,
  },
  {
    title: '최신유머',
    subtitle: '웃음을 선물하세요',
    image: '/main/interview/phone.png',
    author: '박OO씨',
    age: 45,
    detail: '5년수감 2023년 출소',
    lines: [
      '유머책 하나로 방 전체가 돌려봤어요.',
      '웃을 일이 있어야 하루가 가요.',
      '그거 없으면 진짜 아무 말도 안 해요.',
    ],
    duration: 4,
  },
  {
    title: '직업훈련 안내',
    subtitle: '자격증 취득 정보',
    image: '/main/interview/news.jpg',
    author: '정OO씨',
    age: 33,
    detail: '3년수감 2024년 출소',
    lines: [
      '나가자마자 일하려면 안에서 미리 따야 해요.',
      '바깥에서 뭐가 필요한지 알아야 준비를 하죠.',
      '그 정보가 없으면 막막해요.',
    ],
    duration: 4,
  },
];

export default function AudioInterviewSection() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Scroll visibility animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const current = items[currentIdx];

  // Auto-play logic + orbit animation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setCurrentIdx((idx) => (idx + 1) % items.length);
            return 0;
          }
          return prev + 1;
        });
        setOrbitAngle((prev) => (prev + 2) % 360);
      }, current.duration * 10);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIdx, current.duration]);

  const currentTime = Math.floor((progress / 100) * current.duration);
  const formatTime = (sec: number): string => `0:${sec.toString().padStart(2, '0')}`;

  // currentIdx 변경 시 모바일 탭 자동 스크롤
  useEffect(() => {
    if (!tabsRef.current) return;
    const container = tabsRef.current;
    const buttons = container.querySelectorAll('button');
    const activeBtn = buttons[currentIdx];
    if (!activeBtn) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const scrollLeft = container.scrollLeft + btnRect.left - containerRect.left - (containerRect.width / 2) + (btnRect.width / 2);

    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }, [currentIdx]);

  const handleTabClick = (idx: number) => {
    setCurrentIdx(idx);
    setProgress(0);
  };

  // Progress bar seek 핸들러
  const calculateProgress = (clientX: number) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const newProgress = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setProgress(newProgress);
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

  // 전역 mouse/touch 이벤트 핸들러
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        calculateProgress(e.clientX);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        calculateProgress(e.touches[0].clientX);
      }
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <section ref={sectionRef} className="bg-white flex items-center justify-center py-8 md:py-[84px] px-4 md:px-6">
      <div className="max-w-[1104px] w-full flex flex-col items-center gap-8">

        {/* Mobile: Top text area */}
        <div className="lg:hidden text-center px-2">
          <p className={`text-orange-500 font-medium mb-4 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}>To Orange 인터넷편지 서비스</p>
          <h1 className={`text-2xl font-bold text-gray-900 leading-[1.4] mb-4 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`} style={{ transitionDelay: '100ms' }}>
            재소자들에게 바깥세상을<br />느끼게 해줄 유일한 창구
          </h1>
          <p className={`text-gray-500 text-sm transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`} style={{ transitionDelay: '200ms' }}>
            투오렌지 서비스는 단순히 편지를 전달하는 것을 넘어, 재소자가 고립된 공간에서도 세상의 온기와 삶의 흐름을 느낄 수 있게 합니다.
          </p>
        </div>

        {/* Mobile: Top tab swipe */}
        <div
          ref={tabsRef}
          className="lg:hidden w-full overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-2 px-2 pb-2 min-w-max">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleTabClick(idx)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                  idx === currentIdx
                    ? 'bg-orange-50 border-2 border-orange-200'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-end gap-[1px] h-4">
                  {[3, 5, 4, 6, 3].map((h, i) => (
                    <div
                      key={i}
                      className={`w-[2px] rounded-full transition-colors ${
                        idx === currentIdx ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                      style={{ height: `${h * 2}px` }}
                    />
                  ))}
                </div>
                <div className="text-left">
                  <p className={`text-sm font-semibold ${idx === currentIdx ? 'text-orange-500' : 'text-gray-700'}`}>
                    {item.title}
                  </p>
                  <p className={`text-xs ${idx === currentIdx ? 'text-orange-400' : 'text-gray-400'}`}>
                    {item.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main content area - PC: 3 column layout */}
        <div className={`flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-between gap-6 lg:gap-8 w-full transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`} style={{ transitionDelay: '300ms' }}>

          {/* PC: Left copy area */}
          <div className="hidden lg:flex flex-col justify-end flex-shrink-0 w-[300px]">
            <p className={`text-orange-500 font-medium mb-4 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>To Orange 인터넷편지 서비스</p>
            <h1 className={`text-3xl font-bold text-gray-900 leading-[1.4] mb-6 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`} style={{ transitionDelay: '100ms' }}>
              재소자들에게 바깥세상을<br />느끼게해줄 유일한 창구
            </h1>
            <p className={`text-gray-500 text-base leading-[1.8] mb-10 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`} style={{ transitionDelay: '200ms' }}>
              투오렌지 서비스는<br />
              단순히 편지를 전달하는 것을 넘어,<br /><br />
              재소자가 고립된 공간에서도<br />
              세상의 온기와 삶의 흐름을 느낄 수 있게 합니다.
            </p>
            <Link
              href="/letter/compose/1"
              className={`inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium w-fit transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              편지 쓰러가기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Center content card */}
          <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:-mt-2.5">
            <div className="flex flex-col items-center">

              {/* Soundbar + notice (moved up) */}
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-end gap-[2px] h-6 mb-2">
                  {[4, 7, 5, 9, 6, 8, 5, 7, 4, 6, 8, 5, 9, 7, 4, 6, 5, 8, 7, 5, 9, 6, 4, 7, 8, 5, 6].map((h, i) => (
                    <div
                      key={i}
                      className="w-[3px] bg-gray-300 rounded-full animate-soundbar"
                      style={{
                        height: `${h * 2.5}px`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                  <span>이 목소리는 바깥에서는 들리지 않습니다.</span>
                </div>
              </div>

              {/* Circular thumbnail + orbit line (moved down) - 클릭으로 일시정지 */}
              <div
                className="relative w-[158px] h-[158px] mb-4 cursor-pointer group"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {/* <div className="absolute inset-0 rounded-full border-2 border-orange-300"></div>
                <div
                  className="absolute w-3 h-3 bg-orange-500 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${orbitAngle}deg) translateX(79px)`,
                  }}
                /> */}
                <div className="absolute inset-3 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={current.image}
                    alt={current.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* 일시정지 오버레이 - 어둡게만 표시 */}
                  <div className={`absolute inset-0 bg-black/40 transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`} />
                </div>
              </div>

              {/* Interview content */}
              <div className="text-center space-y-1">
                {current.lines.map((line, idx) => {
                  const lineProgress = (progress / 100) * current.lines.length;
                  const isActive = Math.floor(lineProgress) === idx;
                  const isPast = Math.floor(lineProgress) > idx;

                  return (
                    <p
                      key={idx}
                      className={`text-lg leading-relaxed transition-colors duration-300 ${
                        isActive ? 'text-orange-500 font-semibold' : isPast ? 'text-gray-700' : 'text-gray-700'
                      }`}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>

              {/* Interviewee info */}
              <p className="text-gray-400 text-xs font-normal mt-1.5 mb-8">
                — {current.author} ({current.age}세) {current.detail}
              </p>

              {/* Playback control bar */}
              <div className="flex items-center gap-2 w-full max-w-[280px]">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-[26px] h-[26px] bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors flex-shrink-0"
                >
                  {isPlaying ? (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-2.5 h-2.5 ml-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>
                <span className="text-gray-500 text-xs font-mono">{formatTime(currentTime)}</span>
                {/* 드래그 가능한 프로그레스 바 */}
                <div
                  ref={progressBarRef}
                  className="flex-1 h-4 flex items-center cursor-pointer group"
                  onMouseDown={handleProgressMouseDown}
                  onTouchStart={handleProgressTouchStart}
                >
                  <div className="w-full h-1 bg-gray-200 rounded-full relative">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                    {/* 드래그 핸들 */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full shadow-md transition-transform ${
                        isDragging ? 'scale-125' : 'scale-100 group-hover:scale-110'
                      }`}
                      style={{ left: `calc(${progress}% - 6px)` }}
                    />
                  </div>
                </div>
                <span className="text-gray-500 text-xs font-mono">{formatTime(current.duration)}</span>
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              </div>

            </div>
          </div>

          {/* PC: Right tab menu */}
          <div className="hidden lg:flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden flex-shrink-0">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleTabClick(idx)}
                className={`flex items-center gap-3 px-12 py-4 transition-all border-b border-gray-100 last:border-b-0 text-left ${
                  idx === currentIdx
                    ? 'bg-orange-50'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-end gap-[1px] h-5 w-6">
                  {[3, 5, 4, 6, 3].map((h, i) => (
                    <div
                      key={i}
                      className={`w-[2px] rounded-full transition-colors ${
                        idx === currentIdx ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                      style={{ height: `${h * 2.5}px` }}
                    />
                  ))}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${idx === currentIdx ? 'text-orange-500' : 'text-gray-700'}`}>
                    {item.title}
                  </p>
                  <p className={`text-xs ${idx === currentIdx ? 'text-orange-400' : 'text-gray-400'}`}>
                    {item.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>

        </div>

        {/* Mobile: Bottom CTA button */}
        <Link
          href="/letter/compose/1"
          className={`lg:hidden inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          편지 쓰러가기
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>

      </div>
    </section>
  );
}
