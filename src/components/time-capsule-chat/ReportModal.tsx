"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle } from "lucide-react";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    timeCapsuleId: string;
}

const REASONS = [
    { value: "inappropriate", label: "부적절한 콘텐츠" },
    { value: "spam", label: "스팸/광고" },
    { value: "harassment", label: "괴롭힘/따돌림" },
    { value: "fraud", label: "사기/허위 정보" },
    { value: "other", label: "기타" },
] as const;

export function ReportModal({ isOpen, onClose, timeCapsuleId }: ReportModalProps) {
    const [reason, setReason] = useState<string>("");
    const [detail, setDetail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!reason) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`/api/v1/time-capsules/${timeCapsuleId}/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason, detail: detail || undefined }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "신고 처리 중 오류가 발생했습니다.");
                return;
            }

            setSubmitted(true);
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch {
            setError("네트워크 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setReason("");
        setDetail("");
        setSubmitted(false);
        setError(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-white rounded-[32px] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-14 pb-3">
                        <h2 className="text-lg font-bold text-foreground">신고하기</h2>
                        <button
                            onClick={handleClose}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>

                    {submitted ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
                            <CheckCircle className="w-16 h-16 text-green-500" />
                            <p className="text-lg font-semibold text-foreground">신고가 접수되었습니다</p>
                            <p className="text-sm text-muted-foreground text-center">
                                검토 후 적절한 조치를 취하겠습니다.
                            </p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto px-5 pb-5">
                            {/* Warning */}
                            <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 mb-5">
                                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-700">
                                    허위 신고는 제재를 받을 수 있습니다. 신중하게 신고해 주세요.
                                </p>
                            </div>

                            {/* Reason Selection */}
                            <p className="text-sm font-medium text-foreground mb-3">신고 사유를 선택해 주세요</p>
                            <div className="space-y-2 mb-5">
                                {REASONS.map((r) => (
                                    <button
                                        type="button"
                                        key={r.value}
                                        onClick={() => setReason(r.value)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors w-full text-left ${
                                            reason === r.value
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:bg-muted/50"
                                        }`}
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                reason === r.value ? "border-primary" : "border-muted-foreground/30"
                                            }`}
                                        >
                                            {reason === r.value && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <span className="text-sm text-foreground">{r.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Detail textarea for "other" */}
                            {reason === "other" && (
                                <div className="mb-5">
                                    <p className="text-sm font-medium text-foreground mb-2">상세 내용</p>
                                    <textarea
                                        value={detail}
                                        onChange={(e) => setDetail(e.target.value)}
                                        placeholder="신고 사유를 자세히 작성해 주세요..."
                                        className="w-full h-28 px-4 py-3 border border-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    />
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <p className="text-sm text-destructive mb-4">{error}</p>
                            )}

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={!reason || isSubmitting}
                                className="w-full py-3 rounded-xl bg-destructive text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-destructive/90 transition-colors"
                            >
                                {isSubmitting ? "처리 중..." : "신고하기"}
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
