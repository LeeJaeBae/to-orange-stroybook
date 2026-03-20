'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Calendar, Clock, Tag, User, MapPin, FileText, Plus, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AddressSearch, type AddressResult } from "@/components/ui/AddressSearch";
import { cn } from "@/lib/utils";
import { useSchedules, type CreateScheduleInput, type ScheduleType } from "@/hooks/useSchedules";
import { useScheduleTags, TAG_COLOR_PALETTE } from "@/hooks/useScheduleTags";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { formatDateStr, typeIcons, typeColors } from "./schedule-utils";
import { categoryConfigs } from "./create/category-config";
import { SubtypeChips } from "./create/SubtypeChips";
import { FacilityPicker } from "./create/FacilityPicker";
import { toast } from "sonner";

// 일정 타입 옵션
const SCHEDULE_TYPE_OPTIONS: { type: ScheduleType; label: string }[] = [
  { type: 'custom', label: '일반' },
  { type: 'birthday', label: '생일' },
  { type: 'anniversary', label: '기념일' },
  { type: 'visit', label: '접견' },
  { type: 'letter', label: '편지' },
  { type: 'health', label: '건강' },
  { type: 'program', label: '교육' },
  { type: 'trial', label: '재판' },
  { type: 'consultation', label: '상담' },
  { type: 'release', label: '출소' },
];

interface ScheduleCreateSheetProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string; // YYYY-MM-DD
}

