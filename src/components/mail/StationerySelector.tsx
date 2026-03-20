import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Gem, Palette, Sparkles, Check, Cloud, Flower2, Leaf, Loader2, Wand2, RefreshCw, Type, Grid3X3, Paintbrush, Sun, Heart, Gift, Snowflake, TreePine, Cherry, Waves, Sunrise, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { StationeryRenderer } from "./StationeryRenderer";
import {
  AI_STATIONERY_CATEGORY_ID,
  DEFAULT_STATIONERY_CATEGORY_SETTINGS,
  getStationeryCategoryLabel,
  normalizeStationeryCategorySettings,
} from "@to-orange/api-contracts";

type StationeryCategory = string;

export interface Stationery {
  id: string;
  name: string;
  category: string;
  order?: number;
  price?: number;
  bgColor?: string;
  bgGradient?: string;
  icon?: React.ReactNode;
  pattern?: "none" | "lines" | "dots" | "grid" | "waves" | "hearts" | "stars" | "flowers" | "leaves" | "clouds" | "confetti";
  patternColor?: string;
  patternOpacity?: number;
  texture?: "none" | "paper" | "watercolor" | "linen" | "canvas" | "parchment";
  border?: {
    style: "none" | "solid" | "dashed" | "dotted" | "double";
    color: string;
    width: "thin" | "medium" | "thick";
  };
  cornerDecoration?: {
    type: "none" | "flower" | "ribbon" | "heart" | "star" | "leaf" | "vine";
    color: string;
  };
  // AI 생성 커스텀 SVG 디자인
  customSvg?: {
    background?: string;
    pattern?: string;
    corners?: string;
    border?: string;
  };
  // AI 생성 이미지 배경 (Nano Banana)
  backgroundImage?: string;
  frontImage?: string;
  backImage?: string;
  writingArea?: {
    left: number;
    top: number;
    width: number;
    height: number;
    lineCount: number;
    lineOffset?: number;
    lineColor?: string;
  };
  backWritingArea?: {
    left: number;
    top: number;
    width: number;
    height: number;
    lineCount: number;
    lineOffset?: number;
    lineColor?: string;
  };
  isNew?: boolean;
  isPremium?: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  basic: <FileText className="w-4 h-4" />,
  premium: <Gem className="w-4 h-4" />,
  designer: <Palette className="w-4 h-4" />,
  ai: <Sparkles className="w-4 h-4" />,
};

const categories = [
  ...normalizeStationeryCategorySettings(DEFAULT_STATIONERY_CATEGORY_SETTINGS)
    .filter((item) => item.isActive && item.id !== AI_STATIONERY_CATEGORY_ID)
    .map((item) => ({
      id: item.id,
      label: item.label,
      icon: categoryIcons[item.id] ?? <FileText className="w-4 h-4" />,
    })),
];

const stationeryItems: Stationery[] = [
  // 기본
  { id: "white", name: "순백", category: "basic", bgColor: "bg-white", pattern: "none" },
  { id: "cream", name: "크림", category: "basic", bgColor: "bg-amber-50", pattern: "none" },
  // { id: "lined", name: "줄노트", category: "basic", bgColor: "bg-amber-50", pattern: "lines" },
  { id: "sky", name: "하늘색", category: "basic", bgColor: "bg-sky-100", icon: <Cloud className="w-6 h-6 text-white/80" /> },
  { id: "pink", name: "연분홍", category: "basic", bgColor: "bg-pink-100", icon: <Flower2 className="w-6 h-6 text-pink-300" /> },
  { id: "mint", name: "민트", category: "basic", bgColor: "bg-emerald-100", icon: <Leaf className="w-6 h-6 text-emerald-400" /> },

  // 상용 (이미지 편지지)
  { id: "premium-01", name: "해피댕", category: "premium", backgroundImage: "/assets/letters/premium-01.png", isPremium: true },
  { id: "premium-02", name: "꽃향기", category: "premium", backgroundImage: "/assets/letters/premium-02.png", isPremium: true },
  { id: "premium-03", name: "봄소풍", category: "premium", backgroundImage: "/assets/letters/premium-03.png", isPremium: true },
  { id: "premium-04", name: "고양이", category: "premium", backgroundImage: "/assets/letters/premium-04.png", isPremium: true },
  { id: "premium-05", name: "숲속비밀", category: "premium", backgroundImage: "/assets/letters/premium-05.png", isPremium: true },
  { id: "premium-06", name: "꿈나라", category: "premium", backgroundImage: "/assets/letters/premium-06.png", isPremium: true },
  { id: "premium-07", name: "수채화", category: "premium", backgroundImage: "/assets/letters/premium-07.png", isPremium: true },
  { id: "premium-08", name: "별빛", category: "premium", backgroundImage: "/assets/letters/premium-08.png", isPremium: true },
  { id: "premium-09", name: "레트로", category: "premium", backgroundImage: "/assets/letters/premium-09.png", isPremium: true },
  { id: "premium-10", name: "새해숲", category: "premium", backgroundImage: "/assets/letters/premium-10.png", isPremium: true },
  { id: "premium-11", name: "동화나라", category: "premium", backgroundImage: "/assets/letters/premium-11.png", isPremium: true },
  { id: "premium-12", name: "바다향", category: "premium", backgroundImage: "/assets/letters/premium-12.png", isPremium: true },
  { id: "premium-13", name: "들꽃", category: "premium", backgroundImage: "/assets/letters/premium-13.png", isPremium: true },
  { id: "premium-14", name: "가을단풍", category: "premium", backgroundImage: "/assets/letters/premium-14.png", isPremium: true },
  { id: "premium-15", name: "눈언덕", category: "premium", backgroundImage: "/assets/letters/premium-15.png", isPremium: true },
  { id: "premium-16", name: "달빛정원", category: "premium", backgroundImage: "/assets/letters/premium-16.png", isPremium: true },
  { id: "premium-17", name: "파스텔", category: "premium", backgroundImage: "/assets/letters/premium-17.png", isPremium: true },
  { id: "premium-18", name: "크리스마스", category: "premium", backgroundImage: "/assets/letters/premium-18.png", isPremium: true },
  { id: "premium-19", name: "무지개", category: "premium", backgroundImage: "/assets/letters/premium-19.png", isPremium: true },
  { id: "premium-20", name: "파리산책", category: "premium", backgroundImage: "/assets/letters/premium-20.png", isPremium: true },

  // 디자이너
  { id: "sunset", name: "선셋", category: "designer", bgGradient: "bg-gradient-to-br from-orange-200 via-rose-200 to-purple-200", isNew: true },
  { id: "ocean", name: "오션", category: "designer", bgGradient: "bg-gradient-to-br from-cyan-200 via-blue-200 to-indigo-200", isNew: true },
  { id: "forest", name: "포레스트", category: "designer", bgGradient: "bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200" },
  { id: "blossom", name: "블라썸", category: "designer", bgGradient: "bg-gradient-to-br from-pink-200 via-rose-200 to-red-200" },

  // AI (기본 제공 샘플)
  { id: "ai-dream", name: "드림스케이프", category: "ai", bgGradient: "bg-gradient-to-br from-violet-300 via-purple-200 to-pink-200", isNew: true },
  { id: "ai-aurora", name: "오로라", category: "ai", bgGradient: "bg-gradient-to-br from-green-200 via-cyan-200 to-blue-300", isNew: true },
  { id: "ai-cosmic", name: "코스믹", category: "ai", bgGradient: "bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300" },
];

