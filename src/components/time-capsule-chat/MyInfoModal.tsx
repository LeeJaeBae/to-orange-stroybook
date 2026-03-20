"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Phone, Users, Lock, Check, Loader2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { apiFetch } from "@/lib/api/fetch";

interface MyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 타임캡슐 멤버십에서 가져온 관계 정보
  relation?: string;
  // 관계 수정을 위한 타임캡슐 ID
  timeCapsuleId?: string;
  // 관계 수정 후 데이터 새로고침
  onRelationUpdated?: () => void;
}

export function MyInfoModal({ isOpen, onClose, relation, timeCapsuleId, onRelationUpdated }: MyInfoModalProps) {
  const { user } = useAuth();
  const { profile, isLoading: isProfileLoading, invalidate: invalidateProfile } = useProfile();

  // 휴대폰 인증 상태
  const [editPhone, setEditPhone] = useState("");
  const [isPhoneSending, setIsPhoneSending] = useState(false);
  const [isPhoneCodeSent, setIsPhoneCodeSent] = useState(false);
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);
  const [phoneResendTimer, setPhoneResendTimer] = useState(0);

  // 관계 수정 상태
  const [editRelation, setEditRelation] = useState("");
  const [isEditingRelation, setIsEditingRelation] = useState(false);
  const [isSavingRelation, setIsSavingRelation] = useState(false);

  // 사용자 정보 (프로필 데이터 또는 auth 데이터에서 추출)
  const userName = profile?.name || user?.user_metadata?.display_name || user?.user_metadata?.name || '사용자';
  const userEmail = profile?.email || user?.email || '';
  const userPhone = profile?.phone || '';
  const userRelation = relation || '참여자';
  const canEditRelation = timeCapsuleId && (!relation || relation === '참여자');

  // 타이머 효과
  useEffect(() => {
    if (phoneResendTimer > 0) {
      const timer = setTimeout(() => setPhoneResendTimer(phoneResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneResendTimer]);

  // 모달 열 때 초기화
  useEffect(() => {
    if (isOpen) {
      setEditPhone(userPhone);
      setIsPhoneCodeSent(false);
      setIsPhoneVerified(!!userPhone);
      setPhoneVerificationCode("");
      setPhoneResendTimer(0);
      setEditRelation(relation || '');
      setIsEditingRelation(false);
    }
  }, [isOpen, userPhone, relation]);

  if (!isOpen) return null;

  // 휴대폰 인증코드 발송
  const handleSendPhoneCode = async () => {
    if (!editPhone || editPhone.length < 10) {
      toast.error("올바른 휴대폰 번호를 입력해주세요");
      return;
    }

    setIsPhoneSending(true);
    try {
      const response = await apiFetch('/api/v1/auth/phone/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: editPhone }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '인증코드 발송에 실패했습니다');
      }

      setIsPhoneCodeSent(true);
      setPhoneResendTimer(60);
      toast.success("인증코드가 발송되었습니다");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '인증코드 발송에 실패했습니다');
    } finally {
      setIsPhoneSending(false);
    }
  };

  // 휴대폰 인증코드 확인
  const handleVerifyPhoneCode = async () => {
    if (phoneVerificationCode.length !== 4) {
      toast.error("4자리 인증코드를 입력해주세요");
      return;
    }

    setIsPhoneVerifying(true);
    try {
      const response = await apiFetch('/api/v1/auth/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: editPhone, code: phoneVerificationCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '인증 확인에 실패했습니다');
      }

      setIsPhoneVerified(true);
      invalidateProfile(); // 프로필 캐시 무효화
      toast.success("휴대폰 인증이 완료되었습니다!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '인증 확인에 실패했습니다');
    } finally {
      setIsPhoneVerifying(false);
    }
  };

  // 관계 저장
  const handleSaveRelation = async () => {
    if (!editRelation.trim()) {
      toast.error("관계를 입력해주세요");
      return;
    }

    if (!timeCapsuleId) return;

    setIsSavingRelation(true);
    try {
      const response = await apiFetch(`/api/v1/time-capsules/${timeCapsuleId}/membership`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relation: editRelation.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '관계 수정에 실패했습니다');
      }

      setIsEditingRelation(false);
      onRelationUpdated?.();
      toast.success("관계가 저장되었습니다!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '관계 수정에 실패했습니다');
    } finally {
      setIsSavingRelation(false);
    }
  };

  // 저장 가능 여부 (새로 인증한 경우)
  const canSave = !userPhone && editPhone && isPhoneVerified;

  const handleSave = () => {
    toast.success("내 정보가 저장되었어요!");
    onClose();
  };

  // 로딩 중일 때
  if (isProfileLoading) {
    return (
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-center z-50 rounded-[32px]"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-t-[32px] w-full max-w-[420px] animate-slide-up p-8 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-center z-50 rounded-[32px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-[32px] w-full max-w-[420px] animate-slide-up max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">내 정보</h2>
              <p className="text-xs text-muted-foreground">회원가입 시 입력한 정보는 수정할 수 없어요</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-5">
          {/* 이름 - 비활성화 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              이름
            </Label>
            <Input
              value={userName}
              disabled
              className="rounded-xl border-gray-300 bg-gray-200 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* 이메일 - 비활성화 (가입 시 인증 완료) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              이메일
            </Label>
            <div className="relative">
              <Input
                value={userEmail}
                disabled
                className="rounded-xl border-gray-300 bg-gray-200 text-gray-600 cursor-not-allowed pr-20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 인증됨
              </span>
            </div>
          </div>

          {/* 관계 - 수정 가능 (값이 없거나 '참여자'일 때) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              관계
              {!canEditRelation && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
            </Label>

            {canEditRelation ? (
              isEditingRelation ? (
                <div className="flex gap-2">
                  <Input
                    value={editRelation}
                    onChange={(e) => setEditRelation(e.target.value)}
                    placeholder="예: 엄마, 아빠, 친구, 동생 등"
                    className="rounded-xl border-border/50 focus:border-primary"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveRelation}
                    disabled={isSavingRelation || !editRelation.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors whitespace-nowrap flex items-center gap-1"
                  >
                    {isSavingRelation ? <Loader2 className="w-4 h-4 animate-spin" /> : "저장"}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={userRelation}
                    disabled
                    className="rounded-xl border-gray-300 bg-gray-100 text-gray-600"
                  />
                  <button
                    onClick={() => {
                      setEditRelation('');
                      setIsEditingRelation(true);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors whitespace-nowrap flex items-center gap-1"
                  >
                    <Pencil className="w-4 h-4" />
                    수정
                  </button>
                </div>
              )
            ) : (
              <Input
                value={userRelation}
                disabled
                className="rounded-xl border-gray-300 bg-gray-200 text-gray-600 cursor-not-allowed"
              />
            )}
            <p className="text-xs text-muted-foreground">
              {canEditRelation ? "관계를 설정해주세요" : "초대 수락 시 설정한 관계입니다"}
            </p>
          </div>

          {/* 휴대폰번호 - 비어있으면 입력 가능 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              휴대폰번호
              {userPhone && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
            </Label>

            {userPhone ? (
              // 이미 휴대폰이 있으면 비활성화
              <div className="relative">
                <Input
                  value={userPhone}
                  disabled
                  className="rounded-xl border-gray-300 bg-gray-200 text-gray-600 cursor-not-allowed pr-20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 인증됨
                </span>
              </div>
            ) : (
              // 휴대폰이 없으면 입력 + 인증 가능
              <>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={editPhone}
                      onChange={(e) => {
                        setEditPhone(e.target.value.replace(/[^0-9-]/g, ""));
                        setIsPhoneCodeSent(false);
                        setIsPhoneVerified(false);
                      }}
                      disabled={isPhoneVerified}
                      placeholder="010-0000-0000"
                      className={`rounded-xl transition-all ${
                        isPhoneVerified
                          ? "border-green-300 bg-green-50 text-foreground pr-10"
                          : "border-border/50 focus:border-primary"
                      }`}
                    />
                    {isPhoneVerified && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <button
                    onClick={handleSendPhoneCode}
                    disabled={isPhoneSending || isPhoneVerified || phoneResendTimer > 0 || !editPhone}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors whitespace-nowrap flex items-center gap-1"
                  >
                    {isPhoneSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isPhoneVerified ? (
                      "완료"
                    ) : phoneResendTimer > 0 ? (
                      `${phoneResendTimer}초`
                    ) : isPhoneCodeSent ? (
                      "재발송"
                    ) : (
                      "인증"
                    )}
                  </button>
                </div>

                {/* 인증코드 입력 */}
                {isPhoneCodeSent && !isPhoneVerified && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <p className="text-sm font-medium text-foreground">인증코드 입력</p>
                    <div className="flex gap-2">
                      <Input
                        value={phoneVerificationCode}
                        onChange={(e) => setPhoneVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="4자리 입력"
                        maxLength={4}
                        className="flex-1 rounded-xl border-gray-300 focus:border-primary font-mono tracking-widest text-center text-lg h-12"
                      />
                      <button
                        onClick={handleVerifyPhoneCode}
                        disabled={isPhoneVerifying || phoneVerificationCode.length !== 4}
                        className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors h-12"
                      >
                        {isPhoneVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "인증확인"}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">SMS로 발송된 4자리 인증코드를 입력해주세요</p>
                  </div>
                )}

                {!isPhoneCodeSent && (
                  <p className="text-xs text-muted-foreground">휴대폰 번호를 추가하면 알림을 받을 수 있어요</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-8 pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-muted text-muted-foreground text-sm font-medium rounded-full hover:bg-muted/80 transition-colors"
          >
            닫기
          </button>
          {canSave && (
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
            >
              저장하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
