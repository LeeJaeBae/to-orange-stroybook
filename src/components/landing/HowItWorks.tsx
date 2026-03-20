'use client';

import { useState, useEffect } from 'react';
import useScrollAnimation from '@/hooks/useScrollAnimation';
import { useVisibleInterval } from '@/hooks/useVisibleInterval';

interface Step {
  num: number;
  title: string;
  sub: string;
  details: string[];
  isTag?: boolean;
  highlight?: boolean;
  img: string;
}

interface DeliveryStep {
  num: number;
  title: string;
  sub: string;
  details: string[];
  img: string;
}

const steps: Step[] = [
  {
    num: 1,
    title: '받는 사람',
    sub: '수신자 선택',
    details: ['주소록에서 빠르게 선택', '새 수신자 추가 가능', '우편 종류 선택'],
    isTag: true,
    img: '/main/steps/step-1.png',
  },
  {
    num: 2,
    title: '편지지',
    sub: '디자인 선택',
    details: ['기본', '상용', '디자이너', 'AI'],
    isTag: true,
    img: '/main/steps/step-2.png',
  },
  {
    num: 3,
    title: '편지 작성',
    sub: 'AI 도움',
    highlight: true,
    details: ['처음 인사', '중간 내용', '마무리'],
    isTag: true,
    img: '/main/steps/step-3.png',
  },
  {
    num: 4,
    title: '사진출력',
    sub: '사진 인화',
    details: ['최대 6장', '고화질 인화', '편지와 함께 동봉'],
    isTag: true,
    img: '/main/steps/step-4.png',
  },
  {
    num: 5,
    title: '미리보기',
    sub: '말투 변환',
    details: ['친근하게', '격식체', '엄마 말투', '친구 말투'],
    isTag: true,
    img: '/main/steps/step-5.png',
  },
  {
    num: 6,
    title: '추가옵션',
    sub: '콘텐츠 동봉',
    details: ['월간 식단표', '영화 편성표', '유머', '스도쿠'],
    isTag: true,
    img: '/main/steps/step-6.png',
  },
];

const deliverySteps: DeliveryStep[] = [
  {
    num: 1,
    title: '인쇄(출력)',
    sub: '고품질 출력',
    details: ['선택한 편지지 디자인에 맞춰 전용 인쇄소에서 고해상도로 출력합니다.', '편지가 깨끗하고 선명하게 전달되도록 전 과정에서 품질을 관리합니다.'],
    img: '/main/steps/print.png',
  },
  {
    num: 2,
    title: '동봉 작업',
    sub: '정성 포장',
    details: ['사진, 향기, 작은 선물 등 선택한 항목을 함께 담아 준비합니다.', '바깥세상을 떠올릴 수 있는 통로가 흐트러지지 않도록 정성스럽게 동봉합니다.'],
    img: '/main/steps/package.png',
  },
  {
    num: 3,
    title: '우체국 접수·발송',
    sub: '정식 발송',
    details: ['편지는 우체국을 통해 등기우편으로 정식 접수되어 발송됩니다.', '교정시설 반입 규정에 맞춰 처리되며, 발송 완료 시 알림톡으로 안내드립니다.'],
    img: '/main/steps/postoffice.png',
  },
  {
    num: 4,
    title: '배송 추적 안내',
    sub: '실시간 확인',
    details: ['우체국 배송 시스템을 통해 편지의 이동 과정을 확인할 수 있습니다.', '접수 → 배송 → 도착까지의 과정을 사용자가 직접 확인할 수 있습니다.'],
    img: '/main/steps/tracking.png',
  },
];

