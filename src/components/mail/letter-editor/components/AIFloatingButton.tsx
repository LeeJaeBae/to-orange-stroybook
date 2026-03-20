'use client';

import { Sparkles, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QUICK_TAGS } from '../constants';
import { useRecipientAIProfile } from '@/hooks/useRecipientAIProfile';
import type { Page } from '../types';

interface AIFloatingButtonProps {
  floatingButtonLeft: number;
  isMobile: boolean;
  isKeyboardOpen: boolean;
  showAIMenu: boolean;
  showAITooltip: boolean;
  selectedSection: 'start' | 'middle' | 'end';
  recipientId?: string;
  pages: Page[];
  // AI 메뉴 핸들러
  onToggleAIMenu: () => void;
  onSectionChange: (section: 'start' | 'middle' | 'end') => void;
  onShowOnboarding: () => void;
  // 처음 탭
  introOptions: Array<{ label: string; text: string }>;
  isLoadingIntroOptions: boolean;
  onLoadIntroOptions: () => void;
  onIntroOptionSelect: (text: string) => void;
  // 중간 탭
  middleChatInput: string;
  onMiddleChatInputChange: (value: string) => void;
  middleExpandedPreview: { input: string; expanded: string } | null;
  isExpandingMiddle: boolean;
  onMiddleExpand: () => void;
  onMiddleInsert: () => void;
  onMiddleRetry: () => void;
  // 마무리 탭
  conclusionOptions: Array<{ label: string; text: string }>;
  isLoadingConclusionOptions: boolean;
  onLoadConclusionOptions: () => void;
  onConclusionOptionSelect: (text: string) => void;
  showConclusionCustomInput: boolean;
  onToggleConclusionCustomInput: () => void;
  conclusionCustomInput: string;
  onConclusionCustomInputChange: (value: string) => void;
  isExpandingConclusion: boolean;
  onConclusionCustomExpand: () => void;
}

