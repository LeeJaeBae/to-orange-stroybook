import { useState, useLayoutEffect, useRef, useCallback, useEffect } from 'react';
import { CANVAS_WIDTH } from '../constants';

export function useLetterScale(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState<number | null>(null);
  const [floatingButtonLeft, setFloatingButtonLeft] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [pinchZoom, setPinchZoom] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const pinchStartRef = useRef<{ dist: number; zoom: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  useLayoutEffect(() => {
    const updateLayout = () => {
      setIsMobile(window.innerWidth < 768);

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const containerWidth = rect.width;
        const newScale = Math.min(containerWidth / CANVAS_WIDTH, 1.0);
        setScale(newScale);

        if (window.innerWidth >= 768) {
          const scaledCanvasWidth = CANVAS_WIDTH * newScale;
          const buttonLeft = rect.left + rect.width / 2 + scaledCanvasWidth / 2 + 16;
          setFloatingButtonLeft(buttonLeft);
        }
      }
    };
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [containerRef]);

  // 핀치줌 상태를 ref로도 유지 (네이티브 이벤트 핸들러에서 최신 값 접근)
  const pinchZoomRef = useRef(pinchZoom);
  pinchZoomRef.current = pinchZoom;

  // 네이티브 터치 이벤트로 핀치줌 처리 (passive: false로 preventDefault 보장)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // 핀치 시작
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        pinchStartRef.current = { dist, zoom: pinchZoomRef.current };
        const rect = container.getBoundingClientRect();
        const cx = (((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width) * 100;
        const cy = (((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) / rect.height) * 100;
        setZoomOrigin({ x: Math.max(0, Math.min(100, cx)), y: Math.max(0, Math.min(100, cy)) });
        e.preventDefault();
      } else if (e.touches.length === 1) {
        // 더블탭 감지 → 줌 리셋
        const now = Date.now();
        if (now - lastTapRef.current < 300) {
          e.preventDefault();
          setPinchZoom(1);
        }
        lastTapRef.current = now;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStartRef.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ratio = dist / pinchStartRef.current.dist;
        const newZoom = Math.max(1, Math.min(3, pinchStartRef.current.zoom * ratio));
        setPinchZoom(newZoom);
      }
    };

    const handleTouchEnd = () => {
      pinchStartRef.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [containerRef]);

  const resetZoom = useCallback(() => setPinchZoom(1), []);

  return {
    scale,
    floatingButtonLeft,
    isMobile,
    pinchZoom,
    zoomOrigin,
    resetZoom,
  };
}
