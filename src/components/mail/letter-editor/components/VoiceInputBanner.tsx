'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MicOff } from 'lucide-react';

interface VoiceInputBannerProps {
  isListening: boolean;
  interimTranscript: string;
  onStop: () => void;
}

export function VoiceInputBanner({ isListening, interimTranscript, onStop }: VoiceInputBannerProps) {
  return (
    <>
      {/* 상단 표시줄 */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border-b border-red-100 px-4 py-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-red-600">음성 인식 중...</span>
              {interimTranscript && (
                <span className="text-xs text-neutral-600 italic">&quot;{interimTranscript}&quot;</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 플로팅 끄기 버튼 */}
      <AnimatePresence>
        {isListening && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onStop}
            className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-red-500 text-white shadow-lg flex items-center justify-center"
            style={{
              animation: 'pulse-ring 1.5s ease-in-out infinite',
            }}
          >
            <MicOff className="w-6 h-6" />
            <style>{`
              @keyframes pulse-ring {
                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
                70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
              }
            `}</style>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
