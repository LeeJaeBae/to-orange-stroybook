"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Coffee, Citrus, Shirt, BookOpen, Coins, Plus, ArrowLeft, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { OrangeSphere } from "./OrangeSphere";
import { useAuth } from "@/hooks/useAuth";

interface Gift {
  id: string;
  Icon: typeof Coffee;
  name: string;
  description: string;
  price: number;
  exampleMessage?: string;
}

const gifts: Gift[] = [
  { id: "coffee", Icon: Coffee, name: "커피 한잔", description: "따뜻한 마음을 전해요", price: 5500, exampleMessage: "커피 한잔이 출소후 큰 힘이됩니다." },
  { id: "orange", Icon: Citrus, name: "오렌지 나무", description: "오렌지 하나를 선물해요", price: 10000, exampleMessage: "건강한 오렌지처럼 활력 넘치는 하루 보내세요!" },
  { id: "clothes", Icon: Shirt, name: "출소복", description: "새 출발을 응원해요", price: 50000, exampleMessage: "새 출발을 진심으로 응원합니다!" },
  { id: "book", Icon: BookOpen, name: "도서", description: "지식과 위로를 전해요", price: 15000, exampleMessage: "좋은 책 한권이 위로가 되길 바랍니다." },
];

const chargeAmounts = [5000, 10000, 30000, 50000, 100000];

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendGift: (gift: { id: string; name: string; message?: string }) => Promise<{ remainingPoints: number }>;
  initialPoints?: number;
  onPointsUpdate?: (newPoints: number) => void;
}

