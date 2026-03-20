'use client';

import { useState, useEffect, useRef } from 'react';
import useScrollAnimation from '@/hooks/useScrollAnimation';

interface Stat {
  value: number;
  label: string;
  suffix: string;
  prefix: string;
  decimal?: number;
}

interface CountUpProps {
  target: number;
  suffix?: string;
  prefix?: string;
  decimal?: number;
  duration?: number;
}

const stats: Stat[] = [
  { value: 12847, label: '전달 완료', suffix: '', prefix: '' },
  { value: 100, label: '교정시설 발송', suffix: '+', prefix: '' },
  { value: 3, label: '평균 도착 기간', suffix: '일', prefix: '' },
  { value: 4.8, label: '이용자 만족도', suffix: '', prefix: '', decimal: 1 },
];

function CountUp({ target, suffix = '', prefix = '', decimal = 0, duration = 2000 }: CountUpProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = Date.now();
    const startValue = 0;
    let rafId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + (target - startValue) * easeOut;
      setCount(currentValue);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [hasStarted, target, duration]);

  const displayValue = decimal > 0 ? count.toFixed(decimal) : Math.floor(count).toLocaleString();

  return (
    <span ref={ref}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

export default function TrustStats() {
  const sectionRef = useScrollAnimation<HTMLElement>();

  return (
    <section ref={sectionRef} className="py-6 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* PC: 4열 그리드 */}
        <div className="hidden md:grid grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white rounded-[18px] p-6 text-center border border-[#F6F6F6] shadow-[0_0_6px_0_#EFEFEF] fade-up`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <p className="text-4xl font-bold text-orange-500 mb-1">
                <CountUp
                  target={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  decimal={stat.decimal || 0}
                  duration={2000 + index * 200}
                />
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 모바일: 2열 그리드 */}
        <div className="grid md:hidden grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-3 bg-gray-50 rounded-xl fade-up"
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <p className="text-2xl font-bold text-orange-500 mb-1">
                <CountUp
                  target={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  decimal={stat.decimal || 0}
                  duration={2000 + index * 200}
                />
              </p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
