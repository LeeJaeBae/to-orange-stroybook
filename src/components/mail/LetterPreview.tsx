import { Eye, User, Send, ZoomIn, ZoomOut, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { StationeryRenderer } from "./StationeryRenderer";
import { formatRecipientDisplay } from "@/lib/formatRecipient";
import { getPageSide, resolveWritingArea, shouldRenderWritingLines } from "./letter-editor/constants";
import { getStationeryLineColor } from "./letter-editor/utils";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  getLetterRenderingMetrics,
  renderLetterContentHtml,
  resolveLetterFontFamily,
  splitLetterContentIntoPages,
} from "./letter-rendering";

interface Stationery {
  id: string;
  name: string;
  bgColor?: string;
  bgGradient?: string;
  pattern?: "lines" | "dots" | "grid" | "none" | "waves" | "hearts" | "stars" | "flowers" | "leaves" | "clouds" | "confetti";
  patternColor?: string;
  patternOpacity?: number;
  texture?: "none" | "paper" | "watercolor" | "linen" | "canvas" | "parchment";
  border?: {
    style: "none" | "solid" | "dashed" | "dotted" | "double";
    color: string;
    width: "thin" | "medium" | "thick";
  };
  cornerDecoration?: {
    type: "none" | "flower" | "ribbon" | "heart" | "star" | "leaf" | "vine";
    color: string;
  };
  // AI 생성 커스텀 SVG 디자인
  customSvg?: {
    background?: string;
    pattern?: string;
    corners?: string;
    border?: string;
  };
  // AI 생성 이미지 배경 (Nano Banana)
  backgroundImage?: string;
  frontImage?: string;
  backImage?: string;
  writingArea?: {
    left: number;
    top: number;
    width: number;
    height: number;
    lineCount: number;
    lineOffset?: number;
    lineColor?: string;
  };
  backWritingArea?: {
    left: number;
    top: number;
    width: number;
    height: number;
    lineCount: number;
    lineOffset?: number;
    lineColor?: string;
  };
  // AI 편지지용 오버레이 패턴
  overlayPattern?: "none" | "lines" | "grid";
}

const stationeryStyles: Record<string, Stationery> = {
  white: { id: "white", name: "순백", bgColor: "bg-white", pattern: "none" },
  cream: { id: "cream", name: "크림", bgColor: "bg-amber-50", pattern: "none" },
  lined: { id: "lined", name: "줄노트", bgColor: "bg-amber-50", pattern: "lines" },
  sky: { id: "sky", name: "하늘색", bgColor: "bg-sky-100" },
  pink: { id: "pink", name: "연분홍", bgColor: "bg-pink-100" },
  mint: { id: "mint", name: "민트", bgColor: "bg-emerald-100" },
  "formal-white": { id: "formal-white", name: "정장 화이트", bgColor: "bg-slate-50", pattern: "none" },
  "formal-cream": { id: "formal-cream", name: "클래식 크림", bgColor: "bg-orange-50", pattern: "none" },
  business: { id: "business", name: "비즈니스", bgColor: "bg-gray-100", pattern: "grid" },
  elegant: { id: "elegant", name: "엘레강스", bgGradient: "bg-gradient-to-br from-rose-50 to-purple-50", pattern: "none" },
  sunset: { id: "sunset", name: "선셋", bgGradient: "bg-gradient-to-br from-orange-200 via-rose-200 to-purple-200" },
  ocean: { id: "ocean", name: "오션", bgGradient: "bg-gradient-to-br from-cyan-200 via-blue-200 to-indigo-200" },
  forest: { id: "forest", name: "포레스트", bgGradient: "bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200" },
  blossom: { id: "blossom", name: "블라썸", bgGradient: "bg-gradient-to-br from-pink-200 via-rose-200 to-red-200" },
  "ai-dream": { id: "ai-dream", name: "드림스케이프", bgGradient: "bg-gradient-to-br from-violet-300 via-purple-200 to-pink-200" },
  "ai-aurora": { id: "ai-aurora", name: "오로라", bgGradient: "bg-gradient-to-br from-green-200 via-cyan-200 to-blue-300" },
  "ai-cosmic": { id: "ai-cosmic", name: "코스믹", bgGradient: "bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300" },
};

type TextAlign = "left" | "center" | "right";

interface LetterPreviewProps {
  content: string;
  // 에디터가 분할한 페이지 배열 (있으면 재분할 없이 그대로 사용)
  preSplitPages?: string[];
  stationeryId: string | null;
  customStationeryStyle?: Stationery | null; // AI 생성 편지지용
  recipientName?: string;
  recipientFacility?: string;
  recipientPrisonerNumber?: string;
  senderName?: string;
  senderAddress?: string;
  // 텍스트 스타일 props
  font?: string;
  fontSize?: number;
  isBold?: boolean;
  textAlign?: TextAlign;
  lineColor?: string | null;
  // 페이지 상태 (부모에서 관리)
  currentPage?: number;
  onCurrentPageChange?: (page: number) => void;
  // 스텝 네비게이션
  onStepPrev?: () => void;
  onStepNext?: () => void;
  canStepNext?: boolean;
  nextButtonLabel?: string;
}

