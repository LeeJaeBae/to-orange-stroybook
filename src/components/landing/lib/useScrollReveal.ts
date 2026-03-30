'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * CSS class-based scroll reveal that works reliably with back navigation.
 *
 * Instead of Framer Motion initial="hidden", uses a CSS class to hide
 * sections and toggles a 'revealed' state via IntersectionObserver.
 * This avoids Framer Motion state issues on back/forward navigation.
 */
export function useScrollReveal(margin = '-80px') {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already in viewport on mount (back navigation) → reveal immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [margin]);

  return { ref, revealed };
}
