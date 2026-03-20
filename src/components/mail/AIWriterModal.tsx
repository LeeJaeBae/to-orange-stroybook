/** @deprecated 플로팅 AI 메뉴로 대체됨. LetterEditor.tsx 참조 */
import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/fetch";

type WriterType = "intro" | "middle" | "conclusion";

interface AIWriterModalProps {
  type: WriterType;
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
  currentContent?: string;
  recipientName?: string;
  recipientRelation?: string;
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

const modalConfig = {
  intro: {
    emoji: "👋",
    title: "처음 작성",
    subtitle: "인사와 안부를 전해요",
    question: "어떤 인사/안부를 전하고 싶으세요?",
    placeholder: "예: 오랜만에 연락드려요, 날씨가 추워졌는데 건강은 어떠신지...",
    aiHint: "AI가 처음 부분을 작성해 편지에 추가해요!",
    buttonText: "처음 작성",
    gradientFrom: "from-orange-400",
    gradientVia: "via-orange-500",
    gradientTo: "to-amber-500",
    buttonGradientFrom: "from-orange-500",
    buttonGradientTo: "to-amber-500",
    shadowColor: "shadow-orange-500/25",
    quickOptions: [
      { label: "따뜻한 인사로 시작하기", value: "warm_greeting", icon: "🤗" },
      { label: "안부 묻기", value: "ask_wellbeing", icon: "💝" },
      { label: "편지 쓰게 된 계기", value: "reason", icon: "✉️" },
      { label: "계절 인사", value: "seasonal", icon: "🌸" },
      { label: "오랜만에 연락", value: "long_time", icon: "👋" },
    ],
  },
  middle: {
    emoji: "💬",
    title: "중간 작성",
    subtitle: "하고 싶은 이야기를 전해요",
    question: "어떤 이야기를 전하고 싶으세요?",
    placeholder: "예: 최근 면회 다녀온 후 느낀 점, 가족들 근황, 응원의 말...",
    aiHint: "AI가 중간 부분을 작성해 편지에 추가해요!",
    buttonText: "중간 작성",
    gradientFrom: "from-amber-400",
    gradientVia: "via-yellow-500",
    gradientTo: "to-orange-400",
    buttonGradientFrom: "from-amber-500",
    buttonGradientTo: "to-orange-500",
    shadowColor: "shadow-amber-500/25",
    quickOptions: [
      { label: "근황 전하기", value: "update", icon: "📝" },
      { label: "감사 표현하기", value: "gratitude", icon: "🙏" },
      { label: "보고싶은 마음 전하기", value: "missing", icon: "💕" },
      { label: "응원 메시지", value: "cheer", icon: "💪" },
      { label: "추억 이야기", value: "memory", icon: "📸" },
      { label: "일상 공유", value: "daily", icon: "☀️" },
    ],
  },
  conclusion: {
    emoji: "🌟",
    title: "마무리 작성",
    subtitle: "마무리 인사를 해요",
    question: "어떻게 마무리하고 싶으세요?",
    placeholder: "예: 다음 면회 때 보고 싶다, 건강 챙기시라, 항상 응원한다...",
    aiHint: "AI가 마무리 부분을 작성해 편지에 추가해요!",
    buttonText: "마무리 작성",
    gradientFrom: "from-violet-400",
    gradientVia: "via-purple-500",
    gradientTo: "to-fuchsia-500",
    buttonGradientFrom: "from-violet-500",
    buttonGradientTo: "to-fuchsia-500",
    shadowColor: "shadow-violet-500/25",
    quickOptions: [
      { label: "건강 당부", value: "health", icon: "💖" },
      { label: "다시 만날 약속", value: "promise", icon: "🤝" },
      { label: "사랑 표현", value: "love", icon: "❤️" },
      { label: "응원과 격려", value: "encourage", icon: "✨" },
      { label: "기다리겠다는 말", value: "waiting", icon: "🌙" },
      { label: "희망적인 마무리", value: "hope", icon: "🌈" },
    ],
  },
};

// Static content templates based on type and option
const staticContent: Record<string, Record<string, string>> = {
  intro: {
    warm_greeting: "안녕하세요, 오랜만에 펜을 들었어요. 요즘 잘 지내고 계신가요? 항상 마음속으로 응원하고 있답니다.",
    ask_wellbeing: "건강은 어떠세요? 요즘 날씨가 많이 추워졌는데, 감기 조심하시고 따뜻하게 지내셨으면 좋겠어요.",
    reason: "오늘 문득 당신 생각이 나서 편지를 쓰게 됐어요. 하고 싶은 이야기가 많아서 이렇게 펜을 들었답니다.",
    seasonal: "어느새 계절이 바뀌었네요. 창밖으로 보이는 풍경을 보면서 당신 생각이 많이 났어요.",
    long_time: "오랜만에 연락드려요. 그동안 어떻게 지내셨나요? 항상 안부가 궁금했어요.",
    default: "안녕하세요, 오늘도 당신을 생각하며 편지를 씁니다.",
  },
  middle: {
    update: "요즘 저는 잘 지내고 있어요. 매일 바쁘게 지내다 보니 시간이 정말 빠르게 가는 것 같아요. 가족들도 모두 건강하게 잘 지내고 있답니다.",
    gratitude: "항상 고마워요. 멀리 있어도 마음만은 가까이 있다는 걸 알아요. 당신 덕분에 매일 힘을 얻고 있어요.",
    missing: "많이 보고 싶어요. 함께했던 시간들이 자꾸 생각나요. 다시 만날 그날을 손꼽아 기다리고 있어요.",
    cheer: "힘내세요! 당신은 할 수 있어요. 저도 여기서 열심히 응원하고 있을게요. 우리 함께 이겨내요.",
    memory: "지난번에 함께했던 시간이 자꾸 떠올라요. 그때 정말 행복했었죠. 그 기억이 지금도 저에게 큰 힘이 돼요.",
    daily: "요즘 일상을 전해드릴게요. 아침에 일어나면 창밖을 보며 당신 생각을 해요. 저녁에는 오늘 하루를 되돌아보며 편안하게 지내고 있어요.",
    default: "전하고 싶은 이야기가 많아요. 하나하나 적다 보니 마음이 따뜻해지네요.",
  },
  conclusion: {
    health: "건강 잘 챙기세요. 무엇보다 건강이 제일 중요해요. 맛있는 것 많이 먹고, 충분히 쉬면서 지내세요.",
    promise: "다음에 만나면 하고 싶은 것들이 정말 많아요. 그날을 기다리며 오늘도 열심히 지낼게요. 우리 꼭 다시 만나요.",
    love: "사랑해요. 이 마음 변하지 않을 거예요. 항상 당신 곁에 있을게요.",
    encourage: "힘든 일이 있어도 포기하지 마세요. 저는 언제나 당신 편이에요. 함께 이겨낼 수 있어요.",
    waiting: "기다릴게요. 서두르지 않아도 괜찮아요. 천천히, 그리고 건강하게 돌아와 주세요.",
    hope: "좋은 날이 분명 올 거예요. 희망을 잃지 말아요. 우리의 내일은 오늘보다 더 밝을 거예요.",
    default: "항상 응원하고 있어요. 다음에 또 편지할게요.",
  },
};

export function AIWriterModal({
  type,
  isOpen,
  onClose,
  onInsert,
  currentContent,
  recipientName,
  recipientRelation,
  recipientFacility,
  recipientAddress,
  recipientPrisonerNumber,
  recipientContext,
  recipientId,
  letterHistory,
}: AIWriterModalProps) {
  const [userInput, setUserInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const config = modalConfig[type];

  const handleQuickSelect = (value: string) => {
    setSelectedOption(selectedOption === value ? null : value);
  };

  const handleGenerate = async () => {
    if (!userInput && !selectedOption) return;

    const fallbackContent = selectedOption
      ? staticContent[type][selectedOption] || staticContent[type].default
      : userInput || staticContent[type].default;

    const optionLabel = selectedOption
      ? config.quickOptions.find((option) => option.value === selectedOption)?.label
      : undefined;

    setIsLoading(true);

    try {
      const response = await apiFetch("/api/v1/ai/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "section",
          section: type,
          userInput: userInput || undefined,
          optionLabel,
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
      });

      if (!response.ok) {
        throw new Error("AI 요청에 실패했습니다");
      }

      const result = await response.json();
      const { data } = result;

      const content = typeof data === "string" ? data : fallbackContent;
      onInsert(content);
      toast.success(`${config.title.replace(' 작성', '')} 부분이 추가되었습니다!`);
      handleClose();
    } catch {
      onInsert(fallbackContent);
      toast.warning("AI 생성에 실패해 기본 문장을 사용했습니다");
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUserInput("");
    setSelectedOption(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden border-0 shadow-2xl">
        {/* 헤더 - 그라데이션 배경 */}
        <div className={`bg-gradient-to-br ${config.gradientFrom} ${config.gradientVia} ${config.gradientTo} p-6 pb-8`}>
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-2xl">{config.emoji}</span>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {config.title}
                </DialogTitle>
                <DialogDescription className="text-white/80 mt-0.5">
                  {config.subtitle}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 -mt-4 space-y-5">
          {/* 카드 형태의 메인 컨텐츠 */}
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 space-y-5">
            {/* 사용자 입력 */}
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-foreground">
                {config.question}
              </label>
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={config.placeholder}
                className="min-h-[90px] resize-none bg-muted/40 border-0 focus:ring-2 focus:ring-primary/30 rounded-xl text-sm"
              />
            </div>

            {/* 빠른 선택 */}
            <div className="space-y-2.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">빠른 선택</p>
              <div className="flex flex-wrap gap-2">
                {config.quickOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleQuickSelect(option.value)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedOption === option.value
                        ? `bg-gradient-to-r ${config.buttonGradientFrom} ${config.buttonGradientTo} text-white shadow-md ${config.shadowColor}`
                        : "bg-muted/60 text-foreground hover:bg-muted border border-transparent hover:border-border"
                    }`}
                  >
                    <span>{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI 안내 */}
          <div className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-xl border border-violet-100/50 dark:border-violet-800/30`}>
            <div className={`w-8 h-8 bg-gradient-to-br ${config.buttonGradientFrom} ${config.buttonGradientTo} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm text-violet-700 dark:text-violet-300">
              {config.aiHint}
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="flex-1 h-12 text-base font-medium hover:bg-muted"
            >
              취소
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={(!userInput && !selectedOption) || isLoading}
              className={`flex-[2] h-12 text-base font-semibold bg-gradient-to-r ${config.buttonGradientFrom} ${config.buttonGradientTo} hover:opacity-90 text-white border-0 shadow-lg ${config.shadowColor} disabled:opacity-50 disabled:shadow-none`}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isLoading ? "AI 작성 중..." : config.buttonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
