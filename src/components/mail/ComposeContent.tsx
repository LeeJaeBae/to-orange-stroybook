import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { formatRecipientDisplay } from "@/lib/formatRecipient";
import { useDealStore } from "@/stores/useDealStore";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  FileText,
  Edit3,
  Eye,
  Image,
  Settings,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  User,
  Send,
  Sparkles,
  Save,
  Loader2,
  X,
  Pencil,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GeneratingLoader } from "@/components/ui/GeneratingLoader";
import { toast } from "sonner";
import { AddRecipientInline } from "./AddRecipientInline";
import { AddSenderInline } from "./AddSenderInline";
import { AddressBookModal } from "./AddressBookModal";
// RecipientOnboarding moved to LetterEditor
import { useRecipientAIProfile } from "@/hooks/useRecipientAIProfile";
import type { Stationery } from "./StationerySelector";

const StationerySelector = dynamic(
  () => import("./StationerySelector").then(mod => ({ default: mod.StationerySelector })),
  { loading: () => <LoadingSpinner /> }
);
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const LetterEditor = dynamic(
  () => import("./letter-editor").then(mod => ({ default: mod.LetterEditor })),
  { loading: () => <LoadingSpinner />, ssr: false }
);
import { LetterPreview } from "./LetterPreview";
import { PhotoUpload } from "./PhotoUpload";
import { AdditionalOptions, DocumentUploadPreview, defaultAdditionalItems, type AdditionalItem, type UserDocument } from "./AdditionalOptions";
import { PaymentSummary } from "./PaymentSummary";
import { TossPaymentWidget } from "@/components/payment/TossPaymentWidget";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { useCatalog } from "@/hooks/useCatalog";
import { useSenderAddresses } from "@/hooks/useSenderAddresses";
import { useLetters } from "@/hooks/useLetters";
import { useAuth } from "@/hooks/useAuth";
import { usePointsHook } from "@/hooks/usePoints";
import type { FamilyMember } from "@/types/mail";
import { type FacilityType, type Region, type RelationType } from "@/data/facilities";
import { apiFetch } from "@/lib/api/fetch";
import { usePhotoUploadStore } from "@/stores/photoUploadStore";
import { useComposeDraftStore } from "@/stores/useComposeDraftStore";
import { useComposeStore } from "@/stores/useComposeStore";
import { generateLetterPdf } from "@/lib/pdf/generateLetterPdf";
import type { StationeryStyle } from "@/lib/pdf/types";
import orangeRipe from "@/assets/emoticons/orange-ripe.png";
import orangeSeed from "@/assets/emoticons/orange-seed.png";
import orangeSprout from "@/assets/emoticons/orange-sprout.png";
import orangeYoungTree from "@/assets/emoticons/orange-young-tree.png";
import orangeFullTree from "@/assets/emoticons/orange-full-tree.png";
import { cn } from "@/lib/utils";
import * as gtag from "@/lib/gtag";
import { DEFAULT_FONT_SIZE } from "./letter-editor/constants";
import {
  clearPendingBeforePrintEditPayment,
  savePendingBeforePrintEditPayment,
  type BeforePrintEditPayloadInput,
} from "@/lib/before-print-edit";
import {
  AI_STATIONERY_CATEGORY_ID,
  DEFAULT_STATIONERY_CATEGORY_SETTINGS,
  normalizeStationeryCategoryId,
  normalizeStationeryCategorySettings,
} from "@to-orange/api-contracts";
import { calculateDocumentsPrice, toLetterDocumentPayload } from "@/lib/document-pricing";

const orangeEmoticons = [orangeRipe, orangeSeed, orangeSprout, orangeYoungTree, orangeFullTree];

type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type MailType = string;

interface MailTypeOption {
  id: string;
  label: string;
  deliveryTime: string;
  price: number;
  hasTracking: boolean;
}

// Fallback mail type options (문자열 ID)
const mailTypeOptions: MailTypeOption[] = [
  { id: "준등기우편", label: "준등기", deliveryTime: "3~5일", price: 1800, hasTracking: true },
  { id: "등기우편", label: "일반등기", deliveryTime: "3~5일", price: 2830, hasTracking: true },
  { id: "일반우편", label: "일반우편", deliveryTime: "3~5일", price: 430, hasTracking: false },
  { id: "익일특급", label: "익일특급", deliveryTime: "3~5일", price: 3530, hasTracking: false },
];

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return uuidRegex.test(value);
}

interface Step {
  id: StepId;
  label: string;
  icon: React.ReactNode;
}

interface BeforePrintSettlementQuote {
  orderId: string;
  recipientCount: number;
  currentTotalPrice: number;
  netPaidAmount: number;
  newTotalPrice: number;
  deltaAmount: number;
  newPagePrice: number;
  newPhotoPrice: number;
  newAdditionalOptionsPrice: number;
  newDocumentPrice: number;
}

const steps: Step[] = [
  { id: 1, label: "받는 사람", icon: <Mail className="w-4 h-4" /> },
  { id: 2, label: "편지지", icon: <FileText className="w-4 h-4" /> },
  { id: 3, label: "편지 작성", icon: <Edit3 className="w-4 h-4" /> },
  { id: 4, label: "미리보기", icon: <Eye className="w-4 h-4" /> },
  { id: 5, label: "사진 추가", icon: <Image className="w-4 h-4" /> },
  { id: 6, label: "추가 옵션", icon: <Settings className="w-4 h-4" /> },
  { id: 7, label: "결제", icon: <CreditCard className="w-4 h-4" /> },
];

interface ComposeContentProps {
  familyMembers: FamilyMember[];
  onClose: (redirectToSent?: boolean) => void;
  draftId?: string;
  editId?: string;
  forwardId?: string;
  retryPayment?: boolean;
  initialStep?: StepId;
}

const LOCAL_DRAFT_RESTORE_SESSION_KEY = 'compose-local-draft-restore-enabled';

