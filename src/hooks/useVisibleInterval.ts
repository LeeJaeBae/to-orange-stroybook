import { useEffect, useRef, RefObject } from 'react';

export function useVisibleInterval(
  elementRef: RefObject<HTMLElement | null>,
  callback: () => void,
  delayMs: number
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!intervalId) {
            intervalId = setInterval(() => callbackRef.current(), delayMs);
          }
        } else {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (intervalId) clearInterval(intervalId);
    };
  }, [elementRef, delayMs]);
}
