'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types & Data (hero-specific)
// ---------------------------------------------------------------------------

interface AIDemoEntry {
  before: string;
  after: string;
  label: string;
}

const aiDemoData: Record<string, AIDemoEntry> = {
  greeting: {
    before: '아들아, 잘 지내고 있니?',
    after: '아들아, 엄마야. 요즘 하루가 어떻게 흘러가는지 자꾸 생각이 나더라. 잘 지내고 있는지, 밥은 거르지 않는지 궁금했어. 이렇게라도 안부를 전하고 싶어서 편지를 쓴다.',
    label: '인사말',
  },
  middle: {
    before: '거기 날씨는 어떤지 잘 모르겠네. 밥은 잘 챙겨 먹고 있는지 걱정된다.',
    after: '네가 있는 곳 한달치 날씨정보와 두뇌회전에 좋은 스도쿠를 보내. 스도쿠는 하루에 한 장씩만 풀어도 괜찮아. 시간이 멈춘 것처럼 느껴질 때, 머리를 잠깐 다른 데로 쓰는 것만으로도 숨이 트이더라.',
    label: '중간',
  },
  closing: {
    before: '몸 건강히 잘 지내고 있어. 항상 생각하고 있다.',
    after: '멀리 떨어져 있어도 엄마는 늘 네 하루를 생각하고 있어. 이 편지가 도착하는 순간만큼은 네가 혼자가 아니라는 걸 느꼈으면 좋겠다.',
    label: '마무리',
  },
};

const DEMO_PARTS = ['greeting', 'middle', 'closing'] as const;
const AUTO_CYCLE_MS = 14_000;

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useTypewriter(speed = 35) {
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const cancelRef = useRef(false);

  const start = useCallback(
    (fullText: string, onDone?: () => void) => {
      cancelRef.current = false;
      setText('');
      setTyping(true);
      let i = 0;
      let current = '';

      const tick = () => {
        if (cancelRef.current) return;
        if (i < fullText.length) {
          current += fullText.charAt(i);
          i++;
          setText(current);
          setTimeout(tick, speed + Math.random() * 20);
        } else {
          setTyping(false);
          onDone?.();
        }
      };
      tick();
    },
    [speed],
  );

  const cancel = useCallback(() => {
    cancelRef.current = true;
    setTyping(false);
  }, []);

  return { text, typing, start, cancel };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HeroAIDemo({ onGrayscaleChange }: { onGrayscaleChange?: (gs: boolean) => void }) {
  const [activePart, setActivePart] = useState<string>('greeting');
  const [phase, setPhase] = useState<'before' | 'loading' | 'after'>('before');
  const beforeTw = useTypewriter(30);
  const afterTw = useTypewriter(35);
  const autoIndexRef = useRef(0);
  const runningRef = useRef(false);

  // Run a single demo cycle for a given part
  const runCycle = useCallback(
    (part: string) => {
      if (runningRef.current) return;
      runningRef.current = true;

      const data = aiDemoData[part];
      setActivePart(part);
      setPhase('before');
      afterTw.cancel();
      onGrayscaleChange?.(true);

      beforeTw.start(data.before, () => {
        setTimeout(() => setPhase('loading'), 800);
        setTimeout(() => {
          setPhase('after');
          onGrayscaleChange?.(false);
          afterTw.start(data.after, () => {
            runningRef.current = false;
          });
        }, 3000);
      });
    },
    [beforeTw, afterTw, onGrayscaleChange],
  );

  // Initial demo
  useEffect(() => {
    const t = setTimeout(() => runCycle('greeting'), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-cycle
  useEffect(() => {
    const interval = setInterval(() => {
      if (runningRef.current) return;
      autoIndexRef.current = (autoIndexRef.current + 1) % DEMO_PARTS.length;
      runCycle(DEMO_PARTS[autoIndexRef.current]);
    }, AUTO_CYCLE_MS);
    return () => clearInterval(interval);
  }, [runCycle]);

  // Manual click
  const handlePartClick = (part: string) => {
    if (runningRef.current) return;
    beforeTw.cancel();
    afterTw.cancel();
    runningRef.current = false;
    runCycle(part);
  };

  const showAfter = phase === 'after';
  const isLoading = phase === 'loading';

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
        {/* Titlebar */}
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2 md:px-4 md:py-3">
          <div className="flex items-center space-x-1.5 md:space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400 md:h-3 md:w-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 md:h-3 md:w-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400 md:h-3 md:w-3" />
          </div>
          <span className="text-[10px] text-muted-foreground md:text-xs">
            {aiDemoData[activePart].label} 다듬기
          </span>
          <div className="w-12 md:w-16" />
        </div>

        {/* Content */}
        <div className="min-h-[240px] p-4 md:min-h-[300px] md:p-5">
          <div className="relative">
            {/* Phase label */}
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`text-sm font-bold transition-colors duration-700 md:text-base ${
                  showAfter ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {showAfter ? 'AFTER' : 'BEFORE'}
              </span>
              <span
                className={`text-xs font-medium transition-colors duration-700 md:text-sm ${
                  showAfter ? 'text-primary/80' : 'text-muted-foreground'
                }`}
              >
                {showAfter ? 'AI가 다듬은 문장' : '내가 쓴 문장'}
              </span>
            </div>

            {/* Text area */}
            <div
              className={`min-h-[140px] rounded-xl border p-3 transition-all duration-1000 ease-out md:min-h-[180px] md:p-4 ${
                showAfter
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-muted/50'
              }`}
            >
              <AnimatePresence mode="wait">
                {phase === 'before' && (
                  <motion.p
                    key="before"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-xs leading-relaxed text-muted-foreground md:text-sm"
                  >
                    {beforeTw.text}
                    {beforeTw.typing && (
                      <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-muted-foreground md:h-5" />
                    )}
                  </motion.p>
                )}

                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[116px] items-center justify-center gap-2 md:min-h-[148px] md:gap-3"
                  >
                    <svg
                      className="h-4 w-4 animate-spin text-primary md:h-5 md:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-primary md:text-base">
                      당신이 이렇게 쓰면
                    </span>
                  </motion.div>
                )}

                {showAfter && (
                  <motion.div
                    key="after"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-xs leading-relaxed text-foreground md:text-sm">
                      {afterTw.text}
                      {afterTw.typing && (
                        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle md:h-5" />
                      )}
                    </p>
                    <AnimatePresence>
                      {!afterTw.typing && (
                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 border-t border-primary/30 pt-3 text-center text-sm font-semibold text-primary md:mt-6 md:pt-4 md:text-base"
                        >
                          &#x2728; 이렇게 전해집니다
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Part selector buttons */}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 md:mt-5 md:pt-4">
            <span className="text-xs font-medium text-muted-foreground md:text-sm">
              &#x2728; AI 다듬기
            </span>
            <div className="flex gap-1.5 md:gap-2">
              {Object.entries(aiDemoData).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePartClick(key)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] transition-all duration-200 active:scale-95 md:gap-1.5 md:px-4 md:py-2 md:text-xs ${
                    activePart === key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground md:mt-4 md:text-sm">
        버튼을 눌러 AI 다듬기를 체험해보세요
      </p>
    </div>
  );
}
