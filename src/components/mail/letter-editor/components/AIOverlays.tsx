'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Check, RefreshCw, X, RotateCcw } from 'lucide-react';
import { TypewriterLoader } from '@/components/ui/typewriter-loader';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDING_X, PADDING_BOTTOM } from '../constants';

interface AIOverlaysProps {
  scale: number | null;
  // 이어쓰기
  showContinueButton: boolean;
  continuePosition: { top: number; left: number };
  isContinuing: boolean;
  showContinueSuggestion: boolean;
  onContinue: () => void;
  onDifferent: () => void;
  onInsertSuggestion: () => void;
  // 다듬기
  showRefineButton: boolean;
  refinePosition: { top: number; left: number };
  isRefining: boolean;
  showRefineSuggestion: boolean;
  refinedText: string;
  onRefine: () => void;
  onApplyRefine: () => void;
  onCancelRefine: () => void;
  // 인라인 다듬기
  showInlineRefineButton?: boolean;
  onInlineRefine?: () => void;
  inlineRefineTop?: number | null;
  isInlineRefining?: boolean;
  // 되돌리기
  canUndo?: boolean;
  onUndoAI?: () => void;
  // 생성 중
  isGeneratingStart: boolean;
  generatingLabel: string;
}

export function AIOverlays({
  scale,
  showContinueButton,
  continuePosition,
  isContinuing,
  showContinueSuggestion,
  onContinue,
  onDifferent,
  onInsertSuggestion,
  showRefineButton,
  refinePosition,
  isRefining,
  showRefineSuggestion,
  refinedText,
  onRefine,
  onApplyRefine,
  onCancelRefine,
  showInlineRefineButton,
  onInlineRefine,
  inlineRefineTop,
  isInlineRefining,
  canUndo,
  onUndoAI,
  isGeneratingStart,
  generatingLabel,
}: AIOverlaysProps) {
  const currentScale = scale ?? 1;
  const inlineRefineFallbackTop = CANVAS_HEIGHT - PADDING_BOTTOM + 12;

  // AI 오버레이 요소에서 포인터 이벤트가 캔버스로 전파되지 않도록 방지
  const stopPointerPropagation = (e: React.PointerEvent) => e.stopPropagation();

  return (
    <>
      {/* AI 생성 중 전체 오버레이 */}
      <AnimatePresence>
        {isGeneratingStart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center ai-overlay"
            onPointerDown={stopPointerPropagation}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div className="flex flex-col items-center">
              <div className="relative mb-6 w-20 h-14 flex items-center justify-center">
                <TypewriterLoader className="typewriter-loader-large" />
              </div>
              <p className="text-orange-600 text-base font-medium mb-2">AI가 작성 중이에요</p>
              <p className="text-neutral-500 text-sm">&quot;{generatingLabel}&quot; 스타일로 문장을 만들고 있어요</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI 다듬기 버튼 */}
      <AnimatePresence>
        {showRefineButton && !isRefining && !showRefineSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-30 md:translate-x-0 -translate-x-1/2 ai-overlay"
            onPointerDown={stopPointerPropagation}
            style={{
              top: refinePosition.top,
              left: currentScale < 0.7 ? CANVAS_WIDTH / 2 : refinePosition.left,
            }}
          >
            <button
              onClick={onRefine}
              className="flex items-center gap-2 md:gap-1.5 px-4 py-3 md:px-3 md:py-2 bg-white border border-neutral-200 text-neutral-600 text-base md:text-sm rounded-full shadow-lg hover:border-orange-500 hover:text-orange-500 transition-all"
            >
              <Wand2 className="w-4 h-4 md:w-3.5 md:h-3.5 text-orange-500" />
              <span>다듬기</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 다듬기 로딩 */}
      <AnimatePresence>
        {isRefining && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-30 md:translate-x-0 -translate-x-1/2 ai-overlay"
            onPointerDown={stopPointerPropagation}
            style={{
              top: refinePosition.top,
              left: currentScale < 0.7 ? CANVAS_WIDTH / 2 : refinePosition.left,
            }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-500 text-sm rounded-full shadow-lg">
              <div className="w-10 h-6 flex items-center justify-center overflow-hidden">
                <TypewriterLoader />
              </div>
              <span>다듬는 중...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 다듬기 제안 */}
      <AnimatePresence>
        {showRefineSuggestion && !isRefining && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-30 md:translate-x-0 -translate-x-1/2 ai-overlay"
            onPointerDown={stopPointerPropagation}
            style={{
              top: refinePosition.top,
              left: currentScale < 0.7 ? CANVAS_WIDTH / 2 : refinePosition.left,
            }}
          >
            <div className="bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden max-w-[280px]">
              <div className="px-3 py-2 bg-orange-50 border-b border-orange-100">
                <p className="text-xs text-orange-600 font-medium">다듬어진 문장</p>
              </div>
              <div className="px-3 py-2">
                <p className="text-sm text-neutral-700">{refinedText}</p>
              </div>
              <div className="flex border-t border-neutral-100">
                <button
                  onClick={onCancelRefine}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-neutral-500 text-sm hover:bg-neutral-50 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>취소</span>
                </button>
                <button
                  onClick={onApplyRefine}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-orange-500 text-sm font-medium hover:bg-orange-50 transition-all border-l border-neutral-100"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>적용</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 인라인 다듬기 버튼 (마지막 줄 아래 중앙) */}
      <AnimatePresence>
        {showInlineRefineButton && !isRefining && !isInlineRefining && !showRefineSuggestion && !isGeneratingStart && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute z-30 left-0 right-0 flex justify-center ai-overlay"
            onPointerDown={stopPointerPropagation}
            style={{ top: inlineRefineTop ?? inlineRefineFallbackTop }}
          >
            <button
              onClick={onInlineRefine}
              className="flex h-8 items-center gap-1.5 px-3 bg-white/90 backdrop-blur-sm border border-orange-200 text-orange-600 text-xs rounded-full shadow-lg hover:bg-orange-50 hover:border-orange-300 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>문장 다듬기</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 인라인 다듬기 로딩 (마지막 줄 아래 중앙) */}
      <AnimatePresence>
        {isInlineRefining && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute z-30 left-0 right-0 flex justify-center ai-overlay"
            onPointerDown={stopPointerPropagation}
            style={{ top: inlineRefineTop ?? inlineRefineFallbackTop }}
          >
            <div className="flex h-8 items-center gap-2 px-3 bg-white/90 backdrop-blur-sm border border-orange-200 text-orange-600 text-xs rounded-full shadow-lg">
              <div className="w-10 h-6 flex items-center justify-center overflow-hidden">
                <TypewriterLoader />
              </div>
              <span>다듬는 중...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI 되돌리기 버튼 (인라인 다듬기와 같은 위치) */}
      <AnimatePresence>
        {canUndo && !isRefining && !isInlineRefining && !showRefineSuggestion && !showInlineRefineButton && !isGeneratingStart && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute z-30 left-0 right-0 flex justify-center ai-overlay"
            onPointerDown={stopPointerPropagation}
            style={{ top: inlineRefineTop ?? inlineRefineFallbackTop }}
          >
            <button
              onClick={onUndoAI}
              className="flex h-8 items-center gap-1.5 px-3 bg-white/90 backdrop-blur-sm border border-neutral-300 text-neutral-600 text-xs rounded-full shadow-lg hover:bg-neutral-50 hover:border-orange-300 hover:text-orange-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>되돌리기</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI 이어쓰기 버튼 */}
      <AnimatePresence>
        {showContinueButton && !isContinuing && !showContinueSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute z-30 ai-overlay"
            onPointerDown={stopPointerPropagation}
            style={{ top: continuePosition.top, left: continuePosition.left }}
          >
            <button
              onClick={onContinue}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 text-neutral-600 text-sm rounded-full shadow-lg hover:border-orange-500 hover:text-orange-500 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>이어서 쓰기</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 이어쓰기 로딩 */}
      <AnimatePresence>
        {isContinuing && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute z-30 ai-overlay"
            onPointerDown={stopPointerPropagation}
            style={{ top: continuePosition.top, left: continuePosition.left }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-500 text-sm rounded-full shadow-lg">
              <div className="w-10 h-6 flex items-center justify-center overflow-hidden">
                <TypewriterLoader />
              </div>
              <span>생성 중...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 이어쓰기 제안 */}
      <AnimatePresence>
        {showContinueSuggestion && !isContinuing && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute z-30 ai-overlay"
            onPointerDown={stopPointerPropagation}
            style={{ top: continuePosition.top, left: continuePosition.left }}
          >
            <div className="flex items-center bg-white border border-neutral-200 rounded-full shadow-lg overflow-hidden">
              <button
                onClick={onDifferent}
                className="flex items-center gap-1 px-3 py-2 text-neutral-600 text-sm hover:bg-neutral-50 transition-all border-r border-neutral-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>다르게</span>
              </button>
              <button
                onClick={onInsertSuggestion}
                className="flex items-center gap-1 px-3 py-2 text-orange-500 text-sm font-medium hover:bg-orange-50 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>넣기</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
