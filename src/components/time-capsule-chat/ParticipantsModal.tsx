"use client";

import { useState } from "react";
import { X, User, Check, Clock3, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/fetch";
import type { Participant } from "./types";

interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants?: Participant[];
  timeCapsuleId?: string;
}

function formatLastActivity(lastMessageAt?: string | null) {
  if (!lastMessageAt) {
    return "아직 쪽지를 남기지 않았어요";
  }

  const lastDate = new Date(lastMessageAt);
  if (Number.isNaN(lastDate.getTime())) {
    return "최근 활동 시점을 확인할 수 없어요";
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfLastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime();
  const dayDiff = Math.floor((startOfToday - startOfLastDay) / (1000 * 60 * 60 * 24));

  if (dayDiff <= 0) {
    return "오늘 쪽지를 남겼어요";
  }

  if (dayDiff === 1) {
    return "어제 쪽지를 남겼어요";
  }

  if (dayDiff < 7) {
    return `${dayDiff}일 전에 쪽지를 남겼어요`;
  }

  return `${lastDate.getFullYear()}.${String(lastDate.getMonth() + 1).padStart(2, "0")}.${String(lastDate.getDate()).padStart(2, "0")} 마지막 작성`;
}

export function ParticipantsModal({ isOpen, onClose, participants = [], timeCapsuleId }: ParticipantsModalProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleInviteSms = async () => {
    if (!inviteName.trim() || !invitePhone.trim()) {
      toast.error("이름과 전화번호를 입력해주세요");
      return;
    }
    const phone = invitePhone.replace(/-/g, "");
    if (!/^0\d{9,10}$/.test(phone)) {
      toast.error("올바른 전화번호를 입력해주세요");
      return;
    }
    setIsSending(true);
    try {
      const res = await apiFetch(`/api/v1/time-capsules/${timeCapsuleId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invites: [{ name: inviteName.trim(), phone }] }),
      });
      const data = await res.json();
      if (res.ok && data.data?.successCount > 0) {
        toast.success(`${inviteName}님에게 초대 문자를 보냈어요! 📩`);
        setInviteName("");
        setInvitePhone("");
        setShowInviteForm(false);
      } else {
        toast.error("문자 발송에 실패했어요");
      }
    } catch {
      toast.error("문자 발송에 실패했어요");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const activeCount = participants.filter((participant) => participant.isActive).length;

  return (
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-center z-50 rounded-[32px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-[32px] w-full max-w-[420px] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div>
            <h2 className="font-bold text-foreground">참여자</h2>
            <p className="text-xs text-muted-foreground">
              총 {participants.length}명 · 최근 활동 {activeCount}명
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Participant List */}
        <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
          {participants.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
              아직 참여자가 없어요. 초대 링크나 문자 초대로 사람부터 모아.
            </div>
          )}

          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
            >
              {/* Avatar */}
              <div className={`
                relative w-11 h-11 rounded-full flex items-center justify-center
                bg-muted
              `}>
                <User className="w-5 h-5 text-foreground/70" />
                <div className={`
                  absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white
                  ${participant.messageCount === 0 ? 'bg-muted-foreground/40' : participant.isActive ? 'bg-success' : 'bg-orange-400'}
                `}>
                  {participant.messageCount === 0 ? null : participant.isActive ? (
                    <Check className="w-2.5 h-2.5 text-white" />
                  ) : (
                    <Clock3 className="w-2 h-2 text-white" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground">
                    {participant.name} <span className="text-muted-foreground">({participant.relation})</span>
                  </p>
                  {participant.isOwner && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-size-10 font-semibold text-primary">
                      방장
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {participant.messageCount > 0
                    ? `쪽지 ${participant.messageCount}개`
                    : "아직 쪽지를 남기지 않았어요"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  {formatLastActivity(participant.lastMessageAt)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-8 pt-2">
          {showInviteForm ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">문자로 초대하기</h3>
                <button onClick={() => setShowInviteForm(false)} className="text-xs text-muted-foreground hover:text-foreground">
                  취소
                </button>
              </div>
              <input
                type="text"
                placeholder="이름"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
              />
              <input
                type="tel"
                placeholder="전화번호 (예: 01012345678)"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleInviteSms}
                disabled={isSending}
                className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSending ? "발송 중..." : "초대 문자 보내기"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowInviteForm(true)}
              className="w-full py-3 text-sm text-primary font-medium hover:bg-muted rounded-full transition-colors"
            >
              + 새 참여자 초대하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
