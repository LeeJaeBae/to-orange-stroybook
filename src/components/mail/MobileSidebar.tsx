import { Mail, Send, FileText, Settings, ChevronDown, ChevronRight, Trash2, Plus, Folder, FolderOpen, AlertCircle, TreeDeciduous, Clock, Image as ImageIcon, CalendarDays, Bell, Phone, Gift, Tag, LogOut, Home, MoreHorizontal, Pencil, Lock } from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { FamilyMember, FolderType } from "@/types/mail";
import { useAuth } from "@/hooks/useAuth";
import { AddRecipientModal } from "./AddRecipientModal";
import { SecretPinModal } from "./SecretPinModal";
import { apiFetch } from "@/lib/api/fetch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLetterFolders } from "@/hooks/useLetterFolders";

const DEFAULT_AVATAR = "/avatar/10 (2).png";

interface ProfileData {
  id: string;
  nickname: string | null;
  role: string;
  points_balance: number;
}

const SQUIRCLE_CLIP_PATH = "M20,0 C27.18,0 32.08,1.24 35.17,4.33 C38.26,7.42 40,12.32 40,20 C40,27.18 38.26,32.08 35.17,35.17 C32.08,38.26 27.18,40 20,40 C12.82,40 7.92,38.26 4.83,35.17 C1.74,32.08 0,27.18 0,20 C0,12.53 1.27,7.60 4.42,4.45 C7.52,1.36 12.39,0 20,0 Z";

const FOLDER_COLORS = [
  { name: '빨강', value: '#EF4444' },
  { name: '주황', value: '#F97316' },
  { name: '노랑', value: '#EAB308' },
  { name: '초록', value: '#22C55E' },
  { name: '파랑', value: '#3B82F6' },
  { name: '남색', value: '#6366F1' },
  { name: '보라', value: '#A855F7' },
  { name: '분홍', value: '#EC4899' },
  { name: '회색', value: '#6B7280' },
];

interface MobileSidebarProps {
  familyMembers: FamilyMember[];
  activeFolder: FolderType | null;
  onFolderChange: (folder: FolderType) => void;
  unreadCount: number;
  draftCount: number;
  trashCount: number;
  selectedMemberId: string | null;
  onSelectMember: (memberId: string | null) => void;
  onHandwrittenUpload?: () => void;
  onCompose?: () => void;
  letterCountsByMember?: Record<string, number>;
}

// 상단 폴더
const foldersTop = [
  { id: "inbox" as FolderType, label: "받은 편지함", icon: Mail },
  { id: "sent" as FolderType, label: "보낸 편지함", icon: Send },
  { id: "draft" as FolderType, label: "임시보관함", icon: FileText },
];

// 스케줄 관리, 오렌지나무, 타임캡슐
const foldersMiddle = [
  { id: "schedule" as FolderType, label: "스케줄 관리", icon: CalendarDays },
  { id: "orangetree" as FolderType, label: "오렌지 나무", icon: TreeDeciduous },
  { id: "timecapsule" as FolderType, label: "타임캡슐", icon: Clock },
];

// 스팸함, 휴지통
const foldersBottom = [
  { id: "spam" as FolderType, label: "스팸함", icon: AlertCircle },
  { id: "trash" as FolderType, label: "휴지통", icon: Trash2 },
];

// 고객 지원 메뉴 (PC와 동일)
const supportMenus = [
  { id: "notice" as FolderType, label: "공지사항", icon: Bell },
  { id: "customerService" as FolderType, label: "고객센터", icon: Phone },
  { id: "rewards" as FolderType, label: "내가 받은 경품", icon: Gift },
];

