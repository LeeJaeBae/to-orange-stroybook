"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MoreVertical, Edit3, Megaphone, Link2, Flag, Users, Stamp, UserCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTimeCapsuleChat } from "@/hooks/useTimeCapsuleChat";
import { MobileFrame } from "./MobileFrame";
import { WelcomeScreen } from "./WelcomeScreen";
import { WelcomeHeader } from "./WelcomeHeader";
import { ChatView } from "./ChatView";
import { ChatInput } from "./ChatInput";
import { GiftModal } from "./GiftModal";
import { ParticipantsModal } from "./ParticipantsModal";
import { MyInfoModal } from "./MyInfoModal";
import { AccountLinkModal } from "./AccountLinkModal";
import { LinkSettingsModal } from "./LinkSettingsModal";
import { EditRoomModal } from "./EditRoomModal";
import { ReportModal } from "./ReportModal";
import { RollingNotice } from "./RollingNotice";
import { NoticeModal } from "./NoticeModal";
import type { ChatMessage } from "./types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buildTimeCapsuleInviteUrl } from "@/lib/time-capsule-invite";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TimeCapsuleChatPageProps {
  timeCapsuleId: string;
  /** "demo" 모드: API 호출 없이 목업 데이터로 동작 */
  mode?: "live" | "demo";
  demoProps?: {
    recipientName?: string;
    title?: string;
    deliveryDate?: string;
  };
}

