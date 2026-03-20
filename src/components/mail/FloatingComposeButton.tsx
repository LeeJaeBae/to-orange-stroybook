import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Heart, Sparkles } from "lucide-react";

interface FloatingComposeButtonProps {
  onCompose: () => void;
  daysSinceLastLetter: number;
  draftCount?: number;
}

const motivationalMessages = [
  "오늘 따뜻한 한마디 어때요? 💌",
  "마음을 전해보세요 ✨",
  "편지 한 통이 큰 힘이 됩니다",
  "소중한 사람에게 안부를 전하세요",
  "오늘의 이야기를 나눠보세요",
];

export const FloatingComposeButton = ({
  onCompose,
  daysSinceLastLetter,
  draftCount = 0,
}: FloatingComposeButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 메시지 순환
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % motivationalMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 주기적으로 툴팁 표시
  useEffect(() => {
    const showInterval = setInterval(() => {
      if (!isHovered) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 4000);
      }
    }, 15000);

    // 초기 3초 후 첫 표시
    const initialTimeout = setTimeout(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 4000);
    }, 3000);

    return () => {
      clearInterval(showInterval);
      clearTimeout(initialTimeout);
    };
  }, [isHovered]);

  const getUrgencyMessage = () => {
    if (daysSinceLastLetter >= 7) {
      return "벌써 일주일이 지났어요!";
    } else if (daysSinceLastLetter >= 3) {
      return `${daysSinceLastLetter}일째 편지를 안 보내셨네요`;
    }
    return null;
  };

  const urgencyMessage = getUrgencyMessage();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* 임시저장 알림 */}
      {draftCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 shadow-lg max-w-[220px]"
        >
          <div className="flex items-start gap-2">
            <span className="text-amber-500 text-lg">📝</span>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-amber-800">
                임시저장된 편지가 {draftCount}개 있습니다.
              </p>
              <p className="text-xs text-amber-600">
                이어서 계속 작성하세요!
              </p>
            </div>
          </div>
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-amber-50 border-r border-b border-amber-200 rotate-45" />
        </motion.div>
      )}

      {/* 동기부여 메시지 툴팁 */}
      <AnimatePresence>
        {(showTooltip || isHovered) && draftCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-card border border-border rounded-2xl px-4 py-3 shadow-lg max-w-[200px]"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                {urgencyMessage && (
                  <p className="text-xs text-primary font-medium">
                    {urgencyMessage}
                  </p>
                )}
                <p className="text-sm text-foreground">
                  {motivationalMessages[messageIndex]}
                </p>
              </div>
            </div>
            {/* 화살표 */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card border-r border-b border-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 플로팅 버튼 */}
      <motion.button
        onClick={onCompose}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* 펄스 애니메이션 배경 */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* 버튼 본체 */}
        <div className="relative flex items-center gap-2 bg-primary text-primary-foreground px-5 py-4 rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <PenLine className="w-5 h-5" />
          <span className="font-medium text-sm">편지쓰기</span>
          <Heart className="w-4 h-4 opacity-80" />
        </div>

        {/* 배지 - 며칠째 안 보냈는지 */}
        {daysSinceLastLetter >= 3 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md"
          >
            {daysSinceLastLetter}
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};
