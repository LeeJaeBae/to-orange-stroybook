import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { Editor } from '@tiptap/react';
import type { Page } from '../types';
import {
  textToHtml,
  cleanLegacySeparators,
  normalizeLineBreaks,
  getEditorText,
  getDocTextOffsetAtPos,
} from '../utils';
import { FONT_FAMILIES } from '../constants';

/**
 * 텍스트 오프셋(getText의 \n 기준 인덱스)을 ProseMirror 문서 위치로 변환합니다.
 * doc.descendants 대신 단락(child) 단위 순회로 빈 단락도 정확히 처리합니다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function textOffsetToPmPos(doc: any, offset: number): number {
  let textLen = 0;
  let posBeforeChild = 0;

  for (let i = 0; i < doc.childCount; i++) {
    const child = doc.child(i);
    const contentStart = posBeforeChild + 1; // +1 for block opening tag
    const childTextLen = (child.textContent as string).length;

    // 단락 사이 \n 구분자
    if (i > 0) {
      if (textLen === offset) {
        return contentStart;
      }
      textLen += 1;
    }

    if (textLen + childTextLen >= offset) {
      return contentStart + (offset - textLen);
    }
    textLen += childTextLen;
    posBeforeChild += child.nodeSize;
  }

  // offset이 전체 텍스트보다 큼 → 문서 끝
  return Math.max(1, doc.content.size);
}

/**
 * 에디터 DOM의 시각적 줄 수를 각 단락(p) 별로 개별 측정합니다.
 */
function countEditorVisualLines(editorDom: HTMLElement, lineHeight: number): number {
  const children = editorDom.children;
  if (children.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement;
    total += Math.max(1, Math.round(child.offsetHeight / lineHeight));
  }
  return total;
}

/**
 * 단락 텍스트를 시각적 줄 기준으로 분할합니다.
 * targetLines 줄만큼 현재 페이지에 남기고, 나머지를 다음 페이지로 이동합니다.
 * 실제 에디터 DOM 단락 요소의 스타일을 복사하여 정확한 측정을 합니다.
 */
function splitParagraphAtVisualLine(
  paraText: string,
  targetLines: number,
  paraElement: HTMLElement,
  lineHeight: number
): { fits: string; overflow: string } {
  if (targetLines <= 0) return { fits: '', overflow: paraText };
  if (!paraText.trim()) return { fits: paraText, overflow: '' };

  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;visibility:hidden;';

  const p = document.createElement('p');
  const cs = window.getComputedStyle(paraElement);
  p.style.cssText = `
    margin:0;padding:0;
    width:${paraElement.offsetWidth}px;
    font-family:${cs.fontFamily};
    font-size:${cs.fontSize};
    line-height:${lineHeight}px;
    white-space:pre-wrap;
    word-break:break-word;
    overflow-wrap:break-word;
  `;
  container.appendChild(p);
  document.body.appendChild(container);

  // 이진 탐색으로 targetLines에 맞는 문자 위치 찾기
  let left = 0;
  let right = paraText.length;

  while (left < right) {
    const mid = Math.floor((left + right + 1) / 2);
    p.textContent = paraText.substring(0, mid);
    const lines = Math.max(1, Math.round(p.offsetHeight / lineHeight));
    if (lines <= targetLines) {
      left = mid;
    } else {
      right = mid - 1;
    }
  }

  document.body.removeChild(container);

  if (left === 0) return { fits: '', overflow: paraText };
  if (left >= paraText.length) return { fits: paraText, overflow: '' };

  return {
    // 편집 중에는 글자 단위로 분할해야 역방향 삭제/언더플로우 시
    // 페이지 경계에서 어절 전체가 튀는 현상을 막을 수 있다.
    // 여기서 trim을 하면 페이지 경계에 걸린 빈줄/공백이 사라진다.
    fits: paraText.substring(0, left),
    overflow: paraText.substring(left),
  };
}

function serializePages(pages: Array<Pick<Page, 'content' | 'continuesFromPrevious'>>): string {
  if (pages.length === 0) return '';

  return pages.reduce((result, page, index) => {
    if (index === 0) return page.content;
    const separator = page.continuesFromPrevious ? '' : '\n';
    return result + separator + page.content;
  }, '');
}

function toPageObjects(
  segments: Array<{ content: string; continuesFromPrevious: boolean }>
): Page[] {
  if (segments.length === 0) {
    return [{ id: 1, content: '', continuesFromPrevious: false }];
  }

  return segments.map((segment, idx) => ({
    id: idx + 1,
    content: segment.content,
    continuesFromPrevious: segment.continuesFromPrevious,
  }));
}

function alignContentWithSourceAtCursor(sourceText: string, cursor: number, content: string): string {
  if (sourceText.startsWith(content, cursor)) {
    return content;
  }

  let addCount = 0;
  while (cursor + addCount < sourceText.length && sourceText[cursor + addCount] === '\n') {
    addCount += 1;
    if (sourceText.startsWith(content, cursor + addCount)) {
      return '\n'.repeat(addCount) + content;
    }
  }

  let trimmed = content;
  while (trimmed.startsWith('\n') && sourceText.startsWith(trimmed.slice(1), cursor)) {
    trimmed = trimmed.slice(1);
  }

  return trimmed;
}

function alignPagesWithSourceText(
  sourceText: string,
  pages: Array<Pick<Page, 'id' | 'content' | 'continuesFromPrevious'>>
): Page[] {
  if (pages.length === 0 || sourceText === '') {
    return pages.map((page) => ({
      id: page.id,
      content: page.content,
      continuesFromPrevious: page.continuesFromPrevious,
    }));
  }

  let cursor = 0;

  return pages.map((page, index) => {
    let content = page.content;

    if (index > 0 && !page.continuesFromPrevious && sourceText[cursor] === '\n') {
      cursor += 1;
    }

    content = alignContentWithSourceAtCursor(sourceText, cursor, content);
    cursor += content.length;

    return {
      id: page.id,
      content,
      continuesFromPrevious: page.continuesFromPrevious,
    };
  });
}

function getPageSeparatorLength(
  pages: Array<Pick<Page, 'continuesFromPrevious'>>,
  pageIndex: number
): number {
  if (pageIndex <= 0 || pageIndex >= pages.length) return 0;
  return pages[pageIndex].continuesFromPrevious ? 0 : 1;
}

