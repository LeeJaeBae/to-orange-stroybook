'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { cn } from '@/lib/utils';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FONT_FAMILIES, getPageSide, resolveWritingArea } from '../constants';
import { LetterRuledLines } from './LetterRuledLines';
import { StationeryRenderer } from '../../StationeryRenderer';
import type { Stationery } from '../../StationerySelector';
import type { TextAlign } from '../types';
import type { PageSelectionRange } from '../hooks/useCrossPageSelection';
import { getLineHeight, getStationeryLineColor, getTotalLines } from '../utils';

interface LetterCanvasProps {
  pageIndex: number;
  pageContent: string;
  isCurrentPage: boolean;
  totalPages: number;
  stationeryStyle?: Stationery | null;
  font: string;
  fontSize: number;
  textAlign: TextAlign;
  textColor: string;
  lineColorOverride?: string | null;
  scale: number;
  canvasRef?: React.Ref<HTMLDivElement>;
  onPageClick: (cursorOffset?: number, clickPoint?: { x: number; y: number }) => void;
  allPagesSelected?: boolean;
  children?: React.ReactNode; // 현재 페이지의 에디터 + 오버레이
  // 크로스 페이지 선택
  selectionRange?: PageSelectionRange | null;
  onTextDivRef?: (pageIndex: number, el: HTMLElement | null) => void;
  onCrossPagePointerDown?: (pageIndex: number, event: React.PointerEvent) => void;
  isCrossPageSelectionActive?: boolean;
}

/**
 * 텍스트 노드 내 특정 오프셋 범위에 Range를 생성합니다.
 * TreeWalker로 텍스트 노드를 순회하며 start/end를 설정합니다.
 */
function createRangeFromOffsets(
  container: HTMLElement,
  startOffset: number,
  endOffset: number
): Range | null {
  const range = document.createRange();
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

  let accumulated = 0;
  let startSet = false;
  let current = walker.nextNode();

  while (current) {
    const nodeLen = (current.textContent || '').length;

    if (!startSet && accumulated + nodeLen >= startOffset) {
      range.setStart(current, Math.min(startOffset - accumulated, nodeLen));
      startSet = true;
    }

    if (startSet && accumulated + nodeLen >= endOffset) {
      range.setEnd(current, Math.min(endOffset - accumulated, nodeLen));
      return range;
    }

    accumulated += nodeLen;
    current = walker.nextNode();
  }

  // 끝까지 도달 — 마지막 노드의 끝까지
  if (startSet) {
    const lastText = container.lastChild;
    if (lastText) {
      range.setEndAfter(lastText);
    }
    return range;
  }

  return null;
}

/**
 * Tiptap 에디터(ProseMirror) DOM에서 텍스트 오프셋 기반 Range를 생성합니다.
 * <p> 태그 간 경계를 \n 구분자(1문자)로 취급하여 plain text 오프셋과 일치시킵니다.
 */
function createRangeFromParagraphOffsets(
  container: HTMLElement,
  startOffset: number,
  endOffset: number
): Range | null {
  const range = document.createRange();
  const paragraphs = container.children;
  let accumulated = 0;
  let startSet = false;

  for (let pi = 0; pi < paragraphs.length; pi++) {
    // 단락 경계 구분자 (\n) — 첫 단락 제외
    if (pi > 0) {
      if (!startSet && accumulated >= startOffset) {
        // \n 구분자 영역 내에 시작점이 있으면 다음 단락의 시작으로 설정
        const firstChild = paragraphs[pi].firstChild;
        if (firstChild) range.setStart(firstChild, 0);
        else range.setStartBefore(paragraphs[pi]);
        startSet = true;
      }
      accumulated += 1; // \n
    }

    const para = paragraphs[pi] as HTMLElement;
    const walker = document.createTreeWalker(para, NodeFilter.SHOW_TEXT);
    let textNode = walker.nextNode();

    // 빈 단락(<p><br></p>)은 텍스트 노드가 없음 — 건너뜀
    if (!textNode) {
      if (!startSet && accumulated >= startOffset) {
        const brNode = para.querySelector('br') || para;
        range.setStartBefore(brNode);
        startSet = true;
      }
      if (startSet && accumulated >= endOffset) {
        const brNode = para.querySelector('br') || para;
        range.setEndBefore(brNode);
        return range;
      }
      continue;
    }

    while (textNode) {
      const nodeLen = (textNode.textContent || '').length;

      if (!startSet && accumulated + nodeLen >= startOffset) {
        range.setStart(textNode, Math.min(startOffset - accumulated, nodeLen));
        startSet = true;
      }

      if (startSet && accumulated + nodeLen >= endOffset) {
        range.setEnd(textNode, Math.min(endOffset - accumulated, nodeLen));
        return range;
      }

      accumulated += nodeLen;
      textNode = walker.nextNode();
    }
  }

  if (startSet) {
    const lastChild = container.lastChild;
    if (lastChild) range.setEndAfter(lastChild);
    return range;
  }

  return null;
}

