'use client';

import { useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Mic,
  MicOff,
  Smile,
  Bold,
  Italic,
  Type,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColorWheelIcon } from './ColorWheelIcon';
import { FONT_SIZES, FONT_FAMILIES, FONT_COLORS, EMOJIS, LINE_COLORS } from '../constants';
import type { TextAlign } from '../types';
import type { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor | null;
  isMobile: boolean;
  font: string;
  fontSizeKey: string;
  textAlign: TextAlign;
  textColor: string;
  // 드롭다운 상태
  showFontDropdown: boolean;
  showColorDropdown: boolean;
  showEmojiDropdown: boolean;
  onToggleFontDropdown: () => void;
  onToggleColorDropdown: () => void;
  onToggleEmojiDropdown: () => void;
  onCloseAllDropdowns: () => void;
  // 핸들러
  onFontChange: (key: string) => void;
  onFontSizeChange: (size: number) => void;
  onTextAlignChange: (align: TextAlign) => void;
  onColorChange: (color: string) => void;
  onInsertEmoji: (emoji: string) => void;
  // 줄 색상
  lineColor: string;
  showLineColorDropdown: boolean;
  onToggleLineColorDropdown: () => void;
  onLineColorChange: (color: string) => void;
  // 음성
  isSpeechSupported: boolean;
  isListening: boolean;
  onVoiceToggle: () => void;
}

/**
 * 모바일에서 드롭다운 패널을 포탈로 렌더링하는 헬퍼.
 * 모바일 툴바의 overflow-x-auto가 overflow-y도 clip하므로,
 * 드롭다운을 document.body에 렌더링하여 잘림 문제를 해결합니다.
 */
function DropdownPanel({
  show,
  isMobile,
  buttonRef,
  align = 'left',
  children,
}: {
  show: boolean;
  isMobile: boolean;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  align?: 'left' | 'right' | 'center';
  children: React.ReactNode;
}) {
  if (!show) return null;

  // 데스크톱: 기존 absolute 방식
  if (!isMobile) {
    return (
      <div
        className={cn(
          "absolute top-full mt-1 z-[100]",
          align === 'center' && "left-1/2 -translate-x-1/2",
          align === 'left' && "left-0",
          align === 'right' && "right-0"
        )}
      >
        {children}
      </div>
    );
  }

  // 모바일: portal로 body에 렌더링 (overflow 탈출)
  const rect = buttonRef.current?.getBoundingClientRect();
  if (!rect || typeof document === 'undefined') return null;

  // visualViewport를 사용하여 키보드가 열린 상태에서도 정확한 위치 계산
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const availableBelow = viewportHeight - rect.bottom - 8;
  const availableAbove = rect.top - 8;
  const showAbove = availableBelow < 150 && availableAbove > availableBelow;

  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 200,
    maxHeight: Math.max(showAbove ? availableAbove : availableBelow, 100),
    overflowY: 'auto',
  };

  if (showAbove) {
    style.bottom = viewportHeight - rect.top + 4;
  } else {
    style.top = rect.bottom + 4;
  }

  if (align === 'right') {
    style.right = Math.max(8, window.innerWidth - rect.right);
  } else if (align === 'center') {
    style.left = Math.max(8, rect.left + rect.width / 2 - 75);
  } else {
    style.left = Math.max(8, rect.left);
  }

  return createPortal(
    <div className="dropdown" style={style} onMouseDown={(e) => e.preventDefault()}>
      {children}
    </div>,
    document.body
  );
}