// AI 프롬프트 예시
const promptExamples = [
  "따뜻한 봄날의 벚꽃 느낌",
  "시원한 바다와 파도",
  "부드러운 노을 하늘",
  "싱그러운 숲속 느낌",
  "우아한 라벤더 정원",
  "맑은 새벽 하늘",
];

// 아트 스타일 프리셋
type ArtStyleId = "illustration" | "minimal" | "watercolor" | "cartoon" | "character" | "vintage" | "botanical" | "dreamy";

const artStylePresets: Array<{
  id: ArtStyleId;
  name: string;
  icon: string;
  description: string;
  prompt: string; // API로 전달될 스타일 프롬프트
}> = [
  {
    id: "illustration",
    name: "일러스트",
    icon: "✏️",
    description: "섬세한 손그림 스타일",
    prompt: "delicate hand-drawn illustration with fine pen details and artistic linework",
  },
  {
    id: "minimal",
    name: "미니멀",
    icon: "◻️",
    description: "깔끔하고 심플한",
    prompt: "modern minimalist design with subtle gradients, clean lines and simple geometric shapes",
  },
  {
    id: "watercolor",
    name: "수채화",
    icon: "🎨",
    description: "부드러운 수채화 느낌",
    prompt: "soft watercolor painting with gentle brush strokes and flowing colors",
  },
  {
    id: "cartoon",
    name: "만화",
    icon: "💬",
    description: "귀여운 만화 스타일",
    prompt: "cute cartoon style with bold outlines, vibrant colors and playful elements",
  },
  {
    id: "character",
    name: "캐릭터",
    icon: "🐰",
    description: "귀여운 캐릭터가 있는",
    prompt: "adorable character illustration with cute animals or mascots in kawaii style",
  },
  {
    id: "vintage",
    name: "빈티지",
    icon: "📜",
    description: "클래식한 빈티지 감성",
    prompt: "romantic vintage postcard aesthetic with aged paper texture and classic ornaments",
  },
  {
    id: "botanical",
    name: "보타니컬",
    icon: "🌿",
    description: "자연스러운 식물 일러스트",
    prompt: "elegant botanical illustration style with detailed flowers, leaves and natural elements",
  },
  {
    id: "dreamy",
    name: "몽환적",
    icon: "✨",
    description: "환상적인 동화 느낌",
    prompt: "ethereal dreamy fairy tale book illustration with magical sparkles and soft glow",
  },
];

// AI 생성 모드
type AiCreationMode = "text" | "theme" | "custom";

const aiCreationModes = [
  { id: "text" as const, label: "텍스트", icon: <Type className="w-4 h-4" /> },
  { id: "theme" as const, label: "테마", icon: <Grid3X3 className="w-4 h-4" /> },
  { id: "custom" as const, label: "직접 만들기", icon: <Paintbrush className="w-4 h-4" /> },
];

function getStationeryPreviewImage(item: Stationery) {
  return item.frontImage || item.backgroundImage || item.backImage;
}

// 테마 카테고리
const themeCategories = [
  { id: "season", label: "계절", icon: <Sun className="w-4 h-4" /> },
  { id: "occasion", label: "기념일", icon: <Gift className="w-4 h-4" /> },
  { id: "emotion", label: "감정", icon: <Heart className="w-4 h-4" /> },
];