export function ScheduleCreateSheet({ open, onClose, initialDate }: ScheduleCreateSheetProps) {
  const defaultDate = initialDate || formatDateStr(new Date());

  // 폼 상태
  const [selectedType, setSelectedType] = useState<ScheduleType>('custom');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [description, setDescription] = useState('');
  const [showMemo, setShowMemo] = useState(false);
  const [showTagCreate, setShowTagCreate] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('');
  const [showFamilyPicker, setShowFamilyPicker] = useState(false);
  const [subtype, setSubtype] = useState('');
  const [showAddressSearch, setShowAddressSearch] = useState(false);

  // 훅
  const { createSchedule, isCreating } = useSchedules();
  const { tags, nextAutoColor, createTag, isCreating: isCreatingTag } = useScheduleTags();
  const { familyMembers = [] } = useFamilyMembers();
  const pendingTagColor = newTagColor || nextAutoColor;

  // 수신자 선택 시 장소/위치 자동 채움
  const handleSelectFamilyMember = (memberId: string) => {
    setSelectedFamilyMemberId(memberId);
    setShowFamilyPicker(false);
    const member = familyMembers.find((m: any) => m.id === memberId);
    if (member) {
      if (member.facility) setLocation(member.facility);
      if (member.facilityAddress) setLocationAddress(member.facilityAddress);
    }
  };

  // 태그 생성
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag({ name: newTagName.trim(), color: pendingTagColor });
    if (tag) {
      setSelectedTagId(tag.id);
      setNewTagName('');
      setNewTagColor('');
      setShowTagCreate(false);
    }
  };

  const handleAddressSelect = (result: AddressResult) => {
    setLocationAddress(result.roadAddr);
    if (!location.trim() && result.bdNm) {
      setLocation(result.bdNm);
    }
    setShowAddressSearch(false);
  };

  // 일정 등록
  const handleSubmit = async () => {
    if (!title.trim() || !date) return;
    if (config?.showRecipient === 'required' && !selectedFamilyMemberId) {
      toast.warning('수신자를 선택해주세요');
      return;
    }

    const input: CreateScheduleInput = {
      title: title.trim(),
      type: selectedType,
      date,
      time: isAllDay ? undefined : (time || undefined),
      tagId: selectedTagId || undefined,
      familyMemberId: selectedFamilyMemberId || undefined,
      location: location || undefined,
      locationAddress: locationAddress || undefined,
      description: description || undefined,
    };

    const result = await createSchedule(input);
    if (result) {
      onClose();
    }
  };

  const selectedMember = familyMembers.find((m: any) => m.id === selectedFamilyMemberId);
  const selectedTag = tags.find(t => t.id === selectedTagId);
  const config = categoryConfigs[selectedType];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* 바텀시트 (모바일) / 중앙 모달 (데스크톱) */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-6 z-50"
          >
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col w-full sm:max-w-md" onClick={(e) => e.stopPropagation()}>
              {/* 헤더 */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 rounded-full bg-gray-300 sm:hidden absolute top-2 left-1/2 -translate-x-1/2" />
                  <h2 className="text-lg font-semibold">새 일정</h2>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* 폼 */}
              <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
                {/* 일정 타입 */}
                <div className="flex flex-wrap gap-1.5">
                  {SCHEDULE_TYPE_OPTIONS.map(({ type, label }) => {
                    const Icon = typeIcons[type];
                    const colors = typeColors[type] || typeColors.custom;
                    const isSelected = selectedType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedType(type);
                          setSubtype('');
                          if (!title || SCHEDULE_TYPE_OPTIONS.some(o => o.label === title) || categoryConfigs[selectedType]?.subtypes?.some(s => s.label === title)) {
                            setTitle(label);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                          isSelected
                            ? cn("border-transparent text-white shadow-sm", colors.bgColor)
                            : "border-border/60 text-foreground/70 hover:border-border"
                        )}
                      >
                        {isSelected && (
                          <Icon className="w-3.5 h-3.5" />
                        )}
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* 제목 */}
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="일정 제목"
                  className="text-lg font-medium h-12 border-0 border-b border-border/40 rounded-none px-0 focus-visible:ring-0 focus-visible:border-orange-400"
                  autoFocus
                />

                {/* 날짜 / 시간 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 flex-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent text-sm font-medium outline-none flex-1"
                      />
                    </div>
                    {!isAllDay && (
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          placeholder="시간"
                          className="bg-transparent text-sm font-medium outline-none w-20"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setIsAllDay(!isAllDay); if (!isAllDay) setTime(''); }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                      isAllDay
                        ? "bg-orange-50 text-orange-600 font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                      isAllDay ? "bg-orange-500 border-orange-500" : "border-gray-300"
                    )}>
                      {isAllDay && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    하루종일
                  </button>
                </div>

                {/* 카테고리별 안내 배너 */}
                {config?.banner && (
                  <div className="px-3 py-2.5 bg-orange-50 rounded-lg">
                    <p className="text-xs text-orange-600">{config.banner}</p>
                  </div>
                )}

                {/* 서브타입 선택 */}
                {config?.subtypes && config.subtypeLabel && (
                  <SubtypeChips
                    label={config.subtypeLabel}
                    options={config.subtypes}
                    value={subtype}
                    onChange={(val) => {
                      setSubtype(val);
                      if (val && (!title || SCHEDULE_TYPE_OPTIONS.some(o => o.label === title) || config.subtypes?.some(s => s.label === title))) {
                        setTitle(val);
                      }
                    }}
                  />
                )}

                {/* 시설 선택 (접견/상담) */}
                {config?.showFacilityPicker && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">시설 선택</span>
                    </div>
                    <FacilityPicker
                      familyMembers={familyMembers}
                      selectedFamilyMemberId={selectedFamilyMemberId}
                      onSelectFamilyMember={handleSelectFamilyMember}
                      onSelectFacility={(name, address) => {
                        setLocation(name);
                        setLocationAddress(address);
                      }}
                    />
                  </div>
                )}

                {/* 태그 */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">태그</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => setSelectedTagId(selectedTagId === tag.id ? null : tag.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                          selectedTagId === tag.id
                            ? "border-transparent text-white shadow-sm"
                            : "border-border/60 text-foreground/80 hover:border-border"
                        )}
                        style={selectedTagId === tag.id ? { backgroundColor: tag.color } : undefined}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </button>
                    ))}

                    {/* 태그 추가 버튼 */}
                    {!showTagCreate && (
                      <button
                        onClick={() => {
                          setNewTagName('');
                          setNewTagColor('');
                          setShowTagCreate(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-muted-foreground border border-dashed border-border/60 hover:border-orange-300 hover:text-orange-500 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        새 태그
                      </button>
                    )}
                  </div>

                  {/* 태그 생성 인라인 */}
                  {showTagCreate && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 bg-gray-50 rounded-xl space-y-3"
                    >
                      <Input
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="태그 이름"
                        className="h-9 text-sm"
                        autoFocus
                      />
                      <div className="flex flex-wrap gap-2">
                        {TAG_COLOR_PALETTE.map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewTagColor(color)}
                            className={cn(
                              "w-7 h-7 rounded-full transition-all",
                              pendingTagColor === color && "ring-2 ring-offset-2 ring-gray-400"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setShowTagCreate(false); setNewTagName(''); setNewTagColor(''); }}
                          className="flex-1"
                        >
                          취소
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleCreateTag}
                          disabled={!newTagName.trim() || isCreatingTag}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          {isCreatingTag ? <Loader2 className="w-4 h-4 animate-spin" /> : '추가'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* 수신자 */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      수신자
                      {config?.showRecipient === 'required' && <span className="text-red-500 ml-0.5">*</span>}
                      {config?.showRecipient === 'recommended' && <span className="text-orange-400 ml-1 text-xs">(권장)</span>}
                    </span>
                  </div>
                  {selectedMember ? (
                    <div className="flex items-center justify-between bg-orange-50 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-xs font-medium">
                          {(selectedMember as any).name?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{(selectedMember as any).name}</span>
                      </div>
                      <button
                        onClick={() => { setSelectedFamilyMemberId(null); setLocation(''); setLocationAddress(''); }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        변경
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowFamilyPicker(!showFamilyPicker)}
                      className="w-full text-left px-3 py-2.5 rounded-lg border border-border/60 text-sm text-muted-foreground hover:border-orange-300 transition-colors"
                    >
                      수신자 선택 (선택사항)
                    </button>
                  )}

                  {/* 가족 구성원 리스트 */}
                  {showFamilyPicker && familyMembers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 border border-border/40 rounded-xl overflow-hidden"
                    >
                      {familyMembers.map((member: any) => (
                        <button
                          key={member.id}
                          onClick={() => handleSelectFamilyMember(member.id)}
                          className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors border-b border-border/20 last:border-b-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-xs font-medium">
                            {member.name?.charAt(0)}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-medium">{member.name}</p>
                            {member.facility && (
                              <p className="text-xs text-muted-foreground truncate">{member.facility}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* 장소 / 위치 (시설선택 없는 타입만) */}
                {!config?.showFacilityPicker && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">장소</span>
                    </div>
                    <div className="space-y-2">
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="장소명 (예: 서울남부교도소, 강남역 카페)"
                        className="h-10 text-sm"
                      />

                      {!showAddressSearch ? (
                        <>
                          <div className="flex gap-2">
                            <Input
                              value={locationAddress}
                              onChange={(e) => setLocationAddress(e.target.value)}
                              placeholder="주소 (예: 서울특별시 금천구 시흥대로 439)"
                              className="h-10 text-sm flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 px-3"
                              onClick={() => setShowAddressSearch(true)}
                            >
                              주소검색
                            </Button>
                          </div>
                          {locationAddress && (
                            <p className="text-size-11 text-muted-foreground px-1">
                              검색 결과를 선택하거나 직접 수정할 수 있어요.
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="rounded-xl border border-border/40 p-3 bg-gray-50">
                          <AddressSearch
                            compact
                            onSelect={handleAddressSelect}
                            onClose={() => setShowAddressSearch(false)}
                            placeholder="도로명, 건물명, 지번으로 검색"
                          />
                          <div className="mt-3 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAddressSearch(false)}
                            >
                              닫기
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 메모 */}
                {showMemo ? (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">메모</span>
                    </div>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="메모를 입력하세요"
                      className="text-sm min-h-[80px] resize-none"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowMemo(true)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    메모 추가
                  </button>
                )}
              </div>

              {/* 등록 버튼 */}
              <div className="px-5 py-4 border-t border-border/40">
                <Button
                  onClick={handleSubmit}
                  disabled={!title.trim() || !date || isCreating}
                  className="w-full h-12 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-medium shadow-[0_4px_14px_rgba(251,146,60,0.3)]"
                >
                  {isCreating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    '일정 등록'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