export function EditorToolbar({
  editor,
  isMobile,
  font,
  fontSizeKey,
  textAlign,
  textColor,
  showFontDropdown,
  showColorDropdown,
  showEmojiDropdown,
  onToggleFontDropdown,
  onToggleColorDropdown,
  onToggleEmojiDropdown,
  onCloseAllDropdowns,
  onFontChange,
  onFontSizeChange,
  onTextAlignChange,
  onColorChange,
  onInsertEmoji,
  lineColor,
  showLineColorDropdown,
  onToggleLineColorDropdown,
  onLineColorChange,
  isSpeechSupported,
  isListening,
  onVoiceToggle,
}: EditorToolbarProps) {
  const fontBtnRef = useRef<HTMLButtonElement>(null);
  const colorBtnRef = useRef<HTMLButtonElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const lineColorBtnRef = useRef<HTMLButtonElement>(null);

  const handleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const handleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const handleRemoveFormatting = () => {
    editor?.chain().focus().unsetAllMarks().run();
  };

  return (
    <div className={cn(
      "border-b border-neutral-100 px-2 py-1.5 flex items-center gap-1 shrink-0",
      isMobile
        ? "overflow-x-auto overflow-y-visible scrollbar-hide justify-start"
        : "flex-wrap justify-center overflow-visible"
    )}>
      {/* 폰트 선택 */}
      <div className="dropdown relative shrink-0">
        <button
          ref={fontBtnRef}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            onCloseAllDropdowns();
            onToggleFontDropdown();
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-neutral-100 text-xs text-neutral-700"
        >
          <span className="max-w-[80px] truncate">{FONT_FAMILIES[font]?.style || '글씨체 선택'}</span>
          <ChevronDown className="w-3 h-3 text-neutral-400" />
        </button>
        <DropdownPanel show={showFontDropdown} isMobile={isMobile} buttonRef={fontBtnRef} align="left">
          <div
            className="bg-white rounded-xl shadow-xl border border-neutral-200 p-1.5 min-w-[130px]"
            onMouseDown={(e) => e.preventDefault()}
          >
            <p className="text-size-10 text-neutral-400 mb-1 px-2">글씨체 선택</p>
            {Object.entries(FONT_FAMILIES).map(([key, { style, className }]) => (
              <button
                key={key}
                onClick={() => onFontChange(key)}
                className={cn(
                  'w-full text-left px-3 py-1.5 rounded-md text-sm',
                  className,
                  font === key ? 'bg-orange-50 text-orange-600' : 'hover:bg-neutral-50'
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </DropdownPanel>
      </div>

      <div className="w-px h-4 bg-neutral-200" />

      {/* 폰트 크기 */}
      <div className="flex items-center bg-neutral-100 rounded-md p-0.5 shrink-0">
        {Object.entries(FONT_SIZES).map(([key, { label, size }]) => (
          <button
            key={key}
            onClick={() => onFontSizeChange(size)}
            className={cn(
              'px-2 py-1 text-xs rounded transition-all',
              fontSizeKey === key ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-neutral-200" />

      {/* 볼드/이탤릭/일반 */}
      <div className="flex items-center bg-neutral-100 rounded-md p-0.5 shrink-0">
        <button
          onClick={handleRemoveFormatting}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded transition-all text-neutral-500 hover:bg-white hover:shadow-sm hover:text-neutral-900 active:bg-neutral-200 active:scale-95"
          title="서식 제거"
        >
          <Type className="w-4 h-4" />
        </button>
        <button
          onClick={handleBold}
          className={cn(
            'min-w-[44px] min-h-[44px] flex items-center justify-center rounded transition-all active:scale-95',
            editor?.isActive('bold')
              ? 'bg-white shadow-sm text-neutral-900'
              : 'text-neutral-500 hover:bg-white hover:shadow-sm hover:text-neutral-900 active:bg-neutral-200'
          )}
          title="볼드"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={handleItalic}
          className={cn(
            'min-w-[44px] min-h-[44px] flex items-center justify-center rounded transition-all active:scale-95',
            editor?.isActive('italic')
              ? 'bg-white shadow-sm text-neutral-900'
              : 'text-neutral-500 hover:bg-white hover:shadow-sm hover:text-neutral-900 active:bg-neutral-200'
          )}
          title="이탤릭"
        >
          <Italic className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-4 bg-neutral-200" />

      {/* 정렬 */}
      <div className="flex items-center bg-neutral-100 rounded-md p-0.5 shrink-0">
        {(['left', 'center', 'right'] as const).map((align) => (
          <button
            key={align}
            onClick={() => onTextAlignChange(align)}
            className={cn(
              'min-w-[44px] min-h-[44px] flex items-center justify-center rounded transition-all active:scale-95',
              textAlign === align ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-400 active:bg-neutral-200'
            )}
          >
            {align === 'left' && <AlignLeft className="w-4 h-4" />}
            {align === 'center' && <AlignCenter className="w-4 h-4" />}
            {align === 'right' && <AlignRight className="w-4 h-4" />}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-neutral-200" />

      {/* 색상 */}
      <div className="dropdown relative shrink-0">
        <button
          ref={colorBtnRef}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            onCloseAllDropdowns();
            onToggleColorDropdown();
          }}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md hover:bg-neutral-100 active:bg-neutral-200 active:scale-95"
        >
          <ColorWheelIcon size={16} />
        </button>
        <DropdownPanel show={showColorDropdown} isMobile={isMobile} buttonRef={colorBtnRef} align="right">
          <div
            className="bg-white rounded-xl shadow-xl border border-neutral-200 p-2.5 min-w-[150px]"
            onMouseDown={(e) => e.preventDefault()}
          >
            <p className="text-size-10 text-neutral-400 mb-1.5 text-center">글자 색상 선택</p>
            <div className="grid grid-cols-4 gap-2.5">
              {FONT_COLORS.map(({ id, value }) => (
                <button
                  key={id}
                  onClick={() => onColorChange(value)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-transform hover:scale-110 active:scale-95 border',
                    value === '#ffffff' ? 'border-neutral-300' : 'border-transparent',
                    textColor === value && 'ring-2 ring-orange-500 ring-offset-2'
                  )}
                  style={{ backgroundColor: value }}
                />
              ))}
            </div>
          </div>
        </DropdownPanel>
      </div>

      {/* 이모지 */}
      <div className="dropdown relative shrink-0">
        <button
          ref={emojiBtnRef}
          onClick={(e) => {
            e.stopPropagation();
            onCloseAllDropdowns();
            onToggleEmojiDropdown();
          }}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md hover:bg-neutral-100 active:bg-neutral-200 active:scale-95 text-neutral-500"
        >
          <Smile className="w-[18px] h-[18px]" />
        </button>
        <DropdownPanel show={showEmojiDropdown} isMobile={isMobile} buttonRef={emojiBtnRef} align="right">
          <div className="bg-white rounded-xl shadow-lg border border-neutral-100 p-2 min-w-[180px]">
            <div className="grid grid-cols-8 gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onInsertEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-neutral-100 active:bg-neutral-200 active:scale-90 text-base"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </DropdownPanel>
      </div>

      {/* 밑줄 색상 */}
      <div className="dropdown relative shrink-0">
        <button
          ref={lineColorBtnRef}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            onCloseAllDropdowns();
            onToggleLineColorDropdown();
          }}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md hover:bg-neutral-100 active:bg-neutral-200 active:scale-95"
          title="밑줄 색상"
        >
          <Minus
            className="w-[18px] h-[18px]"
            style={{ color: lineColor === 'transparent' ? '#d4d4d4' : lineColor }}
            strokeWidth={3}
          />
        </button>
        <DropdownPanel show={showLineColorDropdown} isMobile={isMobile} buttonRef={lineColorBtnRef} align="right">
          <div
            className="bg-white rounded-xl shadow-xl border border-neutral-200 p-2.5 min-w-[150px]"
            onMouseDown={(e) => e.preventDefault()}
          >
            <p className="text-size-10 text-neutral-400 mb-1.5 text-center">밑줄 색상 선택</p>
            <div className="grid grid-cols-3 gap-2">
              {LINE_COLORS.map(({ id, label, value }) => (
                <button
                  key={id}
                  onClick={() => onLineColorChange(value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all hover:bg-neutral-50 active:scale-95',
                    lineColor === value && 'ring-2 ring-orange-500 bg-orange-50'
                  )}
                >
                  <span
                    className={cn(
                      'w-8 h-1 rounded-full',
                      value === 'transparent' && 'border border-dashed border-neutral-300'
                    )}
                    style={{ backgroundColor: value === 'transparent' ? 'transparent' : value }}
                  />
                  <span className="text-size-10 text-neutral-500">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </DropdownPanel>
      </div>

      <div className="w-px h-4 bg-neutral-200" />

      {/* 음성 녹음 */}
      {isSpeechSupported && (
        <button
          onClick={onVoiceToggle}
          className={cn(
            'min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-all active:scale-95',
            isListening ? 'bg-red-500 text-white active:bg-red-600' : 'hover:bg-neutral-100 active:bg-neutral-200 text-neutral-500'
          )}
          title="음성으로 작성"
        >
          {isListening ? <MicOff className="w-[18px] h-[18px]" /> : <Mic className="w-[18px] h-[18px]" />}
        </button>
      )}
    </div>
  );
}
