'use client';

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Editor } from '@tiptap/react';
import { apiFetch } from '@/lib/api/fetch';
import { isSSEResponse, readSSEStream } from '@/lib/ai/stream-reader';
import { useRecipientAIProfile } from '@/hooks/useRecipientAIProfile';
import type { RecipientAIProfile } from '@/hooks/useRecipientAIProfile';
import { getLetterGreeting } from '@/lib/ai/prompts/common';
import { RecipientOnboarding } from '../RecipientOnboarding';

import type { LetterEditorProps } from './types';
import { getLineHeight, getTotalLines, getStationeryLineColor } from './utils';

import { useLetterFormatting } from './hooks/useLetterFormatting';
import { useLetterScale } from './hooks/useLetterScale';
import { useLetterVoice } from './hooks/useLetterVoice';
import { useLetterWeather } from './hooks/useLetterWeather';
import { useLetterDrafts } from './hooks/useLetterDrafts';
import { useLetterPages } from './hooks/useLetterPages';
import { useLetterAI } from './hooks/useLetterAI';
import { useLetterAIMenu } from './hooks/useLetterAIMenu';
import { useCrossPageSelection, type PageSelectionRange } from './hooks/useCrossPageSelection';
import { getDocText } from './utils';

import { EditorHeader } from './components/EditorHeader';
import { EditorToolbar } from './components/EditorToolbar';
import { VoiceInputBanner } from './components/VoiceInputBanner';
import { LetterTiptapEditor } from './LetterTiptapEditor';
import { LetterPageStack } from './components/LetterPageStack';
import { AIOverlays } from './components/AIOverlays';
import { AIFloatingButton } from './components/AIFloatingButton';
import { DraftPreviewSheet } from './components/DraftPreviewSheet';
import { ToneRefineSheet } from './components/ToneRefineSheet';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  getPageSide,
  resolveWritingArea,
  MOBILE_EDITOR_FONT_SIZE_MULTIPLIER,
} from './constants';

/**
 * 활성 페이지(Tiptap 에디터 오버레이)의 크로스 선택 하이라이트.
 * LetterCanvas 내부가 아닌 오버레이에 있으므로 별도 렌더링 필요.
 */
