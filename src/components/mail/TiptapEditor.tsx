'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { useEffect, useCallback, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { AutocompleteExtension } from './extensions/AutocompleteExtension';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api/fetch';

export interface TiptapEditorRef {
  editor: Editor | null;
  insertText: (text: string) => void;
  insertEmoji: (emoji: string) => void;
  getPlainText: () => string;
  getHTML: () => string;
  focus: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  // 현재 줄 수 관련 정보
  getLineInfo: () => {
    lineHeightPx: number;
    currentLines: number;
    maxLinesEstimate: number;
    maxContentLines: number; // 18줄
    headerLines: number;
    footerLines: number;
  };
}

interface TiptapEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  font: string;
  fontSize: number;
  isBold: boolean;
  textAlign: 'left' | 'center' | 'right';
  textColor?: string;
  placeholder?: string;
  className?: string;
  // 자동완성 관련 props
  autocompleteEnabled?: boolean;
  recipientName?: string;
  recipientRelation?: string;
  // 추가 메타데이터 (AI 자동완성 품질 향상)
  recipientGender?: 'male' | 'female' | null;
  recipientBirthDate?: string | null;
  recipientFacilityType?: string;
  recipientRegion?: string | null;
  // 부모 컨테이너 높이에 맞출지 여부 (AI 편지지용)
  fillContainer?: boolean;
  // 밑줄(ruled lines) 표시 여부
  showRuledLines?: boolean;
  // 밑줄 색상
  ruledLineColor?: string;
  // 헤더 마진 (밑줄 없는 상단 여백, 줄 수 기준)
  headerLines?: number;
  // 푸터 마진 (밑줄 없는 하단 여백, 줄 수 기준)
  footerLines?: number;
}

