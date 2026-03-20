'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const TONE_OPTIONS = [
  { id: 'warm', label: '따뜻하게', emoji: '🧡', desc: '부드럽고 따뜻한 말투' },
  { id: 'casual', label: '편하게', emoji: '😊', desc: '친구처럼 편한 말투' },
  { id: 'formal', label: '정중하게', emoji: '🙏', desc: '존댓말, 격식 있게' },
  { id: 'cheerful', label: '밝게', emoji: '✨', desc: '밝고 긍정적인 말투' },
  { id: 'calm', label: '담담하게', emoji: '🌿', desc: '차분하고 담백하게' },
  { id: 'honest', label: '솔직하게', emoji: '💬', desc: '꾸밈없이 솔직하게' },
] as const;

interface ToneRefineSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTone: (toneId: string, toneLabel: string, keepMyStyle: boolean) => void;
}

export function ToneRefineSheet({ isOpen, onClose, onSelectTone }: ToneRefineSheetProps) {
  const [keepMyStyle, setKeepMyStyle] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />
          {/* 바텀시트 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl shadow-2xl md:max-w-2xl md:mx-auto"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">어떤 말투로 다듬을까요?</h3>
                <p className="text-sm text-neutral-500 mt-0.5">말투를 선택하면 전체 편지를 다듬어드려요</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {/* 말투 옵션 */}
            <div className="px-5 pb-3 grid grid-cols-2 gap-2.5">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => onSelectTone(tone.id, tone.label, keepMyStyle)}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-neutral-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all text-left active:scale-[0.98]"
                >
                  <span className="text-xl mt-0.5">{tone.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-800">{tone.label}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{tone.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* 내 말투 유지 토글 */}
            <div className="mx-5 mb-5 px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700">내 말투 유지</p>
                <p className="text-xs text-neutral-500 mt-0.5">맞춤법과 어색한 표현만 수정해요</p>
              </div>
              <button
                onClick={() => setKeepMyStyle((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  keepMyStyle ? 'bg-orange-500' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    keepMyStyle ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* 하단 safe area */}
            <div className="h-[env(safe-area-inset-bottom,0px)]" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
