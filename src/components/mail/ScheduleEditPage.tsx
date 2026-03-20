import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, ChevronDown, ChevronLeft, Users, Building2, Check, Briefcase, Scale, Home, Sparkles, Cake, Heart, GraduationCap, Activity, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleEvent } from './ScheduleContent';
import { facilities, regions, type Region } from '@/data/facilities';

interface ScheduleTypeItem {
  label: string;
  icon: LucideIcon;
}

interface Recipient {
  name: string;
  facility: string;
  address: string;
}

interface ScheduleEditPageProps {
  event: ScheduleEvent;
  onClose: () => void;
  onSave?: (data: ScheduleEvent) => void;
}

// 타입 코드 -> 라벨 매핑
const typeCodeToLabel: Record<string, string> = {
  'visit': '일반접견',
  'consultation': '공식변호인접견',
  'special_day': '사건관련일',
  'release': '출소 축하',
  'parole': '가석방 축하',
  'birthday': '생일 축하',
  'anniversary': '기념일',
  'education': '교육',
  'health': '건강',
};

// 라벨 -> 타입 코드 매핑
const labelToTypeCode: Record<string, string> = {
  '일반접견': 'visit',
  '공식변호인접견': 'consultation',
  '사건관련일': 'special_day',
  '출소 축하': 'release',
  '가석방 축하': 'parole',
  '생일 축하': 'birthday',
  '기념일': 'anniversary',
  '교육': 'education',
  '건강': 'health',
};

