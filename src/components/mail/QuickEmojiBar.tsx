import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Sprout, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

// 오렌지 성장단계 이모티콘 이미지 import
import orangeSeed from "@/assets/emoticons/orange-seed.png";
import orangeSprout from "@/assets/emoticons/orange-sprout.png";
import orangeYoungTree from "@/assets/emoticons/orange-young-tree.png";
import orangeFullTree from "@/assets/emoticons/orange-full-tree.png";
import orangeRipe from "@/assets/emoticons/orange-ripe.png";

const orangeSeedSrc = typeof orangeSeed === "string" ? orangeSeed : orangeSeed.src;
const orangeSproutSrc = typeof orangeSprout === "string" ? orangeSprout : orangeSprout.src;
const orangeYoungTreeSrc =
  typeof orangeYoungTree === "string" ? orangeYoungTree : orangeYoungTree.src;
const orangeFullTreeSrc =
  typeof orangeFullTree === "string" ? orangeFullTree : orangeFullTree.src;
const orangeRipeSrc = typeof orangeRipe === "string" ? orangeRipe : orangeRipe.src;

interface QuickEmojiBarProps {
  onSelect: (emoji: string) => void;
}

// 빠른 접근 이모지 (자주 사용되는 것들)
const quickEmojis = ["😊", "🥰", "😢", "😭", "🤗", "😌", "🙏", "❤️", "💕", "🧡", "💛", "🌸", "🌷", "☀️", "🌙", "⭐"];

// 오렌지 성장단계 캐릭터
const orangeGrowthStages = [
  { image: orangeSeedSrc, label: "씨앗", emoji: "🌱", description: "시작의 설렘" },
  { image: orangeSproutSrc, label: "새싹", emoji: "🌿", description: "희망의 싹" },
  { image: orangeYoungTreeSrc, label: "어린나무", emoji: "🌳", description: "성장하는 중" },
  { image: orangeFullTreeSrc, label: "풍성한 나무", emoji: "🍊🌳", description: "결실의 기쁨" },
  { image: orangeRipeSrc, label: "익은 오렌지", emoji: "🍊", description: "완성된 사랑" },
];

// 전체 카테고리
const emojiCategories = {
  감정: ["😊", "🥹", "🥰", "🥺", "😭", "😤", "🤗", "😌", "🙏"],
  하트: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💕", "💗", "💝"],
  자연: ["🌸", "🌺", "🌷", "🌻", "🍀", "🌿", "🌙", "⭐"],
  날씨: ["☀️", "🌤️", "☁️", "❄️", "🌈", "💧", "🔥", "⚡"],
  기타: ["✨", "💪", "👍", "👐", "💐", "🎁", "📮", "✉️", "💌"],
};

export function QuickEmojiBar({ onSelect }: QuickEmojiBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"emoji" | "orange">("emoji");

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji);
  };

  return (
    <div className="space-y-3">
      {/* 빠른 이모지 바 - 높이 44px 통일 */}
      <div className="flex items-center h-11 gap-1.5 px-2 bg-muted/30 rounded-xl border border-border/30">
        {/* 이모지 라벨 */}
        <div className="flex items-center gap-1 pr-2 border-r border-border/40">
          <Smile className="w-4 h-4 text-muted-foreground" />
          <span className="text-size-10 font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">이모지</span>
        </div>
        
        {/* 이모지 목록 */}
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-thin">
          {quickEmojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted hover:scale-110 rounded-lg transition-all duration-150 shrink-0"
            >
              {emoji}
            </button>
          ))}
        </div>
        
        {/* 더보기 버튼 - 오른쪽 정렬 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-0.5 px-2 py-1 rounded-md text-size-10 font-medium transition-all shrink-0",
            isExpanded 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {isExpanded ? (
            <>
              접기 <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              더보기 <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {/* 확장된 이모지 패널 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-muted/30 rounded-xl p-3 space-y-3">
              {/* 탭 헤더 */}
              <div className="flex items-center gap-1.5 border-b border-border/50 pb-2.5">
                <button
                  onClick={() => setActiveTab("emoji")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    activeTab === "emoji"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  이모지
                </button>
                <button
                  onClick={() => setActiveTab("orange")}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    activeTab === "orange"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  <span className="text-sm">🍊</span>
                  오렌지
                </button>
              </div>

              {activeTab === "emoji" ? (
                /* 일반 이모지 카테고리 */
                <>
                  {Object.entries(emojiCategories).map(([category, emojis]) => (
                    <div key={category}>
                      <p className="text-size-10 font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{category}</p>
                      <div className="flex flex-wrap gap-0.5">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => handleEmojiClick(emoji)}
                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-card hover:scale-105 rounded-md transition-all duration-150"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                /* 오렌지 성장단계 탭 */
                <div className="space-y-4">
                  {/* 성장단계 이모티콘 */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sprout className="w-4 h-4 text-green-500" />
                      <p className="text-xs font-medium text-foreground">오렌지 성장 이야기</p>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {orangeGrowthStages.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiClick(item.emoji)}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-card transition-all hover:scale-105 group"
                        >
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 p-1.5 shadow-sm group-hover:shadow-md transition-shadow">
                            <img 
                              src={item.image} 
                              alt={item.label}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          <div className="text-center">
                            <span className="text-xs font-medium text-foreground block">{item.label}</span>
                            <span className="text-size-10 text-muted-foreground">{item.description}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-size-10 text-center text-muted-foreground mt-3 italic">
                      씨앗에서 열매까지, 마음도 함께 자라요 🌱
                    </p>
                  </div>

                  {/* 오렌지 이모지 조합 */}
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">오렌지 이모지 조합</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { emoji: "🍊", label: "기본" },
                        { emoji: "😊🍊", label: "행복" },
                        { emoji: "😢🍊", label: "슬픔" },
                        { emoji: "😍🍊", label: "사랑" },
                        { emoji: "🤗🍊", label: "응원" },
                        { emoji: "🙏🍊", label: "감사" },
                      ].map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiClick(item.emoji)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-card transition-colors"
                        >
                          <span className="text-lg">{item.emoji}</span>
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
