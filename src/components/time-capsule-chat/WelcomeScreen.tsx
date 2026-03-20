"use client";

import { useState } from "react";
import { OrangeSphere } from "./OrangeSphere";
import { RainEffect } from "./RainEffect";
import { ArrowUp, X } from "lucide-react";
import { GuideChips, guides } from "./GuideChips";
import { motion, AnimatePresence } from "framer-motion";
import type { Guide } from "./types";

interface WelcomeScreenProps {
  recipientName: string;
  onStartChat?: () => void;
  todayMessageCount?: number;
}

export function WelcomeScreen({ recipientName, onStartChat, todayMessageCount = 0 }: WelcomeScreenProps) {
  const [inputValue, setInputValue] = useState("");
  const [isManuallyActivated, setIsManuallyActivated] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<Guide | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Show colorful version if already has messages today OR manually activated
  const showColorful = todayMessageCount > 0 || isManuallyActivated;

  const handleSendClick = () => {
    if (inputValue.trim() === "응원한다" && !showColorful) {
      setIsManuallyActivated(true);
    }
  };

  const handleEnterChat = () => {
    onStartChat?.();
  };

  // FAQ 클릭 핸들러
  const handleFaqClick = (guide: Guide) => {
    setSelectedFaq(guide);
  };

  // FAQ 닫기 핸들러
  const handleCloseFaq = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedFaq(null);
      setIsClosing(false);
    }, 800);
  };

  return (
    <div className={`flex-1 flex flex-col relative transition-all duration-1000 ${!showColorful ? 'grayscale' : ''}`}>
      {/* Rain Effect - only when not activated */}
      {!showColorful && <RainEffect />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {!showColorful ? (
          <>
            {/* Grayscale State */}
            <div className="mb-6 opacity-50">
              <OrangeSphere size="lg" />
            </div>

            <div className="text-center mb-8">
              <p className="text-2xl font-bold text-foreground leading-loose">
                {recipientName}님에게
              </p>
              <p className="text-2xl font-bold text-foreground leading-loose">
                오늘 0명이
              </p>
              <p className="text-2xl font-bold text-foreground leading-loose">
                쪽지를 보냈습니다.
              </p>
            </div>

          </>
        ) : (
          <>
            {/* Activated State - Colorful */}
            <AnimatePresence mode="wait">
              {!selectedFaq ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <div className="mb-6 animate-float">
                    <OrangeSphere size="lg" />
                  </div>

                  {todayMessageCount > 0 ? (
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-foreground leading-relaxed">
                        안녕하세요,<br />
                        <span className="text-primary">{recipientName}</span>님에게<br />
                        전할 마음이 있으신가요?
                      </h1>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-foreground leading-relaxed">
                        좋아요.<br />
                        이제 마음을 전할 수 있어요.
                      </h1>
                    </div>
                  )}

                  {/* Enter Chat Button */}
                  <button
                    onClick={handleEnterChat}
                    className="mt-8 px-8 py-3 bg-foreground text-white rounded-full font-medium text-sm shadow-lg hover:bg-foreground/90 transition-all active:scale-95"
                  >
                    입장하기
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="faq-answer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isClosing ? 0 : 1 }}
                  transition={{ duration: isClosing ? 0.6 : 0.8, ease: "easeInOut" }}
                  className="flex flex-col items-center w-full px-4"
                >
                  {/* 닫기 버튼 */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isClosing ? 0 : 1 }}
                    transition={{ duration: 0.5, delay: isClosing ? 0 : 0.3 }}
                    onClick={handleCloseFaq}
                    className="absolute top-16 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </motion.button>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isClosing ? 0 : 1 }}
                    transition={{ duration: 0.6, delay: isClosing ? 0 : 0.2 }}
                    className="mb-6"
                  >
                    <OrangeSphere size="lg" />
                  </motion.div>

                  {/* 질문 타이틀 */}
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isClosing ? 0 : 1 }}
                    transition={{ duration: 0.8, delay: isClosing ? 0 : 0.4 }}
                    className="text-lg font-bold text-foreground mb-6 text-center"
                  >
                    {selectedFaq.label}
                  </motion.h2>

                  {/* 답변 - 천천히 페이드인 (0% → 100%) */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isClosing ? 0 : 1 }}
                    transition={{ duration: 1.5, delay: isClosing ? 0 : 0.8, ease: "easeOut" }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-border/50 max-w-[320px]"
                  >
                    <p className="text-sm text-foreground leading-relaxed">
                      {selectedFaq.content}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Guide Chips - only in colorful state and not showing FAQ answer */}
      {showColorful && !selectedFaq && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="pb-8 pt-4"
        >
          <GuideChips onFaqClick={handleFaqClick} />
        </motion.div>
      )}

      {/* Input Area */}
      {!showColorful && (
        <div className="px-5 pb-8 pt-2">
          <p className="text-sm text-muted-foreground text-center mb-4 leading-relaxed">
            &quot;응원한다&quot; 한 마디가<br />
            이 공간을 다시 따뜻하게 만듭니다.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="응원한다"
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
              />

              <button
                onClick={handleSendClick}
                disabled={inputValue.trim() !== "응원한다"}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${inputValue.trim() === "응원한다"
                    ? 'bg-foreground text-white'
                    : 'bg-muted-foreground/20 text-muted-foreground'}
                `}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
