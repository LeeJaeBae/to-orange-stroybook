import { Mail, Send, FileText, Settings, PenLine, ChevronDown, ChevronRight, Star, Trash2, Menu, X, Plus, Folder, FolderOpen, Bell, Inbox, TreeDeciduous, Clock, Image as ImageIcon, CalendarDays, Tag, Gift, Phone, MoreHorizontal, MoreVertical, Check, Pencil, Lock } from "lucide-react";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { FamilyMember, FolderType } from "@/types/mail";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { AddressBookModal } from "./AddressBookModal";
import { AddRecipientModal } from "./AddRecipientModal";
import { SecretPinModal, hasSecretPin } from "./SecretPinModal";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api/fetch";
import { useLetterFolders } from "@/hooks/useLetterFolders";

const DEFAULT_AVATAR = "/avatar/10 (2).png";

// 카카오 스타일 스쿼클 SVG clip-path (viewBox 0 0 40 40 기반)
const SQUIRCLE_CLIP_PATH = "M20,0 C27.18,0 32.08,1.24 35.17,4.33 C38.26,7.42 40,12.32 40,20 C40,27.18 38.26,32.08 35.17,35.17 C32.08,38.26 27.18,40 20,40 C12.82,40 7.92,38.26 4.83,35.17 C1.74,32.08 0,27.18 0,20 C0,12.53 1.27,7.60 4.42,4.45 C7.52,1.36 12.39,0 20,0 Z";

const FOLDER_COLORS = [
  { name: '코랄', value: '#F87171' },
  { name: '오렌지', value: '#F97316' },
  { name: '피치', value: '#FB923C' },
  { name: '레몬', value: '#FACC15' },
  { name: '라임', value: '#84CC16' },
  { name: '에메랄드', value: '#34D399' },
  { name: '민트', value: '#6EE7B7' },
  { name: '시안', value: '#22D3EE' },
  { name: '스카이', value: '#7DD3FC' },
  { name: '블루', value: '#60A5FA' },
  { name: '라벤더', value: '#A78BFA' },
  { name: '로즈', value: '#F9A8D4' },
  { name: '베이지', value: '#D4B896' },
  { name: '슬레이트', value: '#94A3B8' },
];

interface SidebarProps {
  familyMembers: FamilyMember[];
  activeFolder: FolderType | null;
  onFolderChange: (folder: FolderType) => void;
  unreadCount: number;
  draftCount: number;
  trashCount: number;
  onCompose: () => void;
  isComposeOpen?: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  selectedMemberId: string | null;
  onSelectMember: (memberId: string | null) => void;
  onUpdateFamilyMembers: (members: FamilyMember[]) => void;
  onHandwrittenUpload?: () => void;
  letterCountsByMember?: Record<string, number>;
}

// 상단 폴더 (받은편지함 ~ 스케줄 관리)
const foldersTop = [
  { id: "inbox" as FolderType, label: "받은 편지함", icon: Mail },
  { id: "sent" as FolderType, label: "보낸 편지함", icon: Send },
  { id: "draft" as FolderType, label: "임시보관함", icon: FileText },
];

// 휴지통
const foldersBottom = [
  { id: "trash" as FolderType, label: "휴지통", icon: Trash2 },
];

const foldersBottom2 = [
  { id: "schedule" as FolderType, label: "스케줄 관리", icon: CalendarDays },
  { id: "orangetree" as FolderType, label: "오렌지 나무", icon: TreeDeciduous },
  { id: "timecapsule" as FolderType, label: "타임캡슐", icon: Clock },
]

// 고객 지원 메뉴
const supportMenus = [
  { id: "notice" as FolderType, label: "공지사항", icon: Bell },
  { id: "customerService" as FolderType, label: "고객센터", icon: Phone },
  { id: "rewards" as FolderType, label: "내가 받은 경품", icon: Gift },
  ];

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

interface ProfileData {
  id: string;
  nickname: string | null;
  role: string;
  points_balance: number;
  profile_image: string | null;
}

