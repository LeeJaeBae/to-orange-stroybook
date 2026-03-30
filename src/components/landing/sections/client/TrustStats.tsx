'use client';

import { animate, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { stats } from '../../lib/landing-data';
import { useScrollReveal } from '../../lib/useScrollReveal';
import { cn } from '@/lib/utils';
import type { Stat } from '../../types';

function CountUp({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, stat.value, {
      duration: 2,
      onUpdate(v) {
        setDisplay(stat.decimal ? v.toFixed(stat.decimal) : Math.floor(v).toLocaleString());
      },
    });
    return () => controls.stop();
  }, [isInView, stat]);

  return (
    <span ref={ref}>
      {stat.prefix ?? ''}{display}{stat.suffix ?? ''}
    </span>
  );
}

export function TrustStats() {
  const { ref, revealed } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={cn('scroll-reveal', revealed && 'revealed', 'py-16 px-4 lg:py-24')}
    >
      <div className="mx-auto max-w-4xl grid grid-cols-2 gap-8 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="reveal-child text-center">
            <div className="text-3xl font-bold text-primary lg:text-4xl">
              <CountUp stat={stat} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
