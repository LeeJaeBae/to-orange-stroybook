import { useState } from "react";
import { Image, Reply, Bookmark, ChevronLeft, ChevronRight, Printer, Download, Trash2, Mail as MailIcon, Send, Calendar, Pencil, Truck, FileEdit, Forward, AlertTriangle, MoreHorizontal, RefreshCw, Eye, EyeOff, ReplyAll, Loader2, Inbox, AlertCircle, XCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useLetterFolders } from "@/hooks/useLetterFolders";
import { useLetterTracking } from "@/hooks/useLetterTracking";
import { Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Mail, FolderType, FamilyMember } from "@/types/mail";
import { LetterContentView } from "@/components/mail/LetterContentView";
import { motion, AnimatePresence } from "framer-motion";
import { TrackingStatusBadge } from "@/components/mail/TrackingStatusBadge";
import { TrackingTimeline } from "@/components/mail/TrackingTimeline";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTrackingStatusColor, getTrackingStatusLabel } from "@/lib/korea-post-api";

interface MailContentProps {
  mails: Mail[];
  selectedMail: Mail | null;
  onSelectMail: (mail: Mail | null) => void;
  activeFolder: FolderType;
  onReply: () => void;
  onForward?: (mailId: string) => void;
  selectedMember?: FamilyMember | null;
  allMails?: Mail[];
  onMoveToFolder?: (mailId: string, targetFolder: FolderType) => void;
  onEditAddressBook?: () => void;
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  onMarkAsRead?: (mailIds: string[], isRead: boolean) => void;
  onDelete?: (mailId: string) => void;
  onDeleteBatch?: (mailIds: string[]) => Promise<void>;
  onCancelLetter?: (mailId: string) => Promise<void>;
  onEditBeforePrint?: (mailId: string) => void;
}

const folderTitles: Record<FolderType, string> = {
  inbox: "받은 편지함",
  sent: "보낸 편지함",
  draft: "임시보관함",
  archive: "중요편지함",
  gallery: "갤러리",
  schedule: "스케줄 관리",
  spam: "스팸함",
  trash: "휴지통",
  orangetree: "오렌지 나무",
  timecapsule: "타임캡슐",
  deals: "특가 할인",
  faq: "자주 묻는 질문",
  feedback: "고객의 소리",
  rewards: "내가 받은 경품",
  notice: "공지사항",
  customerService: "고객센터",
};

type TabType = "all" | "unread" | "handwritten";