export function TimeCapsuleChatPage({ timeCapsuleId, mode = "live", demoProps }: TimeCapsuleChatPageProps) {
  const isMobile = useIsMobile();

  const {
    timeCapsule,
    recipientName,
    title,
    deliveryDate,
    daysLeft,
    messages,
    participants,
    todayMessageCount,
    pointsBalance,
    chargePoints,
    isCharging,
    isLoading,
    sendMessage,
    sendGift,
    isSending,
    myRelation,
    refetch,
  } = useTimeCapsuleChat(timeCapsuleId);

  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isMyInfoOpen, setIsMyInfoOpen] = useState(false);
  const [isAccountLinkOpen, setIsAccountLinkOpen] = useState(false);
  const [isLinkSettingsOpen, setIsLinkSettingsOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [noticeItems, setNoticeItems] = useState<Array<{ id: string; content: string; isPinned: boolean }>>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeActivated, setWelcomeActivated] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [frameScale, setFrameScale] = useState(1);

  // 데스크톱: MobileFrame(844px)이 뷰포트에 맞도록 스케일 조절
  useEffect(() => {
    if (isMobile) return;
    const updateScale = () => {
      // py-4(32) + mt-4(16) + button(44) + 여유(28) = 120px
      const available = window.innerHeight - 120;
      setFrameScale(Math.min(1, available / 844));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isMobile]);

  // 로그인 상태 확인 — 로그인되어 있으면 계정 연동 메뉴 숨김
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  const transitionTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleBack = () => {
    setIsTransitioning(true);
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setWelcomeActivated(false);
      setShowWelcome(true);
      setIsTransitioning(false);
    }, 500);
  };

  const handleStartChat = useCallback(() => {
    setIsTransitioning(true);
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setWelcomeActivated(true);
      setShowWelcome(false);
      setIsTransitioning(false);
    }, 600);
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const handleSendMessage = async (content: string, replyToData?: { id: string; senderName: string; content: string }) => {
    await sendMessage(content, replyToData);
    setReplyTo(null);
  };

  const handleReply = (message: ChatMessage) => {
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleSendGift = async (gift: { id: string; name: string; message?: string }) => {
    return sendGift(gift.id, gift.message);
  };

  const handleChargePoints = async (input: { amount: number; paymentMethod: 'card' | 'phone' | 'bank' }) => {
    await chargePoints(input);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-muted">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  const chatContent = (
    <>
      {/* Header - Different for Welcome vs Chat */}
      {showWelcome ? (
        <WelcomeHeader title={title} deliveryDate={deliveryDate} isActivated={welcomeActivated} />
      ) : (
        <div className="pt-14 px-5 pb-2 flex items-center">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          {/* Center Title Group */}
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setIsParticipantsOpen(true)}
              className="flex items-center gap-2 hover:bg-muted/50 rounded-full px-3 py-1.5 transition-colors"
            >
              <span className="text-base font-semibold text-foreground">To.{recipientName}</span>
              <span className="w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                {participants.length}
              </span>
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-full transition-colors">
                <MoreVertical className="w-5 h-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-3" onClick={() => setIsMyInfoOpen(true)}>
                <UserCircle className="w-4 h-4" />
                <span>내 정보</span>
              </DropdownMenuItem>
              {!isLoggedIn && (
                <DropdownMenuItem className="gap-3" onClick={() => setIsAccountLinkOpen(true)}>
                  <Link2 className="w-4 h-4" />
                  <span>계정 연동</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="gap-3" onClick={() => setIsEditRoomOpen(true)}>
                <Edit3 className="w-4 h-4" />
                <span>타임캡슐 방 수정</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3" onClick={() => setIsNoticeOpen(true)}>
                <Megaphone className="w-4 h-4" />
                <span>공지사항</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3" onClick={() => setIsLinkSettingsOpen(true)}>
                <Link2 className="w-4 h-4" />
                <span>링크설정</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3" onClick={() => setIsParticipantsOpen(true)}>
                <Users className="w-4 h-4" />
                <span>참여자 관리</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 text-destructive" onClick={() => setIsReportOpen(true)}>
                <Flag className="w-4 h-4" />
                <span>신고하기</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Notice Bar - Fixed below header */}
      {!showWelcome && (
        <RollingNotice recipientName={recipientName} dbNotices={noticeItems} />
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: isTransitioning ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex-1 flex flex-col"
          >
            <WelcomeScreen
              recipientName={recipientName}
              onStartChat={handleStartChat}
              todayMessageCount={todayMessageCount}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: isTransitioning ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {messages.length > 0 ? (
              <ChatView messages={messages} onReply={handleReply} />
            ) : (
              <WelcomeScreen
                recipientName={recipientName}
                onStartChat={handleStartChat}
                todayMessageCount={todayMessageCount}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* D-Day Notice */}
      {!showWelcome && daysLeft >= 0 && daysLeft <= 7 && (
        <div className="px-4 py-3 space-y-2">
          <div className="rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3">
            <div className="flex items-center gap-2 text-foreground">
              <Stamp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">전달 준비 기간이에요</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              전달일까지 D-{daysLeft}. 실제 우표 구매 및 발송 기능은 아직 연결되지 않았어요.
              지금은 쪽지를 계속 모으는 단계로만 봐. 괜히 눌렀다고 발송된 척하면 더 짜치니까.
            </p>
          </div>
        </div>
      )}

      {/* Input */}
      {!showWelcome && daysLeft >= 0 && (
        <ChatInput
          onSend={handleSendMessage}
          onGiftClick={() => setIsGiftModalOpen(true)}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
        />
      )}

      {!showWelcome && daysLeft < 0 && (
        <div className="px-4 pb-4">
          <div className="rounded-xl bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
            전달일이 지나 쪽지 작성이 마감되었습니다.
          </div>
        </div>
      )}

      {/* Modals - inside mobile frame */}
      <GiftModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        onSendGift={handleSendGift}
        initialPoints={pointsBalance}
      />

      <ParticipantsModal
        isOpen={isParticipantsOpen}
        onClose={() => setIsParticipantsOpen(false)}
        participants={participants}
        timeCapsuleId={timeCapsuleId}
      />

      <MyInfoModal
        isOpen={isMyInfoOpen}
        onClose={() => setIsMyInfoOpen(false)}
        relation={myRelation}
        timeCapsuleId={timeCapsuleId}
        onRelationUpdated={refetch}
      />

      <AccountLinkModal
        isOpen={isAccountLinkOpen}
        onClose={() => setIsAccountLinkOpen(false)}
        onComplete={() => refetch()}
      />

      <LinkSettingsModal
        isOpen={isLinkSettingsOpen}
        onClose={() => setIsLinkSettingsOpen(false)}
        capsuleName={title}
        inviteLink={buildTimeCapsuleInviteUrl(timeCapsule?.accessCode || timeCapsuleId)}
      />

      <NoticeModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
        timeCapsuleId={timeCapsuleId}
        isOwner={timeCapsule?.isOwner ?? false}
        onNoticesUpdate={(notices) => setNoticeItems(notices)}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        timeCapsuleId={timeCapsuleId}
      />

      <EditRoomModal
        isOpen={isEditRoomOpen}
        onClose={() => setIsEditRoomOpen(false)}
        timeCapsuleId={timeCapsuleId}
        accessCode={timeCapsule?.accessCode}
        initialData={{
          title: title,
          recipientName: recipientName,
          deliveryDate: timeCapsule?.deliveryDate || deliveryDate,
          description: timeCapsule?.description || "",
        }}
      />
    </>
  );

  // 모바일: 전체화면, 데스크톱: MobileFrame 내부
  if (isMobile) {
    return (
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        {chatContent}
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-muted py-4">
      <div className="flex flex-col items-center">
        <div
          style={{
            transform: `scale(${frameScale})`,
            transformOrigin: 'top center',
            height: `${844 * frameScale}px`,
          }}
        >
          <MobileFrame>
            {chatContent}
          </MobileFrame>
        </div>

        {/* 나가기 버튼 - 모바일 프레임 아래 */}
        <button
          onClick={() => window.location.href = '/letter/time-capsule'}
          className="mt-4 px-8 py-3 bg-muted-foreground/20 text-muted-foreground rounded-full font-medium text-sm shadow-lg hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
        >
          나가기
        </button>
      </div>
    </div>
  );
}