export function ComposeContent({ familyMembers: propFamilyMembers, onClose, draftId, editId, forwardId, retryPayment, initialStep = 1 }: ComposeContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { balance: pointBalance, isLoadingBalance: isLoadingPoints, refetch: refetchPoints } = usePointsHook();
  const isPrePrintEditMode = !!editId;

  const [currentStep, setCurrentStep] = useState<StepId>(initialStep);
  const [isDraftLoading, setIsDraftLoading] = useState(() => {
    const state = useComposeStore.getState();
    if (editId) {
      return state.currentEditingLetterId !== editId;
    }
    return !!draftId && state.currentDraftId !== draftId;
  });

  // Zustand store에서 편지 작성 상태 관리 (개별 selector로 성능 최적화)
  const visitedSteps = useComposeStore((state) => state.visitedSteps);
  const addVisitedStep = useComposeStore((state) => state.addVisitedStep);
  const selectedRecipientId = useComposeStore((state) => state.selectedRecipientId);
  const setSelectedRecipientId = useComposeStore((state) => state.setSelectedRecipientId);
  const selectedSenderId = useComposeStore((state) => state.selectedSenderId);
  const setSelectedSenderId = useComposeStore((state) => state.setSelectedSenderId);
  const letterContent = useComposeStore((state) => state.letterContent);
  const setLetterContent = useComposeStore((state) => state.setLetterContent);
  const letterPages = useComposeStore((state) => state.letterPages);
  const setLetterPages = useComposeStore((state) => state.setLetterPages);
  const selectedStationeryId = useComposeStore((state) => state.selectedStationeryId);
  const setSelectedStationeryId = useComposeStore((state) => state.setSelectedStationeryId);
  const generatedStationeryStyle = useComposeStore((state) => state.generatedStationeryStyle);
  const setGeneratedStationeryStyle = useComposeStore((state) => state.setGeneratedStationeryStyle);
  const selectedMailType = useComposeStore((state) => state.selectedMailType);
  const setSelectedMailType = useComposeStore((state) => state.setSelectedMailType);
  const selectedAdditionalItems = useComposeStore((state) => state.selectedAdditionalItems);
  const setSelectedAdditionalItems = useComposeStore((state) => state.setSelectedAdditionalItems);
  const letterFont = useComposeStore((state) => state.letterFont);
  const setLetterFont = useComposeStore((state) => state.setLetterFont);
  const letterFontSize = useComposeStore((state) => state.letterFontSize);
  const setLetterFontSize = useComposeStore((state) => state.setLetterFontSize);
  const letterIsBold = useComposeStore((state) => state.letterIsBold);
  const setLetterIsBold = useComposeStore((state) => state.setLetterIsBold);
  const letterTextAlign = useComposeStore((state) => state.letterTextAlign);
  const setLetterTextAlign = useComposeStore((state) => state.setLetterTextAlign);
  const letterLineColor = useComposeStore((state) => state.letterLineColor);
  const setLetterLineColor = useComposeStore((state) => state.setLetterLineColor);
  const isProfanityFiltered = useComposeStore((state) => state.isProfanityFiltered);
  const setIsProfanityFiltered = useComposeStore((state) => state.setIsProfanityFiltered);
  const lastFilteredContent = useComposeStore((state) => state.lastFilteredContent);
  const setLastFilteredContent = useComposeStore((state) => state.setLastFilteredContent);
  const profanityIssues = useComposeStore((state) => state.profanityIssues);
  const setProfanityIssues = useComposeStore((state) => state.setProfanityIssues);
  const isForwardedLetter = useComposeStore((state) => state.isForwardedLetter);
  const setIsForwardedLetter = useComposeStore((state) => state.setIsForwardedLetter);
  const currentDraftId = useComposeStore((state) => state.currentDraftId);
  const setCurrentDraftId = useComposeStore((state) => state.setCurrentDraftId);
  const currentEditingLetterId = useComposeStore((state) => state.currentEditingLetterId);
  const setCurrentEditingLetterId = useComposeStore((state) => state.setCurrentEditingLetterId);
  const resetCompose = useComposeStore((state) => state.resetCompose);

  // AI 프로필 상태 (온보딩은 LetterEditor에서 처리)
  const { profile: aiProfile, hasProfile: hasAIProfile, isLoading: isAIProfileLoading, saveProfile: saveAIProfile } = useRecipientAIProfile(selectedRecipientId);

  // 편지 현재 페이지 (LetterEditor와 LetterPreview 간 공유)
  const [letterCurrentPage, setLetterCurrentPage] = useState(0);
  const lastDraftSaveSignatureRef = useRef<string | null>(null);

  // URL에서 step이 변경되면 상태 동기화 및 방문 기록 추가
  useEffect(() => {
    setCurrentStep(initialStep);
    addVisitedStep(initialStep);
  }, [initialStep, addVisitedStep]);

  const visibleSteps = useMemo(
    () => (isPrePrintEditMode ? steps.filter((step) => step.id >= 3) : steps),
    [isPrePrintEditMode]
  );

  // 스텝 이동 함수 (라우트 기반)
  const goToStep = useCallback((step: StepId) => {
    const stepLabels: Record<StepId, string> = { 1: '받는 사람', 2: '편지지', 3: '편지 작성', 4: '미리보기', 5: '사진 추가', 6: '추가 옵션', 7: '결제' };
    gtag.trackComposeStep(step, stepLabels[step]);
    addVisitedStep(step);
    // 현재 URL의 쿼리 파라미터 유지
    const searchParams = new URLSearchParams(window.location.search);
    const queryString = searchParams.toString();
    const url = queryString ? `/letter/compose/${step}?${queryString}` : `/letter/compose/${step}`;
    router.push(url);
  }, [router, addVisitedStep]);

  // DB에서 가족 구성원 가져오기 (props로 전달받은 데이터 사용, 중복 호출 방지)
  const { familyMembers: dbFamilyMembers, isLoading: isFamilyLoading, deactivateFamilyMember } = useFamilyMembers();
  const { data: catalogData, isLoading: isCatalogLoading } = useCatalog();
  const { senderAddresses: dbSenderAddresses, createSenderAddress, updateSenderAddress, deactivateSenderAddress, isLoading: isSendersLoading } = useSenderAddresses();

  // 임시저장 편지 목록 (헤더 드롭다운용)
  const { letters: draftLetters, deleteLetter: deleteDraftLetter } = useLetters({
    folder: 'draft',
    enabled: !isPrePrintEditMode,
  });

  // LetterEditor용 drafts 목록 변환
  const editorDrafts = useMemo(() => {
    return draftLetters
      .filter((letter) => letter.id !== draftId) // 현재 편집 중인 draft 제외
      .map((letter) => ({
        id: letter.id,
        title: letter.sender.name ? `${letter.sender.name}에게` : '제목 없음',
        date: letter.date,
        preview: letter.preview || letter.content?.substring(0, 50) || '',
      }));
  }, [draftLetters, draftId]);

  // Photo upload store
  const { photos, clearPhotos, setPhotos } = usePhotoUploadStore();

  // Compose draft store (비로그인 사용자용 localStorage 저장)
  const saveComposeDraft = useComposeDraftStore((state) => state.saveDraft);
  const clearComposeDraft = useComposeDraftStore((state) => state.clearDraft);
  const setDraftUserDocuments = useComposeDraftStore((state) => state.setUserDocuments);
  
  // DB 데이터 또는 prop 데이터 사용
  // useFamilyMembers now returns FamilyMember[] directly
  const familyMembers = dbFamilyMembers.length > 0
    ? dbFamilyMembers
    : propFamilyMembers;

  const catalogMailTypes = useMemo(() =>
    catalogData?.mailTypes?.map((item) => ({
      id: item.id,
      label: item.name,
      deliveryTime: item.delivery_time || "",
      price: item.price,
      hasTracking: item.has_tracking,
    })) ?? [],
    [catalogData?.mailTypes]
  );

  const isCatalogFallback = catalogMailTypes.length === 0;
  const resolvedMailTypeOptions = useMemo(
    () => (catalogMailTypes.length > 0 ? catalogMailTypes : mailTypeOptions),
    [catalogMailTypes]
  );

  const stationeryCategorySettings = useMemo(
    () => normalizeStationeryCategorySettings(catalogData?.stationeryCategories ?? DEFAULT_STATIONERY_CATEGORY_SETTINGS),
    [catalogData?.stationeryCategories]
  );

  const stationeryCategoryOrder = useMemo(
    () => new Map<string, number>(stationeryCategorySettings.map((item): [string, number] => [item.id, item.order])),
    [stationeryCategorySettings]
  );

  // useMemo로 감싸서 매 렌더링마다 새로운 배열이 생성되는 것을 방지 (무한 루프 방지)
  const catalogStationeries = useMemo(() => {
    const allowedPatterns = new Set(["none", "lines", "dots", "grid", "waves", "hearts", "stars", "flowers", "leaves", "clouds", "confetti"]);
    type CatalogStationeryStyle = {
      bgColor?: string;
      bgGradient?: string;
      pattern?: string;
      patternColor?: string;
      patternOpacity?: number;
      texture?: string;
      border?: { style: string; color: string; width: string };
      cornerDecoration?: { type: string; color: string };
      customSvg?: unknown;
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
    };

    return catalogData?.stationeries?.map((item) => {
      const style: CatalogStationeryStyle = (item.style ?? {}) as CatalogStationeryStyle;
      const category = normalizeStationeryCategoryId(item.category);
      const pattern = allowedPatterns.has(style.pattern ?? "none")
        ? (style.pattern as "none" | "lines" | "dots" | "grid" | "waves" | "hearts" | "stars" | "flowers" | "leaves" | "clouds" | "confetti")
        : ("none" as const);
      const allowedTextures = new Set(["none", "paper", "watercolor", "linen", "canvas", "parchment"]);
      const texture = style.texture && allowedTextures.has(style.texture)
        ? (style.texture as "none" | "paper" | "watercolor" | "linen" | "canvas" | "parchment")
        : undefined;

      // border 타입 변환
      const allowedBorderStyles = new Set(["none", "solid", "dashed", "dotted", "double"]);
      const allowedBorderWidths = new Set(["thin", "medium", "thick"]);
      const border = style.border && allowedBorderStyles.has(style.border.style)
        ? {
            style: style.border.style as "none" | "solid" | "dashed" | "dotted" | "double",
            color: style.border.color,
            width: (allowedBorderWidths.has(style.border.width) ? style.border.width : "thin") as "thin" | "medium" | "thick",
          }
        : undefined;

      // cornerDecoration 타입 변환
      const allowedCornerTypes = new Set(["none", "flower", "ribbon", "heart", "star", "leaf", "vine"]);
      const cornerDecoration = style.cornerDecoration && allowedCornerTypes.has(style.cornerDecoration.type)
        ? {
            type: style.cornerDecoration.type as "none" | "flower" | "ribbon" | "heart" | "star" | "leaf" | "vine",
            color: style.cornerDecoration.color,
          }
        : undefined;

      return {
        id: item.id,
        name: item.name,
        category,
        order: item.order ?? 999,
        price: item.price ?? 0,
        bgColor: style.bgColor ?? "bg-white",
        bgGradient: style.bgGradient ?? undefined,
        pattern,
        patternColor: style.patternColor ?? undefined,
        patternOpacity: style.patternOpacity ?? undefined,
        texture,
        border,
        cornerDecoration,
        customSvg: style.customSvg ?? undefined,
        backgroundImage: style.frontImage ?? style.backgroundImage ?? style.backImage ?? undefined,
        frontImage: style.frontImage ?? style.backgroundImage ?? undefined,
        backImage: style.backImage ?? undefined,
        writingArea: style.writingArea ?? undefined,
        backWritingArea: style.backWritingArea ?? style.writingArea ?? undefined,
        isNew: item.is_new ?? false,
        isPremium: item.is_premium ?? false,
      };
    }) ?? [];
  }, [catalogData?.stationeries]);

  const resolvedStationeries = useMemo(
    () => [...catalogStationeries].sort((a, b) => {
      const catA = stationeryCategoryOrder.get(a.category) ?? 99;
      const catB = stationeryCategoryOrder.get(b.category) ?? 99;
      if (catA !== catB) return catA - catB;

      const orderA = Number.isFinite(a.order) ? a.order : Number.MAX_SAFE_INTEGER;
      const orderB = Number.isFinite(b.order) ? b.order : Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;

      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
      return a.name.localeCompare(b.name, "ko");
    }),
    [catalogStationeries, stationeryCategoryOrder]
  );

  const resolvedStationeryCategories = useMemo(() => {
    return stationeryCategorySettings
      .filter((category) => {
        return category.id !== AI_STATIONERY_CATEGORY_ID
          && category.isActive
          && resolvedStationeries.some((item) => item.category === category.id);
      })
      .map((category) => ({
        id: category.id,
        label: category.label,
      }));
  }, [resolvedStationeries, stationeryCategorySettings]);

  // DB에서 가져온 추가 옵션
  const catalogAdditionalOptions = useMemo<AdditionalItem[]>(() =>
    catalogData?.additionalOptions?.map((item) => ({
      id: item.id,
      icon: item.icon || "🎁",
      title: item.title,
      description: item.description,
      previewContent: item.preview_content || undefined,
    })) ?? [],
    [catalogData?.additionalOptions]
  );

  // code→UUID 매핑 (DB에 등록된 옵션의 code와 하드코딩 id가 같으면 UUID로 교체)
  const codeToUuid = useMemo(() => {
    const map = new Map<string, string>();
    catalogData?.additionalOptions?.forEach((item) => {
      map.set(item.code, item.id);
    });
    return map;
  }, [catalogData?.additionalOptions]);

  // 하드코딩 기본 항목 + DB 추가 항목 합치기
  // DB에 code가 매칭되면 하드코딩 id를 UUID로 교체
  const mergedAdditionalOptions = useMemo<AdditionalItem[]>(() => {
    const hardcodedCodes = new Set(defaultAdditionalItems.map(item => item.id));
    // 하드코딩 항목: DB UUID가 있으면 교체
    const merged = defaultAdditionalItems.map(item => {
      const uuid = codeToUuid.get(item.id);
      return uuid ? { ...item, id: uuid } : item;
    });
    // DB에만 있는 항목 추가 (code가 하드코딩에 없는 것)
    const dbOnlyOptions = catalogAdditionalOptions.filter(item => {
      const matchingCode = catalogData?.additionalOptions?.find(o => o.id === item.id)?.code;
      return matchingCode && !hardcodedCodes.has(matchingCode);
    });
    return [...merged, ...dbOnlyOptions];
  }, [catalogAdditionalOptions, codeToUuid, catalogData?.additionalOptions]);

  // 가격 정보는 DB에서만 가져옴 (하드코딩 항목도 DB에 가격 있으면 사용)
  const additionalOptionPrices = Object.fromEntries(
    (catalogData?.additionalOptions ?? []).map((item) => [item.id, item.price])
  );

  const resolvedAdditionalItemsInfo = Object.fromEntries(
    mergedAdditionalOptions.map((item) => [item.id, {
      icon: item.icon,
      title: item.title,
      price: item.price,
    }])
  );
  
  // 편지 히스토리 가져오기 (수신자 선택 시에만 로드 - 성능 최적화)
  const { letters: inboxLetters } = useLetters({ folder: 'inbox', enabled: !!selectedRecipientId });
  const { letters: sentLetters } = useLetters({ folder: 'sent', enabled: !!selectedRecipientId });

  // 우편 타입 기본값 설정
  useEffect(() => {
    if (
      resolvedMailTypeOptions.length > 0 &&
      (!selectedMailType || !resolvedMailTypeOptions.some((option) => option.id === selectedMailType))
    ) {
      setSelectedMailType(resolvedMailTypeOptions[0].id);
    }
  }, [resolvedMailTypeOptions, selectedMailType, setSelectedMailType]);

  // 편지지 기본값 설정
  useEffect(() => {
    // AI 생성 편지지가 선택된 경우 리셋하지 않음 (ID가 일치하면 유효한 AI 편지지)
    const isAiStationerySelected = generatedStationeryStyle && generatedStationeryStyle.id === selectedStationeryId;

    if (
      resolvedStationeries &&
      resolvedStationeries.length > 0 &&
      (!selectedStationeryId || !resolvedStationeries.some((item) => item.id === selectedStationeryId)) &&
      !isAiStationerySelected
    ) {
      setSelectedStationeryId(resolvedStationeries[0].id);
    }
  }, [resolvedStationeries, selectedStationeryId, generatedStationeryStyle, setSelectedStationeryId]);

  // DB에서 보내는 사람 데이터 로드 시 기본 sender 선택
  useEffect(() => {
    if (dbSenderAddresses.length > 0 && selectedSenderId === null) {
      // 기본으로 설정된 sender 선택, 없으면 첫 번째 선택
      const defaultSender = dbSenderAddresses.find((s) => s.isDefault);
      setSelectedSenderId(defaultSender?.id ?? dbSenderAddresses[0].id);
    }
  }, [dbSenderAddresses, selectedSenderId, setSelectedSenderId]);

  // 비속어 필터링 로딩 상태 (UI 상태)
  const [isProfanityFilterLoading, setIsProfanityFilterLoading] = useState(false);

  // 사용자 문서 상태 (UI 상태)
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>(() => useComposeDraftStore.getState().userDocuments ?? []);
  const updateUserDocuments = useCallback((documents: UserDocument[]) => {
    setUserDocuments(documents);
    setDraftUserDocuments(documents);
  }, [setDraftUserDocuments]);

  // Draft 관리 상태 (UI 상태)
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [allowLocalDraftRestore, setAllowLocalDraftRestore] = useState(false);

  // draftId prop이 변경되면 store 업데이트
  // 주의: loadDraft 완료 후에 setCurrentDraftId를 호출해야 레이스 컨디션 방지
  // (여기서 미리 설정하면 loadDraft의 중복 방지 가드가 잘못 작동함)

  // 토스 결제 관련 상태
  const [showTossWidget, setShowTossWidget] = useState(false);
  const [tossOrderInfo, setTossOrderInfo] = useState<{
    letterId: string;
    totalAmount: number;
    orderName: string;
  } | null>(null);
  const [beforePrintQuote, setBeforePrintQuote] = useState<BeforePrintSettlementQuote | null>(null);
  const [isBeforePrintQuoteLoading, setIsBeforePrintQuoteLoading] = useState(false);
  const [beforePrintQuoteError, setBeforePrintQuoteError] = useState<string | null>(null);
  const [beforePrintPaymentMethod, setBeforePrintPaymentMethod] = useState<'CARD' | 'POINTS'>('CARD');
  const [showBeforePrintTossWidget, setShowBeforePrintTossWidget] = useState(false);
  const [beforePrintTossInfo, setBeforePrintTossInfo] = useState<{
    orderId: string;
    amount: number;
    orderName: string;
    successUrl: string;
    failUrl: string;
  } | null>(null);

  // 특가할인 적용
  const { getDiscountAmount } = useDealStore();


  // 모바일 키보드 감지 (하단 버튼 숨김용)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    // visualViewport API로 키보드 감지
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      // 뷰포트 높이가 화면 높이의 75% 미만이면 키보드가 열린 것으로 판단
      const isOpen = viewport.height < window.innerHeight * 0.75;
      setIsKeyboardOpen(isOpen);
    };

    viewport.addEventListener('resize', handleResize);
    return () => viewport.removeEventListener('resize', handleResize);
  }, []);

  // 내용 변경 시 필터링 결과 초기화
  useEffect(() => {
    // 내용이 변경되면 이전 필터링 결과를 초기화
    if (lastFilteredContent && letterContent !== lastFilteredContent) {
      setIsProfanityFiltered(false);
      setProfanityIssues([]);
    }
  }, [letterContent, lastFilteredContent]);

  // 페이지 벗어날 때 자동 저장 (통합: 로그인/비로그인 모두 localStorage에 동기 백업)
  useEffect(() => {
    const saveToLocalStorage = () => {
      const hasContent = letterContent.trim() || photos.length > 0 || userDocuments.length > 0 || selectedRecipientId;
      if (!hasContent) return;

      saveComposeDraft({
        selectedRecipientId,
        selectedSenderId,
        letterContent,
        selectedStationeryId,
        generatedStationeryStyle,
        selectedMailType,
        selectedAdditionalItems,
        photos,
        userDocuments,
        currentStep,
      });
    };

    const handleBeforeUnload = () => {
      sessionStorage.setItem(LOCAL_DRAFT_RESTORE_SESSION_KEY, '1');
      saveToLocalStorage();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveToLocalStorage();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    user,
    letterContent,
    photos,
    userDocuments,
    selectedRecipientId,
    selectedSenderId,
    selectedStationeryId,
    generatedStationeryStyle,
    selectedMailType,
    selectedAdditionalItems,
    currentStep,
    saveComposeDraft,
  ]);

  useEffect(() => {
    if (draftId || editId || forwardId || retryPayment) {
      setAllowLocalDraftRestore(false);
      return;
    }

    const shouldRestore = sessionStorage.getItem(LOCAL_DRAFT_RESTORE_SESSION_KEY) === '1';
    sessionStorage.removeItem(LOCAL_DRAFT_RESTORE_SESSION_KEY);
    setAllowLocalDraftRestore(shouldRestore);

    if (shouldRestore) return;

    lastDraftSaveSignatureRef.current = null;
    resetCompose();
    clearPhotos();
    updateUserDocuments([]);
    setCurrentDraftId(null);
    setCurrentEditingLetterId(null);
    setIsForwardedLetter(false);
  }, [
    clearPhotos,
    draftId,
    editId,
    forwardId,
    resetCompose,
    retryPayment,
    setCurrentDraftId,
    setCurrentEditingLetterId,
    setIsForwardedLetter,
    updateUserDocuments,
  ]);

  // Draft 불러오기 - familyMembers와 senderAddresses가 로드될 때까지 대기
  useEffect(() => {
    if (!draftId || isPrePrintEditMode) return;

    // 이미 로드된 draft면 스킵 (포인트 충전 후 돌아올 때 중복 로드 방지)
    if (currentDraftId === draftId) return;

    // 데이터 로딩 중이면 대기
    if (isFamilyLoading || isSendersLoading) return;

    loadDraft(draftId);
  }, [draftId, familyMembers.length, dbSenderAddresses.length, currentDraftId, isFamilyLoading, isSendersLoading, isPrePrintEditMode]);

  useEffect(() => {
    if (!editId) return;
    if (currentEditingLetterId === editId) return;
    if (isFamilyLoading || isSendersLoading) return;

    resetCompose();
    clearPhotos();
    updateUserDocuments([]);
    loadEditableLetter(editId);
  }, [editId, currentEditingLetterId, isFamilyLoading, isSendersLoading, resetCompose, clearPhotos, updateUserDocuments]);

  // localStorage draft 복원 실행 함수
  const restoreLocalDraft = useCallback(() => {
    const draft = useComposeDraftStore.getState();

    // 상태 복원
    if (draft.letterContent) setLetterContent(draft.letterContent);
    if (draft.selectedStationeryId) setSelectedStationeryId(draft.selectedStationeryId);
    if (draft.generatedStationeryStyle) setGeneratedStationeryStyle(draft.generatedStationeryStyle as Stationery);
    if (draft.selectedMailType) setSelectedMailType(draft.selectedMailType);
    if (draft.selectedAdditionalItems.length > 0) setSelectedAdditionalItems(draft.selectedAdditionalItems);
    if (draft.currentStep) {
      const searchParams = new URLSearchParams(window.location.search);
      const queryString = searchParams.toString();
      const url = queryString ? `/letter/compose/${draft.currentStep}?${queryString}` : `/letter/compose/${draft.currentStep}`;
      router.replace(url);
    }
    if (draft.photos.length > 0) setPhotos(draft.photos);
    if (draft.userDocuments.length > 0) updateUserDocuments(draft.userDocuments);

    if (draft.selectedRecipientId && familyMembers.some(m => m.id === draft.selectedRecipientId)) {
      setSelectedRecipientId(draft.selectedRecipientId);
    }
    if (draft.selectedSenderId && dbSenderAddresses.some(s => s.id === draft.selectedSenderId)) {
      setSelectedSenderId(draft.selectedSenderId);
    }

    if (user) {
      clearComposeDraft();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearComposeDraft, familyMembers, dbSenderAddresses, user]);

  // 🔄 localStorage draft 복원
  // compose store가 비어있으면 자동 복원 (새로고침 대응),
  // 이미 내용이 있으면 토스트로 확인 (세션당 1회)
  useEffect(() => {
    if (draftId || editId) return;
    if (!allowLocalDraftRestore) return;
    if (!useComposeDraftStore.getState().hasDraft()) return;

    // compose store가 비어있으면 자동 복원 (새로고침 시 항상 복원)
    if (!letterContent.trim()) {
      restoreLocalDraft();
      return;
    }

    // 이미 내용이 있는 경우에만 토스트로 확인 (세션당 1회)
    const alreadyAsked = sessionStorage.getItem('draft-restore-asked');
    if (alreadyAsked) return;

    sessionStorage.setItem('draft-restore-asked', '1');
    toast('작성 중이던 편지가 있습니다', {
      id: 'restore-local-draft',
      description: '이전에 작성하던 내용을 불러올까요?',
      duration: 10000,
      action: {
        label: '불러오기',
        onClick: () => {
          restoreLocalDraft();
          toast.success('임시저장된 편지를 불러왔습니다.');
        },
      },
      cancel: {
        label: '새로 쓰기',
        onClick: () => {
          clearComposeDraft();
        },
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowLocalDraftRestore, clearComposeDraft, draftId, editId]); // 최초 마운트 시에만 실행

  const loadDraft = async (letterId: string) => {
    setIsDraftLoading(true);
    lastDraftSaveSignatureRef.current = null;
    try {
      const response = await fetch(`/api/v1/letters/${letterId}`);
      if (!response.ok) {
        throw new Error('임시저장 편지를 불러올 수 없습니다.');
      }

      const { data: letter } = await response.json();

      // 1. 편지 데이터 복원
      setLetterContent(letter.content || '');
      setSelectedStationeryId(letter.stationery_id || letter.stationeries?.id || resolvedStationeries?.[0]?.id || 'white');
      setSelectedMailType(letter.mail_type_id || letter.mail_types?.id || resolvedMailTypeOptions[0]?.id || '');

      // AI 편지지 스타일 복원 (stationeries에 category와 style 정보가 있는 경우)
      if (letter.stationeries?.style) {
        const stationeryData = letter.stationeries;
        const style = stationeryData.style;

        // AI 편지지인 경우 (backgroundImage나 customSvg가 있으면)
        if (style.backgroundImage || style.customSvg) {
          setGeneratedStationeryStyle({
            id: stationeryData.id,
            name: stationeryData.name,
            category: stationeryData.category,
            backgroundImage: style.backgroundImage,
            customSvg: style.customSvg,
            bgColor: style.bgColor,
            bgGradient: style.bgGradient,
            pattern: style.pattern,
            patternColor: style.patternColor,
            patternOpacity: style.patternOpacity,
          });
        }
      }

      // 비속어 필터링 상태 복원
      setIsProfanityFiltered(letter.is_profanity_filtered || false);
      setLastFilteredContent(letter.last_filtered_content || null);

      // 2. 수신자 복원
      if (letter.letter_recipients && letter.letter_recipients.length > 0) {
        const recipient = letter.letter_recipients[0];
        const matchingMember = familyMembers.find(
          m => m.id === recipient.family_member_id || m.name === recipient.recipient_name
        );
        if (matchingMember) {
          setSelectedRecipientId(matchingMember.id);
        } else {
          console.warn('수신자를 찾을 수 없습니다:', recipient.recipient_name);
        }
      }

      // 3. 발신자 복원
      if (letter.sender_name) {
        const matchingSender = dbSenderAddresses.find(
          s => s.name === letter.sender_name && s.phone === letter.sender_phone
        );
        if (matchingSender) {
          setSelectedSenderId(matchingSender.id);
        } else {
          console.warn('발신자를 찾을 수 없습니다:', letter.sender_name);
        }
      }

      // 4. 사진 복원 (이미 업로드된 URL)
      if (letter.letter_images && letter.letter_images.length > 0) {
        const restoredPhotos = letter.letter_images
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((img: any) => ({
            id: img.id || img.image_url, // id 또는 URL을 id로 사용
            url: img.image_url,
            path: img.image_url.split('/').slice(-2).join('/'), // URL에서 path 추출
            rotation: 0,
            isUploading: false,
          }));
        
        setPhotos(restoredPhotos);
      }

      if (letter.letter_documents && letter.letter_documents.length > 0) {
        const restoredDocuments = letter.letter_documents
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((document: any) => ({
            id: document.id || document.file_path,
            url: document.file_url,
            path: document.file_path,
            fileName: document.file_name,
            fileType: document.file_type,
            fileSize: document.file_size,
            pageCount: document.page_count,
            printMode: document.print_mode,
            isPageCountEstimated: document.is_page_count_estimated ?? false,
          }));

        updateUserDocuments(restoredDocuments);
      } else {
        updateUserDocuments([]);
      }

      // 5. 추가 옵션 복원
      if (letter.letter_additional_options && letter.letter_additional_options.length > 0) {
        setSelectedAdditionalItems(
          letter.letter_additional_options.map((opt: any) => opt.option_id)
        );
      }

      // 로드 성공 후 currentDraftId 설정 (중복 로드 방지용)
      setCurrentDraftId(letterId);

      toast.success('임시저장된 편지를 불러왔습니다.', {
        description: `${letter.letter_images?.length || 0}장의 사진 포함`,
      });
    } catch (error) {
      console.error('Draft load error:', error);
      setCurrentDraftId(null);
      toast.error(error instanceof Error ? error.message : '편지를 불러올 수 없습니다.');
      onClose();
    } finally {
      setIsDraftLoading(false);
    }
  };

  const loadEditableLetter = async (letterId: string) => {
    setIsDraftLoading(true);
    lastDraftSaveSignatureRef.current = null;
    try {
      const response = await fetch(`/api/v1/letters/${letterId}`);
      if (!response.ok) {
        throw new Error('출력 전 수정할 편지를 불러올 수 없습니다.');
      }

      const { data: letter } = await response.json();

      if (letter.status !== 'PAID') {
        throw new Error('이미 출력 단계에 들어간 편지는 수정할 수 없습니다.');
      }

      setLetterContent(letter.content || '');
      setSelectedStationeryId(letter.stationery_id || letter.stationeries?.id || resolvedStationeries?.[0]?.id || 'white');
      setSelectedMailType(letter.mail_type_id || letter.mail_types?.id || resolvedMailTypeOptions[0]?.id || '');
      setGeneratedStationeryStyle(null);
      setSelectedAdditionalItems([]);
      setLetterFont(letter.font || 'pretendard');
      setLetterFontSize(letter.font_size ?? DEFAULT_FONT_SIZE);
      setLetterLineColor(letter.line_color || null);
      setLetterIsBold(false);
      setLetterTextAlign('left');
      setIsForwardedLetter(false);
      setIsProfanityFiltered(letter.is_profanity_filtered || false);
      setLastFilteredContent(letter.last_filtered_content || null);
      setProfanityIssues([]);
      setCurrentDraftId(null);

      if (letter.stationeries?.style) {
        const stationeryData = letter.stationeries;
        const style = stationeryData.style;

        if (style.backgroundImage || style.customSvg) {
          setGeneratedStationeryStyle({
            id: stationeryData.id,
            name: stationeryData.name,
            category: stationeryData.category,
            backgroundImage: style.backgroundImage,
            customSvg: style.customSvg,
            bgColor: style.bgColor,
            bgGradient: style.bgGradient,
            pattern: style.pattern,
            patternColor: style.patternColor,
            patternOpacity: style.patternOpacity,
          });
        }
      }

      if (letter.letter_recipients && letter.letter_recipients.length > 0) {
        const recipient = letter.letter_recipients[0];
        const matchingMember = familyMembers.find(
          m => m.id === recipient.family_member_id || m.name === recipient.recipient_name
        );
        if (matchingMember) {
          setSelectedRecipientId(matchingMember.id);
        }
      }

      if (letter.sender_name) {
        const matchingSender = dbSenderAddresses.find(
          s => s.name === letter.sender_name && s.phone === letter.sender_phone
        );
        if (matchingSender) {
          setSelectedSenderId(matchingSender.id);
        }
      }

      if (letter.letter_images && letter.letter_images.length > 0) {
        const restoredPhotos = letter.letter_images
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((img: any) => ({
            id: img.id || img.image_url,
            url: img.image_url,
            path: img.image_url.split('/').slice(-2).join('/'),
            rotation: 0,
            isUploading: false,
          }));

        setPhotos(restoredPhotos);
      } else {
        clearPhotos();
      }

      if (letter.letter_documents && letter.letter_documents.length > 0) {
        const restoredDocuments = letter.letter_documents
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((document: any) => ({
            id: document.id || document.file_path,
            url: document.file_url,
            path: document.file_path,
            fileName: document.file_name,
            fileType: document.file_type,
            fileSize: document.file_size,
            pageCount: document.page_count,
            printMode: document.print_mode,
            isPageCountEstimated: document.is_page_count_estimated ?? false,
          }));

        updateUserDocuments(restoredDocuments);
      } else {
        updateUserDocuments([]);
      }

      if (letter.letter_additional_options && letter.letter_additional_options.length > 0) {
        setSelectedAdditionalItems(
          letter.letter_additional_options.map((opt: any) => opt.option_id)
        );
      }

      setCurrentEditingLetterId(letterId);
      toast.success('출력 전 수정 모드로 불러왔습니다.', {
        description: '사진과 추가 옵션까지 다시 조정할 수 있습니다.',
      });
    } catch (error) {
      console.error('Editable letter load error:', error);
      toast.error(error instanceof Error ? error.message : '편지를 불러올 수 없습니다.');
      onClose();
    } finally {
      setIsDraftLoading(false);
    }
  };

  // 전달 편지 불러오기
  const loadForward = async (letterId: string) => {
    try {
      const response = await fetch(`/api/v1/letters/${letterId}`);
      if (!response.ok) {
        throw new Error('원본 편지를 불러올 수 없습니다.');
      }

      const { data: letter } = await response.json();

      // 전달 내용 생성 (원본 내용에 헤더 추가)
      const originalDate = new Date(letter.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const forwardedContent = `\n\n---------- 전달된 편지 ----------\n보낸 사람: ${letter.sender_name || '알 수 없음'}\n날짜: ${originalDate}\n\n${letter.content || ''}`;

      setLetterContent(forwardedContent);
      setIsForwardedLetter(true); // 전달 편지는 AI 필터링 건너뜀

      toast.success('편지가 전달 준비되었습니다.', {
        description: '받는 사람을 선택해주세요.',
      });
    } catch (error) {
      console.error('Forward load error:', error);
      toast.error(error instanceof Error ? error.message : '편지를 불러올 수 없습니다.');
    }
  };

  // 전달 편지 불러오기 (forwardId가 있을 때)
  useEffect(() => {
    if (!forwardId || draftId || editId) return; // draftId/editId가 있으면 전달보다 우선
    loadForward(forwardId);
  }, [forwardId, draftId, editId]);

  // 결제 재시도: 드래프트 로딩 완료 후 결제 단계로 이동 + 토스 위젯 자동 표시
  const [retryPaymentTriggered, setRetryPaymentTriggered] = useState(false);
  useEffect(() => {
    if (!retryPayment || isDraftLoading || retryPaymentTriggered || !draftId || isPrePrintEditMode) return;

    const loadExistingOrderAndShowWidget = async () => {
      try {
        // 기존 주문 정보 조회
        const response = await fetch(`/api/v1/me/orders?letterId=${draftId}`);
        if (response.ok) {
          const { data: orders } = await response.json();
          // PENDING 상태 주문이 있으면 해당 정보로 토스 위젯 표시
          const pendingOrder = orders?.find((o: any) => o.status === 'PENDING');
          // familyMembers에서 선택된 수신자 찾기
          const recipient = familyMembers.find((m) => m.id === selectedRecipientId);
          if (pendingOrder && recipient) {
            const discounted = pendingOrder.total_amount - getDiscountAmount(pendingOrder.total_amount);
            setTossOrderInfo({
              letterId: draftId,
              totalAmount: Math.max(discounted, 0),
              orderName: `편지 발송 - ${recipient.name}`,
            });
            setShowTossWidget(true);
            toast.info('이전 결제를 이어서 진행합니다.');
          } else {
            toast.info('결제를 다시 진행해주세요.');
          }
        } else {
          toast.info('결제를 다시 진행해주세요.');
        }
      } catch (error) {
        console.error('주문 정보 조회 실패:', error);
        toast.info('결제를 다시 진행해주세요.');
      }
    };

    // 드래프트 로딩 완료 후 결제 단계로 이동
    goToStep(7);
    setRetryPaymentTriggered(true);

    // 기존 주문 정보 조회 및 위젯 표시
    loadExistingOrderAndShowWidget();
  }, [retryPayment, isDraftLoading, retryPaymentTriggered, goToStep, draftId, familyMembers, selectedRecipientId, isPrePrintEditMode]);

  const photoUrls = useMemo(() => photos.map((photo) => photo.url), [photos]);
  const hasMeaningfulLetterContent = useMemo(
    () => letterContent.replace(/<[^>]*>/g, '').trim().length > 0,
    [letterContent]
  );
  const hasDraftAssets = hasMeaningfulLetterContent || photos.length > 0 || userDocuments.length > 0;
  const documentAdditionalOptionIds = useMemo(() => {
    const ids = new Set<string>(['user-document']);
    const mappedId = codeToUuid.get('user-document');
    if (mappedId) {
      ids.add(mappedId);
    }
    return ids;
  }, [codeToUuid]);

  const documentPayload = useMemo(
    () => userDocuments.map((document) => toLetterDocumentPayload(document)),
    [userDocuments]
  );

  const selectedCatalogAdditionalOptionIds = useMemo(
    () => selectedAdditionalItems.filter((id) => isUuid(id) && !documentAdditionalOptionIds.has(id)),
    [documentAdditionalOptionIds, selectedAdditionalItems]
  );

  const beforePrintPayload = useMemo<BeforePrintEditPayloadInput>(() => ({
    content: letterContent,
    font: letterFont,
    fontSize: letterFontSize,
    lineColor: letterLineColor,
    images: photoUrls,
    additionalOptionIds: selectedCatalogAdditionalOptionIds,
    documents: documentPayload,
    isProfanityFiltered,
    lastFilteredContent,
  }), [
    documentPayload,
    isProfanityFiltered,
    lastFilteredContent,
    letterContent,
    letterFont,
    letterFontSize,
    letterLineColor,
    photoUrls,
    selectedCatalogAdditionalOptionIds,
  ]);

  const beforePrintSelectedOptionTitles = useMemo(
    () => selectedCatalogAdditionalOptionIds
      .map((id) => resolvedAdditionalItemsInfo[id]?.title)
      .filter((title): title is string => Boolean(title)),
    [resolvedAdditionalItemsInfo, selectedCatalogAdditionalOptionIds]
  );

  useEffect(() => {
    const preferredDocumentOptionId = codeToUuid.get('user-document') ?? 'user-document';
    const hasDocumentOption = selectedAdditionalItems.some((id) => documentAdditionalOptionIds.has(id));

    if (userDocuments.length > 0 && !hasDocumentOption) {
      setSelectedAdditionalItems([...selectedAdditionalItems, preferredDocumentOptionId]);
      return;
    }

    if (userDocuments.length === 0 && hasDocumentOption) {
      setSelectedAdditionalItems(selectedAdditionalItems.filter((id) => !documentAdditionalOptionIds.has(id)));
    }
  }, [
    codeToUuid,
    documentAdditionalOptionIds,
    selectedAdditionalItems,
    setSelectedAdditionalItems,
    userDocuments.length,
  ]);

  const loadBeforePrintQuote = useCallback(async () => {
    if (!editId) return;

    setIsBeforePrintQuoteLoading(true);
    setBeforePrintQuoteError(null);

    try {
      const response = await apiFetch(`/api/v1/letters/${editId}/before-print/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(beforePrintPayload),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || '정산 금액을 계산할 수 없습니다.');
      }

      setBeforePrintQuote(body.data ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : '정산 금액을 계산할 수 없습니다.';
      setBeforePrintQuote(null);
      setBeforePrintQuoteError(message);
    } finally {
      setIsBeforePrintQuoteLoading(false);
    }
  }, [beforePrintPayload, editId]);

  useEffect(() => {
    if (!isPrePrintEditMode || !editId || currentStep !== 7 || isDraftLoading) return;
    void loadBeforePrintQuote();
  }, [currentStep, editId, isDraftLoading, isPrePrintEditMode, loadBeforePrintQuote]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const finishBeforePrintEdit = useCallback(async (successMessage: string, description?: string) => {
    if (!editId) return;

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['letters'] }),
      queryClient.invalidateQueries({ queryKey: ['letter', editId] }),
    ]);

    refetchPoints();
    clearPendingBeforePrintEditPayment();
    resetCompose();
    clearPhotos();
    updateUserDocuments([]);
    setShowBeforePrintTossWidget(false);
    setBeforePrintTossInfo(null);
    toast.success(successMessage, description ? { description } : undefined);
    router.push(`/letter/${editId}`);
  }, [clearPhotos, editId, queryClient, refetchPoints, resetCompose, router, updateUserDocuments]);

  const handleApplyBeforePrintEdit = useCallback(async () => {
    if (!editId || !beforePrintQuote || isSubmitting) return;

    if (beforePrintQuote.deltaAmount > 0 && beforePrintPaymentMethod !== 'POINTS') {
      toast.info('카드 결제를 선택한 경우 아래 위젯에서 결제를 진행해주세요.');
      return;
    }

    if (beforePrintQuote.deltaAmount > 0 && pointBalance < beforePrintQuote.deltaAmount) {
      toast.error('포인트가 부족합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch(`/api/v1/letters/${editId}/before-print/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: beforePrintPayload,
          settlementMethod: beforePrintQuote.deltaAmount > 0 ? beforePrintPaymentMethod : 'NONE',
        }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || '출력 전 수정 적용에 실패했습니다.');
      }

      if (beforePrintQuote.deltaAmount < 0) {
        await finishBeforePrintEdit('출력 전 수정이 반영되었습니다.', `${Math.abs(beforePrintQuote.deltaAmount).toLocaleString()}원이 환불되었습니다.`);
      } else if (beforePrintQuote.deltaAmount > 0) {
        await finishBeforePrintEdit('출력 전 수정이 반영되었습니다.', `${beforePrintQuote.deltaAmount.toLocaleString()}P가 추가 결제되었습니다.`);
      } else {
        await finishBeforePrintEdit('출력 전 수정이 반영되었습니다.');
      }
    } catch (error) {
      console.error('Before-print edit apply error:', error);
      toast.error(error instanceof Error ? error.message : '출력 전 수정 적용에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    beforePrintPayload,
    beforePrintPaymentMethod,
    beforePrintQuote,
    editId,
    finishBeforePrintEdit,
    isSubmitting,
    pointBalance,
  ]);

  const handleStartBeforePrintCardPayment = useCallback(() => {
    if (!editId || !beforePrintQuote || beforePrintQuote.deltaAmount <= 0) return;

    savePendingBeforePrintEditPayment({
      letterId: editId,
      payload: beforePrintPayload,
      savedAt: Date.now(),
    });

    const origin = window.location.origin;
    const tossOrderId = `bp-${editId.replace(/-/g, '').slice(0, 12)}-${Date.now()}`;
    const returnUrl = encodeURIComponent(`/letter/compose/7?editId=${editId}`);

    setBeforePrintTossInfo({
      orderId: tossOrderId,
      amount: beforePrintQuote.deltaAmount,
      orderName: '출력 전 수정 추가결제',
      successUrl: `${origin}/payment/success?type=before-print-edit&letterId=${editId}`,
      failUrl: `${origin}/payment/fail?type=before-print-edit&letterId=${editId}&returnUrl=${returnUrl}`,
    });
    setShowBeforePrintTossWidget(true);
  }, [beforePrintPayload, beforePrintQuote, editId]);
  
  // 모달 상태
  const [isAddRecipientExpanded, setIsAddRecipientExpanded] = useState(false);
  const [editingRecipientId, setEditingRecipientId] = useState<string | null>(null);
  const [isAddSenderExpanded, setIsAddSenderExpanded] = useState(false);
  const [editingSenderId, setEditingSenderId] = useState<string | null>(null);
  const [isAddressBookModalOpen, setIsAddressBookModalOpen] = useState(false);
  const [addressBookInitialTab, setAddressBookInitialTab] = useState<"recipients" | "senders">("recipients");
  const [addressBookAutoAddNew, setAddressBookAutoAddNew] = useState(false);

  // familyMembers를 recipients 형태로 변환
  const recipients = familyMembers.map(member => ({
    id: member.id,
    name: member.name,
    relation: member.relation,
    facility: member.facility,
    address: member.facilityAddress?.replace(/\(우편번호:\s*\d{5}\)\s*/g, '') || member.facilityAddress,
    postalCode: member.postalCode,
    prisonerNumber: member.prisonerNumber,
    color: member.color.includes('orange') ? 'bg-orange-500' :
           member.color.includes('blue') ? 'bg-blue-500' :
           member.color.includes('purple') ? 'bg-purple-500' : 'bg-primary',
    // 추가 메타데이터 (AI 활용)
    gender: member.gender,
    birthDate: member.birthDate,
    facilityType: member.facilityType,
    region: member.region,
  }));

  // familyMembers 로드 시 첫 번째 수신자 자동 선택
  useEffect(() => {
    if (familyMembers.length > 0 && !selectedRecipientId) {
      setSelectedRecipientId(familyMembers[0].id);
    }
  }, [familyMembers, selectedRecipientId]);

  const formatSenderAddress = (sender: { address: string; detailedAddress?: string | null; postCode?: string | null }) => {
    let result = '';
    if (sender.postCode) {
      result += `(우편번호:${sender.postCode}) `;
    }
    result += sender.address;
    if (sender.detailedAddress) {
      result += ` ${sender.detailedAddress}`;
    }
    return result;
  };

  // DB에서 가져온 보내는 사람 데이터를 UI 형식으로 변환
  const senders = [...dbSenderAddresses]
    .sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1))
    .map((sender) => ({
      id: sender.id,
      name: sender.name,
      phone: sender.phone,
      address: sender.address,
      detailedAddress: sender.detailedAddress,
      postCode: sender.postCode,
      isDefault: sender.isDefault,
    }));

  // 선택된 보내는 사람 정보
  const selectedSender = senders.find((s) => s.id === selectedSenderId);
  const selectedRecipient = recipients.find((recipient) => recipient.id === selectedRecipientId);
  const selectedMailTypeOption = resolvedMailTypeOptions.find(
    (option) => option.id === selectedMailType
  );
  const selectedStationery = resolvedStationeries
    ? resolvedStationeries.find((item) => item.id === selectedStationeryId)
    : null;
  const selectedStationeryName = resolvedStationeries
    ? selectedStationery?.name ?? "기본"
    : (selectedStationeryId === "cream" ? "크림" :
       selectedStationeryId === "lined" ? "줄노트" :
       selectedStationeryId === "sky" ? "하늘" :
       selectedStationeryId === "pink" ? "핑크" :
       selectedStationeryId === "mint" ? "민트" : "기본");
  const selectedStationeryPrice = selectedStationery?.price ?? 0;

  // 단계 완료 여부 확인
  const isStep1Complete = () => {
    return selectedRecipientId !== null && selectedMailType !== "";
  };

  const isStep2Complete = () => {
    return selectedSenderId !== null;
  };

  const canProceed = () => {
    if (currentStep === 1) return isStep1Complete() && isStep2Complete();       
    return true;
  };

  const buildRecipientContext = (recipient?: typeof recipients[number]) => {
    if (!recipient) return undefined;
    const parts = [
      recipient.relation ? `관계: ${recipient.relation}` : null,
      recipient.facility ? `시설: ${recipient.facility}` : null,
      recipient.address ? `주소: ${recipient.address}` : null,
      recipient.prisonerNumber ? `수용번호: ${recipient.prisonerNumber}` : null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" / ") : undefined;
  };

  const recipientContext = buildRecipientContext(selectedRecipient);

  // 선택된 수신자와의 편지 히스토리 생성
  const buildLetterHistory = (recipient?: typeof recipients[number]) => {
    if (!recipient?.id) return undefined;

    // 선택된 수신자와의 편지만 필터링
    const recipientLetters = [
      ...inboxLetters.filter(letter => letter.sender.id === recipient.id).map(letter => ({
        date: letter.date,
        createdAt: letter.createdAt,
        direction: 'received' as const,
        content: letter.content,
      })),
      ...sentLetters.filter(letter => letter.sender.id === recipient.id).map(letter => ({
        date: letter.date,
        createdAt: letter.createdAt,
        direction: 'sent' as const,
        content: letter.content,
      })),
    ];

    // 날짜순 정렬 (최신순) - ISO 문자열로 정확한 비교
    recipientLetters.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return recipientLetters.length > 0 ? recipientLetters : undefined;
  };

  const letterHistory = buildLetterHistory(selectedRecipient);

  // TODO: 편지쓰기 에디터 이슈.
  // Step 3에서 사용자가 계속 입력하는 동안 비속어 검사/미리보기 전환이 비동기로 돌면,
  // 아래 snapshot 복원 로직이 최신 입력을 덮어써서 내용이 유실될 수 있다.
  // 에디터 잠금, 요청 버전 관리, 최신 응답만 반영하는 방식 중 하나로 정리 필요.
  // 비속어 필터링 함수 — 내용은 절대 수정하지 않고 분석만 수행
  const filterProfanity = async () => {
    if (!letterContent.trim()) {
      return; // 빈 내용이면 필터링 불필요
    }

    // 이미 필터링되었고 내용이 변경되지 않았으면 스킵
    if (isProfanityFiltered && lastFilteredContent === letterContent) {
      toast.success('이미 검증된 내용입니다.');
      return;
    }

    // 내용 보호: 필터링 전 원본 스냅샷 저장
    const contentSnapshot = letterContent;

    setIsProfanityFilterLoading(true);
    try {
      // 비속어 필터는 분석만 수행하므로 수신자 정보 불필요 (최소한의 데이터만 전송)
      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'profanity-filter',
          content: contentSnapshot,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('비속어 필터링 API 에러:', errorData);
        throw new Error(errorData.error || '비속어 필터링에 실패했습니다.');
      }

      const responseData = await response.json();
      const { data } = responseData;

      if (data && typeof data === 'object') {
        // 응답 형식: { hasIssues, issues } — 내용 수정 없이 분석 결과만 저장
        const { hasIssues, issues } = data as {
          hasIssues: boolean;
          issues: Array<{ text: string; reason: string; suggestion: string }>;
        };

        // 내용 보호: 필터링 중 내용이 변경되었으면 스냅샷으로 복원
        const currentContent = useComposeStore.getState().letterContent;
        if (currentContent !== contentSnapshot) {
          console.warn('[Profanity Filter] 필터링 중 내용 변경 감지 — 원본 복원');
          setLetterContent(contentSnapshot);
        }

        setIsProfanityFiltered(true);
        setLastFilteredContent(contentSnapshot);
        setProfanityIssues(issues || []);

        if (hasIssues && issues && issues.length > 0) {
          toast.warning(`${issues.length}개의 부적절한 표현이 발견되었습니다.`, {
            description: '아래에서 문제 내용을 확인해주세요.',
          });
        } else {
          toast.success('문제없는 내용입니다.');
        }
      }
    } catch (error) {
      // 필터링 실패해도 넘어갈 수 있게 toast만 표시
      // 내용 보호: 에러 시에도 원본 유지 확인
      const currentContent = useComposeStore.getState().letterContent;
      if (currentContent !== contentSnapshot) {
        console.warn('[Profanity Filter] 에러 후 내용 변경 감지 — 원본 복원');
        setLetterContent(contentSnapshot);
      }
      console.error('비속어 필터링 에러:', error);
      toast.error(error instanceof Error ? error.message : '비속어 필터링에 실패했습니다.', {
        action: {
          label: '건너뛰기',
          onClick: () => {
            setIsProfanityFiltered(true);
            setLastFilteredContent(contentSnapshot);
            setProfanityIssues([]);
          },
        },
      });
    } finally {
      setIsProfanityFilterLoading(false);
    }
  };

  const handleNext = async () => {
    if (!canProceed()) return;

    // Step 3→4 전환 시 내용 보호: 스냅샷 저장
    const contentBeforeTransition = currentStep === 3 ? letterContent : null;

    // Step 이동 전 자동 저장 (Step 2 이후부터)
    if (!isPrePrintEditMode && currentStep >= 2 && selectedRecipientId && selectedSenderId && selectedMailType && autoSaveEnabled) {
      await handleSaveDraft(true); // silent mode
    }

    // Step 3 (편지 작성)에서 Step 4 (미리보기)로 넘어갈 때 자동 비속어 필터링
    // 전달 편지는 이미 검증된 내용이므로 필터링 건너뜀
    if (currentStep === 3) {
      if (!isForwardedLetter) {
        await filterProfanity();
      }

      // 내용 보호: Step 3→4 전환 후 내용이 변경되었으면 복원
      if (contentBeforeTransition !== null) {
        const currentContent = useComposeStore.getState().letterContent;
        if (currentContent !== contentBeforeTransition) {
          console.warn('[handleNext] Step 3→4 전환 중 내용 변경 감지 — 원본 복원');
          setLetterContent(contentBeforeTransition);
        }
      }
    }

    if (currentStep < 7) {
      goToStep((currentStep + 1) as StepId);
    }
  };

  const handlePrev = () => {
    if (isPrePrintEditMode) {
      if (currentStep > 3) {
        goToStep((currentStep - 1) as StepId);
      } else {
        resetCompose();
        clearPhotos();
        updateUserDocuments([]);
        clearPendingBeforePrintEditPayment();
        onClose();
      }
      return;
    }

    if (currentStep > 1) {
      goToStep((currentStep - 1) as StepId);
    } else {
      onClose();
    }
  };

  // 사진은 이미 업로드되어 있으므로 URL만 반환
  const getPhotoUrls = () => {
    return photoUrls;
  };

  // 임시저장 함수
  const handleSaveDraft = async (silent = false) => {
    // 이미 저장 중이면 스킵 (중복 저장 방지)
    if (isSavingDraft) {
      console.log('⏳ [Draft Save] Already saving, skipping...');
      return;
    }

    // 🔐 비로그인 사용자: localStorage에 저장
    if (!user) {
      // 내용이 있을 때만 저장
      if (!hasMeaningfulLetterContent && photos.length === 0 && userDocuments.length === 0 && !selectedRecipientId) {
        return;
      }

      saveComposeDraft({
        selectedRecipientId,
        selectedSenderId,
        letterContent,
        selectedStationeryId,
        generatedStationeryStyle,
        selectedMailType,
        selectedAdditionalItems,
        photos,
        userDocuments,
        currentStep,
      });

      setLastSavedAt(new Date());

      if (!silent) {
        toast.success("임시저장되었습니다", {
          description: "로그인하지 않아도 브라우저에 저장됩니다.",
        });
      }
      return;
    }

    // 🔐 로그인 사용자: 서버에 저장
    if (!selectedRecipientId || !selectedSenderId || !selectedMailType) {
      if (!silent) {
        toast.warning("받는 사람, 보내는 사람, 우편 종류를 선택해주세요.");
      }
      return;
    }

    // 빈 내용은 저장하지 않음
    if (!hasDraftAssets) {
      if (!silent) {
        toast.warning("편지 내용이나 동봉 자료를 먼저 준비해주세요.");
      }
      return;
    }

    console.log('🔵 [Draft Save] Starting...', {
      currentDraftId,
      selectedRecipientId,
      selectedSenderId,
      selectedMailType,
      contentLength: letterContent.length,
      photosCount: photos.length,
    });

    setIsSavingDraft(true);
    try {
      const recipientsPayload = [
        {
          name: selectedRecipient!.name,
          familyMemberId: isUuid(selectedRecipient!.id) ? selectedRecipient!.id : null,
          facilityId: null,
          facilityName: selectedRecipient!.facility || "",
          facilityAddress: selectedRecipient!.address || null,
          prisonerNumber: selectedRecipient!.prisonerNumber || null,
        },
      ];

      const stationeryId = selectedStationeryId && isUuid(selectedStationeryId) ? selectedStationeryId : null;
      // DB에 저장된 추가 옵션만 필터링 (UUID인 것만)
      const additionalOptionIds = selectedAdditionalItems.filter((id) => isUuid(id) && !documentAdditionalOptionIds.has(id));

      // 카탈로그 로딩 중이면 대기
      if (isCatalogLoading) {
        if (!silent) {
          toast.info("카탈로그 로딩 중입니다. 잠시 후 다시 시도해주세요.");
        }
        console.log('⏳ [Draft Save] Catalog is loading, skipping...');
        return;
      }

      // mailTypeId가 UUID가 아니면 Draft 저장 불가
      if (!isUuid(selectedMailType)) {
        if (!silent) {
          toast.error("우편 종류 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        }
        console.error('❌ [Draft Save] mailTypeId is not UUID:', selectedMailType);
        return;
      }

      const uploadedImages = getPhotoUrls();

      const payload = {
        letterId: currentDraftId || null, // 첫 저장 시 null로 새 draft 생성
        senderName: selectedSender!.name,
        senderPhone: selectedSender!.phone,
        senderAddress: formatSenderAddress(selectedSender!),
        stationeryId,
        mailTypeId: selectedMailType,
        recipients: recipientsPayload,
        content: letterContent,
        font: letterFont,
        fontSize: letterFontSize,
        lineColor: letterLineColor,
        images: uploadedImages,
        additionalOptionIds,
        documents: documentPayload,
        isProfanityFiltered,
        lastFilteredContent,
      };

      const draftSaveSignature = JSON.stringify({
        senderName: payload.senderName,
        senderPhone: payload.senderPhone,
        senderAddress: payload.senderAddress,
        stationeryId: payload.stationeryId,
        mailTypeId: payload.mailTypeId,
        recipients: payload.recipients,
        content: payload.content,
        font: payload.font,
        fontSize: payload.fontSize,
        lineColor: payload.lineColor,
        images: payload.images,
        additionalOptionIds: payload.additionalOptionIds,
        documents: payload.documents,
        isProfanityFiltered: payload.isProfanityFiltered,
        lastFilteredContent: payload.lastFilteredContent,
      });

      if (silent && lastDraftSaveSignatureRef.current === draftSaveSignature) {
        return;
      }

      console.log('🔵 [Draft Save] Payload:', {
        ...payload,
        contentLength: letterContent.length,
        contentPreview: letterContent.substring(0, 100),
      });

      const response = await fetch("/api/v1/letters/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log('🔵 [Draft Save] Response status:', response.status);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error('❌ [Draft Save] Error:', errorBody);
        if (errorBody.error === 'Draft letter not found') {
          setCurrentDraftId(null);
        }
        throw new Error(errorBody.error || "임시저장에 실패했습니다.");
      }

      const responseData = await response.json();
      console.log('✅ [Draft Save] Success:', responseData);

      const { letterId } = responseData;
      lastDraftSaveSignatureRef.current = draftSaveSignature;
      setCurrentDraftId(letterId);
      setLastSavedAt(new Date());

      if (!silent) {
        toast.success("임시저장되었습니다", {
          description: "임시보관함에서 이어서 작성할 수 있습니다.",
        });
      }
    } catch (error) {
      if (!silent) {
        toast.error(error instanceof Error ? error.message : "임시저장에 실패했습니다.");
      }
      console.error('Draft save error:', error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // 임시저장 편지 불러오기 (LetterEditor 헤더에서 호출)
  const handleLoadDraftFromEditor = useCallback(async (letterId: string) => {
    // 기존 사진 초기화
    clearPhotos();
    // currentDraftId 업데이트
    setCurrentDraftId(letterId);
    // draft 불러오기
    await loadDraft(letterId);
    // 편지 작성 단계로 이동
    goToStep(3);
  }, [clearPhotos, loadDraft, goToStep]);

  // 내용 초기화 (LetterEditor 헤더에서 호출)
  const handleResetContent = useCallback(() => {
    setLetterContent('');
    setLetterPages([]);
    setLetterCurrentPage(0);
    clearPhotos();
    toast.success('편지 내용이 초기화되었습니다.');
  }, [clearPhotos, setLetterPages]);

  // 자동 저장 (내용 변경 시 - debounce 5초)
  useEffect(() => {
    if (!autoSaveEnabled) return;
    // 카탈로그 로딩 중이면 저장하지 않음 (UUID 검증 실패 방지)
    if (isCatalogLoading) return;
    // 비로그인: 내용이 없으면 저장 안함
    if (!user && !hasMeaningfulLetterContent && photos.length === 0 && userDocuments.length === 0 && !selectedRecipientId) return;
    // 로그인 사용자: 필수 필드 체크 + 내용/동봉 자료 체크
    if (user && (!selectedRecipientId || !selectedSenderId || !selectedMailType || !hasDraftAssets)) return;

    // Debounce: 5초 후에 자동 저장
    const debounceTimer = setTimeout(() => {
      handleSaveDraft(true); // silent mode
    }, 5000);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleSaveDraft를 deps에 추가하면 무한 루프 발생
  }, [autoSaveEnabled, hasDraftAssets, hasMeaningfulLetterContent, isCatalogLoading, letterContent, photos, userDocuments, selectedRecipientId, selectedSenderId, selectedMailType, selectedStationeryId, selectedAdditionalItems, user]);

  // 주기적 자동 저장 (백업용 - 1분마다)
  useEffect(() => {
    if (!autoSaveEnabled) return;
    // 카탈로그 로딩 중이면 저장하지 않음
    if (isCatalogLoading) return;
    // 비로그인: 내용이 없으면 저장 안함
    if (!user && !hasMeaningfulLetterContent && photos.length === 0 && userDocuments.length === 0 && !selectedRecipientId) return;
    // 로그인 사용자: 필수 필드 체크 + 내용/동봉 자료 체크
    if (user && (!selectedRecipientId || !selectedSenderId || !selectedMailType || !hasDraftAssets)) return;

    const autoSaveInterval = setInterval(() => {
      handleSaveDraft(true); // silent mode
    }, 1 * 60 * 1000); // 1분

    return () => clearInterval(autoSaveInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleSaveDraft를 deps에 추가하면 무한 루프 발생
  }, [autoSaveEnabled, hasDraftAssets, hasMeaningfulLetterContent, isCatalogLoading, user, letterContent, photos, userDocuments, selectedRecipientId, selectedSenderId, selectedMailType, selectedStationeryId, selectedAdditionalItems]);

  const handlePayment = async () => {
    if (isSubmitting) return;

    // 🔐 비로그인 사용자: 작성 내용 저장 후 로그인 페이지로 이동
    if (!user) {
      // 현재 작성 중인 내용을 localStorage에 저장
      saveComposeDraft({
        selectedRecipientId,
        selectedSenderId,
        letterContent,
        selectedStationeryId,
        generatedStationeryStyle,
        selectedMailType,
        selectedAdditionalItems,
        photos,
        userDocuments,
        currentStep,
      });

      toast.info("결제를 위해 로그인이 필요합니다.", {
        description: "로그인 후 작성 중인 편지를 이어서 완료할 수 있습니다.",
      });

      // 로그인 후 돌아올 URL 설정
      router.push("/auth?returnUrl=/letter/compose/1");
      return;
    }

    // 빈 내용 검증
    if (!letterContent.replace(/<[^>]*>/g, '').trim()) {
      toast.warning("편지 내용을 작성해주세요.", {
        description: "빈 편지는 발송할 수 없습니다.",
      });
      return;
    }

    if (!selectedSender) {
      toast.warning("보내는 사람 정보를 선택해주세요.");
      return;
    }

    if (!selectedRecipient) {
      toast.warning("받는 사람을 선택해주세요.");
      return;
    }

    if (!isUuid(selectedMailType)) {
      if (isCatalogFallback) {
        toast.error("카탈로그 데이터를 불러오지 못했습니다. 페이지를 새로고침 해주세요.");
      } else {
        toast.warning("우편 종류를 먼저 선택해주세요.");
      }
      return;
    }

    const recipientsPayload = [
      {
        name: selectedRecipient.name,
        familyMemberId: isUuid(selectedRecipient.id) ? selectedRecipient.id : null,
        facilityId: null,
        facilityName: selectedRecipient.facility || "",
        facilityAddress: selectedRecipient.address || null,
        prisonerNumber: selectedRecipient.prisonerNumber || null,
      },
    ];

    if (!recipientsPayload[0].facilityName) {
      toast.warning("수신 시설 정보를 입력해주세요.");
      return;
    }

    const stationeryId = selectedStationeryId && isUuid(selectedStationeryId) ? selectedStationeryId : null;
    // DB에 저장된 추가 옵션만 필터링 (UUID인 것만)
    const additionalOptionIds = selectedAdditionalItems.filter((id) => isUuid(id) && !documentAdditionalOptionIds.has(id));

    gtag.trackBeginCheckout(0, 'letter');
    setIsSubmitting(true);
    let createdLetterId: string | null = null;
    try {
      const uploadedImages = getPhotoUrls();

      const createResponse = await fetch("/api/v1/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: selectedSender.name,
          senderPhone: selectedSender.phone,
          senderAddress: formatSenderAddress(selectedSender),
          stationeryId,
          mailTypeId: selectedMailType,
          recipients: recipientsPayload,
          content: letterContent,
          font: letterFont,
          fontSize: letterFontSize,
          lineColor: letterLineColor,
          images: uploadedImages,
          additionalOptionIds,
          documents: documentPayload,
        }),
      });

      if (!createResponse.ok) {
        const errorBody = await createResponse.json().catch(() => ({}));
        throw new Error(errorBody.error || "편지 저장에 실패했습니다.");
      }

      const { letterId, totalAmount } = await createResponse.json();
      createdLetterId = letterId;

      // PDF 생성 및 업로드 (항상 새로 생성하여 확실하게 업로드)
      console.log('🟡 [PDF] PDF 생성 시작...');
      const stationeryStyleForPdf: StationeryStyle | null = generatedStationeryStyle
        ? {
            id: generatedStationeryStyle.id,
            name: generatedStationeryStyle.name,
            bgColor: generatedStationeryStyle.bgColor,
            bgGradient: generatedStationeryStyle.bgGradient,
            pattern: generatedStationeryStyle.pattern,
            patternColor: generatedStationeryStyle.patternColor,
            patternOpacity: generatedStationeryStyle.patternOpacity,
            texture: generatedStationeryStyle.texture,
            border: generatedStationeryStyle.border,
            cornerDecoration: generatedStationeryStyle.cornerDecoration,
            backgroundImage: generatedStationeryStyle.backgroundImage,
            customSvg: generatedStationeryStyle.customSvg,
          }
        : null;

      const { blob: pdfBlobToUpload } = await generateLetterPdf({
        content: letterContent,
        stationeryStyle: stationeryStyleForPdf,
        font: letterFont,
        fontSize: letterFontSize,
        textAlign: letterTextAlign,
        textColor: '#333333',
        isBold: letterIsBold,
        lineColor: letterLineColor,
      });
      console.log('✅ [PDF] PDF 생성 완료, blob:', pdfBlobToUpload, 'size:', pdfBlobToUpload?.size, 'type:', pdfBlobToUpload?.type);

      if (!pdfBlobToUpload || pdfBlobToUpload.size === 0) {
        throw new Error('PDF 생성에 실패했습니다 (빈 파일)');
      }

      // PDF 업로드 (실패 시 결제 진행하지 않음)
      console.log('🟡 [PDF] 업로드 시작...');
      const pdfFile = new File([pdfBlobToUpload], `${letterId}.pdf`, { type: 'application/pdf' });
      console.log('🟡 [PDF] File 생성됨:', pdfFile.name, 'size:', pdfFile.size, 'type:', pdfFile.type);
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('letterId', letterId);
      console.log('🟡 [PDF] FormData 생성됨, file:', formData.get('file'), 'letterId:', formData.get('letterId'));

      const pdfUploadRes = await fetch('/api/v1/uploads/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!pdfUploadRes.ok) {
        const errData = await pdfUploadRes.json().catch(() => ({}));
        console.error('🔴 [PDF] 업로드 실패:', errData);
        throw new Error('PDF 업로드에 실패했습니다. 다시 시도해주세요.');
      }
      console.log('✅ [PDF] 업로드 완료');

      const paymentResponse = await fetch("/api/v1/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letterId,
          amount: totalAmount,
          method: "POINTS",
        }),
      });

      if (!paymentResponse.ok) {
        const errorBody = await paymentResponse.json().catch(() => ({}));
        throw new Error(errorBody.error || "포인트 결제에 실패했습니다.");
      }

      toast.success("포인트 결제가 완료되었습니다! 편지가 접수되었습니다.", {
        description: "보낸편지함에서 확인하실 수 있습니다.",
        duration: 3000,
      });

      // 포인트 잔액 새로고침
      refetchPoints();

      // 성공 시 사진 store 초기화
      clearPhotos();

      // 결제 성공 후 기존 draft 삭제 (임시보관함에서 제거)
      if (currentDraftId) {
        try {
          await fetch(`/api/v1/letters/${currentDraftId}`, {
            method: 'DELETE',
          });
          console.log('✅ Draft deleted after payment:', currentDraftId);
          setCurrentDraftId(null);
        } catch (error) {
          console.error('❌ Failed to delete draft:', error);
          // 에러가 나도 결제는 성공했으므로 계속 진행
        }
      }

      // 보낸편지 상세페이지로 이동 (약간의 딜레이 후)
      setTimeout(() => {
        router.push(`/letter/${letterId}`);
      }, 1500);
    } catch (error) {
      // PDF 실패 등으로 편지가 생성되었지만 결제가 완료되지 않은 경우 롤백 (soft delete)
      if (createdLetterId) {
        try {
          await fetch(`/api/v1/letters/${createdLetterId}`, { method: 'DELETE' });
          console.log('🔄 [롤백] 결제 실패로 편지 삭제:', createdLetterId);
        } catch (rollbackError) {
          console.error('🔴 [롤백] 편지 삭제 실패:', rollbackError);
        }
      }
      toast.error(error instanceof Error ? error.message : "결제 처리에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 토스 페이먼츠 결제 처리
  const handleTossPayment = async () => {
    if (isSubmitting) return;

    // 비로그인 사용자 처리
    if (!user) {
      saveComposeDraft({
        selectedRecipientId,
        selectedSenderId,
        letterContent,
        selectedStationeryId,
        generatedStationeryStyle,
        selectedMailType,
        selectedAdditionalItems,
        photos,
        userDocuments,
        currentStep,
      });

      toast.info("결제를 위해 로그인이 필요합니다.", {
        description: "로그인 후 작성 중인 편지를 이어서 완료할 수 있습니다.",
      });

      router.push("/auth?returnUrl=/letter/compose/1");
      return;
    }

    // 빈 내용 검증
    if (!letterContent.replace(/<[^>]*>/g, '').trim()) {
      toast.warning("편지 내용을 작성해주세요.", {
        description: "빈 편지는 발송할 수 없습니다.",
      });
      return;
    }

    // 유효성 검사
    if (!selectedSender) {
      toast.warning("보내는 사람 정보를 선택해주세요.");
      return;
    }

    if (!selectedRecipient) {
      toast.warning("받는 사람을 선택해주세요.");
      return;
    }

    if (!isUuid(selectedMailType)) {
      if (isCatalogFallback) {
        toast.error("카탈로그 데이터를 불러오지 못했습니다. 페이지를 새로고침 해주세요.");
      } else {
        toast.warning("우편 종류를 먼저 선택해주세요.");
      }
      return;
    }

    const recipientsPayload = [
      {
        name: selectedRecipient.name,
        familyMemberId: isUuid(selectedRecipient.id) ? selectedRecipient.id : null,
        facilityId: null,
        facilityName: selectedRecipient.facility || "",
        facilityAddress: selectedRecipient.address || null,
        prisonerNumber: selectedRecipient.prisonerNumber || null,
      },
    ];

    if (!recipientsPayload[0].facilityName) {
      toast.warning("수신 시설 정보를 입력해주세요.");
      return;
    }

    const stationeryId = selectedStationeryId && isUuid(selectedStationeryId) ? selectedStationeryId : null;
    // DB에 저장된 추가 옵션만 필터링 (UUID인 것만)
    const additionalOptionIds = selectedAdditionalItems.filter((id) => isUuid(id) && !documentAdditionalOptionIds.has(id));

    setIsSubmitting(true);
    let createdLetterId: string | null = null;
    try {
      // 결제 재시도: 기존 PENDING 주문이 있는지 확인
      if (currentDraftId) {
        const orderResponse = await fetch(`/api/v1/me/orders?letterId=${currentDraftId}`);
        if (orderResponse.ok) {
          const { data: orders } = await orderResponse.json();
          const pendingOrder = orders?.find((o: any) => o.status === 'PENDING');
          if (pendingOrder) {
            // 기존 PENDING 주문이 있으면 새로 생성하지 않고 바로 토스 위젯 표시
            console.log('🟢 [토스 결제] 기존 PENDING 주문 재사용:', pendingOrder);
            const discounted2 = pendingOrder.total_amount - getDiscountAmount(pendingOrder.total_amount);
            setTossOrderInfo({
              letterId: currentDraftId,
              totalAmount: Math.max(discounted2, 0),
              orderName: `편지 발송 - ${selectedRecipient.name}`,
            });
            setShowTossWidget(true);
            setIsSubmitting(false);
            return;
          }
        }
      }

      const uploadedImages = getPhotoUrls();

      // 1. 편지 생성
      const createResponse = await fetch("/api/v1/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: selectedSender.name,
          senderPhone: selectedSender.phone,
          senderAddress: formatSenderAddress(selectedSender),
          stationeryId,
          mailTypeId: selectedMailType,
          recipients: recipientsPayload,
          content: letterContent,
          font: letterFont,
          fontSize: letterFontSize,
          lineColor: letterLineColor,
          images: uploadedImages,
          additionalOptionIds,
          documents: documentPayload,
        }),
      });

      if (!createResponse.ok) {
        const errorBody = await createResponse.json().catch(() => ({}));
        // error가 배열(Zod issues)인 경우 첫 번째 메시지 추출
        let errorMessage = "편지 저장에 실패했습니다.";
        if (typeof errorBody.error === 'string') {
          errorMessage = errorBody.error;
        } else if (Array.isArray(errorBody.error) && errorBody.error.length > 0) {
          errorMessage = errorBody.error[0]?.message || errorMessage;
        }
        console.error('🔴 [토스 결제] 편지 생성 오류:', errorBody);
        throw new Error(errorMessage);
      }

      const { letterId, totalAmount } = await createResponse.json();
      createdLetterId = letterId;

      console.log('🟢 [토스 결제] 편지 생성 완료:', { letterId, totalAmount });

      // PDF 생성 및 업로드 (항상 새로 생성하여 확실하게 업로드)
      console.log('🟡 [토스-PDF] PDF 생성 시작...');
      const stationeryStyleForPdf: StationeryStyle | null = generatedStationeryStyle
        ? {
            id: generatedStationeryStyle.id,
            name: generatedStationeryStyle.name,
            bgColor: generatedStationeryStyle.bgColor,
            bgGradient: generatedStationeryStyle.bgGradient,
            pattern: generatedStationeryStyle.pattern,
            patternColor: generatedStationeryStyle.patternColor,
            patternOpacity: generatedStationeryStyle.patternOpacity,
            texture: generatedStationeryStyle.texture,
            border: generatedStationeryStyle.border,
            cornerDecoration: generatedStationeryStyle.cornerDecoration,
            backgroundImage: generatedStationeryStyle.backgroundImage,
            customSvg: generatedStationeryStyle.customSvg,
          }
        : null;

      const { blob: pdfBlobToUpload } = await generateLetterPdf({
        content: letterContent,
        stationeryStyle: stationeryStyleForPdf,
        font: letterFont,
        fontSize: letterFontSize,
        textAlign: letterTextAlign,
        textColor: '#333333',
        isBold: letterIsBold,
      });
      console.log('✅ [토스-PDF] PDF 생성 완료, blob:', pdfBlobToUpload, 'size:', pdfBlobToUpload?.size, 'type:', pdfBlobToUpload?.type);

      if (!pdfBlobToUpload || pdfBlobToUpload.size === 0) {
        throw new Error('PDF 생성에 실패했습니다 (빈 파일)');
      }

      // PDF 업로드 (실패 시 결제 진행하지 않음)
      console.log('🟡 [토스-PDF] 업로드 시작...');
      const pdfFile = new File([pdfBlobToUpload], `${letterId}.pdf`, { type: 'application/pdf' });
      console.log('🟡 [토스-PDF] File 생성됨:', pdfFile.name, 'size:', pdfFile.size, 'type:', pdfFile.type);
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('letterId', letterId);
      console.log('🟡 [토스-PDF] FormData 생성됨, file:', formData.get('file'), 'letterId:', formData.get('letterId'));

      const pdfUploadRes = await fetch('/api/v1/uploads/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!pdfUploadRes.ok) {
        const errData = await pdfUploadRes.json().catch(() => ({}));
        console.error('🔴 [토스-PDF] 업로드 실패:', errData);
        throw new Error('PDF 업로드에 실패했습니다. 다시 시도해주세요.');
      }
      console.log('✅ [토스-PDF] 업로드 완료');

      // 주문 정보 저장 (특가할인 적용)
      const orderName = `편지 발송 - ${selectedRecipient.name}`;
      const discountedTotal = totalAmount - getDiscountAmount(totalAmount);
      const finalAmount = Math.max(discountedTotal, 0);

      // 0원 결제: 토스 위젯 없이 바로 무료 결제 처리
      if (finalAmount === 0) {
        const paymentResponse = await fetch("/api/v1/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            letterId,
            amount: 0,
            method: "POINTS",
          }),
        });

        if (!paymentResponse.ok) {
          const errorBody = await paymentResponse.json().catch(() => ({}));
          throw new Error(errorBody.error || "무료 결제 처리에 실패했습니다.");
        }

        toast.success("편지가 무료로 접수되었습니다!", {
          description: "보낸편지함에서 확인하실 수 있습니다.",
          duration: 3000,
        });

        clearPhotos();
        if (currentDraftId) {
          try {
            await fetch(`/api/v1/letters/${currentDraftId}`, { method: 'DELETE' });
            setCurrentDraftId(null);
          } catch {}
        }
        resetCompose();
        window.location.href = '/letter';
        return;
      }

      setTossOrderInfo({
        letterId,
        totalAmount: finalAmount,
        orderName,
      });

      console.log('🟢 [토스 결제] 위젯 모달 열기');

      // 토스 결제 위젯 모달 표시
      setShowTossWidget(true);

    } catch (error) {
      // PDF 실패 등으로 편지가 생성되었지만 결제가 완료되지 않은 경우 롤백 (soft delete)
      // 기존 PENDING 주문 재사용 경로에서는 createdLetterId가 null이므로 롤백 불필요
      if (createdLetterId) {
        try {
          await fetch(`/api/v1/letters/${createdLetterId}`, { method: 'DELETE' });
          console.log('🔄 [토스-롤백] 결제 실패로 편지 삭제:', createdLetterId);
        } catch (rollbackError) {
          console.error('🔴 [토스-롤백] 편지 삭제 실패:', rollbackError);
        }
      }
      toast.error(error instanceof Error ? error.message : "결제 준비에 실패했습니다.");
      setIsSubmitting(false);
    }
  };

  // Draft 로딩 중일 때 표시
  if (isDraftLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">임시저장된 편지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 풀페이지 모드 (편지 작성, 미리보기)
  const isFullPageMode = currentStep === 3 || currentStep === 4;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/40">
      {/* Mobile Header - 풀페이지 모드에서는 숨김 */}
      {!isFullPageMode && (
      <header className="lg:hidden bg-card border-b border-border/60">
        {/* 모바일 스텝 인디케이터 */}
        <div className="flex items-center border-t border-border/40 overflow-x-auto scrollbar-hide">
          {visibleSteps.map((step) => {
            const isCurrent = currentStep === step.id;
            const isVisited = visitedSteps.has(step.id);
            const canNavigate = isVisited && !isCurrent;

            return (
              <button
                key={step.id}
                onClick={() => canNavigate && goToStep(step.id)}
                disabled={!canNavigate}
                className={cn(
                  "flex-1 min-w-[48px] py-2 text-size-10 font-medium transition-all border-b-2",
                  isCurrent && "text-primary border-primary",
                  canNavigate && "text-muted-foreground border-transparent hover:text-primary hover:bg-primary/5 active:bg-primary/10 cursor-pointer",
                  !isVisited && !isCurrent && "text-muted-foreground/50 cursor-not-allowed border-transparent"
                )}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-size-10 font-bold transition-all",
                    isCurrent && "bg-primary text-primary-foreground",
                    canNavigate && "bg-primary/20 text-primary",
                    !isVisited && !isCurrent && "bg-muted/50 text-muted-foreground/50"
                  )}>
                    {step.id}
                  </span>
                  <span className="truncate max-w-[60px]">{step.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </header>
      )}

      {/* Desktop Header - 풀페이지 모드에서는 숨김 */}
      {!isFullPageMode && (
      <header className="hidden lg:block h-auto bg-card px-6 py-4 border-b border-border/60">
        <div className="">
          <div className="mb-3">
            <h1 className="text-lg font-semibold text-foreground tracking-tight">{isPrePrintEditMode ? '출력 전 편지 수정' : '편지 쓰기'}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{isPrePrintEditMode ? '출력 전에 필요한 내용만 다시 조정할 수 있습니다.' : '소중한 마음을 담아 편지를 써보세요'}</p>
          </div>

          {/* Divider */}
          <div className="border-t border-border/40 my-3" />

          {/* Step Progress - 콘텐츠 그리드에 맞춤 */}
          <div className="max-w-4xl mx-auto flex items-center">
            {visibleSteps.map((step, index) => {
              const isCurrent = currentStep === step.id;
              const isVisited = visitedSteps.has(step.id);
              const canNavigate = isVisited && !isCurrent;

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => canNavigate && goToStep(step.id)}
                    disabled={!canNavigate}
                    className={cn(
                      "flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                      isCurrent && "text-primary",
                      canNavigate && "text-muted-foreground hover:text-primary hover:bg-primary/5 active:bg-primary/10 cursor-pointer",
                      !isVisited && !isCurrent && "text-muted-foreground/50 cursor-not-allowed"
                    )}
                  >
                    <span className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200",
                      isCurrent && "bg-primary text-primary-foreground shadow-lg",
                      canNavigate && "bg-primary/20 text-primary",
                      !isVisited && !isCurrent && "bg-muted/50 text-muted-foreground/50"
                    )}>
                      {step.id}
                    </span>
                    <span className={isCurrent ? "font-semibold" : ""}>{step.label}</span>
                  </button>
                  {/* 연결선 (마지막 스텝 제외) */}
                  {index < visibleSteps.length - 1 && (
                    <div className={cn("flex-1 h-px mx-2", isVisited ? "bg-primary/30" : "bg-border/50")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>
      )}

      {/* Content Area */}
      <div className={cn("flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 lg:px-6 pb-24 lg:pb-5", currentStep === 3 && "overflow-hidden !p-0")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn("max-w-4xl mx-auto", currentStep === 3 && "max-w-none h-full")}
          >
            {currentStep === 1 && (
              <div className="space-y-5">
                {/* 받는 사람 선택 섹션 */}
                <section className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-foreground text-base">받는 사람 선택</h2>
                    </div>
                    {/* <button 
                      onClick={() => setIsAddressBookModalOpen(true)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      주소록관리
                    </button> */}
                  </div>
                  
                  <div className="space-y-2.5">
                    {/* 로딩 상태 */}
                    {isFamilyLoading && (
                      <div className="space-y-2.5">
                        {[1, 2].map((i) => (
                          <div key={i} className="rounded-xl p-3.5 border border-gray-200 animate-pulse">
                            <div className="flex gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-24" />
                                <div className="h-3 bg-gray-200 rounded w-32" />
                                <div className="h-3 bg-gray-200 rounded w-48" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 빈 상태 */}
                    {!isFamilyLoading && recipients.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <User className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">등록된 받는 사람이 없습니다</p>
                        <p className="text-xs mt-1">아래에서 새 수신자를 추가해주세요</p>
                      </div>
                    )}

                    {/* 수신자 목록 */}
                    {!isFamilyLoading && recipients.map((recipient) => (
                      <React.Fragment key={recipient.id}>
                        <div
                          onClick={() => setSelectedRecipientId(selectedRecipientId === recipient.id ? null : recipient.id)}
                          className={`
                            relative rounded-xl p-3.5 cursor-pointer transition-all
                            ${selectedRecipientId === recipient.id 
                              ? "shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-2 border-primary bg-amber-50" 
                              : "border border-gray-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)] hover:border-gray-400 bg-white"
                            }
                          `}
                        >
                          <div className="flex gap-3 min-w-0 items-center">
                            {/* 아바타 */}
                            <div className="w-10 h-10 rounded-full bg-orange-50 ring-1 ring-orange-200/50 flex items-center justify-center shrink-0 overflow-hidden">
                              <img
                                src={orangeEmoticons[recipients.indexOf(recipient) % orangeEmoticons.length]?.src ?? ""}
                                alt="프로필"
                                className="w-7 h-7 object-contain rounded-full"
                              />
                            </div>
                            
                            {/* 정보 */}
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="font-semibold text-foreground text-sm truncate">
                                  {recipient.name}
                                  {recipient.prisonerNumber && <span className="ml-1">{recipient.prisonerNumber}</span>}
                                </span>
                                <Badge variant="secondary" className="text-size-10 px-1.5 py-0 shrink-0">{recipient.relation}</Badge>
                              </div>
                              {(recipient.facility || recipient.address) && (
                                <p className="text-muted-foreground text-xs truncate">
                                  {recipient.postalCode && `(우편번호:${recipient.postalCode}) `}
                                  {recipient.facilityType !== '일반 주소' && recipient.facility
                                    ? `${recipient.facility}${recipient.address ? ` - ${recipient.address}` : ''}`
                                    : recipient.address || ''
                                  }
                                </p>
                              )}
                            </div>

                            {/* 수정/삭제 */}
                            <div className="flex flex-row gap-1 shrink-0 pr-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingRecipientId(editingRecipientId === recipient.id ? null : recipient.id);
                                  setIsAddRecipientExpanded(editingRecipientId !== recipient.id);
                                }}
                                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  editingRecipientId === recipient.id 
                                    ? "text-primary bg-orange-50" 
                                    : "text-gray-400 hover:text-primary hover:bg-orange-50"
                                }`}
                              >
                                수정
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`${recipient.name}님을 삭제하시겠습니까?`)) {
                                    if (selectedRecipientId === recipient.id) setSelectedRecipientId(null);
                                    if (editingRecipientId === recipient.id) { setEditingRecipientId(null); setIsAddRecipientExpanded(false); }
                                    deactivateFamilyMember(recipient.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* AI 편지 도우미는 LetterEditor에서 제공 */}

                          {/* 우편 종류 - 선택된 수신자만 표시 */}
                          <AnimatePresence>
                          {selectedRecipientId === recipient.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="overflow-hidden -mx-3.5 -mb-3.5"
                            >
                            <div className="px-3.5 py-4 bg-amber-50/70 rounded-b-xl">
                              <p className="text-sm font-medium text-foreground mb-3">우편 종류</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {resolvedMailTypeOptions.map((option) => (
                                    <button
                                      key={option.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedMailType(option.id);
                                      }}
                                      className={`
                                        w-full p-3 rounded-lg transition-all text-left bg-white
                                        ${selectedMailType === option.id
                                          ? "border-2 border-primary shadow-sm"
                                          : "border border-gray-200 hover:border-gray-300"
                                        }
                                      `}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            selectedMailType === option.id ? "border-primary bg-primary" : "border-gray-300"
                                          }`}>
                                            {selectedMailType === option.id && (
                                              <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                            )}
                                          </div>
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-sm font-semibold text-foreground">{option.label}</span>
                                            {option.hasTracking && (
                                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-size-10 font-medium rounded">추적</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <span className="text-size-10 text-muted-foreground hidden sm:inline">{option.deliveryTime}</span>
                                          <span className="text-sm font-bold text-primary">{option.price.toLocaleString()}원</span>
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              
                            </div>
                            </motion.div>
                          )}
                          </AnimatePresence>
                        </div>

                        {/* 수정 아코디언 — 편집 중인 카드 바로 아래 */}
                        {editingRecipientId === recipient.id && (
                          <AddRecipientInline
                            isExpanded={isAddRecipientExpanded}
                            onExpandedChange={(expanded) => {
                              setIsAddRecipientExpanded(expanded);
                              if (!expanded) setEditingRecipientId(null);
                            }}
                            editingMemberId={editingRecipientId}
                            onSuccess={(memberId) => {
                              setSelectedRecipientId(memberId);
                              setEditingRecipientId(null);
                              setIsAddRecipientExpanded(false);
                              toast.success('받는 사람이 수정되었습니다');
                            }}
                          />
                        )}
                      </React.Fragment>
                    ))}
                    
                    
                    {/* 새 수신자 추가 아코디언 (신규 추가용 — 수정 중이 아닐 때만) */}
                    {!editingRecipientId && (
                      <AddRecipientInline
                        isExpanded={isAddRecipientExpanded}
                        onExpandedChange={(expanded) => {
                          setIsAddRecipientExpanded(expanded);
                        }}
                        onSuccess={(memberId) => {
                          setSelectedRecipientId(memberId);
                          toast.success('받는 사람이 추가되었습니다');
                        }}
                      />
                    )}
                  </div>
                </section>

                {/* 보내는 사람 섹션 */}
                <section className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-foreground text-base">보내는 사람</h2>
                    </div>
                    {/* <button 
                      onClick={() => setIsAddressBookModalOpen(true)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      주소록관리
                    </button> */}
                  </div>
                  
                  <div className="space-y-2">
                    {/* 로딩 상태 */}
                    {isSendersLoading && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        불러오는 중...
                      </div>
                    )}

                    {/* 빈 상태 */}
                    {!isSendersLoading && senders.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        등록된 보내는 사람이 없습니다. 새 주소를 추가해주세요.
                      </div>
                    )}

                    {/* 보내는 사람 목록 */}
                    {!isSendersLoading && senders.map((sender) => (
                      <React.Fragment key={sender.id}>
                        <div
                          onClick={() => setSelectedSenderId(sender.id)}
                          className={`
                            relative rounded-xl p-3 cursor-pointer transition-all
                            ${selectedSenderId === sender.id
                              ? "bg-amber-50/70 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-2 border-primary"
                              : "bg-white border border-gray-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)] hover:border-gray-400"
                            }
                          `}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-orange-50 ring-1 ring-orange-200/50 flex items-center justify-center overflow-hidden">
                              <img
                                src={orangeEmoticons[(senders.indexOf(sender) + 2) % orangeEmoticons.length]?.src ?? ""}
                                alt="프로필"
                                className="w-5 h-5 object-contain rounded-full"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-foreground text-sm">{sender.name}</p>
                                {sender.isDefault && <Badge variant="secondary" className="text-size-10 px-1.5 py-0 shrink-0">대표</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{formatSenderAddress(sender)}</p>
                            </div>

                            {/* 수정/삭제 */}
                            <div className="flex items-center gap-1 shrink-0 pr-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingSenderId(editingSenderId === sender.id ? null : sender.id);
                                  setIsAddSenderExpanded(editingSenderId !== sender.id);
                                }}
                                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  editingSenderId === sender.id
                                    ? "text-primary bg-orange-50"
                                    : "text-gray-400 hover:text-primary hover:bg-orange-50"
                                }`}
                              >
                                수정
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`${sender.name}님을 삭제하시겠습니까?`)) {
                                    if (selectedSenderId === sender.id) setSelectedSenderId(null);
                                    if (editingSenderId === sender.id) { setEditingSenderId(null); setIsAddSenderExpanded(false); }
                                    deactivateSenderAddress(sender.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 수정 아코디언 — 편집 중인 카드 바로 아래 */}
                        {editingSenderId === sender.id && (
                          <AddSenderInline
                            isExpanded={isAddSenderExpanded}
                            onExpandedChange={(expanded) => {
                              setIsAddSenderExpanded(expanded);
                              if (!expanded) setEditingSenderId(null);
                            }}
                            editingSenderId={editingSenderId}
                            onAdd={async (newSender) => {
                              await updateSenderAddress(editingSenderId, {
                                name: newSender.name,
                                phone: newSender.phone,
                                address: newSender.address,
                                detailedAddress: newSender.detailedAddress,
                                postCode: newSender.postCode,
                              });
                              setEditingSenderId(null);
                              setIsAddSenderExpanded(false);
                              toast.success('보내는 사람이 수정되었습니다');
                              return null;
                            }}
                          />
                        )}
                      </React.Fragment>
                    ))}

                    {/* 새 주소 추가 아코디언 (신규 추가용 — 수정 중이 아닐 때만) */}
                    {!editingSenderId && (
                      <AddSenderInline
                        isExpanded={isAddSenderExpanded}
                        onExpandedChange={setIsAddSenderExpanded}
                        onAdd={async (newSender) => {
                          const created = await createSenderAddress({
                            name: newSender.name,
                            phone: newSender.phone,
                            address: newSender.address,
                            detailedAddress: newSender.detailedAddress,
                            postCode: newSender.postCode,
                          });
                          if (created) {
                            setSelectedSenderId(created.id);
                            toast.success('보내는 사람이 추가되었습니다');
                          }
                          return created;
                        }}
                      />
                    )}
                  </div>
                </section>
              </div>
            )}

            {currentStep === 2 && (
              <StationerySelector
                selectedId={selectedStationeryId}
                onSelect={setSelectedStationeryId}
                onGeneratedStationeryChange={setGeneratedStationeryStyle}
                items={resolvedStationeries}
                categories={resolvedStationeryCategories}
              />
            )}

            {currentStep === 3 && (
              <div className="relative h-[calc(100vh-120px)] min-h-[400px]">
                {/* 비속어 필터링 로딩 */}
                <AnimatePresence>
                  {isProfanityFilterLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/30 z-50 flex items-center justify-center rounded-2xl"
                    >
                      <GeneratingLoader className="scale-75" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <LetterEditor
                  content={letterContent}
                  onContentChange={setLetterContent}
                  recipientName={selectedRecipient?.name}
                  recipientRelation={selectedRecipient?.relation}
                  recipientFacility={selectedRecipient?.facility}
                  recipientAddress={selectedRecipient?.address}
                  senderName={selectedSender?.name}
                  senderAddress={selectedSender ? formatSenderAddress(selectedSender) : undefined}
                  recipientPrisonerNumber={selectedRecipient?.prisonerNumber}
                  recipientContext={recipientContext}
                  recipientId={selectedRecipient?.id}
                  letterHistory={letterHistory}
                  recipientGender={selectedRecipient?.gender}
                  recipientBirthDate={selectedRecipient?.birthDate}
                  recipientFacilityType={selectedRecipient?.facilityType}
                  recipientRegion={selectedRecipient?.region}
                  stationeryStyle={
                    generatedStationeryStyle?.id === selectedStationeryId
                      ? generatedStationeryStyle
                      : resolvedStationeries?.find((s) => s.id === selectedStationeryId) ?? null
                  }
                  font={letterFont}
                  onFontChange={setLetterFont}
                  fontSize={letterFontSize}
                  onFontSizeChange={setLetterFontSize}
                  isBold={letterIsBold}
                  onBoldChange={setLetterIsBold}
                  textAlign={letterTextAlign}
                  onTextAlignChange={setLetterTextAlign}
                  lineColor={letterLineColor}
                  onLineColorChange={setLetterLineColor}
                  drafts={editorDrafts}
                  onLoadDraft={handleLoadDraftFromEditor}
                  onDeleteDraft={async (id) => {
                    await deleteDraftLetter(id);
                    if (id === currentDraftId) {
                      setCurrentDraftId(null);
                    }
                    toast.success('임시저장이 삭제되었습니다');
                  }}
                  onSaveDraft={isPrePrintEditMode ? undefined : () => handleSaveDraft(false)}
                  showDraftActions={!isPrePrintEditMode}
                  headerTitle={isPrePrintEditMode ? '출력 전 편지 수정' : '편지 작성'}
                  onResetContent={handleResetContent}
                  currentPage={letterCurrentPage}
                  onCurrentPageChange={setLetterCurrentPage}
                  onPagesChange={setLetterPages}
                  onStepPrev={handlePrev}
                  onStepNext={handleNext}
                  canStepNext={canProceed()}
                />
              </div>
            )}

            {currentStep === 4 && (
              <div className="flex flex-col h-full gap-4">
                {/* 부적절한 표현 경고 */}
                {profanityIssues.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-600 text-sm">⚠️</span>
                      </div>
                      <h3 className="font-semibold text-amber-800">
                        {profanityIssues.length}개의 부적절한 표현이 발견되었습니다
                      </h3>
                    </div>
                    <p className="text-sm text-amber-700 mb-3">
                      아래 표현을 수정하시면 편지가 더 원활하게 전달됩니다.
                    </p>
                    <div className="space-y-2">
                      {profanityIssues.map((issue, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-amber-200">
                          <div className="flex items-start gap-2">
                            <span className="text-red-500 font-mono text-sm bg-red-50 px-2 py-0.5 rounded">
                              &quot;{issue.text}&quot;
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">이유:</span> {issue.reason}
                          </p>
                          <p className="text-sm text-green-700 mt-1">
                            <span className="font-medium">제안:</span> {issue.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => goToStep(3)}
                      className="mt-3 w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      편지 수정하러 가기
                    </button>
                  </div>
                )}

                <LetterPreview
                  content={letterContent}
                  preSplitPages={letterPages.length > 0 ? letterPages : undefined}
                  stationeryId={selectedStationeryId}
                  customStationeryStyle={
                    generatedStationeryStyle?.id === selectedStationeryId
                      ? generatedStationeryStyle
                      : resolvedStationeries?.find((s) => s.id === selectedStationeryId) ?? null
                  }
                  recipientName={recipients.find(r => r.id === selectedRecipientId)?.name}
                  recipientFacility={recipients.find(r => r.id === selectedRecipientId)?.facility}
                  recipientPrisonerNumber={recipients.find(r => r.id === selectedRecipientId)?.prisonerNumber}
                  senderName={senders.find(s => s.id === selectedSenderId)?.name}
                  senderAddress={selectedSender ? formatSenderAddress(selectedSender) : undefined}
                  font={letterFont}
                  fontSize={letterFontSize}
                  isBold={letterIsBold}
                  textAlign={letterTextAlign}
                  lineColor={letterLineColor}
                  currentPage={letterCurrentPage}
                  onCurrentPageChange={setLetterCurrentPage}
                  onStepPrev={handlePrev}
                  onStepNext={handleNext}
                  canStepNext={canProceed()}
                  nextButtonLabel="다음"
                />
              </div>
            )}

            {currentStep === 5 && (
                <PhotoUpload maxPhotos={10} />
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                {/* 문서 업로드 섹션 */}
                <div className="bg-white rounded-2xl border border-border/60 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">📎</span>
                    <h3 className="font-semibold text-foreground">전하실 문서를 업로드해주세요</h3>
                  </div>
                  <DocumentUploadPreview
                    documents={userDocuments}
                    onDocumentsChange={(docs) => {
                      updateUserDocuments(docs);
                      // 문서가 있으면 자동으로 user-document 선택
                      const userDocId = mergedAdditionalOptions.find(i => 
                        defaultAdditionalItems.some(d => d.id === 'user-document' && (i.id === 'user-document' || codeToUuid.get('user-document') === i.id))
                      )?.id || 'user-document';
                      if (docs.length > 0 && !selectedAdditionalItems.includes(userDocId)) {
                        setSelectedAdditionalItems([...selectedAdditionalItems, userDocId]);
                      }
                      if (docs.length === 0 && selectedAdditionalItems.includes(userDocId)) {
                        setSelectedAdditionalItems(selectedAdditionalItems.filter(id => id !== userDocId));
                      }
                    }}
                  />
                </div>

                {/* 추가옵션 (user-document 제외) */}
                <AdditionalOptions
                  selectedItems={selectedAdditionalItems}
                  onSelectedItemsChange={setSelectedAdditionalItems}
                  items={mergedAdditionalOptions.filter(i => {
                    const code = catalogData?.additionalOptions?.find(o => o.id === i.id)?.code;
                    return i.id !== 'user-document' && code !== 'user-document';
                  })}
                  userDocuments={userDocuments}
                  onUserDocumentsChange={updateUserDocuments}
                />
              </div>
            )}

            {currentStep === 7 && (
              isPrePrintEditMode ? (
                <div className="space-y-5">
                  <section className="bg-white rounded-2xl border border-border/60 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <div>
                        <h2 className="font-semibold text-foreground text-base">출력 전 수정 정산</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">사진, 문서 출력, 추가 옵션 변경에 따른 차액을 다시 정산합니다.</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-muted/30 p-4">
                        <p className="text-xs text-muted-foreground">사진</p>
                        <p className="mt-1 text-base font-semibold text-foreground">{photos.length}장</p>
                        <p className="mt-1 text-xs text-muted-foreground">{(beforePrintQuote?.newPhotoPrice ?? photos.length * 500).toLocaleString()}원</p>
                      </div>
                      <div className="rounded-2xl bg-muted/30 p-4">
                        <p className="text-xs text-muted-foreground">문서 출력</p>
                        <p className="mt-1 text-base font-semibold text-foreground">
                          {userDocuments.length > 0 ? `${userDocuments.length}개 문서` : '선택 없음'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {(beforePrintQuote?.newDocumentPrice ?? calculateDocumentsPrice(documentPayload)).toLocaleString()}원
                        </p>
                      </div>
                      <div className="rounded-2xl bg-muted/30 p-4">
                        <p className="text-xs text-muted-foreground">추가 옵션</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {beforePrintSelectedOptionTitles.length > 0 ? beforePrintSelectedOptionTitles.join(', ') : '선택 없음'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {(beforePrintQuote?.newAdditionalOptionsPrice ?? 0).toLocaleString()}원
                        </p>
                      </div>
                    </div>

                    {isBeforePrintQuoteLoading ? (
                      <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-10 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                        <p className="mt-3 text-sm text-muted-foreground">차액을 계산하는 중입니다.</p>
                      </div>
                    ) : beforePrintQuoteError ? (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
                        <p className="text-sm font-medium text-red-700">{beforePrintQuoteError}</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void loadBeforePrintQuote()}
                          className="mt-3"
                        >
                          다시 계산하기
                        </Button>
                      </div>
                    ) : beforePrintQuote ? (
                      <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">현재 결제 금액</span>
                          <span className="font-medium text-foreground">{beforePrintQuote.netPaidAmount.toLocaleString()}원</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">수정 후 예상 금액</span>
                          <span className="font-medium text-foreground">{beforePrintQuote.newTotalPrice.toLocaleString()}원</span>
                        </div>
                        <div className="border-t border-border/60 pt-3 flex items-center justify-between">
                          <span className="font-medium text-foreground">
                            {beforePrintQuote.deltaAmount > 0
                              ? '추가 결제'
                              : beforePrintQuote.deltaAmount < 0
                                ? '환불 예정'
                                : '추가 정산 없음'}
                          </span>
                          <span className={cn(
                            'text-lg font-bold',
                            beforePrintQuote.deltaAmount > 0 && 'text-primary',
                            beforePrintQuote.deltaAmount < 0 && 'text-blue-600',
                            beforePrintQuote.deltaAmount === 0 && 'text-foreground'
                          )}>
                            {beforePrintQuote.deltaAmount > 0
                              ? `+${beforePrintQuote.deltaAmount.toLocaleString()}원`
                              : beforePrintQuote.deltaAmount < 0
                                ? `${Math.abs(beforePrintQuote.deltaAmount).toLocaleString()}원`
                                : '0원'}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </section>

                  {!isBeforePrintQuoteLoading && beforePrintQuote && (
                    beforePrintQuote.deltaAmount > 0 ? (
                      <section className="bg-white rounded-2xl border border-border/60 p-5 space-y-4">
                        <div>
                          <h3 className="font-semibold text-foreground">추가 결제 방법</h3>
                          <p className="text-xs text-muted-foreground mt-1">추가된 금액만 다시 결제합니다.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setBeforePrintPaymentMethod('CARD');
                              setShowBeforePrintTossWidget(false);
                            }}
                            className={cn(
                              'rounded-2xl border p-4 text-left transition-colors',
                              beforePrintPaymentMethod === 'CARD'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/40'
                            )}
                          >
                            <p className="font-medium text-foreground">카드 재결제</p>
                            <p className="mt-1 text-xs text-muted-foreground">{beforePrintQuote.deltaAmount.toLocaleString()}원을 추가 승인합니다.</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBeforePrintPaymentMethod('POINTS');
                              setShowBeforePrintTossWidget(false);
                            }}
                            className={cn(
                              'rounded-2xl border p-4 text-left transition-colors',
                              beforePrintPaymentMethod === 'POINTS'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/40'
                            )}
                          >
                            <p className="font-medium text-foreground">포인트 결제</p>
                            <p className="mt-1 text-xs text-muted-foreground">보유 포인트 {pointBalance.toLocaleString()}P</p>
                          </button>
                        </div>

                        {beforePrintPaymentMethod === 'POINTS' ? (
                          <div className="rounded-2xl bg-muted/30 p-4">
                            <p className="text-sm text-muted-foreground">보유 포인트</p>
                            <p className="mt-1 text-lg font-bold text-foreground">{pointBalance.toLocaleString()}P</p>
                            <Button
                              type="button"
                              onClick={() => void handleApplyBeforePrintEdit()}
                              disabled={isSubmitting || pointBalance < beforePrintQuote.deltaAmount}
                              className="mt-4 w-full"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  적용 중...
                                </>
                              ) : (
                                `${beforePrintQuote.deltaAmount.toLocaleString()}P로 수정 적용하기`
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="rounded-2xl bg-muted/30 p-4 space-y-4">
                            {!showBeforePrintTossWidget && (
                              <Button
                                type="button"
                                onClick={handleStartBeforePrintCardPayment}
                                className="w-full"
                              >
                                {beforePrintQuote.deltaAmount.toLocaleString()}원 카드 결제 진행
                              </Button>
                            )}

                            {showBeforePrintTossWidget && beforePrintTossInfo && (
                              <TossPaymentWidget
                                amount={beforePrintTossInfo.amount}
                                orderId={beforePrintTossInfo.orderId}
                                orderName={beforePrintTossInfo.orderName}
                                customerName={selectedSender?.name || '고객'}
                                customerPhone={selectedSender?.phone}
                                successUrl={beforePrintTossInfo.successUrl}
                                failUrl={beforePrintTossInfo.failUrl}
                                buttonLabel={`${beforePrintTossInfo.amount.toLocaleString()}원 추가 결제하기`}
                                onError={(error) => {
                                  toast.error(error.message || '결제 위젯 오류가 발생했습니다.');
                                  setShowBeforePrintTossWidget(false);
                                }}
                              />
                            )}

                            {showBeforePrintTossWidget && (
                              <button
                                type="button"
                                onClick={() => setShowBeforePrintTossWidget(false)}
                                className="w-full text-sm text-muted-foreground hover:text-foreground"
                              >
                                결제 수단 다시 선택
                              </button>
                            )}
                          </div>
                        )}
                      </section>
                    ) : (
                      <section className="bg-white rounded-2xl border border-border/60 p-5 space-y-4">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {beforePrintQuote.deltaAmount < 0 ? '환불 후 수정 적용' : '수정 내용 저장'}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {beforePrintQuote.deltaAmount < 0
                              ? `${Math.abs(beforePrintQuote.deltaAmount).toLocaleString()}원이 기존 결제 수단 기준으로 환불됩니다.`
                              : '추가 결제 없이 수정 내용만 반영됩니다.'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => void handleApplyBeforePrintEdit()}
                          disabled={isSubmitting}
                          className="w-full"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              적용 중...
                            </>
                          ) : beforePrintQuote.deltaAmount < 0 ? (
                            `수정 후 ${Math.abs(beforePrintQuote.deltaAmount).toLocaleString()}원 환불받기`
                          ) : (
                            '수정 내용 저장하기'
                          )}
                        </Button>
                      </section>
                    )
                  )}
                </div>
              ) : (
              <PaymentSummary
                recipientName={recipients.find(r => r.id === selectedRecipientId)?.name}
                recipientFacility={recipients.find(r => r.id === selectedRecipientId)?.facility}
                recipientPrisonerNumber={recipients.find(r => r.id === selectedRecipientId)?.prisonerNumber}
                recipientFacilityAddress={recipients.find(r => r.id === selectedRecipientId)?.address}
                letterContent={letterContent}
                stationeryName={selectedStationeryName}
                stationeryPrice={selectedStationeryPrice}
                userDocuments={userDocuments}
                selectedAdditionalItems={selectedAdditionalItems}
                mailType={selectedMailType}
                mailPrice={selectedMailTypeOption?.price ?? 0}
                mailTypeOptions={resolvedMailTypeOptions}
                additionalItemsInfo={resolvedAdditionalItemsInfo ?? undefined}
                onMailTypeChange={(newMailType) => {
                  setSelectedMailType(newMailType as string);
                }}
                onPayment={handlePayment}
                onTossPayment={handleTossPayment}
                // 토스 결제 위젯 인라인
                showTossWidget={showTossWidget}
                tossOrderInfo={tossOrderInfo}
                customerName={selectedSender?.name}
                customerPhone={selectedSender?.phone}
                onTossWidgetReady={() => {
                  // 위젯 준비 완료
                }}
                onTossWidgetError={(error) => {
                  toast.error(error.message || "결제 위젯 오류가 발생했습니다.");
                  setShowTossWidget(false);
                  setIsSubmitting(false);
                }}
                onTossWidgetClose={() => {
                  setShowTossWidget(false);
                  setIsSubmitting(false);
                }}
                isProcessing={isSubmitting}
                pointBalance={pointBalance}
                isLoadingPoints={isLoadingPoints}
              />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation - 모바일에서 하단 고정, 키보드 열리면 숨김 */}
      {/* step 3에서는 LetterEditor 내부에 버튼이 있으므로 PC에서 숨김 */}
      <div className={`border-t border-border/50 bg-card px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 lg:py-3 lg:px-6 transition-all duration-200 fixed bottom-0 left-0 right-0 z-40 lg:relative lg:z-auto ${
        isKeyboardOpen ? 'hidden lg:block' : ''
      }`}>
        {/* 모바일: 2줄 레이아웃 */}
        <div className="flex flex-col gap-2 lg:hidden">
          {/* 1줄: 이전/다음 버튼 */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              className="h-12 min-w-[80px] px-5 text-base"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              이전
            </Button>

            {currentStep !== 7 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="h-12 min-w-[80px] px-6 text-base bg-primary hover:bg-primary/90"
              >
                다음
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            ) : (
              <div className="w-20" />
            )}
          </div>

        </div>

        {/* 데스크톱: 1줄 레이아웃 */}
        <div className="hidden lg:flex items-center justify-between max-w-3xl mx-auto">
          <Button
            variant="outline"
            onClick={handlePrev}
            className="h-9 px-4 lg:px-5 text-sm gap-2"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            이전
          </Button>

          {currentStep !== 7 && (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="h-9 px-4 lg:px-5 text-sm bg-primary hover:bg-primary/90 gap-2"
            >
              다음
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          )}
          {currentStep === 7 && (
            <div className="w-20" />
          )}
        </div>
      </div>

      {/* 모달들 */}
      <AddressBookModal
        isOpen={isAddressBookModalOpen}
        onClose={() => {
          setIsAddressBookModalOpen(false);
          setAddressBookAutoAddNew(false);
        }}
        initialTab={addressBookInitialTab}
        autoAddNew={addressBookAutoAddNew}
      />

      {/* AI 온보딩은 LetterEditor 내부에서 처리 */}

    </div>
  );
}
