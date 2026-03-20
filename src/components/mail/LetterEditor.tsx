'use client';

import { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Mic,
  MicOff,
  Smile,
  FolderOpen,
  RotateCcw,
  Save,
  Sparkles,
  Wand2,
  Check,
  RefreshCw,
  X,
  Edit3,
  Bold,
  Italic,
  Type,
  Trash2,
  ClipboardCopy,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/fetch";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";
import { AIWritingHelper } from "./AIWritingHelper";
import { AIWriterModal } from "./AIWriterModal";
import { RecipientOnboarding } from "./RecipientOnboarding";
import { StationeryRenderer } from "./StationeryRenderer";
import { TypewriterLoader } from "@/components/ui/typewriter-loader";
import { useRecipientAIProfile } from "@/hooks/useRecipientAIProfile";
import type { RecipientAIProfile } from "@/hooks/useRecipientAIProfile";
import type { Stationery } from "./StationerySelector";
import { useKoreanHolidays } from "@/hooks/useKoreanHolidays";

// 캔버스 상수 (A5 용지 기준: 148×210mm, 에디터 영역 650x784)
const CANVAS_WIDTH = 772;
const CANVAS_HEIGHT = 1096;  // 헤더(168) + 에디터(784) + 푸터(144)
const PADDING_X = 61;        // (772 - 650) / 2
const PADDING_TOP = 168;     // 헤더 공간
const PADDING_BOTTOM = 144;  // 푸터 공간
const EDITOR_HEIGHT = CANVAS_HEIGHT - PADDING_TOP - PADDING_BOTTOM; // 784

// 폰트 크기에 비례한 동적 줄 높이/줄 수 계산
function getLineHeight(_fontSize: number): number {
  return Math.floor(EDITOR_HEIGHT / 18); // 784 / 18 = 43px 고정
}

function getTotalLines(_lineHeight: number): number {
  return 18; // 편지지 고정 18줄
}

// 폰트 크기 옵션 (650px 너비 기준)
const FONT_SIZES: Record<string, { label: string; size: number }> = {
  small: { label: '소', size: 19 },
  medium: { label: '중', size: 21 },
  large: { label: '대', size: 25 },
};

// 폰트 옵션
const FONT_FAMILIES: Record<string, { label: string; style: string; className: string; fontFamily: string }> = {
  pretendard: { label: 'Pretendard', style: '기본체', className: 'font-pretendard', fontFamily: 'Pretendard, sans-serif' },
  'nanum-myeongjo': { label: '나눔명조', style: '명조체', className: 'font-nanum-myeongjo', fontFamily: '"Nanum Myeongjo", serif' },
  'nanum-pen': { label: '나눔손글씨', style: '손글씨체', className: 'font-nanum-pen', fontFamily: '"Nanum Pen Script", cursive' },
};

// 색상 옵션
const FONT_COLORS = [
  { id: "default", value: '#1a1a1a' },
  { id: "gray", value: '#4a4a4a' },
  { id: "white", value: '#ffffff' },
  { id: "blue", value: '#2563eb' },
  { id: "red", value: '#dc2626' },
  { id: "green", value: '#16a34a' },
  { id: "purple", value: '#7c3aed' },
  { id: "orange", value: '#ea580c' },
  { id: "brown", value: '#92400e' },
];

// CMY 색상 겹침 아이콘 (3원색 겹침 스타일)
function ColorWheelIcon({ size = 16 }: { size?: number }) {
  const r = size * 0.32;
  const cx = size / 2;
  const cy = size / 2;
  const offset = size * 0.18;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy - offset} r={r} fill="#00CFFF" style={{ mixBlendMode: 'multiply' }} />
      <circle cx={cx - offset * 0.87} cy={cy + offset * 0.5} r={r} fill="#FF0090" style={{ mixBlendMode: 'multiply' }} />
      <circle cx={cx + offset * 0.87} cy={cy + offset * 0.5} r={r} fill="#FFE000" style={{ mixBlendMode: 'multiply' }} />
    </svg>
  );
}

// 이모지 목록
const EMOJIS = ['😊', '🥰', '😢', '🙏', '❤️', '💛', '💚', '💙', '🌸', '🌷', '☀️', '🌙', '⭐', '✨', '🎁', '💌'];

// 빠른 태그
const QUICK_TAGS = {
  start: {
    label: '처음',
    tags: [
      { label: '따뜻한 인사', text: '안녕하세요, 그동안 잘 지내셨나요?' },
      { label: '안부 묻기', text: '오랜만에 편지를 드립니다. 건강하게 지내고 계신가요?' },
      { label: '계절 인사', text: '어느덧 계절이 바뀌었습니다. 따스한 햇살처럼 좋은 일만 가득하시길 바랍니다.' },
      { label: '감사 인사', text: '항상 저를 생각해주시고 응원해주셔서 진심으로 감사드립니다.' },
    ]
  },
  middle: {
    label: '중간',
    tags: [
      { label: '근황 전하기', text: '요즘 저는 잘 지내고 있습니다. ' },
      { label: '추억 이야기', text: '지난번에 함께했던 시간이 떠오릅니다. ' },
      { label: '감사 표현', text: '그동안 해주신 것들에 대해 항상 감사하게 생각하고 있습니다. ' },
      { label: '걱정/응원', text: '많이 힘드시진 않으신지 걱정이 됩니다. 늘 응원하고 있습니다. ' },
    ]
  },
  end: {
    label: '마무리',
    tags: [
      { label: '건강 바람', text: '항상 건강하시고, 좋은 일만 가득하시길 바랍니다.' },
      { label: '재회 약속', text: '다음에 꼭 찾아뵙겠습니다. 그날을 기다리며.' },
      { label: '사랑 표현', text: '멀리서나마 늘 생각하고 있습니다. 사랑합니다.' },
      { label: '짧은 마무리', text: '그럼 안녕히 계세요.' },
    ]
  },
  // refine: {
  //   label: '다듬기',
  //   tags: [
  //     { label: '💝 감정 강화', toneId: 'emotion', description: '감정을 더 풍부하게' },
  //     { label: '📋 격식체', toneId: 'formal', description: '정중하고 격식있게' },
  //     { label: '😊 친근하게', toneId: 'friendly', description: '친근하고 편하게' },
  //     { label: '📝 간결하게', toneId: 'concise', description: '핵심만 간결하게' },
  //     { label: '👩 엄마 말투', toneId: 'mom', description: '따뜻한 엄마처럼' },
  //     { label: '👫 형/누나 말투', toneId: 'sibling', description: '친한 형제처럼' },
  //     { label: '🤝 친구 말투', toneId: 'friend', description: '편한 친구처럼' },
  //     { label: '🎯 진지하게', toneId: 'serious', description: '진지하고 신중하게' },
  //   ]
  // }
};

/**
 * 줄 수 기반 페이지 분할
 * 18줄(TOTAL_LINES) 단위로 페이지를 분할
 */
function splitTextIntoPages(content: string, totalLines: number): string[] {
  if (!content.trim()) return [''];

  const lines = content.split('\n');
  const pages: string[] = [];

  // totalLines줄씩 분할
  for (let i = 0; i < lines.length; i += totalLines) {
    const pageLines = lines.slice(i, i + totalLines);
    const pageContent = pageLines.join('\n');
    if (pageContent.trim() || pages.length === 0) {
      pages.push(pageContent);
    }
  }

  return pages.length > 0 ? pages : [''];
}

type TextAlign = "left" | "center" | "right";

interface Draft {
  id: string;
  title: string;
  date: string;
  preview: string;
}

interface LetterEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  recipientName?: string;
  recipientRelation?: string;
  recipientFacility?: string;
  recipientAddress?: string;
  senderAddress?: string;
  recipientPrisonerNumber?: string;
  recipientContext?: string;
  recipientId?: string;
  letterHistory?: Array<{
    date: string;
    direction: 'sent' | 'received';
    content: string;
  }>;
  recipientGender?: 'male' | 'female' | null;
  recipientBirthDate?: string | null;
  recipientFacilityType?: string;
  recipientRegion?: string | null;
  stationeryStyle?: Stationery | null;
  font?: string;
  onFontChange?: (font: string) => void;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
  isBold?: boolean;
  onBoldChange?: (bold: boolean) => void;
  textAlign?: TextAlign;
  onTextAlignChange?: (align: TextAlign) => void;
  textColor?: string;
  onTextColorChange?: (color: string) => void;
  // 임시저장 관련
  drafts?: Draft[];
  onLoadDraft?: (id: string) => void;
  onDeleteDraft?: (id: string) => void;
  onSaveDraft?: () => void;
  onResetContent?: () => void;
  // 페이지 상태 (부모에서 관리)
  currentPage?: number;
  onCurrentPageChange?: (page: number) => void;
  // 스텝 네비게이션 (이전/다음)
  onStepPrev?: () => void;
  onStepNext?: () => void;
  canStepNext?: boolean;
}

