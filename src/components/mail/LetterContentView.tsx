'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { StationeryRenderer } from '@/components/mail/StationeryRenderer';
import { getStationeryLineColor } from '@/components/mail/letter-editor/utils';
import { getPageSide, resolveWritingArea, shouldRenderWritingLines } from '@/components/mail/letter-editor/constants';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  getLetterRenderingMetrics,
  renderLetterContentHtml,
  resolveLetterFontFamily,
  splitLetterContentIntoPages,
} from '@/components/mail/letter-rendering';
import { cn } from '@/lib/utils';

interface LetterContentViewProps {
  content: string;
  stationeryStyle?: Record<string, unknown> | null;
  font?: string | null;
  fontSize?: number | null;
  lineColor?: string | null;
  className?: string;
}

export function LetterContentView({ content, stationeryStyle, font: fontProp, fontSize: fontSizeProp, lineColor: lineColorProp, className }: LetterContentViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 0.4 : 1);
  const [currentPage, setCurrentPage] = useState(0);
  const [fontMeasurementVersion, setFontMeasurementVersion] = useState(0);

  const fontSize = fontSizeProp || 16;
  const fontFamily = useMemo(() => resolveLetterFontFamily(fontProp), [fontProp]);

  useEffect(() => {
    if (typeof document === 'undefined' || !('fonts' in document)) return;

    let cancelled = false;
    const fontCandidates = fontFamily
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);

    const ensureFontsReady = async () => {
      try {
        await document.fonts.ready;
        await Promise.all(
          fontCandidates.map((fontName) =>
            document.fonts.load(`${fontSize}px "${fontName}"`).catch(() => undefined)
          )
        );
      } finally {
        if (!cancelled) {
          setFontMeasurementVersion((prev) => prev + 1);
        }
      }
    };

    void ensureFontsReady();

    return () => {
      cancelled = true;
    };
  }, [fontFamily, fontSize]);

  // 페이지 분할
  const pages = useMemo(() => {
    if (typeof window === 'undefined' || !content) return [''];
    return splitLetterContentIntoPages(content, fontSize, fontFamily, stationeryStyle as any);
  }, [content, fontSize, fontFamily, stationeryStyle, fontMeasurementVersion]);

  // 페이지 수 변경 시 현재 페이지 조정
  useEffect(() => {
    if (currentPage >= pages.length) {
      setCurrentPage(Math.max(0, pages.length - 1));
    }
  }, [pages.length, currentPage]);

  // ResizeObserver로 컨테이너 크기에 맞춰 스케일 자동 계산
  useEffect(() => {
    const measureEl = containerRef.current;
    if (!measureEl) return;

    const updateScale = () => {
      const availableWidth = measureEl.offsetWidth;
      if (availableWidth <= 0) return;
      const scaleX = availableWidth / CANVAS_WIDTH;
      setScale(Math.min(scaleX, 1));
    };

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    resizeObserver.observe(measureEl);
    requestAnimationFrame(() => updateScale());

    return () => resizeObserver.disconnect();
  }, []);

  // 편지지 한 페이지 렌더링
  const renderLetterPage = (pageContent: string, pageIndex: number) => (
    (() => {
      const pageSide = getPageSide(pageIndex);
      const writingArea = resolveWritingArea(stationeryStyle as any, pageSide);
      const bottomPadding = CANVAS_HEIGHT - writingArea.top - writingArea.height;
      const pageLineColor = lineColorProp || getStationeryLineColor(stationeryStyle as any, pageSide);
      const { lineHeight, totalLines } = getLetterRenderingMetrics(fontSize, stationeryStyle as any, pageSide);

      return (
        <div
          className="relative bg-white"
          style={{
            width: CANVAS_WIDTH,
            minWidth: CANVAS_WIDTH,
            maxWidth: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            minHeight: CANVAS_HEIGHT,
            maxHeight: CANVAS_HEIGHT,
            flexShrink: 0,
            overflow: 'hidden',
            boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
            borderRadius: '2px',
          }}
        >
          {stationeryStyle && (
            <StationeryRenderer
              style={stationeryStyle as any}
              className="absolute inset-0"
              showCornerDecorations={true}
              side={pageSide}
            />
          )}
          {shouldRenderWritingLines(pageSide) && Array.from({ length: totalLines }, (_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: writingArea.top + (i + 1) * lineHeight - writingArea.lineOffset,
                left: writingArea.left,
                width: writingArea.width,
                borderBottom: `2px solid ${pageLineColor}`,
              }}
            />
          ))}
          <div
            className="text-gray-800"
            style={{
              position: 'absolute',
              top: writingArea.top,
              left: writingArea.left,
              width: writingArea.width,
              height: writingArea.height,
              fontFamily,
              fontSize: `${fontSize}px`,
              fontWeight: 'normal',
              lineHeight: `${lineHeight}px`,
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              overflow: 'hidden',
              boxSizing: 'border-box',
              zIndex: 10,
            }}
            dangerouslySetInnerHTML={{ __html: renderLetterContentHtml(pageContent) }}
          />
          {pages.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: bottomPadding / 2 - 10,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontSize: '14px',
                color: '#9ca3af',
                fontFamily: 'Pretendard, sans-serif',
                zIndex: 20,
              }}
            >
              - {pageIndex + 1} -
            </div>
          )}
        </div>
      );
    })()
  );

  return (
    <div className={cn('w-full', className)}>
      {/* 페이지 정보 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            <span className="text-primary font-bold">{pages.length}</span>장
          </span>
          <span className="text-xs text-muted-foreground">
            ({content.length.toLocaleString()}자)
          </span>
        </div>
        {/* 페이지 네비게이션 (모바일) */}
        {pages.length > 1 && (
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="p-1.5 rounded-full bg-white shadow-sm border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium min-w-[80px] text-center">
              {currentPage + 1} / {pages.length} 페이지
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
              disabled={currentPage === pages.length - 1}
              className="p-1.5 rounded-full bg-white shadow-sm border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 편지지 미리보기 영역 */}
      <div className="bg-muted/30 rounded-xl p-2 max-w-full">
        {/* 너비 측정용 */}
        <div ref={containerRef} className="w-full" />

        {/* PC: 모든 페이지 연속 스크롤 */}
        <div className="hidden md:flex flex-col items-center gap-8">
          {pages.map((pageContent, idx) => (
            <div
              key={idx}
              className="relative"
              style={{
                width: CANVAS_WIDTH * scale,
                height: CANVAS_HEIGHT * scale,
              }}
            >
              <div
                className="absolute top-0 left-0"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                }}
              >
                {renderLetterPage(pageContent, idx)}
              </div>
            </div>
          ))}
        </div>

        {/* 모바일: 단일 페이지 */}
        <div className="md:hidden flex justify-center items-start overflow-hidden">
          <div
            className="relative"
            style={{
              width: CANVAS_WIDTH * scale,
              height: CANVAS_HEIGHT * scale,
            }}
          >
            <div
              className="absolute top-0 left-0"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
              }}
            >
              {renderLetterPage(pages[currentPage] || '', currentPage)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