// 테마 프리셋
const themePresets: Record<string, Array<{ id: string; name: string; prompt: string; preview: Partial<Stationery> }>> = {
  season: [
    { id: "spring", name: "봄", prompt: "벚꽃이 흩날리는 따뜻한 봄날", preview: { bgGradient: "bg-gradient-to-br from-pink-200 via-rose-100 to-orange-100", pattern: "flowers", patternColor: "pink-300" } },
    { id: "summer", name: "여름", prompt: "시원한 바다와 청량한 하늘", preview: { bgGradient: "bg-gradient-to-br from-cyan-200 via-blue-200 to-sky-100", pattern: "waves", patternColor: "blue-300" } },
    { id: "autumn", name: "가을", prompt: "단풍이 물든 따뜻한 가을 숲", preview: { bgGradient: "bg-gradient-to-br from-orange-200 via-amber-200 to-yellow-100", pattern: "leaves", patternColor: "orange-400" } },
    { id: "winter", name: "겨울", prompt: "하얀 눈이 내리는 포근한 겨울", preview: { bgGradient: "bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100", pattern: "dots", patternColor: "blue-200" } },
  ],
  occasion: [
    { id: "birthday", name: "생일", prompt: "축하하는 파티 분위기의 생일", preview: { bgGradient: "bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200", pattern: "confetti", patternColor: "pink-400" } },
    { id: "christmas", name: "크리스마스", prompt: "따뜻한 크리스마스 분위기", preview: { bgGradient: "bg-gradient-to-br from-red-200 via-green-100 to-red-100", pattern: "stars", patternColor: "red-400" } },
    { id: "newyear", name: "새해", prompt: "희망찬 새해의 시작", preview: { bgGradient: "bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-100", pattern: "stars", patternColor: "amber-400" } },
    { id: "valentine", name: "발렌타인", prompt: "사랑스러운 발렌타인 데이", preview: { bgGradient: "bg-gradient-to-br from-rose-200 via-pink-200 to-red-100", pattern: "hearts", patternColor: "rose-400" } },
  ],
  emotion: [
    { id: "love", name: "사랑", prompt: "따뜻하고 사랑스러운 분위기", preview: { bgGradient: "bg-gradient-to-br from-rose-200 via-pink-100 to-red-100", pattern: "hearts", patternColor: "rose-300" } },
    { id: "gratitude", name: "감사", prompt: "감사하는 마음을 담은 따뜻함", preview: { bgGradient: "bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100", pattern: "flowers", patternColor: "amber-300" } },
    { id: "comfort", name: "위로", prompt: "부드럽고 편안한 위로의 느낌", preview: { bgGradient: "bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100", pattern: "clouds", patternColor: "blue-200" } },
    { id: "hope", name: "희망", prompt: "밝고 희망찬 미래를 향해", preview: { bgGradient: "bg-gradient-to-br from-cyan-100 via-teal-100 to-emerald-100", pattern: "leaves", patternColor: "teal-300" } },
    { id: "joy", name: "기쁨", prompt: "즐겁고 행복한 기쁨의 순간", preview: { bgGradient: "bg-gradient-to-br from-yellow-200 via-orange-100 to-pink-100", pattern: "confetti", patternColor: "yellow-400" } },
  ],
};

// 직접 만들기 옵션들
const colorOptions = [
  { id: "white", name: "화이트", value: "bg-white" },
  { id: "cream", name: "크림", value: "bg-amber-50" },
  { id: "pink", name: "핑크", value: "bg-pink-100" },
  { id: "sky", name: "하늘", value: "bg-sky-100" },
  { id: "mint", name: "민트", value: "bg-emerald-100" },
  { id: "lavender", name: "라벤더", value: "bg-violet-100" },
  { id: "peach", name: "피치", value: "bg-orange-100" },
  { id: "lemon", name: "레몬", value: "bg-yellow-100" },
];

const gradientOptions = [
  { id: "none", name: "없음", value: "" },
  { id: "sunset", name: "선셋", value: "bg-gradient-to-br from-orange-200 via-rose-200 to-purple-200" },
  { id: "ocean", name: "오션", value: "bg-gradient-to-br from-cyan-200 via-blue-200 to-indigo-200" },
  { id: "forest", name: "포레스트", value: "bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200" },
  { id: "blossom", name: "블라썸", value: "bg-gradient-to-br from-pink-200 via-rose-200 to-red-200" },
  { id: "lavender", name: "라벤더", value: "bg-gradient-to-br from-violet-200 via-purple-200 to-pink-200" },
  { id: "aurora", name: "오로라", value: "bg-gradient-to-br from-green-200 via-cyan-200 to-blue-300" },
];

const patternOptions: Array<{ id: Stationery["pattern"]; name: string }> = [
  { id: "none", name: "없음" },
  { id: "lines", name: "줄무늬" },
  { id: "dots", name: "도트" },
  { id: "grid", name: "격자" },
  { id: "waves", name: "물결" },
  { id: "hearts", name: "하트" },
  { id: "stars", name: "별" },
  { id: "flowers", name: "꽃" },
  { id: "leaves", name: "나뭇잎" },
  { id: "clouds", name: "구름" },
  { id: "confetti", name: "색종이" },
];

const textureOptions: Array<{ id: Stationery["texture"]; name: string }> = [
  { id: "none", name: "없음" },
  { id: "paper", name: "종이" },
  { id: "watercolor", name: "수채화" },
  { id: "linen", name: "린넨" },
  { id: "canvas", name: "캔버스" },
  { id: "parchment", name: "양피지" },
];

const borderStyleOptions: Array<{ id: NonNullable<Stationery["border"]>["style"]; name: string }> = [
  { id: "none", name: "없음" },
  { id: "solid", name: "실선" },
  { id: "dashed", name: "점선" },
  { id: "dotted", name: "도트" },
  { id: "double", name: "이중선" },
];

