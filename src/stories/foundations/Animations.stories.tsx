import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

const meta: Meta = {
  title: 'Foundations/Animations',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-bold mt-10 mb-4 border-b pb-2">{children}</h2>
);

const AnimationBox = ({
  label,
  animationClass,
  description,
  duration,
  autoPlay = false,
}: {
  label: string;
  animationClass: string;
  description: string;
  duration: string;
  autoPlay?: boolean;
}) => {
  const [playing, setPlaying] = useState(autoPlay);

  return (
    <div className="flex flex-col items-center gap-3 p-4 border rounded-xl bg-white min-w-[180px]">
      <div className="w-full h-24 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
        <div
          className={`w-14 h-14 rounded-lg bg-orange-400 ${playing ? animationClass : ''}`}
          style={{ transition: 'all 0.2s' }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-[10px] text-gray-400 font-mono">{duration}</p>
        <p className="text-[10px] text-gray-500 mt-1">{description}</p>
      </div>
      <button
        onClick={() => setPlaying(!playing)}
        className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
      >
        {playing ? '정지' : '재생'}
      </button>
    </div>
  );
};

const OneShotBox = ({
  label,
  animationClass,
  description,
  duration,
}: {
  label: string;
  animationClass: string;
  description: string;
  duration: string;
}) => {
  const [key, setKey] = useState(0);

  return (
    <div className="flex flex-col items-center gap-3 p-4 border rounded-xl bg-white min-w-[180px]">
      <div className="w-full h-24 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
        <div
          key={key}
          className={`w-14 h-14 rounded-lg bg-orange-400 ${animationClass}`}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-[10px] text-gray-400 font-mono">{duration}</p>
        <p className="text-[10px] text-gray-500 mt-1">{description}</p>
      </div>
      <button
        onClick={() => setKey((k) => k + 1)}
        className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
      >
        다시 재생
      </button>
    </div>
  );
};

export const TailwindAnimations: Story = {
  name: 'Tailwind 설정 애니메이션',
  render: () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Tailwind 설정 애니메이션</h1>
      <p className="text-sm text-gray-500 mb-6">
        tailwind.config.js의 keyframes/animation에 정의된 커스텀 애니메이션
      </p>

      <SectionTitle>전환 애니메이션 (단발성)</SectionTitle>
      <p className="text-xs text-gray-400 mb-4">&quot;다시 재생&quot; 버튼으로 재실행할 수 있습니다.</p>
      <div className="flex flex-wrap gap-4">
        <OneShotBox
          label="fade-in"
          animationClass="animate-fade-in"
          description="아래에서 위로 페이드 인"
          duration="0.3s ease-out"
        />
        <OneShotBox
          label="slide-in-right"
          animationClass="animate-slide-in-right"
          description="오른쪽에서 왼쪽으로 슬라이드"
          duration="0.3s ease-out"
        />
        <OneShotBox
          label="scale-in"
          animationClass="animate-scale-in"
          description="작은 크기에서 확대"
          duration="0.2s ease-out"
        />
        <OneShotBox
          label="slide-up"
          animationClass="animate-slide-up"
          description="아래에서 위로 슬라이드"
          duration="0.3s ease-out"
        />
        <OneShotBox
          label="fade-in-up"
          animationClass="animate-fade-in-up"
          description="아래에서 위로 페이드 인"
          duration="0.3s ease-out"
        />
      </div>

      <SectionTitle>아코디언 애니메이션</SectionTitle>
      <div className="flex flex-wrap gap-4">
        <AccordionDemo />
      </div>

      <SectionTitle>반복 애니메이션 (infinite)</SectionTitle>
      <p className="text-xs text-gray-400 mb-4">재생/정지 버튼으로 제어할 수 있습니다.</p>
      <div className="flex flex-wrap gap-4">
        <AnimationBox
          label="bounce-gentle"
          animationClass="animate-bounce-gentle"
          description="부드러운 바운스 (-4px)"
          duration="1.5s infinite"
          autoPlay
        />
        <AnimationBox
          label="wiggle"
          animationClass="animate-wiggle"
          description="좌우 미세 흔들림"
          duration="2s infinite"
          autoPlay
        />
        <AnimationBox
          label="float"
          animationClass="animate-float"
          description="위아래 떠다니기 (-20px)"
          duration="6s infinite"
          autoPlay
        />
        <AnimationBox
          label="float-delayed"
          animationClass="animate-float-delayed"
          description="지연된 떠다니기 (-15px)"
          duration="8s infinite"
          autoPlay
        />
        <AnimationBox
          label="bounce-slow"
          animationClass="animate-bounce-slow"
          description="느린 바운스 (-10px)"
          duration="4s infinite"
          autoPlay
        />
        <AnimationBox
          label="spin-slow"
          animationClass="animate-spin-slow"
          description="느린 회전"
          duration="20s infinite"
          autoPlay
        />
      </div>
    </div>
  ),
};

