"use client";

import { useState, useEffect } from "react";
import { X, Edit3, User, Calendar, FileText, Loader2, Copy, Check, MessageSquare, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { buildTimeCapsuleInviteUrl } from "@/lib/time-capsule-invite";

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeCapsuleId?: string;
  /** 타임캡슐 초대 코드 (access_code) */
  accessCode?: string;
  initialData?: {
    title: string;
    recipientName: string;
    deliveryDate: string;
    description?: string;
  };
  onSave?: (data: {
    title: string;
    description: string;
  }) => Promise<void>;
}

function formatDisplayDate(dateString: string) {
  if (!dateString) {
    return "미정";
  }

  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateString;
  }

  return parsedDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function EditRoomModal({
  isOpen,
  onClose,
  timeCapsuleId,
  accessCode,
  initialData = {
    title: "서은우의 출소 축하 타임캡슐",
    recipientName: "서은우",
    deliveryDate: "2025-03-15",
    description: "",
  },
  onSave,
}: EditRoomModalProps) {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showSmsInput, setShowSmsInput] = useState(false);
  const [smsPhone, setSmsPhone] = useState("");
  const [isSendingSms, setIsSendingSms] = useState(false);

  // 모달 열 때 초기화
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("타임캡슐 이름을 입력해주세요");
      return;
    }

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave({ title, description });
      } else if (timeCapsuleId) {
        // 실제 API 호출: PATCH /api/v1/time-capsules/[id]
        const res = await fetch(`/api/v1/time-capsules/${timeCapsuleId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || '저장에 실패했습니다');
        }
      } else {
        // timeCapsuleId 없으면 저장 불가
        throw new Error('타임캡슐 ID가 없어 저장할 수 없습니다');
      }
      toast.success("타임캡슐 정보가 수정되었습니다!");
      onClose();
    } catch {
      toast.error("저장에 실패했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  // 초대 링크
  const inviteLink = accessCode ? buildTimeCapsuleInviteUrl(accessCode) : "";

  // 초대 코드 복사
  const handleCopyCode = async () => {
    if (!accessCode) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCodeCopied(true);
      toast.success("초대 링크가 복사되었습니다!");
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했습니다");
    }
  };

  // SMS 초대 발송
  const handleSendSms = async () => {
    if (!smsPhone.trim()) {
      toast.error("전화번호를 입력해주세요");
      return;
    }
    if (!/^0\d{9,10}$/.test(smsPhone)) {
      toast.error("올바른 전화번호 형식이 아닙니다 (예: 01012345678)");
      return;
    }
    setIsSendingSms(true);
    try {
      const res = await fetch("/api/v1/sms/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: smsPhone,
          message: `[투오렌지] 타임캡슐에 초대합니다!\n지금 바로 참여해보세요 🍊\n${inviteLink}`,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "발송에 실패했습니다");
      }
      toast.success("SMS가 발송되었습니다!");
      setSmsPhone("");
      setShowSmsInput(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "SMS 발송에 실패했습니다";
      toast.error(msg);
    } finally {
      setIsSendingSms(false);
    }
  };

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
              <Edit3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">타임캡슐 방 수정</h2>
              <p className="text-xs text-muted-foreground">방장만 수정할 수 있어요</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-5">
          {/* 타임캡슐 이름 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-muted-foreground" />
              타임캡슐 이름
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 서은우의 출소 축하 타임캡슐"
              className="rounded-xl border-border/50 focus:border-primary"
            />
          </div>

          {/* 수신자 이름 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              수신자 이름
            </Label>
            <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-3">
              <p className="text-sm font-medium text-foreground">{initialData.recipientName || "미등록"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                수신자 정보는 현재 이 화면에서 수정할 수 없어요
              </p>
            </div>
          </div>

          {/* 전달일 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              전달일
            </Label>
            <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-3">
              <p className="text-sm font-medium text-foreground">
                {formatDisplayDate(initialData.deliveryDate)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                전달일 변경은 아직 지원되지 않아요
              </p>
            </div>
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              설명 (선택)
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="타임캡슐에 대한 설명을 적어주세요"
              className="rounded-xl border-border/50 focus:border-primary min-h-[100px] resize-none"
            />
          </div>
        </div>

        {/* 초대 코드 섹션 */}
        {accessCode && (
          <div className="px-5 pb-2 space-y-3">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <Copy className="w-4 h-4" />
                초대 코드
              </p>
              {/* 초대 링크 표시 + 복사 */}
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 bg-white rounded-xl px-3 py-2.5 border border-orange-200/80 overflow-hidden">
                  <p className="text-sm text-orange-900 font-mono truncate">{inviteLink}</p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className={`shrink-0 p-2.5 rounded-xl transition-all ${
                    codeCopied
                      ? "bg-green-500 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* SMS 초대 */}
              {!showSmsInput ? (
                <button
                  onClick={() => setShowSmsInput(true)}
                  className="w-full py-2.5 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  SMS로 초대하기
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        value={smsPhone}
                        onChange={(e) => setSmsPhone(e.target.value)}
                        placeholder="01012345678"
                        className="rounded-xl pl-9 border-orange-200/80 focus:border-orange-400"
                      />
                    </div>
                    <button
                      onClick={handleSendSms}
                      disabled={isSendingSms}
                      className="shrink-0 px-4 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                      {isSendingSms ? <Loader2 className="w-4 h-4 animate-spin" /> : "발송"}
                    </button>
                  </div>
                  <button
                    onClick={() => { setShowSmsInput(false); setSmsPhone(""); }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 pb-8 pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-muted text-muted-foreground text-sm font-medium rounded-full hover:bg-muted/80 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                저장 중...
              </>
            ) : (
              "저장하기"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