function getGlobalOffsetForPageCursor(
  pages: Array<Pick<Page, 'content' | 'continuesFromPrevious'>>,
  pageIndex: number,
  offset: number
): number {
  if (pages.length === 0) return 0;

  const safePageIndex = Math.min(Math.max(pageIndex, 0), pages.length - 1);
  let total = 0;

  for (let i = 0; i < safePageIndex; i++) {
    total += pages[i].content.length + getPageSeparatorLength(pages, i + 1);
  }

  return total + Math.min(Math.max(offset, 0), pages[safePageIndex].content.length);
}

function getPageCursorFromGlobalOffset(
  pages: Array<Pick<Page, 'content' | 'continuesFromPrevious'>>,
  globalOffset: number
): { pageIndex: number; offset: number } {
  if (pages.length === 0) {
    return { pageIndex: 0, offset: 0 };
  }

  let remaining = Math.max(globalOffset, 0);

  for (let i = 0; i < pages.length; i++) {
    const pageLength = pages[i].content.length;

    if (remaining <= pageLength) {
      return { pageIndex: i, offset: remaining };
    }

    remaining -= pageLength;
    const separatorLength = getPageSeparatorLength(pages, i + 1);

    if (separatorLength > 0) {
      if (remaining <= separatorLength) {
        return { pageIndex: Math.min(i + 1, pages.length - 1), offset: 0 };
      }
      remaining -= separatorLength;
    }
  }

  const lastPageIndex = pages.length - 1;
  return { pageIndex: lastPageIndex, offset: pages[lastPageIndex].content.length };
}

function getRenderedLineCount(height: number, lineHeight: number): number {
  const ratio = height / lineHeight;
  return Math.max(1, Math.ceil(ratio - 0.05));
}

function getLineStartOffset(lines: string[], lineIndex: number): number {
  let offset = 0;

  for (let i = 0; i < lineIndex; i++) {
    offset += lines[i].length + 1;
  }

  return offset;
}

function getParagraphBoundaryFits(text: string, splitOffset: number): string {
  if (splitOffset <= 0) return '';
  return text.substring(0, Math.max(0, splitOffset - 1));
}

interface UseLetterPagesOptions {
  content: string;
  onContentChange: (content: string) => void;
  totalLines: number;
  lineHeight: number;
  editorWidth: number;
  getPageLayout?: (pageIndex: number) => {
    writingArea: { width: number };
    lineHeight: number;
    totalLines: number;
  };
  fontSize: number;
  font: string;
  editor: Editor | null;
  externalCurrentPage?: number;
  onCurrentPageChange?: (page: number) => void;
}