export function AIFloatingButton({
  floatingButtonLeft,
  isMobile,
  isKeyboardOpen,
  showAIMenu,
  showAITooltip,
  selectedSection,
  recipientId,
  pages,
  onToggleAIMenu,
  onSectionChange,
  onShowOnboarding,
  introOptions,
  isLoadingIntroOptions,
  onLoadIntroOptions,
  onIntroOptionSelect,
  middleChatInput,
  onMiddleChatInputChange,
  middleExpandedPreview,
  isExpandingMiddle,
  onMiddleExpand,
  onMiddleInsert,
  onMiddleRetry,
  conclusionOptions,
  isLoadingConclusionOptions,
  onLoadConclusionOptions,
  onConclusionOptionSelect,
  showConclusionCustomInput,
  onToggleConclusionCustomInput,
  conclusionCustomInput,
  onConclusionCustomInputChange,
  isExpandingConclusion,
  onConclusionCustomExpand,
}: AIFloatingButtonProps) {
  const { hasProfile: hasAIProfile, isLoading: isAIProfileLoading } = useRecipientAIProfile(recipientId);
  const visibleIntroOptions = isLoadingIntroOptions ? introOptions.slice(0, 1) : introOptions;
  const visibleConclusionOptions = isLoadingConclusionOptions ? conclusionOptions.slice(0, 1) : conclusionOptions;

  return (
    <div
      className={cn(
        'floating-ai-btn fixed z-40 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:bottom-auto md:right-auto md:top-1/2 md:-translate-y-1/2 transition-all duration-200',
        isMobile && isKeyboardOpen && 'opacity-60 scale-75'
      )}
      style={{
        '--floating-left': `${floatingButtonLeft}px`,
        bottom: isMobile && isKeyboardOpen ? '0.5rem' : 'calc(6rem + env(safe-area-inset-bottom, 0px))',
      } as React.CSSProperties}
    >
      <style>{`
        @media (min-width: 768px) {
          .floating-ai-btn { left: var(--floating-left); bottom: auto !important; }
        }
      `}</style>

      {/* 툴팁 */}
      {showAITooltip && !showAIMenu && !isMobile && (
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-neutral-800 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg">
          막막할 땐 눌러보세요!
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-neutral-800" />
        </div>
      )}

      {/* AI 메뉴 */}
      {showAIMenu && (
        <div className="absolute bottom-full mb-3 w-64 max-w-[calc(100vw-2rem)] max-h-[60vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-neutral-100 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0">
          {/* AI 도우미 */}
          {recipientId && !isAIProfileLoading && (
            <button
              onClick={onShowOnboarding}
              className="w-full flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-b border-orange-200 text-sm font-medium text-orange-600 transition-colors"
            >
              <span className="text-lg">🍊</span>
              <div className="text-left">
                <p className="font-semibold">
                  {hasAIProfile
                    ? 'AI 도우미 이어서 대화'
                    : pages.some((p) => p.content.trim().length > 0)
                      ? 'AI 도우미와 편지 다듬기'
                      : 'AI 도우미로 시작하기'}
                </p>
                <p className="text-xs text-orange-400 font-normal">
                  {hasAIProfile
                    ? '이전 대화를 불러와 계속해요'
                    : pages.some((p) => p.content.trim().length > 0)
                      ? '쓴 내용을 기반으로 도와줘요'
                      : '대화로 편지 초안을 만들어요'}
                </p>
              </div>
            </button>
          )}

          {/* 탭 */}
          <div className="flex border-b border-neutral-100">
            {(['start', 'middle', 'end'] as const).map((key) => (
              <button
                key={key}
                onClick={() => {
                  onSectionChange(key);
                  if (key === 'start') onLoadIntroOptions();
                  if (key === 'end') onLoadConclusionOptions();
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs transition-all',
                  selectedSection === key
                    ? 'text-orange-500 border-b-2 border-orange-500 -mb-px bg-orange-50/50'
                    : 'text-neutral-500 hover:bg-neutral-50'
                )}
              >
                <span>{QUICK_TAGS[key].label}</span>
              </button>
            ))}
          </div>

          {/* 탭 내용 */}
          <div className="p-3">
            {/* 처음 탭 */}
            {selectedSection === 'start' && (
              <div className="space-y-2">
                {isLoadingIntroOptions && visibleIntroOptions.length === 0 ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full" />
                    <span className="ml-2 text-xs text-neutral-500">AI가 서문을 작성하고 있습니다...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-neutral-400">AI가 만든 시작 문장</p>
                      <button
                        onClick={onLoadIntroOptions}
                        disabled={isLoadingIntroOptions}
                        className="text-xs text-orange-500 hover:text-orange-600 p-1 disabled:opacity-40"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {visibleIntroOptions.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => onIntroOptionSelect(option.text)}
                          className="w-full text-left p-2 text-xs bg-neutral-50 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all"
                        >
                          {option.text}
                        </button>
                      ))}
                      {isLoadingIntroOptions && visibleIntroOptions.length > 0 && (
                        <div className="flex items-center gap-2 px-2 py-1 text-[11px] text-neutral-400">
                          <div className="animate-spin w-3 h-3 border-2 border-orange-200 border-t-orange-500 rounded-full" />
                          <span>먼저 1개 보여주는 중, 나머지 문장 생성 중...</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 중간 탭 */}
            {selectedSection === 'middle' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={middleChatInput}
                    onChange={(e) => onMiddleChatInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && middleChatInput.trim()) onMiddleExpand();
                    }}
                    placeholder="짧은 문장을 입력하면 AI가 자연스럽게 확장해요"
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:border-orange-300 focus:ring-1 focus:ring-orange-200 outline-none"
                    disabled={isExpandingMiddle}
                  />
                  <button
                    onClick={onMiddleExpand}
                    disabled={!middleChatInput.trim() || isExpandingMiddle}
                    className="w-full py-2 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50"
                  >
                    {isExpandingMiddle ? 'AI가 본문을 확장하고 있습니다...' : '확장하기'}
                  </button>
                </div>
                {middleExpandedPreview && (
                  <div className="border border-neutral-200 rounded-lg p-2 bg-neutral-50">
                    <p className="text-xs text-neutral-600 mb-2">{middleExpandedPreview.expanded}</p>
                    <div className="flex gap-1">
                      <button onClick={onMiddleRetry} className="flex-1 py-1 text-xs text-neutral-600 hover:bg-neutral-200 rounded">
                        다시
                      </button>
                      <button onClick={onMiddleInsert} className="flex-1 py-1 text-xs text-orange-600 hover:bg-orange-100 rounded">
                        넣기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 마무리 탭 */}
            {selectedSection === 'end' && (
              <div className="space-y-2">
                {isLoadingConclusionOptions && visibleConclusionOptions.length === 0 ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full" />
                    <span className="ml-2 text-xs text-neutral-500">AI가 마무리를 작성하고 있습니다...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-neutral-400">AI가 만든 마무리 문장</p>
                      <button
                        onClick={onLoadConclusionOptions}
                        disabled={isLoadingConclusionOptions}
                        className="text-xs text-orange-500 hover:text-orange-600 p-1 disabled:opacity-40"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {visibleConclusionOptions.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => onConclusionOptionSelect(option.text)}
                          className="w-full text-left p-2 text-xs bg-neutral-50 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all"
                        >
                          {option.text}
                        </button>
                      ))}
                      {isLoadingConclusionOptions && visibleConclusionOptions.length > 0 && (
                        <div className="flex items-center gap-2 px-2 py-1 text-[11px] text-neutral-400">
                          <div className="animate-spin w-3 h-3 border-2 border-orange-200 border-t-orange-500 rounded-full" />
                          <span>먼저 1개 보여주는 중, 나머지 문장 생성 중...</span>
                        </div>
                      )}
                      <button
                        onClick={onToggleConclusionCustomInput}
                        className="w-full text-center p-2 text-xs text-neutral-500 hover:bg-neutral-100 border border-dashed border-neutral-300 rounded-lg transition-all"
                      >
                        + 직접 입력
                      </button>
                      {showConclusionCustomInput && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={conclusionCustomInput}
                            onChange={(e) => onConclusionCustomInputChange(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && conclusionCustomInput.trim()) onConclusionCustomExpand();
                            }}
                            placeholder="마무리할 내용을 간단히 적어주세요"
                            className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:border-orange-300 focus:ring-1 focus:ring-orange-200 outline-none"
                            disabled={isExpandingConclusion}
                          />
                          <button
                            onClick={onConclusionCustomExpand}
                            disabled={!conclusionCustomInput.trim() || isExpandingConclusion}
                            className="w-full py-2 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50"
                          >
                            {isExpandingConclusion ? '확장 중...' : '확장해서 넣기'}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI 버튼 */}
      <button
        onClick={onToggleAIMenu}
        className={cn(
          'ai-glow-btn group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
          showAIMenu ? 'bg-neutral-800 text-white' : 'text-orange-500 hover:scale-110'
        )}
      >
        {!showAIMenu && (
          <>
            <span className="absolute inset-0 rounded-full overflow-hidden z-[-2]">
              <span
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, #f97316 0%, #fb923c 25%, #fdba74 50%, #fb923c 75%, #f97316 100%)',
                  animation: 'spin 3s ease-in-out infinite alternate',
                  filter: 'blur(10px)',
                  willChange: 'transform',
                  opacity: 0.9,
                }}
              />
            </span>
            <span
              className="absolute inset-0 rounded-full z-[-1] transition-all duration-300 group-hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)',
              }}
            />
            <span
              className="absolute inset-[-4px] rounded-full z-[-3] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%)',
              }}
            />
          </>
        )}
        <span
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
            showAIMenu ? '' : 'bg-gradient-to-b from-white to-neutral-50 shadow-inner group-hover:from-orange-50 group-hover:to-white'
          )}
        >
          {showAIMenu ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />}
        </span>
      </button>

    </div>
  );
}
