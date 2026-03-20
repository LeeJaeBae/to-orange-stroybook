'use client';

import { useEffect, useRef, useState, useId } from 'react';
import type { TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';

interface TossPaymentWidgetProps {
    amount: number;
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    successUrl?: string;
    failUrl?: string;
    buttonLabel?: string;
    onReady?: () => void;
    onError?: (error: Error) => void;
}

export function TossPaymentWidget({
    amount,
    orderId,
    orderName,
    customerName,
    customerEmail,
    customerPhone,
    successUrl,
    failUrl,
    buttonLabel,
    onReady,
    onError,
}: TossPaymentWidgetProps) {
    // 고유 ID 생성 (컴포넌트 인스턴스마다 다른 ID 사용)
    const instanceId = useId().replace(/:/g, '');
    const paymentMethodId = `toss-payment-method-${instanceId}`;
    const agreementId = `toss-agreement-${instanceId}`;

    const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
    const [ready, setReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const paymentMethodRef = useRef<HTMLDivElement>(null);
    const agreementRef = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        // 이미 초기화되었으면 스킵
        if (isInitialized.current) return;
        isInitialized.current = true;

        async function initWidgets() {
            try {
                const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
                if (!clientKey) {
                    throw new Error('토스 클라이언트 키가 설정되지 않았습니다.');
                }

                const { loadTossPayments, ANONYMOUS } = await import('@tosspayments/tosspayments-sdk');
                const tossPayments = await loadTossPayments(clientKey);

                // 비회원 결제 (ANONYMOUS 사용)
                const w = tossPayments.widgets({ customerKey: ANONYMOUS });
                setWidgets(w);
            } catch (error) {
                console.error('토스 위젯 초기화 오류:', error);
                onError?.(error instanceof Error ? error : new Error('위젯 초기화 실패'));
            }
        }
        initWidgets();

        // 클린업: 컴포넌트 언마운트 시 DOM 정리
        return () => {
            isInitialized.current = false;
            // DOM 요소 정리
            if (paymentMethodRef.current) {
                paymentMethodRef.current.innerHTML = '';
            }
            if (agreementRef.current) {
                agreementRef.current.innerHTML = '';
            }
        };
    }, []);

    useEffect(() => {
        if (!widgets) return;

        async function renderWidgets() {
            try {
                // 금액 설정
                await widgets.setAmount({ currency: 'KRW', value: amount });

                // 결제 수단 및 약관 렌더링 (고유 ID 사용)
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

                setReady(true);
                onReady?.();
            } catch (error) {
                console.error('토스 위젯 렌더링 오류:', error);
                onError?.(error instanceof Error ? error : new Error('위젯 렌더링 실패'));
            }
        }

        renderWidgets();
    }, [widgets, amount, paymentMethodId, agreementId, onReady, onError]);

    const handlePayment = async () => {
        if (!widgets || isProcessing) return;

        setIsProcessing(true);
        try {
            await widgets.requestPayment({
                orderId,
                orderName,
                successUrl: successUrl || `${window.location.origin}/payment/success`,
                failUrl: failUrl || `${window.location.origin}/payment/fail?orderId=${encodeURIComponent(orderId)}`,
                customerName,
                customerEmail: customerEmail || undefined,
                customerMobilePhone: customerPhone?.replace(/-/g, '') || undefined,
            });
        } catch (error) {
            console.error('결제 요청 오류:', error);
            onError?.(error instanceof Error ? error : new Error('결제 요청 실패'));
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* 결제 수단 선택 영역 */}
            <div
                id={paymentMethodId}
                ref={paymentMethodRef}
                className="min-h-[200px]"
            />

            {/* 약관 동의 영역 */}
            <div
                id={agreementId}
                ref={agreementRef}
                className="min-h-[50px]"
            />

            {/* 결제 버튼 */}
            <Button
                onClick={handlePayment}
                disabled={!ready || isProcessing}
                className="w-full py-6 text-lg font-semibold rounded-2xl bg-primary hover:bg-primary/90"
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
                        {buttonLabel || `${amount.toLocaleString()}원 결제하기`}
                    </>
                )}
            </Button>
        </div>
    );
}
