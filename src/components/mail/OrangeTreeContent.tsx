"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar, ChevronRight, Plus,
  Home, Scale, Users, GraduationCap,
  Heart, Cake,
  Loader2, ChevronLeft, UserPlus
} from "lucide-react";
import { AddSpecialDayModal } from "./AddSpecialDayModal";
import { SpecialDayDetailModal } from "./SpecialDayDetailModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOrangeTrees, OrangeTree as OrangeTreeDB } from "@/hooks/useOrangeTrees";
import { useSpecialDays, SpecialDay as SpecialDayDB } from "@/hooks/useSpecialDays";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import {
  orangeTrees as mockOrangeTrees,
  specialDays as mockSpecialDays,
} from "@/data/mockData";
import type { SpecialDay, OrangeTree } from "@/types/mail";

// ─── 공통 유틸 ──────────────────────────────────────

const getDaysRemaining = (dateStr: string): number => {
  const targetDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDDay = (dateStr: string): string => {
  const days = getDaysRemaining(dateStr);
  if (days === 0) return "D-Day";
  if (days > 0) return `D-${days}`;
  return `D+${Math.abs(days)}`;
};

// ─── 인트로 페이지 (/letter/orangetree) ─────────────

interface OrangeTreeIntroProps {
  onClose: () => void;
  onCompose?: () => void;
}

export function OrangeTreeIntro({ onClose, onCompose }: OrangeTreeIntroProps) {
  const router = useRouter();
  const { trees: dbTrees = [], isLoading } = useOrangeTrees();
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);

  const orangeTrees: OrangeTree[] = useMemo(() => {
    if (dbTrees.length > 0) {
      return dbTrees.map((tree: OrangeTreeDB) => ({
        id: tree.id,
        personId: tree.familyMemberId,
        personName: tree.receiverName,
        relation: tree.relation,
        sentLetters: tree.leaf_count,
        receivedLetters: tree.orange_count,
        totalLetters: tree.leaf_count + tree.orange_count,
        createdAt: tree.created_at,
        isArchived: false,
        facility: "",
        prisonerNumber: "",
      }));
    }
    return mockOrangeTrees;
  }, [dbTrees]);

  const handleEnter = () => {
    if (selectedTreeId) {
      router.push(`/letter/orangetree/${selectedTreeId}`);
    } else if (orangeTrees.length > 0) {
      router.push(`/letter/orangetree/${orangeTrees[0].id}`);
    }
  };

  const animationDelay = 0.8;
  const animationDuration = 1.5;
  const closedPath = "M181 302 L0 302 L0 33 L181 33 Z";
  const openPath = "M151 269 L0 301 L0 34 L151 0 Z";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fffdf6]">
      <header className="hidden md:flex h-14 border-b border-border/40 bg-white items-center justify-between px-4">
        <h1 className="text-lg font-bold text-foreground">오렌지 나무</h1>
        <button onClick={handleEnter} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          건너뛰기
        </button>
      </header>

      <div className="flex-1 overflow-auto flex flex-col items-center px-4 py-12 md:py-[90px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6 items-center max-w-[715px] text-center mb-12"
        >
          <h2 className="text-size-22 text-[#4a2e1b] tracking-[-0.44px] leading-[1.4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            오렌지 나무, 시작
          </h2>
          <div className="flex flex-col gap-[15px] text-size-18 text-[#4a2e1b] tracking-[-0.36px] leading-[1.8]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            <p>오렌지나무는 한 사람을 기다리는 시간을<br />&lsquo;기록&rsquo;으로 남깁니다.</p>
            <p>편지를 쓰는 순간마다 잎이 하나씩 쌓이고,<br />시간이 지나며 나무는 조금씩 자라납니다.</p>
          </div>
        </motion.div>

        <div className="relative w-[160px] h-[232px] md:w-[208px] md:h-[302px]">
          <svg viewBox="0 0 208 302" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
            <defs>
              <radialGradient id="leaf1Gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(117.498 245.5) rotate(-50.4836) scale(88.7947 22.2278)">
                <stop offset="0.41" stopColor="#12491D"/><stop offset="0.64" stopColor="#237D26"/><stop offset="0.98" stopColor="#539F00"/>
              </radialGradient>
              <radialGradient id="leaf2Gradient" cx="0" cy="0" r="1" gradientTransform="matrix(16.8096 -37.3977 -37.7427 -17.5954 273.438 -7.89539)" gradientUnits="userSpaceOnUse">
                <stop offset="0.0288462" stopColor="#12491D"/><stop offset="0.413462" stopColor="#237D26"/><stop offset="0.870192" stopColor="#539F00"/>
              </radialGradient>
              <radialGradient id="leaf3Gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(153.998 234.5) rotate(39.44) scale(40.1404 15.1055)">
                <stop offset="0.41" stopColor="#12491D"/><stop offset="0.64" stopColor="#237D26"/><stop offset="0.98" stopColor="#539F00"/>
              </radialGradient>
              <linearGradient id="frontGradient" x1="0" y1="150" x2="181" y2="150" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFDF6"/><stop offset="1" stopColor="#FAF6E6"/>
              </linearGradient>
            </defs>
            <rect x="0" y="33" width="181" height="269" fill="#D7D3C2"/>
            <motion.g initial={{ x: -80 }} animate={{ x: 0 }} transition={{ delay: animationDelay, duration: animationDuration, ease: "easeInOut" }}>
              <path d="M172.446 212.214C170.773 214.111 166.616 215.868 164.078 216.998C159.308 219.118 153.408 216.021 153.268 215.045C153.129 214.083 150.967 214.041 150.702 213.176C149.739 210.052 152.654 205.407 152.529 200.609C152.403 195.783 156.518 191.892 157.955 190.204C158.485 189.59 161.232 183.914 165.277 182.101C169.475 180.218 171.316 175.266 171.4 174.792C171.526 174.067 176.645 175.587 178.667 182.059C179.253 183.956 181.596 187.191 181.819 189.869C182.168 194.096 182.447 193.747 180.815 199.549C180.006 202.436 179.922 204.012 177.997 206.927C176.937 208.545 174.413 209.954 172.46 212.158L172.446 212.214Z" fill="url(#leaf1Gradient)"/>
              <path d="M169.992 189.73C169.113 192.408 167.146 197.918 163.562 202.911C159.196 208.992 155.974 212.8 152.557 215.673C150.646 217.291 141.566 222.591 139.837 223.442C138.121 224.293 138.289 222.284 139.195 221.768C140.102 221.252 150.005 215.799 151.009 214.822C152.013 213.846 155.458 211.6 159.629 206.119C164.413 199.829 168.123 192.032 168.723 190.149C169.183 188.684 170.508 185.058 171.233 181.557C171.889 178.377 171.986 176.215 171.986 176.215C172.154 176.536 172.447 178.963 171.93 181.878C171.512 184.235 170.884 186.997 169.992 189.73Z" fill="#5CA708"/>
              <path d="M188.479 227.739C186.541 228.478 182.936 228.369 180.692 228.329C176.497 228.262 173.617 224.476 173.908 223.804C174.199 223.132 172.703 222.464 172.852 221.811C173.432 219.485 177.336 217.346 179.166 214.188C181.006 211.015 185.452 209.73 187.134 209.054C187.749 208.808 191.953 205.955 195.507 205.989C199.209 206.03 202.483 203.359 202.724 203.084C203.102 202.655 206.074 205.191 204.884 210.009C204.537 211.429 204.871 214.234 203.954 216.042C202.506 218.891 202.844 218.751 199.364 222.042C197.642 223.678 196.945 224.675 194.424 225.991C193.028 226.722 190.706 226.881 188.451 227.73L188.479 227.739Z" fill="url(#leaf2Gradient)"/>
              <path d="M196.028 212.128C194.309 213.607 190.663 216.619 186.082 218.803C180.504 221.461 176.652 222.977 173.057 223.824C171.038 224.305 162.424 225.034 160.854 225.062C159.285 225.089 160.229 223.839 161.08 223.776C161.932 223.712 171.187 223.137 172.296 222.796C173.406 222.454 176.777 222.029 181.97 219.707C187.937 217.036 193.752 213.077 194.938 212.022C195.859 211.194 198.291 209.226 200.226 207.164C201.998 205.287 202.936 203.903 202.936 203.903C202.932 204.16 202.14 205.834 200.58 207.588C199.323 209.002 197.757 210.622 196.002 212.132L196.028 212.128Z" fill="#89C237"/>
              <path d="M150.998 224.5C148.879 224.725 160.78 232.713 160.415 231.293C160.262 230.699 170.316 248.151 174.079 255.342C179.516 265.697 179.163 266.413 179.421 266.964C179.489 267.098 184.31 259.892 183.933 256.223C183.484 251.983 186.108 246.354 184.016 241.399C182.32 237.362 178.648 233.651 176.425 229.678C172.14 222.031 161.032 222.827 152.823 223.701L150.998 224.5Z" fill="url(#leaf3Gradient)"/>
              <path d="M168.378 247.907C167.143 245.54 164.835 239.815 160.661 235.594C155.584 230.466 152.473 225.81 148.129 225.011C145.518 224.531 141.26 223.012 139.479 222.406C137.695 221.814 137.892 223.692 138.844 224.072C139.796 224.452 144.945 225.685 146.199 226.242C147.997 227.06 152.607 228.453 156.565 233.659C161.156 239.685 162.063 243.15 165.455 247.685C166.691 249.335 170.799 253.281 172.656 256.199C174.669 259.347 177.892 264.704 177.892 264.704C178.013 264.395 175.046 258.774 174.138 256.137C173.409 254.013 169.634 250.332 168.39 247.923L168.378 247.907Z" fill="#6E9337"/>
              <path d="M156.474 223.162C155.297 222.777 146.889 222.937 146.509 226.123C146.372 227.27 146.248 227.585 147.723 228.005C149.198 228.425 156.135 232.95 160.033 238.872C161.263 240.742 163.518 246.538 168.743 252.676C175.659 260.796 179.116 267.349 179.382 267.41C179.55 267.444 178.056 263.331 177.826 257.172C177.725 254.647 174.673 249.716 174.525 245.649C174.389 241.842 169.39 235.746 166.701 230.786C164.626 226.949 160.504 224.475 156.472 223.176L156.474 223.162Z" fill="#97C653"/>
            </motion.g>
            <motion.path initial={{ d: closedPath }} animate={{ d: openPath }} transition={{ delay: animationDelay, duration: animationDuration, ease: "easeInOut" }} fill="url(#frontGradient)" />
          </svg>
        </div>

        {/* 푯말 선택 영역 */}
        {orangeTrees.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay + animationDuration + 0.3, duration: 0.6 }}
            className="flex flex-col items-center gap-4 mt-24 mb-4 w-full max-w-[500px]"
          >
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {orangeTrees.map((tree, index) => (
                <motion.button
                  key={tree.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: animationDelay + animationDuration + 0.5 + index * 0.15, duration: 0.4 }}
                  onClick={() => setSelectedTreeId(tree.id)}
                  className={`rounded-full px-5 py-0.5 text-size-15 font-medium border-2 transition-all ${
                    selectedTreeId === tree.id
                      ? "border-[#875e42] bg-[#875e42] text-white shadow-md"
                      : "border-[#875e42]/40 text-[#875e42] hover:border-[#875e42] hover:bg-[#875e42]/5"
                  }`}
                  style={{ fontFamily: "'Pretendard', sans-serif" }}
                >
                  {tree.personName}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: animationDelay + animationDuration, duration: 0.5 }}
          onClick={handleEnter}
          disabled={isLoading || orangeTrees.length === 0}
          className="border border-[#d7d3c2] px-[30px] py-[9px] text-size-18 text-[#875e42] tracking-[-0.36px] leading-[1.8] font-semibold mt-auto mb-10 hover:bg-[#875e42]/10 transition-colors disabled:opacity-50"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          + 오렌지나무 입장하기
        </motion.button>
      </div>
    </div>
  );
}