export default function HowItWorks() {
  const sectionRef = useScrollAnimation<HTMLElement>();
  const [activeProcess, setActiveProcess] = useState(1);
  const [currentStep, setCurrentStep] = useState(3);
  const [currentDeliveryStep, setCurrentDeliveryStep] = useState(1);

  // Auto-roll steps for Process 1
  useVisibleInterval(sectionRef, () => {
    if (activeProcess === 1) {
      setCurrentStep((prev) => (prev >= 6 ? 1 : prev + 1));
    }
  }, 2000);

  // Auto-roll steps for Process 2
  useVisibleInterval(sectionRef, () => {
    if (activeProcess === 2) {
      setCurrentDeliveryStep((prev) => (prev >= 4 ? 1 : prev + 1));
    }
  }, 2000);

  const step = steps[currentStep - 1];

  return (
    <section ref={sectionRef} className="py-8 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-6 fade-up">
          <p className="text-orange-500 font-medium mb-2">How it works</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">편지, 이렇게 전달됩니다</h2>
          <p className="text-gray-500">막막한 첫 문장부터 안전한 전달까지, 전 과정을 함께합니다</p>
        </div>

        {/* Process Toggle */}
        <div className="hidden md:flex justify-center mb-6 fade-up fade-up-delay-1">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setActiveProcess(1)}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                activeProcess === 1 ? 'bg-orange-500 text-white' : 'text-gray-500'
              }`}
            >
              <span className="hidden sm:inline">Step 1.</span> 내가 할 일
            </button>
            <button
              onClick={() => setActiveProcess(2)}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                activeProcess === 2 ? 'bg-orange-500 text-white' : 'text-gray-500'
              }`}
            >
              <span className="hidden sm:inline">Step 2.</span> 투오렌지가 할 일
            </button>
          </div>
        </div>

        {/* Mobile: 3-step summary */}
        <div className="md:hidden">
          <div className="grid grid-cols-3 gap-3 px-2">
            {[
              { icon: '✍️', title: '편지 작성', desc: 'AI가 문장을 다듬어줘요' },
              { icon: '🖨️', title: '인쇄·동봉', desc: '사진과 함께 인쇄해요' },
              { icon: '📮', title: '우체국 배송', desc: '3일 내 도착해요' },
            ].map((step, i) => (
              <div key={i} className="text-center p-3 bg-orange-50 rounded-xl">
                <div className="text-2xl mb-2">{step.icon}</div>
                <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Process 1: User Steps - 캐러셀 방식 */}
        {activeProcess === 1 && (
          <div className="hidden md:block">
            <div className="flex flex-col gap-6 items-center max-w-md mx-auto">
              {/* 상단: 이미지 */}
              <div className="w-full">
                {step.img && (
                  <img
                    src={step.img}
                    alt={step.title}
                    className="w-full"
                  />
                )}
              </div>

              {/* 하단: 태그 센터 정렬 */}
              <div className="w-full flex flex-wrap gap-2 justify-center">
                {step.details.map((detail, i) => (
                  <span
                    key={i}
                    className="text-sm px-3 py-1.5 rounded-full bg-orange-100 text-orange-600"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Process 2: Delivery Steps - 새 디자인 */}
        {activeProcess === 2 && (
          <div className="hidden md:block max-w-2xl mx-auto">
            {/* 상단 타이틀 영역 */}
            <div className="bg-orange-50/50 rounded-2xl py-5 px-4 text-center mb-8">
              <h3 className="text-base md:text-lg font-bold text-orange-500 mb-1">편지 한 장이 길을 잃지 않도록</h3>
              <p className="text-orange-500 text-xs md:text-sm">가장 멀리 있는 마음이, 가장 안전하게 닿도록</p>
            </div>

            {/* 4개 카드 2x2 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              {deliverySteps.map((s) => (
                <div
                  key={s.num}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                >
                  {/* STEP 뱃지 */}
                  <div className="mb-4">
                    <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      STEP {s.num}
                    </span>
                  </div>

                  {/* 제목 */}
                  <h4 className="font-bold text-gray-900 text-base mb-2">{s.title}</h4>

                  {/* 상세 내용 */}
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {s.details.join(' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
