'use client';

import { useEffect, useRef, useCallback } from 'react';

export function ScrollIndicator() {
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const currentRef = useRef(0);
  const targetRef = useRef(0);

  const animate = useCallback(() => {
    const diff = targetRef.current - currentRef.current;
    // lerp로 부드럽게 보간
    currentRef.current += diff * 0.15;

    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${currentRef.current / 100})`;
      barRef.current.style.opacity = currentRef.current < 0.5 ? '0' : '1';
    }

    if (Math.abs(diff) > 0.1) {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      targetRef.current = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none">
      <div
        ref={barRef}
        className="h-full w-full bg-primary origin-left opacity-0"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
