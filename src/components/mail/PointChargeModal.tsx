'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, CreditCard, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePointsHook } from '@/hooks/usePoints';
import { toast } from 'sonner';

const PRESET_AMOUNTS = [
    { value: 30000, label: '30,000P', bonus: 900, bonusLabel: '+900P (3%)' },
    { value: 50000, label: '50,000P', bonus: 2500, bonusLabel: '+2,500P (5%)' },
    { value: 100000, label: '100,000P', bonus: 10000, bonusLabel: '+10,000P (10%)' },
];

interface PointChargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onChargeSuccess?: () => void;
}

export function PointChargeModal({ isOpen, onClose, onChargeSuccess }: PointChargeModalProps) {
    const { user } = useAuth();
    const { balance, isLoadingBalance } = usePointsHook();

    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [orderId, setOrderId] = useState('');

    // 모달이 닫힐 때 상태 초기화
    useEffect(() => {
        if (!isOpen) {
            setSelectedAmount(null);
            setShowPayment(false);
            setOrderId('');
        }
    }, [isOpen]);

    // 선택된 프리셋 정보
    const selectedPreset = PRESET_AMOUNTS.find(p => p.value === selectedAmount);
    const chargeAmount = selectedAmount || 0;
    const bonusAmount = selectedPreset?.bonus || 0;
    const totalPoints = chargeAmount + bonusAmount;
    const isValidAmount = chargeAmount > 0;

    // 결제 진행 핸들러
    const handleProceedToPayment = () => {
        if (!user) {
            toast.error('로그인이 필요합니다.');
            return;
        }

        if (!isValidAmount) {
            toast.error('충전 금액을 선택해주세요.');
            return;
        }

        // orderId 생성: point-charge-{userId}-{timestamp}
        const newOrderId = `point-charge-${user.id}-${Date.now()}`;
        setOrderId(newOrderId);
        setShowPayment(true);
    };

    // 프리셋 선택
    const handlePresetSelect = (amount: number) => {
        setSelectedAmount(amount);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center"
                onClick={onClose}
            >
                {/* 배경 오버레이 */}
                <div className="absolute inset-0 bg-black/50" />

                {/* 모달 컨텐츠 */}
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="relative z-10 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
                        {/* 헤더 */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <Coins className="w-5 h-5 text-orange-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">포인트 충전</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {!showPayment ? (
                                <motion.div
                                    key="amount-selection"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-4 space-y-4"
                                >
                                    {/* 현재 보유 포인트 */}
                                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                                <Coins className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/80">현재 보유 포인트</p>
                                                <p className="text-xl font-bold">
                                                    {isLoadingBalance ? (
                                                        <Loader2 className="w-5 h-5 animate-spin inline" />
                                                    ) : (
                                                        `${balance.toLocaleString()}P`
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 충전 금액 선택 */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">충전 금액 선택</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {PRESET_AMOUNTS.map((preset) => (
                                                <button
                                                    key={preset.value}
                                                    onClick={() => handlePresetSelect(preset.value)}
                                                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                                                        selectedAmount === preset.value
                                                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                                selectedAmount === preset.value
                                                                    ? 'border-orange-500 bg-orange-500'
                                                                    : 'border-gray-300 dark:border-gray-600'
                                                            }`}>
                                                                {selectedAmount === preset.value && (
                                                                    <Check className="w-3 h-3 text-white" />
                                                                )}
                                                            </div>
                                                            <span className="font-bold text-gray-900 dark:text-white">{preset.label}</span>
                                                        </div>
                                                        {preset.bonusLabel && (
                                                            <span className="text-sm text-orange-500 font-medium">
                                                                {preset.bonusLabel}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 충전 정보 요약 */}
                                    {selectedAmount && (
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">결제 금액</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {chargeAmount.toLocaleString()}원
                                                </span>
                                            </div>
                                            {bonusAmount > 0 && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">보너스 포인트</span>
                                                    <span className="font-semibold text-orange-500">
                                                        +{bonusAmount.toLocaleString()}P
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <span className="text-gray-600 dark:text-gray-400">총 충전 포인트</span>
                                                <span className="font-bold text-orange-600 text-lg">
                                                    {totalPoints.toLocaleString()}P
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* 결제하기 버튼 */}
                                    <Button
                                        onClick={handleProceedToPayment}
                                        disabled={!isValidAmount}
                                        className="w-full py-5 text-base font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300"
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
                                    className="p-4 space-y-4"
                                >
                                    {/* 결제 정보 요약 */}
                                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                                    <Coins className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">총 충전 포인트</p>
                                                    <p className="text-lg font-bold text-orange-600">
                                                        {totalPoints.toLocaleString()}P
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">결제 금액</p>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {chargeAmount.toLocaleString()}원
                                                </p>
                                            </div>
                                        </div>
                                        {bonusAmount > 0 && (
                                            <div className="text-center text-sm text-orange-600 font-medium bg-orange-100 dark:bg-orange-800/30 rounded-lg py-2 mt-3">
                                                보너스 +{bonusAmount.toLocaleString()}P 포함
                                            </div>
                                        )}
                                    </div>

                                    {/* 토스 결제 위젯 */}
                                    <TossPaymentWidgetWrapper
                                        amount={chargeAmount}
                                        orderId={orderId}
                                        orderName={`포인트 ${totalPoints.toLocaleString()}P 충전`}
                                        customerName={user?.email?.split('@')[0] || '고객'}
                                        customerEmail={user?.email || undefined}
                                        onCancel={() => setShowPayment(false)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// 토스 결제 위젯 래퍼
function TossPaymentWidgetWrapper({
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
    const instanceIdRef = useRef(`point-charge-modal-${Date.now()}`);
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
                // 이미 렌더링 성공했으면 에러 무시
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
            // 현재 페이지 URL을 returnUrl로 저장하여 충전 후 돌아올 수 있게 함
            const returnUrl = encodeURIComponent(window.location.href);
            await widgets.requestPayment({
                orderId,
                orderName,
                // 포인트 충전용 성공/실패 URL (type=point-charge 파라미터 포함)
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
        <div className="space-y-4">
            <div id={paymentMethodId} className="min-h-[200px]" />
            <div id={agreementId} className="min-h-[50px]" />
            <Button
                onClick={handlePayment}
                disabled={!ready || isProcessing}
                className="w-full py-5 text-base font-semibold rounded-xl bg-orange-500 hover:bg-orange-600"
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
                    className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors disabled:opacity-50"
                >
                    금액 변경
                </button>
            )}
        </div>
    );
}