export function useLetterPages({
  content,
  onContentChange,
  totalLines,
  lineHeight,
  editorWidth,
  getPageLayout,
  fontSize,
  font,
  editor,
  externalCurrentPage,
  onCurrentPageChange,
}: UseLetterPagesOptions) {
  const [pages, setPages] = useState<Page[]>([{ id: 1, content: '', continuesFromPrevious: false }]);
  const [internalCurrentPage, setInternalCurrentPage] = useState(0);
  const currentPage = externalCurrentPage ?? internalCurrentPage;

  const lastSavedContentRef = useRef<string | null>(null);
  const ignoreObserverRef = useRef(false);
  const isReflowingRef = useRef(false);
  const suppressAutoPageAdjustUntilRef = useRef(0);
  const pendingCursorOffsetRef = useRef<number | null>(null);
  const [focusPosition, setFocusPosition] = useState<'start' | 'end'>('start');
  const [focusOffset, setFocusOffset] = useState<number | null>(null);
  const [focusClientPoint, setFocusClientPoint] = useState<{ x: number; y: number } | null>(null);
  const [allPagesSelected, setAllPagesSelected] = useState(false);
  const resolvePageLayout = useCallback(
    (pageIndex: number) => getPageLayout?.(pageIndex) ?? {
      writingArea: { width: editorWidth },
      lineHeight,
      totalLines,
    },
    [editorWidth, getPageLayout, lineHeight, totalLines]
  );
  const currentLayout = resolvePageLayout(currentPage);

  const suppressAutoPageAdjust = useCallback((durationMs = 400) => {
    suppressAutoPageAdjustUntilRef.current = Date.now() + durationMs;
  }, []);

  const setCurrentPage = useCallback(
    (page: number | ((prev: number) => number)) => {
      const newPage = typeof page === 'function' ? page(currentPage) : page;
      onCurrentPageChange?.(newPage);
      setInternalCurrentPage(newPage);
    },
    [currentPage, onCurrentPageChange]
  );

  // 시각적 줄 수 측정 (hidden div) — 에디터의 countVisualLines와 동일하게 <p> 단위로 개별 측정
  const measureVisualLines = useCallback(
    (text: string, pageIndex = currentPage): number => {
      // ''도 실제 편집기에서는 빈 문단 1개로 렌더링될 수 있어서
      // 페이지 경계 계산에서는 1줄로 취급해야 빈줄 overflow/underflow가 맞는다.
      if (text === '') return 1;
      const div = document.createElement('div');
      const pageLayout = resolvePageLayout(pageIndex);
      const pageLineHeight = pageLayout.lineHeight;

      let ff: string;
      let fs: string;
      if (editor && !editor.isDestroyed) {
        const cs = window.getComputedStyle(editor.view.dom);
        ff = cs.fontFamily;
        fs = cs.fontSize;
      } else {
        ff = FONT_FAMILIES[font]?.fontFamily || 'Pretendard, sans-serif';
        fs = `${fontSize}px`;
      }

      div.style.cssText = `
        position:absolute;visibility:hidden;
        width:${pageLayout.writingArea.width}px;
        font-family:${ff};
        font-size:${fs};
        line-height:${pageLineHeight}px;
        white-space:pre-wrap;word-break:break-word;overflow-wrap:break-word;box-sizing:border-box;
      `;

      // 에디터와 동일하게 <p> 단위로 렌더링하여 단락별 줄 수 측정
      // (전체 높이를 한 번에 나누면 반올림 오차로 줄 수가 적게 측정됨)
      const paragraphs = text.split('\n');
      for (const para of paragraphs) {
        const p = document.createElement('p');
        p.style.cssText = `margin:0;padding:0;line-height:${pageLineHeight}px;`;
        p.textContent = para || '\u200B';
        div.appendChild(p);
      }

      document.body.appendChild(div);

      let total = 0;
      for (let i = 0; i < div.children.length; i++) {
        const child = div.children[i] as HTMLElement;
        total += getRenderedLineCount(child.getBoundingClientRect().height, pageLineHeight);
      }

      document.body.removeChild(div);
      return Math.max(total, 1);
    },
    [currentPage, editor, fontSize, font, resolvePageLayout]
  );

  // 텍스트를 한 페이지에 맞게 자르기
  // 긴 단락도 페이지를 꽉 채운 뒤 나머지만 다음 페이지로 넘김
  const fitToPage = useCallback(
    (text: string, pageIndex = currentPage): { fits: string; overflow: string; overflowStartsWithContinuation: boolean } => {
      const pageLayout = resolvePageLayout(pageIndex);

      if (!text || measureVisualLines(text, pageIndex) <= pageLayout.totalLines) {
        return { fits: text, overflow: '', overflowStartsWithContinuation: false };
      }

      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const test = lines.slice(0, i + 1).join('\n');
        if (measureVisualLines(test, pageIndex) > pageLayout.totalLines) {
          // lines[i]가 오버플로우를 일으키는 단락
          // 이전 단락들까지는 확실히 들어감
          const lineStartOffset = getLineStartOffset(lines, i);

          // 현재 단락의 일부를 현재 페이지에 끼워넣기 시도 (이진 탐색)
          const line = lines[i];
          let left = 0,
            right = line.length;
          while (left < right) {
            const mid = Math.floor((left + right + 1) / 2);
            const candidate = text.substring(0, lineStartOffset + mid);
            if (measureVisualLines(candidate, pageIndex) <= pageLayout.totalLines) {
              left = mid;
            } else {
              right = mid - 1;
            }
          }

          if (left > 0) {
            const splitOffset = lineStartOffset + left;
            const fitsText = text.substring(0, splitOffset);
            const overflowText = text.substring(splitOffset);
            return {
              fits: fitsText,
              overflow: overflowText,
              overflowStartsWithContinuation: true,
            };
          }

          // 한 글자도 안 들어감 → 이전 줄까지만
          if (i > 0) {
            return {
              fits: getParagraphBoundaryFits(text, lineStartOffset),
              overflow: text.substring(lineStartOffset),
              overflowStartsWithContinuation: false,
            };
          }
          // 첫 단락인데 한 글자도 안 들어감 → 강제 반환
          return { fits: '', overflow: text, overflowStartsWithContinuation: false };
        }
      }

      return { fits: text, overflow: '', overflowStartsWithContinuation: false };
    },
    [currentPage, measureVisualLines, resolvePageLayout]
  );

  // 전체 텍스트를 페이지 배열로 분할 (빈 줄도 줄 수에 포함)
  const splitAllIntoPages = useCallback(
    (fullText: string, startsWithContinuation = false, startPageIndex = 0): Page[] => {
      if (fullText === '') {
        return [{ id: 1, content: '', continuesFromPrevious: startsWithContinuation }];
      }
      const result: Array<{ content: string; continuesFromPrevious: boolean }> = [];
      let remaining: string | null = fullText;
      let continuesFromPrevious = startsWithContinuation;

      while (remaining !== null) {
        // 빈 문자열도 한 페이지로 처리 (Enter로 생긴 빈 단락 등)
        const pageIndex = startPageIndex + result.length;
        const { fits, overflow, overflowStartsWithContinuation } = fitToPage(remaining, pageIndex);
        result.push({ content: fits, continuesFromPrevious });

        // 전체가 한 페이지에 맞음 → 종료
        if (overflow === '' && fits === remaining) break;

        // overflow가 빈 문자열이지만 fits ≠ remaining
        // → 마지막에 빈 단락이 있음 (Enter로 새 줄 추가 등)
        // → 다음 반복에서 빈 페이지로 처리
        if (overflow === '') {
          remaining = '';
          continuesFromPrevious = false;
          continue;
        }

        // fitToPage가 진행하지 못함 → 강제 추가하고 종료
        if (overflow === remaining) {
          if (!fits && remaining) {
            result.push({ content: remaining, continuesFromPrevious });
          }
          break;
        }

        remaining = overflow;
        continuesFromPrevious = overflowStartsWithContinuation;
        if (result.length > 50) break;
      }

      return alignPagesWithSourceText(fullText, toPageObjects(result));
    },
    [fitToPage]
  );

  // 외부 content 변경 시 페이지에 반영
  useEffect(() => {
    if (content === lastSavedContentRef.current) return;

    // 레거시 페이지 구분자만 제거 (빈 줄은 보존하여 페이지 수 정확하게 계산)
    const cleanContent = cleanLegacySeparators(content);
    // 시각적 줄 수 기반 분할 (워드랩 반영)
    const newPages = splitAllIntoPages(cleanContent);

    if (newPages.length === 0) {
      newPages.push({ id: 1, content: '', continuesFromPrevious: false });
    }

    const nextPageIndex = Math.min(currentPage, newPages.length - 1);

    setPages(newPages);
    setCurrentPage(nextPageIndex);
    setFocusPosition(nextPageIndex === currentPage ? focusPosition : 'start');
    lastSavedContentRef.current = content;

    // Tiptap 에디터에 첫 페이지 내용 설정
    if (editor && !editor.isDestroyed && !editor.isFocused) {
      editor.commands.setContent(textToHtml(newPages[nextPageIndex]?.content || ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // 현재 페이지 내용 저장
  const saveCurrentPageContent = useCallback(() => {
    if (!editor) return;
    // reflow/overflow 처리 중에는 저장하지 않음 (에디터 내용이 아직 동기화 안 됨)
    if (isReflowingRef.current) return;
    // blockSeparator: '\n' — paragraph 사이를 단일 개행으로 직렬화
    const editorContent = getEditorText(editor);

    setPages((prev) => {
      const updatedPages = prev.map((page, idx) => (idx === currentPage ? { ...page, content: editorContent } : page));
      const allContent = serializePages(updatedPages);
      lastSavedContentRef.current = allContent;
      onContentChange(allContent);
      return updatedPages;
    });
  }, [currentPage, onContentChange, editor]);

  // 전체 내용 교체 (AI 생성 등)
  const replaceAllContent = useCallback(
    (newText: string, opts?: { focusEnd?: boolean; globalCursorOffset?: number }) => {
      // 3개 이상 연속 개행만 축소 (빈 줄은 보존)
      const normalized = normalizeLineBreaks(newText);
      const newPages = splitAllIntoPages(normalized);
      if (newPages.length === 0) newPages.push({ id: 1, content: '', continuesFromPrevious: false });

      setPages(newPages);
      const targetCursor = typeof opts?.globalCursorOffset === 'number'
        ? getPageCursorFromGlobalOffset(newPages, opts.globalCursorOffset)
        : {
            pageIndex: opts?.focusEnd ? newPages.length - 1 : 0,
            offset: opts?.focusEnd ? newPages[newPages.length - 1]?.content.length ?? 0 : 0,
          };
      setCurrentPage(targetCursor.pageIndex);
      setFocusPosition(targetCursor.offset > 0 ? 'end' : 'start');
      setFocusOffset(targetCursor.offset);
      setFocusClientPoint(null);
      pendingCursorOffsetRef.current = targetCursor.offset;
      setAllPagesSelected(false);

      const allContent = serializePages(newPages);
      lastSavedContentRef.current = allContent;
      onContentChange(allContent);

      if (editor && !editor.isDestroyed) {
        editor.commands.setContent(textToHtml(newPages[targetCursor.pageIndex]?.content || ''));
      }
    },
    [editor, onContentChange, splitAllIntoPages, setCurrentPage]
  );

  // 페이지 전환 — key prop 변경으로 에디터가 자동 재생성되므로 setContent 불필요
  const handlePageChange = useCallback(
    (targetPage: number, cursorOffset?: number, clickPoint?: { x: number; y: number }) => {
      if (targetPage >= 0 && targetPage < pages.length && targetPage !== currentPage) {
        suppressAutoPageAdjust();
        saveCurrentPageContent();
        pendingCursorOffsetRef.current =
          typeof cursorOffset === 'number'
            ? Math.min(Math.max(cursorOffset, 0), pages[targetPage]?.content.length ?? 0)
            : null;
        setCurrentPage(targetPage);
        setFocusPosition(
          typeof cursorOffset === 'number' && cursorOffset > 0 ? 'end' : 'start'
        );
        setFocusOffset(
          typeof cursorOffset === 'number'
            ? Math.min(Math.max(cursorOffset, 0), pages[targetPage]?.content.length ?? 0)
            : null
        );
        setFocusClientPoint(clickPoint ?? null);
      }
    },
    [currentPage, pages, saveCurrentPageContent, setCurrentPage, suppressAutoPageAdjust]
  );

  // TODO: 편지지 에디터 줄바꿈 버그 점검 필요.
  // 마지막 줄 Enter와 자동 overflow 재분할이 서로 다른 흐름으로 동작해서,
  // 사용자는 줄바꿈만 했는데 문단/커서가 다른 페이지나 예상 밖 위치로 튄다고 느낄 수 있다.
  // Enter 직후 cursor offset과 overflow 이후 상대 offset을 동일 규칙으로 복원하도록 정리 필요.
  // Enter → 다음 페이지
  const handleEnterAtLastLine = useCallback(() => {
    saveCurrentPageContent();
    const nextPageIndex = currentPage + 1;

    setPages((prev) => {
      const newPages = [...prev];
      if (nextPageIndex >= newPages.length) {
        newPages.push({ id: nextPageIndex + 1, content: '', continuesFromPrevious: false });
      }
      const allContent = serializePages(newPages);
      lastSavedContentRef.current = allContent;
      onContentChange(allContent);
      return newPages;
    });

    setCurrentPage(nextPageIndex);
    setFocusPosition('start');
    setFocusOffset(0);
    setFocusClientPoint(null);

    toast.success(`${nextPageIndex + 1}페이지로 이어집니다`, {
      description: '새 페이지에서 계속 작성하세요',
      duration: 2000,
    });
  }, [currentPage, onContentChange, saveCurrentPageContent, setCurrentPage]);

  // Backspace → 이전 페이지와 합치기
  // 이전 페이지 마지막 단락과 현재 페이지 첫 단락을 합침 (줄바꿈 하나 제거)
  const handleBackspaceAtStart = useCallback(() => {
    if (currentPage <= 0) return;

    const currentContent = getEditorText(editor);
    const prevPageIndex = currentPage - 1;
    const prevPageContent = pages[prevPageIndex]?.content || '';

    isReflowingRef.current = true;

    // 현재 페이지가 비어있으면 단순히 페이지 제거
    if (!currentContent.trim()) {
      setPages((prev) => {
        const newPages = [...prev];
        newPages.splice(currentPage, 1);
        if (newPages.length === 0) newPages.push({ id: 1, content: '', continuesFromPrevious: false });
        const allContent = serializePages(newPages);
        lastSavedContentRef.current = allContent;
        onContentChange(allContent);
        return newPages;
      });
      setCurrentPage(prevPageIndex);
      setFocusPosition('end');
      setFocusOffset(prevPageContent.length);
      setFocusClientPoint(null);
      setTimeout(() => { isReflowingRef.current = false; }, 50);
      return;
    }

    // 백스페이스 = 이전 페이지 마지막 단락 + 현재 페이지 첫 단락 합침 (\n 제거)
    const mergedContent = prevPageContent + currentContent;
    const mergedPage = {
      content: mergedContent,
      continuesFromPrevious: pages[prevPageIndex]?.continuesFromPrevious ?? false,
    };

    // 커서 위치: 이전 페이지 끝 (합쳐진 지점)
    const cursorInMerged = prevPageContent.length;

    // 전체 텍스트 재구성
    const beforePgs = pages.slice(0, prevPageIndex).map((p) => p.content);
    const sourcePages = [
      ...pages.slice(0, prevPageIndex),
      mergedPage,
      ...pages.slice(currentPage + 1),
    ];
    const allText = serializePages(sourcePages);

    // 페이지 재분할
    const newPages = splitAllIntoPages(allText, sourcePages[0]?.continuesFromPrevious ?? false);
    if (newPages.length === 0) newPages.push({ id: 1, content: '', continuesFromPrevious: false });

    // 커서의 글로벌 오프셋 계산
    const globalCursorOffset = serializePages([
      ...pages.slice(0, prevPageIndex),
      { ...mergedPage, content: mergedContent.substring(0, cursorInMerged) },
    ]).length;

    // 커서가 있어야 할 페이지 계산
    let charCount = 0;
    let targetPage = 0;
    for (let i = 0; i < newPages.length; i++) {
      if (globalCursorOffset <= charCount + newPages[i].content.length) {
        targetPage = i;
        break;
      }
      const separatorLength = newPages[i + 1]?.continuesFromPrevious ? 0 : 1;
      charCount += newPages[i].content.length + separatorLength;
      if (i === newPages.length - 1) targetPage = i;
    }
    targetPage = Math.min(targetPage, newPages.length - 1);

    // 해당 페이지 내에서의 커서 오프셋 계산
    let pageStartOffset = 0;
    for (let i = 0; i < targetPage; i++) {
      pageStartOffset += newPages[i].content.length + (newPages[i + 1]?.continuesFromPrevious ? 0 : 1);
    }
    const cursorInPage = globalCursorOffset - pageStartOffset;

    const allContent = serializePages(newPages);
    lastSavedContentRef.current = allContent;
    onContentChange(allContent);

    setPages(newPages);
    pendingCursorOffsetRef.current = cursorInPage;
    setCurrentPage(targetPage);
    setFocusOffset(cursorInPage);
    setFocusClientPoint(null);

    setTimeout(() => { isReflowingRef.current = false; }, 50);
  }, [currentPage, editor, onContentChange, pages, setCurrentPage, splitAllIntoPages]);

  // TODO: 편지지 에디터 줄 이동 버그 점검 필요.
  // cursorInFits === false 경로에서는 overflow 뒤 새 페이지로 넘긴 뒤에도
  // overflow 내부의 상대 커서 위치를 복원하지 않고 첫 위치로 보내서,
  // 줄바꿈/자동 재배치 시 "줄이 이상한 데로 이동"하는 체감이 생길 수 있다.
  // 오버플로우 처리 — 에디터 DOM에서 직접 분할 지점을 결정 (hidden div 측정 오차 제거)
  const handleLineOverflow = useCallback(
    (text: string) => {
      if (isReflowingRef.current) return;

      // ── 에디터 DOM의 실제 <p> 요소로 분할 지점 결정 ──
      let currentPageFits = text;
      let currentPageOverflow = '';
      let overflowStartsWithContinuation = false;

      if (editor && !editor.isDestroyed) {
        const paraElements = Array.from(editor.view.dom.children) as HTMLElement[];
        let lineCount = 0;
        let splitAt = paraElements.length;

        for (let i = 0; i < paraElements.length; i++) {
          const paraLines = Math.max(1, Math.round(paraElements[i].offsetHeight / currentLayout.lineHeight));
          if (lineCount + paraLines > currentLayout.totalLines) {
            splitAt = i;
            break;
          }
          lineCount += paraLines;
        }

        if (splitAt < paraElements.length) {
          const paragraphs = text.split('\n');
          if (paragraphs.length === paraElements.length) {
            const linesAvailable = currentLayout.totalLines - lineCount;
            const splitOffset = getLineStartOffset(paragraphs, splitAt);

            if (linesAvailable > 0) {
              // 오버플로우 단락 내부를 시각적 줄 기준으로 분할 (한줄씩 넘기기)
              const { fits: paraFits, overflow: paraOverflow } = splitParagraphAtVisualLine(
                paragraphs[splitAt],
                linesAvailable,
                paraElements[splitAt],
                currentLayout.lineHeight
              );

              if (paraFits) {
                const partialSplitOffset = splitOffset + paraFits.length;
                currentPageFits = text.substring(0, partialSplitOffset);
                currentPageOverflow = text.substring(partialSplitOffset);
                overflowStartsWithContinuation = true;
              } else {
                // 한 줄도 안 들어감 → 전체 단락 이동
                currentPageFits = splitAt > 0 ? getParagraphBoundaryFits(text, splitOffset) : '';
                currentPageOverflow = text.substring(splitOffset);
                overflowStartsWithContinuation = false;
              }
            } else {
              // 남은 줄이 없음 → 전체 단락 이동
              currentPageFits = splitAt > 0 ? getParagraphBoundaryFits(text, splitOffset) : '';
              currentPageOverflow = text.substring(splitOffset);
              overflowStartsWithContinuation = false;
            }
          } else {
            // 단락 수 불일치 → fallback
            const { fits, overflow, overflowStartsWithContinuation: nextStartsWithContinuation } = fitToPage(text, currentPage);
            currentPageFits = fits;
            currentPageOverflow = overflow;
            overflowStartsWithContinuation = nextStartsWithContinuation;
          }
        }
      } else {
        const { fits, overflow, overflowStartsWithContinuation: nextStartsWithContinuation } = fitToPage(text, currentPage);
        currentPageFits = fits;
        currentPageOverflow = overflow;
        overflowStartsWithContinuation = nextStartsWithContinuation;
      }

      // 오버플로우가 없으면 종료
      if (!currentPageOverflow && currentPageFits === text) return;

      // 앞/뒤 페이지와 합쳐서 재구성
      const beforePgs = pages.slice(0, currentPage);
      const afterPgs = pages.slice(currentPage + 1);
      const currentPageMeta = pages[currentPage] ?? { id: currentPage + 1, content: '', continuesFromPrevious: false };

      // overflow + 뒷 페이지들을 다시 분할 (여러 페이지로 넘칠 수 있음)
      const remainingSourcePages = [
        ...(currentPageOverflow
          ? [{ id: 0, content: currentPageOverflow, continuesFromPrevious: overflowStartsWithContinuation }]
          : []),
        ...afterPgs,
      ];
      const remainingText = serializePages(remainingSourcePages);
      const remainingPages = remainingText
        ? splitAllIntoPages(remainingText, remainingSourcePages[0]?.continuesFromPrevious ?? false, currentPage + 1)
        : [];

      const sourcePages = [
        ...beforePgs,
        { ...currentPageMeta, content: text },
        ...afterPgs,
      ];
      const sourceText = serializePages(sourcePages);

      const newPages = alignPagesWithSourceText(sourceText, toPageObjects([
        ...beforePgs,
        { ...currentPageMeta, content: currentPageFits },
        ...remainingPages,
      ]));
      if (newPages.length === 0) newPages.push({ id: 1, content: '', continuesFromPrevious: false });

      // 커서 위치 확인
      let cursorInFits = true;
      let cursorOffset = 0;
      if (editor && !editor.isDestroyed) {
        try {
          const { $head } = editor.state.selection;
          cursorOffset = getDocTextOffsetAtPos(editor.state.doc, $head.pos);
          cursorInFits = cursorOffset <= currentPageFits.length;
        } catch { /* fallback */ }
      }

      const globalCursorOffset = getGlobalOffsetForPageCursor(sourcePages, currentPage, cursorOffset);
      const targetCursor = getPageCursorFromGlobalOffset(newPages, globalCursorOffset);

      const allContent = serializePages(newPages);
      lastSavedContentRef.current = allContent;
      onContentChange(allContent);

      // 에디터 내용을 현재 페이지 내용으로 동기화 + 커서 위치 복원
      if (editor && !editor.isDestroyed) {
        isReflowingRef.current = true;
        const pageContent = newPages[targetCursor.pageIndex]?.content || '';
        editor.commands.setContent(textToHtml(pageContent));

        try {
          const doc = editor.state.doc;
          const pmPos = textOffsetToPmPos(doc, targetCursor.offset);
          if (pmPos >= 1 && pmPos <= doc.content.size) {
            editor.commands.setTextSelection(pmPos);
          }
        } catch { /* 복원 실패 시 기본 위치 */ }

        if (!cursorInFits && targetCursor.pageIndex !== currentPage) {
          pendingCursorOffsetRef.current = targetCursor.offset;
        }

        setTimeout(() => { isReflowingRef.current = false; }, 50);
      }

      setPages(newPages);
      setCurrentPage(targetCursor.pageIndex);
      setFocusPosition(targetCursor.offset > 0 ? 'end' : 'start');
      setFocusOffset(targetCursor.offset);
      setFocusClientPoint(null);

      const prevPageCount = pages.length;
      if (newPages.length > prevPageCount) {
        toast.success(`${newPages.length}페이지로 분할되었습니다`, {
          description: '내용이 길어져 페이지가 추가되었습니다',
          duration: 2000,
        });
      }
    },
    [currentLayout.lineHeight, currentLayout.totalLines, currentPage, pages, onContentChange, setCurrentPage, splitAllIntoPages, editor, fitToPage]
  );

  // 붙여넣기 처리
  const handlePaste = useCallback(
    ({
      fullText,
      selectionStart,
      pastedText,
    }: {
      fullText: string;
      selectionStart: number;
      pastedText: string;
    }) => {
      // 앞/뒤 페이지 포함 전체 재구성
      const sourcePages = [
        ...pages.slice(0, currentPage),
        {
          ...(pages[currentPage] ?? { id: currentPage + 1, content: '', continuesFromPrevious: false }),
          content: fullText,
        },
        ...pages.slice(currentPage + 1),
      ];
      const allText = serializePages(sourcePages);

      const newPages = splitAllIntoPages(allText, sourcePages[0]?.continuesFromPrevious ?? false);

      // 커서가 있어야 할 페이지 계산
      const globalCursorOffset = getGlobalOffsetForPageCursor(
        sourcePages,
        currentPage,
        selectionStart + pastedText.length
      );
      const targetCursor = getPageCursorFromGlobalOffset(newPages, globalCursorOffset);

      const allContent = serializePages(newPages);
      lastSavedContentRef.current = allContent;
      onContentChange(allContent);

      // 에디터 내용을 분할된 페이지 내용으로 즉시 동기화
      if (editor && !editor.isDestroyed) {
        isReflowingRef.current = true;
        editor.commands.setContent(textToHtml(newPages[targetCursor.pageIndex]?.content || ''));
        pendingCursorOffsetRef.current = targetCursor.offset;
        setTimeout(() => { isReflowingRef.current = false; }, 50);
      }

      setPages(newPages);
      setCurrentPage(targetCursor.pageIndex);
      setFocusPosition('end');
      setFocusOffset(targetCursor.offset);
      setFocusClientPoint(null);

      if (newPages.length > 1) {
        toast.success(`${newPages.length}페이지로 분할되었습니다`, { duration: 2000 });
      }
    },
    [currentPage, onContentChange, pages, setCurrentPage, splitAllIntoPages, editor]
  );

  // 폰트 크기/종류 변경 시 전체 페이지 재분할
  const reflowPages = useCallback(() => {
    // 현재 에디터 내용 먼저 반영
    let currentEditorContent = '';
    if (editor && !editor.isDestroyed) {
      currentEditorContent = getEditorText(editor);
    }

    const allPageContents = pages.map((page, idx) =>
      idx === currentPage && currentEditorContent ? currentEditorContent : page.content
    );
    const allContent = serializePages(
      pages.map((page, idx) => ({
        ...page,
        content: idx === currentPage && currentEditorContent ? currentEditorContent : page.content,
      }))
    );

    if (!allContent.trim()) return;

    const newPages = splitAllIntoPages(allContent, pages[0]?.continuesFromPrevious ?? false);
    if (newPages.length === 0) newPages.push({ id: 1, content: '', continuesFromPrevious: false });

    const safeCurrentPage = Math.min(currentPage, newPages.length - 1);

    setPages(newPages);
    if (safeCurrentPage !== currentPage) {
      setCurrentPage(safeCurrentPage);
    }

    const newAllContent = serializePages(newPages);
    lastSavedContentRef.current = newAllContent;
    onContentChange(newAllContent);

    // setContent 시 overflow 감지 방지 (측정 오차로 인한 오작동 방지)
    if (editor && !editor.isDestroyed) {
      isReflowingRef.current = true;
      editor.commands.setContent(textToHtml(newPages[safeCurrentPage]?.content || ''));
      // setTimeout으로 overflow 체크가 끝난 뒤 해제
      setTimeout(() => {
        isReflowingRef.current = false;
      }, 50);
    }
  }, [editor, pages, currentPage, splitAllIntoPages, onContentChange, setCurrentPage]);

  // 언더플로우 처리 — 현재 페이지에 여유가 있으면 다음 페이지 내용을 당겨오거나 이전 페이지로 합침
  const handleLineUnderflow = useCallback(() => {
    if (isReflowingRef.current) return;
    if (Date.now() < suppressAutoPageAdjustUntilRef.current) return;
    if (!editor || editor.isDestroyed) return;

    const currentContent = getEditorText(editor);

    // ── 1. 이전 페이지로 합치기 시도 (현재 내용이 이전 페이지에 들어갈 수 있는 경우) ──
    if (currentPage > 0) {
      const prevPageContent = pages[currentPage - 1]?.content || '';
      const mergedWithPrev = prevPageContent
        ? (
            pages[currentPage]?.continuesFromPrevious
              ? prevPageContent + currentContent
              : prevPageContent + '\n' + currentContent
          )
        : currentContent;
      const mergedLayout = resolvePageLayout(currentPage - 1);
      const mergedLines = measureVisualLines(mergedWithPrev, currentPage - 1);

      if (mergedLines <= mergedLayout.totalLines) {
        // 이전 페이지에 모두 들어감 → 합치고 이전 페이지로 이동
        isReflowingRef.current = true;

        // 커서 위치: 이전 페이지 텍스트 뒤 + 현재 커서 오프셋
        let cursorOffset = 0;
        try {
          const { $head } = editor.state.selection;
          cursorOffset = getDocTextOffsetAtPos(editor.state.doc, $head.pos);
        } catch { /* */ }
        const newCursorOffset = prevPageContent
          ? prevPageContent.length + (pages[currentPage]?.continuesFromPrevious ? 0 : 1) + cursorOffset
          : cursorOffset;

        // 페이지 배열 업데이트: 이전 페이지에 합치고 현재 페이지 제거
        const prevPageIndex = currentPage - 1;
        const newPages = pages.map((p, idx) => {
          if (idx === prevPageIndex) return { ...p, content: mergedWithPrev };
          return p;
        }).filter((_, idx) => idx !== currentPage);
        if (newPages.length === 0) newPages.push({ id: 1, content: '', continuesFromPrevious: false });

        const allContent = serializePages(newPages);
        lastSavedContentRef.current = allContent;
        onContentChange(allContent);

        setPages(newPages);

        // 이전 페이지로 전환 + 커서 위치 예약 (에디터 재생성 후 적용)
        pendingCursorOffsetRef.current = newCursorOffset;
        setCurrentPage(prevPageIndex);
        setFocusOffset(newCursorOffset);
        setFocusClientPoint(null);

        setTimeout(() => { isReflowingRef.current = false; }, 50);
        return;
      }
    }

    // ── 2. 다음 페이지에서 당겨오기 ──
    const nextPageIndex = currentPage + 1;
    if (nextPageIndex >= pages.length) return;

    const nextPageContent = pages[nextPageIndex]?.content;
    if (!nextPageContent && nextPageContent !== '') return;
    // 빈 페이지만 있으면 해당 페이지 제거
    if (!nextPageContent) {
      setPages((prev) => {
        const newPages = prev.filter((_, idx) => idx !== nextPageIndex);
        if (newPages.length === 0) newPages.push({ id: 1, content: '', continuesFromPrevious: false });
        const allContent = serializePages(newPages);
        lastSavedContentRef.current = allContent;
        onContentChange(allContent);
        return newPages;
      });
      return;
    }

    // 커서 위치 저장 (다음 페이지에서 당겨오기 후 복원용)
    let cursorOffset = 0;
    try {
      const { $head } = editor.state.selection;
      cursorOffset = getDocTextOffsetAtPos(editor.state.doc, $head.pos);
    } catch { /* fallback */ }

    const mergedContent = pages[nextPageIndex]?.continuesFromPrevious
      ? currentContent + nextPageContent
      : currentContent + '\n' + nextPageContent;

    // 합친 내용을 에디터에 임시 설정하여 정확한 DOM 측정
    isReflowingRef.current = true;
    editor.commands.setContent(textToHtml(mergedContent));

    // DOM에서 분할 지점 결정
    const paraElements = Array.from(editor.view.dom.children) as HTMLElement[];
    let lineCount = 0;
    let splitAt = paraElements.length; // 전부 들어감 = 분할 불필요

    for (let i = 0; i < paraElements.length; i++) {
      const paraLines = Math.max(1, Math.round(paraElements[i].offsetHeight / currentLayout.lineHeight));
      if (lineCount + paraLines > currentLayout.totalLines) {
        splitAt = i;
        break;
      }
      lineCount += paraLines;
    }

    const paragraphs = mergedContent.split('\n');
    let fits = mergedContent;
    let overflow = '';
    let overflowStartsWithContinuation = false;

    if (splitAt < paraElements.length && paragraphs.length === paraElements.length) {
      const linesAvailable = currentLayout.totalLines - lineCount;
      const splitOffset = getLineStartOffset(paragraphs, splitAt);
      if (linesAvailable > 0 && splitAt < paragraphs.length) {
        const { fits: paraFits, overflow: paraOverflow } = splitParagraphAtVisualLine(
          paragraphs[splitAt], linesAvailable, paraElements[splitAt], currentLayout.lineHeight
        );
        if (paraFits) {
          const partialSplitOffset = splitOffset + paraFits.length;
          fits = mergedContent.substring(0, partialSplitOffset);
          overflow = mergedContent.substring(partialSplitOffset);
          overflowStartsWithContinuation = true;
        } else {
          fits = splitAt > 0 ? getParagraphBoundaryFits(mergedContent, splitOffset) : '';
          overflow = mergedContent.substring(splitOffset);
          overflowStartsWithContinuation = false;
        }
      } else {
        fits = splitAt > 0 ? getParagraphBoundaryFits(mergedContent, splitOffset) : '';
        overflow = mergedContent.substring(splitOffset);
        overflowStartsWithContinuation = false;
      }
    } else if (splitAt < paraElements.length) {
      // 단락 수 불일치 → fallback
      const result = fitToPage(mergedContent, currentPage);
      fits = result.fits;
      overflow = result.overflow;
      overflowStartsWithContinuation = result.overflowStartsWithContinuation;
    }

    // 변화가 없으면 원복
    if (fits === currentContent) {
      editor.commands.setContent(textToHtml(currentContent));
      setTimeout(() => { isReflowingRef.current = false; }, 50);
      return;
    }

    // 페이지 업데이트
    const beforePgs = pages.slice(0, currentPage).map((p) => p.content);
    const afterPgs = pages.slice(nextPageIndex + 1);
    const sourcePages = [
      ...pages.slice(0, currentPage),
      {
        ...(pages[currentPage] ?? { id: currentPage + 1, content: '', continuesFromPrevious: false }),
        content: mergedContent,
      },
      ...afterPgs,
    ];

    let allPageContents: Array<{ content: string; continuesFromPrevious: boolean }>;
    if (overflow) {
      const overflowSourcePages = [
        { id: 0, content: overflow, continuesFromPrevious: overflowStartsWithContinuation },
        ...afterPgs,
      ];
      const overflowWithAfter = serializePages(overflowSourcePages);
      const overflowPages = splitAllIntoPages(
        overflowWithAfter,
        overflowSourcePages[0]?.continuesFromPrevious ?? false,
        currentPage + 1
      );
      allPageContents = [
        ...pages.slice(0, currentPage),
        { ...(pages[currentPage] ?? { id: currentPage + 1, content: '', continuesFromPrevious: false }), content: fits },
        ...overflowPages,
      ];
    } else if (afterPgs.length > 0) {
      allPageContents = [
        ...pages.slice(0, currentPage),
        { ...(pages[currentPage] ?? { id: currentPage + 1, content: '', continuesFromPrevious: false }), content: fits },
        ...afterPgs,
      ];
    } else {
      allPageContents = [
        ...pages.slice(0, currentPage),
        { ...(pages[currentPage] ?? { id: currentPage + 1, content: '', continuesFromPrevious: false }), content: fits },
      ];
    }

    const newPages = alignPagesWithSourceText(serializePages(sourcePages), toPageObjects(allPageContents));
    if (newPages.length === 0) newPages.push({ id: 1, content: '', continuesFromPrevious: false });

    const globalCursorOffset = getGlobalOffsetForPageCursor(sourcePages, currentPage, cursorOffset);
    const targetCursor = getPageCursorFromGlobalOffset(newPages, globalCursorOffset);

    const allContent = serializePages(newPages);
    lastSavedContentRef.current = allContent;
    onContentChange(allContent);

    const targetPageContent = newPages[targetCursor.pageIndex]?.content || '';
    editor.commands.setContent(textToHtml(targetPageContent));

    try {
      const doc = editor.state.doc;
      const pmPos = textOffsetToPmPos(doc, targetCursor.offset);
      if (pmPos >= 1 && pmPos <= doc.content.size) {
        editor.commands.setTextSelection(pmPos);
      }
    } catch { /* 복원 실패 시 기본 위치 */ }

    setPages(newPages);
    pendingCursorOffsetRef.current = targetCursor.offset;
    setCurrentPage(targetCursor.pageIndex);
    setFocusPosition(targetCursor.offset > 0 ? 'end' : 'start');
    setFocusOffset(targetCursor.offset);
    setFocusClientPoint(null);

    setTimeout(() => { isReflowingRef.current = false; }, 50);
  }, [currentLayout.lineHeight, currentLayout.totalLines, currentPage, pages, editor, splitAllIntoPages, onContentChange, fitToPage, measureVisualLines, resolvePageLayout, setCurrentPage]);

  // 언더플로우 감지 — 에디터 내용 변경 시 다음 페이지에서 당겨올 수 있는지 확인
  const handleLineUnderflowRef = useRef(handleLineUnderflow);
  handleLineUnderflowRef.current = handleLineUnderflow;
  const underflowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!editor) return;
    // 에디터 초기화/페이지 전환 직후 언더플로우 방지 (300ms 대기)
    const initTime = Date.now();

    const onUpdate = () => {
      if (isReflowingRef.current) return;
      if (Date.now() - initTime < 300) return;

      // 기존 타이머 취소 (디바운스)
      if (underflowTimerRef.current) {
        clearTimeout(underflowTimerRef.current);
        underflowTimerRef.current = null;
      }

      underflowTimerRef.current = setTimeout(() => {
        underflowTimerRef.current = null;
        if (isReflowingRef.current || !editor || editor.isDestroyed) return;

        const lines = countEditorVisualLines(editor.view.dom, currentLayout.lineHeight);
        if (lines < currentLayout.totalLines) {
          handleLineUnderflowRef.current();
        }
      }, 150);
    };

    editor.on('update', onUpdate);
    return () => {
      editor.off('update', onUpdate);
      if (underflowTimerRef.current) {
        clearTimeout(underflowTimerRef.current);
        underflowTimerRef.current = null;
      }
    };
  }, [currentLayout.lineHeight, currentLayout.totalLines, editor]);

  // Ctrl+A 전체 페이지 선택
  const handleSelectAll = useCallback(() => {
    if (pages.length > 1) {
      setAllPagesSelected(true);
    }
  }, [pages.length]);

  const clearFocusRestore = useCallback(() => {
    setFocusOffset(null);
    setFocusClientPoint(null);
  }, []);

  // 전체 내용 삭제 (모든 페이지 초기화)
  const clearAllPages = useCallback(() => {
    const newPages = [{ id: 1, content: '', continuesFromPrevious: false }];
    setPages(newPages);
    setCurrentPage(0);
    setFocusPosition('start');
    setFocusOffset(0);
    setFocusClientPoint(null);
    lastSavedContentRef.current = '';
    onContentChange('');
    if (editor && !editor.isDestroyed) {
      isReflowingRef.current = true;
      editor.commands.clearContent();
      setTimeout(() => { isReflowingRef.current = false; }, 50);
    }
    setAllPagesSelected(false);
  }, [editor, onContentChange, setCurrentPage]);

  // 전체 선택 시 복사/잘라내기/삭제 처리
  useEffect(() => {
    if (!allPagesSelected) return;

    const handleCopy = (e: ClipboardEvent) => {
      const allText = serializePages(pages);
      e.preventDefault();
      e.clipboardData?.setData('text/plain', allText);
      toast.success('전체 편지 내용이 복사되었습니다');
      setTimeout(() => setAllPagesSelected(false), 100);
    };

    const handleCut = (e: ClipboardEvent) => {
      const allText = serializePages(pages);
      e.preventDefault();
      e.clipboardData?.setData('text/plain', allText);
      toast.success('전체 편지 내용이 잘라내졌습니다');
      clearAllPages();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      // Ctrl+C, Ctrl+A는 허용
      if (isMod && (e.key === 'c' || e.key === 'a')) return;
      // Ctrl+X는 cut 이벤트로 처리
      if (isMod && e.key === 'x') return;
      // Ctrl+Z는 커스텀/네이티브 되돌리기에 맡김
      if (isMod && e.key.toLowerCase() === 'z') return;
      // Backspace/Delete: 전체 삭제
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        e.stopPropagation();
        clearAllPages();
        return;
      }
      setAllPagesSelected(false);
    };

    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('cut', handleCut, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('cut', handleCut, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [allPagesSelected, pages, clearAllPages]);

  return {
    pages,
    setPages,
    currentPage,
    setCurrentPage,
    focusPosition,
    focusOffset,
    focusClientPoint,
    allPagesSelected,
    handleSelectAll,
    clearFocusRestore,
    reflowPages,
    saveCurrentPageContent,
    replaceAllContent,
    handlePageChange,
    handleEnterAtLastLine,
    handleBackspaceAtStart,
    handleLineOverflow,
    handlePaste,
    ignoreObserverRef,
    lastSavedContentRef,
  };
}
