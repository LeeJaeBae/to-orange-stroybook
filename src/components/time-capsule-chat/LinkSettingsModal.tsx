"use client";

import { X, Copy, Link2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { buildTimeCapsuleInviteUrl } from "@/lib/time-capsule-invite";

interface LinkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  capsuleName?: string;
  inviteLink?: string;
}

export function LinkSettingsModal({
  isOpen,
  onClose,
  capsuleName = "타임캡슐",
  inviteLink = buildTimeCapsuleInviteUrl("abc123xyz789")
}: LinkSettingsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("초대 링크가 복사되었습니다!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했습니다");
    }
  };

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-amber-100 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">링크 설정</h2>
              <p className="text-xs text-muted-foreground">초대 링크를 공유해보세요</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* 타임캡슐 방 이름 */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 rounded-2xl p-4">
            <p className="text-xs text-orange-600 font-medium mb-1">타임캡슐</p>
            <p className="text-base font-semibold text-orange-900">{capsuleName}</p>
          </div>

          {/* 초대 링크 */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-2xl p-4">
            <p className="text-xs text-amber-700 font-medium mb-2">초대 링크</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 bg-white rounded-xl px-3 py-2.5 border border-amber-200/80 overflow-hidden">
                <p className="text-sm text-amber-900 font-mono truncate">{inviteLink}</p>
              </div>
              <button
                onClick={handleCopy}
                className={`shrink-0 p-3 rounded-xl transition-all ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-2">링크를 공유하면 누구나 타임캡슐에 참여할 수 있어요</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-8 pt-2">
          <button
            onClick={handleCopy}
            className="w-full py-3.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            링크 복사하기
          </button>
        </div>
      </div>
    </div>
  );
}
