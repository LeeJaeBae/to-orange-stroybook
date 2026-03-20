'use client';

import { useRef } from 'react';
import { LetterCanvas } from './LetterCanvas';
import type { Page, TextAlign } from '../types';
import type { Stationery } from '../../StationerySelector';
import type { PageSelectionRange } from '../hooks/useCrossPageSelection';

interface LetterPageStackProps {
  pages: Page[];
  currentPage: number;
  stationeryStyle?: Stationery | null;
  font: string;
  fontSize: number;
  textAlign: TextAlign;
  textColor: string;
  lineColorOverride?: string | null;
  scale: number;
  onPageClick: (pageIndex: number, cursorOffset?: number, clickPoint?: { x: number; y: number }) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  renderCurrentPageContent: () => React.ReactNode;
  allPagesSelected?: boolean;
  // 크로스 페이지 선택
  getPageSelectionRange?: (pageIndex: number) => PageSelectionRange | null;
  onTextDivRef?: (pageIndex: number, el: HTMLElement | null) => void;
  onCrossPagePointerDown?: (pageIndex: number, event: React.PointerEvent) => void;
  isCrossPageSelectionActive?: boolean;
}

export function LetterPageStack({
  pages,
  currentPage,
  stationeryStyle,
  font,
  fontSize,
  textAlign,
  textColor,
  lineColorOverride,
  scale,
  onPageClick,
  canvasRef,
  renderCurrentPageContent,
  allPagesSelected,
  getPageSelectionRange,
  onTextDivRef,
  onCrossPagePointerDown,
  isCrossPageSelectionActive,
}: LetterPageStackProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 레거시 편집기와 동일하게, 마지막 실제 페이지 뒤에는 항상 n+1 빈 페이지를 보여준다.
  const allPages = [...pages, { id: pages.length + 1, content: '', continuesFromPrevious: false }];

  return (
    <div ref={scrollContainerRef} className="flex flex-col items-center w-full pb-10" style={{ gap: 24 * scale }}>
      {allPages.map((page, pageIndex) => {
        const isCurrentPage = pageIndex === currentPage;
        return (
          <LetterCanvas
            key={page.id}
            pageIndex={pageIndex}
            pageContent={page.content}
            isCurrentPage={isCurrentPage}
            totalPages={pages.length}
            stationeryStyle={stationeryStyle}
            font={font}
            fontSize={fontSize}
            textAlign={textAlign}
            textColor={textColor}
            lineColorOverride={lineColorOverride}
            scale={scale}
            canvasRef={isCurrentPage ? canvasRef : undefined}
            allPagesSelected={allPagesSelected}
            onPageClick={(cursorOffset, clickPoint) => {
              if (!isCurrentPage) onPageClick(pageIndex, cursorOffset, clickPoint);
            }}
            selectionRange={getPageSelectionRange?.(pageIndex)}
            onTextDivRef={onTextDivRef}
            onCrossPagePointerDown={onCrossPagePointerDown}
            isCrossPageSelectionActive={isCrossPageSelectionActive}
          >
            {isCurrentPage ? renderCurrentPageContent() : null}
          </LetterCanvas>
        );
      })}
    </div>
  );
}
