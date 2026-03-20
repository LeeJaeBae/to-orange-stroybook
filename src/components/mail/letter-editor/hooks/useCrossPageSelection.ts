import { useState, useRef, useCallback, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import type { Page } from '../types';
import { getDocTextOffsetAtPos } from '../utils';

/** 선택 지점: 특정 페이지의 텍스트 오프셋 */
export interface SelectionPoint {
  page: number;
  offset: number;
}

/** 크로스 페이지 선택 범위 */
export interface CrossPageSelection {
  anchor: SelectionPoint;
  focus: SelectionPoint;
}

/** 특정 페이지 내의 선택 범위 (텍스트 오프셋 기준) */
export interface PageSelectionRange {
  start: number;
  end: number;
}

interface UseCrossPageSelectionOptions {
  pages: Page[];
  currentPage: number;
  editor: Editor | null;
  scale: number | null;
}

function getPageSeparatorLength(pages: Page[], pageIndex: number): number {
  if (pageIndex <= 0 || pageIndex >= pages.length) return 0;
  return pages[pageIndex].continuesFromPrevious ? 0 : 1;
}

function serializePages(pages: Page[]): string {
  if (pages.length === 0) return '';

  return pages.reduce((result, page, index) => {
    if (index === 0) return page.content;
    return result + (page.continuesFromPrevious ? '' : '\n') + page.content;
  }, '');
}

function normalizeSelectionPoints(selection: CrossPageSelection): {
  startPoint: SelectionPoint;
  endPoint: SelectionPoint;
} {
  const { anchor, focus } = selection;

  if (
    anchor.page < focus.page ||
    (anchor.page === focus.page && anchor.offset <= focus.offset)
  ) {
    return { startPoint: anchor, endPoint: focus };
  }

  return { startPoint: focus, endPoint: anchor };
}

function getGlobalOffset(pages: Page[], point: SelectionPoint): number {
  if (pages.length === 0) return 0;

  const safePageIndex = Math.min(Math.max(point.page, 0), pages.length - 1);
  let total = 0;

  for (let i = 0; i < safePageIndex; i++) {
    total += pages[i].content.length + getPageSeparatorLength(pages, i + 1);
  }

  const pageLength = pages[safePageIndex]?.content.length ?? 0;
  return total + Math.min(Math.max(point.offset, 0), pageLength);
}

/**
 * 마우스 좌표에서 텍스트 노드 내 오프셋을 계산합니다.
 * caretRangeFromPoint(비표준이지만 Chrome/Edge/Safari 지원) 또는
 * caretPositionFromPoint(Firefox) 사용.
 */
function getTextOffsetFromPoint(x: number, y: number, container: HTMLElement): number {
  // caretRangeFromPoint (Chrome, Edge, Safari)
  if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(x, y);
    if (range && container.contains(range.startContainer)) {
      return getAbsoluteOffset(container, range.startContainer, range.startOffset);
    }
  }

  // caretPositionFromPoint (Firefox)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = document as any;
  if (doc.caretPositionFromPoint) {
    const pos = doc.caretPositionFromPoint(x, y);
    if (pos && pos.offsetNode && container.contains(pos.offsetNode)) {
      return getAbsoluteOffset(container, pos.offsetNode, pos.offset);
    }
  }

  // 폴백: 컨테이너 텍스트 길이의 끝 반환
  return getFullTextLength(container);
}

/**
 * 컨테이너 내 특정 노드/오프셋의 절대 텍스트 오프셋을 계산합니다.
 * TreeWalker로 텍스트 노드를 순회하며 누적합니다.
 */
function getAbsoluteOffset(container: HTMLElement, node: Node, offset: number): number {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let accumulated = 0;

  let current = walker.nextNode();
  while (current) {
    if (current === node) {
      return accumulated + offset;
    }
    accumulated += (current.textContent || '').length;
    current = walker.nextNode();
  }

  // 노드를 못 찾으면 전체 길이 반환
  return accumulated;
}

/** 컨테이너 내 전체 텍스트 길이 */
function getFullTextLength(container: HTMLElement): number {
  return (container.textContent || '').length;
}