export function GiftModal({ isOpen, onClose, onSendGift, initialPoints = 0, onPointsUpdate }: GiftModalProps) {
  const { user } = useAuth();
  const [points, setPoints] = useState(initialPoints);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [view, setView] = useState<"gifts" | "detail" | "charge" | "payment">("gifts");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [giftMessage, setGiftMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // initialPoints가 변경되면 points 업데이트
  useEffect(() => {
    setPoints(initialPoints);
  }, [initialPoints]);

  const formatPoints = (p: number) => p.toLocaleString() + "P";

  const handleSelectGift = (gift: Gift) => {
    setSelectedGift(gift);
    setGiftMessage("");
    setView("detail");
  };

  const handleSendGift = async () => {
    if (!selectedGift) return;
    setIsProcessing(true);

    try {
      const data = await onSendGift({
        id: selectedGift.id,
        name: selectedGift.name,
        message: giftMessage,
      });

      toast.success(`${selectedGift.name}을(를) 선물했어요!`);
      const newPoints = data.remainingPoints;
      setPoints(newPoints);
      onPointsUpdate?.(newPoints);
      setSelectedGift(null);
      setGiftMessage("");
      setView("gifts");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "선물 전송에 실패했습니다");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToCharge = () => {
    setView("charge");
  };

  // 토스 결제 요청
  const handleTossPayment = useCallback(async () => {
    if (!selectedAmount || !user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    setIsProcessing(true);

    try {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        throw new Error("토스 클라이언트 키가 설정되지 않았습니다.");
      }

      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });

      // 주문 ID 생성 (포인트 충전용)
      const orderId = `point-charge-${user.id}-${Date.now()}`;

      // 결제 요청
      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: selectedAmount,
        },
        orderId,
        orderName: `포인트 ${selectedAmount.toLocaleString()}P 충전`,
        successUrl: `${window.location.origin}/payment/success?type=point-charge`,
        failUrl: `${window.location.origin}/payment/fail?type=point-charge`,
        customerEmail: user.email || undefined,
        customerName: user.user_metadata?.name || "고객",
      });
    } catch (error) {
      console.error("토스 결제 요청 오류:", error);
      if (error instanceof Error && error.message !== "USER_CANCEL") {
        toast.error("결제 요청 중 오류가 발생했습니다.");
      }
      setIsProcessing(false);
    }
  }, [selectedAmount, user]);

  const handleBack = () => {
    if (view === "payment") {
      setView("charge");
    } else if (view === "charge") {
      if (selectedGift) {
        setView("detail");
      } else {
        setView("gifts");
      }
      setSelectedAmount(null);
    } else if (view === "detail") {
      setView("gifts");
      setSelectedGift(null);
      setGiftMessage("");
    }
  };

  const handleClose = () => {
    setView("gifts");
    setSelectedGift(null);
    setSelectedAmount(null);
    setGiftMessage("");
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  const canAfford = selectedGift ? points >= selectedGift.price : false;
  const remainingAfterPurchase = selectedGift ? points - selectedGift.price : points;
  const shortfall = selectedGift ? selectedGift.price - points : 0;

  return (
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-center z-50 rounded-[32px]"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-t-[32px] w-full max-w-[420px] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {view === "gifts" && (
          <>
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <OrangeSphere size="sm" />
                <div>
                  <h2 className="font-bold text-foreground">선물 보내기</h2>
                  <p className="text-xs text-muted-foreground">마음을 담아 선물해보세요</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center justify-between bg-muted/50 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">보유 포인트</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">{formatPoints(points)}</span>
                  <button
                    onClick={() => { setSelectedGift(null); setView("charge"); }}
                    className="w-6 h-6 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>
            <div className="px-5 pb-4 grid grid-cols-2 gap-3">
              {gifts.map((gift) => {
                const giftCanAfford = points >= gift.price;
                return (
                  <button
                    key={gift.id}
                    onClick={() => handleSelectGift(gift)}
                    className="relative p-4 rounded-2xl text-left transition-all bg-muted/50 hover:bg-muted"
                  >
                    <gift.Icon className="w-8 h-8 mb-3 text-foreground" />
                    <p className="font-semibold text-sm text-foreground">{gift.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{gift.description}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground">
                        {formatPoints(gift.price)}
                      </p>
                      {!giftCanAfford && (
                        <span className="text-size-10 text-destructive font-medium">잔액부족</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="h-6" />
          </>
        )}

        {view === "detail" && selectedGift && (
          <>
            {/* Header */}
            <div className="bg-primary text-white p-5 flex items-center justify-between">
              <h2 className="font-bold text-lg">선물하기</h2>
              <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Gift Card */}
            <div className="px-5 py-4">
              <div className="bg-secondary/50 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <selectedGift.Icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedGift.name}</p>
                  <p className="text-primary font-bold">{formatPoints(selectedGift.price)}</p>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="px-5 pb-4">
              <p className="text-sm font-medium text-foreground mb-2">함께 마음을 전할 메시지를 입력해주세요</p>
              <p className="text-xs text-primary mb-3">{selectedGift.exampleMessage}</p>
              <textarea
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="메시지를 입력해주세요"
                className="w-full h-28 p-4 rounded-xl border border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none text-sm"
              />
            </div>

            {/* Divider */}
            <div className="mx-5 border-t border-border" />

            {/* Points Summary */}
            <div className="px-5 py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">보유 포인트</span>
                <span className="text-foreground">{formatPoints(points)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">차감 포인트</span>
                <span className="text-primary">-{formatPoints(selectedGift.price)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2">
                <span className="text-foreground">결제 후 잔액</span>
                <span className={canAfford ? "text-primary" : "text-destructive"}>
                  {canAfford ? formatPoints(remainingAfterPurchase) : `${formatPoints(shortfall)} 부족`}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-5 pb-8 flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 py-4 rounded-full font-semibold text-sm border border-border text-foreground hover:bg-muted transition-all"
              >
                취소
              </button>
              {canAfford ? (
                <button
                  onClick={handleSendGift}
                  className="flex-1 py-4 rounded-full font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition-all"
                >
                  선물하기
                </button>
              ) : (
                <button
                  onClick={handleGoToCharge}
                  className="flex-1 py-4 rounded-full font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition-all"
                >
                  충전하러가기
                </button>
              )}
            </div>
          </>
        )}

        {view === "charge" && (
          <>
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <button onClick={handleBack} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <div>
                  <h2 className="font-bold text-foreground">포인트 충전</h2>
                  <p className="text-xs text-muted-foreground">충전할 금액을 선택해주세요</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center justify-between bg-muted/50 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">현재 보유</span>
                </div>
                <span className="text-lg font-bold text-primary">{formatPoints(points)}</span>
              </div>
              {selectedGift && points < selectedGift.price && (
                <p className="text-xs text-destructive mt-2 text-center">
                  {selectedGift.name} 선물을 위해 {formatPoints(selectedGift.price - points)} 추가 필요
                </p>
              )}
            </div>
            <div className="px-5 pb-4 space-y-2">
              {chargeAmounts.map((amount) => {
                const isSelected = selectedAmount === amount;
                return (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={`
                      w-full p-4 rounded-xl flex items-center justify-between transition-all
                      ${isSelected
                        ? 'bg-primary/10 ring-2 ring-primary'
                        : 'bg-muted/50 hover:bg-muted'}
                    `}
                  >
                    <span className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {amount.toLocaleString()}원
                    </span>
                    <span className={`text-sm ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                      +{formatPoints(amount)}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="px-5 pb-8">
              <button
                onClick={handleTossPayment}
                disabled={!selectedAmount || isProcessing}
                className={`
                  w-full py-4 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2
                  ${selectedAmount && !isProcessing
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'}
                `}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    결제 준비 중...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    {selectedAmount ? `${selectedAmount.toLocaleString()}원 결제하기` : '충전 금액을 선택해주세요'}
                  </>
                )}
              </button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                토스페이먼츠로 안전하게 결제됩니다
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