export function LetterEditor({
  content,
  onContentChange,
  recipientName,
  recipientRelation,
  recipientFacility,
  recipientAddress,
  senderAddress,
  recipientPrisonerNumber,
  recipientContext,
  recipientId,
  letterHistory,
  recipientGender,
  recipientBirthDate,
  recipientFacilityType,
  recipientRegion,
  stationeryStyle,
  font: fontProp,
  onFontChange,
  fontSize: fontSizeProp,
  onFontSizeChange,
  textAlign: textAlignProp,
  onTextAlignChange,
  textColor: textColorProp,
  onTextColorChange,
  drafts = [],
  onLoadDraft,
  onDeleteDraft,
  onSaveDraft,
  onResetContent,
  currentPage: externalCurrentPage,
  onCurrentPageChange,
  onStepPrev,
  onStepNext,
  canStepNext = true,
}: LetterEditorProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const ignoreObserverRef = useRef(false);

  // 스케일 (컨테이너 너비에 따라 동적 계산, 초기값 null로 계산 전까지 숨김)
  const [scale, setScale] = useState<number | null>(null);

  // 플로팅 버튼 위치 (fixed 포지션용)
  const [floatingButtonLeft, setFloatingButtonLeft] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [pinchZoom, setPinchZoom] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const pinchStartRef = useRef<{ dist: number; zoom: number } | null>(null);

  // 스크롤 상태 (상단 그림자 표시용)
  const [hasScrolled, setHasScrolled] = useState(false);

  // 내부 스타일 상태 (외부 props 없을 때 사용)
  const [internalFont, setInternalFont] = useState("pretendard");
  const [internalFontSize, setInternalFontSize] = useState(13);
  const [internalTextAlign, setInternalTextAlign] = useState<TextAlign>("left");
  const [internalTextColor, setInternalTextColor] = useState("#1a1a1a");

  // 실제 사용 값
  const font = fontProp ?? internalFont;
  const fontSize = fontSizeProp ?? internalFontSize;
  const textAlign = textAlignProp ?? internalTextAlign;
  const textColor = textColorProp ?? internalTextColor;

  // 공휴일 체크 (도착예정일 계산용)
  const currentYear = new Date().getFullYear();
  const { getHolidayName } = useKoreanHolidays(currentYear);

  // 폰트 크기 키 계산
  const fontSizeKey = fontSize <= FONT_SIZES.small.size ? 'small' : fontSize >= FONT_SIZES.large.size ? 'large' : 'medium';

  // 폰트 크기 기반 동적 줄 높이/줄 수
  const lineHeight = useMemo(() => getLineHeight(fontSize), [fontSize]);
  const totalLines = useMemo(() => getTotalLines(lineHeight), [lineHeight]);

  // 값 변경 핸들러
  const setFont = (value: string) => {
    setInternalFont(value);
    onFontChange?.(value);
  };
  const setFontSize = (value: number) => {
    setInternalFontSize(value);
    onFontSizeChange?.(value);
  };
  const setTextAlign = (value: TextAlign) => {
    setInternalTextAlign(value);
    onTextAlignChange?.(value);
  };
  const setTextColor = (value: string) => {
    setInternalTextColor(value);
    onTextColorChange?.(value);
  };

  // 드롭다운 상태
  const [showDraftDropdown, setShowDraftDropdown] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);

  // AI 메뉴 상태
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [showAITooltip, setShowAITooltip] = useState(true);
  const [selectedSection, setSelectedSection] = useState<'start' | 'middle' | 'end'>('start');
  const [isAIHelperOpen, setIsAIHelperOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"intro" | "middle" | "conclusion" | null>(null);

  // AI 플로팅 메뉴: 처음 탭 동적 선택지
  const [introOptions, setIntroOptions] = useState<Array<{label: string, text: string}>>([]);
  const [isLoadingIntroOptions, setIsLoadingIntroOptions] = useState(false);
  // AI 플로팅 메뉴: 중간 탭 채팅
  const [middleChatInput, setMiddleChatInput] = useState('');
  const [middleChatHistory, setMiddleChatHistory] = useState<Array<{input: string, expanded: string}>>([]);
  const [isExpandingMiddle, setIsExpandingMiddle] = useState(false);
  const [middleExpandedPreview, setMiddleExpandedPreview] = useState<{input: string, expanded: string} | null>(null);
  // AI 플로팅 메뉴: 마무리 탭 동적 선택지
  const [conclusionOptions, setConclusionOptions] = useState<Array<{label: string, text: string}>>([]);
  const [isLoadingConclusionOptions, setIsLoadingConclusionOptions] = useState(false);
  const [showConclusionCustomInput, setShowConclusionCustomInput] = useState(false);
  const [conclusionCustomInput, setConclusionCustomInput] = useState('');
  const [isExpandingConclusion, setIsExpandingConclusion] = useState(false);

  // AI 온보딩 상태
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [showDraftPreview, setShowDraftPreview] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [isRefiningDraft, setIsRefiningDraft] = useState(false);
  const [customRefineInput, setCustomRefineInput] = useState('');
  const customRefineInputRef = useRef<HTMLInputElement>(null);
  const { profile: aiProfile, hasProfile: hasAIProfile, isLoading: isAIProfileLoading, saveProfile: saveAIProfile } = useRecipientAIProfile(recipientId);

  // 날씨 상태
  const [recipientWeather, setRecipientWeather] = useState<{temp: number, feelsLike: number, humidity: number, description: string, windSpeed: number} | null>(null);

  // 페이지 상태
  const [pages, setPages] = useState<Array<{ id: number; content: string }>>([{ id: 1, content: '' }]);
  // 현재 페이지 (외부 제어 또는 내부 상태)
  const [internalCurrentPage, setInternalCurrentPage] = useState(0);
  const currentPage = externalCurrentPage ?? internalCurrentPage;
  const setCurrentPage = (page: number | ((prev: number) => number)) => {
    const newPage = typeof page === 'function' ? page(currentPage) : page;
    if (onCurrentPageChange) {
      onCurrentPageChange(newPage);
    }
    setInternalCurrentPage(newPage);
  };

  // AI 이어쓰기 상태
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [continuePosition, setContinuePosition] = useState({ top: 200, left: 100 });
  const [isContinuing, setIsContinuing] = useState(false);
  const [showContinueSuggestion, setShowContinueSuggestion] = useState(false);
  const [suggestionSpan, setSuggestionSpan] = useState<HTMLSpanElement | null>(null);
  const continueTimerRef = useRef<NodeJS.Timeout | null>(null);

  // AI 시작 태그 생성 상태
  const [isGeneratingStart, setIsGeneratingStart] = useState(false);

  // IME 조합 상태 (한글 입력 시 겹침 방지)
  const isComposingRef = useRef(false);
  // 붙여넣기 상태 (중복 분할 방지)
  const isPastingRef = useRef(false);
  // 오버플로우 체크 debounce 타이머
  const overflowCheckTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 마지막으로 저장한 content (외부 변경 감지용) - 특수값으로 초기화하여 첫 로드 허용
  const lastSavedContentRef = useRef<string | null>(null);
  // 에디터 포커스 상태
  const hasFocusRef = useRef(false);
  // 모바일 blur 후 focus 방지 (키보드 완료 버튼)
  const blurCooldownRef = useRef(false);
  const safeFocus = useCallback(() => {
    if (!blurCooldownRef.current && editorRef.current) {
      editorRef.current.focus();
    }
  }, []);
  const [generatingLabel, setGeneratingLabel] = useState('');

  // 이전 페이지 번호 (페이지 전환 감지용)
  const prevPageRef = useRef(currentPage);

  // AI 다듬기/다시쓰기 상태
  const [showRefineButton, setShowRefineButton] = useState(false);
  const [refinePosition, setRefinePosition] = useState({ top: 200, left: 100 });
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [showRefineSuggestion, setShowRefineSuggestion] = useState(false);
  const [refinedText, setRefinedText] = useState('');

  // AI 되돌리기용 이전 상태 저장
  const [canUndo, setCanUndo] = useState(false);
  const previousPagesRef = useRef<Array<{ id: number; content: string }> | null>(null);

  // 폰트/색상 적용을 위한 저장된 선택 정보 (동기적 업데이트를 위해 ref 사용)
  const savedSelectionRef = useRef<{
    text: string;
    startContainer: Node;
    startOffset: number;
    endContainer: Node;
    endOffset: number;
  } | null>(null);

  // 현재 선택 영역 저장 함수
  const saveCurrentSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && editorRef.current?.contains(sel.anchorNode)) {
      const text = sel.toString();
      if (text.length > 0) {
        const range = sel.getRangeAt(0);
        savedSelectionRef.current = {
          text,
          startContainer: range.startContainer,
          startOffset: range.startOffset,
          endContainer: range.endContainer,
          endOffset: range.endOffset,
        };
        console.log('선택 저장됨:', text);
        return true;
      }
    }
    return false;
  }, []);

  // 현재 페이지가 비어있는지
  const currentPageEmpty = pages[currentPage]?.content?.trim().length === 0;

  // 음성인식
  const {
    isListening,
    isSupported: isSpeechSupported,
    interimTranscript,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang: 'ko-KR',
    continuous: true,
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        insertText(transcript);
      }
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  // 스케일 및 플로팅 버튼 위치 계산 (컨테이너 너비 기반)
  // useLayoutEffect로 페인트 전에 계산하여 깜빡임 방지
  useLayoutEffect(() => {
    const updateLayout = () => {
      // 모바일 감지 (768px 미만)
      setIsMobile(window.innerWidth < 768);

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const containerWidth = rect.width;

        // 스케일 계산: 컨테이너 너비 / 캔버스 너비 (최대 1.0으로 772px까지 표시)
        const newScale = Math.min(containerWidth / CANVAS_WIDTH, 1.0);
        setScale(newScale);

        // 플로팅 버튼 위치 계산 (스케일 적용된 캔버스 기준) - 데스크톱만
        if (window.innerWidth >= 768) {
          const scaledCanvasWidth = CANVAS_WIDTH * newScale;
          const buttonLeft = rect.left + rect.width / 2 + scaledCanvasWidth / 2 + 16;
          setFloatingButtonLeft(buttonLeft);
        }
      }
    };
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);


  // 오버플로우 체크 타이머 정리
  useEffect(() => {
    return () => {
      if (overflowCheckTimerRef.current) {
        clearTimeout(overflowCheckTimerRef.current);
      }
    };
  }, []);

  // 툴팁 자동 숨김
  useEffect(() => {
    const timer = setTimeout(() => setShowAITooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // 페이지 이탈 시 자동 임시저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 내용이 있을 때만 저장
      const hasContent = pages.some(page => page.content.trim().length > 0);
      if (hasContent && onSaveDraft) {
        onSaveDraft();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleBeforeUnload();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pages, onSaveDraft]);

  // 페이지 변경 시 에디터 내용 동기화 (페이지 전환 시에만 실행)
  useEffect(() => {
    // 페이지 번호가 실제로 변경되었을 때만 에디터 내용 동기화
    if (prevPageRef.current !== currentPage) {
      prevPageRef.current = currentPage;
      if (editorRef.current) {
        editorRef.current.innerText = pages[currentPage]?.content || '';
      }
    }
  }, [currentPage, pages]);

  // 외부 content prop이 변경되면 페이지에 반영 (자동 페이지 분할)
  useEffect(() => {
    // 마지막으로 저장한 내용과 같으면 무시 (내부 저장으로 인한 변경)
    if (content === lastSavedContentRef.current) {
      return;
    }

    // 내용이 크게 다르면 (임시저장 불러오기 등) 포커스 상관없이 로드
    const currentEditorContent = editorRef.current?.innerText || '';
    const contentDiff = Math.abs(content.length - currentEditorContent.length);
    // significant change 조건:
    // 1. 차이가 50자 이상 (드래프트 로드)
    // 2. 외부 content가 비었는데 에디터에 내용이 있음 (초기화)
    // 3. 외부 content가 충분히 길고 에디터가 비어있음 (드래프트 로드)
    // 빈 에디터에서 타이핑하는 경우는 significant가 아님
    const isSignificantChange = contentDiff > 50 ||
      (content.length === 0 && currentEditorContent.length > 0) ||
      (content.length > 50 && currentEditorContent.length === 0);

    // 에디터에 포커스가 있고, 작은 변경이면 무시 (타이핑 중 초기화 방지)
    if (hasFocusRef.current && !isSignificantChange) {
      return;
    }

    // 기존 구분자가 있으면 제거 (하위 호환성)
    const cleanContent = content.replace(/\n\n--- 페이지 구분 ---\n\n/g, '\n\n');

    // 줄 수 기반 페이지 분할
    const pageContents = splitTextIntoPages(cleanContent, totalLines);

    const newPages = pageContents.map((pageContent, idx) => ({
      id: idx + 1,
      content: pageContent.trim(),
    }));

    // 최소 1페이지는 있어야 함
    if (newPages.length === 0) {
      newPages.push({ id: 1, content: '' });
    }

    setPages(newPages);
    hasFocusRef.current = false; // 새 페이지 에디터가 content 설정받도록
    setCurrentPage(0);
    // prevPageRef를 현재 페이지(0)로 설정하여 page sync useEffect가 중복 실행되지 않도록 함
    // 에디터 내용은 아래에서 직접 설정하므로 page sync가 다시 실행될 필요 없음
    prevPageRef.current = 0;
    lastSavedContentRef.current = content;

    if (editorRef.current) {
      editorRef.current.innerText = newPages[0]?.content || '';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // 폰트 크기 변경 시 페이지 재분할 (시각적 줄 높이 기반)
  const prevTotalLinesRef = useRef(totalLines);
  useEffect(() => {
    if (prevTotalLinesRef.current === totalLines) return;
    prevTotalLinesRef.current = totalLines;

    if (!editorRef.current) return;

    // 현재 에디터 내용을 pages에 반영
    const currentEditorContent = editorRef.current.innerText || '';
    const allPages = pages.map((page, idx) =>
      idx === currentPage ? { ...page, content: currentEditorContent } : page
    );

    // 전체 내용을 모아서 재분할
    const allContent = allPages.map(p => p.content).filter(c => c.trim()).join('\n\n');
    if (!allContent.trim()) return;

    // 1페이지로 리셋 후 오버플로우 분할
    // checkOverflowAndSplit이 editorRef 내용을 기준으로 동작하므로
    // pages를 1개로 리셋하고 에디터에 전체 내용을 넣은 뒤 분할
    editorRef.current.innerText = allContent;

    // 기존 페이지 완전히 초기화 (append 방지)
    setPages([{ id: 1, content: allContent }]);
    setCurrentPage(0);

    // DOM 업데이트 후 시각적 기반 오버플로우 분할
    setTimeout(() => {
      checkOverflowAndSplit();
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalLines]);

  // 오버플로우 체크 및 페이지 분할 (줄 수 기반)
  // AI가 긴 텍스트를 생성할 때 여러 페이지로 자동 분할됨
  const checkOverflowAndSplit = useCallback(() => {
    // 1. 에디터 참조 확인
    if (!editorRef.current) return;

    const editorContent = editorRef.current.innerText || '';

    // 2. 줄 수 계산 함수 (실제 렌더링 기반)
    const countVisualLines = (text: string): number => {
      if (!text) return 0;

      const div = document.createElement('div');
      const computedStyle = window.getComputedStyle(editorRef.current!);

      // 에디터와 동일한 스타일 적용
      div.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: ${CANVAS_WIDTH - PADDING_X * 2}px;
        font-family: ${computedStyle.fontFamily};
        font-size: ${computedStyle.fontSize};
        line-height: ${lineHeight}px;
        white-space: pre-wrap;
        word-break: break-word;
        overflow-wrap: break-word;
        box-sizing: border-box;
      `;
      div.innerText = text;
      document.body.appendChild(div);
      const height = div.scrollHeight;
      document.body.removeChild(div);

      // 높이를 줄 높이로 나누어 줄 수 계산 (올림)
      return Math.ceil(height / lineHeight);
    };

    // 텍스트를 페이지에 맞게 분할하는 함수 (한 페이지 분량 추출)
    const splitToFitPage = (text: string): { fits: string; overflow: string } => {
      if (!text) return { fits: '', overflow: '' };

      const lines = text.split('\n');

      // 전체가 totalLines줄 이하면 그대로 반환
      if (countVisualLines(text) <= totalLines) {
        return { fits: text, overflow: '' };
      }

      // 각 줄을 추가하면서 totalLines를 초과하는 지점 찾기
      for (let i = 0; i < lines.length; i++) {
        const testContent = lines.slice(0, i + 1).join('\n');
        const testLines = countVisualLines(testContent);

        if (testLines > totalLines) {
          if (i === 0) {
            // 첫 줄 자체가 초과 (매우 긴 텍스트) - 문자 단위 분할
            const line = lines[0];

            // 이진 탐색으로 맞는 문자 위치 찾기
            let left = 0;
            let right = line.length;
            while (left < right) {
              const mid = Math.floor((left + right + 1) / 2);
              if (countVisualLines(line.substring(0, mid)) <= totalLines) {
                left = mid;
              } else {
                right = mid - 1;
              }
            }
            let charIndex = left;

            // 단어 경계에서 끊기 (공백 찾기)
            const spaceIndex = line.lastIndexOf(' ', charIndex);
            if (spaceIndex > charIndex * 0.5) {
              charIndex = spaceIndex;
            }

            const fits = line.substring(0, charIndex).trim();
            const overflow = line.substring(charIndex).trim() +
              (lines.length > 1 ? '\n' + lines.slice(1).join('\n') : '');
            return { fits, overflow };
          } else {
            // 이전 줄들까지는 이내
            return {
              fits: lines.slice(0, i).join('\n'),
              overflow: lines.slice(i).join('\n').trim()
            };
          }
        }
      }

      // 마지막 줄 내에서 분할 필요
      const prevContent = lines.length > 1 ? lines.slice(0, -1).join('\n') + '\n' : '';
      const lastLine = lines[lines.length - 1];

      // 이진 탐색으로 분할점 찾기
      let left = 0;
      let right = lastLine.length;
      while (left < right) {
        const mid = Math.floor((left + right + 1) / 2);
        if (countVisualLines(prevContent + lastLine.substring(0, mid)) <= totalLines) {
          left = mid;
        } else {
          right = mid - 1;
        }
      }

      return {
        fits: (prevContent + lastLine.substring(0, left)).trim(),
        overflow: lastLine.substring(left).trim()
      };
    };

    const currentLines = countVisualLines(editorContent);
    console.log('[checkOverflowAndSplit] 현재 줄 수:', currentLines, '최대 줄 수:', totalLines);

    // 3. totalLines줄 이하면 분할 필요 없음
    if (currentLines <= totalLines) return;

    // 4. 첫 페이지 분할
    const { fits: currentContent, overflow: initialOverflow } = splitToFitPage(editorContent);

    console.log('[checkOverflowAndSplit] currentContent 줄수:', countVisualLines(currentContent));
    console.log('[checkOverflowAndSplit] initialOverflow 길이:', initialOverflow.length);

    // 5. 빈 오버플로우 무시
    if (!initialOverflow) return;

    // 6. 오버플로우 내용을 여러 페이지로 분할 (AI가 긴 텍스트 생성 시 필요)
    const additionalPages: string[] = [];
    let remainingContent = initialOverflow;

    while (remainingContent) {
      const { fits, overflow } = splitToFitPage(remainingContent);
      if (fits) {
        additionalPages.push(fits);
      }
      if (!overflow || overflow === remainingContent) {
        // 무한 루프 방지
        break;
      }
      remainingContent = overflow;
    }

    console.log('[checkOverflowAndSplit] 추가 페이지 수:', additionalPages.length);

    // 7. 현재 페이지에 맞는 내용만 설정
    editorRef.current.innerText = currentContent;

    // 8. 새 페이지들 생성 (완전히 새로 구성)
    const newPages = [{ id: 1, content: currentContent }];
    additionalPages.forEach((pageContent, idx) => {
      newPages.push({ id: idx + 2, content: pageContent });
    });

    const lastNewPageIndex = newPages.length - 1;

    // 전체 내용 업데이트
    const allContentJoined = newPages.map(p => p.content).filter(c => c.trim()).join('\n\n');
    lastSavedContentRef.current = allContentJoined;
    onContentChange(allContentJoined);

    setPages(newPages);

    // 9. observer 일시 무시
    ignoreObserverRef.current = true;

    // 10. 포커스 상태 리셋 (새 페이지 에디터가 마운트될 때 content가 설정되도록)
    hasFocusRef.current = false;

    // 11. 마지막 새 페이지로 이동
    prevPageRef.current = lastNewPageIndex;
    setCurrentPage(lastNewPageIndex);

    // 12. 다음 틱에서 커서를 새 페이지 끝 부분에 위치
    const lastPageContent = additionalPages[additionalPages.length - 1] || '';
    setTimeout(() => {
      if (editorRef.current) {
        safeFocus();
        // 커서를 마지막 페이지 끝 위치로 이동
        const selection = window.getSelection();
        const range = document.createRange();
        const firstChild = editorRef.current.firstChild;
        if (firstChild) {
          const contentLength = lastPageContent.length;
          if (firstChild.nodeType === Node.TEXT_NODE) {
            const textLength = (firstChild as Text).length;
            const cursorPos = Math.min(contentLength, textLength);
            range.setStart(firstChild, cursorPos);
            range.setEnd(firstChild, cursorPos);
          } else {
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
          }
        } else {
          range.selectNodeContents(editorRef.current);
          range.collapse(true);
        }
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      ignoreObserverRef.current = false;
    }, 100);

    // 13. 토스트 메시지 (여러 페이지 생성 시 다른 메시지)
    if (additionalPages.length > 1) {
      toast.success(`${additionalPages.length}페이지가 추가되었습니다`, {
        description: `내용이 길어져 ${currentPage + 2}~${lastNewPageIndex + 1}페이지가 생성되었습니다`,
        duration: 3000,
      });
    } else {
      toast.success(`${lastNewPageIndex + 1}페이지로 이어집니다`, {
        description: '내용이 길어져 새 페이지가 생성되었습니다',
        duration: 3000,
      });
    }
  }, [currentPage, onContentChange, lineHeight, totalLines]);

  // 현재 페이지 내용 저장 (DOM 수정 없이)
  const saveCurrentPageContent = useCallback(() => {
    if (!editorRef.current) return;

    const editorContent = editorRef.current.innerText || '';

    // 일반적인 저장 (DOM 수정 없음)
    setPages(prev => {
      const updatedPages = prev.map((page, idx) =>
        idx === currentPage ? { ...page, content: editorContent } : page
      );
      const allContent = updatedPages.map(p => p.content).filter(c => c.trim()).join('\n\n');
      lastSavedContentRef.current = allContent;
      onContentChange(allContent);
      return updatedPages;
    });

    // 오버플로우 체크 즉시 실행
    checkOverflowAndSplit();
  }, [currentPage, onContentChange, checkOverflowAndSplit]);

  // Intersection Observer로 현재 페이지 감지 (스크롤 시에만)
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 수동 페이지 전환 직후에는 무시
        if (ignoreObserverRef.current) return;

        // 가장 많이 보이는 페이지를 현재 페이지로 설정
        let maxRatio = 0;
        let mostVisiblePage = currentPageRef.current;

        entries.forEach((entry) => {
          const pageIndex = parseInt(entry.target.getAttribute('data-page-index') || '0');
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisiblePage = pageIndex;
          }
        });

        // 50% 이상 보이는 페이지가 있을 때만 변경
        if (maxRatio > 0.5 && mostVisiblePage !== currentPageRef.current) {
          // 이전 페이지 내용 저장 후 전환
          saveCurrentPageContent();
          hasFocusRef.current = false; // 새 페이지 에디터가 content 설정받도록
          prevPageRef.current = mostVisiblePage;
          setCurrentPage(mostVisiblePage);
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    // 모든 페이지 요소 관찰
    pageRefs.current.forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pages.length, saveCurrentPageContent]);

  // 드롭다운 닫기
  const closeAllDropdowns = () => {
    setShowDraftDropdown(false);
    setShowFontDropdown(false);
    setShowColorDropdown(false);
    setShowEmojiDropdown(false);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.dropdown')) {
        closeAllDropdowns();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // 날씨 데이터 fetching
  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async () => {
      try {
        // 받는 곳 날씨 (주소에서 도시 추출)
        if (recipientAddress || recipientFacility) {
          const address = recipientAddress || recipientFacility || '';
          const cityMatch = address.match(/(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/);
          const city = cityMatch ? cityMatch[1] : 'Seoul';

          const recipientResponse = await apiFetch(`/api/v1/weather?location=${city}`);
          if (isMounted && recipientResponse.ok) {
            const recipientData = await recipientResponse.json();
            setRecipientWeather(recipientData.data);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('날씨 데이터 로드 실패:', error);
        }
      }
    };

    fetchWeather();
    return () => { isMounted = false; };
  }, [recipientAddress, recipientFacility]);

  // AI 메뉴 열릴 때 현재 탭 옵션 자동 로드
  useEffect(() => {
    if (showAIMenu) {
      if (selectedSection === 'start') {
        loadIntroOptions();
      } else if (selectedSection === 'end') {
        loadConclusionOptions();
      }
    }
  }, [showAIMenu, selectedSection]);

  // 커서 위치 가져오기
  const getCaretPosition = (element: HTMLElement): number => {
    let caretOffset = 0;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
  };

  // 버튼 위치 업데이트
  const updateButtonPosition = (el: HTMLElement) => {
    if (!el || !canvasRef.current) return;
    const r = document.createRange();
    r.selectNodeContents(el);
    const rects = r.getClientRects();
    if (!rects.length) return;
    const last = rects[rects.length - 1];
    const canvas = canvasRef.current.getBoundingClientRect();
    const currentScale = scale || 1;
    let left = (last.left - canvas.left) / currentScale;
    let top = (last.bottom - canvas.top) / currentScale + 12;
    left = Math.max(PADDING_X, Math.min(left, CANVAS_WIDTH - PADDING_X - 140));
    top = Math.min(top, CANVAS_HEIGHT - 60);
    setContinuePosition({ top, left });
  };

  // 텍스트/이모지 삽입
  const insertText = useCallback((text: string) => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editorRef.current.innerText += text;
    }
    saveCurrentPageContent();
    editorRef.current.focus();
  }, [saveCurrentPageContent]);

  const insertEmoji = useCallback((emoji: string) => {
    insertText(emoji);
    setShowEmojiDropdown(false);
  }, [insertText]);

  // 선택된 텍스트에 색상 적용
  const applyColorToSelection = useCallback((color: string) => {
    if (!editorRef.current) return;

    const saved = savedSelectionRef.current;
    console.log('색상 적용 시도:', saved);

    if (saved && saved.text.length > 0) {
      try {
        editorRef.current.focus();

        // 저장된 정보로 Range 재생성
        const range = document.createRange();
        range.setStart(saved.startContainer, saved.startOffset);
        range.setEnd(saved.endContainer, saved.endOffset);

        // Selection 복원
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);

        // insertHTML로 스타일이 적용된 span 삽입
        const escapedText = saved.text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>');
        const html = `<span style="color: ${color}">${escapedText}</span>`;
        document.execCommand('insertHTML', false, html);

        console.log('색상 적용 완료 (insertHTML):', color);

        // 선택 해제
        sel?.removeAllRanges();

        saveCurrentPageContent();
      } catch (e) {
        console.error('색상 적용 오류:', e);
      }

      savedSelectionRef.current = null;
      setShowColorDropdown(false);
      return;
    }

    // 선택 영역이 없으면 기본 색상만 변경
    setInternalTextColor(color);
    onTextColorChange?.(color);
    setShowColorDropdown(false);
  }, [saveCurrentPageContent, onTextColorChange]);

  // 선택된 텍스트에 폰트 적용
  const applyFontToSelection = useCallback((fontKey: string) => {
    if (!editorRef.current) return;

    const saved = savedSelectionRef.current;
    const fontFamily = FONT_FAMILIES[fontKey]?.fontFamily || 'Pretendard, sans-serif';
    console.log('폰트 적용 시도:', saved, fontFamily);

    if (saved && saved.text.length > 0) {
      try {
        editorRef.current.focus();

        // 저장된 정보로 Range 재생성
        const range = document.createRange();
        range.setStart(saved.startContainer, saved.startOffset);
        range.setEnd(saved.endContainer, saved.endOffset);

        // Selection 복원
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);

        // insertHTML로 스타일이 적용된 span 삽입
        const escapedText = saved.text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>');
        const html = `<span style="font-family: ${fontFamily}">${escapedText}</span>`;
        document.execCommand('insertHTML', false, html);

        console.log('폰트 적용 완료 (insertHTML):', fontFamily);

        // 선택 해제
        sel?.removeAllRanges();

        saveCurrentPageContent();
      } catch (e) {
        console.error('폰트 적용 오류:', e);
      }

      savedSelectionRef.current = null;
      setShowFontDropdown(false);
      return;
    }

    // 선택 영역이 없으면 기본 폰트만 변경
    setInternalFont(fontKey);
    onFontChange?.(fontKey);
    setShowFontDropdown(false);
  }, [saveCurrentPageContent, onFontChange]);

  // 볼드 적용
  const applyBold = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('bold', false);
    saveCurrentPageContent();
  }, [saveCurrentPageContent]);

  // 이탤릭 적용
  const applyItalic = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('italic', false);
    saveCurrentPageContent();
  }, [saveCurrentPageContent]);

  // 서식 제거 (일반)
  const removeFormatting = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('removeFormat', false);
    saveCurrentPageContent();
  }, [saveCurrentPageContent]);

  // 선택 변경 감지 (이어쓰기 & 다듬기)
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || !editorRef.current?.contains(sel.anchorNode)) {
      if (!isContinuing && !showContinueSuggestion) {
        if (continueTimerRef.current) clearTimeout(continueTimerRef.current);
        setShowContinueButton(false);
      }
      setShowRefineButton(false);
      return;
    }

    // 텍스트 선택 감지 (다듬기)
    if (!sel.isCollapsed) {
      const text = sel.toString().trim();
      if (text.length >= 2 && text.length <= 2000) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (canvasRect) {
          let left = (rect.left - canvasRect.left) / scale;
          const top = (rect.top - canvasRect.top) / scale - 44;
          left = Math.max(PADDING_X, Math.min(left, CANVAS_WIDTH - PADDING_X - 100));
          setRefinePosition({ top: Math.max(10, top), left });
          setSelectedText(text);
          setSelectedRange(range.cloneRange());
          setShowRefineButton(true);
          setShowContinueButton(false);
          if (continueTimerRef.current) clearTimeout(continueTimerRef.current);
        }
      }
      return;
    }

    // 선택 해제 시 다듬기 버튼 숨김
    setShowRefineButton(false);
    setShowRefineSuggestion(false);

    // 마침표 감지 (이어쓰기)
    const editorText = editorRef.current?.innerText || '';
    if (sel.isCollapsed && editorText.trim().length > 5 && !showContinueSuggestion) {
      const caretPos = getCaretPosition(editorRef.current);
      const textBeforeCursor = editorText.substring(0, caretPos).trimEnd();
      if (continueTimerRef.current) clearTimeout(continueTimerRef.current);
      setShowContinueButton(false);

      if (/[.!?。]$/.test(textBeforeCursor)) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (canvasRect) {
          let left = (rect.left - canvasRect.left) / scale;
          const top = (rect.bottom - canvasRect.top) / scale + 12;
          left = Math.max(PADDING_X, Math.min(left, CANVAS_WIDTH - PADDING_X - 140));
          setContinuePosition({ top, left });
          continueTimerRef.current = setTimeout(() => setShowContinueButton(true), 800);
        }
      }
    } else if (!showContinueSuggestion) {
      if (continueTimerRef.current) clearTimeout(continueTimerRef.current);
      setShowContinueButton(false);
    }
  }, [scale, isContinuing, showContinueSuggestion]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (continueTimerRef.current) clearTimeout(continueTimerRef.current);
    };
  }, [handleSelectionChange]);

  // AI 이어쓰기
  const handleContinue = async () => {
    setShowContinueButton(false);
    setIsContinuing(true);
    if (continueTimerRef.current) clearTimeout(continueTimerRef.current);

    // 버튼 위치 저장 (클릭 전 커서 위치 기반)
    const savedPosition = { ...continuePosition };

    try {
      const response = await apiFetch('/api/v1/ai/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: (editorRef.current?.innerText || '').slice(-500),
          recipientName,
          recipientRelation,
        }),
      });

      if (!response.ok) throw new Error('AI 이어쓰기 실패');
      const data = await response.json();
      const suggestion = data.suggestion || '';

      const editor = editorRef.current;
      if (editor && suggestion) {
        // span 생성 및 에디터 끝에 추가
        const span = document.createElement('span');
        span.style.color = '#9ca3af';
        span.textContent = ' ' + suggestion;
        span.setAttribute('data-ai-suggestion', 'true');

        // 에디터 끝에 추가 (기존 내용 유지)
        editor.appendChild(span);

        setSuggestionSpan(span);

        // span이 렌더링된 후 버튼 위치 계산
        setTimeout(() => {
          const spanRect = span.getBoundingClientRect();
          const canvasRect = canvasRef.current?.getBoundingClientRect();

          if (canvasRect && spanRect.width > 0) {
            const currentScale = scale || 1;
            const left = Math.max(PADDING_X, (spanRect.left - canvasRect.left) / currentScale);
            const top = Math.min((spanRect.bottom - canvasRect.top) / currentScale + 8, CANVAS_HEIGHT - 60);

            setContinuePosition({ top, left });
          } else {
            // fallback: 저장된 위치 사용
            setContinuePosition({
              top: savedPosition.top + 24,
              left: Math.max(PADDING_X, savedPosition.left)
            });
          }

          setShowContinueSuggestion(true);
          setIsContinuing(false);
        }, 100);
      } else {
        setIsContinuing(false);
        if (!suggestion) {
          toast.error('AI 응답이 비어있습니다');
        }
      }
    } catch (error) {
      console.error('AI 이어쓰기 오류:', error);
      toast.error('AI 이어쓰기에 실패했습니다');
      setIsContinuing(false);
    }
  };

  // 다르게 (이어쓰기)
  const handleDifferent = async () => {
    if (!suggestionSpan) return;
    setIsContinuing(true);
    setShowContinueSuggestion(false);

    try {
      // suggestion span을 제외한 기존 텍스트만 전송
      const editor = editorRef.current;
      const existingText = editor ?
        Array.from(editor.childNodes)
          .filter(node => node !== suggestionSpan)
          .map(node => node.textContent)
          .join('') : '';

      const response = await apiFetch('/api/v1/ai/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: existingText.slice(-500),
          recipientName,
          recipientRelation,
          different: true,
        }),
      });

      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      const newSuggestion = data.suggestion || '';

      if (suggestionSpan && newSuggestion) {
        suggestionSpan.textContent = ' ' + newSuggestion;
      }

      setShowContinueSuggestion(true);
      setIsContinuing(false);
    } catch {
      toast.error('다른 제안을 불러오는데 실패했습니다');
      setShowContinueSuggestion(true);
      setIsContinuing(false);
    }
  };

  // 넣기 (이어쓰기)
  const handleInsertSuggestion = () => {
    if (suggestionSpan) suggestionSpan.style.color = textColor;
    setShowContinueSuggestion(false);
    setSuggestionSpan(null);
    saveCurrentPageContent();
  };

  // AI 다듬기
  const handleRefine = async () => {
    if (!selectedText) {
      toast.error('다듬을 텍스트를 선택해주세요');
      return;
    }
    setShowRefineButton(false);
    setIsRefining(true);

    try {
      const response = await apiFetch('/api/v1/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          context: editorRef.current?.innerText || '',
          recipientRelation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'AI 다듬기 실패';
        throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }

      setRefinedText(data.refined || selectedText);
      setIsRefining(false);
      setShowRefineSuggestion(true);
    } catch (error) {
      console.error('AI 다듬기 오류:', error);
      const errorMessage = error instanceof Error ? error.message : 'AI 다듬기에 실패했습니다';
      toast.error(errorMessage);
      setIsRefining(false);
    }
  };

  // 다듬기 적용
  const handleApplyRefine = () => {
    if (!selectedRange || !refinedText) return;
    selectedRange.deleteContents();
    const span = document.createElement('span');
    span.style.color = textColor;
    span.textContent = refinedText;
    selectedRange.insertNode(span);
    setShowRefineSuggestion(false);
    setRefinedText('');
    setSelectedRange(null);
    saveCurrentPageContent();
  };

  // 다듬기 취소
  const handleCancelRefine = () => {
    setShowRefineSuggestion(false);
    setRefinedText('');
    setSelectedRange(null);
  };

  // 이전 페이지들의 내용을 가져오는 함수
  const getPreviousPagesContent = useCallback(() => {
    if (currentPage === 0) return '';
    return pages
      .slice(0, currentPage)
      .map(page => page.content)
      .filter(content => content.trim())
      .join('\n\n');
  }, [currentPage, pages]);

  // AI 플로팅 메뉴 핸들러 함수들
  const loadIntroOptions = async () => {
    setIsLoadingIntroOptions(true);
    try {
      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'intro-options',
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
      if (response.ok) {
        const result = await response.json();
        setIntroOptions(result.data || []);
      }
    } catch (error) {
      console.error('처음 옵션 로드 실패:', error);
    } finally {
      setIsLoadingIntroOptions(false);
    }
  };

  const handleIntroOptionSelect = (text: string) => {
    if (!editorRef.current) return;
    const currentContent = editorRef.current.innerText || '';
    const newContent = currentContent.trim() ? `${text}\n\n${currentContent}` : text;
    editorRef.current.innerText = newContent;
    saveCurrentPageContent();
    editorRef.current.focus();
    setShowAIMenu(false);
  };

  const handleMiddleExpand = async () => {
    if (!middleChatInput.trim()) return;
    setIsExpandingMiddle(true);
    try {
      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'expand',
          userInput: middleChatInput,
          currentContent: editorRef.current?.innerText || '',
          recipientName,
          recipientRelation,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        setMiddleExpandedPreview({
          input: middleChatInput,
          expanded: result.data || ''
        });
      }
    } catch (error) {
      console.error('중간 확장 실패:', error);
    } finally {
      setIsExpandingMiddle(false);
    }
  };

  const handleMiddleInsert = () => {
    if (!middleExpandedPreview || !editorRef.current) return;
    
    const currentContent = editorRef.current.innerText || '';
    const isFirstInsert = middleChatHistory.length === 0 && currentContent.trim();
    const separator = isFirstInsert ? '\n\n' : ' ';
    
    const newContent = currentContent + separator + middleExpandedPreview.expanded;
    editorRef.current.innerText = newContent;
    
    setMiddleChatHistory(prev => [...prev, middleExpandedPreview]);
    setMiddleExpandedPreview(null);
    setMiddleChatInput('');
    saveCurrentPageContent();
    editorRef.current.focus();
  };

  const handleMiddleRetry = () => {
    handleMiddleExpand();
  };

  const loadConclusionOptions = async () => {
    setIsLoadingConclusionOptions(true);
    try {
      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'conclusion-options',
          currentContent: editorRef.current?.innerText || '',
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
      if (response.ok) {
        const result = await response.json();
        setConclusionOptions(result.data || []);
      }
    } catch (error) {
      console.error('마무리 옵션 로드 실패:', error);
    } finally {
      setIsLoadingConclusionOptions(false);
    }
  };

  const handleConclusionOptionSelect = (text: string) => {
    if (!editorRef.current) return;
    const currentContent = editorRef.current.innerText || '';
    const newContent = currentContent.trim() ? `${currentContent}\n\n${text}` : text;
    editorRef.current.innerText = newContent;
    saveCurrentPageContent();
    editorRef.current.focus();
    setShowAIMenu(false);
  };

  const handleConclusionCustomExpand = async () => {
    if (!conclusionCustomInput.trim()) return;
    setIsExpandingConclusion(true);
    try {
      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'expand',
          userInput: conclusionCustomInput,
          currentContent: editorRef.current?.innerText || '',
          recipientName,
          recipientRelation,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        const expandedText = result.data || '';
        handleConclusionOptionSelect(expandedText);
        setConclusionCustomInput('');
        setShowConclusionCustomInput(false);
      }
    } catch (error) {
      console.error('마무리 확장 실패:', error);
    } finally {
      setIsExpandingConclusion(false);
    }
  };

  // 빠른 태그 AI 생성
  const handleQuickTag = async (label: string) => {
    setShowAIMenu(false);
    setIsGeneratingStart(true);
    setGeneratingLabel(label);

    // selectedSection에 따라 section 결정
    const sectionMap = { start: 'intro', middle: 'middle', end: 'conclusion' } as const;
    const section = sectionMap[selectedSection];

    // 이전 페이지 내용 + 현재 페이지 내용
    const previousContent = getPreviousPagesContent();
    const currentEditorContent = editorRef.current?.innerText || '';
    const fullContent = previousContent
      ? `${previousContent}\n\n${currentEditorContent}`.trim()
      : currentEditorContent;

    try {
      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'section',
          section,
          optionLabel: label,
          currentContent: fullContent,
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
        throw new Error('AI 생성 실패');
      }

      const result = await response.json();
      const generatedText = result.data || '';

      if (generatedText && editorRef.current) {
        // 기존 내용에 추가
        const currentContent = editorRef.current.innerText;
        const newContent = currentContent
          ? `${currentContent}\n\n${generatedText}`
          : generatedText;
        editorRef.current.innerText = newContent;
        saveCurrentPageContent();
        editorRef.current.focus();
        toast.success(`"${label}" 스타일로 작성되었습니다`);
      }
    } catch (error) {
      console.error('AI 빠른 태그 생성 오류:', error);
      toast.error('AI 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGeneratingStart(false);
      setGeneratingLabel('');
    }
  };

  // AI 되돌리기
  const handleUndoAI = () => {
    if (!previousPagesRef.current) return;

    const prevPages = previousPagesRef.current;
    setPages(prevPages);
    hasFocusRef.current = false; // 새 페이지 에디터가 content 설정받도록
    setCurrentPage(0);

    if (editorRef.current && prevPages[0]) {
      editorRef.current.innerText = prevPages[0].content;
    }

    const allContent = prevPages.map(p => p.content).filter(c => c.trim()).join('\n\n');
    onContentChange(allContent);

    previousPagesRef.current = null;
    setCanUndo(false);
    toast.success('이전 상태로 되돌렸습니다');
  };

  // AI 온보딩 완료 → 서문/마무리 삽입
  const handleOnboardingComplete = async (
    profile: RecipientAIProfile,
    letterParts?: { intro: string; closing: string; bodyGuide: string }
  ) => {
    try {
      await saveAIProfile({
        recipientId: profile.recipientId,
        speechStyle: profile.speechStyle,
        tone: profile.tone,
        context: profile.context || '',
        episodes: profile.episodes || '',
        emotions: profile.emotions || '',
        chatHistory: profile.chatHistory,
      });
    } catch (err) {
      console.error('AI 프로필 저장 실패:', err);
    }
    setShowOnboarding(false);

    // 프리셋 모드: 서문 + 본문 가이드 + 마무리 조합
    if (letterParts) {
      const parts: string[] = [];
      if (letterParts.intro) parts.push(letterParts.intro);
      if (letterParts.bodyGuide) parts.push(`\n\n[✍️ ${letterParts.bodyGuide}]\n\n`);
      if (letterParts.closing) parts.push(letterParts.closing);

      const draftContent = parts.join('\n\n');
      if (draftContent.trim()) {
        setDraftText(draftContent);
        setShowDraftPreview(true);
      }
      return;
    }

    // 기존 대화형 모드 폴백
    const existingContent = pages.map(p => p.content).filter(c => c.trim()).join('\n\n');
    setIsGeneratingDraft(true);
    setGeneratingLabel(existingContent ? 'AI가 이어서 쓰고 있어요...' : 'AI가 편지 초안을 작성하고 있어요...');
    try {
      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'section',
          section: existingContent ? 'middle' : 'intro',
          currentContent: existingContent || undefined,
          recipientName,
          recipientRelation,
          recipientFacility,
          recipientAddress,
          recipientPrisonerNumber,
          recipientContext,
          recipientId,
          letterHistory,
          userInput: `말투: ${profile.speechStyle}, 톤: ${profile.tone}, 맥락: ${profile.context}, 에피소드: ${profile.episodes}, 감정: ${profile.emotions}`,
        }),
      });

      const result = await response.json();
      const generatedText = result.data || '';

      if (generatedText) {
        setDraftText(generatedText);
        setShowDraftPreview(true);
      }
    } catch (err) {
      console.error('초안 생성 실패:', err);
      toast.error('초안 생성에 실패했습니다');
    } finally {
      setIsGeneratingDraft(false);
      setGeneratingLabel('');
    }
  };

  // 초안 미세 튜닝
  const handleRefineDraft = async (instruction: string) => {
    if (isRefiningDraft) return;
    setIsRefiningDraft(true);
    try {
      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'tone',
          content: draftText,
          toneId: 'custom',
          toneLabel: instruction,
          toneDescription: `다음 지시에 따라 편지를 수정하세요: ${instruction}. 원문의 전체 길이와 내용을 유지하되 지시사항에 맞게 톤/스타일만 조정하세요.`,
          recipientName,
          recipientRelation,
          recipientFacility,
          recipientId,
        }),
      });
      const result = await response.json();
      if (result.data) {
        setDraftText(result.data);
      }
    } catch (err) {
      console.error('미세 튜닝 실패:', err);
      toast.error('수정에 실패했습니다');
    } finally {
      setIsRefiningDraft(false);
      setCustomRefineInput('');
    }
  };

  // 초안 확정 → 에디터에 삽입 (오버플로우 시 자동 페이지 분할)
  const handleAcceptDraft = () => {
    if (draftText && editorRef.current) {
      previousPagesRef.current = [...pages];

      // 현재 페이지 내용 뒤에 이어붙이기
      const currentContent = editorRef.current.innerText || '';
      const newContent = currentContent.trim()
        ? currentContent.trim() + '\n\n' + draftText
        : draftText;

      // 에디터에 삽입 → checkOverflowAndSplit이 시각적 줄 높이 기반으로 페이지 분할
      editorRef.current.innerText = newContent;
      saveCurrentPageContent();

      // 약간의 지연 후 오버플로우 체크 (DOM 업데이트 대기)
      setTimeout(() => {
        checkOverflowAndSplit();
      }, 50);

      setCanUndo(true);
    }
    setShowDraftPreview(false);
    setDraftText('');
    toast.success('편지에 적용했어요! ✍️');
  };

  // 전체 편지 말투 변환 (다듬기)
  const handleToneConvert = async (toneId: string, toneLabel: string, toneDescription: string) => {
    // 모든 페이지 내용 합치기
    const allContent = pages.map(p => p.content).filter(c => c.trim()).join('\n\n');

    if (!allContent.trim()) {
      toast.warning('변환할 내용이 없습니다');
      return;
    }

    // 변환 전 상태 저장 (되돌리기용)
    previousPagesRef.current = pages.map(p => ({ ...p }));

    setShowAIMenu(false);
    setIsRefining(true);

    try {
      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'tone',
          toneId,
          toneLabel,
          toneDescription,
          content: allContent,
          recipientName,
          recipientRelation,
          recipientFacility,
          recipientAddress,
          recipientContext,
          recipientId,
          letterHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('AI 요청에 실패했습니다');
      }

      const result = await response.json();
      const transformed = typeof result.data === 'string' ? result.data : '';

      if (!transformed) {
        throw new Error('AI 응답이 비어있습니다');
      }

      // 변환된 내용을 페이지별로 재분할하여 적용
      const newPages = splitTextIntoPages(transformed, totalLines);
      const updatedPages = newPages.map((content, idx) => ({
        id: pages[idx]?.id || idx + 1,
        content,
      }));

      setPages(updatedPages);
      hasFocusRef.current = false; // 새 페이지 에디터가 content 설정받도록
      setCurrentPage(0);

      // 첫 페이지 내용 에디터에 반영
      if (editorRef.current && updatedPages[0]) {
        editorRef.current.innerText = updatedPages[0].content;
      }

      // 부모 컴포넌트에 변환된 전체 내용 전달
      onContentChange(transformed);

      // 되돌리기 가능 상태로 설정
      setCanUndo(true);

      toast.success(`"${toneLabel}" 스타일로 변환되었습니다`);
    } catch (error) {
      console.error('AI 말투 변환 오류:', error);
      toast.error('말투 변환에 실패했습니다. 다시 시도해주세요.');
      // 실패 시 되돌리기 상태 초기화
      previousPagesRef.current = null;
    } finally {
      setIsRefining(false);
    }
  };

  const handleStartTag = async (label: string) => {
    if (!editorRef.current) return;

    setIsGeneratingStart(true);
    setGeneratingLabel(label);

    // 이전 페이지 내용 (2페이지 이후에서 말투/내용 연결용)
    const previousContent = getPreviousPagesContent();

    // 섹션 결정: 첫 페이지는 intro, 이후 페이지는 라벨에 따라 middle 또는 conclusion
    const isMiddleTag = QUICK_TAGS.middle.tags.some(t => t.label === label);
    const section = currentPage === 0 ? 'intro' : (isMiddleTag ? 'middle' : 'conclusion');

    try {
      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'section',
          section,
          optionLabel: label,
          currentContent: previousContent,
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
        throw new Error('AI 생성 실패');
      }

      const result = await response.json();
      const generatedText = result.data || '';

      if (generatedText && editorRef.current) {
        editorRef.current.innerText = generatedText;
        saveCurrentPageContent();
        editorRef.current.focus();
        toast.success(`"${label}" 스타일로 작성되었습니다`);
      }
    } catch (error) {
      console.error('AI 시작 태그 생성 오류:', error);
      toast.error('AI 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGeneratingStart(false);
      setGeneratingLabel('');
    }
  };

  // 초기화
  const handleReset = () => {
    if (confirm('현재 페이지 내용을 초기화할까요?')) {
      if (editorRef.current) editorRef.current.innerText = '';
      saveCurrentPageContent();
      onResetContent?.();
    }
  };

  // 페이지 이동
  const handlePageChange = (targetPage: number) => {
    if (targetPage >= 0 && targetPage < pages.length && targetPage !== currentPage) {
      // observer 일시 무시
      ignoreObserverRef.current = true;
      setTimeout(() => { ignoreObserverRef.current = false; }, 500);

      saveCurrentPageContent();
      hasFocusRef.current = false; // 새 페이지 에디터가 content 설정받도록
      setCurrentPage(targetPage);
    }
  };

  // 음성 입력 토글
  const handleVoiceToggle = useCallback(() => {
    if (isListening) {
      stopListening();
      toast.success('음성 입력이 종료되었습니다.');
    } else {
      startListening();
      toast.info('음성 입력을 시작합니다. 말씀해주세요!', {
        description: '마이크 버튼을 다시 누르면 종료됩니다.',
      });
    }
  }, [isListening, startListening, stopListening]);

  // 에디터 입력 핸들러
  const handleEditorInput = () => {
    // IME 조합 중이거나 붙여넣기 처리 중에는 건너뛰기
    if (isComposingRef.current || isPastingRef.current) return;

    saveCurrentPageContent();
    // 이어쓰기 제안 있으면 확정
    if (showContinueSuggestion && suggestionSpan) {
      suggestionSpan.style.color = textColor;
      setShowContinueSuggestion(false);
      setSuggestionSpan(null);
    }
  };

  // 키보드 이벤트 핸들러 (백스페이스로 이전 페이지 이동, 18줄 제한)
  // 전체 페이지 내용 복사
  const copyAllPages = useCallback(async () => {
    const allText = pages.map(p => p.content).filter(c => c.trim()).join('\n');
    try {
      await navigator.clipboard.writeText(allText);
      toast.success('전체 내용이 복사되었습니다', { duration: 2000 });
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = allText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success('전체 내용이 복사되었습니다', { duration: 2000 });
    }
  }, [pages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!editorRef.current) return;

    // 백스페이스 키 처리: 현재 페이지가 비어있고 이전 페이지가 있으면 이전 페이지로 이동
    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      const editorContent = editorRef.current.innerText || '';

      // 모바일 백스페이스 커서 위치 보정: 삭제 후 커서가 올바른 위치에 있는지 확인
      const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobileDevice && selection && selection.isCollapsed && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        // contentEditable 내부의 빈 노드나 잘못된 위치 보정
        if (range.startContainer.nodeType === Node.ELEMENT_NODE && range.startContainer !== editorRef.current) {
          // 다음 틱에서 커서 위치를 가장 가까운 텍스트 노드로 보정
          requestAnimationFrame(() => {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0 && editorRef.current) {
              const currentRange = sel.getRangeAt(0);
              // 빈 요소에 커서가 있으면 부모 텍스트 노드로 이동
              if (currentRange.startContainer.nodeType === Node.ELEMENT_NODE &&
                  currentRange.startContainer !== editorRef.current) {
                const walker = document.createTreeWalker(
                  editorRef.current,
                  NodeFilter.SHOW_TEXT,
                  null
                );
                let lastTextNode: Text | null = null;
                let node: Node | null;
                while ((node = walker.nextNode())) {
                  lastTextNode = node as Text;
                }
                if (lastTextNode) {
                  const newRange = document.createRange();
                  newRange.setStart(lastTextNode, lastTextNode.length);
                  newRange.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(newRange);
                }
              }
            }
          });
        }
      }

      // 커서가 맨 앞에 있고 (선택 범위 없이) 현재 페이지가 첫 페이지가 아닌 경우
      if (selection && selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const isAtStart = range.startOffset === 0 &&
          (range.startContainer === editorRef.current ||
           range.startContainer === editorRef.current.firstChild ||
           (range.startContainer.nodeType === Node.TEXT_NODE && range.startContainer === editorRef.current.childNodes[0]));

        if (isAtStart && currentPage > 0) {
          e.preventDefault();

          // 현재 페이지 내용 가져오기
          const currentPageContent = editorContent.trim();

          // 이전 페이지로 이동
          const prevPageIndex = currentPage - 1;
          const prevPageContent = pages[prevPageIndex]?.content || '';

          // 페이지 상태 업데이트: 현재 페이지 내용을 이전 페이지 끝에 합치거나 페이지 삭제
          setPages(prev => {
            const newPages = [...prev];

            if (currentPageContent) {
              // 현재 페이지에 내용이 있으면 이전 페이지 끝에 합침
              newPages[prevPageIndex] = {
                ...newPages[prevPageIndex],
                content: prevPageContent + (prevPageContent && !prevPageContent.endsWith('\n') ? '\n' : '') + currentPageContent
              };
              // 현재 페이지 삭제
              newPages.splice(currentPage, 1);
            } else {
              // 현재 페이지가 비어있으면 그냥 삭제
              newPages.splice(currentPage, 1);
            }

            // 페이지가 모두 삭제되면 빈 페이지 1개 유지
            if (newPages.length === 0) {
              newPages.push({ id: 1, content: '' });
            }

            // 전체 내용 업데이트
            const allContent = newPages.map(p => p.content).filter(c => c.trim()).join('\n\n');
            lastSavedContentRef.current = allContent;
            onContentChange(allContent);

            return newPages;
          });

          // 이전 페이지로 전환
          ignoreObserverRef.current = true;
          hasFocusRef.current = false; // 새 페이지 에디터가 content 설정받도록
          prevPageRef.current = prevPageIndex;
          setCurrentPage(prevPageIndex);

          // 커서를 이전 페이지 끝으로 이동
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.focus();
              const selection = window.getSelection();
              const range = document.createRange();

              // 커서를 이전 페이지 내용의 끝으로 이동
              const textNode = editorRef.current.lastChild;
              if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                const textLength = (textNode as Text).length;
                // 이전 페이지 원본 내용의 끝 위치로 커서 이동
                const cursorPos = Math.min(prevPageContent.length, textLength);
                range.setStart(textNode, cursorPos);
                range.setEnd(textNode, cursorPos);
              } else if (editorRef.current.childNodes.length > 0) {
                range.selectNodeContents(editorRef.current);
                range.collapse(false);
              } else {
                range.selectNodeContents(editorRef.current);
                range.collapse(true);
              }

              selection?.removeAllRanges();
              selection?.addRange(range);
            }
            ignoreObserverRef.current = false;
          }, 100);

          return;
        }
      }
    }

    // Enter 키: 18줄에서 Enter 시 다음 페이지로 이동
    if (e.key === 'Enter') {
      const editorContent = editorRef.current.innerText || '';
      const lines = editorContent.split('\n');

      // 현재 줄 수가 totalLines에 도달하면 다음 페이지로 이동
      if (lines.length >= totalLines) {
        e.preventDefault();

        // 현재 페이지 내용 저장 (그대로 유지)
        const currentContent = editorContent;

        // 다음 페이지 인덱스
        const nextPageIndex = currentPage + 1;

        setPages(prev => {
          const newPages = [...prev];
          // 현재 페이지 내용 저장
          newPages[currentPage] = { ...newPages[currentPage], content: currentContent };

          if (nextPageIndex >= newPages.length) {
            // 빈 새 페이지 생성
            newPages.push({ id: nextPageIndex + 1, content: '' });
          }
          // 기존 다음 페이지가 있으면 그대로 사용

          // 전체 내용 업데이트
          const allContent = newPages.map(p => p.content).filter(c => c.trim()).join('\n\n');
          lastSavedContentRef.current = allContent;
          onContentChange(allContent);

          return newPages;
        });

        // 다음 페이지로 전환
        ignoreObserverRef.current = true;
        hasFocusRef.current = false; // 새 페이지 에디터가 content 설정받도록
        prevPageRef.current = nextPageIndex;
        setCurrentPage(nextPageIndex);

        // 커서를 다음 페이지 시작으로 이동
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(editorRef.current);
            range.collapse(true); // 시작 부분으로
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
          ignoreObserverRef.current = false;
        }, 100);

        toast.success(`${nextPageIndex + 1}페이지로 이어집니다`, {
          description: '새 페이지에서 계속 작성하세요',
          duration: 2000,
        });

        return;
      }
    }
  };

  // IME 조합 시작 (한글 입력 시작)
  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  // IME 조합 종료 (한글 입력 완료)
  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    // 조합 완료 후 저장
    saveCurrentPageContent();
  };

  // 붙여넣기 핸들러
  // 시각적 줄 수 측정 (에디터와 동일한 스타일로 hidden div 생성)
  const measureVisualLines = useCallback((text: string): number => {
    if (!text || !editorRef.current) return 0;
    const div = document.createElement('div');
    const computedStyle = window.getComputedStyle(editorRef.current);
    div.style.cssText = `
      position:absolute;visibility:hidden;
      width:${CANVAS_WIDTH - PADDING_X * 2}px;
      font-family:${computedStyle.fontFamily};
      font-size:${computedStyle.fontSize};
      line-height:${lineHeight}px;
      white-space:pre-wrap;word-break:break-word;overflow-wrap:break-word;box-sizing:border-box;
    `;
    div.innerText = text;
    document.body.appendChild(div);
    const lines = Math.ceil(div.scrollHeight / lineHeight);
    document.body.removeChild(div);
    return lines;
  }, [lineHeight]);

  // 텍스트를 시각적 totalLines줄에 맞게 자르기 (이진 탐색)
  const fitToPage = useCallback((text: string): { fits: string; overflow: string } => {
    if (!text || measureVisualLines(text) <= totalLines) {
      return { fits: text, overflow: '' };
    }

    const lines = text.split('\n');

    // 줄 단위로 먼저 시도
    for (let i = 0; i < lines.length; i++) {
      const test = lines.slice(0, i + 1).join('\n');
      if (measureVisualLines(test) > totalLines) {
        if (i > 0) {
          // i번째 줄에서 초과 → i-1까지 넣기
          return {
            fits: lines.slice(0, i).join('\n'),
            overflow: lines.slice(i).join('\n'),
          };
        }
        // 첫 줄 자체가 18줄 초과 → 문자 단위 이진 탐색
        const line = lines[0];
        let left = 0, right = line.length;
        while (left < right) {
          const mid = Math.floor((left + right + 1) / 2);
          if (measureVisualLines(line.substring(0, mid)) <= totalLines) {
            left = mid;
          } else {
            right = mid - 1;
          }
        }
        // 공백 경계에서 끊기
        let cutAt = left;
        const spaceIdx = line.lastIndexOf(' ', cutAt);
        if (spaceIdx > cutAt * 0.5) cutAt = spaceIdx;

        const rest = line.substring(cutAt).trim() +
          (lines.length > 1 ? '\n' + lines.slice(1).join('\n') : '');
        return { fits: line.substring(0, cutAt).trim(), overflow: rest };
      }
    }

    return { fits: text, overflow: '' };
  }, [measureVisualLines, totalLines]);

  // 시각적 측정 기반 페이지 분할 (전체 텍스트 → 페이지 배열)
  const splitAllIntoPages = useCallback((fullText: string): string[] => {
    if (!fullText.trim()) return [''];
    const result: string[] = [];
    let remaining = fullText;

    while (remaining) {
      const { fits, overflow } = fitToPage(remaining);
      if (fits) result.push(fits);
      if (!overflow || overflow === remaining) {
        if (!fits && remaining.trim()) result.push(remaining); // 무한루프 방지
        break;
      }
      remaining = overflow;
      if (result.length > 50) break; // 안전장치
    }

    return result.length > 0 ? result : [''];
  }, [fitToPage]);

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text/plain');
    if (!pastedText || !editorRef.current) return;

    e.preventDefault();
    isPastingRef.current = true;

    // 1. 전체 내용 조합: 앞 페이지 + 현재 페이지(커서 위치에 삽입) + 뒷 페이지
    const beforePages = pages.slice(0, currentPage).map(p => p.content);
    const afterPages = pages.slice(currentPage + 1).map(p => p.content);

    // 현재 에디터 내용에서 커서 위치에 텍스트 삽입
    const sel = window.getSelection();
    let currentContent = editorRef.current.innerText || '';
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const offset = getTextOffset(editorRef.current, range);
      const selLength = sel.toString().length;
      currentContent = currentContent.substring(0, offset) + pastedText + currentContent.substring(offset + selLength);
    } else {
      currentContent += pastedText;
    }

    // 2. 전체 텍스트를 하나로 합침
    const allText = [...beforePages, currentContent, ...afterPages].filter(t => t.trim()).join('\n');

    // 3. 시각적 측정 기반 페이지 분할
    const pageContents = splitAllIntoPages(allText);
    const newPages = pageContents.map((content, idx) => ({ id: idx + 1, content }));

    // 4. 붙여넣기 후 커서가 있어야 할 페이지 계산
    const insertedTextEnd = [...beforePages, currentContent].join('\n');
    let charCount = 0;
    let targetPage = 0;
    for (let i = 0; i < newPages.length; i++) {
      charCount += newPages[i].content.length + 1;
      if (charCount >= insertedTextEnd.length) { targetPage = i; break; }
    }
    targetPage = Math.min(targetPage, newPages.length - 1);

    // 5. 상태 업데이트
    const allContent = newPages.map(p => p.content).filter(c => c.trim()).join('\n\n');
    lastSavedContentRef.current = allContent;
    onContentChange(allContent);
    setPages(newPages);

    ignoreObserverRef.current = true;
    hasFocusRef.current = false;
    prevPageRef.current = targetPage;
    setCurrentPage(targetPage);

    // 6. 에디터 내용 설정 + 커서 끝으로
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerText = newPages[targetPage]?.content || '';
        safeFocus();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      ignoreObserverRef.current = false;
      isPastingRef.current = false;
    }, 100);

    if (newPages.length > 1) {
      toast.success(`${newPages.length}페이지로 분할되었습니다`, { duration: 2000 });
    }
  };

  // contentEditable 내 텍스트 오프셋 계산
  function getTextOffset(root: HTMLElement, range: Range): number {
    const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let offset = 0;
    let node: Node | null;
    while ((node = treeWalker.nextNode())) {
      if (node === range.startContainer) {
        return offset + range.startOffset;
      }
      offset += (node as Text).length;
    }
    return offset;
  }

  // AI 모달에서 텍스트 삽입
  const handleInsertContent = useCallback((text: string, position: "start" | "end" | "cursor") => {
    if (position === "start") {
      const newContent = text + "\n\n" + (editorRef.current?.innerText || '');
      if (editorRef.current) editorRef.current.innerText = newContent;
      saveCurrentPageContent();
      // AI 삽입 후 오버플로우 체크
      setTimeout(() => checkOverflowAndSplit(), 0);
    } else if (position === "end") {
      const current = editorRef.current?.innerText || '';
      const newContent = current + (current ? "\n\n" : "") + text;
      if (editorRef.current) editorRef.current.innerText = newContent;
      saveCurrentPageContent();
      // AI 삽입 후 오버플로우 체크
      setTimeout(() => checkOverflowAndSplit(), 0);
    } else {
      insertText(text);
      // AI 삽입 후 오버플로우 체크
      setTimeout(() => checkOverflowAndSplit(), 0);
    }
  }, [insertText, saveCurrentPageContent, checkOverflowAndSplit]);

  // 편지지 밑줄 색상 동적 매칭
  const getLineColor = (): string => {
    if (!stationeryStyle) return '#f0f0f0';
    const lineColorMap: Record<string, string> = {
      'white': '#b0b0b0', 'cream': '#bda888', 'sky': '#6daad0',
      'pink': '#d4809a', 'mint': '#6daa90', 'formal-white': '#a0aabb',
      'formal-cream': '#bd9a70', 'business': '#9aa0a8', 'elegant': '#bd88b0',
      'sunset': '#bd8068', 'ocean': '#6888bd', 'forest': '#68b088',
      'blossom': '#bd8088', 'ai-dream': '#9878bd', 'ai-aurora': '#68a890',
      'ai-cosmic': '#8878bd',
    };
    if (lineColorMap[stationeryStyle.id]) return lineColorMap[stationeryStyle.id];
    if (stationeryStyle.patternColor) return stationeryStyle.patternColor;
    if (stationeryStyle.border?.color) return stationeryStyle.border.color;
    return '#bdbdbd';
  };

  // 줄 렌더링 (텍스트가 줄에 붙도록 위치 조정)
  const LINE_OFFSET = 8; // 텍스트-줄 간격 조정
  const renderLines = () => Array.from({ length: totalLines }, (_, i) => (
    <div
      key={i}
      className="absolute"
      style={{
        top: PADDING_TOP + (i + 1) * lineHeight - LINE_OFFSET,
        left: PADDING_X,
        right: PADDING_X,
        borderBottom: `2px solid ${getLineColor()}`,
      }}
    />
  ));

  return (
    <div
      className="h-full flex flex-col overflow-y-auto scrollbar-hide"
      onScroll={(e) => {
        const scrollTop = e.currentTarget.scrollTop;
        setHasScrolled(scrollTop > 10);
      }}
    >
      {/* 헤더 + 툴바 sticky 컨테이너 */}
      <div className={cn(
        "relative sticky top-0 z-40 bg-white mx-auto w-full max-w-[772px] shadow-lg",
        
      )}>
        {/* 헤더 */}
        <header className="border-b border-neutral-100 px-3 py-2 flex items-center shrink-0">
        <div className="flex-1 flex items-center min-w-0">
          <span className="text-sm font-medium text-neutral-800">편지 작성</span>
        </div>
 {/* 임시저장 드롭다운 */}
 <div className="dropdown relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowDraftDropdown(!showDraftDropdown); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-all"
          >
            <FolderOpen className="w-4 h-4 text-neutral-500" />
            <span className="text-sm text-neutral-700">임시저장</span>
            {drafts.length > 0 && (
              <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-orange-500 text-white text-xs font-medium rounded-full px-1">
                {drafts.length}
              </span>
            )}
          </button>

          {showDraftDropdown && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden z-50">
              <div className="p-3 border-b border-neutral-100 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-800">임시저장된 편지</span>
                <span className="text-xs text-neutral-400">{drafts.length}개</span>
              </div>
              <div className="max-h-64 overflow-y-auto overflow-x-hidden">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="group flex items-center p-3 hover:bg-neutral-50 transition-all border-b border-neutral-50 last:border-0"
                  >
                    <button
                      className="flex-1 min-w-0 text-left"
                      onClick={() => {
                        onLoadDraft?.(draft.id);
                        setShowDraftDropdown(false);
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="font-medium text-neutral-800 text-sm truncate">{draft.title}</span>
                        <span className="text-xs text-neutral-400 shrink-0">{draft.date}</span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate">{draft.preview}</p>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDraft?.(draft.id);
                      }}
                      className="ml-2 p-1.5 shrink-0 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {drafts.length === 0 && (
                <div className="p-6 text-center text-neutral-400 text-sm">
                  임시저장된 편지가 없습니다
                </div>
              )}
            </div>
          )}
        </div>
      

        <div className="flex-1 flex items-center justify-end min-w-0">
        {/* 그곳의 날씨 */}
        {recipientWeather && (() => {
          const WeatherIcon3D = ({ desc }: { desc: string }) => {
            // 귀여운 얼굴 파츠
            const cuteEyes = (cx1: number, cy: number, cx2: number) => (
              <>
                <circle cx={cx1} cy={cy} r="1" fill="#333"/>
                <circle cx={cx2} cy={cy} r="1" fill="#333"/>
                <circle cx={cx1-0.3} cy={cy-0.4} r="0.3" fill="#fff"/>
                <circle cx={cx2-0.3} cy={cy-0.4} r="0.3" fill="#fff"/>
              </>
            );
            const cuteSmile = (cx: number, cy: number) => (
              <path d={`M${cx-1.5} ${cy} Q${cx} ${cy+2} ${cx+1.5} ${cy}`} stroke="#333" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
            );
            const blush = (cx1: number, cy: number, cx2: number) => (
              <>
                <ellipse cx={cx1-1.5} cy={cy+0.5} rx="1.2" ry="0.6" fill="#FFB4B4" opacity="0.5"/>
                <ellipse cx={cx2+1.5} cy={cy+0.5} rx="1.2" ry="0.6" fill="#FFB4B4" opacity="0.5"/>
              </>
            );

            if (desc.includes('맑음') || desc.includes('대체로')) return (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <defs>
                  <radialGradient id="wc-sun" cx="45%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#FFF176"/>
                    <stop offset="50%" stopColor="#FFD54F"/>
                    <stop offset="100%" stopColor="#FFB300"/>
                  </radialGradient>
                </defs>
                {[0,45,90,135,180,225,270,315].map(a => (
                  <line key={a} x1={12+Math.cos(a*Math.PI/180)*8} y1={12+Math.sin(a*Math.PI/180)*8}
                    x2={12+Math.cos(a*Math.PI/180)*10.5} y2={12+Math.sin(a*Math.PI/180)*10.5}
                    stroke="#FFD54F" strokeWidth="1.8" strokeLinecap="round"/>
                ))}
                <circle cx="12" cy="12" r="6.5" fill="url(#wc-sun)"/>
                {cuteEyes(10, 11, 14)}
                {cuteSmile(12, 13)}
                {blush(10, 11, 14)}
              </svg>
            );
            if (desc.includes('흐림') || desc.includes('구름')) return (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="wc-cloud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5F5F5"/>
                    <stop offset="100%" stopColor="#CFD8DC"/>
                  </linearGradient>
                </defs>
                <path d="M4 17 Q2 17 2 14.5 Q2 12 4.5 12 Q4.5 8.5 8 7.5 Q10.5 6.5 13 8 Q14.5 6.5 17 7 Q20 7.5 20 10.5 Q22 11 22 13.5 Q22 17 19 17 Z" fill="url(#wc-cloud)"/>
                <path d="M4 17 Q2 17 2 14.5 Q2 12 4.5 12 Q4.5 8.5 8 7.5 Q10.5 6.5 13 8 Q14.5 6.5 17 7 Q20 7.5 20 10.5 Q22 11 22 13.5 Q22 17 19 17 Z" fill="#EEEEEE" opacity="0.5"/>
                {cuteEyes(10, 12, 14)}
                {cuteSmile(12, 14)}
                {blush(10, 12, 14)}
              </svg>
            );
            if (desc.includes('안개')) return (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12 Q3 12 3 10.5 Q3 9 5 9 Q5.5 6.5 8 6 Q10 5 12 6.5 Q13.5 5.5 15.5 6 Q18 6.5 18 9 Q20 9 20 10.5 Q20 12 18 12 Z" fill="#E0E0E0" opacity="0.7"/>
                {cuteEyes(10, 9, 14)}
                <path d="M10.5 10.5 Q12 11.5 13.5 10.5" stroke="#333" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
                {[15,17.5,20].map(y => (
                  <line key={y} x1="5" y1={y} x2="19" y2={y} stroke="#B0BEC5" strokeWidth="1.5" strokeLinecap="round" opacity={y===17.5?0.6:0.35}/>
                ))}
              </svg>
            );
            if (desc.includes('비') || desc.includes('이슬비') || desc.includes('소나기')) return (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="wc-rain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B0BEC5"/>
                    <stop offset="100%" stopColor="#78909C"/>
                  </linearGradient>
                </defs>
                <path d="M5 12 Q3 12 3 10 Q3 8 5.5 8 Q6 5.5 9 5 Q11 4 13 5.5 Q14.5 4.5 16.5 5 Q19 5.5 19 8 Q21 8.5 21 10.5 Q21 12 19 12 Z" fill="url(#wc-rain)"/>
                {cuteEyes(10, 8.5, 14)}
                {/* 슬픈 입 */}
                <path d="M10.5 10.5 Q12 10 13.5 10.5" stroke="#333" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
                {/* 귀여운 빗방울 */}
                <path d="M8 14 C8 14 7 16.5 8 17 C9 16.5 8 14 8 14Z" fill="#64B5F6"/>
                <path d="M12 15 C12 15 11 17.5 12 18 C13 17.5 12 15 12 15Z" fill="#64B5F6"/>
                <path d="M16 14.5 C16 14.5 15 17 16 17.5 C17 17 16 14.5 16 14.5Z" fill="#64B5F6"/>
              </svg>
            );
            if (desc.includes('눈') || desc.includes('싸락') || desc.includes('눈보라')) return (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="wc-snow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E3F2FD"/>
                    <stop offset="100%" stopColor="#B0BEC5"/>
                  </linearGradient>
                </defs>
                <path d="M5 12 Q3 12 3 10 Q3 8 5.5 8 Q6 5.5 9 5 Q11 4 13 5.5 Q14.5 4.5 16.5 5 Q19 5.5 19 8 Q21 8.5 21 10.5 Q21 12 19 12 Z" fill="url(#wc-snow)"/>
                {cuteEyes(10, 8.5, 14)}
                {/* 놀란 입 */}
                <circle cx="12" cy="11" r="1" fill="#333"/>
                {/* 눈 결정 ✻ */}
                {[7,12,17].map(x => (
                  <g key={x}>
                    <circle cx={x} cy={x===12?17:15.5} r="0.6" fill="#90CAF9"/>
                    <line x1={x-1.5} y1={x===12?17:15.5} x2={x+1.5} y2={x===12?17:15.5} stroke="#90CAF9" strokeWidth="0.5"/>
                    <line x1={x} y1={(x===12?17:15.5)-1.5} x2={x} y2={(x===12?17:15.5)+1.5} stroke="#90CAF9" strokeWidth="0.5"/>
                    <line x1={x-1} y1={(x===12?17:15.5)-1} x2={x+1} y2={(x===12?17:15.5)+1} stroke="#90CAF9" strokeWidth="0.4"/>
                    <line x1={x+1} y1={(x===12?17:15.5)-1} x2={x-1} y2={(x===12?17:15.5)+1} stroke="#90CAF9" strokeWidth="0.4"/>
                  </g>
                ))}
              </svg>
            );
            if (desc.includes('뇌우') || desc.includes('우박')) return (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 11 Q3 11 3 9 Q3 7 5.5 7 Q6 4.5 9 4 Q11 3 13 4.5 Q14.5 3.5 16.5 4 Q19 4.5 19 7 Q21 7.5 21 9.5 Q21 11 19 11 Z" fill="#455A64"/>
                {cuteEyes(10, 7.5, 14)}
                {/* 화난 눈썹 */}
                <line x1="8.5" y1="5.5" x2="10.5" y2="6.3" stroke="#333" strokeWidth="0.7" strokeLinecap="round"/>
                <line x1="15.5" y1="5.5" x2="13.5" y2="6.3" stroke="#333" strokeWidth="0.7" strokeLinecap="round"/>
                <path d="M10.5 9.5 Q12 9 13.5 9.5" stroke="#333" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
                {/* 번개 */}
                <path d="M13 13 L11.5 16 L13.5 16 L11 20" stroke="#FDD835" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            );
            // default: 약간 흐림 (해 + 구름)
            return (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <defs>
                  <radialGradient id="wc-psun" cx="45%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#FFF176"/>
                    <stop offset="100%" stopColor="#FFB300"/>
                  </radialGradient>
                </defs>
                <circle cx="8" cy="8" r="4.5" fill="url(#wc-psun)"/>
                <circle cx="7" cy="7.5" r="0.7" fill="#333"/>
                <circle cx="9.5" cy="7.5" r="0.7" fill="#333"/>
                <path d="M7 9 Q8.2 10 9.5 9" stroke="#333" strokeWidth="0.5" fill="none" strokeLinecap="round"/>
                <ellipse cx="14" cy="14" rx="7" ry="4" fill="#E8ECF0"/>
                <ellipse cx="11" cy="12.5" rx="4.5" ry="3" fill="#F5F5F5"/>
              </svg>
            );
          };

          return (
            <span className="relative group cursor-default flex items-center gap-1 text-size-11 text-neutral-400">
              <WeatherIcon3D desc={recipientWeather.description} />
              <span>그곳의 날씨 {recipientWeather.temp}°</span>
              <span className="absolute top-full right-0 mt-1.5 hidden group-hover:block bg-neutral-800 text-white text-size-10 rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg z-50">
                <span className="font-medium">{recipientAddress || recipientFacility || '받는 곳'} 날씨</span><br/>
                {recipientWeather.description}<br/>
                기온 {recipientWeather.temp}°C (체감 {recipientWeather.feelsLike}°C)<br/>
                습도 {recipientWeather.humidity}% · 바람 {recipientWeather.windSpeed}km/h
              </span>
            </span>
          );
        })()}
        </div>
      </header>

        {/* 툴바 */}
        <div className="border-b border-neutral-100 px-2 py-1.5 flex flex-wrap items-center justify-center gap-1 shrink-0 overflow-visible">
        {/* 폰트 선택 */}
        <div className="dropdown relative">
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              // 드롭다운 열기 전에 현재 선택 영역 저장
              saveCurrentSelection();
            }}
            onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setShowFontDropdown(!showFontDropdown); }}
            className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-neutral-100 text-xs text-neutral-700"
          >
            <span className="max-w-[80px] truncate">{FONT_FAMILIES[font]?.style || '글씨체 선택'}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>
          {showFontDropdown && (
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-xl shadow-xl border border-neutral-200 p-1.5 z-[100] min-w-[130px]"
              onMouseDown={(e) => e.preventDefault()}
            >
              <p className="text-size-10 text-neutral-400 mb-1 px-2">텍스트 선택 후 적용</p>
              {Object.entries(FONT_FAMILIES).map(([key, { style, className }]) => (
                <button
                  key={key}
                  onClick={() => applyFontToSelection(key)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-md text-sm",
                    className,
                    font === key ? 'bg-orange-50 text-orange-600' : 'hover:bg-neutral-50'
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          )}
          
        </div>

        <div className="w-px h-4 bg-neutral-200" />

        {/* 폰트 크기 */}
        <div className="flex items-center bg-neutral-100 rounded-md p-0.5">
          {Object.entries(FONT_SIZES).map(([key, { label, size }]) => (
            <button
              key={key}
              onClick={() => setFontSize(size)}
              className={cn(
                "px-2 py-1 text-xs rounded transition-all",
                fontSizeKey === key ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-neutral-200" />

        {/* 볼드/이탤릭/일반 */}
        <div className="flex items-center bg-neutral-100 rounded-md p-0.5">
          <button
            onClick={removeFormatting}
            className="w-7 h-6 flex items-center justify-center rounded transition-all text-neutral-500 hover:bg-white hover:shadow-sm hover:text-neutral-900"
            title="서식 제거"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={applyBold}
            className="w-7 h-6 flex items-center justify-center rounded transition-all text-neutral-500 hover:bg-white hover:shadow-sm hover:text-neutral-900"
            title="볼드"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={applyItalic}
            className="w-7 h-6 flex items-center justify-center rounded transition-all text-neutral-500 hover:bg-white hover:shadow-sm hover:text-neutral-900"
            title="이탤릭"
          >
            <Italic className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-4 bg-neutral-200" />

        {/* 정렬 */}
        <div className="flex items-center bg-neutral-100 rounded-md p-0.5">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => setTextAlign(align)}
              className={cn(
                "w-7 h-6 flex items-center justify-center rounded transition-all",
                textAlign === align ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-400'
              )}
            >
              {align === 'left' && <AlignLeft className="w-4 h-4" />}
              {align === 'center' && <AlignCenter className="w-4 h-4" />}
              {align === 'right' && <AlignRight className="w-4 h-4" />}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-neutral-200" />

        {/* 색상 */}
        <div className="dropdown relative">
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              // 드롭다운 열기 전에 현재 선택 영역 저장
              saveCurrentSelection();
            }}
            onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setShowColorDropdown(!showColorDropdown); }}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-neutral-100"
          >
            <ColorWheelIcon size={16} />
          </button>
          {showColorDropdown && (
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-xl shadow-xl border border-neutral-200 p-2.5 z-[100] min-w-[150px]"
              onMouseDown={(e) => e.preventDefault()}
            >
              <p className="text-size-10 text-neutral-400 mb-1.5 text-center">텍스트 선택 후 적용</p>
              <div className="grid grid-cols-4 gap-2.5">
                {FONT_COLORS.map(({ id, value }) => (
                  <button
                    key={id}
                    onClick={() => applyColorToSelection(value)}
                    className={cn(
                      "w-7 h-7 rounded-full transition-transform hover:scale-110 border",
                      value === '#ffffff' ? 'border-neutral-300' : 'border-transparent',
                      textColor === value && 'ring-2 ring-orange-500 ring-offset-2'
                    )}
                    style={{ backgroundColor: value }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 이모지 */}
        <div className="dropdown relative">
          <button
            onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setShowEmojiDropdown(!showEmojiDropdown); }}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-neutral-100 text-neutral-500"
          >
            <Smile className="w-[18px] h-[18px]" />
          </button>
          {showEmojiDropdown && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-xl shadow-lg border border-neutral-100 p-2 z-50 min-w-[180px]">
              <div className="grid grid-cols-8 gap-0.5">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-100 text-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-neutral-200" />

        {/* 음성 녹음 */}
        {isSpeechSupported && (
          <button
            onClick={handleVoiceToggle}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-md transition-all",
              isListening ? 'bg-red-500 text-white' : 'hover:bg-neutral-100 text-neutral-500'
            )}
            title="음성으로 작성"
          >
            {isListening ? <MicOff className="w-[18px] h-[18px]" /> : <Mic className="w-[18px] h-[18px]" />}
          </button>
        )}
        </div>

        {/* 날씨 바 제거됨 — 헤더 라인에 통합 */}
      </div>

      {/* 음성 인식 중 표시 */}
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

      {/* 편지지 영역 - 편지지 밖에서도 스크롤 가능하도록 flex-1로 전체 영역 차지 */}
      <div className="flex-1 px-4 lg:px-6 py-4 relative">
      {/* 핀치 줌 리셋 버튼 */}
      {pinchZoom > 1.05 && (
        <button
          onClick={() => setPinchZoom(1)}
          className="absolute top-2 right-2 z-50 bg-neutral-800/70 text-white text-size-10 px-2.5 py-1 rounded-full backdrop-blur-sm"
        >
          축소
        </button>
      )}
      <div
        ref={containerRef}
        className="flex flex-col relative mx-auto w-full max-w-[772px]"
        style={{
          transform: pinchZoom > 1 ? `scale(${pinchZoom})` : undefined,
          transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
          transition: pinchStartRef.current ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={(e) => {
          if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            pinchStartRef.current = { dist, zoom: pinchZoom };
            // 두 손가락 중심점을 origin으로
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
              const cx = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width * 100;
              const cy = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) / rect.height * 100;
              setZoomOrigin({ x: Math.max(0, Math.min(100, cx)), y: Math.max(0, Math.min(100, cy)) });
            }
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 2 && pinchStartRef.current) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ratio = dist / pinchStartRef.current.dist;
            const newZoom = Math.max(1, Math.min(3, pinchStartRef.current.zoom * ratio));
            setPinchZoom(newZoom);
          }
        }}
        onTouchEnd={() => {
          pinchStartRef.current = null;
        }}
      >
        {/* 세로 스택 컨테이너 - scale 계산 전에는 숨김 */}
        {scale !== null && (
        <div
          ref={scrollContainerRef}
          className="flex flex-col items-center w-full pb-10"
          style={{ gap: 24 * scale }}
        >
            {[...pages, { id: pages.length + 1, content: '' }].map((page, pageIndex) => {
              const isCurrentPage = pageIndex === currentPage;
              const isExtraPage = pageIndex === pages.length; // n+1 빈 페이지
              return (
                <div
                  key={page.id}
                  data-page-index={pageIndex}
                  ref={(el) => {
                    if (el) {
                      pageRefs.current.set(pageIndex, el);
                    } else {
                      pageRefs.current.delete(pageIndex);
                    }
                  }}
                  className="relative"
                  style={{
                    width: CANVAS_WIDTH * scale,
                    height: CANVAS_HEIGHT * scale,
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                      width: CANVAS_WIDTH,
                      height: CANVAS_HEIGHT,
                    }}
                  >
                    {/* 편지지 */}
                    <div
                      ref={isCurrentPage ? canvasRef : undefined}
                      className={cn(
                        "relative bg-white cursor-pointer transition-all",
                        isCurrentPage ? "ring-2 ring-orange-400 ring-offset-2" : "hover:ring-1 hover:ring-neutral-300"
                      )}
                      style={{
                        width: CANVAS_WIDTH,
                        minWidth: CANVAS_WIDTH,
                        maxWidth: CANVAS_WIDTH,
                        height: CANVAS_HEIGHT,
                        minHeight: CANVAS_HEIGHT,
                        maxHeight: CANVAS_HEIGHT,
                        flexShrink: 0,
                        overflow: 'hidden',
                        boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
                        borderRadius: '2px',
                      }}
                      onClick={() => {
                        if (!isCurrentPage) {
                          // observer 일시 무시
                          ignoreObserverRef.current = true;
                          setTimeout(() => { ignoreObserverRef.current = false; }, 500);

                          saveCurrentPageContent();
                          hasFocusRef.current = false; // 새 페이지 에디터가 content 설정받도록
                          prevPageRef.current = pageIndex;
                          setCurrentPage(pageIndex);
                        }
                      }}
                    >
                      {/* 편지지 배경 */}
                      {stationeryStyle && (
                        <StationeryRenderer
                          style={stationeryStyle}
                          className="absolute inset-0"
                          showCornerDecorations={true}
                        />
                      )}
                      {/* 편지지 줄 (항상 표시) */}
                      {renderLines()}

                      {/* 현재 페이지: 에디터 */}
                      {isCurrentPage ? (
                        <div
                          ref={(el) => {
                            editorRef.current = el;
                            // 에디터 마운트 시 페이지 내용 설정 및 포커스
                            if (el) {
                              // 포커스가 있거나 AI suggestion span이 있거나 IME 조합 중일 때는 내용을 덮어쓰지 않음
                              const hasAISuggestion = el.querySelector('[data-ai-suggestion]');
                              const isFocused = document.activeElement === el || hasFocusRef.current;
                              const isComposing = isComposingRef.current;
                              if (!hasAISuggestion && !isFocused && !isComposing && el.innerText !== page.content) {
                                el.innerText = page.content || '';
                              }
                              // 약간의 지연 후 포커스 (DOM 업데이트 완료 대기)
                              // 바텀시트(초안 미세튜닝/온보딩)나 AI메뉴가 열려있으면 포커스 스킵
                              // 모바일 키보드 완료 직후(blurCooldown)에도 포커스 스킵
                              if (!isFocused && !isComposing && !showDraftPreview && !showOnboarding && !showAIMenu && !blurCooldownRef.current) {
                                setTimeout(() => { if (!blurCooldownRef.current) el.focus(); }, 50);
                              }
                            }
                          }}
                          contentEditable
                          suppressContentEditableWarning
                          onInput={handleEditorInput}
                          onKeyDown={handleKeyDown}
                          onPaste={handlePaste}
                          onCompositionStart={handleCompositionStart}
                          onCompositionEnd={handleCompositionEnd}
                          onFocus={() => { hasFocusRef.current = true; }}
                          onBlur={() => {
                            hasFocusRef.current = false;
                            blurCooldownRef.current = true;
                            setTimeout(() => { blurCooldownRef.current = false; }, 300);
                          }}
                          onClick={(e) => { e.stopPropagation(); editorRef.current?.focus(); }}
                          className={cn(
                            "letter-editor",
                            FONT_FAMILIES[font]?.className || 'font-pretendard'
                          )}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: CANVAS_WIDTH,
                            minWidth: CANVAS_WIDTH,
                            maxWidth: CANVAS_WIDTH,
                            height: CANVAS_HEIGHT,
                            minHeight: CANVAS_HEIGHT,
                            maxHeight: CANVAS_HEIGHT,
                            padding: `${PADDING_TOP}px ${PADDING_X}px ${PADDING_BOTTOM}px`,
                            fontSize: `${fontSize}px`,
                            lineHeight: `${lineHeight}px`,
                            textAlign,
                            color: textColor,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            overflow: 'hidden',
                            outline: 'none',
                            boxSizing: 'border-box',
                            cursor: 'text',
                            zIndex: 10,
                          }}
                        />
                      ) : (
                        /* 다른 페이지: 읽기 전용 */
                        <div
                          className={cn(
                            FONT_FAMILIES[font]?.className || 'font-pretendard'
                          )}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: CANVAS_WIDTH,
                            height: CANVAS_HEIGHT,
                            padding: `${PADDING_TOP}px ${PADDING_X}px ${PADDING_BOTTOM}px`,
                            fontSize: `${fontSize}px`,
                            lineHeight: `${lineHeight}px`,
                            textAlign,
                            color: textColor,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            overflow: 'hidden',
                            boxSizing: 'border-box',
                            userSelect: 'text',
                            cursor: 'default',
                            zIndex: 10,
                          }}
                        >
                          {page.content}
                        </div>
                      )}

                      {/* 페이지 번호 (무조건 표시) */}
                      {pages.length >= 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: PADDING_BOTTOM / 2 - 10,
                            left: 0,
                            right: 0,
                            textAlign: 'center',
                            fontSize: '14px',
                            color: '#9ca3af',
                            fontFamily: 'Pretendard, sans-serif',
                            zIndex: 20,
                            pointerEvents: 'none',
                          }}
                        >
                          - {pageIndex + 1} -
                        </div>
                      )}

                      {/* 현재 페이지에만 AI 오버레이 표시 */}
                      {isCurrentPage && (
                        <>
                          {/* AI 생성 중 전체 오버레이 */}
                          <AnimatePresence>
                            {isGeneratingStart && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-30 flex flex-col items-center justify-center"
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                                  backdropFilter: 'blur(4px)',
                                }}
                              >
                                <div className="flex flex-col items-center">
                                  <div className="relative mb-6 w-20 h-14 flex items-center justify-center">
                                    <TypewriterLoader className="typewriter-loader-large" />
                                  </div>
                                  <p className="text-orange-600 text-base font-medium mb-2">AI가 작성 중이에요</p>
                                  <p className="text-neutral-500 text-sm">&quot;{generatingLabel}&quot; 스타일로 문장을 만들고 있어요</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>


                          {/* AI 다듬기/다시쓰기 버튼 */}
                          <AnimatePresence>
                            {showRefineButton && !isRefining && !showRefineSuggestion && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute z-30 md:translate-x-0 -translate-x-1/2"
                                style={{ top: refinePosition.top, left: (scale ?? 1) < 0.7 ? CANVAS_WIDTH / 2 : refinePosition.left }}
                              >
                                <button
                                  onClick={handleRefine}
                                  className="flex items-center gap-2 md:gap-1.5 px-4 py-3 md:px-3 md:py-2 bg-white border border-neutral-200 text-neutral-600 text-base md:text-sm rounded-full shadow-lg hover:border-orange-500 hover:text-orange-500 transition-all"
                                >
                                  <Wand2 className="w-4 h-4 md:w-3.5 md:h-3.5 text-orange-500" />
                                  <span>다듬기</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* 다듬기 로딩 */}
                          <AnimatePresence>
                            {isRefining && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute z-30 md:translate-x-0 -translate-x-1/2"
                                style={{ top: refinePosition.top, left: (scale ?? 1) < 0.7 ? CANVAS_WIDTH / 2 : refinePosition.left }}
                              >
                                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-500 text-sm rounded-full shadow-lg">
                                  <div className="w-10 h-6 flex items-center justify-center overflow-hidden">
                                    <TypewriterLoader />
                                  </div>
                                  <span>다듬는 중...</span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* 다듬기 제안 */}
                          <AnimatePresence>
                            {showRefineSuggestion && !isRefining && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute z-30 md:translate-x-0 -translate-x-1/2"
                                style={{ top: refinePosition.top, left: (scale ?? 1) < 0.7 ? CANVAS_WIDTH / 2 : refinePosition.left }}
                              >
                                <div className="bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden max-w-[280px]">
                                  <div className="px-3 py-2 bg-orange-50 border-b border-orange-100">
                                    <p className="text-xs text-orange-600 font-medium">다듬어진 문장</p>
                                  </div>
                                  <div className="px-3 py-2">
                                    <p className="text-sm text-neutral-700">{refinedText}</p>
                                  </div>
                                  <div className="flex border-t border-neutral-100">
                                    <button
                                      onClick={handleCancelRefine}
                                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-neutral-500 text-sm hover:bg-neutral-50 transition-all"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>취소</span>
                                    </button>
                                    <button
                                      onClick={handleApplyRefine}
                                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-orange-500 text-sm font-medium hover:bg-orange-50 transition-all border-l border-neutral-100"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>적용</span>
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* AI 이어쓰기 버튼 */}
                          <AnimatePresence>
                            {showContinueButton && !isContinuing && !showContinueSuggestion && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="absolute z-30"
                                style={{ top: continuePosition.top, left: continuePosition.left }}
                              >
                                <button
                                  onClick={handleContinue}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 text-neutral-600 text-sm rounded-full shadow-lg hover:border-orange-500 hover:text-orange-500 transition-all"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                                  <span>이어서 쓰기</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* 이어쓰기 로딩 */}
                          <AnimatePresence>
                            {isContinuing && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="absolute z-30"
                                style={{ top: continuePosition.top, left: continuePosition.left }}
                              >
                                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-500 text-sm rounded-full shadow-lg">
                                  <div className="w-10 h-6 flex items-center justify-center overflow-hidden">
                                    <TypewriterLoader />
                                  </div>
                                  <span>생성 중...</span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* 이어쓰기 제안 */}
                          <AnimatePresence>
                            {showContinueSuggestion && !isContinuing && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="absolute z-30"
                                style={{ top: continuePosition.top, left: continuePosition.left }}
                              >
                                <div className="flex items-center bg-white border border-neutral-200 rounded-full shadow-lg overflow-hidden">
                                  <button
                                    onClick={handleDifferent}
                                    className="flex items-center gap-1 px-3 py-2 text-neutral-600 text-sm hover:bg-neutral-50 transition-all border-r border-neutral-200"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>다르게</span>
                                  </button>
                                  <button
                                    onClick={handleInsertSuggestion}
                                    className="flex items-center gap-1 px-3 py-2 text-orange-500 text-sm font-medium hover:bg-orange-50 transition-all"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>넣기</span>
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </div>
                  </div>


                </div>
              );
            })}

          </div>
          )}

        {/* 플로팅 AI 도우미 - 모바일: 하단 고정, 데스크톱: 편지지 우측 */}
        <div
          className="floating-ai-btn fixed z-40 bottom-24 right-4 md:bottom-auto md:right-auto md:top-1/2 md:-translate-y-1/2"
          style={{ '--floating-left': `${floatingButtonLeft}px` } as React.CSSProperties}
        >
            <style>{`
              @media (min-width: 768px) {
                .floating-ai-btn { left: var(--floating-left); }
              }
            `}</style>
            {/* 툴팁 - 데스크톱만 표시 */}
            {showAITooltip && !showAIMenu && !isMobile && (
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-neutral-800 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg">
                막막할 땐 눌러보세요! ✨
                <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-neutral-800" />
              </div>
            )}

            {/* AI 메뉴 */}
            {showAIMenu && (
              <div className="absolute bottom-full mb-3 w-64 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden right-0 md:right-auto md:left-0">
                {/* AI 도우미 */}
                {recipientId && !isAIProfileLoading && (
                  <button
                    onClick={() => {
                      setShowAIMenu(false);
                      setShowOnboarding(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-b border-orange-200 text-sm font-medium text-orange-600 transition-colors"
                  >
                    <span className="text-lg">🍊</span>
                    <div className="text-left">
                      <p className="font-semibold">
                        {hasAIProfile
                          ? 'AI 도우미 이어서 대화'
                          : pages.some(p => p.content.trim().length > 0)
                            ? 'AI 도우미와 편지 다듬기'
                            : 'AI 도우미로 시작하기'}
                      </p>
                      <p className="text-xs text-orange-400 font-normal">
                        {hasAIProfile
                          ? '이전 대화를 불러와 계속해요'
                          : pages.some(p => p.content.trim().length > 0)
                            ? '쓴 내용을 기반으로 도와줘요'
                            : '대화로 편지 초안을 만들어요'}
                      </p>
                    </div>
                  </button>
                )}
                <div className="flex border-b border-neutral-100">
                  {(['start', 'middle', 'end'] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedSection(key);
                        // 탭 변경 시 옵션 자동 로드
                        if (key === 'start') loadIntroOptions();
                        if (key === 'end') loadConclusionOptions();
                      }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs transition-all",
                        selectedSection === key
                          ? 'text-orange-500 border-b-2 border-orange-500 -mb-px bg-orange-50/50'
                          : 'text-neutral-500 hover:bg-neutral-50'
                      )}
                    >
                      <span>{QUICK_TAGS[key].label}</span>
                    </button>
                  ))}
                </div>
                <div className="p-3">
                  {selectedSection === 'start' && (
                    <div className="space-y-2">
                      {isLoadingIntroOptions ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full" />
                          <span className="ml-2 text-xs text-neutral-500">AI가 서문을 작성하고 있습니다...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-neutral-400">AI가 만든 시작 문장</p>
                            <button
                              onClick={loadIntroOptions}
                              className="text-xs text-orange-500 hover:text-orange-600 p-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            {introOptions.map((option, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleIntroOptionSelect(option.text)}
                                className="w-full text-left p-2 text-xs bg-neutral-50 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all"
                              >
                                {option.text}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {selectedSection === 'middle' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={middleChatInput}
                          onChange={(e) => setMiddleChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && middleChatInput.trim()) {
                              handleMiddleExpand();
                            }
                          }}
                          placeholder="짧은 문장을 입력하면 AI가 자연스럽게 확장해요"
                          className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:border-orange-300 focus:ring-1 focus:ring-orange-200 outline-none"
                          disabled={isExpandingMiddle}
                        />
                        <button
                          onClick={handleMiddleExpand}
                          disabled={!middleChatInput.trim() || isExpandingMiddle}
                          className="w-full py-2 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50"
                        >
                          {isExpandingMiddle ? 'AI가 본문을 확장하고 있습니다...' : '확장하기'}
                        </button>
                      </div>

                      {middleExpandedPreview && (
                        <div className="border border-neutral-200 rounded-lg p-2 bg-neutral-50">
                          <p className="text-xs text-neutral-600 mb-2">{middleExpandedPreview.expanded}</p>
                          <div className="flex gap-1">
                            <button
                              onClick={handleMiddleRetry}
                              className="flex-1 py-1 text-xs text-neutral-600 hover:bg-neutral-200 rounded"
                            >
                              다시
                            </button>
                            <button
                              onClick={handleMiddleInsert}
                              className="flex-1 py-1 text-xs text-orange-600 hover:bg-orange-100 rounded"
                            >
                              넣기
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedSection === 'end' && (
                    <div className="space-y-2">
                      {isLoadingConclusionOptions ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full" />
                          <span className="ml-2 text-xs text-neutral-500">AI가 마무리를 작성하고 있습니다...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-neutral-400">AI가 만든 마무리 문장</p>
                            <button
                              onClick={loadConclusionOptions}
                              className="text-xs text-orange-500 hover:text-orange-600 p-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            {conclusionOptions.map((option, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleConclusionOptionSelect(option.text)}
                                className="w-full text-left p-2 text-xs bg-neutral-50 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all"
                              >
                                {option.text}
                              </button>
                            ))}
                            <button
                              onClick={() => setShowConclusionCustomInput(!showConclusionCustomInput)}
                              className="w-full text-center p-2 text-xs text-neutral-500 hover:bg-neutral-100 border border-dashed border-neutral-300 rounded-lg transition-all"
                            >
                              + 직접 입력
                            </button>
                            {showConclusionCustomInput && (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={conclusionCustomInput}
                                  onChange={(e) => setConclusionCustomInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && conclusionCustomInput.trim()) {
                                      handleConclusionCustomExpand();
                                    }
                                  }}
                                  placeholder="마무리할 내용을 간단히 적어주세요"
                                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:border-orange-300 focus:ring-1 focus:ring-orange-200 outline-none"
                                  disabled={isExpandingConclusion}
                                />
                                <button
                                  onClick={handleConclusionCustomExpand}
                                  disabled={!conclusionCustomInput.trim() || isExpandingConclusion}
                                  className="w-full py-2 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50"
                                >
                                  {isExpandingConclusion ? '확장 중...' : '확장해서 넣기'}
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI 버튼 - 오렌지 그라디언트 이펙트 */}
            <button
              onClick={() => { setShowAIMenu(!showAIMenu); setShowAITooltip(false); }}
              className={cn(
                "ai-glow-btn group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                showAIMenu
                  ? 'bg-neutral-800 text-white'
                  : 'text-orange-500 hover:scale-110',
              )}
            >
              {/* 그라디언트 배경 (메뉴 닫힌 상태에서만) */}
              {!showAIMenu && (
                <>
                  <span className="absolute inset-0 rounded-full overflow-hidden z-[-2]">
                    <span
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square rounded-full"
                      style={{
                        background: 'conic-gradient(from 0deg, #f97316 0%, #fb923c 25%, #fdba74 50%, #fb923c 75%, #f97316 100%)',
                        animation: 'spin 3s ease-in-out infinite alternate',
                        filter: 'blur(10px)',
                        willChange: 'transform',
                        opacity: 0.9,
                      }}
                    />
                  </span>
                  <span
                    className="absolute inset-0 rounded-full z-[-1] transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)',
                    }}
                  />
                  {/* 호버시 추가 글로우 */}
                  <span
                    className="absolute inset-[-4px] rounded-full z-[-3] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%)',
                    }}
                  />
                </>
              )}
              {/* 내부 버튼 */}
              <span
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  showAIMenu
                    ? ''
                    : 'bg-gradient-to-b from-white to-neutral-50 shadow-inner group-hover:from-orange-50 group-hover:to-white'
                )}
              >
                {showAIMenu ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                )}
              </span>
            </button>

            {/* AI 되돌리기 버튼 - 메뉴 외부에 표시 */}
            <AnimatePresence>
              {canUndo && !showAIMenu && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  onClick={handleUndoAI}
                  className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 text-neutral-600 text-xs rounded-full shadow-lg hover:border-orange-500 hover:text-orange-500 transition-all whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>되돌리기</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
      </div>
      </div>

      {/* 스텝 이전/다음 버튼 (하단 고정, 편지지 너비) */}
      {(onStepPrev || onStepNext) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-white border-t border-neutral-200">
          <div className="flex items-center justify-between w-full px-4 py-3" style={{ maxWidth: scale ? CANVAS_WIDTH * scale + 32 : 804 }}>
            <button
              onClick={onStepPrev}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>
            <button
              onClick={onStepNext}
              disabled={!canStepNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 모바일 페이지 네비게이션 (하단 고정) */}
      {isMobile && pages.length > 1 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-4 py-2 flex items-center justify-between safe-area-bottom">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-neutral-600 hover:bg-neutral-100 active:scale-95"
          >
            ← 이전
          </button>
          <span className="text-sm text-neutral-500">
            {currentPage + 1} / {pages.length}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pages.length - 1}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-orange-500 hover:bg-orange-50 active:scale-95"
          >
            다음 →
          </button>
        </div>
      )}

      {/* 음성인식 중 플로팅 끄기 버튼 */}
      <AnimatePresence>
        {isListening && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleVoiceToggle}
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

      {/* AI 온보딩 바텀시트 */}
      <AnimatePresence>
        {showOnboarding && recipientId && (
          <RecipientOnboarding
            recipientId={recipientId}
            recipientName={recipientName || ''}
            recipientRelation={recipientRelation || ''}
            recipientFacility={recipientFacility}
            letterHistory={letterHistory}
            currentContent={pages.map(p => p.content).filter(c => c.trim()).join('\n\n')}
            onComplete={handleOnboardingComplete}
            onSkip={() => setShowOnboarding(false)}
          />
        )}
      </AnimatePresence>

      {/* 초안 생성 중 로딩 */}
      {isGeneratingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-2xl">🍊</span>
            </div>
            <p className="text-sm text-neutral-600">{generatingLabel || 'AI가 편지 초안을 작성하고 있어요...'}</p>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* 초안 미세 튜닝 바텀시트 */}
      <AnimatePresence>
        {showDraftPreview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => {
                handleAcceptDraft();
              }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 inset-x-0 z-50 flex flex-col bg-white rounded-t-2xl h-[85vh] shadow-2xl md:max-w-2xl md:mx-auto"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {/* 드래그 핸들 */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>

              {/* 헤더 */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-orange-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">AI 초안 미리보기</h3>
                    <p className="text-xs text-muted-foreground">마음에 들 때까지 다듬어보세요</p>
                  </div>
                </div>
                <button
                  onClick={handleAcceptDraft}
                  className="px-4 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors"
                >
                  이대로 쓸게
                </button>
              </div>

              {/* 초안 내용 */}
              <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
                {isRefiningDraft && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-orange-50 rounded-lg">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-orange-600">수정 중...</span>
                  </div>
                )}
                <div className={cn(
                  "text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap transition-opacity",
                  isRefiningDraft && "opacity-50"
                )}>
                  {draftText}
                </div>
              </div>

              {/* 미세 튜닝 버튼들 */}
              <div className="px-4 py-3 border-t border-neutral-100 safe-area-bottom">
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { label: '더 짧게', icon: '✂️' },
                    { label: '더 따뜻하게', icon: '🧡' },
                    { label: '더 솔직하게', icon: '💬' },
                    { label: '더 정중하게', icon: '🙏' },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleRefineDraft(opt.label)}
                      disabled={isRefiningDraft}
                      className="flex items-center gap-1.5 px-3 py-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600 transition-colors disabled:opacity-40"
                    >
                      <span>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
                {/* 커스텀 입력 */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-neutral-50 rounded-full px-4 py-2 border border-neutral-200 focus-within:border-orange-300 focus-within:ring-1 focus-within:ring-orange-200 transition-all">
                    <input
                      ref={customRefineInputRef}
                      autoFocus
                      type="text"
                      value={customRefineInput}
                      onChange={(e) => { e.stopPropagation(); setCustomRefineInput(e.target.value); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customRefineInput.trim()) {
                          e.preventDefault();
                          handleRefineDraft(customRefineInput.trim());
                        }
                      }}
                      placeholder="이건 어때? 직접 입력..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
                      disabled={isRefiningDraft}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (customRefineInput.trim()) {
                        handleRefineDraft(customRefineInput.trim());
                      }
                    }}
                    disabled={!customRefineInput.trim() || isRefiningDraft}
                    className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-orange-600 transition-colors shrink-0"
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI 도우미 모달 */}
      <AIWritingHelper
        isOpen={isAIHelperOpen}
        onClose={() => setIsAIHelperOpen(false)}
        onSelectSuggestion={(text) => {
          insertText(text + "\n\n");
        }}
        currentContent={editorRef.current?.innerText || ''}
        recipientName={recipientName}
        recipientRelation={recipientRelation}
        recipientFacility={recipientFacility}
        recipientAddress={recipientAddress}
        recipientPrisonerNumber={recipientPrisonerNumber}
        recipientContext={recipientContext}
        recipientId={recipientId}
        letterHistory={letterHistory}
      />

      {/* AI 작성 모달들 */}
      <AIWriterModal
        type="intro"
        isOpen={activeModal === "intro"}
        onClose={() => setActiveModal(null)}
        onInsert={(text) => handleInsertContent(text, "start")}
        currentContent={editorRef.current?.innerText || ''}
        recipientName={recipientName}
        recipientRelation={recipientRelation}
        recipientFacility={recipientFacility}
        recipientAddress={recipientAddress}
        recipientPrisonerNumber={recipientPrisonerNumber}
        recipientContext={recipientContext}
        recipientId={recipientId}
        letterHistory={letterHistory}
      />
      <AIWriterModal
        type="middle"
        isOpen={activeModal === "middle"}
        onClose={() => setActiveModal(null)}
        onInsert={(text) => handleInsertContent(text, "cursor")}
        currentContent={editorRef.current?.innerText || ''}
        recipientName={recipientName}
        recipientRelation={recipientRelation}
        recipientFacility={recipientFacility}
        recipientAddress={recipientAddress}
        recipientPrisonerNumber={recipientPrisonerNumber}
        recipientContext={recipientContext}
        recipientId={recipientId}
        letterHistory={letterHistory}
      />
      <AIWriterModal
        type="conclusion"
        isOpen={activeModal === "conclusion"}
        onClose={() => setActiveModal(null)}
        onInsert={(text) => handleInsertContent(text, "end")}
        currentContent={editorRef.current?.innerText || ''}
        recipientName={recipientName}
        recipientRelation={recipientRelation}
        recipientFacility={recipientFacility}
        recipientAddress={recipientAddress}
        recipientPrisonerNumber={recipientPrisonerNumber}
        recipientContext={recipientContext}
        recipientId={recipientId}
        letterHistory={letterHistory}
      />
    </div>
  );
}