export function Sidebar({
  familyMembers,
  activeFolder,
  onFolderChange,
  unreadCount,
  draftCount,
  trashCount,
  onCompose,
  isComposeOpen = false,
  isCollapsed,
  onToggleCollapse,
  selectedMemberId,
  onSelectMember,
  onUpdateFamilyMembers,
  onHandwrittenUpload,
  letterCountsByMember = {},
}: SidebarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, linkedIdentities, loading: authLoading } = useAuth();
  const [isTreeExpanded, setIsTreeExpanded] = useState(false);
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
  const [isAddRecipientOpen, setIsAddRecipientOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const { customFolders, createFolder, updateFolder, deleteFolder } = useLetterFolders();
  const [isCustomFoldersExpanded, setIsCustomFoldersExpanded] = useState(true);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [menuOpenFolderId, setMenuOpenFolderId] = useState<string | null>(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIsSecret, setNewFolderIsSecret] = useState(false);
  const [newFolderColor, setNewFolderColor] = useState('#F97316');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [colorPickerFolderId, setColorPickerFolderId] = useState<string | null>(null);
  const [isSecretUnlocked, setIsSecretUnlocked] = useState(false);
  const [isSecretPinModalOpen, setIsSecretPinModalOpen] = useState(false);
  const [isSecretPinChangeOpen, setIsSecretPinChangeOpen] = useState(false);
  const [isSecretExpanded, setIsSecretExpanded] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const newFolderInputRef = useRef<HTMLInputElement>(null);
  // 바깥 클릭 시 색상 피커 / 메뉴 닫기
  useEffect(() => {
    if (!menuOpenFolderId) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-color-picker]')) {
        setMenuOpenFolderId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpenFolderId]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!user) {
        setProfile(null);
        if (!authLoading) setIsProfileLoading(false);
        return;
      }

      const response = await apiFetch('/api/v1/profile');
      if (!response.ok) {
        if (!cancelled) {
          setProfile(null);
          setIsProfileLoading(false);
        }
        return;
      }

      const result = (await response.json()) as { data?: ProfileData | null };
      if (!cancelled) {
        setProfile(result.data ?? null);
        setIsProfileLoading(false);
      }
    }

    loadProfile();

    // 프로필 변경 후 사이드바 반영 (커스텀 이벤트)
    const handleProfileUpdate = () => { loadProfile(); };
    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [user, authLoading]);

  const displayName =
    profile?.nickname ??
    user?.user_metadata?.display_name ??
    user?.email?.split('@')[0] ??
    '사용자';

  const isAdmin = profile?.role === 'ADMIN';
  const displayRole = isAdmin ? '관리자' : '일반회원';
  const displayEmail = user?.email ?? '이메일 없음';
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="bg-card border-r border-border/60 flex flex-col h-full overflow-hidden"
    >
      {/* Logo & Toggle */}
      <div className="h-14 flex items-center px-4 border-b border-border/40 relative">
        <button
          onClick={() => router.push('/')}
          className="absolute left-1/2 -translate-x-1/2 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/main/landing/logo.png"
            alt="투오렌지"
            width={isCollapsed ? 32 : 120}
            height={isCollapsed ? 32 : 36}
            className="object-contain"
          />
        </button>
        <motion.button
          onClick={onToggleCollapse}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 ml-auto",
            isCollapsed
              ? "bg-primary text-primary-foreground"
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
          )}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            {isCollapsed ? (
              <Menu className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </motion.div>
        </motion.button>
      </div>

      {/* Profile Card - 카카오메일 스타일 */}
      <div className="px-3 pt-4 pb-4">
        {!isCollapsed ? (
          <div>
            {(authLoading || isProfileLoading) ? (
              <div className="flex items-center gap-3 w-full animate-pulse">
                <div className="w-[46px] h-[46px] bg-muted rounded-[30%] flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-[15px] bg-muted rounded w-20" />
                  <div className="h-[14px] bg-muted rounded w-32" />
                </div>
              </div>
            ) :
            /* 프로필 - 가로 배치 */
            <button
              onClick={() => router.push('/letter/profile')}
              className="group flex items-center gap-3 w-full hover:opacity-90 transition-opacity"
            >
              {/* 프로필 이미지 + 제공자 뱃지 */}
              <div className="relative flex-shrink-0">
                {/* 카카오 스쿼클 clip-path SVG */}
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <clipPath id="squircle-clip" clipPathUnits="objectBoundingBox" transform="scale(0.025, 0.025)">
                      <path d={SQUIRCLE_CLIP_PATH} />
                    </clipPath>
                  </defs>
                </svg>
                <div className="w-[46px] h-[46px] overflow-hidden bg-orange-50" style={{ clipPath: 'url(#squircle-clip)' }}>
                  <img src={profile?.profile_image || DEFAULT_AVATAR} alt="프로필" className="w-full h-full object-cover" />
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
              {/* 이름 & 이메일 */}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-size-14 font-semibold leading-[17px] text-foreground truncate">{displayName}</p>
                <p className="text-size-14 font-semibold leading-[17px] text-muted-foreground truncate mt-0.5">{displayEmail}</p>
              </div>
            </button>}

            {/* 통계 카드 - 가로 배치 (관리자만 표시) */}
            {isAdmin && (
              <div className="flex gap-2 w-full mt-3">
                <button
                  onClick={() => onFolderChange("gallery")}
                  className="flex-1 bg-muted/50 rounded-xl py-2.5 px-2 hover:bg-muted transition-colors"
                >
                  <ImageIcon className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-size-10 text-muted-foreground">갤러리</p>
                </button>
                <button
                  onClick={onHandwrittenUpload}
                  className="flex-1 bg-muted/50 rounded-xl py-2.5 px-2 hover:bg-muted transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 mx-auto mb-1 fill-primary">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                  </svg>
                  <p className="text-size-10 text-muted-foreground">손편지 담기</p>
                </button>
              </div>
            )}
          </div>
        ) : (
          (authLoading || isProfileLoading) ? (
            <div className="flex justify-center animate-pulse">
              <div className="w-[42px] h-[42px] bg-muted rounded-full" />
            </div>
          ) :
          <button
            onClick={() => router.push('/letter/profile')}
            className="flex flex-col items-center group"
          >
            <div className="relative">
              <img
                src={profile?.profile_image || DEFAULT_AVATAR}
                alt="프로필"
                className="w-[42px] h-[42px] rounded-full ring-2 ring-primary/30 bg-orange-50 group-hover:ring-primary transition-all object-cover"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Top Action Buttons */}
      <div className="px-3 pb-4 flex flex-col gap-1.5">
        {/* Compose Button - 편지 쓰기 */}
        {isCollapsed ? (
          <Button
            onClick={onCompose}
            size="icon"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-[0_4px_14px_rgba(251,146,60,0.4)] hover:shadow-[0_6px_20px_rgba(251,146,60,0.5)] transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={onCompose}
            className="w-full h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-[0_4px_14px_rgba(251,146,60,0.4)] hover:shadow-[0_6px_20px_rgba(251,146,60,0.5)] transition-all duration-200 justify-center"
          >
            <span>편지 쓰기</span>
          </Button>
        )}

      </div>

      {/* Folders */}
      <nav className="flex-1 px-3 overflow-y-auto scrollbar-thin">
        {/* 메인 폴더들 */}
        <ul className="space-y-1.5">
            {foldersTop.map((folder) => {
              const Icon = folder.icon;
              const isActive = activeFolder === folder.id;
              const count = folder.id === "inbox" ? unreadCount : folder.id === "draft" ? draftCount : folder.id === "trash" ? trashCount : 0;

              return (
                <li key={folder.id}>
                  <button
                    onClick={() => onFolderChange(folder.id)}
                    title={isCollapsed ? folder.label : undefined}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 pr-[22px] py-3 rounded-lg text-sm transition-all duration-150",
                      isCollapsed && "justify-center px-0",
                      !isCollapsed && "ml-1",
                      isActive
                        ? "bg-transparent text-primary font-medium border border-primary"
                        : "text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{folder.label}</span>
                        {count > 0 && (
                          <span
                            className={cn(
                              "min-w-5 h-5 text-size-10 font-semibold rounded-full tabular-nums flex items-center justify-center",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {count}
                          </span>
                        )}
                      </>
                    )}
                    {isCollapsed && count > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-primary-foreground text-size-9 rounded-full flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          {/* 내 편지함 */}
          {!isCollapsed && (
            <li>
              <button
                onClick={() => setIsTreeExpanded(!isTreeExpanded)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 pr-[22px] py-3 rounded-lg text-sm transition-all duration-150 ml-1",
                  "text-foreground hover:bg-muted/60"
                )}
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
                      setNewFolderName('');
                      setNewFolderIsSecret(false);
                      setNewFolderColor('#F97316');
                      setIsCreateFolderModalOpen(true);
                    }}
                    className="min-w-5 h-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                    title="새 폴더 추가"
                  >
                    <Plus className="w-3 h-3" />
                  </span>
                </span>
              </button>
            </li>
          )}
          </ul>

        {!isCollapsed && isTreeExpanded && (
          <>
              <ul className="space-y-1.5 px-1">
                {familyMembers.map((member) => {
                  const isSelected = selectedMemberId === member.id;
                  const mailCount = letterCountsByMember[member.id] || 0;
                  return (
                    <li key={member.id} className="relative group">
                      <button 
                        onClick={() => onSelectMember(isSelected ? null : member.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                          isSelected
                            ? "bg-transparent text-primary border-2 border-dashed border-primary/40"
                            : "text-foreground hover:bg-secondary"
                        )}
                      >
                        {isSelected ? (
                          <FolderOpen className="w-4 h-4" style={{ color: member.color?.match(/#[0-9a-fA-F]{6}/)?.[0] || '#f59e0b' }} />
                        ) : (
                          <Folder className="w-4 h-4" style={{ color: member.color?.match(/#[0-9a-fA-F]{6}/)?.[0] || undefined }} />
                        )}
                        <span className="text-sm flex-1 text-left truncate">
                          {member.name}
                          {member.facilityType && member.facilityType !== '일반 주소' && member.facility && (
                            <span className="text-size-10 text-muted-foreground ml-1 font-normal">
                              {member.facility}
                            </span>
                          )}
                        </span>
                        <div className="relative w-6 h-6 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground group-hover:opacity-0 transition-opacity">{mailCount}</span>
                          <div
                            data-color-picker
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenFolderId(menuOpenFolderId === `member-${member.id}` ? null : `member-${member.id}`);
                            }}
                            className="absolute inset-0 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </div>
                      </button>

                      {/* 색상 변경 드롭다운 */}
                      {menuOpenFolderId === `member-${member.id}` && (
                        <div data-color-picker className="absolute right-2 top-full z-[60] bg-popover border border-border rounded-lg shadow-lg p-2 min-w-[160px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {FOLDER_COLORS.map((c) => (
                              <button
                                key={c.value}
                                onClick={async () => {
                                  try {
                                    await apiFetch(`/api/v1/family-members/${member.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ color: c.value }),
                                    });
                                    // 로컬 상태 즉시 업데이트 + react-query 캐시 갱신
                                    const updated = familyMembers.map(m => 
                                      m.id === member.id ? { ...m, color: c.value } : m
                                    );
                                    onUpdateFamilyMembers(updated);
                                    queryClient.invalidateQueries({ queryKey: ['family-members'] });
                                  } catch (e) {
                                    console.error('색상 변경 실패:', e);
                                  }
                                  setMenuOpenFolderId(null);
                                }}
                                className={cn(
                                  "w-5 h-5 rounded-full transition-all",
                                  "hover:scale-110"
                                )}
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}

                {/* 일반 커스텀 폴더 (비밀 아닌 것) */}
                {customFolders.filter(f => !f.is_secret).map((folder) => {
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
                              ? "bg-transparent text-primary font-medium border-2 border-dashed border-primary/40"
                              : "text-foreground hover:bg-secondary"
                          )}
                        >
                          <Folder className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} style={{ color: folder.color || undefined }} />
                          <span className="text-sm flex-1 text-left truncate">{folder.name}</span>
                          <div
                            data-color-picker
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenFolderId(menuOpenFolderId === folder.id ? null : folder.id);
                            }}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                          >
                            <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </button>
                      )}

                      {/* 드롭다운 메뉴 */}
                      {menuOpenFolderId === folder.id && (
                        <div data-color-picker className="absolute right-2 top-full z-[60] bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
                          <button
                            onClick={() => {
                              setEditingFolderId(folder.id);
                              setEditingName(folder.name);
                              setMenuOpenFolderId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>이름 변경</span>
                          </button>
                          <button
                            onClick={() => {
                              setColorPickerFolderId(colorPickerFolderId === folder.id ? null : folder.id);
                              setMenuOpenFolderId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: folder.color || '#F97316' }} />
                            <span>색상 변경</span>
                          </button>
                          <button
                            onClick={() => {
                              updateFolder.mutate({ id: folder.id, isSecret: !folder.is_secret });
                              setMenuOpenFolderId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>{folder.is_secret ? '비밀 해제' : '비밀 폴더로'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(folder.id);
                              setMenuOpenFolderId(null);
                            }}
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
                              onClick={() => {
                                updateFolder.mutate({ id: folder.id, color: c.value });
                                setColorPickerFolderId(null);
                              }}
                              className={cn(
                                "w-5 h-5 rounded-full transition-all",
                                folder.color === c.value ? "ring-2 ring-offset-1 ring-primary scale-110" : "hover:scale-110"
                              )}
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
                            <AlertDialogDescription>
                              편지함을 삭제하면 편지는 받은편지함으로 이동합니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                deleteFolder.mutate(folder.id);
                                setShowDeleteConfirm(null);
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </li>
                  );
                })}

                {/* 폴더 생성은 모달로 처리 */}
              </ul>

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
                  {isSecretUnlocked && isSecretExpanded && hasSecretPin() && (
                    <button
                      onClick={() => setIsSecretPinChangeOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-6"
                    >
                      <Settings className="w-3 h-3" />
                      비밀번호 변경
                    </button>
                  )}
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
                                    ? "bg-transparent text-primary font-medium border-2 border-dashed border-primary/40"
                                    : "text-foreground hover:bg-secondary"
                                )}
                              >
                                <span className="flex items-center gap-1">
                                  <Folder className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} style={{ color: folder.color || undefined }} />
                                  <span className="text-xs">🔒</span>
                                </span>
                                <span className="text-sm flex-1 text-left truncate">{folder.name}</span>
                                <div
                                  data-color-picker
                            onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpenFolderId(menuOpenFolderId === folder.id ? null : folder.id);
                                  }}
                                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                                >
                                  <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                              </button>
                            )}

                            {menuOpenFolderId === folder.id && (
                              <div data-color-picker className="absolute right-2 top-full z-[60] bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
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
                                  onClick={() => { updateFolder.mutate({ id: folder.id, isSecret: false }); setMenuOpenFolderId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>비밀 해제</span>
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
          </>
        )}

        {/* Divider */}
        {!isCollapsed && (
          <div className="my-3 mx-2 border-t border-border/60" />
        )}

        {/* 스케줄 관리, 오렌지나무, 타임캡슐 */}
        <ul className="space-y-1.5">
            {foldersBottom2
              .filter((folder) => {
                if ((folder.id === "schedule" || folder.id === "orangetree" || folder.id === "timecapsule") && !isAdmin) return false;
                return true;
              })
              .map((folder) => {
              const Icon = folder.icon;
              const isActive = activeFolder === folder.id;

              return (
                <li key={folder.id}>
                  <div className="relative flex items-center">
                    <button
                      onClick={() => onFolderChange(folder.id)}
                      title={isCollapsed ? folder.label : undefined}
                      className={cn(
                        "flex-1 flex items-center gap-2.5 px-2.5 py-3 rounded-lg text-sm transition-all duration-150",
                        isCollapsed && "justify-center px-0",
                        !isCollapsed && "ml-1",
                        isActive
                          ? "bg-transparent text-primary font-medium border border-primary"
                          : "text-foreground hover:bg-muted/60"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
                      {!isCollapsed && (
                        <span className="flex-1 text-left">{folder.label}</span>
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

        {/* Divider */}
        {!isCollapsed && (
          <div className="my-3 mx-2 border-t border-border/60" />
        )}

        {/* 경품 + 특가 할인 */}
        {!isCollapsed && (
          <ul className="space-y-1.5">
            <li>
              <button
                onClick={() => router.push('/letter/rewards')}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3.5 py-3 rounded-lg text-sm transition-all duration-150",
                  activeFolder === "rewards"
                    ? "bg-transparent text-primary font-medium border border-primary"
                    : "text-foreground hover:bg-muted/60"
                )}
              >
                <Gift className={cn("w-4 h-4 flex-shrink-0", activeFolder === "rewards" && "text-primary")} />
                <span className="flex-1 text-left">내가 받은 경품</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onFolderChange("deals")}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3.5 py-3 rounded-lg text-sm transition-all duration-150",
                  activeFolder === "deals"
                    ? "bg-transparent text-primary font-medium border border-primary"
                    : "text-foreground hover:bg-muted/60"
                )}
              >
                <Tag className={cn("w-4 h-4 flex-shrink-0", activeFolder === "deals" && "text-primary")} />
                <span className="flex-1 text-left">특가 할인</span>
                <span className="bg-red-500 text-white text-size-10 font-semibold px-1.5 py-0.5 rounded-full">HOT</span>
              </button>
            </li>
          </ul>
        )}

        {/* Divider */}
        {!isCollapsed && (
          <div className="my-3 mx-2 border-t border-border/60" />
        )}

        {/* 스팸함, 휴지통 */}
        <ul className="space-y-1.5">
            {foldersBottom
              .map((folder) => {
              const Icon = folder.icon;
              const isActive = activeFolder === folder.id;
              const count = folder.id === "trash" ? trashCount : 0;
              const canEmpty = folder.id === "trash" || folder.id === "spam";

              return (
                <li key={folder.id} className="group">
                  <div className="relative flex items-center">
                    <button
                      onClick={() => onFolderChange(folder.id)}
                      title={isCollapsed ? folder.label : undefined}
                      className={cn(
                        "flex-1 flex items-center gap-2.5 px-2.5 py-3 rounded-lg text-sm transition-all duration-150",
                        isCollapsed && "justify-center px-0",
                        !isCollapsed && "ml-1",
                        isActive
                          ? "bg-transparent text-primary font-medium border border-primary"
                          : "text-foreground hover:bg-muted/60"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{folder.label}</span>
                          {canEmpty && (
                            <span
                              onClick={async (e) => {
                                e.stopPropagation();
                                const label = folder.id === "trash" ? "휴지통" : "스팸함";
                                if (!confirm(`${label}을 비우시겠습니까? 모든 편지가 영구 삭제됩니다.`)) return;
                                try {
                                  await apiFetch(`/api/v1/letters/empty`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ folder: folder.id }),
                                  });
                                  window.location.reload();
                                } catch (err) {
                                  console.error('비우기 실패:', err);
                                }
                              }}
                              className="text-size-10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all cursor-pointer px-1.5 py-0.5 rounded hover:bg-red-50"
                            >
                              비우기
                            </span>
                          )}
                          {count > 0 && (
                            <span
                              className={cn(
                                "min-w-5 h-5 text-size-10 font-semibold rounded-full tabular-nums flex items-center justify-center",
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {count}
                            </span>
                          )}
                        </>
                      )}
                      {isCollapsed && count > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-primary-foreground text-size-9 rounded-full flex items-center justify-center">
                          {count}
                        </span>
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

        {/* Divider */}
        {!isCollapsed && (
          <div className="my-3 mx-2 border-t border-border/60" />
        )}

        {/* 고객 지원 메뉴 (공지사항, 고객센터) */}
        {!isCollapsed && (
          <ul className="space-y-1.5">
            {supportMenus
              .filter((menu) => menu.id !== "rewards")
              .map((menu) => {
              const Icon = menu.icon;
              const isActive = activeFolder === menu.id;

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
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3.5 py-3 rounded-lg text-sm transition-all duration-150",
                      isActive
                        ? "bg-transparent text-primary font-medium border border-primary"
                        : "text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
                    <span className="flex-1 text-left">{menu.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Collapsed Family Avatars */}
        {isCollapsed && (
          <ul className="space-y-2">
            {familyMembers.map((member) => {
              const isSelected = selectedMemberId === member.id;
              return (
                <li key={member.id} className="flex justify-center">
                  <button
                    onClick={() => onSelectMember(isSelected ? null : member.id)}
                    title={`${member.name} (${member.relation})${member.facilityType && member.facilityType !== '일반 주소' && member.facility ? ` - ${member.facility}` : ''}`}
                    className={cn(
                      "p-1.5 rounded-xl transition-colors",
                      isSelected
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                        member.color
                      )}
                    >
                      {member.avatar}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* Address Book Modal */}
      <AddressBookModal
        isOpen={isAddressBookOpen}
        onClose={() => setIsAddressBookOpen(false)}
      />
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
      <SecretPinModal
        isOpen={isSecretPinChangeOpen}
        onClose={() => setIsSecretPinChangeOpen(false)}
        mode="change"
        onSuccess={() => {
          setIsSecretPinChangeOpen(false);
        }}
      />

      {/* 폴더 생성 모달 */}
      <Dialog open={isCreateFolderModalOpen} onOpenChange={setIsCreateFolderModalOpen}>
        <DialogPortal>
          <DialogOverlay className="z-[80] bg-black/50" />
          <DialogContent className="z-[81] w-[340px] rounded-2xl p-6 shadow-xl sm:rounded-2xl [&>button]:hidden">
            <DialogHeader className="mb-5 flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5" style={{ color: newFolderColor }} />
                <DialogTitle className="text-lg font-semibold">새 폴더 만들기</DialogTitle>
              </div>
              <button
                onClick={() => setIsCreateFolderModalOpen(false)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </DialogHeader>

            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFolderName.trim()) {
                  createFolder.mutate({ name: newFolderName.trim(), isSecret: newFolderIsSecret, color: newFolderColor });
                  setIsCreateFolderModalOpen(false);
                }
              }}
              placeholder="폴더 이름을 입력하세요"
              className="w-full text-sm border-2 border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors mb-4"
              autoFocus
            />

            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">폴더 색상</p>
              <div className="flex items-center gap-2 flex-wrap">
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setNewFolderColor(c.value)}
                    className={cn(
                      "w-7 h-7 rounded-full transition-all",
                      newFolderColor === c.value ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-110"
                    )}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                    type="button"
                  />
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2.5 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={newFolderIsSecret}
                onChange={(e) => setNewFolderIsSecret(e.target.checked)}
                className="rounded border-border w-4 h-4"
              />
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">비밀 폴더로 설정</span>
            </label>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsCreateFolderModalOpen(false)}
                type="button"
              >
                취소
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={!newFolderName.trim()}
                onClick={() => {
                  createFolder.mutate({ name: newFolderName.trim(), isSecret: newFolderIsSecret, color: newFolderColor });
                  setIsCreateFolderModalOpen(false);
                }}
                type="button"
              >
                만들기
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </motion.aside>
  );
}
