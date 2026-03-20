/** @deprecated 플로팅 AI 메뉴로 대체됨. LetterEditor.tsx 참조 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api/fetch";

interface AIWritingHelperProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion: (text: string) => void;
  recipientRelation?: string;
  currentContent?: string;
  recipientName?: string;
  recipientFacility?: string;
  recipientAddress?: string;
  recipientPrisonerNumber?: string;
  recipientContext?: string;
  recipientId?: string;
  letterHistory?: Array<{
    date: string;
    direction: 'sent' | 'received';
    content: string;
  }>;
}

// Static suggestions for different relations
const suggestionsByRelation: Record<string, string[]> = {
  아들: [
    "아들아, 잘 지내고 있니? 오랜만에 펜을 들었어.",
    "요즘 건강은 어떠니? 엄마는 매일 네 생각이야.",
    "보고 싶은 마음에 편지를 쓴단다.",
    "이 편지가 닿을 무렵, 좋은 하루 보내고 있길 바라.",
  ],
  남편: [
    "여보, 잘 지내고 있어요? 오랜만에 편지해요.",
    "요즘 어떻게 지내요? 많이 보고 싶어요.",
    "오늘도 당신 생각에 펜을 들었어요.",
    "이 편지 받을 때쯤 좋은 일이 있었으면 좋겠어요.",
  ],
  동생: [
    "동생아, 잘 지내고 있어? 형/누나가 편지 쓴다.",
    "요즘 어떻게 지내? 보고 싶어서 편지해.",
    "네 생각이 많이 나서 펜을 들었어.",
    "이 편지가 닿으면 좋은 하루가 됐으면 좋겠어.",
  ],
  default: [
    "오랜만에 펜을 들었어요. 잘 지내고 계신가요?",
    "안녕하세요, 요즘 어떻게 지내세요?",
    "보고 싶은 마음에 편지를 씁니다.",
    "이 편지가 닿을 무렵, 좋은 하루 보내고 계시길 바라요.",
  ],
};

export function AIWritingHelper({
  isOpen,
  onClose,
  onSelectSuggestion,
  recipientRelation = "가족",
  currentContent = "",
  recipientName,
  recipientFacility,
  recipientAddress,
  recipientPrisonerNumber,
  recipientContext,
  recipientId,
  letterHistory,
}: AIWritingHelperProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const relationSuggestions = suggestionsByRelation[recipientRelation] || suggestionsByRelation.default;
      let isActive = true;
      setIsLoading(true);

      apiFetch("/api/v1/ai/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "suggestions",
          relation: recipientRelation,
          currentContent,
          recipientName,
          recipientRelation,
          recipientFacility,
          recipientAddress,
          recipientPrisonerNumber,
          recipientContext,
          recipientId,
          letterHistory,
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("AI 제안 생성에 실패했습니다");
          }
          const result = await response.json();
          const { data } = result;

          const nextSuggestions = Array.isArray(data) ? data : [];
          if (isActive && nextSuggestions.length > 0) {
            setSuggestions(nextSuggestions);
          } else if (isActive) {
            setSuggestions(relationSuggestions);
          }
        })
        .catch(() => {
          if (isActive) {
            setSuggestions(relationSuggestions);
          }
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });

      return () => {
        isActive = false;
      };
    }
  }, [isOpen, recipientRelation, currentContent, recipientName, recipientFacility, recipientAddress, recipientPrisonerNumber, recipientContext]);

  const handleSelectSuggestion = (suggestion: string) => {
    onSelectSuggestion(suggestion);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-0 bottom-0 z-50 p-4 md:relative md:inset-auto"
        >
          <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl shadow-2xl overflow-hidden max-w-lg mx-auto md:max-w-none">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">AI가 도와드릴까요?</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 뒤로가기 */}
            <div className="px-4 pb-2">
              <button
                onClick={onClose}
                className="flex items-center gap-1 text-white/70 hover:text-white text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                뒤로
              </button>
            </div>

            {/* 제안 목록 */}
            <div className="px-4 pb-6 space-y-2">
              {isLoading && (
                <div className="text-white/80 text-sm px-2 py-2">
                  AI가 문장을 만들고 있어요...
                </div>
              )}
              {!isLoading && suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white text-left transition-colors"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
