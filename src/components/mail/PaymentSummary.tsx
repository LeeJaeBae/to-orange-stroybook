import { CreditCard, Check, ChevronDown, ChevronUp, Loader2, ExternalLink, Coins, Plus, X } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatRecipientDisplay } from "@/lib/formatRecipient";
import { calculateDocumentsPrice, DOCUMENT_PRINT_MODE_LABELS, getDocumentUnitPrice, type UserDocument } from "@/lib/document-pricing";
import { calculateLetterPagePricing, LETTER_PAGE_FREE_COUNT, LETTER_EXTRA_PAGE_PRICE } from "@/lib/letter-pricing";
import { Button } from "@/components/ui/button";
import { usePhotoUploadStore } from "@/stores/photoUploadStore";
import { TossPaymentWidget } from "@/components/payment/TossPaymentWidget";
import { useAuth } from "@/hooks/useAuth";
import { usePointsHook } from "@/hooks/usePoints";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useDealStore } from "@/stores/useDealStore";

const DOCUMENT_BLACK_WHITE_UNIT_PRICE = getDocumentUnitPrice('BLACK_WHITE');
const DOCUMENT_COLOR_UNIT_PRICE = getDocumentUnitPrice('COLOR');

function getMailTypeDisplayLabel(option?: { id: string; label: string } | null) {
  if (!option) return '';
  if (option.id === '익일특급' || option.label === '익일특급') {
    return '익일특급 (빠른등기)';
  }
  return option.label;
}

const POINT_CHARGE_PRESETS = [
  { value: 10000, label: '10,000P', bonus: 100, bonusLabel: '+100P (1%)' },
  { value: 30000, label: '30,000P', bonus: 900, bonusLabel: '+900P (3%)' },
  { value: 50000, label: '50,000P', bonus: 2500, bonusLabel: '+2,500P (5%)' },
  { value: 70000, label: '70,000P', bonus: 4900, bonusLabel: '+4,900P (7%)' },
  { value: 100000, label: '100,000P', bonus: 10000, bonusLabel: '+10,000P (10%)' },
];

type PaymentMethod = "card" | "points";

interface MailTypeOption {
  id: string;
  label: string;
  deliveryTime: string;
  price: number;
  hasTracking: boolean;
}

const mailTypeOptions: MailTypeOption[] = [
  { id: "준등기우편", label: "준등기", deliveryTime: "3~5일", price: 1800, hasTracking: true },
  { id: "등기우편", label: "일반등기", deliveryTime: "3~5일", price: 2830, hasTracking: true },
  { id: "일반우편", label: "일반우편", deliveryTime: "3~5일", price: 430, hasTracking: false },
  { id: "익일특급", label: "익일특급", deliveryTime: "3~5일", price: 3530, hasTracking: false },
];

interface TossOrderInfo {
  letterId: string;
  totalAmount: number;
  orderName: string;
}

interface PaymentSummaryProps {
  recipientName?: string;
  recipientFacility?: string;
  recipientPrisonerNumber?: string;
  recipientFacilityAddress?: string;
  letterContent: string;
  stationeryName?: string;
  stationeryPrice?: number;
  userDocuments?: UserDocument[];
  selectedAdditionalItems: string[];
  mailType: string;
  mailPrice: number;
  onMailTypeChange: (mailType: string, price: number) => void;
  onPayment: () => void;
  onTossPayment?: () => void;
  mailTypeOptions?: MailTypeOption[];
  additionalItemsInfo?: Record<string, { icon: string; title: string; price?: number }>;
  // 토스 결제 위젯 관련
  showTossWidget?: boolean;
  tossOrderInfo?: TossOrderInfo | null;
  customerName?: string;
  customerPhone?: string;
  onTossWidgetReady?: () => void;
  onTossWidgetError?: (error: Error) => void;
  onTossWidgetClose?: () => void;
  isProcessing?: boolean;
  // 포인트 결제 관련
  pointBalance?: number;
  isLoadingPoints?: boolean;
}

