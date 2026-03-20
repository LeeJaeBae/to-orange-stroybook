import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, MapPin, ChevronDown, ChevronLeft, Users, Building2, Check, Briefcase, Scale, Home, Sparkles, Cake, Heart, GraduationCap, Activity, PenLine, Gift, BookOpen, LucideIcon, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { facilities, regions, type Region } from '@/data/facilities';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';

// 타입 정의
interface ScheduleTypeItem {
  label: string;
  icon: LucideIcon;
}

interface Recipient {
  name: string;
  facility: string;
  address: string;
}

interface ScheduleRegisterPageProps {
  onClose: () => void;
  onSave?: (data: ScheduleFormData) => void;
  initialDate?: Date;
}

export interface ScheduleFormData {
  type: string;
  year: string;
  month: string;
  day: string;
  ampm: string;
  hour: string;
  minute: string;
  locationType?: string;
  facility?: string;
  address?: string;
}

export default function ScheduleRegisterPage({ onClose, onSave, initialDate }: ScheduleRegisterPageProps): React.ReactElement {
  const [scheduleType, setScheduleType] = useState<string>('일반접견');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [locationType, setLocationType] = useState<string>('prison');
  const { familyMembers } = useFamilyMembers();
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const selectedRecipient = useMemo(() => {
    const m = familyMembers.find(f => f.id === selectedRecipientId);
    if (!m) return null;
    return { name: m.name, facility: m.facility || '', address: m.facilityAddress || '' };
  }, [familyMembers, selectedRecipientId]);
  const [ampm, setAmpm] = useState<string>('오전');
  const [hour, setHour] = useState<string>('09');
  const [minute, setMinute] = useState<string>('00');
  const [autoTimeCapsule, setAutoTimeCapsule] = useState<boolean>(true);

  // 시설 선택 state
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [facilitySearchQuery, setFacilitySearchQuery] = useState<string>('');

  // 드롭다운 바깥 클릭 닫기
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // 지역별 교도소 필터링
  const filteredPrisons = useMemo(() => {
    return facilities.filter(f =>
      f.type === '교도소' &&
      (selectedRegion === '' || f.region === selectedRegion) &&
      (facilitySearchQuery === '' || f.name.includes(facilitySearchQuery))
    );
  }, [selectedRegion, facilitySearchQuery]);

  // 지역별 구치소 필터링
  const filteredDetentions = useMemo(() => {
    return facilities.filter(f =>
      f.type === '구치소' &&
      (selectedRegion === '' || f.region === selectedRegion) &&
      (facilitySearchQuery === '' || f.name.includes(facilitySearchQuery))
    );
  }, [selectedRegion, facilitySearchQuery]);

  // 날짜 state (초기값 설정)
  const [year, setYear] = useState<string>(initialDate ? String(initialDate.getFullYear()) : '2025');
  const [month, setMonth] = useState<string>(initialDate ? String(initialDate.getMonth() + 1) : '1');
  const [day, setDay] = useState<string>(initialDate ? String(initialDate.getDate()) : '1');

  // 사건관련일 체크리스트 상태
  const [checklistStep, setChecklistStep] = useState<number>(1);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [caseStage, setCaseStage] = useState<string>('');
  const [scheduleNature, setScheduleNature] = useState<string>('');
  const [inmateStatus, setInmateStatus] = useState<string>('');
  const [investigationExp, setInvestigationExp] = useState<string>('');
  const [contactFrom, setContactFrom] = useState<string>('');
  const [additionalSituation, setAdditionalSituation] = useState<string[]>([]);

  // 체크리스트 다음 스텝 계산
  const getNextStep = (currentStep: number): number => {
    if (currentStep === 1) return 2;
    if (currentStep === 2) return 3;
    if (currentStep === 3) {
      if (caseStage === '수사 중') return 4;
      return 6;
    }
    if (currentStep === 4) {
      if (caseStage === '수사 중' && scheduleNature === '출석이 필요한 날') return 5;
      return 6;
    }
    if (currentStep === 5) return 6;
    return currentStep;
  };

  // 체크리스트 이전 스텝 계산
  const getPrevStep = (currentStep: number): number => {
    if (currentStep === 2) return 1;
    if (currentStep === 3) return 2;
    if (currentStep === 4) return 3;
    if (currentStep === 5) return 4;
    if (currentStep === 6) {
      if (caseStage === '수사 중' && scheduleNature === '출석이 필요한 날') return 5;
      if (caseStage === '수사 중') return 4;
      return 3;
    }
    return currentStep;
  };

  // 총 스텝 수 계산
  const getTotalSteps = (): number => {
    let total = 4;
    if (caseStage === '수사 중') total++;
    if (caseStage === '수사 중' && scheduleNature === '출석이 필요한 날') total++;
    return total;
  };

  // 현재 스텝이 몇 번째인지 (UI 표시용)
  const getCurrentStepNumber = (): number => {
    if (checklistStep <= 3) return checklistStep;
    if (checklistStep === 4) return 4;
    if (checklistStep === 5) return 5;
    if (checklistStep === 6) {
      if (caseStage === '수사 중' && scheduleNature === '출석이 필요한 날') return 6;
      if (caseStage === '수사 중') return 5;
      return 4;
    }
    return checklistStep;
  };

  // 프로그레스 바 너비 계산
  const getProgressWidth = (): number => {
    const totalSteps = getTotalSteps();
    let completedSteps = checklistStep - 1;

    if (checklistStep === 1 && caseStage) completedSteps = 1;
    else if (checklistStep === 2 && scheduleNature) completedSteps = 2;
    else if (checklistStep === 3 && inmateStatus) completedSteps = 3;
    else if (checklistStep === 4 && investigationExp) completedSteps = 4;
    else if (checklistStep === 5 && contactFrom) completedSteps = 5;
    else if (checklistStep === 6) completedSteps = totalSteps;

    return (completedSteps / totalSteps) * 100;
  };

  const handleSubmit = () => {
    // 선택된 시설 정보 조회
    let facilityName = '';
    let facilityAddress = '';

    if (locationType === 'prison' || locationType === 'detention') {
      // 드롭다운에서 선택한 시설 조회
      const selectedFacilityData = facilities.find(f => f.id === selectedFacility);
      if (selectedFacilityData) {
        facilityName = selectedFacilityData.name;
        facilityAddress = selectedFacilityData.navigationAddress || selectedFacilityData.address;
      }
    } else if (locationType === 'recipient' && selectedRecipient) {
      // 수신자 불러오기의 경우
      facilityName = selectedRecipient.facility;
      facilityAddress = selectedRecipient.address;
    }

    const formData: ScheduleFormData = {
      type: scheduleType,
      year,
      month,
      day,
      ampm,
      hour,
      minute,
      locationType,
      facility: facilityName,
      address: facilityAddress,
    };

    setShowCompleteModal(true);
    onSave?.(formData);
  };

  const visitTypes: ScheduleTypeItem[] = [
    { label: '일반접견', icon: Users },
    { label: '공식변호인접견', icon: Briefcase },
    { label: '사건관련일', icon: Scale },
  ];
  const timeCapsuleTypes: ScheduleTypeItem[] = [
    { label: '출소 축하', icon: Home },
    { label: '가석방 축하', icon: Sparkles },
    { label: '생일 축하', icon: Cake },
    { label: '기념일', icon: Heart },
  ];
  const lifeCategories: ScheduleTypeItem[] = [
    { label: '교육', icon: GraduationCap },
    { label: '건강', icon: Activity },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto overflow-x-visible">
        {/* Header */}
        <header className="hidden md:flex h-14 border-b border-border/40 bg-white/80 backdrop-blur-sm items-center px-6 sticky top-0 z-10">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-all mr-3"
          >
            <ChevronLeft className="text-gray-500" size={24} />
          </button>
          <h1 className="text-lg font-semibold text-foreground">일정을 등록하세요</h1>
        </header>

        <div className="px-4 py-10 lg:px-6">
          <div className="max-w-4xl mx-auto space-y-6 overflow-visible">
          {/* 날짜 및 시간 섹션 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="text-orange-500" size={18} />
              <h2 className="font-semibold text-gray-800 text-sm">날짜 및 시간</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="appearance-none bg-white border border-[#C9C1B9] rounded-full px-4 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9C1B9] pointer-events-none" size={14} />
              </div>
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="appearance-none bg-white border border-[#C9C1B9] rounded-full px-4 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i + 1}월</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9C1B9] pointer-events-none" size={14} />
              </div>
              <div className="relative">
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="appearance-none bg-white border border-[#C9C1B9] rounded-full px-4 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {[...Array(31)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i + 1}일</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9C1B9] pointer-events-none" size={14} />
              </div>

              {/* 시간 선택 */}
              <div className="flex items-center gap-2 bg-white border border-[#C9C1B9] rounded-full px-3 py-1.5">
                <div className="flex bg-gray-100 rounded-full p-0.5">
                  <button
                    onClick={() => setAmpm('오전')}
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                      ampm === '오전' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    오전
                  </button>
                  <button
                    onClick={() => setAmpm('오후')}
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                      ampm === '오후' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    오후
                  </button>
                </div>
                <input
                  type="text"
                  value={hour}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 12)) setHour(val);
                  }}
                  className="w-6 text-center text-gray-700 text-sm font-medium focus:outline-none bg-transparent"
                  maxLength={2}
                />
                <span className="text-gray-400">:</span>
                <input
                  type="text"
                  value={minute}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 59)) setMinute(val);
                  }}
                  className="w-6 text-center text-gray-700 text-sm font-medium focus:outline-none bg-transparent"
                  maxLength={2}
                />
              </div>
            </div>
          </section>

          <div className="border-t border-gray-300"></div>

          {/* 일정유형 섹션 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-orange-500" size={18} />
              <h2 className="font-semibold text-gray-800 text-sm">일정유형</h2>
            </div>

            {/* 커스텀 드롭다운 */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#C9C1B9] rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    const allTypes = [...visitTypes, ...timeCapsuleTypes, ...lifeCategories];
                    const selected = allTypes.find(t => t.label === scheduleType);
                    if (selected) {
                      const IconComponent = selected.icon;
                      return (
                        <>
                          <IconComponent size={18} className="text-orange-500" />
                          <span>{selected.label}</span>
                        </>
                      );
                    }
                    return <span>일정유형 선택</span>;
                  })()}
                </div>
                <ChevronDown className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={18} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-[#C9C1B9] rounded-2xl shadow-lg overflow-y-auto max-h-[400px]">
                  {/* 접견/사건관련일 */}
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">접견/사건관련일</span>
                  </div>
                  {visitTypes.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setScheduleType(item.label);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon size={18} className={scheduleType === item.label ? 'text-orange-500' : 'text-gray-400'} />
                        <span className={`text-sm ${scheduleType === item.label ? 'text-orange-500 font-medium' : 'text-gray-700'}`}>{item.label}</span>
                      </div>
                      {scheduleType === item.label && <Check size={16} className="text-orange-500" />}
                    </button>
                  ))}

                  {/* 타임캡슐 전달일 */}
                  <div className="px-4 py-2 bg-gray-50 border-b border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">타임캡슐 전달일</span>
                  </div>
                  {timeCapsuleTypes.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setScheduleType(item.label);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon size={18} className={scheduleType === item.label ? 'text-orange-500' : 'text-gray-400'} />
                        <span className={`text-sm ${scheduleType === item.label ? 'text-orange-500 font-medium' : 'text-gray-700'}`}>{item.label}</span>
                      </div>
                      {scheduleType === item.label && <Check size={16} className="text-orange-500" />}
                    </button>
                  ))}

                  {/* 라이프 */}
                  <div className="px-4 py-2 bg-gray-50 border-b border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">라이프</span>
                  </div>
                  {lifeCategories.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setScheduleType(item.label);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon size={18} className={scheduleType === item.label ? 'text-orange-500' : 'text-gray-400'} />
                        <span className={`text-sm ${scheduleType === item.label ? 'text-orange-500 font-medium' : 'text-gray-700'}`}>{item.label}</span>
                      </div>
                      {scheduleType === item.label && <Check size={16} className="text-orange-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 안내 메시지 - Tip (일정유형 바로 아래 배치) */}
            <div className="rounded-2xl p-4 bg-orange-50 mt-4">
              {scheduleType === '출소 축하' ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <Home className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-800 text-sm">출소 일정을 선택한 경우</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    출소는 끝이 아니라, <span className="font-bold text-gray-800">새로운 시작의 날</span>입니다.
                  </p>
                  <p className="text-gray-600 text-sm mb-4">그날을 위해 타임캡슐과 함께 준비해보세요.</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <Gift size={16} className="text-orange-400" />
                      출소복 선물하기
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <BookOpen size={16} className="text-green-500" />
                      도서 선물하기
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm">
                    출소 이후의 생활을 바로 시작할 수 있도록,<br />
                    실질적으로 도움이 되는 선물을 담을 수 있어요.
                  </p>
                </>
              ) : scheduleType === '일반접견' ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <Users className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-800 text-sm">일반접견을 선택한 경우</span>
                  </div>
                  <ol className="text-sm text-gray-600 space-y-1 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500">1.</span>
                      <span>신분증 + 가족관계증명서 필수 <span className="text-gray-400">- 휴대폰, 가방 반입 불가</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500">2.</span>
                      당일 상황에 따라 면회가 취소될 수 있어요
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500">3.</span>
                      <span>접견 30-40분 전 도착 권장</span>
                    </li>
                  </ol>
                  <div className="border-t border-orange-200 pt-3">
                    <p className="text-orange-600 font-bold text-sm mb-1">필독! 일정 등록 후 상세화면에서 확인하세요!</p>
                    <p className="text-gray-500 text-sm">찾아가는 법, 준비물 체크리스트, 주변 숙박 및 대기장소 정보를 추천해드립니다.</p>
                  </div>
                </>
              ) : scheduleType === '공식변호인접견' ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <Briefcase className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-800 text-sm">공식변호인접견을 선택한 경우</span>
                  </div>
                  <ol className="text-sm text-gray-600 space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500">1.</span>
                      <div>
                        <p>접견 시간 30~40분 전 도착을 권장합니다.</p>
                        <p className="text-gray-400">특히 처음 방문하는 경우 길 찾는 데 시간이 걸릴 수 있어요.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500">2.</span>
                      선임된 변호인이 사건 진행을 위해 공식적으로 접견하는 방식이에요.
                    </li>
                  </ol>
                  <div className="bg-orange-100 rounded-xl p-3">
                    <p className="text-orange-700 font-semibold text-sm mb-1">변호사 선임 전이라면?</p>
                    <p className="text-gray-600 text-sm">선임 전 변호사 방문은 &quot;일반접견&quot;으로 진행돼요.</p>
                  </div>
                </>
              ) : scheduleType === '사건관련일' ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    아직 재판이 시작되지 않았어도 괜찮아요. 조사, 출석, 재판 등 사건과 관련된 중요한 날짜라면 이곳에 모두 등록할 수 있어요.
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <Scale className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-800 text-sm">사건관련일을 선택한 경우</span>
                  </div>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500">1.</span>
                      일정은 변경될 수 있으니 사전에 확인하세요
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500">2.</span>
                      장소 위치와 주차 정보를 미리 확인해두세요
                    </li>
                  </ol>
                </>
              ) : scheduleType === '가석방 축하' ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <Sparkles className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-800 text-sm">가석방 축하 일정을 선택한 경우</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    가석방은 <span className="font-bold text-gray-800">새로운 희망의 시작</span>입니다.
                  </p>
                  <p className="text-gray-600 text-sm mb-4">소중한 그날을 타임캡슐에 기록하고, 함께 축하해보세요.</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <Gift size={16} className="text-orange-400" />
                      축하 선물하기
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <Heart size={16} className="text-pink-500" />
                      타임캡슐 편지 쓰기
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm">
                    가석방 후 새 출발을 응원하는 마음을 담아<br />
                    미리 준비한 선물과 편지를 전해보세요.
                  </p>
                </>
              ) : scheduleType === '생일 축하' ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <Cake className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-800 text-sm">생일 축하 일정을 선택한 경우</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    멀리 있어도 마음은 가까이, <span className="font-bold text-gray-800">특별한 생일</span>을 만들어주세요.
                  </p>
                  <p className="text-gray-600 text-sm mb-4">타임캡슐에 생일 축하 편지를 미리 담아두면 그날 전달됩니다.</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <Cake size={16} className="text-pink-400" />
                      생일 카드 보내기
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <Gift size={16} className="text-orange-400" />
                      생일 선물하기
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm">
                    생일 당일에 도착할 수 있도록<br />
                    미리 편지와 선물을 준비해보세요.
                  </p>
                </>
              ) : scheduleType === '기념일' ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <Heart className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-800 text-sm">기념일을 선택한 경우</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    결혼기념일, 만난 날, 특별한 날... <span className="font-bold text-gray-800">함께한 시간</span>을 기억해주세요.
                  </p>
                  <p className="text-gray-600 text-sm mb-4">기념일에 맞춰 타임캡슐 편지를 전달해보세요.</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <Heart size={16} className="text-pink-500" />
                      기념일 편지 쓰기
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <Gift size={16} className="text-orange-400" />
                      기념일 선물하기
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm">
                    떨어져 있어도 기념일의 의미를 잊지 않도록<br />
                    미리 마음을 담은 편지를 준비해보세요.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <span className="font-semibold text-gray-800 text-sm">일정 등록 안내</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    일정을 등록하고 중요한 날을 잊지 않도록 관리하세요.
                  </p>
                </>
              )}
            </div>
          </section>

          {/* 사건관련일 체크리스트 */}
          {scheduleType === '사건관련일' && (
            <div className="rounded-2xl p-5 bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800">사건 관련 일정 등록 – 체크리스트</h3>
                <span className="text-sm text-orange-500 font-medium">{getCurrentStepNumber()}/{getTotalSteps()}</span>
              </div>
              <p className="text-sm text-gray-500 mb-5">아직 정확히 몰라도 괜찮아요. 아는 만큼만 선택해 주세요.</p>

              <div className="w-full h-1 bg-gray-200 rounded-full mb-6">
                <div
                  className="h-1 bg-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressWidth()}%` }}
                />
              </div>

              {/* Step 1 */}
              {checklistStep === 1 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">현재 사건 단계가 어떻게 되나요?</p>
                  <div className="flex flex-wrap gap-2">
                    {['수사 중', '재판 중', '선고 완료', '잘 모르겠어요'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setCaseStage(item);
                          if (item !== '수사 중') {
                            setInvestigationExp('');
                            setContactFrom('');
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          caseStage === item
                            ? 'bg-orange-500 text-white'
                            : item === '잘 모르겠어요'
                              ? 'bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {checklistStep === 2 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">이번 일정의 성격을 선택해주세요</p>
                  <div className="flex flex-wrap gap-2">
                    {['출석이 필요한 날', '판결 관련 날', '기한이 중요한 날', '기타 중요한 날'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setScheduleNature(item);
                          if (item !== '출석이 필요한 날') setContactFrom('');
                        }}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          scheduleNature === item
                            ? 'bg-orange-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {checklistStep === 3 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">현재 재소자 상태를 선택해주세요</p>
                  <div className="flex flex-wrap gap-2">
                    {['구속', '불구속', '보석', '잘 모르겠어요'].map((item) => (
                      <button
                        key={item}
                        onClick={() => setInmateStatus(item)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          inmateStatus === item
                            ? 'bg-orange-500 text-white'
                            : item === '잘 모르겠어요'
                              ? 'bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {checklistStep === 4 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">이미 조사(출석)를 한 적이 있나요?</p>
                  <div className="flex flex-wrap gap-2">
                    {['아직 없음', '한 번 있음', '여러 번 있음', '잘 모르겠어요'].map((item) => (
                      <button
                        key={item}
                        onClick={() => setInvestigationExp(item)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          investigationExp === item
                            ? 'bg-orange-500 text-white'
                            : item === '잘 모르겠어요'
                              ? 'bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5 */}
              {checklistStep === 5 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">이번 출석은 어디에서 연락을 받았나요?</p>
                  <div className="flex flex-wrap gap-2">
                    {['경찰에서 연락을 받았어요', '검찰에서 연락을 받았어요', '법원에서 연락을 받았어요', '잘 모르겠어요'].map((item) => (
                      <button
                        key={item}
                        onClick={() => setContactFrom(item)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          contactFrom === item
                            ? 'bg-orange-500 text-white'
                            : item === '잘 모르겠어요'
                              ? 'bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6 */}
              {checklistStep === 6 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">해당되는 내용이 있다면 선택해주세요 <span className="font-normal text-gray-400">(복수 선택)</span></p>
                  <div className="flex flex-wrap gap-2">
                    {['다른 사건이 추가로 있어요', '여러 사건이 함께 진행 중이에요', '항소 또는 상고를 고민 중이에요', '법률 상담이 필요해요'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          if (additionalSituation.includes(item)) {
                            setAdditionalSituation(additionalSituation.filter(i => i !== item));
                          } else {
                            setAdditionalSituation([...additionalSituation, item]);
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          additionalSituation.includes(item)
                            ? 'bg-orange-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 이전 / 다음 버튼 */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setChecklistStep(getPrevStep(checklistStep))}
                  disabled={checklistStep === 1}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    checklistStep === 1
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  이전
                </button>

                {checklistStep === 6 ? (
                  <button className="px-5 py-2 rounded-full text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-all">
                    완료
                  </button>
                ) : (
                  <button
                    onClick={() => setChecklistStep(getNextStep(checklistStep))}
                    disabled={
                      (checklistStep === 1 && !caseStage) ||
                      (checklistStep === 2 && !scheduleNature) ||
                      (checklistStep === 3 && !inmateStatus) ||
                      (checklistStep === 4 && !investigationExp) ||
                      (checklistStep === 5 && !contactFrom)
                    }
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      (checklistStep === 1 && !caseStage) ||
                      (checklistStep === 2 && !scheduleNature) ||
                      (checklistStep === 3 && !inmateStatus) ||
                      (checklistStep === 4 && !investigationExp) ||
                      (checklistStep === 5 && !contactFrom)
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    다음
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 위치 섹션 */}
          {!lifeCategories.map(t => t.label).includes(scheduleType) && !timeCapsuleTypes.map(t => t.label).includes(scheduleType) && (
            <>
              <div className="border-t border-gray-300"></div>
              <section>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="text-orange-500" size={18} />
                  <h2 className="font-semibold text-gray-800 text-sm">위치</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  교정시설은 지도 앱에서 정확히 표시되지 않는 경우가 많아요.<br />
                  상세 위치와 출입 동선은 일정 상세 화면에서 별도로 안내드려요.
                </p>

                {(scheduleType === '일반접견' || scheduleType === '공식변호인접견') && (
                  <>
                    <div className="flex gap-2 mb-4 items-center flex-wrap">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => { setLocationType('prison'); setFacilitySearchQuery(''); }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            locationType === 'prison'
                              ? 'bg-orange-500 text-white'
                              : 'bg-white border border-[#C9C1B9] text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Building2 size={14} />
                          교도소
                        </button>
                        <button
                          onClick={() => { setLocationType('detention'); setFacilitySearchQuery(''); }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            locationType === 'detention'
                              ? 'bg-orange-500 text-white'
                              : 'bg-white border border-[#C9C1B9] text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Building2 size={14} />
                          구치소
                        </button>
                        <button
                          onClick={() => { setLocationType('recipient'); setFacilitySearchQuery(''); }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            locationType === 'recipient'
                              ? 'bg-orange-500 text-white'
                              : 'bg-white border border-[#C9C1B9] text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Users size={14} />
                          수신자
                        </button>
                      </div>
                    </div>

                    {(locationType === 'prison' || locationType === 'detention') && (
                      <div className="flex gap-2 flex-wrap">
                        <div className="relative min-w-[100px] flex-1">
                          <select
                            value={selectedRegion}
                            onChange={(e) => {
                              setSelectedRegion(e.target.value);
                              setSelectedFacility('');
                            }}
                            className="w-full appearance-none bg-white border border-[#C9C1B9] rounded-full px-3 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="">지역</option>
                            {regions.map((region) => (
                              <option key={region} value={region}>{region}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9C1B9] pointer-events-none" size={14} />
                        </div>
                        <div className="relative min-w-[110px] flex-1">
                          <select
                            value={selectedFacility}
                            onChange={(e) => setSelectedFacility(e.target.value)}
                            className="w-full appearance-none bg-white border border-[#C9C1B9] rounded-full px-3 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="">{locationType === 'prison' ? '교도소' : '구치소'}</option>
                            {(locationType === 'prison' ? filteredPrisons : filteredDetentions).map((facility) => (
                              <option key={facility.id} value={facility.id}>{facility.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9C1B9] pointer-events-none" size={14} />
                        </div>
                        <div className="relative min-w-[110px] flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14} />
                          <input
                            type="text"
                            placeholder="직접입력"
                            value={facilitySearchQuery}
                            onChange={(e) => setFacilitySearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          {facilitySearchQuery.trim() && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-[#C9C1B9] rounded-xl shadow-lg overflow-y-auto max-h-[200px]">
                              {(locationType === 'prison' ? filteredPrisons : filteredDetentions).length > 0 ? (
                                (locationType === 'prison' ? filteredPrisons : filteredDetentions).map((f) => (
                                  <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedFacility(f.id);
                                      setFacilitySearchQuery('');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors flex items-center justify-between"
                                  >
                                    <span className="text-gray-700">{f.name}</span>
                                    <span className="text-xs text-gray-400">{f.region}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-sm text-gray-400 text-center">검색 결과 없음</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {locationType === 'recipient' && (
                      <div className="space-y-2">
                        {familyMembers.length === 0 ? (
                          <p className="text-sm text-gray-400">등록된 수신자가 없습니다.</p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {familyMembers.map((m) => {
                              const isSelected = selectedRecipientId === m.id;
                              const parts = [m.name];
                              if (m.facility) parts.push(m.facility);
                              if (m.prisonerNumber) parts.push(m.prisonerNumber);
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => setSelectedRecipientId(m.id)}
                                  className={`flex items-center justify-between px-4 py-2.5 rounded-full text-sm transition-all ${
                                    isSelected
                                      ? 'bg-orange-50 border border-orange-300 text-orange-600 font-medium'
                                      : 'bg-white border border-[#C9C1B9] text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  <span>{parts.join(' - ')}</span>
                                  {isSelected && <Check size={14} className="text-orange-500" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {selectedRecipient && (
                          <p className="text-gray-500 text-xs mt-1">
                            선택됨: {selectedRecipient.address || '주소 정보 없음'}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {scheduleType === '사건관련일' && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[
                        { key: 'police', label: '경찰서', icon: Building2 },
                        { key: 'prosecution', label: '검찰청', icon: Building2 },
                        { key: 'court', label: '법원', icon: Building2 },
                        { key: 'legalHelper', label: '법률도우미', icon: Briefcase },
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setLocationType(item.key)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            locationType === item.key
                              ? 'bg-orange-500 text-white'
                              : 'bg-white border border-[#C9C1B9] text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon size={14} />
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <div className="relative flex-1 min-w-[140px]">
                        <select
                          value={selectedRegion}
                          onChange={(e) => setSelectedRegion(e.target.value)}
                          className="w-full appearance-none bg-white border border-[#C9C1B9] rounded-full px-4 py-2 pr-10 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">지역 선택</option>
                          {regions.map((region) => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9C1B9] pointer-events-none" size={14} />
                      </div>
                      <div className="relative flex-1 min-w-[140px]">
                        <select className="w-full appearance-none bg-white border border-[#C9C1B9] rounded-full px-4 py-2 pr-10 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                          <option value="">
                            {locationType === 'police' ? '경찰서 선택' :
                             locationType === 'prosecution' ? '검찰청 선택' :
                             locationType === 'court' ? '법원 선택' : '법률도우미 선택'}
                          </option>
                          {/* 추후 경찰서/검찰청/법원 데이터 추가 시 연동 */}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9C1B9] pointer-events-none" size={14} />
                      </div>
                    </div>
                  </>
                )}
              </section>
            </>
          )}

          {/* 타임캡슐 일정 - 받는 사람 선택 */}
          {timeCapsuleTypes.map(t => t.label).includes(scheduleType) && (
            <>
              <div className="border-t border-gray-300"></div>
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="text-orange-500" size={18} />
                  <h2 className="font-semibold text-gray-800 text-sm">받는 사람</h2>
                </div>
                {familyMembers.length === 0 ? (
                  <p className="text-sm text-gray-400">등록된 수신자가 없습니다.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {familyMembers.map((m) => {
                      const isSelected = selectedRecipientId === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedRecipientId(m.id)}
                          className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-orange-50 border-2 border-orange-500'
                              : 'bg-white border border-[#C9C1B9] hover:bg-gray-50'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium">
                            {m.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium text-sm">{m.name}</p>
                            <p className="text-xs text-gray-400">
                              {[m.facility, m.prisonerNumber].filter(Boolean).join(' · ') || m.relation}
                            </p>
                          </div>
                          {isSelected && <Check size={20} className="text-orange-500" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          {/* 타임캡슐 자동생성 토글 */}
          {timeCapsuleTypes.map(t => t.label).includes(scheduleType) && (
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-full">
              <span className="text-sm text-gray-700">일정등록하고 타임캡슐에도 자동생성하기!</span>
              <button
                onClick={() => setAutoTimeCapsule(!autoTimeCapsule)}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  autoTimeCapsule ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    autoTimeCapsule ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* 일정등록 버튼 */}
          <button
            onClick={handleSubmit}
            className="w-full bg-orange-500 text-white font-semibold py-3.5 rounded-full hover:bg-orange-600 transition-all mt-6"
          >
            일정등록
          </button>
          </div>
        </div>

        {/* 등록 완료 팝업 */}
        <AnimatePresence>
          {showCompleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl z-[100]"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 w-80 text-center shadow-xl"
              >
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="text-orange-500" size={28} />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-2">등록 완료</h3>
                <p className="text-gray-500 text-sm mb-6">
                  등록된 일정은 달력에서 다시 눌러<br />
                  자세한 내용을 확인할 수 있어요.
                </p>
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    onClose();
                  }}
                  className="w-full bg-orange-500 text-white font-semibold py-3 rounded-full hover:bg-orange-600 transition-all"
                >
                  확인
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