export function MobileSidebar({
  familyMembers,
  activeFolder,
  onFolderChange,
  unreadCount,
  draftCount,
  trashCount,
  selectedMemberId,
  onSelectMember,
  onHandwrittenUpload,
  onCompose,
  letterCountsByMember = {},
}: MobileSidebarProps) {
  const [isTreeExpanded, setIsTreeExpanded] = useState(false);
  const [isAddRecipientOpen, setIsAddRecipientOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const { user, signOut, linkedIdentities, loading: authLoading } = useAuth();
  const { customFolders, createFolder, updateFolder, deleteFolder } = useLetterFolders();
  const [isCustomFoldersExpanded, setIsCustomFoldersExpanded] = useState(true);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [menuOpenFolderId, setMenuOpenFolderId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIsSecret, setNewFolderIsSecret] = useState(false);
  const [newFolderColor, setNewFolderColor] = useState('#F97316');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [colorPickerFolderId, setColorPickerFolderId] = useState<string | null>(null);
  const [isSecretUnlocked, setIsSecretUnlocked] = useState(false);
  const [isSecretPinModalOpen, setIsSecretPinModalOpen] = useState(false);
  const [isSecretExpanded, setIsSecretExpanded] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const newFolderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const response = await apiFetch('/api/v1/profile');
      if (cancelled) return;

      if (!response.ok) {
        if (response.status !== 401) {
          setProfile(null);
        }
        setIsProfileLoading(false);
        return;
      }

      const result = (await response.json()) as { data?: ProfileData | null };
      if (!cancelled) {
        setProfile(result.data ?? null);
        setIsProfileLoading(false);
      }
    }

    async function syncProfile() {
      if (user) {
        await loadProfile();
        return;
      }

      if (!authLoading && !cancelled) {
        setIsProfileLoading(false);
      }
    }

    syncProfile();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const displayName =
    profile?.nickname ??
    user?.user_metadata?.display_name ??
    user?.email?.split('@')[0] ??
    '사용자';

  const router = useRouter();
  const isAdmin = profile?.role === 'ADMIN';
  const displayRole = isAdmin ? '관리자' : '일반회원';

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Top: Home + Compose */}
      <div className="px-4 pt-4 pb-3 space-y-3 border-b border-border/40">
        {/* 홈으로 */}
        <button
          onClick={() => { window.location.href = '/'; }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>홈으로</span>
        </button>

        {/* 편지 쓰기 */}
        {onCompose && (
          <button
            onClick={onCompose}
            className="w-full h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-[0_4px_14px_rgba(251,146,60,0.4)] hover:shadow-[0_6px_20px_rgba(251,146,60,0.5)] transition-all duration-200 flex items-center justify-center text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            <span>편지 쓰기</span>
          </button>
        )}
      </div>

      {/* Profile Section - 카카오메일 스타일 */}
      <div className="px-4 py-4 border-b border-border/40">
        {(authLoading || isProfileLoading) ? (
          <div className="flex items-center gap-3 w-full animate-pulse">
            <div className="w-[46px] h-[46px] bg-muted rounded-[30%] flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-[15px] bg-muted rounded w-20" />
              <div className="h-[14px] bg-muted rounded w-32" />
            </div>
          </div>
        ) :
        <button
          onClick={() => router.push('/letter/profile')}
          className="flex items-center gap-3 w-full hover:opacity-90 transition-opacity"
        >
          <div className="relative flex-shrink-0">
            <svg width="0" height="0" className="absolute">
              <defs>
                <clipPath id="squircle-clip-mobile" clipPathUnits="objectBoundingBox" transform="scale(0.025, 0.025)">
                  <path d={SQUIRCLE_CLIP_PATH} />
                </clipPath>
              </defs>
            </svg>
            <div className="w-[46px] h-[46px] overflow-hidden bg-orange-50" style={{ clipPath: 'url(#squircle-clip-mobile)' }}>
              <img src={DEFAULT_AVATAR} alt="프로필" className="w-full h-full object-cover" />
            </div>
            {/* 로그인 제공자 뱃지 (왼쪽 하단) */}
            {(() => {
              const provider = linkedIdentities.find(i => !['email'].includes(i.provider))?.provider;
              const badgeBase = "absolute -bottom-0.5 -left-0.5 w-[19px] h-[19px] rounded-full flex items-center justify-center ring-[1.5px] ring-card";
              if (provider === 'kakao') {
                return (
                  <span className={`${badgeBase} bg-[#FEE500]`}>
                    <span className="text-[#3C1E1E] text-size-9 font-bold leading-none">k</span>
                  </span>
                );
              }
              if (provider === 'naver') {
                return (
                  <span className={`${badgeBase} bg-[#03C75A]`}>
                    <span className="text-white text-size-9 font-bold leading-none">N</span>
                  </span>
                );
              }
              if (provider === 'google') {
                return (
                  <span className={`${badgeBase} bg-white border border-border`}>
                    <span className="text-size-9 font-bold leading-none">G</span>
                  </span>
                );
              }
              if (provider === 'apple') {
                return (
                  <span className={`${badgeBase} bg-black`}>
                    <span className="text-white text-size-9 font-bold leading-none"></span>
                  </span>
                );
              }
              return null;
            })()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-size-14 font-semibold leading-[17px] text-foreground truncate">{displayName}</p>
            <p className="text-size-14 font-semibold leading-[17px] text-muted-foreground truncate mt-0.5">{user?.email ?? ''}</p>
          </div>
        </button>}

        {/* 통계 카드 - 관리자만 표시 (PC와 동일) */}
        {isAdmin && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onFolderChange("gallery")}
              className="flex-1 bg-muted/50 rounded-xl py-2.5 px-2 hover:bg-muted transition-colors text-center"
            >
              <ImageIcon className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-size-10 text-muted-foreground">갤러리</p>
            </button>
            <button
              onClick={onHandwrittenUpload}
              className="flex-1 bg-muted/50 rounded-xl py-2.5 px-2 hover:bg-muted transition-colors text-center"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 mx-auto mb-1 fill-primary">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
              <p className="text-size-10 text-muted-foreground">손편지 담기</p>
            </button>
          </div>
        )}
      </div>

      {/* Folders */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {/* 폴더 목록 */}
          <ul className="space-y-1">
            {foldersTop.map((folder) => {
              const Icon = folder.icon;
              const count = folder.id === "inbox" ? unreadCount : folder.id === "draft" ? draftCount : 0;

              return (
                <li key={folder.id}>
                  <button
                    onClick={() => onFolderChange(folder.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-foreground hover:bg-muted/60"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{folder.label}</span>
                    {count > 0 && (
                      <span className="min-w-5 h-5 text-size-10 font-semibold rounded-full tabular-nums flex items-center justify-center bg-muted text-muted-foreground">
                        {count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

        {/* 내 편지함 */}
        <button
          onClick={() => setIsTreeExpanded(!isTreeExpanded)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-foreground hover:bg-muted/60"
        >
          {isTreeExpanded ? (
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="flex-1 text-left">내 편지함</span>
          <span
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              onClick={() => router.push('/letter/settings')}
              className="min-w-5 h-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              title="편지함 관리"
            >
              <Settings className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
            </span>
            <span
              onClick={() => {
                setIsCreatingFolder(true);
                setNewFolderName('');
                setNewFolderIsSecret(false);
                setTimeout(() => newFolderInputRef.current?.focus(), 50);
              }}
              className="min-w-5 h-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              title="새 폴더 추가"
            >
              <Plus className="w-3 h-3" />
            </span>
          </span>
        </button>

        {isTreeExpanded && (
          <ul className="space-y-1.5 px-1">
            {familyMembers.map((member) => {
              const isSelected = selectedMemberId === member.id;
              const mailCount = letterCountsByMember[member.id] || 0;
              return (
                <li key={member.id}>
                  <button
                    onClick={() => onSelectMember(isSelected ? null : member.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary"
                    )}
                  >
                    {isSelected ? (
                      <FolderOpen className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Folder className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm flex-1 text-left truncate">{member.name}</span>
                    <span className="text-xs text-muted-foreground">{mailCount}</span>
                  </button>
                </li>
              );
            })}

            {/* 인라인 폴더 생성 (내 편지함 섹션) */}
            {isCreatingFolder && (
              <li>
                <div className="px-3 py-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <input
                      ref={newFolderInputRef}
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newFolderName.trim()) {
                          createFolder.mutate({ name: newFolderName.trim(), isSecret: newFolderIsSecret, color: newFolderColor });
                          setIsCreatingFolder(false);
                          setNewFolderName('');
                          setNewFolderIsSecret(false);
                        } else if (e.key === 'Escape') {
                          setIsCreatingFolder(false);
                          setNewFolderName('');
                          setNewFolderIsSecret(false);
                        }
                      }}
                      onBlur={(e) => {
                        const li = e.currentTarget.closest('li');
                        if (li && e.relatedTarget && li.contains(e.relatedTarget as Node)) return;
                        setTimeout(() => {
                          setIsCreatingFolder((prev) => {
                            if (!prev) return false;
                            if (newFolderName.trim()) {
                              createFolder.mutate({ name: newFolderName.trim(), isSecret: newFolderIsSecret, color: newFolderColor });
                            }
                            setNewFolderName('');
                            setNewFolderIsSecret(false); setNewFolderColor('#F97316');
                            return false;
                          });
                        }, 200);
                      }}
                      placeholder="새 폴더 이름"
                      className="flex-1 text-sm bg-muted/60 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                      autoFocus
                    />
                  </div>
                  <label className="flex items-center gap-2 px-6 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newFolderIsSecret}
                      onChange={(e) => setNewFolderIsSecret(e.target.checked)}
                      className="rounded border-border"
                    />
                    <Lock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">비밀 폴더로 설정</span>
                  </label>
                  <div className="flex items-center gap-1.5 px-6">
                    <span className="text-xs text-muted-foreground mr-1">색상</span>
                    {FOLDER_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setNewFolderColor(c.value)}
                        className={cn(
                          "w-5 h-5 rounded-full transition-all",
                          newFolderColor === c.value ? "ring-2 ring-offset-1 ring-primary scale-110" : "hover:scale-110"
                        )}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </li>
            )}
          </ul>
        )}

        {/* 비밀 편지함 섹션 */}
        {(() => {
          const secretFolders = customFolders.filter(f => f.is_secret);
          if (secretFolders.length === 0) return null;
          return (
            <div className="mt-1">
              <button
                onClick={() => {
                  if (isSecretUnlocked) {
                    setIsSecretExpanded(!isSecretExpanded);
                  } else {
                    setIsSecretPinModalOpen(true);
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                {isSecretUnlocked && isSecretExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Lock className="w-3.5 h-3.5" />
                <span className="text-sm font-medium">비밀 편지함</span>
                <span className="text-xs text-muted-foreground ml-auto">{secretFolders.length}</span>
              </button>
              {isSecretUnlocked && isSecretExpanded && (
                <ul className="space-y-1.5 px-1">
                  {secretFolders.map((folder) => {
                    const isActive = activeFolder === (`custom-${folder.id}` as FolderType);
                    const isEditing = editingFolderId === folder.id;
                    return (
                      <li key={folder.id} className="relative group">
                        {isEditing ? (
                          <div className="flex items-center gap-2 px-3 py-2">
                            <Folder className="w-4 h-4 flex-shrink-0" style={{ color: folder.color || undefined }} />
                            <input
                              ref={editInputRef}
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && editingName.trim()) {
                                  updateFolder.mutate({ id: folder.id, name: editingName.trim() });
                                  setEditingFolderId(null);
                                } else if (e.key === 'Escape') {
                                  setEditingFolderId(null);
                                }
                              }}
                              onBlur={() => {
                                if (editingName.trim() && editingName.trim() !== folder.name) {
                                  updateFolder.mutate({ id: folder.id, name: editingName.trim() });
                                }
                                setEditingFolderId(null);
                              }}
                              className="flex-1 text-sm bg-muted/60 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => onFolderChange(`custom-${folder.id}` as FolderType)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-foreground hover:bg-secondary"
                            )}
                          >
                            <span className="flex items-center gap-1">
                              <Folder className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} style={{ color: folder.color || undefined }} />
                              <span className="text-xs">🔒</span>
                            </span>
                            <span className="text-sm flex-1 text-left truncate">{folder.name}</span>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenFolderId(menuOpenFolderId === folder.id ? null : folder.id);
                              }}
                              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          </button>
                        )}

                        {menuOpenFolderId === folder.id && (
                          <div className="absolute right-2 top-full z-[60] bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
                            <button onClick={() => { setEditingFolderId(folder.id); setEditingName(folder.name); setMenuOpenFolderId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                              <Pencil className="w-3.5 h-3.5" /><span>이름 변경</span>
                            </button>
                            <button onClick={() => { setColorPickerFolderId(colorPickerFolderId === folder.id ? null : folder.id); setMenuOpenFolderId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                              <span className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: folder.color || '#F97316' }} /><span>색상 변경</span>
                            </button>
                            <button onClick={() => { updateFolder.mutate({ id: folder.id, isSecret: false }); setMenuOpenFolderId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                              <Lock className="w-3.5 h-3.5" /><span>비밀 해제</span>
                            </button>
                            <button onClick={() => { setShowDeleteConfirm(folder.id); setMenuOpenFolderId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors">
                              <Trash2 className="w-3.5 h-3.5" /><span>삭제</span>
                            </button>
                          </div>
                        )}

                        {colorPickerFolderId === folder.id && (
                          <div className="px-3 py-2 flex items-center gap-1.5 flex-wrap">
                            {FOLDER_COLORS.map((c) => (
                              <button key={c.value} onClick={() => { updateFolder.mutate({ id: folder.id, color: c.value }); setColorPickerFolderId(null); }} className={cn("w-5 h-5 rounded-full transition-all", folder.color === c.value ? "ring-2 ring-offset-1 ring-primary scale-110" : "hover:scale-110")} style={{ backgroundColor: c.value }} title={c.name} />
                            ))}
                          </div>
                        )}

                        <AlertDialog open={showDeleteConfirm === folder.id} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>편지함 삭제</AlertDialogTitle>
                              <AlertDialogDescription>편지함을 삭제하면 편지는 받은편지함으로 이동합니다.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={() => { deleteFolder.mutate(folder.id); setShowDeleteConfirm(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">삭제</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })()}

        {/* 커스텀 편지함 */}
        <div className="flex items-center justify-between px-3 py-2 mt-1">
          <button
            onClick={() => setIsCustomFoldersExpanded(!isCustomFoldersExpanded)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isCustomFoldersExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">커스텀 편지함</span>
          </button>
          <button
            onClick={() => {
              setIsCreatingFolder(true);
              setNewFolderName('');
              setTimeout(() => newFolderInputRef.current?.focus(), 50);
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="새 편지함 추가"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {isCustomFoldersExpanded && (
          <ul className="space-y-0.5 px-1">
            {customFolders.map((folder) => {
              const isActive = activeFolder === `custom-${folder.id}`;
              const isEditing = editingFolderId === folder.id;

              return (
                <li key={folder.id} className="relative group">
                  {isEditing ? (
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Folder className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <input
                        ref={editInputRef}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && editingName.trim()) {
                            updateFolder.mutate({ id: folder.id, name: editingName.trim() });
                            setEditingFolderId(null);
                          } else if (e.key === 'Escape') {
                            setEditingFolderId(null);
                          }
                        }}
                        onBlur={() => {
                          if (editingName.trim() && editingName.trim() !== folder.name) {
                            updateFolder.mutate({ id: folder.id, name: editingName.trim() });
                          }
                          setEditingFolderId(null);
                        }}
                        className="flex-1 text-sm bg-muted/60 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => onFolderChange(`custom-${folder.id}` as FolderType)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted/60"
                      )}
                    >
                      <Folder className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} style={{ color: folder.color || undefined }} />
                      <span className="flex-1 text-left truncate">{folder.name}</span>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenFolderId(menuOpenFolderId === folder.id ? null : folder.id);
                        }}
                        className="p-1 rounded hover:bg-muted transition-all"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </button>
                  )}

                  {menuOpenFolderId === folder.id && (
                    <div className="absolute right-2 top-full z-[60] bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
                      <button
                        onClick={() => { setEditingFolderId(folder.id); setEditingName(folder.name); setMenuOpenFolderId(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>이름 변경</span>
                      </button>
                      <button
                        onClick={() => { setColorPickerFolderId(colorPickerFolderId === folder.id ? null : folder.id); setMenuOpenFolderId(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: folder.color || '#F97316' }} />
                        <span>색상 변경</span>
                      </button>
                      <button
                        onClick={() => { updateFolder.mutate({ id: folder.id, isSecret: !folder.is_secret }); setMenuOpenFolderId(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{folder.is_secret ? '비밀 해제' : '비밀 폴더로'}</span>
                      </button>
                      <button
                        onClick={() => { setShowDeleteConfirm(folder.id); setMenuOpenFolderId(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>삭제</span>
                      </button>
                    </div>
                  )}

                  {/* 색상 팔레트 */}
                  {colorPickerFolderId === folder.id && (
                    <div className="px-3 py-2 flex items-center gap-1.5 flex-wrap">
                      {FOLDER_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => { updateFolder.mutate({ id: folder.id, color: c.value }); setColorPickerFolderId(null); }}
                          className={cn("w-5 h-5 rounded-full transition-all", folder.color === c.value ? "ring-2 ring-offset-1 ring-primary scale-110" : "hover:scale-110")}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  )}

                  {/* 삭제 확인 AlertDialog */}
                  <AlertDialog open={showDeleteConfirm === folder.id} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>편지함 삭제</AlertDialogTitle>
                        <AlertDialogDescription>편지함을 삭제하면 편지는 받은편지함으로 이동합니다.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { deleteFolder.mutate(folder.id); setShowDeleteConfirm(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">삭제</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              );
            })}

            {isCreatingFolder && (
              <li className="flex items-center gap-2 px-3 py-2">
                <Folder className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={newFolderInputRef}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newFolderName.trim()) {
                      createFolder.mutate(newFolderName.trim());
                      setIsCreatingFolder(false);
                      setNewFolderName('');
                    } else if (e.key === 'Escape') {
                      setIsCreatingFolder(false);
                      setNewFolderName('');
                    }
                  }}
                  onBlur={() => {
                    if (newFolderName.trim()) {
                      createFolder.mutate(newFolderName.trim());
                    }
                    setIsCreatingFolder(false);
                    setNewFolderName('');
                  }}
                  placeholder="새 편지함 이름"
                  className="flex-1 text-sm bg-muted/60 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                  autoFocus
                />
              </li>
            )}
          </ul>
        )}

        {/* Divider */}
        <div className="my-3 mx-2 border-t border-border/60" />

        {/* 스케줄 관리, 오렌지나무, 타임캡슐 */}
        <ul className="space-y-1">
          {foldersMiddle
            .filter((folder) => {
              if ((folder.id === "schedule" || folder.id === "orangetree" || folder.id === "timecapsule") && !isAdmin) return false;
              return true;
            })
            .map((folder) => {
            const Icon = folder.icon;
            return (
              <li key={folder.id}>
                <button
                  onClick={() => onFolderChange(folder.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-foreground hover:bg-muted/60"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{folder.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <div className="my-3 mx-2 border-t border-border/60" />

        {/* 경품 + 특가 할인 */}
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => router.push('/letter/rewards')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-foreground hover:bg-muted/60"
            >
              <Gift className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">내가 받은 경품</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onFolderChange("deals")}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-foreground hover:bg-muted/60"
            >
              <Tag className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">특가 할인</span>
              <span className="bg-red-500 text-white text-size-10 font-semibold px-1.5 py-0.5 rounded-full">HOT</span>
            </button>
          </li>
        </ul>

        {/* Divider */}
        <div className="my-3 mx-2 border-t border-border/60" />

        {/* 스팸함, 휴지통 */}
        <ul className="space-y-1">
          {foldersBottom.map((folder) => {
            const Icon = folder.icon;
            const count = folder.id === "trash" ? trashCount : 0;
            return (
              <li key={folder.id}>
                <button
                  onClick={() => onFolderChange(folder.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-foreground hover:bg-muted/60"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{folder.label}</span>
                  {count > 0 && (
                    <span className="min-w-5 h-5 text-size-10 font-semibold rounded-full tabular-nums flex items-center justify-center bg-muted text-muted-foreground">
                      {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <div className="my-3 mx-2 border-t border-border/60" />

        {/* 고객 지원 메뉴 (공지사항, 고객센터) */}
        <ul className="space-y-1">
          {supportMenus
            .filter((menu) => menu.id !== "rewards")
            .map((menu) => {
            const Icon = menu.icon;

            const routeMap: Record<string, string> = {
              notice: '/letter/notice',
              customerService: '/letter/customer-service',
            };

            return (
              <li key={menu.id}>
                <button
                  onClick={() => {
                    const route = routeMap[menu.id];
                    if (route) {
                      router.push(route);
                    } else {
                      onFolderChange(menu.id);
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-foreground hover:bg-muted/60"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{menu.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border/40 space-y-1">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>로그아웃</span>
        </button>
      </div>

      {/* Add Recipient Modal */}
      <AddRecipientModal
        open={isAddRecipientOpen}
        onOpenChange={setIsAddRecipientOpen}
        onSuccess={(memberId) => {
          onSelectMember(memberId);
        }}
      />
      {/* Secret PIN Modal */}
      <SecretPinModal
        isOpen={isSecretPinModalOpen}
        onClose={() => setIsSecretPinModalOpen(false)}
        onSuccess={() => {
          setIsSecretUnlocked(true);
          setIsSecretExpanded(true);
          setIsSecretPinModalOpen(false);
        }}
      />
    </div>
  );
}