// 추가 옵션 아이템 정보
const additionalItemsInfo: Record<string, { icon: string; title: string; price?: number }> = {
  "meal-plan": { icon: "🍽️", title: "월간 식단표" },
  "movie": { icon: "🎬", title: "보라미 영화" },
  "parole-calc": { icon: "📊", title: "가석방+급수 계산기" },
  "fortune": { icon: "🔮", title: "AI 운세/타로" },
  "puzzle": { icon: "🧩", title: "스도쿠/퍼즐" },
  "humor": { icon: "😂", title: "최신 유머" },
  "job-training": { icon: "📚", title: "직업훈련 안내" },
  "100-questions": { icon: "💬", title: "100가지 질문" },
  "coffee-gift": { icon: "☕", title: "커피 한잔 하자", price: 5000 },
  "orange-gift": { icon: "🍊", title: "오렌지 선물", price: 10000 },
};

export function PaymentSummary({
  recipientName,
  recipientFacility,
  recipientPrisonerNumber,
  recipientFacilityAddress,
  letterContent,
  stationeryName,
  stationeryPrice = 0,
  userDocuments = [],
  selectedAdditionalItems,
  mailType,
  mailPrice,
  onMailTypeChange,
  onPayment,
  onTossPayment,
  mailTypeOptions: mailTypeOptionsOverride,
  additionalItemsInfo: additionalItemsInfoOverride,
  showTossWidget,
  tossOrderInfo,
  customerName,
  customerPhone,
  onTossWidgetReady,
  onTossWidgetError,
  onTossWidgetClose,
  isProcessing,
  pointBalance = 0,
  isLoadingPoints = false,
}: PaymentSummaryProps) {
  const { photos } = usePhotoUploadStore();
  const { user } = useAuth();
  const { balance: hookPointBalance, isLoadingBalance, refetch: refetchPoints } = usePointsHook();
  const { appliedDeal, removeDeal, getDiscountAmount } = useDealStore();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [showPointCharge, setShowPointCharge] = useState(false);
  const [selectedChargeAmount, setSelectedChargeAmount] = useState<number | null>(null);
  const [showChargePayment, setShowChargePayment] = useState(false);
  const [chargeOrderId, setChargeOrderId] = useState('');

  // 포인트 잔액은 prop이 있으면 prop 사용, 아니면 hook에서 가져옴
  const effectivePointBalance = pointBalance > 0 ? pointBalance : hookPointBalance;

  // 아코디언이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!showPointCharge) {
      setSelectedChargeAmount(null);
      setShowChargePayment(false);
      setChargeOrderId('');
    }
  }, [showPointCharge]);

  // 선택된 프리셋 정보
  const selectedPreset = POINT_CHARGE_PRESETS.find(p => p.value === selectedChargeAmount);
  const chargeAmount = selectedChargeAmount || 0;
  const bonusAmount = selectedPreset?.bonus || 0;
  const totalChargePoints = chargeAmount + bonusAmount;
  const isValidChargeAmount = chargeAmount > 0;

  // 충전 결제 진행 핸들러
  const handleProceedToChargePayment = () => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    if (!isValidChargeAmount) {
      toast.error('충전 금액을 선택해주세요.');
      return;
    }
    const newOrderId = `point-charge-${user.id}-${Date.now()}`;
    setChargeOrderId(newOrderId);
    setShowChargePayment(true);
  };

  const resolvedMailTypes =
    mailTypeOptionsOverride && mailTypeOptionsOverride.length > 0
      ? mailTypeOptionsOverride
      : mailTypeOptions;
  const selectedMailTypeOption = resolvedMailTypes.find((option) => option.id === mailType) ?? null;
  const resolvedAdditionalItemsInfo = additionalItemsInfoOverride ?? additionalItemsInfo;

  // 편지 분량 계산
  const { charCount, pageCount, extraPages, pagePrice } = calculateLetterPagePricing(letterContent);
  const estimatedWeight = 20; // 기본 무게 (g)

  // 사진 비용 계산
  const photoPrice = photos.length * 500;

  // 편지지 비용 계산
  const effectiveStationeryPrice = stationeryPrice;

  // 기프트 비용 계산
  const giftPrice = selectedAdditionalItems.reduce((sum, id) => {
    const item = resolvedAdditionalItemsInfo[id];
    return sum + (item?.price ?? 0);
  }, 0);

  const documentPrice = calculateDocumentsPrice(userDocuments);
  const documentSummary = useMemo(() => {
    const totalDocumentCount = userDocuments.length;
    const totalPages = userDocuments.reduce((sum, document) => sum + Math.max(1, document.pageCount || 1), 0);
    const blackWhitePages = userDocuments
      .filter((document) => document.printMode === 'BLACK_WHITE')
      .reduce((sum, document) => sum + Math.max(1, document.pageCount || 1), 0);
    const colorPages = userDocuments
      .filter((document) => document.printMode === 'COLOR')
      .reduce((sum, document) => sum + Math.max(1, document.pageCount || 1), 0);

    return {
      totalDocumentCount,
      totalPages,
      blackWhitePages,
      colorPages,
    };
  }, [userDocuments]);

  // 일반우편 무료 프로모션 (월,수,금 한정, 2026-12-31까지)
  const now = new Date();
  const kstDay = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' })).getDay();
  const isFreeDayOfWeek = kstDay === 1 || kstDay === 3 || kstDay === 5;
  const isFreeMail = mailPrice === 430 && isFreeDayOfWeek && now <= new Date('2026-12-31T23:59:59');
  const effectiveMailPrice = isFreeMail ? 0 : mailPrice;

  // 할인 금액 계산
  const discountAmount = getDiscountAmount(effectiveMailPrice + effectiveStationeryPrice + pagePrice + photoPrice + documentPrice + giftPrice);

  // 총 비용 계산 (할인 적용)
  const totalPrice = effectiveMailPrice + effectiveStationeryPrice + pagePrice + photoPrice + documentPrice + giftPrice - discountAmount;

  // 선택된 추가 옵션 목록
  const selectedItemNames = selectedAdditionalItems
    .filter((id) => resolvedAdditionalItemsInfo[id]?.title !== '내 문서 동봉')
    .map((id) => resolvedAdditionalItemsInfo[id]?.title)
    .filter(Boolean);

  // 포인트로 결제 가능한지 확인
  const canPayWithPoints = effectivePointBalance >= totalPrice;

  const handlePaymentClick = () => {
    if (paymentMethod === "points") {
      onPayment();
    } else if (onTossPayment) {
      onTossPayment();
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2.5">
        <CreditCard className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-base font-semibold text-foreground">결제 요금서</h2>
          <p className="text-muted-foreground text-xs">선택하신 내용을 확인하고 결제를 진행해주세요</p>
        </div>
      </div>

      {/* 흰색 라운딩 박스 - 메인 컨테이너 */}
      <div className="bg-card rounded-3xl p-4 sm:p-6 shadow-lg border border-border/50 space-y-4 sm:space-y-6">
        {/* 받는 분 */}
        <div className="bg-muted/30 rounded-2xl p-3 sm:p-4">
          <p className="font-medium text-muted-foreground text-xs mb-0.5 sm:mb-1">받는 분</p>
          <p className="text-foreground font-semibold text-sm sm:text-base">
            {formatRecipientDisplay(
              recipientName,
              recipientFacility,
              recipientPrisonerNumber,
              recipientFacilityAddress,
            )}
          </p>
        </div>

        {/* 선택 내역 */}
        <div>
          <h3 className="font-semibold text-foreground text-sm sm:text-base mb-3 sm:mb-4">선택 내역</h3>

          <div className="border-y border-border divide-y divide-border">
            <div className="flex items-center justify-between py-2.5 sm:py-4">
              <div>
                <p className="font-medium text-foreground text-sm sm:text-base">편지지</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  기본구성 봉투 + 편지지 {LETTER_PAGE_FREE_COUNT}장
                </p>
              </div>
              <span className={cn(
                "font-medium text-sm sm:text-base",
                effectiveStationeryPrice > 0 ? "text-primary" : "text-foreground"
              )}>
                {effectiveStationeryPrice > 0 ? `${effectiveStationeryPrice.toLocaleString()}원` : "무료"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 sm:py-4">
              <div>
                <p className="font-medium text-foreground text-sm sm:text-base">편지 추가 분량</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {extraPages > 0
                    ? `초과 ${extraPages}장 x ${LETTER_EXTRA_PAGE_PRICE.toLocaleString()}원`
                    : `초과 0장 x ${LETTER_EXTRA_PAGE_PRICE.toLocaleString()}원`}
                </p>
              </div>
              <span className={cn(
                "font-medium text-sm sm:text-base",
                pagePrice > 0 ? "text-primary" : "text-foreground"
              )}>
                {pagePrice > 0 ? `${pagePrice.toLocaleString()}원` : "무료"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 sm:py-4">
              <div>
                <p className="font-medium text-foreground text-sm sm:text-base">사진 인화</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  4x6 인치{photos.length > 0 ? ` • ${photos.length}장 x 500원` : ''}
                </p>
              </div>
              <span className={cn(
                "font-medium text-sm sm:text-base",
                photos.length > 0 ? "text-primary" : "text-foreground"
              )}>
                {photos.length > 0 ? `${photoPrice.toLocaleString()}원` : "없음"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 sm:py-4">
              <div>
                <p className="font-medium text-foreground text-sm sm:text-base">문서 동봉</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  흑백 장당 {DOCUMENT_BLACK_WHITE_UNIT_PRICE.toLocaleString()}원 · 컬러 장당 {DOCUMENT_COLOR_UNIT_PRICE.toLocaleString()}원
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {userDocuments.length > 0
                    ? `${documentSummary.totalDocumentCount}개 문서 · 총 ${documentSummary.totalPages}장`
                    : "선택 없음"}
                </p>
                {userDocuments.length > 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {[
                      documentSummary.blackWhitePages > 0
                        ? `${DOCUMENT_PRINT_MODE_LABELS.BLACK_WHITE} ${documentSummary.blackWhitePages}장`
                        : null,
                      documentSummary.colorPages > 0
                        ? `${DOCUMENT_PRINT_MODE_LABELS.COLOR} ${documentSummary.colorPages}장`
                        : null,
                    ].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <span className={cn(
                "font-medium text-sm sm:text-base",
                userDocuments.length > 0 ? "text-primary" : "text-foreground"
              )}>
                {userDocuments.length > 0 ? `${documentPrice.toLocaleString()}원` : "없음"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 sm:py-4">
              <div>
                <p className="font-medium text-foreground text-sm sm:text-base">동봉 자료</p>
                {selectedItemNames.length > 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground">{selectedItemNames.join(", ")}</p>
                )}
              </div>
              <span className="text-foreground font-medium text-sm sm:text-base">
                {selectedItemNames.length > 0 ? (giftPrice > 0 ? `${giftPrice.toLocaleString()}원` : "무료") : "없음"}
              </span>
            </div>
          </div>
        </div>

        {/* 우편 방법 선택 */}
        <div className="bg-muted/30 rounded-2xl p-3 sm:p-4">
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1.5 sm:mb-2">우편 종류</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">교정시설 우편은 내부 검수 절차로 인해 모든 방식의 실제 전달 속도는 비슷합니다.</p>
          </div>
          <div className="bg-card rounded-xl p-2 sm:p-3 border border-border/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {resolvedMailTypes.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onMailTypeChange(option.id, option.price)}
                  className={cn(
                    "relative p-2.5 sm:p-4 rounded-xl transition-all text-left bg-muted/20",
                    mailType === option.id
                      ? "border-2 border-primary bg-primary/5"
                      : "border border-border hover:border-primary/50"
                  )}
                >
                  {/* 라디오 버튼 스타일 */}
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0",
                      mailType === option.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/50"
                    )}>
                      {mailType === option.id && (
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-xs sm:text-base">{getMailTypeDisplayLabel(option)}</p>
                        {option.id === "준등기우편" && (
                          <span className="text-size-9 sm:text-xs bg-primary text-primary-foreground px-1 sm:px-1.5 py-0.5 rounded">추천</span>
                        )}
                        {option.id === "등기우편" && (
                          <span className="text-size-9 sm:text-xs bg-blue-500 text-white px-1 sm:px-1.5 py-0.5 rounded">안심</span>
                        )}
                      </div>
                      <p className="text-size-10 sm:text-sm text-muted-foreground">{option.deliveryTime}</p>
                    </div>
                    <p className="text-primary font-bold text-xs sm:text-base whitespace-nowrap">{option.price.toLocaleString()}원</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 결제 금액 요약 - 오렌지 스타일 */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-4 sm:p-6 space-y-2 sm:space-y-3 border border-orange-200/50 dark:border-orange-700/30">
          <div className="flex items-center justify-between text-sm sm:text-base">
            <span className="text-orange-700 dark:text-orange-300">편지지</span>
            <span className="text-orange-900 dark:text-orange-100">{effectiveStationeryPrice.toLocaleString()}원</span>
          </div>

          <div className="flex items-center justify-between text-sm sm:text-base">
            <span className="text-orange-700 dark:text-orange-300">편지 추가 분량</span>
            <span className="text-orange-900 dark:text-orange-100">{pagePrice.toLocaleString()}원</span>
          </div>

          <div className="flex items-center justify-between text-sm sm:text-base">
            <span className="text-orange-700 dark:text-orange-300">사진 인화</span>
            <span className="text-orange-900 dark:text-orange-100">{photoPrice.toLocaleString()}원</span>
          </div>

          <div className="flex items-center justify-between text-sm sm:text-base">
            <span className="text-orange-700 dark:text-orange-300">문서 동봉</span>
            <span className="text-orange-900 dark:text-orange-100">{documentPrice.toLocaleString()}원</span>
          </div>
          <p className="text-size-10 sm:text-xs text-orange-600 dark:text-orange-300">
            흑백 장당 {DOCUMENT_BLACK_WHITE_UNIT_PRICE.toLocaleString()}원 · 컬러 장당 {DOCUMENT_COLOR_UNIT_PRICE.toLocaleString()}원
          </p>

          {giftPrice > 0 && (
            <div className="flex items-center justify-between text-sm sm:text-base">
              <span className="text-orange-700 dark:text-orange-300">동봉 자료</span>
              <span className="text-orange-900 dark:text-orange-100">{giftPrice.toLocaleString()}원</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm sm:text-base">
            <span className="text-orange-700 dark:text-orange-300">우편료 ({getMailTypeDisplayLabel(selectedMailTypeOption) || mailType})</span>
            {isFreeMail ? (
              <span className="text-orange-900 dark:text-orange-100">
                <span className="line-through text-orange-400 mr-1.5">{mailPrice.toLocaleString()}원</span>
                <span className="text-green-600 font-semibold">무료</span>
              </span>
            ) : (
              <span className="text-orange-900 dark:text-orange-100">{mailPrice.toLocaleString()}원</span>
            )}
          </div>
          {isFreeMail && (
            <p className="text-size-10 sm:text-xs text-green-600 dark:text-green-400 font-medium">
              회원가입 감사 선물 - 일반우편 무료 (월·수·금 한정, 2026.12.31까지)
            </p>
          )}

          {/* 쿠폰 할인 */}
          {appliedDeal && discountAmount > 0 && (
            <div className="flex justify-between items-center text-sm sm:text-base">
              <div className="flex items-center gap-1.5">
                <span className="text-green-600">🎫</span>
                <span className="text-green-600">{appliedDeal.title}</span>
                <button onClick={removeDeal} className="text-neutral-400 hover:text-red-500 ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-green-600 font-medium">-{discountAmount.toLocaleString()}원</span>
            </div>
          )}

          {/* 구분선 */}
          <div className="border-t border-orange-200 dark:border-orange-700/50 my-2 sm:my-3" />

          {/* 최종 결제 금액 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-900 dark:text-orange-100 font-medium text-sm sm:text-base">최종 결제 금액</p>
              <p className="text-size-10 sm:text-xs text-orange-600 dark:text-orange-400">* 수익금의 일부는 교정 교화 활동에 기부됩니다</p>
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">{totalPrice.toLocaleString()}원</span>
          </div>
        </div>

        {/* 약관 동의 체크박스 */}
        <div className="bg-muted/30 rounded-xl p-3 sm:p-4">
          <label className="flex items-start gap-2.5 sm:gap-3 cursor-pointer">
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                  agreedToTerms
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/50 hover:border-primary"
                )}
              >
                {agreedToTerms && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
              </button>
            </div>
            <div className="flex-1 text-xs sm:text-sm text-muted-foreground">
              <span className="text-foreground font-medium">개인정보 수집·이용</span> 및{" "}
              <Link href="/terms" target="_blank" className="text-primary hover:underline inline-flex items-center gap-0.5">
                이용약관
                <ExternalLink className="w-3 h-3" />
              </Link>
              ,{" "}
              <Link href="/privacy" target="_blank" className="text-primary hover:underline inline-flex items-center gap-0.5">
                개인정보처리방침
                <ExternalLink className="w-3 h-3" />
              </Link>
              에 동의합니다.
            </div>
          </label>
        </div>

        {/* 결제 방법 선택 */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground text-sm sm:text-base">결제 방법</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* 카드 결제 */}
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={cn(
                "relative p-3 sm:p-4 rounded-xl transition-all text-left",
                paymentMethod === "card"
                  ? "border-2 border-primary bg-primary/5"
                  : "border border-border hover:border-primary/50 bg-muted/20"
              )}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                  paymentMethod === "card"
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/50"
                )}>
                  {paymentMethod === "card" && (
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground text-sm sm:text-base">결제하기</span>
                  </div>
                  <p className="text-size-10 sm:text-xs text-muted-foreground mt-0.5">신용/체크카드</p>
                </div>
              </div>
            </button>

            {/* 포인트 결제 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => canPayWithPoints && setPaymentMethod("points")}
                disabled={!canPayWithPoints}
                className={cn(
                  "w-full relative p-3 sm:p-4 rounded-xl transition-all text-left",
                  paymentMethod === "points"
                    ? "border-2 border-primary bg-primary/5"
                    : canPayWithPoints
                      ? "border border-border hover:border-primary/50 bg-muted/20"
                      : "border border-border bg-muted/10 opacity-60 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    paymentMethod === "points"
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/50"
                  )}>
                    {paymentMethod === "points" && (
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                      <span className="font-medium text-foreground text-sm sm:text-base">포인트 결제</span>
                    </div>
                    <div className="text-size-10 sm:text-xs mt-0.5">
                      {isLoadingPoints || isLoadingBalance ? (
                        <span className="text-muted-foreground">로딩 중...</span>
                      ) : canPayWithPoints ? (
                        <span className="text-orange-600">보유 {effectivePointBalance.toLocaleString()}P</span>
                      ) : (
                        <span className="text-red-500">잔액 부족 ({effectivePointBalance.toLocaleString()}P)</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
              {/* 충전 버튼 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPointCharge(!showPointCharge);
                }}
                className={cn(
                  "absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center rounded-full text-white shadow-md transition-colors",
                  showPointCharge
                    ? "bg-gray-500 hover:bg-gray-600"
                    : "bg-orange-500 hover:bg-orange-600"
                )}
                title={showPointCharge ? "충전 닫기" : "포인트 충전"}
              >
                {showPointCharge ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 포인트 충전 아코디언 */}
          <AnimatePresence>
            {showPointCharge && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-4 border border-orange-200/50 dark:border-orange-700/30 space-y-4">
                  {/* 헤더 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-orange-500" />
                      <h4 className="font-semibold text-foreground">포인트 충전</h4>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">현재 </span>
                      <span className="font-bold text-orange-600">{effectivePointBalance.toLocaleString()}P</span>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {!showChargePayment ? (
                      <motion.div
                        key="amount-selection"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-3"
                      >
                        {/* 충전 금액 선택 */}
                        <div className="grid grid-cols-1 gap-2">
                          {POINT_CHARGE_PRESETS.map((preset) => (
                            <button
                              key={preset.value}
                              onClick={() => setSelectedChargeAmount(preset.value)}
                              className={cn(
                                "relative p-3 rounded-xl border-2 transition-all text-left",
                                selectedChargeAmount === preset.value
                                  ? "border-orange-500 bg-orange-100/50 dark:bg-orange-900/30"
                                  : "border-transparent bg-white dark:bg-gray-800 hover:border-orange-300"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                    selectedChargeAmount === preset.value
                                      ? "border-orange-500 bg-orange-500"
                                      : "border-gray-300 dark:border-gray-600"
                                  )}>
                                    {selectedChargeAmount === preset.value && (
                                      <Check className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <span className="font-bold text-foreground">{preset.label}</span>
                                </div>
                                <span className="text-sm text-orange-500 font-medium">
                                  {preset.bonusLabel}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* 충전 정보 요약 */}
                        {selectedChargeAmount && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-3 space-y-2"
                          >
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">결제 금액</span>
                              <span className="font-semibold text-foreground">
                                {chargeAmount.toLocaleString()}원
                              </span>
                            </div>
                            {bonusAmount > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">보너스 포인트</span>
                                <span className="font-semibold text-orange-500">
                                  +{bonusAmount.toLocaleString()}P
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                              <span className="text-muted-foreground">총 충전 포인트</span>
                              <span className="font-bold text-orange-600 text-lg">
                                {totalChargePoints.toLocaleString()}P
                              </span>
                            </div>
                          </motion.div>
                        )}

                        {/* 결제하기 버튼 */}
                        <Button
                          onClick={handleProceedToChargePayment}
                          disabled={!isValidChargeAmount}
                          className="w-full py-4 text-base font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300"
                        >
                          <CreditCard className="w-5 h-5 mr-2" />
                          {chargeAmount > 0
                            ? `${chargeAmount.toLocaleString()}원 결제하기`
                            : '충전 금액을 선택하세요'}
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="payment-widget"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-3"
                      >
                        {/* 결제 정보 요약 */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">총 충전 포인트</p>
                              <p className="text-lg font-bold text-orange-600">
                                {totalChargePoints.toLocaleString()}P
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">결제 금액</p>
                              <p className="text-lg font-bold text-foreground">
                                {chargeAmount.toLocaleString()}원
                              </p>
                            </div>
                          </div>
                          {bonusAmount > 0 && (
                            <div className="text-center text-sm text-orange-600 font-medium bg-orange-100 dark:bg-orange-800/30 rounded-lg py-1.5 mt-2">
                              보너스 +{bonusAmount.toLocaleString()}P 포함
                            </div>
                          )}
                        </div>

                        {/* 토스 결제 위젯 */}
                        <PointChargeTossWidget
                          amount={chargeAmount}
                          orderId={chargeOrderId}
                          orderName={`포인트 ${totalChargePoints.toLocaleString()}P 충전`}
                          customerName={user?.email?.split('@')[0] || '고객'}
                          customerEmail={user?.email || undefined}
                          onCancel={() => setShowChargePayment(false)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 결제 버튼 */}
        {!showTossWidget && (
          <Button
            onClick={handlePaymentClick}
            disabled={isProcessing || !agreedToTerms || (paymentMethod === "points" && !canPayWithPoints)}
            className={cn(
              "w-full py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-2xl disabled:opacity-50",
              paymentMethod === "points"
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                결제 처리 중...
              </>
            ) : paymentMethod === "points" ? (
              <>
                <Coins className="w-5 h-5 mr-2" />
                {totalPrice.toLocaleString()}P로 결제하기
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                {totalPrice.toLocaleString()}원 결제하기
              </>
            )}
          </Button>
        )}

        {/* 토스 결제 위젯 아코디언 */}
        <AnimatePresence>
          {showTossWidget && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-muted/30 rounded-2xl p-4 sm:p-6 border border-border/50 space-y-4">
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span className="font-semibold text-foreground text-sm sm:text-base">결제 수단 선택</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-primary">
                    {tossOrderInfo?.totalAmount?.toLocaleString()}원
                  </span>
                </div>

                {/* 토스 결제 위젯 */}
                {tossOrderInfo && (
                  <TossPaymentWidget
                    amount={tossOrderInfo.totalAmount}
                    orderId={tossOrderInfo.letterId}
                    orderName={tossOrderInfo.orderName}
                    customerName={customerName || "고객"}
                    customerPhone={customerPhone}
                    onReady={onTossWidgetReady}
                    onError={onTossWidgetError}
                  />
                )}

                {/* 취소 버튼 */}
                {onTossWidgetClose && (
                  <button
                    type="button"
                    onClick={onTossWidgetClose}
                    className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    취소
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 안내 메시지 */}
        <div className="bg-muted/50 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            결제 완료 후 편지가 발송됩니다. 취소는 발송 전까지 가능합니다.
          </p>
        </div>
      </div>

    </div>
  );
}

// 포인트 충전용 토스 결제 위젯
function PointChargeTossWidget({
  amount,
  orderId,
  orderName,
  customerName,
  customerEmail,
  onCancel,
}: {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  customerEmail?: string;
  onCancel?: () => void;
}) {
  const [widgets, setWidgets] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const instanceIdRef = useRef(`point-charge-accordion-${Date.now()}`);
  const paymentMethodId = `toss-payment-method-${instanceIdRef.current}`;
  const agreementId = `toss-agreement-${instanceIdRef.current}`;
  const hasRenderedRef = useRef(false);

  useEffect(() => {
    async function initWidgets() {
      try {
        const { loadTossPayments, ANONYMOUS } = await import('@tosspayments/tosspayments-sdk');
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
        if (!clientKey) {
          throw new Error('토스 클라이언트 키가 설정되지 않았습니다.');
        }

        const tossPayments = await loadTossPayments(clientKey);
        const w = tossPayments.widgets({ customerKey: ANONYMOUS });
        setWidgets(w);
      } catch (error) {
        console.error('토스 위젯 초기화 오류:', error);
        toast.error('결제 위젯 초기화에 실패했습니다.');
      }
    }
    initWidgets();

    return () => {
      const paymentEl = document.getElementById(paymentMethodId);
      const agreementEl = document.getElementById(agreementId);
      if (paymentEl) paymentEl.innerHTML = '';
      if (agreementEl) agreementEl.innerHTML = '';
    };
  }, []);

  useEffect(() => {
    if (!widgets || hasRenderedRef.current) return;

    async function renderWidgets() {
      try {
        await widgets.setAmount({ currency: 'KRW', value: amount });

        await Promise.all([
          widgets.renderPaymentMethods({
            selector: `#${paymentMethodId}`,
            variantKey: 'DEFAULT',
          }),
          widgets.renderAgreement({
            selector: `#${agreementId}`,
            variantKey: 'AGREEMENT',
          }),
        ]);

        hasRenderedRef.current = true;
        setReady(true);
      } catch (error) {
        if (!hasRenderedRef.current) {
          console.error('토스 위젯 렌더링 오류:', error);
        }
      }
    }

    renderWidgets();
  }, [widgets, amount]);

  const handlePayment = async () => {
    if (!widgets || isProcessing) return;

    setIsProcessing(true);
    try {
      const returnUrl = encodeURIComponent(window.location.href);
      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success?type=point-charge&returnUrl=${returnUrl}`,
        failUrl: `${window.location.origin}/payment/fail?type=point-charge&orderId=${encodeURIComponent(orderId)}&returnUrl=${returnUrl}`,
        customerName,
        customerEmail: customerEmail || undefined,
      });
    } catch (error) {
      console.error('결제 요청 오류:', error);
      toast.error('결제 요청에 실패했습니다.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div id={paymentMethodId} className="min-h-[200px] bg-white dark:bg-gray-800 rounded-xl overflow-hidden" />
      <div id={agreementId} className="min-h-[50px]" />
      <Button
        onClick={handlePayment}
        disabled={!ready || isProcessing}
        className="w-full py-4 text-base font-semibold rounded-xl bg-orange-500 hover:bg-orange-600"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            결제 처리 중...
          </>
        ) : !ready ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            결제 준비 중...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            {amount.toLocaleString()}원 결제하기
          </>
        )}
      </Button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full py-2 text-muted-foreground hover:text-foreground font-medium transition-colors disabled:opacity-50"
        >
          금액 변경
        </button>
      )}
    </div>
  );
}