const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  (
    {
      content,
      onContentChange,
      font,
      fontSize,
      isBold,
      textAlign,
      textColor = '#1a1a1a',
      placeholder = '여기에 마음을 담아 편지를 써보세요.\n막막하다면 위의 \'처음/중간/마무리\' 버튼을 눌러보세요.',
      className,
      autocompleteEnabled = true,
      recipientName,
      recipientRelation,
      recipientGender,
      recipientBirthDate,
      recipientFacilityType,
      recipientRegion,
      fillContainer = false,
      showRuledLines = true,
      ruledLineColor = 'rgba(200, 200, 200, 0.3)',
      // 편지지 18줄 기준: 상단 1줄, 하단 1줄 여백
      headerLines = 1,
      footerLines = 1,
    },
    ref
  ) => {
    // 자동완성 상태
    const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
    const [suggestion, setSuggestion] = useState('');
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const lastTextRef = useRef<string>('');
    const containerRef = useRef<HTMLDivElement>(null);

    // 컨테이너 크기 상태 (동적 줄 높이 계산용)
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // ResizeObserver로 컨테이너 크기 변화 감지
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          setContainerSize({ width, height });
        }
      });

      resizeObserver.observe(container);
      // 초기 크기 설정
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });

      return () => resizeObserver.disconnect();
    }, []);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          // 기본 포맷팅 비활성화 (전체 문서에 스타일 적용하므로)
          bold: false,
          italic: false,
          strike: false,
          code: false,
          codeBlock: false,
          blockquote: false,
          heading: false,
          bulletList: false,
          orderedList: false,
          listItem: false,
          // History(Undo/Redo)는 StarterKit에 기본 포함됨
        }),
        TextAlign.configure({
          types: ['paragraph'],
          alignments: ['left', 'center', 'right'],
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass: 'is-editor-empty',
        }),
        CharacterCount,
        // AI 생성 텍스트 하이라이트용
        Highlight.configure({
          multicolor: true,
        }),
        // 자동 타이포그래피 교정 (따옴표, 대시 등)
        Typography,
        // 자동완성 확장
        AutocompleteExtension.configure({
          onAccept: () => setSuggestion(''),
          onDismiss: () => setSuggestion(''),
        }),
      ],
      content: content ? `<p>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>` : '',
      editorProps: {
        attributes: {
          class: fillContainer
            ? 'outline-none h-full tiptap-letter-editor'
            : 'outline-none min-h-[320px] tiptap-letter-editor',
        },
      },
      onUpdate: ({ editor }) => {
        // HTML → plain text 변환
        const plainText = editor.getText();
        onContentChange(plainText);

        // 자동완성 제안 초기화 (타이핑 시)
        if (suggestion) {
          setSuggestion('');
          editor.commands.clearSuggestion();
        }
      },
      // SSR hydration 오류 방지 - 클라이언트에서만 렌더링
      immediatelyRender: false,
    });

    // 자동완성 API 호출
    const fetchSuggestion = useCallback(async () => {
      if (!editor || !autocompleteEnabled) return;

      const text = editor.getText();

      // 최소 10자 이상일 때만 제안
      if (text.length < 10) {
        setSuggestion('');
        return;
      }

      // 이전과 같은 텍스트면 스킵
      if (text === lastTextRef.current) return;
      lastTextRef.current = text;

      // 기존 debounce 취소
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // 1.5초 후 API 호출
      debounceRef.current = setTimeout(async () => {
        setIsAutocompleteLoading(true);

        try {
          const response = await apiFetch('/api/v1/ai/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              recipientName,
              recipientRelation,
              // 추가 메타데이터
              recipientGender,
              recipientBirthDate,
              recipientFacilityType,
              recipientRegion,
            }),
          });

          if (!response.ok) throw new Error('Failed to fetch suggestion');

          const data = await response.json();
          const newSuggestion = data.suggestion || '';

          if (newSuggestion && editor) {
            setSuggestion(newSuggestion);
            editor.commands.setSuggestion(newSuggestion);
          }
        } catch (error) {
          console.error('Autocomplete error:', error);
          setSuggestion('');
        } finally {
          setIsAutocompleteLoading(false);
        }
      }, 1500);
    }, [editor, autocompleteEnabled, recipientName, recipientRelation, recipientGender, recipientBirthDate, recipientFacilityType, recipientRegion]);

    // 에디터 포커스 상태에서 타이핑 멈춤 감지
    useEffect(() => {
      if (!editor || !autocompleteEnabled) return;

      const handleUpdate = () => {
        fetchSuggestion();
      };

      editor.on('update', handleUpdate);

      return () => {
        editor.off('update', handleUpdate);
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, [editor, autocompleteEnabled, fetchSuggestion]);

    // 외부에서 content가 변경되면 에디터 업데이트 (AI 삽입 등)
    useEffect(() => {
      if (editor && !editor.isFocused) {
        const currentText = editor.getText();
        if (currentText !== content) {
          const html = content ? `<p>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>` : '';
          editor.commands.setContent(html);
        }
      }
    }, [content, editor]);

    // 텍스트 정렬 적용
    useEffect(() => {
      if (editor) {
        editor.chain().focus().setTextAlign(textAlign).run();
      }
    }, [textAlign, editor]);

    // 텍스트 삽입 함수
    const insertText = useCallback(
      (text: string) => {
        if (editor) {
          editor.chain().focus().insertContent(text).run();
        }
      },
      [editor]
    );

    // 이모지 삽입 함수
    const insertEmoji = useCallback(
      (emoji: string) => {
        if (editor) {
          editor.chain().focus().insertContent(emoji).run();
        }
      },
      [editor]
    );

    // Undo 함수
    const undo = useCallback(() => {
      if (editor) {
        editor.chain().focus().undo().run();
      }
    }, [editor]);

    // Redo 함수
    const redo = useCallback(() => {
      if (editor) {
        editor.chain().focus().redo().run();
      }
    }, [editor]);

    // 편지지 기준 줄 수 (14.6cm x 21cm, 18줄)
    const CONTENT_LINES = 18;

    // 줄 정보 계산 함수
    const getLineInfo = useCallback(() => {
      const { height } = containerSize;
      const padY = Math.max(12, height * 0.04);
      const totalLines = headerLines + 18 + footerLines;
      const availHeight = height - (padY * 2);
      const calculatedLineHeight = height > 0 ? availHeight / totalLines : fontSize * 1.5;

      // 현재 텍스트의 줄 수 계산
      const text = editor?.getText() || '';
      const currentLines = text.split('\n').length;

      return {
        lineHeightPx: calculatedLineHeight,
        currentLines,
        maxLinesEstimate: 18, // 항상 18줄
        maxContentLines: CONTENT_LINES,
        headerLines,
        footerLines,
      };
    }, [editor, fontSize, headerLines, footerLines, containerSize]);

    // ref로 에디터 메서드 노출
    useImperativeHandle(ref, () => ({
      editor,
      insertText,
      insertEmoji,
      getPlainText: () => editor?.getText() || '',
      getHTML: () => editor?.getHTML() || '',
      focus: () => editor?.chain().focus().run(),
      undo,
      redo,
      canUndo: () => editor?.can().undo() || false,
      canRedo: () => editor?.can().redo() || false,
      getLineInfo,
    }));

    // 폰트 패밀리 매핑
    const fontFamily =
      font === 'pretendard'
        ? 'Pretendard, sans-serif'
        : font === 'nanum-gothic'
          ? "'Nanum Gothic', sans-serif"
          : font === 'nanum-myeongjo'
            ? "'Nanum Myeongjo', serif"
            : "'Gowun Dodum', sans-serif";

    // 편지지 비율 계산 (14.6cm x 21cm = 146:210)
    // 전체 줄 수: 헤더(1줄) + 컨텐츠(18줄) + 푸터(1줄) = 20줄
    const TOTAL_LINES = headerLines + 18 + footerLines; // 20줄

    // 컨테이너 높이 기반 줄 높이 계산
    // 비율에서 가로:세로 = 146:210
    // 여백을 제외한 영역에 20줄이 균등 배치되도록 계산
    const { width: containerWidth, height: containerHeight } = containerSize;

    // 좌우 패딩 (가로의 5%)
    const paddingX = Math.max(16, containerWidth * 0.05);
    // 상하 패딩 (세로의 4%)
    const paddingY = Math.max(12, containerHeight * 0.04);

    // 사용 가능한 높이에서 20줄이 균등 배치
    const availableHeight = containerHeight - (paddingY * 2);
    // 줄 높이 계산 (컨테이너가 없으면 fontSize 기반 fallback)
    const lineHeightPx = containerHeight > 0
      ? availableHeight / TOTAL_LINES
      : fontSize * 1.5;

    // 실제 적용할 line-height 비율 (CSS용)
    const lineHeightRatio = containerHeight > 0
      ? lineHeightPx / fontSize
      : 1.5;

    // 헤더/푸터 마진 계산 (픽셀 단위)
    const headerMarginPx = headerLines * lineHeightPx;
    const footerMarginPx = footerLines * lineHeightPx;

    // 에디터 상단 패딩: 기본 패딩 + 헤더 영역
    const editorPaddingTop = paddingY + headerMarginPx;
    // 에디터 하단 패딩
    const editorPaddingBottom = paddingY + footerMarginPx;

    // 18줄 컨텐츠 영역 높이
    const contentAreaHeight = 18 * lineHeightPx;
    // 밑줄 시작 위치 (상단 패딩 이후)
    const ruledLinesStart = editorPaddingTop;
    // 밑줄 끝 위치 (정확히 18줄만)
    const ruledLinesEnd = ruledLinesStart + contentAreaHeight;

    // 밑줄 배경 레이어 스타일 (절대 위치로 텍스트 뒤에 배치)
    // 텍스트 베이스라인이 줄 위에 오도록 계산
    // 줄은 각 라인박스 하단에 그려짐 (텍스트 아래)
    const ruledLinesBgStyle: React.CSSProperties = showRuledLines ? {
      position: 'absolute' as const,
      inset: 0,
      pointerEvents: 'none' as const,
      backgroundImage: `repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent ${lineHeightPx - 1}px,
        ${ruledLineColor} ${lineHeightPx - 1}px,
        ${ruledLineColor} ${lineHeightPx}px
      )`,
      backgroundSize: `100% ${lineHeightPx}px`,
      // 첫 번째 줄은 상단 패딩 이후 첫 줄 높이 위치에
      backgroundPosition: `0 ${ruledLinesStart + lineHeightPx - 1}px`,
      // CSS mask로 정확히 18줄만 표시
      maskImage: `linear-gradient(
        to bottom,
        transparent 0px,
        transparent ${ruledLinesStart}px,
        black ${ruledLinesStart}px,
        black ${ruledLinesEnd}px,
        transparent ${ruledLinesEnd}px,
        transparent 100%
      )`,
      WebkitMaskImage: `linear-gradient(
        to bottom,
        transparent 0px,
        transparent ${ruledLinesStart}px,
        black ${ruledLinesStart}px,
        black ${ruledLinesEnd}px,
        transparent ${ruledLinesEnd}px,
        transparent 100%
      )`,
    } : {};

    return (
      <div
        ref={containerRef}
        className={cn(
          'relative rounded-xl overflow-hidden border border-black/[0.05] dark:border-white/[0.05] bg-muted/10',
          'focus-within:ring-2 focus-within:ring-primary/10 transition-all',
          fillContainer && 'flex-1 h-full flex flex-col',
          className
        )}
        style={{
          fontFamily,
          fontSize: `${fontSize}px`,
          fontWeight: isBold ? 'bold' : 'normal',
          lineHeight: lineHeightRatio,
          color: textColor,
          // CSS 커스텀 프로퍼티로 패딩 값 전달
          '--editor-padding-x': `${paddingX}px`,
          '--editor-padding-top': `${editorPaddingTop}px`,
          '--editor-padding-bottom': `${editorPaddingBottom}px`,
          '--editor-line-height': `${lineHeightPx}px`,
        } as React.CSSProperties}
      >
        <style jsx global>{`
          .tiptap {
            outline: none;
          }
          .tiptap p {
            margin: 0;
          }
          /* 편지 에디터 패딩 - 텍스트가 밑줄에 맞춰 시작 */
          .tiptap-letter-editor {
            padding-left: var(--editor-padding-x, 24px);
            padding-right: var(--editor-padding-x, 24px);
            padding-top: var(--editor-padding-top, 24px);
            padding-bottom: var(--editor-padding-bottom, 24px);
          }
          .tiptap p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #c6c6c6;
            pointer-events: none;
            height: 0;
            white-space: pre-wrap;
          }
          .dark .tiptap p.is-editor-empty:first-child::before {
            color: rgba(156, 163, 175, 0.4);
          }
          /* AI 생성 텍스트 하이라이트 스타일 */
          .tiptap mark {
            background-color: rgba(168, 85, 247, 0.2);
            border-radius: 2px;
            padding: 0 2px;
          }
          .dark .tiptap mark {
            background-color: rgba(168, 85, 247, 0.3);
          }
          /* 하이라이트 색상 변형 */
          .tiptap mark[data-color="yellow"] {
            background-color: rgba(250, 204, 21, 0.3);
          }
          .tiptap mark[data-color="green"] {
            background-color: rgba(34, 197, 94, 0.3);
          }
          .tiptap mark[data-color="blue"] {
            background-color: rgba(59, 130, 246, 0.3);
          }
          /* 자동완성 제안 (Ghost Text) 스타일 */
          .autocomplete-suggestion {
            color: rgba(156, 163, 175, 0.6);
            pointer-events: none;
            user-select: none;
          }
          .dark .autocomplete-suggestion {
            color: rgba(156, 163, 175, 0.4);
          }
        `}</style>
        {/* 밑줄 배경 레이어 (텍스트 뒤에 배치) */}
        {showRuledLines && <div style={ruledLinesBgStyle} aria-hidden="true" />}

        {editor ? (
          <div
            className={cn(
              'relative z-10',
              fillContainer ? 'flex-1 [&>.tiptap]:h-full' : undefined
            )}
          >
            <EditorContent editor={editor} />
          </div>
        ) : (
          <div
            className={cn(
              "relative z-10 text-[#C6C6C6] dark:text-muted-foreground/40 whitespace-pre-wrap",
              fillContainer ? "flex-1" : "min-h-[320px]"
            )}
            style={{
              paddingLeft: `${paddingX}px`,
              paddingRight: `${paddingX}px`,
              paddingTop: `${editorPaddingTop}px`,
              paddingBottom: `${editorPaddingBottom}px`,
            }}
          >
            {placeholder}
          </div>
        )}

        {/* 자동완성 로딩 인디케이터 */}
        {isAutocompleteLoading && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-muted/80 rounded-full text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>AI 제안 중...</span>
          </div>
        )}

        {/* Tab 힌트 */}
        {suggestion && !isAutocompleteLoading && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-xs text-primary">
            <kbd className="px-1.5 py-0.5 bg-primary/20 rounded text-size-10 font-mono">Tab</kbd>
            <span>눌러서 수락</span>
          </div>
        )}
      </div>
    );
  }
);

TiptapEditor.displayName = 'TiptapEditor';

export { TiptapEditor };
