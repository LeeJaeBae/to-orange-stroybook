'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { Color } from '@tiptap/extension-color';
import { TextStyle as TextStyleExt } from '@tiptap/extension-text-style';
import { useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { AutocompleteExtension } from './extensions/AutocompleteExtension';
import { LetterPageExtension } from './extensions/LetterPageExtension';
import { RefineHighlightExtension } from './extensions/RefineHighlightExtension';
import {
  FONT_FAMILIES,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  getPageSide,
  resolveWritingArea,
  type LetterLayoutStyleLike,
} from './constants';
import { getEditorText, textToHtml } from './utils';
import type { TextAlign as TextAlignType } from './types';

interface LetterTiptapEditorProps {
  initialContent: string;
  font: string;
  fontSize: number;
  lineHeight: number;
  textAlign: TextAlignType;
  textColor: string;
  totalLines: number;
  pageIndex?: number;
  stationeryStyle?: LetterLayoutStyleLike | null;
  onEditorReady: (editor: Editor) => void;
  onEditorDestroy?: () => void;
  onContentUpdate: (text: string) => void;
  onEnterAtLastLine: () => void;
  onBackspaceAtStart: () => void;
  onLineOverflow: (text: string) => void;
  onPaste: (payload: { fullText: string; selectionStart: number; selectionEnd: number; pastedText: string }) => void;
  onSelectAll: () => void;
  focusPosition?: 'start' | 'end';
  focusOffset?: number | null;
  focusClientPoint?: { x: number; y: number } | null;
  onFocusRestored?: () => void;
  /** 다듬기 안내 플레이스홀더를 표시할지 여부 (50자 이상 입력 시) */
  showRefineGuide?: boolean;
}

function textOffsetToPmPos(doc: Editor['state']['doc'], offset: number): number {
  let textLen = 0;
  let posBeforeChild = 0;

  for (let i = 0; i < doc.childCount; i++) {
    const child = doc.child(i);
    const contentStart = posBeforeChild + 1;
    const childTextLen = child.textContent.length;

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

  return Math.max(1, doc.content.size);
}

export function LetterTiptapEditor({
  initialContent,
  font,
  fontSize,
  lineHeight,
  textAlign,
  textColor,
  totalLines,
  pageIndex = 0,
  stationeryStyle,
  onEditorReady,
  onEditorDestroy,
  onContentUpdate,
  onEnterAtLastLine,
  onBackspaceAtStart,
  onLineOverflow,
  onPaste,
  onSelectAll,
  focusPosition = 'start',
  focusOffset = null,
  focusClientPoint = null,
  onFocusRestored,
  showRefineGuide = false,
}: LetterTiptapEditorProps) {
  const writingArea = resolveWritingArea(stationeryStyle, getPageSide(pageIndex));
  const rightPadding = CANVAS_WIDTH - writingArea.left - writingArea.width;
  const bottomPadding = CANVAS_HEIGHT - writingArea.top - writingArea.height;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const shouldAutofocus = !isMobile || focusOffset !== null || focusClientPoint !== null;

  const onContentUpdateRef = useRef(onContentUpdate);
  onContentUpdateRef.current = onContentUpdate;

  const onEnterRef = useRef(onEnterAtLastLine);
  onEnterRef.current = onEnterAtLastLine;
  const onBackspaceRef = useRef(onBackspaceAtStart);
  onBackspaceRef.current = onBackspaceAtStart;
  const onOverflowRef = useRef(onLineOverflow);
  onOverflowRef.current = onLineOverflow;
  const onPasteRef = useRef(onPaste);
  onPasteRef.current = onPaste;
  const onSelectAllRef = useRef(onSelectAll);
  onSelectAllRef.current = onSelectAll;
  const showRefineGuideRef = useRef(showRefineGuide);
  showRefineGuideRef.current = showRefineGuide;
  const onFocusRestoredRef = useRef(onFocusRestored);
  onFocusRestoredRef.current = onFocusRestored;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // 편지 에디터에 불필요한 기능 비활성화
        codeBlock: false,
        blockquote: false,
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        code: false,
        strike: false,
      }),
      TextStyleExt,
      Color,
      TextAlign.configure({
        types: ['paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      Placeholder.configure({
        placeholder: ({ editor: ed, node, pos }) => {
          if (ed.isEmpty) {
            return '여기에 마음을 담아 편지를 써보세요.\n막막하다면 위의 \'처음/중간/마무리\' 버튼을 눌러보세요.';
          }
          // 마지막 빈 paragraph에만 이어쓰기 가이드 표시
          const isLastNode = pos + node.nodeSize >= ed.state.doc.content.size;
          if (isLastNode) {
            if (showRefineGuideRef.current) {
              return '본문을 다 쓰셨으면 아래 다듬기 버튼을 눌러보세요.';
            }
            return '본문을 이어서 작성해보세요...';
          }
          return '';
        },
        showOnlyCurrent: false,
        showOnlyWhenEditable: true,
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-node-empty',
      }),
      CharacterCount,
      Highlight.configure({ multicolor: true }),
      Typography,
      AutocompleteExtension.configure({
        onAccept: () => {},
        onDismiss: () => {},
      }),
      LetterPageExtension.configure({
        maxLines: totalLines,
        lineHeight,
        onEnterAtLastLine: () => onEnterRef.current(),
        onBackspaceAtStart: () => onBackspaceRef.current(),
        onLineOverflow: (text: string) => onOverflowRef.current(text),
        onPaste: (payload) => onPasteRef.current(payload),
        onSelectAll: () => onSelectAllRef.current(),
      }),
      RefineHighlightExtension,
    ],
    content: initialContent ? textToHtml(initialContent) : '',
    editorProps: {
      attributes: {
        class: 'outline-none letter-tiptap-content',
        style: [
          `padding: ${writingArea.top}px ${rightPadding}px ${bottomPadding}px ${writingArea.left}px`,
          `width: ${CANVAS_WIDTH}px`,
          `min-width: ${CANVAS_WIDTH}px`,
          `max-width: ${CANVAS_WIDTH}px`,
          `height: ${CANVAS_HEIGHT}px`,
          `min-height: ${CANVAS_HEIGHT}px`,
          `max-height: ${CANVAS_HEIGHT}px`,
          `overflow: hidden`,
          `box-sizing: border-box`,
          `white-space: pre-wrap`,
          `word-break: break-word`,
          `overflow-wrap: break-word`,
          `cursor: text`,
        ].join(';'),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onContentUpdateRef.current(getEditorText(ed));
    },
    immediatelyRender: false,
    // 모바일에서는 autofocus 비활성화 (불필요한 키보드 팝업 방지)
    autofocus: shouldAutofocus
      ? ((focusOffset ?? 0) > 0 || focusPosition === 'end' ? 'end' : 'start')
      : false,
  });

  // editor 준비 시 부모에 전달 + 소멸 시 부모에 알림
  const editorReadyRef = useRef(false);
  const onEditorDestroyRef = useRef(onEditorDestroy);
  onEditorDestroyRef.current = onEditorDestroy;

  useEffect(() => {
    if (editor && !editorReadyRef.current) {
      editorReadyRef.current = true;
      onEditorReady(editor);
    }
    return () => {
      if (editorReadyRef.current) {
        editorReadyRef.current = false;
        onEditorDestroyRef.current?.();
      }
    };
  }, [editor, onEditorReady]);

  useLayoutEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const currentText = getEditorText(editor);
    if (currentText === initialContent) return;

    editor.commands.setContent(initialContent ? textToHtml(initialContent) : '');
  }, [editor, initialContent]);

  useLayoutEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const editorDom = editor.view.dom as HTMLElement;
    editorDom.style.padding = `${writingArea.top}px ${rightPadding}px ${bottomPadding}px ${writingArea.left}px`;
    editorDom.style.width = `${CANVAS_WIDTH}px`;
    editorDom.style.minWidth = `${CANVAS_WIDTH}px`;
    editorDom.style.maxWidth = `${CANVAS_WIDTH}px`;
    editorDom.style.height = `${CANVAS_HEIGHT}px`;
    editorDom.style.minHeight = `${CANVAS_HEIGHT}px`;
    editorDom.style.maxHeight = `${CANVAS_HEIGHT}px`;
  }, [editor, writingArea.top, writingArea.left, writingArea.width, writingArea.height, rightPadding, bottomPadding]);

  useLayoutEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (
      (focusOffset === null || focusOffset === undefined) &&
      !focusClientPoint
    ) return;

    let frameId = 0;
    let cancelled = false;

    const finishRestore = () => {
      if (cancelled) return;
      cancelled = true;
      onFocusRestoredRef.current?.();
    };

    const cancelRestoreOnInput = () => {
      if (frameId) cancelAnimationFrame(frameId);
      finishRestore();
    };

    const applyFocus = () => {
      if (cancelled || !editor || editor.isDestroyed) return;

      try {
        const posFromCoords = focusClientPoint
          ? editor.view.posAtCoords({ left: focusClientPoint.x, top: focusClientPoint.y })?.pos ?? null
          : null;
        const pmPos = posFromCoords ?? textOffsetToPmPos(editor.state.doc, focusOffset ?? 0);
        editor.view.focus();
        editor.chain().setTextSelection(pmPos).run();
        finishRestore();
      } catch {
        editor.commands.focus((focusOffset ?? 0) > 0 ? 'end' : 'start');
        finishRestore();
      }
    };

    // 동기적으로 먼저 시도 (useLayoutEffect는 페인트 전 실행되므로 즉시 적용 가능)
    applyFocus();

    // 동기 시도가 실패했을 때 (에디터 DOM이 아직 준비 안 된 경우) rAF로 재시도
    if (!cancelled && !editor.isFocused) {
      frameId = requestAnimationFrame(applyFocus);
    }

    editor.view.dom.addEventListener('keydown', cancelRestoreOnInput, true);
    editor.view.dom.addEventListener('beforeinput', cancelRestoreOnInput, true);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      editor.view.dom.removeEventListener('keydown', cancelRestoreOnInput, true);
      editor.view.dom.removeEventListener('beforeinput', cancelRestoreOnInput, true);
    };
  }, [editor, focusClientPoint, focusOffset, initialContent]);

  // 텍스트 정렬 적용
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.chain().setTextAlign(textAlign).run();
    }
  }, [textAlign, editor]);

  const fontFamily = FONT_FAMILIES[font]?.fontFamily || 'Pretendard, sans-serif';
  const fontClassName = FONT_FAMILIES[font]?.className || 'font-pretendard';

  return (
    <>
      <style jsx global>{`
        .tiptap {
          outline: none;
        }
        .tiptap p {
          margin: 0;
        }
        .letter-tiptap-content {
          font-family: ${fontFamily};
          font-size: ${fontSize}px;
          line-height: ${lineHeight}px;
          color: ${textColor};
        }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #c6c6c6;
          pointer-events: none;
          height: 0;
          white-space: pre-wrap;
        }
        .tiptap p.is-node-empty:not(.is-editor-empty)[data-placeholder]::before {
          content: attr(data-placeholder);
          float: left;
          color: #c6c6c6;
          pointer-events: none;
          height: 0;
          white-space: pre-wrap;
        }
        .dark .tiptap p.is-editor-empty:first-child::before,
        .dark .tiptap p.is-node-empty:not(.is-editor-empty)[data-placeholder]::before {
          color: rgba(156, 163, 175, 0.4);
        }
        .tiptap mark {
          background-color: rgba(168, 85, 247, 0.2);
          border-radius: 2px;
          padding: 0 2px;
        }
        .autocomplete-suggestion {
          color: rgba(156, 163, 175, 0.6);
          pointer-events: none;
          user-select: none;
        }
        /* 다듬기 하이라이트 공통 */
        .refine-hl {
          background-color: rgba(251, 146, 60, 0.06);
          border-left: 2.5px solid rgba(251, 146, 60, 0.5);
          border-right: 2.5px solid rgba(251, 146, 60, 0.5);
          margin-left: -4px;
          margin-right: -4px;
          padding-left: 4px;
          padding-right: 4px;
          animation: refine-pulse 2s ease-in-out infinite;
        }
        .refine-hl-only {
          border-top: 2.5px solid rgba(251, 146, 60, 0.5);
          border-bottom: 2.5px solid rgba(251, 146, 60, 0.5);
          border-radius: 6px;
          padding-top: 2px;
          padding-bottom: 2px;
        }
        .refine-hl-first {
          border-top: 2.5px solid rgba(251, 146, 60, 0.5);
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
          padding-top: 2px;
        }
        .refine-hl-mid {
          /* 좌우 border만 (공통에서 적용됨) */
        }
        .refine-hl-last {
          border-bottom: 2.5px solid rgba(251, 146, 60, 0.5);
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
          padding-bottom: 2px;
        }
        @keyframes refine-pulse {
          0%, 100% { background-color: rgba(251, 146, 60, 0.06); }
          50% { background-color: rgba(251, 146, 60, 0.12); }
        }
      `}</style>
      <div
        className={fontClassName}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          zIndex: 10,
        }}
      >
        {editor ? <EditorContent editor={editor} /> : null}
      </div>
    </>
  );
}
