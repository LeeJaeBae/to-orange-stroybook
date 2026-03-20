'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, X, Check, ExternalLink, Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { mockFamilyMembers as familyMembers } from "./schedule-utils";

// 자주 찾는 장소 타입
export interface FrequentPlace {
  id: string;
  type: "home" | "custom";
  name: string;
  address: string;
  facilityName?: string;
  personName?: string;
}

// 숙박 카드 데이터
const nearbyAccommodations = [
  { id: 1, name: "비즈니스호텔 서울", distance: "2.3", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=120&fit=crop" },
  { id: 2, name: "역세권 모텔", distance: "1.8", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=200&h=120&fit=crop" },
  { id: 3, name: "편안한 게스트하우스", distance: "3.1", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200&h=120&fit=crop" },
];

// 면회 준비물 체크리스트 (공통)
export const VISIT_CHECKLIST = [
  { id: 1, text: "신분증 (주민등록증, 운전면허증)", checked: false },
  { id: 2, text: "면회 신청서 (사전 작성)", checked: false },
  { id: 3, text: "영치금 (필요시)", checked: false },
  { id: 4, text: "편한 복장 착용", checked: false },
  { id: 5, text: "휴대폰/전자기기 보관 준비", checked: false },
];

// 주변 숙박업소 데이터 (공통)
export const NEARBY_HOTELS = [
  { name: "○○ 호텔", distance: "500m", price: "65,000원~", rating: 4.2 },
  { name: "△△ 모텔", distance: "800m", price: "45,000원~", rating: 3.8 },
  { name: "□□ 게스트하우스", distance: "1.2km", price: "35,000원~", rating: 4.0 },
];

// 교통편 정보 (공통)
export const TRANSPORT_INFO = {
  publicTransport: "지하철 2호선 ○○역 3번 출구에서 도보 15분, 또는 버스 123번 이용",
  car: "네비게이션 '○○교도소' 검색, 주차장 이용 가능 (무료)",
  estimatedTime: "서울역 기준 약 1시간 30분 소요",
};

// 숙박 정보 카드 섹션 (공통 컴포넌트)
export function AccommodationCardsSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h4 className="font-bold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground mt-1 mb-4">{description}</p>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {nearbyAccommodations.map((acc) => (
          <div key={acc.id} className="flex-shrink-0 w-40 bg-white rounded-lg overflow-hidden border border-border/40">
            <div className="h-20 bg-gray-200">
              <img src={acc.image} alt={acc.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-2">
              <p className="text-sm font-medium truncate">{acc.name}</p>
              <p className="text-xs text-muted-foreground">교정시설 기준 약 {acc.distance}km</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-gray-600 font-medium py-2 border border-border/60 rounded-lg hover:bg-gray-100">
        <Map className="w-4 h-4" />
        지도에서 위치 확인
      </button>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        숙박 정보는 교정시설 위치 기준이며, 실제 이용 조건은 숙소별로 다를 수 있습니다.
      </p>
    </div>
  );
}

// 접견 안내 섹션 컴포넌트
export function ConsultationGuideSection({ facility }: { facility?: string }) {
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);
  const [isProcessExpanded, setIsProcessExpanded] = useState(false);

  return (
    <div className="mt-6 pt-4 border-t border-border/40 space-y-4">
      <div className="bg-orange-50 rounded-xl p-4">
        <button
          onClick={() => setIsGuideExpanded(!isGuideExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div>
            <h4 className="font-bold text-foreground text-left">접견 전에 꼭 알아두세요</h4>
            <p className="text-sm text-muted-foreground text-left mt-1">처음 접견이라면 특히 아래 준비사항을 확인하세요.</p>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isGuideExpanded ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isGuideExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">변호사 신분증</p>
                      <p className="text-xs text-muted-foreground">대한변호사협회 발급 변호사증</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">사건 기본 정보</p>
                      <p className="text-xs text-muted-foreground">재소자 이름, 수용번호(또는 생년월일), 수용기관명</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <button
          onClick={() => setIsProcessExpanded(!isProcessExpanded)}
          className="w-full flex items-center justify-between"
        >
          <h4 className="font-bold text-foreground">교도소에 도착하면 이렇게 진행돼요</h4>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isProcessExpanded ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isProcessExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-orange-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">민원실 / 접견 접수 창구 방문</p>
                    <p className="text-xs text-muted-foreground">&quot;변호사 접견 신청하러 왔습니다&quot;라고 말씀하세요</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-orange-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">접견 신청서 작성</p>
                    <p className="text-xs text-muted-foreground">변호사 정보, 접견 대상자 정보 기입</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-orange-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">신분 확인 후 대기</p>
                    <p className="text-xs text-muted-foreground">변호사증 제시 → 전산 확인 → 접견 대기</p>
                  </div>
                </div>
              </div>

              {facility && (
                <div className="mt-4 pt-3 border-t border-border/40">
                  <button className="w-full flex items-center justify-center gap-2 text-sm text-orange-600 font-medium hover:text-orange-700">
                    <ExternalLink className="w-4 h-4" />
                    {facility} 공식 안내 확인하기
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AccommodationCardsSection
        title="접견 일정으로 숙박이 필요한 경우"
        description="접견은 대기 시간이나 연속 일정으로 당일 이동이 어려울 수 있습니다."
      />
    </div>
  );
}

// 면회 안내 섹션 컴포넌트
export function VisitGuideSection({ facility }: { facility?: string }) {
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);

  return (
    <div className="mt-6 pt-4 border-t border-border/40 space-y-4">
      <div className="bg-orange-50 rounded-xl p-4">
        <button
          onClick={() => setIsGuideExpanded(!isGuideExpanded)}
          className="w-full flex items-center justify-between"
        >
          <h4 className="font-bold text-foreground text-left">면회 전에 꼭 확인하세요</h4>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isGuideExpanded ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isGuideExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-sm text-muted-foreground mt-3 mb-4">
                면회는 항상 가능한 것이 아니며,<br />
                교정시설별 규정과 재소자 상태에 따라 제한될 수 있습니다.<br />
                방문 전 면회 가능 여부와 신분증 지참 여부를 꼭 확인하세요.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AccommodationCardsSection
        title="이 장소 근처에서 머물러야 한다면"
        description="면회 일정은 이동 거리와 시간에 따라 하루 일정이 크게 달라질 수 있습니다."
      />
    </div>
  );
}

// 장소 등록 모달 컴포넌트
export function PlaceRegistrationModal({
  type,
  onClose,
  onSave
}: {
  type: "home" | "custom";
  onClose: () => void;
  onSave: (place: FrequentPlace) => void;
}) {
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [customName, setCustomName] = useState(type === "home" ? "집" : "");
  const [customAddress, setCustomAddress] = useState("");
  const [mode, setMode] = useState<"select" | "custom">(type === "home" ? "custom" : "select");

  const handleSelectRecipient = (memberId: string) => {
    setSelectedRecipient(memberId);
    setMode("select");
  };

  const handleSave = () => {
    if (mode === "select" && selectedRecipient) {
      const member = familyMembers.find(m => m.id === selectedRecipient);
      if (member) {
        onSave({
          id: `place-${Date.now()}`,
          type,
          name: type === "home" ? "집" : member.facility,
          address: member.facilityAddress,
          facilityName: member.facility,
          personName: member.name,
        });
      }
    } else if (mode === "custom" && customName.trim() && customAddress.trim()) {
      onSave({
        id: `place-${Date.now()}`,
        type,
        name: customName.trim(),
        address: customAddress.trim(),
      });
    }
  };

  const isValid = mode === "select"
    ? selectedRecipient !== null
    : customName.trim() !== "" && customAddress.trim() !== "";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative z-10 w-full max-w-md mx-4 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border/40 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {type === "home" ? "집 주소 등록" : "자주 가는 곳 등록"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {type === "custom" && (
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setMode("select")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                  mode === "select"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                수신자 장소 선택
              </button>
              <button
                onClick={() => setMode("custom")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                  mode === "custom"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                직접 입력
              </button>
            </div>
          )}

          {mode === "select" && type === "custom" ? (
            <>
              <p className="text-sm text-muted-foreground">
                수신자가 있는 시설을 선택하세요
              </p>
              <div className="space-y-2">
                {familyMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleSelectRecipient(member.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      selectedRecipient === member.id
                        ? "border-orange-400 bg-orange-50"
                        : "border-border hover:border-orange-200 hover:bg-orange-50/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-medium">
                        {member.avatar || member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">
                          {member.name} <span className="text-muted-foreground text-sm">({member.relation})</span>
                        </p>
                        <p className="text-sm text-orange-600 font-medium">{member.facility}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.facilityAddress}</p>
                      </div>
                      {selectedRecipient === member.id && (
                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {type === "home" ? "집 주소를 입력해주세요" : "새로운 장소 정보를 직접 입력하세요"}
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    장소 이름 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="예: 우리집, 회사, 본가"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    주소 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="예: 서울특별시 강남구 테헤란로 123"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    정확한 주소를 입력해주세요
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-border/40 px-6 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white"
            disabled={!isValid}
            onClick={handleSave}
          >
            <Check className="w-4 h-4 mr-2" />
            등록하기
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