export function LetterPreview({
  content,
  preSplitPages,
  stationeryId,
  customStationeryStyle,
  recipientName,
  recipientFacility,
  recipientPrisonerNumber,
  senderName,
  font = "pretendard",
  fontSize = 13,
  isBold = false,
  textAlign = "left",
  lineColor: lineColorProp,
  currentPage: externalCurrentPage,
  onCurrentPageChange,
  onStepPrev,
  onStepNext,
  canStepNext = true,
  nextButtonLabel = '다음',
}: LetterPreviewProps) {
  // AI 생성 편지지 우선, 없으면 기본 스타일 사용
  const stationery = customStationeryStyle || (stationeryId ? stationeryStyles[stationeryId] : stationeryStyles.white);

  const [zoom, setZoom] = useState(100);
  const [autoFitDone, setAutoFitDone] = useState(false);
  // 기존 페이지 구분자 제거하여 깨끗한 내용 표시
  const cleanContent = (text: string) => text.replace(/\n\n--- 페이지 구분 ---\n\n/g, '\n\n');
  const displayContent = useMemo(() => cleanContent(content), [content]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [fontMeasurementVersion, setFontMeasurementVersion] = useState(0);

  // 고정 스케일 (기존 120% 기준을 100%로 재설정: 0.85 * 1.2 = 1.02)
  const scale = 1.02;

  // 모바일: 컨테이너 너비에 맞게 자동 줌 계산
  useEffect(() => {
    if (!containerRef.current || autoFitDone) return;

    const container = containerRef.current;
    const style = getComputedStyle(container);
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const availableWidth = container.clientWidth - paddingX;
    const fitZoom = Math.floor((availableWidth / (CANVAS_WIDTH * scale)) * 100);

    if (fitZoom < 100) {
      setZoom(Math.max(30, fitZoom));
    }
    setAutoFitDone(true);
  }, [autoFitDone]);

  // 폰트 패밀리 계산
  const fontFamily = resolveLetterFontFamily(font);

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

  // 페이지 분할: 에디터에서 이미 분할한 페이지가 있으면 그대로 사용 (재분할 시 문단 구조 변경 방지)
  const pages = useMemo(() => {
    if (preSplitPages && preSplitPages.length > 0) return preSplitPages;
    if (typeof window === 'undefined') return [displayContent];
    return splitLetterContentIntoPages(displayContent, fontSize, fontFamily, stationery);
  }, [preSplitPages, displayContent, fontSize, fontFamily, stationery, fontMeasurementVersion]);

  // 현재 보고 있는 페이지 (외부 제어 또는 내부 상태)
  const [internalCurrentPage, setInternalCurrentPage] = useState(0);
  const currentPage = externalCurrentPage ?? internalCurrentPage;
  const setCurrentPage = (page: number | ((prev: number) => number)) => {
    const newPage = typeof page === 'function' ? page(currentPage) : page;
    if (onCurrentPageChange) {
      onCurrentPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
    }
  };

  // 페이지 수가 바뀌면 현재 페이지 조정
  useEffect(() => {
    if (currentPage >= pages.length) {
      const nextPage = Math.max(0, pages.length - 1);
      const frame = window.requestAnimationFrame(() => {
        setCurrentPage(nextPage);
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [pages.length, currentPage]);

  // 페이지 정보
  const pageInfo = useMemo(() => ({
    pages: pages.length,
    chars: displayContent.length,
  }), [pages.length, displayContent.length]);

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground text-lg">편지 미리보기</h2>
        </div>

        {/* 페이지 수 표시 */}
        
      </div>

      {/* 흰색 라운딩 박스 - 메인 컨테이너 */}
      <div className="bg-card rounded-3xl p-3 sm:p-6 shadow-lg border border-border/50 space-y-3 sm:space-y-6">
        {/* 받는 사람/보내는 사람 + 줌 컨트롤 */}
        <div className="flex items-center justify-between gap-2">
          {/* 받는/보내는 사람 간략 표시 (모바일) */}
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <div className="flex items-center gap-1.5 min-w-0">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground truncate">
                {recipientName ? (
                  <span className="font-medium text-foreground">{formatRecipientDisplay(recipientName, recipientFacility, recipientPrisonerNumber)}</span>
                ) : "수신자 미선택"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground truncate">
                {senderName ? (
                  <span className="font-medium text-foreground">{senderName}</span>
                ) : "발신자 미선택"}
              </span>
            </div>
          </div>

          {/* 줌 컨트롤 */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 sm:p-1 shrink-0">
            <button
              onClick={() => setZoom(Math.max(30, zoom - 10))}
              className="p-1.5 sm:p-2 hover:bg-card rounded-md transition-colors"
              disabled={zoom <= 30}
            >
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            </button>
            <span className="px-1 sm:px-2 text-xs sm:text-sm font-medium text-foreground min-w-[36px] sm:min-w-[50px] text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="p-1.5 sm:p-2 hover:bg-card rounded-md transition-colors"
              disabled={zoom >= 200}
            >
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* 편지지 미리보기 영역 */}
        <div className="rounded-2xl border border-border overflow-hidden relative">
          {/* LetterEditor와 동일한 편지지 영역 */}
          <div ref={containerRef} className="flex-1 flex flex-col items-center justify-start p-2 sm:p-6 overflow-auto relative">
            {/* 페이지 네비게이션 (여러 페이지일 때) */}
            {pages.length > 1 && (
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-full bg-white shadow-sm border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium">
                  {currentPage + 1} / {pages.length} 페이지
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
                  disabled={currentPage === pages.length - 1}
                  className="p-2 rounded-full bg-white shadow-sm border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 편지지 + 스케일 래퍼 */}
            <div
              className="relative"
              style={{
                width: CANVAS_WIDTH * scale * (zoom / 100),
                height: CANVAS_HEIGHT * scale * (zoom / 100),
              }}
            >
              <div
                className="absolute top-0 left-0"
                style={{
                  transform: `scale(${scale * (zoom / 100)})`,
                  transformOrigin: 'top left',
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                }}
              >
                {/* 편지지 */}
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
                    borderRadius: '2px',
                  }}
                >
                  {(() => {
                    const pageSide = getPageSide(currentPage);
                    const pageWritingArea = resolveWritingArea(stationery, pageSide);
                    const pageBottomPadding = CANVAS_HEIGHT - pageWritingArea.top - pageWritingArea.height;
                    const pageLineColor = lineColorProp || getStationeryLineColor(stationery, pageSide);
                    const { lineHeight: pageLineHeight, totalLines: pageTotalLines } = getLetterRenderingMetrics(fontSize, stationery, pageSide);

                    return (
                      <>
                  {/* 편지지 배경 */}
                  {stationery && (
                    <StationeryRenderer
                      style={{
                        bgColor: stationery.bgColor,
                        bgGradient: stationery.bgGradient,
                        pattern: stationery.pattern,
                        patternColor: stationery.patternColor,
                        patternOpacity: stationery.patternOpacity,
                        texture: stationery.texture,
                        border: stationery.border,
                        cornerDecoration: stationery.cornerDecoration,
                        customSvg: stationery.customSvg,
                        backgroundImage: stationery.backgroundImage,
                        frontImage: stationery.frontImage,
                        backImage: stationery.backImage,
                      }}
                      className="absolute inset-0"
                      showCornerDecorations={true}
                      side={currentPage % 2 === 1 ? 'back' : 'front'}
                    />
                  )}

                  {/* 편지지 줄 (항상 표시) */}
                  {shouldRenderWritingLines(pageSide) && Array.from({ length: pageTotalLines }, (_, i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        top: pageWritingArea.top + (i + 1) * pageLineHeight - pageWritingArea.lineOffset,
                        left: pageWritingArea.left,
                        width: pageWritingArea.width,
                        borderBottom: `2px solid ${pageLineColor}`,
                      }}
                    />
                  ))}

                  {/* 텍스트 영역 - 현재 페이지 내용만 표시 */}
                  <div
                    className="text-gray-800"
                    style={{
                      position: 'absolute',
                      top: pageWritingArea.top,
                      left: pageWritingArea.left,
                      width: pageWritingArea.width,
                      height: pageWritingArea.height,
                      fontFamily,
                      fontSize: `${fontSize}px`,
                      fontWeight: isBold ? 'bold' : 'normal',
                      lineHeight: `${pageLineHeight}px`,
                      textAlign,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                      zIndex: 10,
                    }}
                    dangerouslySetInnerHTML={{ __html: renderLetterContentHtml(pages[currentPage] || '') }}
                  />

                  {/* 페이지 번호 (편지지 하단 중앙) */}
                  {pages.length > 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: pageBottomPadding / 2 - 10,
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#9ca3af',
                        fontFamily: 'Pretendard, sans-serif',
                        zIndex: 20,
                      }}
                    >
                      - {currentPage + 1} -
                    </div>
                  )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 안내 메시지 */}
        <p className="text-size-10 sm:text-xs text-muted-foreground text-center">
          실제 인쇄될 편지의 미리보기입니다. 수정은 편지 작성 화면에서 해주세요.
        </p>
      </div>

      {/* 스텝 이전/다음 버튼 (하단 고정, 편지지 너비) */}
      {(onStepPrev || onStepNext) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-white border-t border-neutral-200">
          <div className="flex items-center justify-between w-full px-4 py-3" style={{ maxWidth: scale ? CANVAS_WIDTH * scale + 32 : 804 }}>
            <button
              onClick={onStepPrev}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>
            <button
              onClick={onStepNext}
              disabled={!canStepNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {nextButtonLabel}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
