'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api/fetch';
import { toast } from 'sonner';

interface DraftPreviewSheetProps {
  isOpen: boolean;
  draftText: string;
  onDraftTextChange: (text: string) => void;
  onAccept: () => void;
  recipientName?: string;
  recipientRelation?: string;
  recipientFacility?: string;
  recipientId?: string;
}

export function DraftPreviewSheet({
  isOpen,
  draftText,
  onDraftTextChange,
  onAccept,
  recipientName,
  recipientRelation,
  recipientFacility,
  recipientId,
}: DraftPreviewSheetProps) {
  const [isRefining, setIsRefining] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRefine = async (instruction: string) => {
    if (isRefining) return;
    setIsRefining(true);
    try {
      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'tone',
          content: draftText,
          toneId: 'custom',
          toneLabel: instruction,
          toneDescription: `다음 지시에 따라 편지를 수정하세요: ${instruction}. 원문의 전체 길이와 내용을 유지하되 지시사항에 맞게 톤/스타일만 조정하세요.`,
          recipientName,
          recipientRelation,
          recipientFacility,
          recipientId,
        }),
      });
      const result = await response.json();
      if (result.data) {
        onDraftTextChange(result.data);
      }
    } catch (err) {
      console.error('미세 튜닝 실패:', err);
      toast.error('수정에 실패했습니다');
    } finally {
      setIsRefining(false);
      setCustomInput('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onAccept}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 flex flex-col bg-white rounded-t-2xl h-[85vh] shadow-2xl md:max-w-2xl md:mx-auto"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* 드래그 핸들 — 스와이프 다운 닫기 */}
            <motion.div
              className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  onAccept();
                }
              }}
            >
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </motion.div>

            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-orange-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">AI 초안 미리보기</h3>
                  <p className="text-xs text-muted-foreground">마음에 들 때까지 다듬어보세요</p>
                </div>
              </div>
              <button
                onClick={onAccept}
                className="px-4 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors"
              >
                이대로 쓸게
              </button>
            </div>

            {/* 초안 내용 */}
            <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
              {isRefining && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-orange-50 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-orange-600">수정 중...</span>
                </div>
              )}
              <div
                className={cn(
                  'text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap transition-opacity',
                  isRefining && 'opacity-50'
                )}
              >
                {draftText}
              </div>
            </div>

            {/* 미세 튜닝 버튼들 */}
            <div className="px-4 py-3 border-t border-neutral-100 safe-area-bottom">
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { label: '더 짧게', icon: '✂️' },
                  { label: '더 따뜻하게', icon: '🧡' },
                  { label: '더 솔직하게', icon: '💬' },
                  { label: '더 정중하게', icon: '🙏' },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleRefine(opt.label)}
                    disabled={isRefining}
                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600 transition-colors disabled:opacity-40"
                  >
                    <span>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
              {/* 커스텀 입력 */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-neutral-50 rounded-full px-4 py-2 border border-neutral-200 focus-within:border-orange-300 focus-within:ring-1 focus-within:ring-orange-200 transition-all">
                  <input
                    ref={inputRef}
                    autoFocus
                    type="text"
                    value={customInput}
                    onChange={(e) => {
                      e.stopPropagation();
                      setCustomInput(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customInput.trim()) {
                        e.preventDefault();
                        handleRefine(customInput.trim());
                      }
                    }}
                    placeholder="이건 어때? 직접 입력..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
                    disabled={isRefining}
                  />
                </div>
                <button
                  onClick={() => {
                    if (customInput.trim()) {
                      handleRefine(customInput.trim());
                    }
                  }}
                  disabled={!customInput.trim() || isRefining}
                  className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-orange-600 transition-colors shrink-0"
                >
                  <Wand2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