export default function ScheduleEditPage({ event, onClose, onSave }: ScheduleEditPageProps): React.ReactElement {
  const eventDate = new Date(event.date);

  // 이벤트 타입을 라벨로 변환 (영문 코드 -> 한글 라벨)
  const initialScheduleType = typeCodeToLabel[event.type] || event.type || '일반접견';
  const [scheduleType, setScheduleType] = useState<string>(initialScheduleType);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [locationType, setLocationType] = useState<string>(event.facility ? 'recipient' : 'prison');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient>({
    name: event.personName || '',
    facility: event.facility || '',
    address: event.facilityAddress || ''
  });
  const [ampm, setAmpm] = useState<string>('오전');
  const [hour, setHour] = useState<string>('10');
  const [minute, setMinute] = useState<string>('00');
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);

  // 날짜 state
  const [year, setYear] = useState<string>(String(eventDate.getFullYear()));
  const [month, setMonth] = useState<string>(String(eventDate.getMonth() + 1));
  const [day, setDay] = useState<string>(String(eventDate.getDate()));

  // 사건관련일 체크리스트 상태
  const [checklistStep, setChecklistStep] = useState<number>(1);
  const [caseStage, setCaseStage] = useState<string>('');
  const [scheduleNature, setScheduleNature] = useState<string>('');
  const [inmateStatus, setInmateStatus] = useState<string>('');
  const [investigationExp, setInvestigationExp] = useState<string>('');
  const [contactFrom, setContactFrom] = useState<string>('');
  const [additionalSituation, setAdditionalSituation] = useState<string[]>([]);

  // 시설 선택 상태
  const [selectedRegion, setSelectedRegion] = useState<Region | ''>('');
  const [selectedFacility, setSelectedFacility] = useState<string>('');

  // 지역별 교도소 필터링
  const filteredPrisons = useMemo(() => {
    return facilities.filter(f =>
      f.type === '교도소' &&
      (selectedRegion === '' || f.region === selectedRegion)
    );
  }, [selectedRegion]);

  // 지역별 구치소 필터링
  const filteredDetentions = useMemo(() => {
    return facilities.filter(f =>
      f.type === '구치소' &&
      (selectedRegion === '' || f.region === selectedRegion)
    );
  }, [selectedRegion]);

  // 체크리스트 함수들
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

  const getTotalSteps = (): number => {
    let total = 4;
    if (caseStage === '수사 중') total++;
    if (caseStage === '수사 중' && scheduleNature === '출석이 필요한 날') total++;
    return total;
  };

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

  const handleSave = () => {
    const newDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    // 선택된 시설 정보 조회
    let facilityName = selectedRecipient?.facility || '';
    let facilityAddress = selectedRecipient?.address || '';

    if (locationType === 'prison' || locationType === 'detention') {
      // 드롭다운에서 선택한 시설 조회
      const selectedFacilityData = facilities.find(f => f.id === selectedFacility);
      if (selectedFacilityData) {
        facilityName = selectedFacilityData.name;
        facilityAddress = selectedFacilityData.navigationAddress || selectedFacilityData.address;
      }
    }

    // 라벨을 타입 코드로 변환
    const typeCode = labelToTypeCode[scheduleType] || scheduleType;

    const updatedEvent: ScheduleEvent = {
      ...event,
      date: newDate,
      type: typeCode as ScheduleEvent['type'],
      facility: facilityName,
      facilityAddress: facilityAddress,
      personName: selectedRecipient?.name,
    };

    setShowCompleteModal(true);
    onSave?.(updatedEvent);
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
        <header className="hidden md:flex h-14 border-b border-border/40 bg-white/80 backdrop-blur-sm items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-all"
            >
              <ChevronLeft className="text-gray-500" size={24} />
            </button>
            <h1 className="text-lg font-semibold text-foreground">일정 수정</h1>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-all"
          >
            저장
          </button>
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
                  className="appearance-none bg-white border border-[#C9C1B9] rounded-full px-4 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="appearance-none bg-white border border-[#C9C1B9] rounded-full px-4 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="appearance-none bg-white border border-[#C9C1B9] rounded-full px-4 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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

          <div className="border-t border-gray-100"></div>

          {/* 일정유형 섹션 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-orange-500" size={18} />
              <h2 className="font-semibold text-gray-800 text-sm">일정유형</h2>
            </div>

            <div className="relative">
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
          </section>

          {/* 사건관련일 체크리스트 */}
          {scheduleType === '사건관련일' && (
            <div className="rounded-2xl p-5 bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800">사건 관련 일정 – 체크리스트</h3>
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

              {/* Step 2-6은 RegisterPage와 동일하게 구현 */}
              {checklistStep === 2 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">이번 일정의 성격을 선택해주세요</p>
                  <div className="flex flex-wrap gap-2">
                    {['출석이 필요한 날', '판결 관련 날', '기한이 중요한 날', '기타 중요한 날'].map((item) => (
                      <button
                        key={item}
                        onClick={() => setScheduleNature(item)}
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
                      (checklistStep === 3 && !inmateStatus)
                    }
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      (checklistStep === 1 && !caseStage) ||
                      (checklistStep === 2 && !scheduleNature) ||
                      (checklistStep === 3 && !inmateStatus)
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
              <div className="border-t border-gray-100"></div>
              <section>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="text-orange-500" size={18} />
                  <h2 className="font-semibold text-gray-800 text-sm">위치</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  교정시설은 지도 앱에서 정확히 표시되지 않는 경우가 많아요.
                </p>

                {(scheduleType === '일반접견' || scheduleType === '공식변호인접견') && (
                  <>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <button
                        onClick={() => setLocationType('prison')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          locationType === 'prison'
                            ? 'bg-orange-500 text-white'
                            : 'bg-white border border-[#C9C1B9] text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Building2 size={14} />
                        교도소 선택
                      </button>
                      <button
                        onClick={() => setLocationType('detention')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          locationType === 'detention'
                            ? 'bg-orange-500 text-white'
                            : 'bg-white border border-[#C9C1B9] text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Building2 size={14} />
                        구치소 선택
                      </button>
                      <button
                        onClick={() => setLocationType('recipient')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          locationType === 'recipient'
                            ? 'bg-orange-500 text-white'
                            : 'bg-white border border-[#C9C1B9] text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Users size={14} />
                        수신자 불러오기
                      </button>
                    </div>

                    {locationType === 'recipient' && (
                      <div>
                        {selectedRecipient.facility ? (
                          <>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
                              {selectedRecipient.name && (
                                <span className="text-orange-600 font-medium text-sm">{selectedRecipient.name}</span>
                              )}
                              <span className="text-gray-500 text-sm">({selectedRecipient.facility})</span>
                              <Check className="text-orange-500" size={14} />
                            </div>
                            {selectedRecipient.address && (
                              <p className="text-gray-500 text-sm mt-2">
                                선택됨: {selectedRecipient.address}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            등록된 수신자가 없습니다. 위의 교도소/구치소 선택을 이용해주세요.
                          </p>
                        )}
                      </div>
                    )}

                    {(locationType === 'prison' || locationType === 'detention') && (
                      <div className="flex gap-3 flex-wrap">
                        <div className="relative flex-1 min-w-[140px]">
                          <select
                            value={selectedRegion}
                            onChange={(e) => {
                              setSelectedRegion(e.target.value as Region | '');
                              setSelectedFacility('');
                            }}
                            className="w-full appearance-none bg-white border border-[#C9C1B9] rounded-full px-4 py-2 pr-10 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="">전체 지역</option>
                            {regions.map((region) => (
                              <option key={region} value={region}>{region}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9C1B9] pointer-events-none" size={14} />
                        </div>
                        <div className="relative flex-1 min-w-[140px]">
                          <select
                            value={selectedFacility}
                            onChange={(e) => setSelectedFacility(e.target.value)}
                            className="w-full appearance-none bg-white border border-[#C9C1B9] rounded-full px-4 py-2 pr-10 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="">{locationType === 'prison' ? '교도소 선택' : '구치소 선택'}</option>
                            {(locationType === 'prison' ? filteredPrisons : filteredDetentions).map((facility) => (
                              <option key={facility.id} value={facility.id}>{facility.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9C1B9] pointer-events-none" size={14} />
                        </div>
                      </div>
                    )}

                    {/* 선택된 시설 정보 표시 */}
                    {(locationType === 'prison' || locationType === 'detention') && selectedFacility && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                        {(() => {
                          const facilityData = facilities.find(f => f.id === selectedFacility);
                          return facilityData ? (
                            <>
                              <p className="text-orange-600 font-medium text-sm">{facilityData.name}</p>
                              <p className="text-gray-500 text-xs mt-1">{facilityData.navigationAddress || facilityData.address}</p>
                            </>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </>
                )}
              </section>
            </>
          )}
          </div>
        </div>

        {/* 수정 완료 팝업 */}
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
                <h3 className="font-bold text-gray-900 text-xl mb-2">수정 완료</h3>
                <p className="text-gray-500 text-sm mb-6">
                  일정이 성공적으로 수정되었습니다.
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
