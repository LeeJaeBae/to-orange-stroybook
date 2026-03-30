'use client';

import { useState } from 'react';
import Image from 'next/image';
import { steps, deliverySteps } from '../../lib/landing-data';
import { useScrollReveal } from '../../lib/useScrollReveal';
import { cn } from '@/lib/utils';

export function HowItWorks() {
  const { ref, revealed } = useScrollReveal();
  const [activeProcess, setActiveProcess] = useState<1 | 2>(1);
  const [currentStep, setCurrentStep] = useState(3);

  const step = steps[currentStep - 1];

  return (
    <section
      ref={ref}
      className={cn('scroll-reveal', revealed && 'revealed', 'bg-background py-8 px-4 lg:py-20')}
    >
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="reveal-child mb-6 text-center">
          <p className="mb-2 text-sm font-medium text-orange-500">How it works</p>
          <h2 className="mb-3 text-2xl font-bold text-foreground lg:text-3xl">
            편지, 이렇게 전달됩니다
          </h2>
          <p className="text-muted-foreground">
            막막한 첫 문장부터 안전한 전달까지, 전 과정을 함께합니다
          </p>
        </div>

        {/* Process Toggle - desktop only */}
        <div className="reveal-child mb-6 hidden justify-center lg:flex">
          <div className="inline-flex rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => setActiveProcess(1)}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                activeProcess === 1
                  ? 'bg-orange-500 text-white'
                  : 'text-muted-foreground'
              }`}
            >
              Step 1. 내가 할 일
            </button>
            <button
              type="button"
              onClick={() => setActiveProcess(2)}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                activeProcess === 2
                  ? 'bg-orange-500 text-white'
                  : 'text-muted-foreground'
              }`}
            >
              Step 2. 투오렌지가 할 일
            </button>
          </div>
        </div>

        {/* ===== Mobile: 3-step summary ===== */}
        <div className="reveal-child lg:hidden">
          <div className="grid grid-cols-3 gap-3 px-2">
            {[
              { icon: '\u270D\uFE0F', title: '편지 작성', desc: 'AI가 문장을 다듬어줘요' },
              { icon: '\uD83D\uDDA8\uFE0F', title: '인쇄·동봉', desc: '사진과 함께 인쇄해요' },
              { icon: '\uD83D\uDCEE', title: '우체국 배송', desc: '3일 내 도착해요' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl bg-orange-50 p-3 text-center">
                <div className="mb-2 text-2xl">{s.icon}</div>
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Desktop: Process 1 - User Steps (carousel) ===== */}
        {activeProcess === 1 && (
          <div className="hidden lg:block">
            <div className="mx-auto flex max-w-md flex-col items-center gap-6">
              {/* Step selector dots */}
              <div className="flex gap-3">
                {steps.map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setCurrentStep(s.num)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                      currentStep === s.num
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {s.num}
                  </button>
                ))}
              </div>

              {/* Step title */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.sub}</p>
              </div>

              {/* Step image */}
              <div className="w-full">
                <Image
                  src={step.image}
                  alt={step.title}
                  width={400}
                  height={300}
                  loading="lazy"
                  className="h-auto w-full"
                />
              </div>

              {/* Tags */}
              <div className="flex w-full flex-wrap justify-center gap-2">
                {step.details.map((detail, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-orange-100 px-3 py-1.5 text-sm text-orange-600"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== Desktop: Process 2 - Delivery Steps ===== */}
        {activeProcess === 2 && (
          <div className="mx-auto hidden max-w-2xl lg:block">
            {/* Top banner */}
            <div className="mb-8 rounded-2xl bg-orange-50/50 px-4 py-5 text-center">
              <h3 className="mb-1 text-base font-bold text-orange-500 lg:text-lg">
                편지 한 장이 길을 잃지 않도록
              </h3>
              <p className="text-xs text-orange-500 lg:text-sm">
                가장 멀리 있는 마음이, 가장 안전하게 닿도록
              </p>
            </div>

            {/* 2x2 grid cards */}
            <div className="grid grid-cols-2 gap-4">
              {deliverySteps.map((s) => (
                <div
                  key={s.num}
                  className="reveal-child rounded-2xl border border-border bg-background p-5 shadow-sm"
                >
                  <div className="mb-4">
                    <span className="inline-block rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                      STEP {s.num}
                    </span>
                  </div>
                  <h4 className="mb-2 text-base font-bold text-foreground">
                    {s.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
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