// ─── 나무 상세 페이지 (/letter/orangetree/[treeId]) ──

interface OrangeTreeDetailProps {
  treeId: string;
  onCompose?: () => void;
}

export function OrangeTreeDetail({ treeId, onCompose }: OrangeTreeDetailProps) {
  const router = useRouter();

  // DB에서 나무 데이터
  const { trees: dbTrees = [], isLoading: treesLoading } = useOrangeTrees();

  const orangeTrees: OrangeTree[] = useMemo(() => {
    if (dbTrees.length > 0) {
      return dbTrees.map((tree: OrangeTreeDB) => ({
        id: tree.id,
        personId: tree.familyMemberId,
        personName: tree.receiverName,
        relation: tree.relation,
        sentLetters: tree.leaf_count,
        receivedLetters: tree.orange_count,
        totalLetters: tree.leaf_count + tree.orange_count,
        createdAt: tree.created_at,
        isArchived: false,
        facility: "",
        prisonerNumber: "",
      }));
    }
    return mockOrangeTrees;
  }, [dbTrees]);

  const selectedTree = useMemo(() =>
    orangeTrees.find(t => t.id === treeId) || orangeTrees[0],
    [treeId, orangeTrees]
  );

  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<SpecialDay | null>(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState<1 | 2>(1);

  const { familyMembers } = useFamilyMembers();
  const { specialDays: dbSpecialDays } = useSpecialDays(treeId || null);

  const specialDays: SpecialDay[] = useMemo(() => {
    if (dbSpecialDays.length > 0) {
      return dbSpecialDays.map((day: SpecialDayDB) => ({
        id: day.id,
        treeId: day.tree_id,
        type: day.type as SpecialDay["type"],
        title: day.title,
        date: day.date,
        description: day.description || undefined,
        isGolden: false,
      }));
    }
    return mockSpecialDays.filter(d => d.treeId === treeId);
  }, [dbSpecialDays, treeId]);

  const selectedRecipientName = useMemo(() => {
    if (selectedRecipientId) {
      const member = familyMembers.find(m => m.id === selectedRecipientId);
      return member?.name || null;
    }
    return selectedTree?.personName || null;
  }, [selectedRecipientId, familyMembers, selectedTree]);

  const nearestSpecialDays = useMemo(() => {
    return specialDays
      .filter(d => d.treeId === treeId)
      .sort((a, b) => Math.abs(getDaysRemaining(a.date)) - Math.abs(getDaysRemaining(b.date)))
      .slice(0, 3);
  }, [treeId, specialDays]);

  const handleSelectRecipient = (id: string, name: string) => {
    setSelectedRecipientId(id);
    setIsPopoverOpen(false);
    const tree = orangeTrees.find(t => t.personName === name);
    if (tree) {
      router.push(`/letter/orangetree/${tree.id}`);
    }
  };

  const handleDayClick = (day: SpecialDay) => {
    setSelectedDay(day);
    setShowDetailModal(true);
  };

  const handleWriteLetterFromDetail = () => {
    setShowDetailModal(false);
    onCompose?.();
  };

  if (treesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fffcf2]">
      {/* Header */}
      <header className="hidden md:flex h-14 border-b border-border/40 bg-white items-center justify-between px-4 shrink-0">
        <h1 className="text-lg font-bold text-foreground">오렌지 나무</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">그곳의 날씨</span>
          <span className="text-[#e85a2c] font-medium">23°(최고)</span>
          <span className="text-[#2c7be8] font-medium">10°(최저)</span>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-auto overflow-x-hidden">
        <div className="flex flex-col items-center justify-end w-full min-h-full">

          {/* 타이틀 영역 */}
          <motion.div
            className="flex flex-col gap-6 items-center justify-center h-[339px] w-full px-4 shrink-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-[10px] flex-wrap justify-center">
              <span className="text-size-22 text-[#4a2e1b] tracking-[-0.44px] leading-[1.4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                나의
              </span>
              {currentStage === 1 ? (
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <motion.button
                      className="flex items-center justify-center min-w-[111px] h-[42px] border-2 border-[#875e42] rounded-[2px] px-[14px] py-1 hover:bg-[#f5f0e5] transition-colors cursor-pointer"
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-size-24 text-[#4a2e1b] tracking-[-0.48px] leading-[1.4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                        {selectedRecipientName || "?"}
                      </span>
                    </motion.button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-0 bg-white" align="center">
                    <div className="flex flex-col">
                      {familyMembers.length > 0 && (
                        <div className="border-b border-gray-100">
                          <div className="px-3 py-2 text-xs text-gray-500 font-medium">수신자 선택</div>
                          {familyMembers.map((member) => (
                            <button
                              key={member.id}
                              onClick={() => handleSelectRecipient(member.id, member.name)}
                              className="w-full px-3 py-2.5 text-left hover:bg-[#fff8f0] transition-colors flex items-center gap-3"
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${member.color || 'bg-orange-100 text-orange-600'}`}>
                                {member.avatar || member.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-[#4a2e1b]">{member.name}</span>
                                <span className="text-xs text-gray-400">{member.relation}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => { setIsPopoverOpen(false); onCompose?.(); }}
                        className="w-full px-3 py-3 text-left hover:bg-[#fff8f0] transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#875e42] flex items-center justify-center">
                          <UserPlus className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-[#875e42]">수신자 등록하기</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="flex items-center justify-center min-w-[111px] h-[42px] border-2 border-[#875e42] rounded-[2px] px-[14px] py-1">
                  <span className="text-size-24 text-[#4a2e1b] tracking-[-0.48px] leading-[1.4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                    {selectedRecipientName || "?"}
                  </span>
                </div>
              )}
              <span className="text-size-22 text-[#4a2e1b] tracking-[-0.44px] leading-[1.4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                오렌지 나무
              </span>
            </div>

            <div className="flex flex-col items-center gap-[15px] text-size-16 text-[#4a2e1b] tracking-[-0.32px] leading-[1.8] text-center" style={{ fontFamily: "'Jeju Myeongjo', serif" }}>
              {currentStage === 1 ? (
                <>
                  <div>
                    <p>&quot;이 나무는 한 사람을 기다리는 마음에서 시작되었습니다.&quot;</p>
                    <p>오렌지 나무는 주고받은 마음이 이어져 온 시간과 흔적을 조용히 남깁니다.</p>
                  </div>
                  <div>
                    <p>아직 편지를 써보지 않았다면,</p>
                    <p>수신자 등록만 미리 해봐도 괜찮아요.</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p>&quot;작은 변화가 시작되었습니다.&quot;</p>
                    <p>이 나무는 쉽게 끊어지지 않는 마음을 조금 더 깊게 붙잡고 있습니다.</p>
                  </div>
                  <div>
                    <p>안쪽에서는 그 마음이 아직 이어지고 있다는 사실이</p>
                    <p>조용히 전해지고 있습니다.</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* 벽 + 새싹 + 바닥 컨테이너 */}
          <div className="flex flex-col items-center justify-center w-full shrink-0">
            <div className="relative w-full h-[380px] overflow-hidden -mb-[1px]">
              <img src="/orange-tree-wall.png" alt="" className="absolute left-0 w-full h-[126%] object-cover block" style={{ top: '-26%' }} />
              <img src="/top1.png" alt="" className="absolute top-0 left-0 w-full h-auto z-10" />

              {currentStage > 1 && (
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-20"
                  onClick={() => setCurrentStage(1)}
                >
                  <ChevronLeft className="w-6 h-6 text-[#875e42]" />
                </button>
              )}
              {currentStage < 2 && (
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-20"
                  onClick={() => setCurrentStage(2)}
                >
                  <ChevronRight className="w-6 h-6 text-[#875e42]" />
                </button>
              )}
            </div>

            <div className="relative w-full -mt-[1px]">
              <img src="/orange-tree-bottom.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="w-[400px] h-[368px] -mt-[280px]">
                  {currentStage === 1 ? (
                    <video src="/sprout-animation-transparent.webm" autoPlay loop muted playsInline className="w-full h-full object-contain" />
                  ) : (
                    <img src="/step-2-img.png" alt="성장한 새싹" className="w-full h-full object-contain" />
                  )}
                </div>

                <div className="relative flex flex-col items-center justify-center gap-[18px] w-full px-4 pt-[15px] pb-[50px]">
                  <div className="absolute flex flex-col items-center" style={{ left: 'calc(50% + 240px)', top: '-80px' }}>
                    <img src="/sign-post.png" alt="팻말" className="w-[140px] h-auto" />
                    <span className="absolute top-[35px] text-size-24 text-[#4a2e1b] font-bold" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                      {selectedRecipientName || "?"}
                    </span>
                  </div>

                  <div className="text-size-15 text-[#7c522d] leading-[1.87] text-center" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                    <p>이 나무 아래에는 아직 오지 않은 날들이 대기하고 있습니다.</p>
                    <p>스케줄에서 등록한 일정 중 얼마 남지않은 순으로 노출됩니다</p>
                  </div>

                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    {nearestSpecialDays.length > 0 ? (
                      nearestSpecialDays.map((day) => (
                        <div
                          key={day.id}
                          className="bg-[#d1ab8a] rounded-[46px] px-[22px] py-3 flex items-center gap-2 cursor-pointer hover:bg-[#c49a79] transition-colors"
                          onClick={() => handleDayClick(day)}
                        >
                          <span className="text-[#ffe9d6] font-bold text-size-15 tracking-[-0.3px] leading-[1.4]" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                            {formatDDay(day.date)}
                          </span>
                          <span className="text-[#ffe9d6] font-medium text-size-15 tracking-[-0.3px] leading-[1.4]" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                            {day.title}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="bg-[#d1ab8a]/50 rounded-[46px] px-[22px] py-3 flex items-center gap-2">
                        <span className="text-[#ffe9d6] font-medium text-size-15 tracking-[-0.3px]">등록된 소중한 날이 없어요</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setShowAddDayModal(true)}
                    className="text-sm text-[#875e42] font-medium flex items-center gap-1 hover:bg-[#875e42]/5 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    소중한 날 추가
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <AddSpecialDayModal
        isOpen={showAddDayModal}
        onClose={() => setShowAddDayModal(false)}
        onAdd={(newDay) => {
          console.log("New special day added:", newDay);
          setShowAddDayModal(false);
        }}
      />

      {selectedDay && (
        <SpecialDayDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          specialDay={{
            id: parseInt(selectedDay.id.replace(/\D/g, '') || '0'),
            type: selectedDay.type,
            title: selectedDay.title,
            date: selectedDay.date,
            description: selectedDay.description || ""
          }}
          onWriteLetter={handleWriteLetterFromDetail}
        />
      )}
    </div>
  );
}