function getTextOffsetFromPoint(
  container: HTMLElement,
  clientX: number,
  clientY: number
): number | null {
  let node: Node | null = null;
  let offset = 0;

  if (typeof document.caretPositionFromPoint === 'function') {
    const caret = document.caretPositionFromPoint(clientX, clientY);
    if (caret) {
      node = caret.offsetNode;
      offset = caret.offset;
    }
  } else if (typeof document.caretRangeFromPoint === 'function') {
    const range = document.caretRangeFromPoint(clientX, clientY);
    if (range) {
      node = range.startContainer;
      offset = range.startOffset;
    }
  }

  if (!node || !container.contains(node)) {
    return null;
  }

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let accumulated = 0;
  let current = walker.nextNode();

  while (current) {
    const textLength = current.textContent?.length ?? 0;

    if (current === node) {
      return accumulated + Math.min(Math.max(offset, 0), textLength);
    }

    accumulated += textLength;
    current = walker.nextNode();
  }

  return accumulated;
}

export function LetterCanvas({
  pageIndex,
  pageContent,
  isCurrentPage,
  totalPages,
  stationeryStyle,
  font,
  fontSize,
  textAlign,
  textColor,
  lineColorOverride,
  scale,
  canvasRef,
  onPageClick,
  allPagesSelected,
  children,
  selectionRange,
  onTextDivRef,
  onCrossPagePointerDown,
  isCrossPageSelectionActive,
}: LetterCanvasProps) {
  const pageSide = getPageSide(pageIndex);
  const writingArea = resolveWritingArea(stationeryStyle, pageSide);
  const lineHeight = getLineHeight(fontSize, stationeryStyle, pageSide);
  const totalLines = getTotalLines(lineHeight, stationeryStyle, pageSide);
  const lineColor = lineColorOverride || getStationeryLineColor(stationeryStyle, pageSide);
  const bottomPadding = CANVAS_HEIGHT - writingArea.top - writingArea.height;
  // 클릭 vs 드래그 구분
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const textDivRef = useRef<HTMLDivElement>(null);
  const canvasInnerRef = useRef<HTMLDivElement>(null);
  const [highlightRects, setHighlightRects] = useState<
    Array<{ top: number; left: number; width: number; height: number }>
  >([]);

  // 텍스트 div ref를 부모에 전달
  const setTextRef = useCallback(
    (el: HTMLDivElement | null) => {
      textDivRef.current = el;
      onTextDivRef?.(pageIndex, el);
    },
    [pageIndex, onTextDivRef]
  );

  // selectionRange 값 추출 (참조 안정성을 위해)
  const selStart = selectionRange?.start ?? -1;
  const selEnd = selectionRange?.end ?? -1;
  const hasSelection = selStart >= 0 && selEnd >= 0 && selStart !== selEnd;

  // 선택 하이라이트 계산 (현재 페이지 + 비활성 페이지 모두)
  useEffect(() => {
    if (!hasSelection) {
      setHighlightRects([]);
      return;
    }

    // 컨테이너 결정: 비활성 페이지는 textDivRef, 현재 페이지는 에디터 DOM(.tiptap)
    let container: HTMLElement | null = null;
    if (isCurrentPage) {
      container = canvasInnerRef.current?.querySelector('.tiptap') as HTMLElement | null;
    } else {
      container = textDivRef.current;
    }

    if (!container) {
      setHighlightRects([]);
      return;
    }

    // 활성 페이지(Tiptap)는 <p> 단락 경계를 \n으로 취급하는 별도 함수 사용
    const range = isCurrentPage
      ? createRangeFromParagraphOffsets(container, selStart, selEnd)
      : createRangeFromOffsets(container, selStart, selEnd);
    if (!range) {
      setHighlightRects([]);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const rects = range.getClientRects();
    const result: Array<{ top: number; left: number; width: number; height: number }> = [];
    const s = scale || 1;

    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (r.width < 1 && r.height < 1) continue;
      // getClientRects()는 뷰포트(스케일 적용 후) 좌표 반환
      // 하이라이트 div는 스케일 변환 전 좌표계에 위치하므로 /scale 필요
      result.push({
        top: (r.top - containerRect.top) / s,
        left: (r.left - containerRect.left) / s,
        width: r.width / s,
        height: r.height / s,
      });
    }

    setHighlightRects(result);
  }, [selStart, selEnd, hasSelection, pageContent, isCurrentPage, scale]);

  return (
    <div
      data-page-index={pageIndex}
      className="relative"
      style={{
        width: CANVAS_WIDTH * scale,
        height: CANVAS_HEIGHT * scale,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
        }}
      >
        <div
          ref={(el) => {
            canvasInnerRef.current = el;
            if (typeof canvasRef === 'function') canvasRef(el);
            else if (canvasRef && 'current' in canvasRef) (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }}
          className={cn(
            'relative bg-white cursor-pointer transition-all',
            isCurrentPage ? 'ring-2 ring-orange-400 ring-offset-2' : 'hover:ring-1 hover:ring-neutral-300'
          )}
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
          onPointerDown={(e) => {
            // 기존 선택 상태가 있을 때 다른 페이지 우클릭으로 포커스가 이동하면
            // 브라우저가 네이티브 선택을 풀어버릴 수 있다.
            // 보조 버튼 우클릭은 커스텀 컨텍스트 메뉴만 띄우고 기존 선택은 유지한다.
            if (e.button === 2 && (isCrossPageSelectionActive || allPagesSelected)) {
              e.preventDefault();
              return;
            }
            mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
            onCrossPagePointerDown?.(pageIndex, e);
          }}
          onPointerUp={(e) => {
            // 드래그(텍스트 선택) 시에는 페이지 전환하지 않음
            if (mouseDownPosRef.current) {
              const dx = Math.abs(e.clientX - mouseDownPosRef.current.x);
              const dy = Math.abs(e.clientY - mouseDownPosRef.current.y);
              mouseDownPosRef.current = null;
              if (dx > 5 || dy > 5) return;
            }
            // 크로스 페이지 선택 활성화 중 클릭 → 선택 해제만 (페이지 전환 안 함)
            if (isCrossPageSelectionActive) return;
            if (isCurrentPage) return;
            const clickedOffset = !isCurrentPage && textDivRef.current
              ? getTextOffsetFromPoint(textDivRef.current, e.clientX, e.clientY)
              : null;
            e.preventDefault();
            flushSync(() => {
              onPageClick(clickedOffset ?? undefined, { x: e.clientX, y: e.clientY });
            });
          }}
        >
          {/* 편지지 배경 */}
          {stationeryStyle && (
            <StationeryRenderer
              style={stationeryStyle}
              className="absolute inset-0"
              showCornerDecorations={true}
              side={pageSide}
            />
          )}

          {/* 편지지 줄 */}
          <LetterRuledLines
            pageIndex={pageIndex}
            fontSize={fontSize}
            lineColor={lineColor}
            stationeryStyle={stationeryStyle}
          />

          {/* 현재 페이지: Tiptap 에디터 + 오버레이 */}
          {isCurrentPage ? (
            <>
              {children}
              {/* 현재 페이지가 크로스 페이지 선택에 포함된 경우 문자 단위 하이라이트 */}
              {highlightRects.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    pointerEvents: 'none',
                    zIndex: 25,
                  }}
                >
                  {highlightRects.map((rect, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                        backgroundColor: 'rgba(59, 130, 246, 0.3)',
                        borderRadius: '1px',
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* 다른 페이지: 읽기 전용 */
            <>
              <div
                ref={setTextRef}
                className={cn(FONT_FAMILIES[font]?.className || 'font-pretendard')}
                style={{
                  position: 'absolute',
                  top: writingArea.top,
                  left: writingArea.left,
                  width: writingArea.width,
                  height: writingArea.height,
                  fontSize: `${fontSize}px`,
                  lineHeight: `${lineHeight}px`,
                  textAlign,
                  color: textColor,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  userSelect: isCrossPageSelectionActive ? 'none' : 'text',
                  cursor: 'text',
                  touchAction: isCrossPageSelectionActive ? 'none' : 'auto',
                  zIndex: 10,
                }}
              >
                {pageContent}
              </div>
              {/* 크로스 페이지 선택 하이라이트 (정밀 문자 단위) */}
              {highlightRects.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    pointerEvents: 'none',
                    zIndex: 15,
                  }}
                >
                  {highlightRects.map((rect, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                        backgroundColor: 'rgba(59, 130, 246, 0.3)',
                        borderRadius: '1px',
                      }}
                    />
                  ))}
                </div>
              )}
              {/* Ctrl+A 전체 선택 시 파란 오버레이 */}
              {allPagesSelected && pageContent.trim() && (
                <div
                  style={{
                    position: 'absolute',
                    top: writingArea.top,
                    left: writingArea.left,
                    width: writingArea.width,
                    height: writingArea.height,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    zIndex: 15,
                    pointerEvents: 'none',
                    borderRadius: '2px',
                  }}
                />
              )}
            </>
          )}

          {/* 페이지 번호 */}
          {totalPages >= 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: bottomPadding / 2 - 10 - 16,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontSize: '14px',
                color: '#9ca3af',
                fontFamily: 'Pretendard, sans-serif',
                zIndex: 20,
                pointerEvents: 'none',
              }}
            >
              - {pageIndex + 1} -
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
