import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, Smile, Heart, ThumbsUp, Coffee, Sparkles, X, Sprout } from "lucide-react";
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

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

type Category = "recent" | "smileys" | "love" | "gestures" | "food" | "nature";

const categories = [
  { id: "recent" as Category, icon: <Clock className="w-4 h-4" />, label: "최근" },
  { id: "smileys" as Category, icon: <Smile className="w-4 h-4" />, label: "표정" },
  { id: "love" as Category, icon: <Heart className="w-4 h-4" />, label: "사랑" },
  { id: "gestures" as Category, icon: <ThumbsUp className="w-4 h-4" />, label: "제스처" },
  { id: "food" as Category, icon: <Coffee className="w-4 h-4" />, label: "음식" },
  { id: "nature" as Category, icon: <Sparkles className="w-4 h-4" />, label: "자연" },
];

const emojis: Record<Category, string[]> = {
  recent: ["😊", "❤️", "👍", "🙏", "💕", "😢", "🥰", "😭"],
  smileys: [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
    "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
    "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜",
    "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐",
    "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬",
    "😮‍💨", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷",
    "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴",
    "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐",
    "😕", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳",
    "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭",
  ],
  love: [
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
    "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
    "💘", "💝", "💟", "♥️", "😍", "🥰", "😘", "💋",
    "🫶", "💑", "💏", "👩‍❤️‍👨", "👨‍❤️‍👨", "👩‍❤️‍👩", "🫀", "💌",
  ],
  gestures: [
    "👋", "🤚", "🖐", "✋", "🖖", "👌", "🤌", "🤏",
    "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆",
    "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛",
    "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️",
    "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃",
  ],
  food: [
    "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓",
    "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝",
    "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶", "🫑",
    "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐",
    "🍕", "🍔", "🍟", "🌭", "🍿", "🧂", "🥚", "🍳",
    "☕", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍷",
  ],
  nature: [
    "🌸", "💮", "🏵", "🌹", "🥀", "🌺", "🌻", "🌼",
    "🌷", "🌱", "🪴", "🌲", "🌳", "🌴", "🌵", "🌾",
    "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🪻", "🪷",
    "🌍", "🌎", "🌏", "🌙", "⭐", "🌟", "✨", "💫",
    "☀️", "🌤", "⛅", "🌈", "❄️", "💧", "🌊", "🔥",
  ],
};

// 오렌지 성장단계 캐릭터
const orangeGrowthStages = [
  { image: orangeSeedSrc, label: "씨앗", description: "시작의 설렘" },
  { image: orangeSproutSrc, label: "새싹", description: "희망의 싹" },
  { image: orangeYoungTreeSrc, label: "어린나무", description: "성장하는 중" },
  { image: orangeFullTreeSrc, label: "풍성한 나무", description: "결실의 기쁨" },
  { image: orangeRipeSrc, label: "익은 오렌지", description: "완성된 사랑" },
];

// 기본 오렌지 이모지 조합
const orangeEmoticons = [
  { emoji: "🍊", label: "기본" },
  { emoji: "😊🍊", label: "행복" },
  { emoji: "😢🍊", label: "슬픔" },
  { emoji: "😍🍊", label: "사랑" },
  { emoji: "🤗🍊", label: "응원" },
  { emoji: "😴🍊", label: "졸림" },
  { emoji: "🥳🍊", label: "축하" },
  { emoji: "🙏🍊", label: "감사" },
];

export function EmojiPicker({ isOpen, onClose, onSelect }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("smileys");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOrangeTab, setShowOrangeTab] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />
          
          {/* 이모지 피커 */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOrangeTab(false)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    !showOrangeTab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  이모지
                </button>
                <button
                  onClick={() => setShowOrangeTab(true)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    showOrangeTab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  🍊 오렌지
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {!showOrangeTab ? (
              <>
                {/* 검색 */}
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="이모지 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-muted/50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* 카테고리 탭 */}
                <div className="flex items-center gap-1 p-2 border-b border-border overflow-x-auto">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={cn(
                        "p-2 rounded-lg transition-colors shrink-0",
                        activeCategory === category.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                      title={category.label}
                    >
                      {category.icon}
                    </button>
                  ))}
                </div>

                {/* 이모지 그리드 */}
                <div className="p-2 h-48 overflow-y-auto">
                  <div className="grid grid-cols-8 gap-1">
                    {emojis[activeCategory].map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiClick(emoji)}
                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-muted rounded-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* 오렌지 캐릭터 탭 */
              <div className="p-4 max-h-80 overflow-y-auto">
                {/* 성장단계 이모티콘 */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sprout className="w-4 h-4 text-green-500" />
                    <p className="text-xs font-medium text-foreground">오렌지 성장 이야기</p>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {orangeGrowthStages.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiClick(`[${item.label}]`)}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-muted transition-all hover:scale-105 group"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50 p-1 shadow-sm group-hover:shadow-md transition-shadow">
                          <img 
                            src={item.image} 
                            alt={item.label}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <span className="text-size-10 text-muted-foreground font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-size-10 text-center text-muted-foreground mt-2 italic">
                    씨앗에서 열매까지, 마음도 함께 자라요 🌱
                  </p>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground mb-2">이모지 조합</p>
                  <div className="grid grid-cols-4 gap-2">
                    {orangeEmoticons.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiClick(item.emoji)}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-muted transition-colors"
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <span className="text-size-10 text-muted-foreground">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