export function useCrossPageSelection({
  pages,
  currentPage,
  editor,
  scale,
}: UseCrossPageSelectionOptions) {
  const [selection, setSelection] = useState<CrossPageSelection | null>(null);
  const selectionRef = useRef<CrossPageSelection | null>(null);
  const isDraggingRef = useRef(false);
  const anchorRef = useRef<SelectionPoint | null>(null);
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);
  // 페이지별 텍스트 div refs (비활성 페이지의 읽기전용 텍스트 div)
  const pageTextRefsMap = useRef<Map<number, HTMLElement>>(new Map());

  /** 페이지 텍스트 div ref 등록 콜백 */
  const setPageTextRef = useCallback((pageIndex: number, el: HTMLElement | null) => {
    if (el) {
      pageTextRefsMap.current.set(pageIndex, el);
    } else {
      pageTextRefsMap.current.delete(pageIndex);
    }
  }, []);

  /**
   * 마우스 좌표가 어떤 페이지 위에 있는지 판별합니다.
   * data-page-index 속성을 가진 모든 요소를 확인합니다.
   */
  const getPageAtPoint = useCallback((clientX: number, clientY: number): number | null => {
    const pageElements = document.querySelectorAll<HTMLElement>('[data-page-index]');
    for (const el of pageElements) {
      const rect = el.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom && clientX >= rect.left && clientX <= rect.right) {
        return parseInt(el.getAttribute('data-page-index') || '-1', 10);
      }
    }
    // 페이지 밖인 경우 — Y좌표 기준으로 가장 가까운 페이지를 찾음
    let closest: { page: number; dist: number } | null = null;
    for (const el of pageElements) {
      const rect = el.getBoundingClientRect();
      const pageIdx = parseInt(el.getAttribute('data-page-index') || '-1', 10);
      const dist = clientY < rect.top ? rect.top - clientY : clientY - rect.bottom;
      if (closest === null || dist < closest.dist) {
        closest = { page: pageIdx, dist };
      }
    }
    return closest?.page ?? null;
  }, []);

  /**
   * 특정 페이지에서의 마우스 좌표 → 텍스트 오프셋 변환.
   */
  const getOffsetAtPoint = useCallback(
    (pageIndex: number, clientX: number, clientY: number): number => {
      // 비활성 페이지 → 읽기전용 텍스트 div에서 caretRangeFromPoint
      const textDiv = pageTextRefsMap.current.get(pageIndex);
      if (textDiv) {
        return getTextOffsetFromPoint(clientX, clientY, textDiv);
      }

      // 현재 페이지(Tiptap 에디터) → editor.view.posAtCoords
      if (pageIndex === currentPage && editor && !editor.isDestroyed) {
        try {
          const pos = editor.view.posAtCoords({ left: clientX, top: clientY });
          if (pos) {
            // ProseMirror pos를 텍스트 오프셋으로 변환
            return getDocTextOffsetAtPos(editor.state.doc, pos.pos);
          }
        } catch {
          // fallback
        }
        // 에디터 DOM에서 직접 계산
        const editorDom = editor.view.dom as HTMLElement;
        return getTextOffsetFromPoint(clientX, clientY, editorDom);
      }

      return 0;
    },
    [currentPage, editor]
  );

  /** selection state + ref 동시 업데이트 */
  const updateSelection = useCallback((sel: CrossPageSelection | null) => {
    selectionRef.current = sel;
    setSelection(sel);
  }, []);

  // 모바일 여부 (threshold 분기용)
  const isTouchDeviceRef = useRef(false);

  /** 드래그 시작 (Pointer Events로 마우스+터치 통합) */
  const handlePointerDown = useCallback(
    (pageIndex: number, event: React.PointerEvent) => {
      // 왼쪽 클릭(마우스) 또는 터치만 처리
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      // AI 플로팅 버튼 등 오버레이 UI에서 시작된 이벤트 무시
      const target = event.target as HTMLElement;
      if (target.closest('.floating-ai-btn, [role="dialog"], .ai-overlay')) return;

      isTouchDeviceRef.current = event.pointerType === 'touch';

      // 기존 크로스 페이지 선택 해제
      if (selectionRef.current) {
        updateSelection(null);
      }

      mouseDownPosRef.current = { x: event.clientX, y: event.clientY };
      const offset = getOffsetAtPoint(pageIndex, event.clientX, event.clientY);
      anchorRef.current = { page: pageIndex, offset };
      isDraggingRef.current = true;

      // 현재 페이지(에디터)에서는 네이티브 선택 허용
      if (pageIndex === currentPage) return;

      // 비활성 페이지: 브라우저 네이티브 선택 방지 (커스텀 선택 렌더링)
      window.getSelection()?.removeAllRanges();
      event.preventDefault();
    },
    [currentPage, getOffsetAtPoint, updateSelection]
  );

  /** 드래그 중 */
  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!isDraggingRef.current || !anchorRef.current) return;

      // 드래그 판별: 시작점에서 일정 거리 이상 움직였는지 체크
      if (mouseDownPosRef.current) {
        const threshold = isTouchDeviceRef.current ? 10 : 5;
        const dx = Math.abs(event.clientX - mouseDownPosRef.current.x);
        const dy = Math.abs(event.clientY - mouseDownPosRef.current.y);
        if (dx < threshold && dy < threshold) return;
      }

      const pageIndex = getPageAtPoint(event.clientX, event.clientY);
      if (pageIndex === null) return;

      const offset = getOffsetAtPoint(pageIndex, event.clientX, event.clientY);
      const focus: SelectionPoint = { page: pageIndex, offset };

      // 같은 페이지 내 드래그는 커스텀 선택 안 함 (네이티브에 맡김)
      if (focus.page === anchorRef.current.page) {
        updateSelection(null);
        return;
      }

      updateSelection({
        anchor: anchorRef.current,
        focus,
      });

      // 활성 페이지에서 시작한 드래그가 다른 페이지로 넘어간 경우
      // Tiptap 에디터의 네이티브 선택을 해제해야 하이라이트가 겹치지 않음
      if (editor && !editor.isDestroyed && anchorRef.current.page === currentPage) {
        editor.commands.blur();
      }

      // 텍스트 선택 방지
      window.getSelection()?.removeAllRanges();
      event.preventDefault();
    },
    [getPageAtPoint, getOffsetAtPoint, updateSelection]
  );

  /** 드래그 종료 */
  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      // 같은 위치 짧은 클릭/탭 판별 — 터치: 10px, 마우스: 5px
      const threshold = isTouchDeviceRef.current ? 10 : 5;
      if (mouseDownPosRef.current && anchorRef.current) {
        const dx = Math.abs(event.clientX - mouseDownPosRef.current.x);
        const dy = Math.abs(event.clientY - mouseDownPosRef.current.y);
        if (dx < threshold && dy < threshold) {
          anchorRef.current = null;
          mouseDownPosRef.current = null;
          updateSelection(null);
          return;
        }
      }

      mouseDownPosRef.current = null;

      // 같은 페이지 내 드래그 → 네이티브 선택에 맡김
      if (!selectionRef.current) {
        anchorRef.current = null;
        return;
      }

      // 크로스 페이지 드래그 완료 → selection 유지
      anchorRef.current = null;
    },
    [updateSelection]
  );

  /** 선택 해제 */
  const clearSelection = useCallback(() => {
    updateSelection(null);
    anchorRef.current = null;
    isDraggingRef.current = false;
  }, [updateSelection]);

  /** 특정 페이지의 선택 범위 반환 */
  const getPageSelectionRange = useCallback(
    (pageIndex: number): PageSelectionRange | null => {
      if (!selection) return null;

      const { startPoint, endPoint } = normalizeSelectionPoints(selection);

      // 이 페이지가 선택 범위 밖이면 null
      if (pageIndex < startPoint.page || pageIndex > endPoint.page) {
        return null;
      }

      const pageContent = pages[pageIndex]?.content || '';

      // 시작 페이지
      if (pageIndex === startPoint.page && pageIndex === endPoint.page) {
        return { start: startPoint.offset, end: endPoint.offset };
      }
      if (pageIndex === startPoint.page) {
        return { start: startPoint.offset, end: pageContent.length };
      }
      // 끝 페이지
      if (pageIndex === endPoint.page) {
        return { start: 0, end: endPoint.offset };
      }
      // 중간 페이지 — 전체 선택
      return { start: 0, end: pageContent.length };
    },
    [selection, pages]
  );

  /** 선택된 텍스트 반환 (여러 페이지 결합) */
  const getSelectedText = useCallback((): string => {
    if (!selection) return '';

    const { startPoint, endPoint } = normalizeSelectionPoints(selection);
    const fullText = serializePages(pages);
    const startOffset = getGlobalOffset(pages, startPoint);
    const endOffset = getGlobalOffset(pages, endPoint);

    return fullText.slice(startOffset, endOffset);
  }, [selection, pages]);

  /** 선택 영역 삭제 후 나머지 텍스트 반환 */
  const deleteSelectedText = useCallback((): string => {
    if (!selection) return serializePages(pages);

    const { content } = replaceSelectionText(selection, pages, '');
    return content;
  }, [selection, pages]);

  const replaceSelectedText = useCallback((insertedText: string): { content: string; cursorOffset: number } => {
    if (!selection) {
      return {
        content: serializePages(pages),
        cursorOffset: serializePages(pages).length,
      };
    }

    return replaceSelectionText(selection, pages, insertedText);
  }, [selection, pages]);

  /** 포인터 취소 (터치 취소, 포커스 이동 등) — 드래그 상태 리셋 */
  const handlePointerCancel = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    anchorRef.current = null;
    mouseDownPosRef.current = null;
  }, []);

  // window 레벨 포인터 이벤트 등록 (드래그가 페이지 밖으로 나갈 수 있으므로)
  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [handlePointerMove, handlePointerUp, handlePointerCancel]);

  // 선택 해제: 다음 mousedown이 발생하면 handleMouseDown에서 처리됨
  // (handleMouseDown 시작 시 기존 selection을 null로 설정)

  return {
    selection,
    setPageTextRef,
    handlePointerDown,
    clearSelection,
    getPageSelectionRange,
    getSelectedText,
    deleteSelectedText,
    replaceSelectedText,
    isActive: selection !== null,
  };
}

function replaceSelectionText(
  selection: CrossPageSelection,
  pages: Page[],
  insertedText: string
): { content: string; cursorOffset: number } {
  const { startPoint, endPoint } = normalizeSelectionPoints(selection);
  const fullText = serializePages(pages);
  const startOffset = getGlobalOffset(pages, startPoint);
  const endOffset = getGlobalOffset(pages, endPoint);
  const content = fullText.slice(0, startOffset) + insertedText + fullText.slice(endOffset);

  return {
    content,
    cursorOffset: startOffset + insertedText.length,
  };
}