function ActivePageSelectionHighlight({
  editor,
  selectionRange,
  scale,
}: {
  editor: Editor | null;
  selectionRange: PageSelectionRange | null;
  scale: number | null;
}) {
  const [rects, setRects] = useState<Array<{ top: number; left: number; width: number; height: number }>>([]);

  useEffect(() => {
    if (!selectionRange || !editor || editor.isDestroyed) {
      setRects([]);
      return;
    }

    const { start, end } = selectionRange;
    if (start === end) { setRects([]); return; }

    const editorDom = editor.view.dom as HTMLElement;
    const fullText = getDocText(editor.state.doc);
    const s = scale || 1;

    // 텍스트 오프셋 → ProseMirror position 변환 (단락 경계 보정)
    const textToPmPos = (offset: number): number => {
      let textLen = 0;
      const doc = editor.state.doc;
      let posBeforeChild = 0;
      for (let i = 0; i < doc.childCount; i++) {
        const child = doc.child(i);
        const contentStart = posBeforeChild + 1;
        const childTextLen = (child.textContent || '').length;
        if (i > 0) {
          if (textLen >= offset) return contentStart;
          textLen += 1; // \n separator
        }
        if (textLen + childTextLen >= offset) {
          return contentStart + Math.min(offset - textLen, childTextLen);
        }
        textLen += childTextLen;
        posBeforeChild += child.nodeSize;
      }
      return Math.max(1, doc.content.size);
    };

    try {
      const startPos = textToPmPos(Math.min(start, fullText.length));
      const endPos = textToPmPos(Math.min(end, fullText.length));

      // ProseMirror DOM에서 Range 생성
      const startCoords = editor.view.domAtPos(startPos);
      const endCoords = editor.view.domAtPos(endPos);
      const range = document.createRange();
      range.setStart(startCoords.node, startCoords.offset);
      range.setEnd(endCoords.node, endCoords.offset);

      const containerRect = editorDom.getBoundingClientRect();
      const clientRects = range.getClientRects();
      const result: Array<{ top: number; left: number; width: number; height: number }> = [];
      for (let i = 0; i < clientRects.length; i++) {
        const r = clientRects[i];
        if (r.width < 1 && r.height < 1) continue;
        result.push({
          top: (r.top - containerRect.top) / s,
          left: (r.left - containerRect.left) / s,
          width: r.width / s,
          height: r.height / s,
        });
      }
      setRects(result);
    } catch {
      setRects([]);
    }
  }, [editor, selectionRange, scale]);

  if (rects.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        pointerEvents: 'none',
        zIndex: 35,
      }}
    >
      {rects.map((rect, idx) => (
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
  );
}

interface SelectionContextMenuState {
  x: number;
  y: number;
  text: string;
}

export function LetterEditor({
  content,
  onContentChange,
  recipientName,
  recipientRelation,
  recipientFacility,
  recipientAddress,
  senderName,
  senderAddress,
  recipientPrisonerNumber,
  recipientContext,
  recipientId,
  letterHistory,
  recipientGender,
  recipientBirthDate,
  recipientFacilityType,
  recipientRegion,
  stationeryStyle,
  font: fontProp,
  onFontChange,
  fontSize: fontSizeProp,
  onFontSizeChange,
  textAlign: textAlignProp,
  onTextAlignChange,
  textColor: textColorProp,
  onTextColorChange,
  lineColor: lineColorProp,
  onLineColorChange,
  drafts = [],
  onLoadDraft,
  onDeleteDraft,
  onSaveDraft,
  showDraftActions = true,
  headerTitle,
  onResetContent,
  currentPage: externalCurrentPage,
  onCurrentPageChange,
  onStepPrev,
  onStepNext,
  canStepNext,
  onPagesChange,
}: LetterEditorProps) {
  // TODO: 편지쓰기 에디터 점검 필요.
  // 이 컴포넌트는 페이지 분할, AI 보조, 임시저장, Step 전환이 한 흐름으로 얽혀 있다.
  // 특히 ComposeContent의 비동기 검사/드래프트 복원과 함께 동작할 때 최신 입력 보존이 깨지지 않는지
  // 회귀 테스트 포인트를 여기 기준으로 다시 정리해야 한다.
  // === Refs ===
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const pageStackRef = useRef<HTMLDivElement>(null);

  // 에디터 인스턴스: state로 관리하여 변경 시 리렌더 트리거 → 모든 훅에 전파
  // ref도 병행하여 음성인식 등 비동기 콜백에서 최신 인스턴스에 접근
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const editorRef = useRef<Editor | null>(null);

  // === 서식 훅 ===
  const formatting = useLetterFormatting({
    font: fontProp,
    onFontChange,
    fontSize: fontSizeProp,
    onFontSizeChange,
    textAlign: textAlignProp,
    onTextAlignChange,
    textColor: textColorProp,
    onTextColorChange,
  });
  const [activeTextColor, setActiveTextColor] = useState(formatting.textColor);

  // 사용자가 밑줄 색상을 직접 선택할 수 있도록 (props 우선, 없으면 로컬 state)
  const [localLineColor, setLocalLineColor] = useState<string | null>(null);
  const customLineColor = lineColorProp !== undefined ? lineColorProp : localLineColor;
  const [selectionContextMenu, setSelectionContextMenu] = useState<SelectionContextMenuState | null>(null);
  const [editorOverlayPosition, setEditorOverlayPosition] = useState<{ top: number; left: number } | null>(null);

  // === 스케일/레이아웃 훅 ===
  const scaleState = useLetterScale(containerRef);
  const displayFontSize = scaleState.isMobile
    ? Math.round(formatting.fontSize * MOBILE_EDITOR_FONT_SIZE_MULTIPLIER * 10) / 10
    : formatting.fontSize;
  const initialPageSide = getPageSide(externalCurrentPage ?? 0);
  const initialWritingArea = resolveWritingArea(stationeryStyle, initialPageSide);
  const initialLineHeight = getLineHeight(formatting.fontSize, stationeryStyle, initialPageSide);
  const initialTotalLines = getTotalLines(initialLineHeight, stationeryStyle, initialPageSide);

  const getPageLayout = useCallback((pageIndex: number) => {
    const side = getPageSide(pageIndex);
    const pageWritingArea = resolveWritingArea(stationeryStyle, side);
    const pageLineHeight = getLineHeight(formatting.fontSize, stationeryStyle, side);

    return {
      writingArea: pageWritingArea,
      lineHeight: pageLineHeight,
      totalLines: getTotalLines(pageLineHeight, stationeryStyle, side),
    };
  }, [formatting.fontSize, stationeryStyle]);

  // === 모바일 키보드 감지 ===
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  useEffect(() => {
    if (!scaleState.isMobile || typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;
    const handleResize = () => {
      setIsKeyboardOpen(vv.height < window.innerHeight * 0.75);
    };
    vv.addEventListener('resize', handleResize);
    return () => vv.removeEventListener('resize', handleResize);
  }, [scaleState.isMobile]);

  // === 페이지 관리 훅 ===
  const pageState = useLetterPages({
    content,
    onContentChange,
    totalLines: initialTotalLines,
    lineHeight: initialLineHeight,
    editorWidth: initialWritingArea.width,
    getPageLayout,
    fontSize: formatting.fontSize,
    font: formatting.font,
    editor: editorInstance,
    externalCurrentPage,
    onCurrentPageChange,
  });
  const currentPageSide = getPageSide(pageState.currentPage);
  const writingArea = resolveWritingArea(stationeryStyle, currentPageSide);
  const lineHeight = getLineHeight(formatting.fontSize, stationeryStyle, currentPageSide);
  const totalLines = getTotalLines(lineHeight, stationeryStyle, currentPageSide);
  const defaultLineColor = getStationeryLineColor(stationeryStyle, currentPageSide);
  const lineColor = customLineColor ?? defaultLineColor;

  // 에디터 페이지 분할 결과를 부모에 전달 (미리보기에서 재분할 없이 사용)
  useEffect(() => {
    if (onPagesChange) {
      onPagesChange(pageState.pages.map((p) => p.content));
    }
  }, [pageState.pages, onPagesChange]);

  useEffect(() => {
    if (!editorInstance || editorInstance.isDestroyed) {
      setActiveTextColor(formatting.textColor);
      return;
    }

    const syncActiveTextColor = () => {
      const color = editorInstance.getAttributes('textStyle').color;
      setActiveTextColor(typeof color === 'string' && color ? color : formatting.textColor);
    };

    syncActiveTextColor();
    editorInstance.on('selectionUpdate', syncActiveTextColor);
    editorInstance.on('transaction', syncActiveTextColor);

    return () => {
      editorInstance.off('selectionUpdate', syncActiveTextColor);
      editorInstance.off('transaction', syncActiveTextColor);
    };
  }, [editorInstance, formatting.textColor]);

  // === 크로스 페이지 선택 훅 ===
  const crossPageSelection = useCrossPageSelection({
    pages: pageState.pages,
    currentPage: pageState.currentPage,
    editor: editorInstance,
    scale: scaleState.scale,
  });

  // === AI 메뉴 훅 (AI 기능 훅보다 먼저 초기화 — onDraftAccepted 콜백에서 참조) ===
  const aiMenu = useLetterAIMenu({
    editor: editorInstance,
    recipientName,
    recipientRelation,
    recipientFacility,
    recipientAddress,
    recipientPrisonerNumber,
    recipientContext,
    recipientId,
    letterHistory,
    senderName,
    saveCurrentPageContent: pageState.saveCurrentPageContent,
    pages: pageState.pages,
  });

  // === AI 기능 훅 ===
  const ai = useLetterAI({
    editor: editorInstance,
    pages: pageState.pages,
    currentPage: pageState.currentPage,
    totalLines,
    recipientName,
    recipientRelation,
    recipientFacility,
    recipientAddress,
    recipientPrisonerNumber,
    recipientContext,
    recipientId,
    letterHistory,
    saveCurrentPageContent: pageState.saveCurrentPageContent,
    replaceAllContent: pageState.replaceAllContent,
    savedIntroText: aiMenu.savedIntroText,
    onRefineComplete: () => {
      aiMenu.setSelectedSection('end');
    },
  });

  // === AI 프로필 ===
  const { saveProfile: saveAIProfile } = useRecipientAIProfile(recipientId ?? null);

  // === 음성 입력 훅 ===
  const voice = useLetterVoice({
    onTranscript: (text) => {
      const editor = editorRef.current;
      if (editor && !editor.isDestroyed) {
        editor.chain().focus('end').insertContent(' ' + text).run();
        pageState.saveCurrentPageContent();
      }
    },
  });

  // === 날씨 훅 ===
  const recipientWeather = useLetterWeather(recipientAddress, recipientFacility);

  // === 임시저장 훅 ===
  useLetterDrafts({
    pages: pageState.pages,
    onSaveDraft,
  });

  const saveUndoSnapshot = useCallback(() => {
    ai.previousPagesRef.current = pageState.pages.map((page) => ({ ...page }));
    ai.setCanUndo(true);
  }, [ai, pageState.pages]);

  // === 크로스 페이지 선택 시 복사/잘라내기/삭제/키보드 처리 ===
  useEffect(() => {
    if (!crossPageSelection.isActive) return;

    const handleCopy = (e: ClipboardEvent) => {
      const text = crossPageSelection.getSelectedText();
      if (!text) return;
      e.preventDefault();
      e.clipboardData?.setData('text/plain', text);
      toast.success('선택된 텍스트가 복사되었습니다');
    };

    const handleCut = (e: ClipboardEvent) => {
      const text = crossPageSelection.getSelectedText();
      if (!text) return;
      e.preventDefault();
      e.clipboardData?.setData('text/plain', text);

      saveUndoSnapshot();
      const remaining = crossPageSelection.deleteSelectedText();
      crossPageSelection.clearSelection();
      pageState.replaceAllContent(remaining);
      toast.success('선택된 텍스트가 잘라내졌습니다');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // 수식 키만 누른 경우 무시 (Ctrl, Shift, Alt, Meta)
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.key === 'c') return;
      if (isMod && e.key === 'x') return;
      if (isMod && e.key.toLowerCase() === 'z') return;
      if (isMod && e.key === 'a') {
        crossPageSelection.clearSelection();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        crossPageSelection.clearSelection();
        return;
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        e.stopPropagation();
        saveUndoSnapshot();
        const remaining = crossPageSelection.deleteSelectedText();
        crossPageSelection.clearSelection();
        pageState.replaceAllContent(remaining);
        return;
      }
      // 일반 문자 입력: 선택 영역을 입력 문자로 교체 (일반 에디터의 "선택 후 타이핑 → 교체" 동작)
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        saveUndoSnapshot();
        const { content, cursorOffset } = crossPageSelection.replaceSelectedText(e.key);
        crossPageSelection.clearSelection();
        pageState.replaceAllContent(content, { globalCursorOffset: cursorOffset });
        return;
      }
      crossPageSelection.clearSelection();
    };

    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('cut', handleCut, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('cut', handleCut, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [crossPageSelection.isActive, crossPageSelection, pageState, saveUndoSnapshot]);

  const getSerializedPagesText = useCallback(() => {
    return pageState.pages.reduce((result, page, index) => {
      if (index === 0) return page.content;
      return result + (page.continuesFromPrevious ? '' : '\n') + page.content;
    }, '');
  }, [pageState.pages]);

  const getContextMenuSelectionText = useCallback(() => {
    return pageState.allPagesSelected
      ? getSerializedPagesText()
      : crossPageSelection.getSelectedText();
  }, [crossPageSelection, getSerializedPagesText, pageState.allPagesSelected]);

  const getSelectionReplacementResult = useCallback((insertedText: string) => {
    if (pageState.allPagesSelected) {
      return {
        content: insertedText,
        cursorOffset: insertedText.length,
      };
    }

    if (!crossPageSelection.isActive) return null;
    return crossPageSelection.replaceSelectedText(insertedText);
  }, [crossPageSelection, pageState.allPagesSelected]);

  const closeSelectionContextMenu = useCallback(() => {
    setSelectionContextMenu(null);
  }, []);

  const copyTextToClipboard = useCallback(async (text: string) => {
    if (!text) return false;

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, text.length);
        const copied = document.execCommand('copy');
        document.body.removeChild(textarea);
        return copied;
      } catch {
        return false;
      }
    }
  }, []);

  const handleSelectionContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const isEditorSurface = target.closest('[data-page-index], .letter-tiptap-content');
    if (!isEditorSurface) return;

    const selectedText = getContextMenuSelectionText();

    if (!selectedText.trim()) return;

    event.preventDefault();
    event.stopPropagation();

    const menuWidth = 164;
    const menuHeight = 56;
    setSelectionContextMenu({
      x: Math.min(event.clientX, window.innerWidth - menuWidth),
      y: Math.min(event.clientY, window.innerHeight - menuHeight),
      text: selectedText,
    });
  }, [getContextMenuSelectionText]);

  const handleCopyFromContextMenu = useCallback(async () => {
    if (!selectionContextMenu?.text) return;

    const copied = await copyTextToClipboard(selectionContextMenu.text);
    if (copied) {
      toast.success('선택된 텍스트가 복사되었습니다');
    } else {
      toast.error('복사에 실패했습니다');
    }
    closeSelectionContextMenu();
  }, [closeSelectionContextMenu, copyTextToClipboard, selectionContextMenu]);

  const handlePasteFromContextMenu = useCallback(async () => {
    closeSelectionContextMenu();

    if (!navigator.clipboard?.readText) {
      toast.error('브라우저가 붙여넣기를 지원하지 않습니다');
      return;
    }

    try {
      const pastedText = await navigator.clipboard.readText();
      const replacement = getSelectionReplacementResult(pastedText);

      if (!replacement) {
        toast.error('붙여넣을 선택 영역이 없습니다');
        return;
      }

      if (!pageState.allPagesSelected) {
        crossPageSelection.clearSelection();
      }

      saveUndoSnapshot();
      pageState.replaceAllContent(replacement.content, {
        globalCursorOffset: replacement.cursorOffset,
      });
      toast.success('선택한 위치에 붙여넣었습니다');
    } catch (error) {
      console.error('붙여넣기 실패:', error);
      toast.error('붙여넣기에 실패했습니다');
    }
  }, [closeSelectionContextMenu, crossPageSelection, getSelectionReplacementResult, pageState]);

  const handleDeleteFromContextMenu = useCallback(() => {
    closeSelectionContextMenu();

    const replacement = getSelectionReplacementResult('');
    if (!replacement) return;

    if (!pageState.allPagesSelected) {
      crossPageSelection.clearSelection();
    }

    saveUndoSnapshot();
    pageState.replaceAllContent(replacement.content, {
      globalCursorOffset: replacement.cursorOffset,
    });
    toast.success('선택한 내용을 삭제했습니다');
  }, [closeSelectionContextMenu, crossPageSelection, getSelectionReplacementResult, pageState, saveUndoSnapshot]);

  const handleRefineFromContextMenu = useCallback(async () => {
    const selectedText = getContextMenuSelectionText().trim();
    closeSelectionContextMenu();

    if (!selectedText) {
      toast.error('다듬을 텍스트를 먼저 선택해주세요');
      return;
    }

    const previousPages = pageState.pages.map((page) => ({ ...page }));
    const loadingToast = toast.loading('AI가 문장을 다듬는 중이에요');

    try {
      const response = await apiFetch('/api/v1/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          context: getSerializedPagesText(),
          recipientRelation,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(typeof data.error === 'string' ? data.error : 'AI 다듬기에 실패했습니다');
      }

      let refined = '';
      if (isSSEResponse(response)) {
        refined = await readSSEStream(response, () => {});
      } else {
        const result = await response.json().catch(() => ({}));
        refined = typeof result.refined === 'string'
          ? result.refined
          : typeof result.data === 'string'
            ? result.data
            : '';
      }

      const replacement = getSelectionReplacementResult(refined || selectedText);
      if (!replacement) {
        throw new Error('다듬을 선택 영역을 찾지 못했습니다');
      }

      ai.previousPagesRef.current = previousPages;
      ai.setCanUndo(true);

      if (!pageState.allPagesSelected) {
        crossPageSelection.clearSelection();
      }

      pageState.replaceAllContent(replacement.content, {
        globalCursorOffset: replacement.cursorOffset,
      });

      toast.dismiss(loadingToast);
      toast.success('선택한 문장을 다듬었습니다');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('컨텍스트 메뉴 AI 다듬기 실패:', error);
      toast.error(error instanceof Error ? error.message : 'AI 다듬기에 실패했습니다');
    }
  }, [
    ai,
    closeSelectionContextMenu,
    crossPageSelection,
    getContextMenuSelectionText,
    getSelectionReplacementResult,
    getSerializedPagesText,
    pageState,
    recipientRelation,
  ]);

  useEffect(() => {
    const handleUndoKeyDown = (event: KeyboardEvent) => {
      const isMod = event.ctrlKey || event.metaKey;
      if (!isMod || event.altKey || event.shiftKey) return;
      if (event.key.toLowerCase() !== 'z') return;
      if (!ai.canUndo) return;

      event.preventDefault();
      event.stopPropagation();
      closeSelectionContextMenu();
      crossPageSelection.clearSelection();
      ai.handleUndoAI();
    };

    document.addEventListener('keydown', handleUndoKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleUndoKeyDown, true);
    };
  }, [ai.canUndo, ai.handleUndoAI, closeSelectionContextMenu, crossPageSelection]);

  useEffect(() => {
    if (!selectionContextMenu) return;

    const handlePointerDown = () => {
      closeSelectionContextMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSelectionContextMenu();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', closeSelectionContextMenu);
    window.addEventListener('scroll', closeSelectionContextMenu, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', closeSelectionContextMenu);
      window.removeEventListener('scroll', closeSelectionContextMenu, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeSelectionContextMenu, selectionContextMenu]);

  useEffect(() => {
    if (pageState.allPagesSelected || crossPageSelection.isActive) return;
    closeSelectionContextMenu();
  }, [closeSelectionContextMenu, crossPageSelection.isActive, pageState.allPagesSelected]);

  // === 폰트 크기/종류 변경 시 페이지 재분할 ===
  const prevFontKeyRef = useRef(`${formatting.fontSize}-${formatting.font}`);
  useEffect(() => {
    const fontKey = `${formatting.fontSize}-${formatting.font}`;
    if (prevFontKeyRef.current === fontKey) return;
    prevFontKeyRef.current = fontKey;
    // CSS 스타일 적용 후 재분할
    requestAnimationFrame(() => {
      pageState.reflowPages();
    });
  }, [formatting.fontSize, formatting.font, pageState.reflowPages]);

  // === 드롭다운 상태 ===
  const [showDraftDropdown, setShowDraftDropdown] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);
  const [showLineColorDropdown, setShowLineColorDropdown] = useState(false);

  const closeAllDropdowns = useCallback(() => {
    setShowDraftDropdown(false);
    setShowFontDropdown(false);
    setShowColorDropdown(false);
    setShowEmojiDropdown(false);
    setShowLineColorDropdown(false);
  }, []);

  // 외부 클릭/터치 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Element;
      if (!target.closest('.dropdown')) {
        closeAllDropdowns();
      }
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [closeAllDropdowns]);

  // === 인라인 다듬기 버튼 위치 (마지막 줄 아래) ===
  const [inlineRefineTop, setInlineRefineTop] = useState<number | null>(null);
  const inlineRefineButtonHeight = 32;
  const inlineRefineBottomMargin = 8;
  const inlineRefineFooterReservedHeight = 56;

  const updateInlineRefinePosition = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || editor.isDestroyed || !canvasRef.current) return;
    try {
      const endPos = editor.state.doc.content.size;
      const coords = editor.view.coordsAtPos(endPos);
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const scale = scaleState.scale ?? 1;
      const contentBottom = (coords.bottom - canvasRect.top) / scale;
      const currentLineIndex = Math.max(
        0,
        Math.min(totalLines - 1, Math.ceil((contentBottom - writingArea.top) / lineHeight) - 1)
      );
      const lineBottom = writingArea.top + (currentLineIndex + 1) * lineHeight;
      const footerPadding = CANVAS_HEIGHT - writingArea.top - writingArea.height;
      const desiredTop = lineBottom + inlineRefineBottomMargin;
      const maxTop = CANVAS_HEIGHT
        - Math.min(inlineRefineFooterReservedHeight, Math.max(40, footerPadding / 2))
        - inlineRefineButtonHeight;

      setInlineRefineTop(Math.min(desiredTop, maxTop));
    } catch {
      setInlineRefineTop(null);
    }
  }, [
    inlineRefineBottomMargin,
    inlineRefineButtonHeight,
    inlineRefineFooterReservedHeight,
    lineHeight,
    scaleState.scale,
    totalLines,
    writingArea,
  ]);

  // === 에디터 준비 콜백 ===
  const handleEditorReady = useCallback((editor: Editor) => {
    editorRef.current = editor;
    setEditorInstance(editor);
    requestAnimationFrame(updateInlineRefinePosition);
  }, [updateInlineRefinePosition]);

  // === 에디터 소멸 콜백 ===
  const handleEditorDestroy = useCallback(() => {
    editorRef.current = null;
    setEditorInstance(null);
  }, []);

  // === 에디터 내용 업데이트 콜백 ===
  const handleContentUpdate = useCallback(
    (text: string) => {
      // 인라인 다듬기 버튼 표시 여부 체크
      ai.checkInlineRefineEligibility(text);
      // 마지막 줄 아래 위치 계산
      requestAnimationFrame(updateInlineRefinePosition);
    },
    [ai.checkInlineRefineEligibility, updateInlineRefinePosition]
  );

  // === 이모지 삽입 ===
  const handleInsertEmoji = useCallback(
    (emoji: string) => {
      if (editorInstance && !editorInstance.isDestroyed) {
        editorInstance.chain().focus().insertContent(emoji).run();
        pageState.saveCurrentPageContent();
      }
      setShowEmojiDropdown(false);
    },
    [editorInstance, pageState]
  );

  // === 색상 변경 ===
  const handleColorChange = useCallback(
    (color: string) => {
      setActiveTextColor(color);
      if (editorInstance && !editorInstance.isDestroyed) {
        const hasSelection = !editorInstance.state.selection.empty;
        if (!hasSelection) {
          formatting.setTextColor(color);
        }
        editorInstance.chain().focus().setColor(color).run();
      } else {
        formatting.setTextColor(color);
      }
      setShowColorDropdown(false);
    },
    [editorInstance, formatting]
  );

  // === 밑줄 색상 변경 ===
  const handleLineColorChange = useCallback(
    (color: string) => {
      if (onLineColorChange) {
        onLineColorChange(color);
      } else {
        setLocalLineColor(color);
      }
      setShowLineColorDropdown(false);
    },
    [onLineColorChange]
  );

  // === 폰트 변경 ===
  const handleFontChange = useCallback(
    (key: string) => {
      formatting.setFont(key);
      setShowFontDropdown(false);
    },
    [formatting]
  );

  // === 페이지 진입 시 자동 AI 초안 생성 → 에디터에 삽입 ===
  const autoGenerateTriggeredRef = useRef(false);
  useEffect(() => {
    if (!editorInstance || autoGenerateTriggeredRef.current) return;
    if (!recipientId) return;

    // 이미 내용이 있으면 초안 생성 불필요
    const hasContent = pageState.pages.some((p) => p.content.trim().length > 0);
    if (hasContent) {
      autoGenerateTriggeredRef.current = true;
      return;
    }

    autoGenerateTriggeredRef.current = true;

    const generateAndInsert = async () => {
      try {
        const response = await apiFetch('/api/v1/ai/letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: 'section',
            section: 'intro',
            recipientName,
            recipientRelation,
            recipientFacility,
            recipientAddress,
            recipientPrisonerNumber,
            recipientContext,
            recipientId,
            letterHistory,
          }),
        });

        if (!response.ok) throw new Error('초안 생성 실패');

        const result = await response.json();
        const generatedText = result.data || '';

        if (generatedText && editorInstance && !editorInstance.isDestroyed) {
          // 사용자가 이미 타이핑했으면 삽입하지 않음
          const currentText = editorInstance.getText().trim();
          if (currentText.length > 0) return;

          const greeting = recipientName && recipientRelation
            ? getLetterGreeting(recipientName, recipientRelation)
            : '';
          const introContent = greeting
            ? `${greeting}\n\n\n\n${generatedText}`
            : generatedText;

          const html = `<p>${introContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')}</p><p></p><p></p>`;
          editorInstance.commands.setContent(html);
          pageState.saveCurrentPageContent();
          editorInstance.commands.focus('end');
          aiMenu.setSavedIntroText(introContent);
        }
      } catch (err) {
        console.error('자동 초안 생성 실패:', err);
      }
    };

    generateAndInsert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorInstance, recipientId]);

  // === 온보딩 완료 핸들러 ===
  const handleOnboardingComplete = useCallback(
    async (
      profile: RecipientAIProfile,
      letterParts?: { intro: string; closing: string; bodyGuide: string }
    ) => {
      try {
        await saveAIProfile({
          recipientId: profile.recipientId,
          speechStyle: profile.speechStyle,
          tone: profile.tone,
          context: profile.context || '',
          episodes: profile.episodes || '',
          emotions: profile.emotions || '',
          chatHistory: profile.chatHistory,
        });
      } catch (err) {
        console.error('AI 프로필 저장 실패:', err);
      }
      ai.setShowOnboarding(false);

      // 프리셋 모드: 호칭 + 서문 + 본문 가이드 + 마무리 조합
      if (letterParts) {
        const parts: string[] = [];
        if (letterParts.intro) {
          const greeting = recipientName && recipientRelation
            ? getLetterGreeting(recipientName, recipientRelation)
            : '';
          parts.push(greeting ? `${greeting}\n\n\n\n${letterParts.intro}` : letterParts.intro);
        }
        if (letterParts.bodyGuide) parts.push(`\n\n[✍️ ${letterParts.bodyGuide}]\n\n`);
        if (letterParts.closing) parts.push(letterParts.closing);

        const draftContent = parts.join('\n\n');
        if (draftContent.trim()) {
          ai.setDraftText(draftContent);
          ai.setShowDraftPreview(true);
        }
        return;
      }

      // 기존 대화형 모드 폴백
      const existingContent = pageState.pages
        .map((p) => p.content)
        .filter((c) => c.trim())
        .join('\n\n');
      ai.setIsGeneratingDraft(true);
      ai.setGeneratingLabel(
        existingContent ? 'AI가 이어서 쓰고 있어요...' : 'AI가 편지 초안을 작성하고 있어요...'
      );
      try {
        const response = await apiFetch('/api/v1/ai/letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: 'section',
            section: existingContent ? 'middle' : 'intro',
            currentContent: existingContent || undefined,
            recipientName,
            recipientRelation,
            recipientFacility,
            recipientAddress,
            recipientPrisonerNumber,
            recipientContext,
            recipientId,
            letterHistory,
            userInput: `말투: ${profile.speechStyle}, 톤: ${profile.tone}, 맥락: ${profile.context}, 에피소드: ${profile.episodes}, 감정: ${profile.emotions}`,
          }),
        });

        const result = await response.json();
        const generatedText = result.data || '';

        if (generatedText) {
          ai.setDraftText(generatedText);
          ai.setShowDraftPreview(true);
        }
      } catch (err) {
        console.error('초안 생성 실패:', err);
        toast.error('초안 생성에 실패했습니다');
      } finally {
        ai.setIsGeneratingDraft(false);
        ai.setGeneratingLabel('');
      }
    },
    [
      ai,
      pageState.pages,
      recipientName,
      recipientRelation,
      recipientFacility,
      recipientAddress,
      recipientPrisonerNumber,
      recipientContext,
      recipientId,
      letterHistory,
      saveAIProfile,
    ]
  );

  // === AI 메뉴 토글 ===
  const handleToggleAIMenu = useCallback(() => {
    aiMenu.setShowAIMenu((prev) => !prev);
    aiMenu.setShowAITooltip(false);
  }, [aiMenu]);

  // === 초안 수락 + 중간 탭 자동 전환 ===
  const handleAcceptDraftAndSwitchTab = useCallback(() => {
    ai.handleAcceptDraft();
    aiMenu.setShowAIMenu(true);
    aiMenu.setSelectedSection('middle');
  }, [ai.handleAcceptDraft, aiMenu]);

  // === 페이지 내 에디터 + 오버레이 렌더링 ===
  const renderCurrentPageContent = useCallback(() => {
    return (
      <>
        <LetterTiptapEditor
          key={`${writingArea.left}-${writingArea.top}-${writingArea.width}-${writingArea.height}-${totalLines}-${lineHeight}`}
          initialContent={pageState.pages[pageState.currentPage]?.content || ''}
          font={formatting.font}
          fontSize={displayFontSize}
          lineHeight={lineHeight}
          textAlign={formatting.textAlign}
          textColor={formatting.textColor}
          totalLines={totalLines}
          pageIndex={pageState.currentPage}
          stationeryStyle={stationeryStyle}
          focusPosition={pageState.focusPosition}
          focusOffset={pageState.focusOffset}
          focusClientPoint={pageState.focusClientPoint}
          onFocusRestored={pageState.clearFocusRestore}
          onEditorReady={handleEditorReady}
          onEditorDestroy={handleEditorDestroy}
          onContentUpdate={handleContentUpdate}
          onEnterAtLastLine={pageState.handleEnterAtLastLine}
          onBackspaceAtStart={pageState.handleBackspaceAtStart}
          onLineOverflow={pageState.handleLineOverflow}
          onPaste={pageState.handlePaste}
          onSelectAll={pageState.handleSelectAll}
          showRefineGuide={ai.showInlineRefineButton}
        />
        <AIOverlays
          scale={scaleState.scale}
          showContinueButton={ai.showContinueButton}
          continuePosition={ai.continuePosition}
          isContinuing={ai.isContinuing}
          showContinueSuggestion={ai.showContinueSuggestion}
          onContinue={ai.handleContinue}
          onDifferent={ai.handleDifferent}
          onInsertSuggestion={ai.handleInsertSuggestion}
          showRefineButton={ai.showRefineButton}
          refinePosition={ai.refinePosition}
          isRefining={ai.isRefining}
          showRefineSuggestion={ai.showRefineSuggestion}
          refinedText={ai.refinedText}
          onRefine={ai.handleRefine}
          onApplyRefine={ai.handleApplyRefine}
          onCancelRefine={ai.handleCancelRefine}
          showInlineRefineButton={ai.showInlineRefineButton}
          onInlineRefine={ai.handleInlineRefine}
          inlineRefineTop={inlineRefineTop}
          isInlineRefining={ai.isInlineRefining}
          canUndo={ai.canUndo}
          onUndoAI={ai.handleUndoAI}
          isGeneratingStart={ai.isGeneratingStart}
          generatingLabel={ai.generatingLabel}
        />
      </>
    );
  }, [
    pageState,
    formatting,
    displayFontSize,
    lineHeight,
    totalLines,
    handleEditorReady,
    handleEditorDestroy,
    handleContentUpdate,
    scaleState.scale,
    ai,
  ]);

  useLayoutEffect(() => {
    if (!pageStackRef.current || !canvasRef.current || scaleState.scale === null) {
      setEditorOverlayPosition(null);
      return;
    }

    const updateOverlayPosition = () => {
      if (!pageStackRef.current || !canvasRef.current) return;

      const stackRect = pageStackRef.current.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();

      setEditorOverlayPosition({
        top: canvasRect.top - stackRect.top,
        left: canvasRect.left - stackRect.left,
      });
    };

    updateOverlayPosition();
    const frameId = requestAnimationFrame(updateOverlayPosition);

    return () => cancelAnimationFrame(frameId);
  }, [pageState.currentPage, pageState.pages, scaleState.scale, scaleState.pinchZoom]);

  return (
    <div className="relative flex flex-col h-full bg-neutral-50 overflow-hidden">
      {/* 헤더 */}
      <EditorHeader
        drafts={drafts}
        showDraftActions={showDraftActions}
        showDraftDropdown={showDraftDropdown}
        onToggleDraftDropdown={() => setShowDraftDropdown((v) => !v)}
        onLoadDraft={onLoadDraft}
        onDeleteDraft={onDeleteDraft}
        recipientWeather={recipientWeather}
        recipientAddress={recipientAddress}
        recipientFacility={recipientFacility}
        title={headerTitle}
      />

      {/* 서식 도구 모음 */}
      <EditorToolbar
        editor={editorInstance}
        isMobile={scaleState.isMobile}
        font={formatting.font}
        fontSizeKey={formatting.fontSizeKey}
        textAlign={formatting.textAlign}
        textColor={activeTextColor}
        showFontDropdown={showFontDropdown}
        showColorDropdown={showColorDropdown}
        showEmojiDropdown={showEmojiDropdown}
        onToggleFontDropdown={() => setShowFontDropdown((v) => !v)}
        onToggleColorDropdown={() => setShowColorDropdown((v) => !v)}
        onToggleEmojiDropdown={() => setShowEmojiDropdown((v) => !v)}
        onCloseAllDropdowns={closeAllDropdowns}
        onFontChange={handleFontChange}
        onFontSizeChange={formatting.setFontSize}
        onTextAlignChange={formatting.setTextAlign}
        onColorChange={handleColorChange}
        onInsertEmoji={handleInsertEmoji}
        lineColor={lineColor}
        showLineColorDropdown={showLineColorDropdown}
        onToggleLineColorDropdown={() => setShowLineColorDropdown((v) => !v)}
        onLineColorChange={handleLineColorChange}
        isSpeechSupported={voice.isSpeechSupported}
        isListening={voice.isListening}
        onVoiceToggle={voice.handleVoiceToggle}
      />

      {/* 음성 입력 배너 */}
      <VoiceInputBanner
        isListening={voice.isListening}
        interimTranscript={voice.interimTranscript}
        onStop={voice.handleVoiceToggle}
      />

      {/* 편지 캔버스 영역 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        onContextMenu={handleSelectionContextMenu}
      >
        <div
          className="flex justify-center py-6"
          style={{
            transform: `scale(${scaleState.pinchZoom})`,
            transformOrigin: `${scaleState.zoomOrigin.x}% ${scaleState.zoomOrigin.y}%`,
          }}
        >
          {scaleState.scale !== null && (
            <div ref={pageStackRef} className="relative">
              <LetterPageStack
                pages={pageState.pages}
                currentPage={pageState.currentPage}
                stationeryStyle={stationeryStyle}
                font={formatting.font}
                fontSize={formatting.fontSize}
                textAlign={formatting.textAlign}
                textColor={formatting.textColor}
                lineColorOverride={customLineColor}
                scale={scaleState.scale}
                onPageClick={pageState.handlePageChange}
                canvasRef={canvasRef}
                renderCurrentPageContent={() => null}
                allPagesSelected={pageState.allPagesSelected}
                getPageSelectionRange={crossPageSelection.getPageSelectionRange}
                onTextDivRef={crossPageSelection.setPageTextRef}
                onCrossPagePointerDown={crossPageSelection.handlePointerDown}
                isCrossPageSelectionActive={crossPageSelection.isActive}
              />

              {editorOverlayPosition && (
                <div
                  className="absolute z-30"
                  style={{
                    top: editorOverlayPosition.top,
                    left: editorOverlayPosition.left,
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    transform: `scale(${scaleState.scale})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    className="relative h-full w-full"
                    style={{ pointerEvents: 'auto' }}
                    onPointerDown={(e) => crossPageSelection.handlePointerDown(pageState.currentPage, e)}
                  >
                    {renderCurrentPageContent()}
                  </div>
                  {/* 활성 페이지 크로스 선택 하이라이트 (에디터 오버레이에서 직접 렌더링) */}
                  <ActivePageSelectionHighlight
                    editor={editorInstance}
                    selectionRange={crossPageSelection.getPageSelectionRange(pageState.currentPage)}
                    scale={scaleState.scale}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI 플로팅 버튼 + 메뉴 */}
      <AIFloatingButton
        floatingButtonLeft={scaleState.floatingButtonLeft}
        isMobile={scaleState.isMobile}
        isKeyboardOpen={isKeyboardOpen}
        showAIMenu={aiMenu.showAIMenu}
        showAITooltip={aiMenu.showAITooltip}
        selectedSection={aiMenu.selectedSection}
        recipientId={recipientId}
        pages={pageState.pages}
        onToggleAIMenu={handleToggleAIMenu}
        onSectionChange={aiMenu.setSelectedSection}
        onShowOnboarding={() => {
          aiMenu.setShowAIMenu(false);
          ai.setShowOnboarding(true);
        }}
        introOptions={aiMenu.introOptions}
        isLoadingIntroOptions={aiMenu.isLoadingIntroOptions}
        onLoadIntroOptions={aiMenu.loadIntroOptions}
        onIntroOptionSelect={aiMenu.handleIntroOptionSelect}
        middleChatInput={aiMenu.middleChatInput}
        onMiddleChatInputChange={aiMenu.setMiddleChatInput}
        middleExpandedPreview={aiMenu.middleExpandedPreview}
        isExpandingMiddle={aiMenu.isExpandingMiddle}
        onMiddleExpand={aiMenu.handleMiddleExpand}
        onMiddleInsert={aiMenu.handleMiddleInsert}
        onMiddleRetry={aiMenu.handleMiddleRetry}
        conclusionOptions={aiMenu.conclusionOptions}
        isLoadingConclusionOptions={aiMenu.isLoadingConclusionOptions}
        onLoadConclusionOptions={aiMenu.loadConclusionOptions}
        onConclusionOptionSelect={aiMenu.handleConclusionOptionSelect}
        showConclusionCustomInput={aiMenu.showConclusionCustomInput}
        onToggleConclusionCustomInput={() => aiMenu.setShowConclusionCustomInput((v) => !v)}
        conclusionCustomInput={aiMenu.conclusionCustomInput}
        onConclusionCustomInputChange={aiMenu.setConclusionCustomInput}
        isExpandingConclusion={aiMenu.isExpandingConclusion}
        onConclusionCustomExpand={aiMenu.handleConclusionCustomExpand}
      />

      {/* AI 온보딩 바텀시트 */}
      <AnimatePresence>
        {ai.showOnboarding && recipientId && (
          <RecipientOnboarding
            recipientId={recipientId}
            recipientName={recipientName || ''}
            recipientRelation={recipientRelation || ''}
            recipientFacility={recipientFacility}
            letterHistory={letterHistory}
            currentContent={pageState.pages
              .map((p) => p.content)
              .filter((c) => c.trim())
              .join('\n\n')}
            onComplete={handleOnboardingComplete}
            onSkip={() => ai.setShowOnboarding(false)}
          />
        )}
      </AnimatePresence>

      {/* 초안 생성 중 로딩 */}
      {ai.isGeneratingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-2xl">🍊</span>
            </div>
            <p className="text-sm text-neutral-600">
              {ai.generatingLabel || 'AI가 편지 초안을 작성하고 있어요...'}
            </p>
            <div className="flex gap-1">
              <span
                className="w-2 h-2 bg-orange-300 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-2 h-2 bg-orange-300 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-2 h-2 bg-orange-300 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 초안 미세 튜닝 바텀시트 */}
      <DraftPreviewSheet
        isOpen={ai.showDraftPreview}
        draftText={ai.draftText}
        onDraftTextChange={ai.setDraftText}
        onAccept={handleAcceptDraftAndSwitchTab}
        recipientName={recipientName}
        recipientRelation={recipientRelation}
        recipientFacility={recipientFacility}
        recipientId={recipientId}
      />

      {/* 말투 선택 다듬기 바텀시트 */}
      <ToneRefineSheet
        isOpen={ai.showToneRefineSheet}
        onClose={() => ai.setShowToneRefineSheet(false)}
        onSelectTone={ai.handleInlineToneRefine}
      />
      {selectionContextMenu && (
        <div
          className="fixed z-50 min-w-40 rounded-xl border border-neutral-200 bg-white py-1.5 shadow-xl"
          style={{ top: selectionContextMenu.y, left: selectionContextMenu.x }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="flex w-full items-center px-4 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
            onClick={handleCopyFromContextMenu}
          >
            복사
          </button>
          <button
            type="button"
            className="flex w-full items-center px-4 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
            onClick={handlePasteFromContextMenu}
          >
            붙여넣기
          </button>
          <button
            type="button"
            className="flex w-full items-center px-4 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
            onClick={handleRefineFromContextMenu}
          >
            AI로 다듬기
          </button>
          <button
            type="button"
            className="flex w-full items-center px-4 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
            onClick={handleDeleteFromContextMenu}
          >
            선택 삭제
          </button>
        </div>
      )}
    </div>
  );
}