const cornerDecorationOptions: Array<{ id: NonNullable<Stationery["cornerDecoration"]>["type"]; name: string }> = [
  { id: "none", name: "없음" },
  { id: "flower", name: "꽃" },
  { id: "ribbon", name: "리본" },
  { id: "heart", name: "하트" },
  { id: "star", name: "별" },
  { id: "leaf", name: "나뭇잎" },
  { id: "vine", name: "덩굴" },
];


interface StationerySelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onGeneratedStationeryChange?: (stationery: Stationery | null) => void;
  items?: Stationery[];
  categories?: { id: string; label: string; icon?: React.ReactNode }[];
}

export function StationerySelector({
  selectedId,
  onSelect,
  onGeneratedStationeryChange,
  items,
  categories: categoriesOverride,
}: StationerySelectorProps) {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("basic");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [userAiStationeries, setUserAiStationeries] = useState<Stationery[]>([]);
  const [isLoadingUserStationeries, setIsLoadingUserStationeries] = useState(false);

  // AI 생성 모드 관련 state
  const [aiCreationMode, setAiCreationMode] = useState<AiCreationMode>("text");
  const [selectedThemeCategory, setSelectedThemeCategory] = useState<string>("season");
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  // 아트 스타일 선택 상태 (기본: 수채화)
  const [selectedArtStyle, setSelectedArtStyle] = useState<ArtStyleId>("illustration");

  // 직접 만들기 모드 state
  const [customColor, setCustomColor] = useState<string>("bg-white");
  const [customGradient, setCustomGradient] = useState<string>("");
  const [customPattern, setCustomPattern] = useState<Stationery["pattern"]>("none");
  const [customTexture, setCustomTexture] = useState<Stationery["texture"]>("none");
  const [customBorderStyle, setCustomBorderStyle] = useState<NonNullable<Stationery["border"]>["style"]>("none");
  const [customCornerDecoration, setCustomCornerDecoration] = useState<NonNullable<Stationery["cornerDecoration"]>["type"]>("none");

  // 확대 모달 상태
  const [expandedStationery, setExpandedStationery] = useState<Stationery | null>(null);

  const resolvedItems = items ?? stationeryItems;

  // 사용자의 AI 편지지를 DB에서 로드
  const loadUserAiStationeries = useCallback(async () => {
    if (!user) return;

    setIsLoadingUserStationeries(true);
    try {
      const response = await fetch("/api/v1/ai/stationery");
      if (!response.ok) {
        console.error("Failed to load user AI stationeries");
        return;
      }

      const { data } = await response.json();
      if (data && Array.isArray(data)) {
        // API 응답을 Stationery 타입으로 변환
        const stationeries: Stationery[] = data.map((item: Stationery) => ({
          ...item,
          pattern: item.pattern as Stationery["pattern"],
        }));
        setUserAiStationeries(stationeries);
      }
    } catch (error) {
      console.error("Error loading user AI stationeries:", error);
    } finally {
      setIsLoadingUserStationeries(false);
    }
  }, [user]);

  // 컴포넌트 마운트 시 사용자 AI 편지지 로드
  useEffect(() => {
    if (user) {
      loadUserAiStationeries();
    }
  }, [user, loadUserAiStationeries]);

  // 사용자 편지지 로드 후, 선택된 편지지가 AI 편지지라면 스타일 정보 전달
  useEffect(() => {
    if (!selectedId) return;

    // 1. 사용자 생성 AI 편지지에서 찾기
    const selectedUserAi = userAiStationeries.find(s => s.id === selectedId);
    if (selectedUserAi) {
      onGeneratedStationeryChange?.(selectedUserAi);
      return;
    }

    // 2. 기본 AI 샘플 편지지에서 찾기 (ai-dream, ai-aurora, ai-cosmic)
    const selectedDefaultAi = resolvedItems.find(
      s => s.id === selectedId && (s.category === 'ai' || s.category === 'AI')
    );
    if (selectedDefaultAi) {
      onGeneratedStationeryChange?.(selectedDefaultAi);
    }
  }, [selectedId, userAiStationeries, resolvedItems, onGeneratedStationeryChange]);
  const resolvedCategories = categoriesOverride ?? categories;
  const categoryLabelMap = useMemo(
    () => new Map<string, string>(
      resolvedCategories.map((category): [string, string] => [category.id, category.label])
    ),
    [resolvedCategories]
  );
  const visibleCategoryIds = useMemo(
    () => new Set(resolvedCategories.map((category) => category.id)),
    [resolvedCategories]
  );

  // AI 카테고리에서는 세션 중 생성한 편지지만 표시 (기본 샘플은 숨김)
  const isAiCategory = activeCategory === "ai" || activeCategory === "AI";
  const filteredItems = isAiCategory
    ? userAiStationeries // 세션 중 생성한 AI 편지지만 표시
    : resolvedItems.filter((item) => item.category === activeCategory && visibleCategoryIds.has(item.category));

  useEffect(() => {
    if (resolvedCategories.length > 0 && !resolvedCategories.some((c) => c.id === activeCategory)) {
      setActiveCategory(resolvedCategories[0].id);
    }
  }, [activeCategory, resolvedCategories]);

  // 랜덤 예시 선택
  const getRandomExample = () => {
    const randomIndex = Math.floor(Math.random() * promptExamples.length);
    setAiPrompt(promptExamples[randomIndex]);
  };

  // AI 편지지 생성 (공통 함수)
  const generateStationery = async (prompt: string, artStyleId?: ArtStyleId) => {
    setIsGenerating(true);
    try {
      // 아트 스타일 프롬프트 가져오기
      const artStylePrompt = artStyleId
        ? artStylePresets.find(s => s.id === artStyleId)?.prompt
        : artStylePresets.find(s => s.id === selectedArtStyle)?.prompt;

      const response = await fetch("/api/v1/ai/stationery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          artStyle: artStylePrompt, // 선택된 아트 스타일 프롬프트 전달
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "편지지 생성에 실패했습니다");
      }

      const { data } = await response.json();

      // API 응답 타입 캐스팅 (pattern 검증은 API에서 수행)
      const generatedStationery: Stationery = {
        ...data,
        pattern: data.pattern as Stationery["pattern"],
      };

      // 사용자 편지지 목록에 추가
      setUserAiStationeries(prev => [generatedStationery, ...prev]);

      // 생성된 편지지 자동 선택
      onSelect(generatedStationery.id);

      // 부모 컴포넌트에 생성된 편지지 정보 전달
      onGeneratedStationeryChange?.(generatedStationery);

      toast.success(`"${generatedStationery.name}" 편지지가 생성되었습니다!`);
      return generatedStationery;
    } catch (error) {
      console.error("AI stationery generation error:", error);
      toast.error(error instanceof Error ? error.message : "편지지 생성에 실패했습니다");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // 텍스트 모드 생성
  const handleGenerateStationery = async () => {
    if (!aiPrompt.trim()) {
      toast.warning("편지지 분위기를 입력해주세요");
      return;
    }
    await generateStationery(aiPrompt);
    setAiPrompt("");
  };

  // 테마 선택 모드 생성
  const handleGenerateFromTheme = async (themeId: string) => {
    const themes = themePresets[selectedThemeCategory];
    const theme = themes?.find(t => t.id === themeId);
    if (!theme) return;

    setSelectedThemeId(themeId);
    await generateStationery(theme.prompt);
    setSelectedThemeId(null);
  };

  // 직접 만들기 모드 - 커스텀 스타일 직접 저장 (AI 없이)
  const handleSaveCustomStationery = async () => {
    // 이름 생성 (고유 번호 추가)
    const nameParts: string[] = [];
    if (customGradient) {
      const gradient = gradientOptions.find(g => g.value === customGradient);
      if (gradient && gradient.id !== "none") nameParts.push(gradient.name);
    } else {
      const color = colorOptions.find(c => c.value === customColor);
      if (color) nameParts.push(color.name);
    }
    if (customPattern && customPattern !== "none") {
      const pattern = patternOptions.find(p => p.id === customPattern);
      if (pattern) nameParts.push(pattern.name);
    }
    // 기본 이름 + 고유 번호 (기존 개수 + 1)
    const baseCount = userAiStationeries.length + 1;
    const baseName = nameParts.length > 0 ? nameParts.join(" ") : "맞춤";
    const name = `${baseName} ${baseCount}`;

    // 스타일 객체 구성
    const stylePayload = {
      name: name.slice(0, 10),
      bgColor: customGradient ? undefined : customColor,
      bgGradient: customGradient || undefined,
      pattern: customPattern || "none",
      patternColor: customPattern && customPattern !== "none" ? "gray-400" : undefined,
      patternOpacity: customPattern && customPattern !== "none" ? 0.15 : undefined,
      texture: customTexture !== "none" ? customTexture : undefined,
      border: customBorderStyle !== "none" ? {
        style: customBorderStyle,
        color: "gray-300",
        width: "medium" as const,
      } : undefined,
      cornerDecoration: customCornerDecoration !== "none" ? {
        type: customCornerDecoration,
        color: "pink-400",
      } : undefined,
    };

    setIsGenerating(true);
    try {
      const response = await fetch("/api/v1/ai/stationery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style: stylePayload }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "편지지 저장에 실패했습니다");
      }

      const { data } = await response.json();

      const savedStationery: Stationery = {
        ...data,
        pattern: data.pattern as Stationery["pattern"],
      };

      setUserAiStationeries(prev => [savedStationery, ...prev]);
      onSelect(savedStationery.id);
      onGeneratedStationeryChange?.(savedStationery);

      toast.success(`"${savedStationery.name}" 편지지가 저장되었습니다!`);
    } catch (error) {
      console.error("Custom stationery save error:", error);
      toast.error(error instanceof Error ? error.message : "편지지 저장에 실패했습니다");
    } finally {
      setIsGenerating(false);
    }
  };

  // 직접 만들기 프리뷰용 스타일
  const customPreviewStyle: Partial<Stationery> = {
    bgColor: customGradient ? undefined : customColor,
    bgGradient: customGradient || undefined,
    pattern: customPattern,
    patternColor: customPattern && customPattern !== "none" ? "gray-400" : undefined,
    patternOpacity: customPattern && customPattern !== "none" ? 0.15 : undefined,
    texture: customTexture,
    border: customBorderStyle !== "none" ? {
      style: customBorderStyle,
      color: "gray-300",
      width: "medium",
    } : undefined,
    cornerDecoration: customCornerDecoration !== "none" ? {
      type: customCornerDecoration,
      color: "pink-400",
    } : undefined,
  };

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-[18px] h-[18px] text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-base leading-tight">편지지 선택</h2>
            <p className="text-xs text-muted-foreground mt-0.5">마음에 드는 편지지를 골라보세요</p>
          </div>
        </div>
      </div>

      {resolvedCategories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-5 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-foreground">지금 노출 중인 편지지가 없어요</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            관리자에서 카테고리 노출을 켜거나 활성 편지지를 추가해야 여기 탭이 보여.
          </p>
        </div>
      )}

      {/* 카테고리 탭 */}
      <div className={cn(
        "bg-muted/60 p-1 rounded-xl border border-border/50",
        resolvedCategories.length === 0 && "hidden",
      )}>
        <div className="flex gap-0.5">
          {resolvedCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                activeCategory === category.id
                  ? "bg-card text-primary shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              )}
            >
              {category.icon && category.icon}
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI 생성 섹션 (AI 카테고리일 때만 표시) */}
      <AnimatePresence>
        {isAiCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
              {/* 헤더 */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">AI 편지지 생성</h3>
                  <p className="text-xs text-muted-foreground">원하는 방식으로 편지지를 만들어보세요</p>
                </div>
              </div>

              {/* AI 생성 모드 탭 */}
              <div className="bg-white/50 p-1 rounded-xl mb-4">
                <div className="flex gap-1">
                  {aiCreationModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setAiCreationMode(mode.id)}
                      disabled={isGenerating}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200",
                        aiCreationMode === mode.id
                          ? "bg-white text-purple-600 shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {mode.icon}
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 텍스트 입력 모드 */}
              {aiCreationMode === "text" && (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.nativeEvent.isComposing && !isGenerating) {
                          e.preventDefault();
                          handleGenerateStationery();
                        }
                      }}
                      placeholder="예: 따뜻한 봄날의 벚꽃 느낌"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-purple-200 bg-white/80 backdrop-blur-sm text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                      maxLength={200}
                      disabled={isGenerating}
                    />
                    <button
                      onClick={getRandomExample}
                      disabled={isGenerating}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                      title="랜덤 예시"
                    >
                      <RefreshCw className="w-4 h-4 text-purple-500" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {promptExamples.slice(0, 4).map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setAiPrompt(example)}
                        disabled={isGenerating}
                        className="px-2.5 py-1 text-xs bg-white/60 hover:bg-white border border-purple-100 rounded-full text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        {example}
                      </button>
                    ))}
                  </div>

                  {/* 아트 스타일 선택 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-purple-700">스타일</span>
                      <span className="text-xs text-muted-foreground">
                        {artStylePresets.find(s => s.id === selectedArtStyle)?.description}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {artStylePresets.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedArtStyle(style.id)}
                          disabled={isGenerating}
                          className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
                            selectedArtStyle === style.id
                              ? "bg-purple-100 border-purple-400 shadow-sm"
                              : "bg-white/60 border-purple-100 hover:bg-white hover:border-purple-200"
                          )}
                        >
                          <span className="text-lg">{style.icon}</span>
                          <span className="text-xs font-medium text-foreground">{style.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateStationery}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="relative w-5 h-5">
                          <div className="absolute inset-0 rounded-full border-2 border-white/30" />
                          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                          <Sparkles className="absolute inset-0.5 w-4 h-4 text-white/80 animate-pulse" />
                        </div>
                        <span>AI가 편지지를 만들고 있어요...</span>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        편지지 생성하기
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* 테마 선택 모드 */}
              {aiCreationMode === "theme" && (
                <div className="space-y-4">
                  {/* 테마 카테고리 탭 */}
                  <div className="flex gap-2">
                    {themeCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedThemeCategory(cat.id)}
                        disabled={isGenerating}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                          selectedThemeCategory === cat.id
                            ? "bg-purple-500 text-white"
                            : "bg-white/60 text-muted-foreground hover:bg-white hover:text-foreground"
                        )}
                      >
                        {cat.icon}
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* 테마 그리드 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {themePresets[selectedThemeCategory]?.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleGenerateFromTheme(theme.id)}
                        disabled={isGenerating}
                        className={cn(
                          "relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all",
                          selectedThemeId === theme.id
                            ? "border-purple-500 ring-2 ring-purple-200"
                            : "border-transparent hover:border-purple-300"
                        )}
                      >
                        <StationeryRenderer
                          style={{
                            bgGradient: theme.preview.bgGradient,
                            pattern: theme.preview.pattern,
                            patternColor: theme.preview.patternColor,
                          }}
                          className="absolute inset-0"
                          showCornerDecorations={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <span className="text-white text-xs font-medium">{theme.name}</span>
                        </div>
                        {selectedThemeId === theme.id && isGenerating && (
                          <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    테마를 클릭하면 AI가 해당 분위기의 편지지를 생성합니다
                  </p>
                </div>
              )}

              {/* 직접 만들기 모드 */}
              {aiCreationMode === "custom" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 왼쪽: 옵션 선택 */}
                    <div className="space-y-3">
                      {/* 배경색 / 그라디언트 */}
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">배경</label>
                        <div className="flex flex-wrap gap-1.5">
                          {gradientOptions.slice(0, 4).map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setCustomGradient(opt.value);
                                if (opt.value) setCustomColor("");
                              }}
                              className={cn(
                                "w-8 h-8 rounded-lg border-2 transition-all overflow-hidden",
                                (customGradient === opt.value || (opt.id === "none" && !customGradient))
                                  ? "border-purple-500 ring-2 ring-purple-200"
                                  : "border-gray-200 hover:border-purple-300"
                              )}
                              title={opt.name}
                            >
                              <div className={cn("w-full h-full", opt.value || "bg-gray-100")} />
                            </button>
                          ))}
                          {colorOptions.slice(0, 4).map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setCustomColor(opt.value);
                                setCustomGradient("");
                              }}
                              className={cn(
                                "w-8 h-8 rounded-lg border-2 transition-all",
                                (customColor === opt.value && !customGradient)
                                  ? "border-purple-500 ring-2 ring-purple-200"
                                  : "border-gray-200 hover:border-purple-300"
                              )}
                              title={opt.name}
                            >
                              <div className={cn("w-full h-full rounded-md", opt.value)} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 패턴 */}
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">패턴</label>
                        <div className="flex flex-wrap gap-1">
                          {patternOptions.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setCustomPattern(opt.id)}
                              className={cn(
                                "px-2 py-1 text-xs rounded-md transition-all",
                                customPattern === opt.id
                                  ? "bg-purple-500 text-white"
                                  : "bg-white/60 text-muted-foreground hover:bg-white"
                              )}
                            >
                              {opt.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 텍스처 */}
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">텍스처</label>
                        <div className="flex flex-wrap gap-1">
                          {textureOptions.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setCustomTexture(opt.id)}
                              className={cn(
                                "px-2 py-1 text-xs rounded-md transition-all",
                                customTexture === opt.id
                                  ? "bg-purple-500 text-white"
                                  : "bg-white/60 text-muted-foreground hover:bg-white"
                              )}
                            >
                              {opt.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 테두리 */}
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">테두리</label>
                        <div className="flex flex-wrap gap-1">
                          {borderStyleOptions.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setCustomBorderStyle(opt.id)}
                              className={cn(
                                "px-2 py-1 text-xs rounded-md transition-all",
                                customBorderStyle === opt.id
                                  ? "bg-purple-500 text-white"
                                  : "bg-white/60 text-muted-foreground hover:bg-white"
                              )}
                            >
                              {opt.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 코너 장식 */}
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">코너 장식</label>
                        <div className="flex flex-wrap gap-1">
                          {cornerDecorationOptions.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setCustomCornerDecoration(opt.id)}
                              className={cn(
                                "px-2 py-1 text-xs rounded-md transition-all",
                                customCornerDecoration === opt.id
                                  ? "bg-purple-500 text-white"
                                  : "bg-white/60 text-muted-foreground hover:bg-white"
                              )}
                            >
                              {opt.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 오른쪽: 미리보기 */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-foreground mb-1.5 block">미리보기</label>
                      <div className="flex-1 min-h-[160px] rounded-xl overflow-hidden border border-purple-200 relative">
                        <StationeryRenderer
                          style={customPreviewStyle}
                          className="absolute inset-0"
                          showCornerDecorations={true}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveCustomStationery}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="relative w-5 h-5">
                          <div className="absolute inset-0 rounded-full border-2 border-white/30" />
                          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                          <Sparkles className="absolute inset-0.5 w-4 h-4 text-white/80 animate-pulse" />
                        </div>
                        <span>편지지를 저장하고 있어요...</span>
                      </div>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        이 스타일로 저장하기
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI 카테고리 로딩 상태 */}
      {isAiCategory && isLoadingUserStationeries && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-sm text-muted-foreground">내 편지지를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* AI 카테고리 - 편지지 없음 상태 */}
      {isAiCategory && !isLoadingUserStationeries && filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">아직 만든 편지지가 없어요</h3>
          <p className="text-sm text-muted-foreground mb-4">
            위에서 AI로 나만의 편지지를 만들어보세요!
          </p>
        </div>
      )}

      {/* 편지지 그리드 */}
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "grid gap-8 pt-3",
          resolvedCategories.length === 0 && "hidden",
          isAiCategory
            ? "grid-cols-1"
            : filteredItems.some(i => i.backgroundImage && i.isPremium)
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
          // 로딩 중이거나 빈 상태면 숨김
          isAiCategory && (isLoadingUserStationeries || filteredItems.length === 0) && "hidden"
        )}
      >
        {filteredItems.map((item, index) => {
          const isSelected = selectedId === item.id;
          const isUserGenerated = userAiStationeries.some(s => s.id === item.id);

          const handleSelect = () => {
            onSelect(item.id);
            const isAiItem = item.category === 'AI' || item.category === 'ai';
            if (isUserGenerated || isAiItem) {
              onGeneratedStationeryChange?.({ ...item });
            } else {
              onGeneratedStationeryChange?.(null);
            }
          };

          const categoryLabel = categoryLabelMap.get(item.category)
            ?? getStationeryCategoryLabel(DEFAULT_STATIONERY_CATEGORY_SETTINGS, item.category);

          // 그리드 열 수에 따른 transform-origin 계산
          // 상용(backgroundImage): 1col → sm:2col → lg:3col
          // 기본/디자이너: 2col → sm:3col → lg:4col
          const hasImages = filteredItems.some(i => i.backgroundImage && i.isPremium);
          const cols = hasImages ? 3 : 4; // lg 기준 열 수
          const colPos = index % cols;
          const originX = colPos === 0 ? 'left' : colPos === cols - 1 ? 'right' : 'center';

          return (
            <div
              key={item.id}
              style={{ transformOrigin: `${originX} top` }}
              className="relative group transition-all duration-300 ease-out hover:scale-105 hover:z-10"
              onClick={handleSelect}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(); }
              }}
            >
              {/* 카드 */}
              <div className={cn(
                "relative rounded-xl cursor-pointer transition-all duration-300 ease-out",
                "group-hover:-translate-y-3 group-hover:shadow-2xl group-hover:ring-2 group-hover:ring-primary/70",
                isSelected ? "ring-2 ring-primary shadow-lg" : "shadow-sm"
              )}>
                {/* 썸네일 */}
                <div className={cn(
                  "relative overflow-hidden rounded-xl",
                  isAiCategory ? "aspect-[3/4] max-h-[400px]"
                    : (getStationeryPreviewImage(item) && item.isPremium) ? "aspect-[4/3]"
                    : "aspect-[3/4]",
                )}>
                  <StationeryRenderer
                    style={{
                      bgColor: item.bgColor,
                      bgGradient: item.bgGradient,
                      pattern: item.pattern,
                      patternColor: item.patternColor,
                      patternOpacity: item.patternOpacity,
                      texture: item.texture,
                      border: item.border,
                      cornerDecoration: item.cornerDecoration,
                      customSvg: item.customSvg,
                      backgroundImage: getStationeryPreviewImage(item),
                      frontImage: item.frontImage,
                      backImage: item.backImage,
                    }}
                    className="absolute inset-0"
                    showCornerDecorations={true}
                  >
                    {item.icon && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {item.icon}
                      </div>
                    )}
                  </StationeryRenderer>

                  {/* 호버 오버레이 — 어두운 배경 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 pointer-events-none" />

                  {/* 배지 */}
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-[2]">
                    {isUserGenerated && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-size-11 font-semibold rounded-full flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" />AI
                      </span>
                    )}
                    {item.isNew && !isUserGenerated && (
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-size-11 font-semibold rounded-full shadow-sm">NEW</span>
                    )}
                    {item.isPremium && !item.isNew && (
                      <span className="px-2 py-0.5 bg-amber-500 text-white text-size-11 font-semibold rounded-full shadow-sm">PRO</span>
                    )}
                  </div>

                  {/* 선택 체크 */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg z-[2]"
                    >
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  )}

                  {/* 하단 정보 패널 — 썸네일 안쪽 하단, 호버 시 슬라이드업 */}
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 z-[3] transition-all duration-300",
                    "translate-y-full group-hover:translate-y-0",
                    isSelected && "!translate-y-0"
                  )}>
                    <div className={cn(
                      "bg-card/95 backdrop-blur-sm px-3 py-2.5 rounded-b-xl",
                      isSelected ? "border-t border-primary/30" : "border-t border-border/50"
                    )}>
                      <h3 className={cn(
                        "text-sm font-semibold truncate",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {item.name}
                      </h3>
                      <p className="text-size-11 text-muted-foreground">{categoryLabel}</p>
                      <button
                        className={cn(
                          "w-full mt-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all origin-bottom",
                          "scale-0 group-hover:scale-100 delay-150 duration-300",
                          isSelected
                            ? "bg-primary text-primary-foreground !scale-100"
                            : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                        )}
                        onClick={(e) => { e.stopPropagation(); handleSelect(); }}
                      >
                        {isSelected ? '✓ 선택됨' : '선택하기'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 확대 버튼 — 카드 바깥, 정 가운데 */}
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span
                  className="pointer-events-auto w-11 h-11 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-xl cursor-pointer scale-50 group-hover:scale-100 transition-transform duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedStationery(item);
                  }}
                >
                  <Maximize2 className="w-5 h-5 text-gray-700" />
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>


      {/* 편지지 확대 모달 */}
      <AnimatePresence>
        {expandedStationery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setExpandedStationery(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "relative w-full rounded-2xl overflow-hidden shadow-2xl",
                (getStationeryPreviewImage(expandedStationery) && expandedStationery.isPremium)
                  ? "max-w-3xl aspect-[4/3]"
                  : "max-w-2xl aspect-[148/210]"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 편지지 렌더링 */}
              <StationeryRenderer
                style={{
                  bgColor: expandedStationery.bgColor,
                  bgGradient: expandedStationery.bgGradient,
                  pattern: expandedStationery.pattern,
                  patternColor: expandedStationery.patternColor,
                  patternOpacity: expandedStationery.patternOpacity,
                  texture: expandedStationery.texture,
                  border: expandedStationery.border,
                  cornerDecoration: expandedStationery.cornerDecoration,
                  customSvg: expandedStationery.customSvg,
                  backgroundImage: getStationeryPreviewImage(expandedStationery),
                  frontImage: expandedStationery.frontImage,
                  backImage: expandedStationery.backImage,
                }}
                className="absolute inset-0"
                showCornerDecorations={true}
              />

              {/* 닫기 버튼 */}
              <button
                onClick={() => setExpandedStationery(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* 편지지 정보 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-16">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-xl font-semibold">{expandedStationery.name}</h3>
                    <p className="text-white/70 text-sm mt-1">
                      {expandedStationery.category === "AI" || expandedStationery.category === "ai"
                        ? "AI 생성 편지지"
                        : categoryLabelMap.get(expandedStationery.category)
                          ?? getStationeryCategoryLabel(DEFAULT_STATIONERY_CATEGORY_SETTINGS, expandedStationery.category)}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      onSelect(expandedStationery.id);
                      const isAiItem = expandedStationery.category === 'AI' || expandedStationery.category === 'ai';
                      if (isAiItem) {
                        onGeneratedStationeryChange?.({ ...expandedStationery });
                      } else {
                        onGeneratedStationeryChange?.(null);
                      }
                      setExpandedStationery(null);
                      toast.success(`"${expandedStationery.name}" 편지지가 선택되었습니다`);
                    }}
                    className="bg-white text-black hover:bg-white/90"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    선택하기
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