// Accordion demo component
const AccordionDemo = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-72 border rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 text-left text-sm font-semibold flex justify-between items-center hover:bg-gray-50"
      >
        <span>아코디언 데모</span>
        <span className="text-gray-400">{open ? '-' : '+'}</span>
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{
          maxHeight: open ? '200px' : '0px',
        }}
      >
        <div className="px-4 py-3 text-xs text-gray-500 border-t">
          <p>accordion-down: 높이 0 → content-height</p>
          <p>accordion-up: content-height → 0</p>
          <p className="mt-2 font-mono text-[10px] text-gray-400">0.2s ease-out</p>
          <p className="mt-1">Radix UI Accordion과 함께 사용됩니다.</p>
        </div>
      </div>
    </div>
  );
};

export const CSSAnimations: Story = {
  name: 'CSS 글로벌 애니메이션',
  render: () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">CSS 글로벌 애니메이션</h1>
      <p className="text-sm text-gray-500 mb-6">
        globals.css에 직접 정의된 @keyframes 애니메이션
      </p>

      <SectionTitle>페이드 / 슬라이드</SectionTitle>
      <div className="flex flex-wrap gap-4">
        <OneShotBox
          label="animate-fade-in"
          animationClass="animate-fade-in"
          description="fadeIn: 0 → 1, translateY(10px → 0)"
          duration="0.8s ease-out"
        />
        <OneShotBox
          label="animate-fade-in-up"
          animationClass="animate-fade-in-up"
          description="fadeInUp: 아래에서 페이드 인"
          duration="0.5s ease-out"
        />
        <OneShotBox
          label="animate-popup-in"
          animationClass="animate-popup-in"
          description="scale(0.9 → 1) 팝업"
          duration="0.3s ease-out"
        />
        <OneShotBox
          label="animate-notification-slide-up"
          animationClass="animate-notification-slide-up"
          description="알림 슬라이드 업"
          duration="0.4s ease-out"
        />
      </div>

      <SectionTitle>반복 애니메이션</SectionTitle>
      <div className="flex flex-wrap gap-4">
        <AnimationBox
          label="animate-bounce-slow"
          animationClass="animate-bounce-slow"
          description="느린 바운스 (bounceSlow)"
          duration="1.5s infinite"
          autoPlay
        />
        <AnimationBox
          label="animate-shimmer"
          animationClass="animate-shimmer"
          description="빛나는 효과"
          duration="2.5s infinite"
          autoPlay
        />
        <AnimationBox
          label="animate-float-particle"
          animationClass="animate-float-particle"
          description="파티클 떠다니기"
          duration="5s infinite"
          autoPlay
        />
        <AnimationBox
          label="animate-sparkle"
          animationClass="animate-sparkle"
          description="반짝임 효과"
          duration="3s infinite"
          autoPlay
        />
      </div>

      <SectionTitle>스크롤 / 마퀴</SectionTitle>
      <div className="space-y-4">
        <div className="overflow-hidden h-12 bg-gray-50 rounded-lg relative">
          <div className="animate-scroll-left flex items-center h-full gap-4 whitespace-nowrap">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="inline-block px-4 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                scroll-left {i + 1}
              </span>
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={`dup-${i}`} className="inline-block px-4 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                scroll-left {i + 1}
              </span>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-gray-400 font-mono">animate-scroll-left: 30s linear infinite</p>

        <div className="overflow-hidden h-12 bg-gray-50 rounded-lg relative">
          <div className="animate-scroll-right flex items-center h-full gap-4 whitespace-nowrap" style={{ transform: 'translateX(-50%)' }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="inline-block px-4 py-1 bg-orange-200 text-orange-800 rounded-full text-sm">
                scroll-right {i + 1}
              </span>
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={`dup-${i}`} className="inline-block px-4 py-1 bg-orange-200 text-orange-800 rounded-full text-sm">
                scroll-right {i + 1}
              </span>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-gray-400 font-mono">animate-scroll-right: 30s linear infinite</p>
      </div>

      <SectionTitle>글로우 효과</SectionTitle>
      <div className="flex flex-wrap gap-4">
        <AnimationBox
          label="animate-glow-move"
          animationClass="animate-glow-move"
          description="위치 이동 글로우"
          duration="8s infinite"
          autoPlay
        />
        <AnimationBox
          label="animate-glow-pulse"
          animationClass="animate-glow-pulse"
          description="투명도 + 크기 맥동"
          duration="6s infinite"
          autoPlay
        />
        <AnimationBox
          label="animate-glow-scale"
          animationClass="animate-glow-scale"
          description="크기 변화 글로우"
          duration="10s infinite"
          autoPlay
        />
        <AnimationBox
          label="animate-glow-fade"
          animationClass="animate-glow-fade"
          description="투명도 페이드"
          duration="5s infinite"
          autoPlay
        />
      </div>

      <SectionTitle>인피니트 루프 - 진행률 / 슬라이드</SectionTitle>
      <div className="flex flex-wrap gap-4">
        <div className="p-4 border rounded-xl bg-white min-w-[200px]">
          <p className="text-sm font-bold mb-3">animate-progress-fill</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-400 rounded-full animate-progress-fill" />
          </div>
          <p className="text-[10px] text-gray-400 font-mono mt-2">4s infinite</p>
        </div>

        <div className="p-4 border rounded-xl bg-white min-w-[200px]">
          <p className="text-sm font-bold mb-3">animate-slide-in-up</p>
          <div className="h-20 bg-gray-50 rounded-lg flex flex-col items-center justify-center gap-1 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-32 h-4 bg-orange-300 rounded animate-slide-in-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-[10px] text-gray-400 font-mono mt-2">4s infinite</p>
        </div>

        <div className="p-4 border rounded-xl bg-white min-w-[200px]">
          <p className="text-sm font-bold mb-3">animate-scan-line</p>
          <div className="h-20 bg-gray-900 rounded-lg relative overflow-hidden">
            <div className="absolute left-0 right-0 h-0.5 bg-orange-400 animate-scan-line" />
          </div>
          <p className="text-[10px] text-gray-400 font-mono mt-2">2.5s infinite</p>
        </div>

        <div className="p-4 border rounded-xl bg-white min-w-[200px]">
          <p className="text-sm font-bold mb-3">animate-soundbar</p>
          <div className="h-20 bg-gray-50 rounded-lg flex items-end justify-center gap-1 pb-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 bg-orange-400 rounded-t animate-soundbar"
                style={{
                  height: '16px',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
          <p className="text-[10px] text-gray-400 font-mono mt-2">0.8s infinite</p>
        </div>
      </div>
    </div>
  ),
};

export const AllAnimationsSummary: Story = {
  name: '애니메이션 목록 요약',
  render: () => {
    const tailwindAnimations = [
      { name: 'accordion-down', keyframes: 'height: 0 → content-height', timing: '0.2s ease-out', type: '단발' },
      { name: 'accordion-up', keyframes: 'height: content-height → 0', timing: '0.2s ease-out', type: '단발' },
      { name: 'fade-in', keyframes: 'opacity: 0→1, translateY(8px→0)', timing: '0.3s ease-out', type: '단발' },
      { name: 'slide-in-right', keyframes: 'opacity: 0→1, translateX(16px→0)', timing: '0.3s ease-out', type: '단발' },
      { name: 'scale-in', keyframes: 'opacity: 0→1, scale(0.96→1)', timing: '0.2s ease-out', type: '단발' },
      { name: 'bounce-gentle', keyframes: 'translateY(0→-4px→0)', timing: '1.5s infinite', type: '반복' },
      { name: 'wiggle', keyframes: 'rotate(0→1deg→-1deg→0)', timing: '2s infinite', type: '반복' },
      { name: 'float', keyframes: 'translateY(0→-20px→0)', timing: '6s infinite', type: '반복' },
      { name: 'float-delayed', keyframes: 'translateY(0→-15px→0)', timing: '8s infinite', type: '반복' },
      { name: 'bounce-slow', keyframes: 'translateY(0→-10px→0)', timing: '4s infinite', type: '반복' },
      { name: 'spin-slow', keyframes: 'rotate(0→360deg)', timing: '20s infinite', type: '반복' },
      { name: 'slide-up', keyframes: 'opacity: 0→1, translateY(100%→0)', timing: '0.3s ease-out', type: '단발' },
      { name: 'fade-in-up', keyframes: 'opacity: 0→1, translateY(8px→0)', timing: '0.3s ease-out', type: '단발' },
    ];

    const cssAnimations = [
      { name: 'scroll-left', timing: '30s linear infinite', type: '반복' },
      { name: 'scroll-right', timing: '30s linear infinite', type: '반복' },
      { name: 'fadeIn', timing: '0.8s ease-out', type: '단발' },
      { name: 'fadeOut', timing: '0.3s ease-out', type: '단발' },
      { name: 'fadeInUp', timing: '0.5s ease-out', type: '단발' },
      { name: 'popUp', timing: '0.5s ease', type: '단발' },
      { name: 'popupIn', timing: '0.3s ease-out', type: '단발' },
      { name: 'bounceSlow', timing: '1.5s infinite', type: '반복' },
      { name: 'shimmer', timing: '2.5s infinite', type: '반복' },
      { name: 'float-particle', timing: '5s infinite', type: '반복' },
      { name: 'sparkle', timing: '3s infinite', type: '반복' },
      { name: 'soundbar', timing: '0.8s infinite', type: '반복' },
      { name: 'progressFill', timing: '4s infinite', type: '반복' },
      { name: 'slideInUp', timing: '4s infinite', type: '반복' },
      { name: 'scanLine', timing: '2.5s infinite', type: '반복' },
      { name: 'glowMove', timing: '8s infinite', type: '반복' },
      { name: 'glowPulse', timing: '6s infinite', type: '반복' },
      { name: 'glowScale', timing: '10s infinite', type: '반복' },
      { name: 'glowFade', timing: '5s infinite', type: '반복' },
      { name: 'leafFall1-5', timing: '7-11s infinite', type: '반복' },
      { name: 'prism-drift-1/2/3', timing: '12-22s infinite', type: '반복' },
      { name: 'prism-marquee-x-1/2/3', timing: '18-30s infinite', type: '반복' },
      { name: 'notificationSlideUp', timing: '0.4s ease-out', type: '단발' },
      { name: 'typewriter-*', timing: '3s infinite', type: '반복' },
    ];

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">전체 애니메이션 목록</h1>
        <p className="text-sm text-gray-500 mb-6">프로젝트에 정의된 모든 애니메이션 요약</p>

        <SectionTitle>Tailwind Config 애니메이션 ({tailwindAnimations.length}개)</SectionTitle>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 pr-4 font-semibold">이름</th>
              <th className="text-left py-2 pr-4 font-semibold">키프레임</th>
              <th className="text-left py-2 pr-4 font-semibold">타이밍</th>
              <th className="text-left py-2 font-semibold">유형</th>
            </tr>
          </thead>
          <tbody>
            {tailwindAnimations.map((a) => (
              <tr key={a.name} className="border-b border-gray-100">
                <td className="py-2 pr-4 font-mono font-bold text-orange-600 text-xs">{a.name}</td>
                <td className="py-2 pr-4 font-mono text-gray-500 text-xs">{a.keyframes}</td>
                <td className="py-2 pr-4 font-mono text-gray-400 text-xs">{a.timing}</td>
                <td className="py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    a.type === '반복' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {a.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <SectionTitle>CSS 글로벌 애니메이션 ({cssAnimations.length}개)</SectionTitle>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 pr-4 font-semibold">이름</th>
              <th className="text-left py-2 pr-4 font-semibold">타이밍</th>
              <th className="text-left py-2 font-semibold">유형</th>
            </tr>
          </thead>
          <tbody>
            {cssAnimations.map((a) => (
              <tr key={a.name} className="border-b border-gray-100">
                <td className="py-2 pr-4 font-mono font-bold text-orange-600 text-xs">{a.name}</td>
                <td className="py-2 pr-4 font-mono text-gray-400 text-xs">{a.timing}</td>
                <td className="py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    a.type === '반복' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {a.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
};