export function MailContent({
  mails,
  selectedMail,
  onSelectMail,
  activeFolder,
  onReply,
  onForward,
  selectedMember,
  allMails = [],
  onMoveToFolder,
  onEditAddressBook,
  isLoading = false,
  error = null,
  onRefresh,
  onMarkAsRead,
  onDelete,
  onDeleteBatch,
  onCancelLetter,
  onEditBeforePrint,
}: MailContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedMailIds, setSelectedMailIds] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();
  const { customFolders } = useLetterFolders();

  // 삭제 확인 모달 상태
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  // 스팸신고 확인 모달 상태
  const [spamConfirmOpen, setSpamConfirmOpen] = useState(false);
  const [pendingSpamIds, setPendingSpamIds] = useState<string[]>([]);

  // 취소 확인 모달 상태
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [trackingModalMail, setTrackingModalMail] = useState<Mail | null>(null);
  const { tracking, isLoading: isTrackingLoading, refresh: refreshTracking } = useLetterTracking(trackingModalMail?.id);
  const [isRefreshingTracking, setIsRefreshingTracking] = useState(false);

  const openCancelConfirm = (mailId: string) => {
    setPendingCancelId(mailId);
    setCancelConfirmOpen(true);
  };

  const openTrackingModal = (mail: Mail, e: React.MouseEvent) => {
    e.stopPropagation();
    setTrackingModalMail(mail);
  };

  const handleRefreshTracking = async () => {
    setIsRefreshingTracking(true);
    try {
      await refreshTracking();
    } finally {
      setIsRefreshingTracking(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!pendingCancelId || !onCancelLetter) return;
    setIsCancelling(true);
    try {
      await onCancelLetter(pendingCancelId);
      toast.success('편지가 취소되었습니다. 환불이 처리됩니다.');
      onSelectMail(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '편지 취소에 실패했습니다.');
    } finally {
      setIsCancelling(false);
      setPendingCancelId(null);
      setCancelConfirmOpen(false);
    }
  };

  const toggleMailSelection = (mailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMailIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mailId)) {
        newSet.delete(mailId);
      } else {
        newSet.add(mailId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedMailIds.size === sortedMails.length) {
      setSelectedMailIds(new Set());
    } else {
      setSelectedMailIds(new Set(sortedMails.map(m => m.id)));
    }
  };

  // 삭제 확인 모달 열기
  const openDeleteConfirm = (mailIds: string[]) => {
    setPendingDeleteIds(mailIds);
    setDeleteConfirmOpen(true);
  };

  // 삭제 실행
  const handleConfirmDelete = async () => {
    if (pendingDeleteIds.length > 1 && onDeleteBatch) {
      // 여러 개일 때는 일괄 삭제
      await onDeleteBatch(pendingDeleteIds);
    } else if (onDelete) {
      // 하나일 때는 단일 삭제
      await Promise.all(pendingDeleteIds.map((mailId) => onDelete(mailId)));
    }
    setSelectedMailIds(new Set());
    setPendingDeleteIds([]);
    setDeleteConfirmOpen(false);
  };

  // 스팸신고 확인 모달 열기
  const openSpamConfirm = (mailIds: string[]) => {
    setPendingSpamIds(mailIds);
    setSpamConfirmOpen(true);
  };

  // 스팸신고 실행
  const handleConfirmSpam = () => {
    if (onMoveToFolder) {
      pendingSpamIds.forEach((mailId) => onMoveToFolder(mailId, "spam"));
    }
    setSelectedMailIds(new Set());
    setPendingSpamIds([]);
    setSpamConfirmOpen(false);
  };

  const unreadCount = mails.filter((mail) => !mail.isRead).length;
  const handwrittenCount = mails.filter((mail) => mail.isHandwritten).length;

  // 선택된 멤버와의 통계 계산
  const memberStats = selectedMember ? {
    receivedCount: mails.filter((mail) => mail.folder === 'inbox').length,
    sentCount: mails.filter((mail) => mail.folder === 'sent').length,
    lastMailDate: mails.length > 0 ? mails[0].date : "없음",
  } : null;

  // 탭에 따라 해당 항목을 상단에 정렬 (전체 리스트 유지)
  const sortedMails = [...mails].sort((a, b) => {
    if (activeTab === "unread") {
      // 읽지않음 탭: 읽지않은 편지가 상단에
      if (!a.isRead && b.isRead) return -1;
      if (a.isRead && !b.isRead) return 1;
      return 0;
    }
    if (activeTab === "handwritten") {
      // 손편지 탭: 손편지가 상단에
      if (a.isHandwritten && !b.isHandwritten) return -1;
      if (!a.isHandwritten && b.isHandwritten) return 1;
      return 0;
    }
    return 0; // 전체 탭은 원래 순서 유지
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Header - 목록 뷰에서만 표시 (데스크톱만, 모바일은 MobileHeader에서 표시) */}
      {!selectedMail && (
        <header className="hidden md:flex h-14 border-b border-border bg-card items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-base lg:text-lg font-semibold text-foreground">
              {selectedMember
                ? `${selectedMember.name}님과의 편지`
                : folderTitles[activeFolder]}
            </h1>
            <span className="text-sm text-muted-foreground">
              {mails.length}개의 편지
            </span>
          </div>
        </header>
      )}

      {/* Action Toolbar - 데스크톱에서만 표시 */}
      {!isMobile && (
      <div className="h-12 border-b border-border bg-muted/30 flex items-center justify-between px-4">
        <div className="flex items-center gap-1">
          {/* 전체선택 체크박스 */}
          <button
            onClick={toggleSelectAll}
            className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          >
            <div className={cn(
              "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
              selectedMailIds.size === sortedMails.length && sortedMails.length > 0
                ? "bg-primary border-primary"
                : selectedMailIds.size > 0
                  ? "bg-primary/50 border-primary"
                  : "border-muted-foreground/40"
            )}>
              {selectedMailIds.size > 0 && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>

          <button
            onClick={() => {
              if (selectedMailIds.size > 0) {
                openDeleteConfirm(Array.from(selectedMailIds));
              }
            }}
            className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            삭제
          </button>
          <button
            onClick={() => {
              if (selectedMailIds.size > 0) {
                openSpamConfirm(Array.from(selectedMailIds));
              }
            }}
            className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            스팸신고
          </button>
          <button
            onClick={() => {
              const firstSelectedId = Array.from(selectedMailIds)[0];
              if (firstSelectedId) {
                onForward?.(firstSelectedId);
              }
            }}
            className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            전달
          </button>

          {/* 구분선 */}
          <div className="w-px h-5 bg-border mx-2" />

          {/* 이동 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-9 px-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              이동
              <ChevronRight className="w-3 h-3 rotate-90" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white z-50">
              <DropdownMenuItem onClick={() => {
                selectedMailIds.forEach(id => onMoveToFolder?.(id, "inbox"));
                setSelectedMailIds(new Set());
              }}>
                받은 편지함
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                selectedMailIds.forEach(id => onMoveToFolder?.(id, "spam"));
                setSelectedMailIds(new Set());
              }}>
                스팸함
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                selectedMailIds.forEach(id => onMoveToFolder?.(id, "trash"));
                setSelectedMailIds(new Set());
              }}>
                휴지통
              </DropdownMenuItem>
              {customFolders.length > 0 && (
                <>
                  <div className="h-px bg-border my-1" />
                  {customFolders.map((folder) => (
                    <DropdownMenuItem key={folder.id} onClick={() => {
                      selectedMailIds.forEach(id => onMoveToFolder?.(id, `custom-${folder.id}` as FolderType));
                      setSelectedMailIds(new Set());
                      toast.success(`${folder.name}(으)로 이동했습니다`);
                    }}>
                      <Folder className="w-3.5 h-3.5 mr-2" style={{ color: folder.color || '#F97316' }} />
                      {folder.name}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 읽음 표시 드롭다운 - 받은 편지함에서만 */}
          {activeFolder === 'inbox' && (
            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 px-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                읽음 표시
                <ChevronRight className="w-3 h-3 rotate-90" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white z-50">
                <DropdownMenuItem
                  onClick={() => {
                    if (selectedMailIds.size > 0 && onMarkAsRead) {
                      onMarkAsRead(Array.from(selectedMailIds), true);
                      setSelectedMailIds(new Set());
                    }
                  }}
                  disabled={selectedMailIds.size === 0}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  읽음으로 표시
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (selectedMailIds.size > 0 && onMarkAsRead) {
                      onMarkAsRead(Array.from(selectedMailIds), false);
                      setSelectedMailIds(new Set());
                    }
                  }}
                  disabled={selectedMailIds.size === 0}
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  읽지않음으로 표시
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* 오른쪽: 페이지네이션 & 새로고침 */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            1 / {mails.length}
          </span>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            title="새로고침"
          >
            새로고침
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden min-w-0">
        <AnimatePresence mode="wait">
          {!selectedMail ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              {/* 선택된 멤버 통계 */}
              {selectedMember && memberStats && (
                <div className="px-4 lg:px-6 py-4 bg-accent/30 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-medium text-lg flex-shrink-0",
                        selectedMember.color
                      )}
                    >
                      {selectedMember.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{selectedMember.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedMember.relation} · {selectedMember.facility}</p>
                    </div>
                    <button
                      onClick={onEditAddressBook}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="주소록 수정"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 bg-background rounded-lg p-3 shadow-sm">
                      <MailIcon className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">받은 편지</p>
                        <p className="font-semibold text-foreground">{memberStats.receivedCount}통</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-background rounded-lg p-3 shadow-sm">
                      <Send className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">보낸 편지</p>
                        <p className="font-semibold text-foreground">{memberStats.sentCount}통</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-background rounded-lg p-3 shadow-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">마지막 편지</p>
                        <p className="font-semibold text-foreground">{memberStats.lastMailDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="px-4 lg:px-6 py-3 border-b border-border flex items-center gap-6">
                <button
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "text-sm font-medium transition-colors pb-2 -mb-3 border-b-2",
                    activeTab === "all"
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  전체 <span className="ml-1">{mails.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab("unread")}
                  className={cn(
                    "text-sm font-medium transition-colors pb-2 -mb-3 border-b-2",
                    activeTab === "unread"
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  읽지않음 <span className="ml-1">{unreadCount}</span>
                </button>
                {activeFolder === "inbox" && handwrittenCount > 0 && (
                  <button
                    onClick={() => setActiveTab("handwritten")}
                    className={cn(
                      "text-sm font-medium transition-colors pb-2 -mb-3 border-b-2 flex items-center gap-1",
                      activeTab === "handwritten"
                        ? "text-primary border-primary"
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    )}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    손편지 <span className="ml-1">{handwrittenCount}</span>
                  </button>
                )}
              </div>

              {/* Mail List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {/* Loading State */}
                {isLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">편지를 불러오는 중...</p>
                  </div>
                )}

                {/* Error State */}
                {!isLoading && error && (
                  <div className="flex-1 flex flex-col items-center justify-center py-20">
                    <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                    <p className="text-foreground font-medium mb-2">편지를 불러오는데 실패했습니다</p>
                    <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
                    {onRefresh && (
                      <Button
                        variant="outline"
                        onClick={onRefresh}
                        className="gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        다시 시도
                      </Button>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && sortedMails.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center py-20">
                    <Inbox className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="text-foreground font-medium mb-2">편지가 없습니다</p>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === "unread"
                        ? "읽지 않은 편지가 없습니다"
                        : activeTab === "handwritten"
                          ? "손편지가 없습니다"
                          : selectedMember
                            ? `${selectedMember.name}님과 주고받은 편지가 없습니다`
                            : "새로운 편지가 도착하면 여기에 표시됩니다"}
                    </p>
                  </div>
                )}

                {/* Mail List */}
                {!isLoading && !error && sortedMails.length > 0 && (
                <div className="divide-y divide-border">
                  {sortedMails.map((mail) => (
                    <div
                      key={mail.id}
                      onClick={() => onSelectMail(mail)}
                      className={cn(
                        "w-full text-left px-4 py-3 bg-card hover:bg-secondary/50 transition-all duration-150 cursor-pointer",
                        selectedMailIds.has(mail.id) && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* 체크박스 */}
                        <button
                          onClick={(e) => toggleMailSelection(mail.id, e)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors flex-shrink-0"
                        >
                          <div className={cn(
                            "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                            selectedMailIds.has(mail.id)
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/40 hover:border-primary"
                          )}>
                            {selectedMailIds.has(mail.id) && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>

                        {/* 발신자 정보 */}
                        <div className="w-32 flex-shrink-0">
                          <span
                            className={cn(
                              "text-sm truncate block",
                              mail.isRead
                                ? "font-medium text-foreground/80"
                                : "font-semibold text-foreground"
                            )}
                          >
                            {mail.sender.name}
                          </span>
                          {(mail.sender.facility || mail.sender.prisonerNumber) && (
                            <span className="text-size-10 text-muted-foreground truncate block">
                              {mail.sender.facility}{mail.sender.facility && mail.sender.prisonerNumber && " · "}{mail.sender.prisonerNumber}
                            </span>
                          )}
                        </div>

                        {/* 제목 */}
                        <p
                          className={cn(
                            "text-sm flex-1 min-w-0 truncate",
                            mail.isRead
                              ? "font-medium text-foreground/80"
                              : "font-semibold text-foreground"
                          )}
                        >
                          {mail.subject}
                        </p>

                        {/* 보낸편지함 진행상태 */}
                        {activeFolder === "sent" && mail.trackingStatus && (
                          <button
                            type="button"
                            onClick={(e) => openTrackingModal(mail, e)}
                            className="flex-shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                            title="배송조회 보기"
                          >
                            <TrackingStatusBadge status={mail.trackingStatus} className="cursor-pointer" />
                          </button>
                        )}
                        {activeFolder === "sent" && !mail.trackingStatus && mail.status && (
                          <button
                            type="button"
                            onClick={(e) => openTrackingModal(mail, e)}
                            className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            title="배송조회 보기"
                          >
                            {mail.status}
                          </button>
                        )}

                        {/* 날짜 */}
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {mail.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto scrollbar-thin print:overflow-visible"
            >
              {/* Subject Bar */}
              <div className="px-4 lg:px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-base lg:text-xl font-normal text-foreground">
                    {selectedMail.subject}
                  </h1>
                  {!selectedMail.isRead && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-accent text-primary">
                      받은편지함
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 print:hidden">
                  <button 
                    onClick={() => window.print()}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sender Info */}
              <div className="px-4 lg:px-6 py-3 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0",
                      selectedMail.sender.color
                    )}
                  >
                    {selectedMail.sender.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {selectedMail.sender.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        &lt;{selectedMail.sender.facility}&gt;
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      나에게
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground mr-2">
                    {selectedMail.date}
                  </span>
                  <button 
                    onClick={onReply}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors print:hidden"
                    title="답장"
                  >
                    <Reply className="w-5 h-5" />
                  </button>
                  {/* 더보기 드롭다운 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors print:hidden">
                      <MoreHorizontal className="w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white z-50">
                      <DropdownMenuItem onClick={onReply} className="gap-3">
                        <Reply className="w-4 h-4" />
                        답장
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onForward?.(selectedMail.id)}
                        className="gap-3"
                      >
                        <Forward className="w-4 h-4" />
                        전달
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteConfirm([selectedMail.id])}
                        className="gap-3"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </DropdownMenuItem>
                      {activeFolder === 'sent' && selectedMail.rawStatus === 'PAID' && onEditBeforePrint && (
                        <DropdownMenuItem
                          onClick={() => onEditBeforePrint(selectedMail.id)}
                          className="gap-3"
                        >
                          <Pencil className="w-4 h-4" />
                          출력 전 수정
                        </DropdownMenuItem>
                      )}
                      {activeFolder === 'sent' && selectedMail.rawStatus === 'PAID' && onCancelLetter && (
                        <DropdownMenuItem
                          onClick={() => openCancelConfirm(selectedMail.id)}
                          className="gap-3 text-destructive focus:text-destructive"
                        >
                          <XCircle className="w-4 h-4" />
                          발송 취소
                        </DropdownMenuItem>
                      )}
                      {activeFolder === 'inbox' && (
                        <DropdownMenuItem
                          onClick={() => {
                            if (selectedMail && onMarkAsRead) {
                              onMarkAsRead([selectedMail.id], false);
                            }
                          }}
                          className="gap-3"
                        >
                          <EyeOff className="w-4 h-4" />
                          읽지않음으로 표시
                        </DropdownMenuItem>
                      )}
                      <div className="my-1 border-t border-border" />
                      <DropdownMenuItem className="gap-3">
                        <AlertTriangle className="w-4 h-4" />
                        {selectedMail.sender.name}님 차단
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openSpamConfirm([selectedMail.id])}
                        className="gap-3"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        스팸 신고
                      </DropdownMenuItem>
                      <div className="my-1 border-t border-border" />
                      <DropdownMenuItem onClick={() => window.print()} className="gap-3">
                        <Printer className="w-4 h-4" />
                        인쇄
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-3">
                        <Download className="w-4 h-4" />
                        메시지 다운로드
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Mail Content */}
              <div className="px-4 py-4 md:px-6 md:pl-[70px]">
                <LetterContentView
                  content={selectedMail.content}
                  stationeryStyle={selectedMail.stationeryStyle}
                  font={selectedMail.font}
                  fontSize={selectedMail.fontSize}
                  lineColor={selectedMail.lineColor}
                />
              </div>

              {/* Reply Button */}
              <div className="px-4 py-6 md:px-6 md:pl-[70px] print:hidden">
                <Button
                  onClick={onReply}
                  variant="outline"
                  className="h-10 px-6 rounded-full border-border text-foreground hover:bg-secondary"
                >
                  <Reply className="w-4 h-4 mr-2" />
                  답장
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 삭제 확인 모달 */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>편지 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteIds.length === 1
                ? "이 편지를 삭제하시겠습니까?"
                : `선택한 ${pendingDeleteIds.length}개의 편지를 삭제하시겠습니까?`}
              <br />
              {activeFolder === 'draft'
                ? '임시보관 편지는 영구 삭제되며 복구할 수 없습니다.'
                : '삭제된 편지는 휴지통으로 이동됩니다.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 스팸신고 확인 모달 */}
      <AlertDialog open={spamConfirmOpen} onOpenChange={setSpamConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>스팸 신고</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingSpamIds.length === 1
                ? "이 편지를 스팸으로 신고하시겠습니까?"
                : `선택한 ${pendingSpamIds.length}개의 편지를 스팸으로 신고하시겠습니까?`}
              <br />
              신고된 편지는 스팸함으로 이동되며, 발신자의 향후 편지가 자동으로 차단될 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSpam}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              스팸 신고
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 발송 취소 확인 모달 */}
      <AlertDialog open={cancelConfirmOpen} onOpenChange={(open) => {
        if (!isCancelling) setCancelConfirmOpen(open);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>발송 취소</AlertDialogTitle>
            <AlertDialogDescription>
              이 편지의 발송을 취소하시겠습니까?
              <br />
              결제 금액은 자동으로 환불됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>돌아가기</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? '취소 처리 중...' : '발송 취소'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!trackingModalMail} onOpenChange={(open) => !open && setTrackingModalMail(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>배송조회</DialogTitle>
            <DialogDescription>
              {trackingModalMail
                ? `${trackingModalMail.sender.name}님에게 보낸 편지의 배송 상태를 확인할 수 있습니다.`
                : "배송 상태를 확인할 수 있습니다."}
            </DialogDescription>
          </DialogHeader>

          {trackingModalMail && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{trackingModalMail.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      수신자 {trackingModalMail.sender.name}
                      {trackingModalMail.sender.facility ? ` · ${trackingModalMail.sender.facility}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{trackingModalMail.date}</span>
                </div>
              </div>

              {isTrackingLoading ? (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  배송 정보를 불러오는 중이야.
                </div>
              ) : tracking ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getTrackingStatusColor(tracking.status))}>
                        {getTrackingStatusLabel(tracking.status)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        등기번호 <span className="font-mono font-medium text-foreground">{tracking.trackingNumber}</span>
                      </span>
                    </div>

                    {tracking.lastLocation && (
                      <p className="text-sm text-muted-foreground mt-3">현재 위치: {tracking.lastLocation}</p>
                    )}
                    {tracking.lastCheckedAt && (
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        마지막 조회: {new Date(tracking.lastCheckedAt).toLocaleString("ko-KR")}
                      </p>
                    )}

                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshTracking}
                        disabled={isRefreshingTracking}
                      >
                        <RefreshCw className={cn("w-4 h-4 mr-1.5", isRefreshingTracking && "animate-spin")} />
                        새로고침
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm font-medium text-foreground mb-3">배송 이력</p>
                    <TrackingTimeline events={tracking.events} />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Truck className="w-4 h-4 text-primary" />
                    {trackingModalMail.status || "배송 준비 중"}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    아직 우체국 배송조회 정보가 등록되지 않았어. 접수 직후거나 등기번호 반영 전일 가능성이 크다.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
