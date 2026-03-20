'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AddressSearch, type AddressResult } from "@/components/ui/AddressSearch";
import {
  Loader2,
  Check,
  ChevronDown,
  Users,
  Building2,
  MapPin,
  User,
  Search,
  Plus,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch"; // 연령대 기능 주석처리
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { cn } from "@/lib/utils";
import { useLetterFolders } from "@/hooks/useLetterFolders";
// daumPostcodeTheme removed — using AddressSearch

interface AddRecipientInlineProps {
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onSuccess?: (memberId: string) => void;
  editingMemberId?: string | null;
}

// ===== 데이터 정의 =====
const facilityTypes = [
  { id: 'general', label: '일반 주소', icon: '🏠' },
  { id: 'military', label: '군부대/훈련소', icon: '🪖' },
  { id: 'prison', label: '교도소', icon: '🏢' },
  { id: 'detention', label: '구치소', icon: '🏢' },
  { id: 'juvenile-detention', label: '소년원', icon: '🏫' },
  { id: 'juvenile-prison', label: '소년교도소', icon: '🏫' },
];

const relations = [
  "조부모", "어머니", "아버지", "형제", "자매", "자녀", "남편", "아내",
  "연인", "친구", "선배", "후배", "지인", "법률대리인", "기타"
];

// 시설 상세 정보 타입
interface FacilityInfo {
  name: string;
  address: string;
  postalCode: string;
  phone: string;
}

// 전국 교도소/구치소 지역 목록
const regions = [
  '서울/경기/인천', '강원', '충청', '전라', '경상', '제주'
];

// 주요 군부대 및 신병교육대 (전국 통합)
const militaryFacilities: FacilityInfo[] = [
  { name: '육군훈련소', address: '충남 논산시 연무읍 황화정길 35', postalCode: '32913', phone: '1588-9090' },
  { name: '육군 제1사단 신병교육대', address: '경기도 포천시 영북면 야사리 산 91-1', postalCode: '11141', phone: '031-539-5114' },
  { name: '해군교육사령부', address: '경남 창원시 진해구 남문로 63', postalCode: '51678', phone: '055-549-4114' },
  { name: '공군기본군사훈련단', address: '충남 논산시 연무읍 육군훈련소로 25', postalCode: '32913', phone: '041-730-5114' },
  { name: '해병대교육훈련단', address: '경북 포항시 북구 흥해읍 성곡로 352', postalCode: '37544', phone: '054-270-5114' },
  { name: '기타 부대 (주소검색)', address: '주소검색으로 입력', postalCode: '', phone: '' },
];

// 전국 교도소/구치소/소년원 시설 목록 (사서함 주소 우선)
const facilitiesByRegion: Record<string, FacilityInfo[]> = {
  '서울/경기/인천': [
    { name: '서울구치소', address: '경기도 군포우체국 사서함 20호', postalCode: '15829', phone: '031-423-6100' },
    { name: '안양교도소', address: '경기도 안양우체국 사서함 101호', postalCode: '14047', phone: '031-452-2181' },
    { name: '수원구치소', address: '경기도 수원우체국 사서함 17호', postalCode: '16326', phone: '031-217-7101' },
    { name: '서울동부구치소', address: '서울시 송파우체국 사서함 177호', postalCode: '05661', phone: '02-402-9131' },
    { name: '인천구치소', address: '인천광역시 남인천우체국 사서함 343호', postalCode: '21552', phone: '032-868-8771' },
    { name: '서울남부구치소', address: '서울시 구로우체국 사서함 164호', postalCode: '08576', phone: '02-2105-0391' },
    { name: '화성직업훈련교도소', address: '경기도 화성우체국 사서함 3호', postalCode: '18270', phone: '031-357-9400' },
    { name: '여주교도소', address: '경기도 여주우체국 사서함 30호', postalCode: '12627', phone: '031-884-7800' },
    { name: '의정부교도소', address: '경기도 의정부우체국 사서함 99호', postalCode: '11778', phone: '031-850-1000' },
    { name: '서울남부교도소', address: '서울시 구로우체국 사서함 165호', postalCode: '08576', phone: '02-2083-0200' },
    { name: '수원구치소 평택지소', address: '경기도 평택우체국 사서함 6호', postalCode: '17895', phone: '031-650-5800' },
    { name: '소망교도소(민영)', address: '경기도 여주우체국 사서함 23호', postalCode: '12627', phone: '031-887-5900' },
    { name: '고봉중고등학교(서울소년원)', address: '경기도 의왕시 고산로 87', postalCode: '16075', phone: '031-455-6111' },
    { name: '정심여자중고등학교(안양소년원)', address: '경기도 안양시 만안구 삼막로 96번길 11', postalCode: '13910', phone: '031-473-3781' },
    { name: '서울소년분류심사원', address: '경기도 안양시 동안구 경수대로 500', postalCode: '14122', phone: '031-451-2683' },
  ],
  '강원': [
    { name: '춘천교도소', address: '강원특별자치도 춘천우체국 사서함 69호', postalCode: '24364', phone: '033-262-1332' },
    { name: '원주교도소', address: '강원특별자치도 원주우체국 사서함 87호', postalCode: '26485', phone: '033-741-4800' },
    { name: '강릉교도소', address: '강릉시 강릉우체국 사서함 43호', postalCode: '25534', phone: '033-649-8100' },
    { name: '영월교도소', address: '강원특별자치도 영월우체국 사서함 2호', postalCode: '26233', phone: '033-372-1730' },
    { name: '강원북부교도소', address: '강원특별자치도 속초우체국 사서함 2호', postalCode: '24862', phone: '033-634-7114' },
    { name: '춘천신촌학교(춘천소년원)', address: '강원특별자치도 춘천시 동내면 장안길 51', postalCode: '24407', phone: '033-250-2300' },
  ],
  '충청': [
    { name: '대전교도소', address: '대전시 유성우체국 사서함 136호', postalCode: '34186', phone: '042-544-9301' },
    { name: '천안개방교도소', address: '충남 천안우체국 사서함 36호', postalCode: '31158', phone: '041-561-4301' },
    { name: '청주교도소', address: '충북 서청주우체국 사서함 100호', postalCode: '28426', phone: '043-296-8171' },
    { name: '천안교도소', address: '충남 성환우체국 사서함 20호', postalCode: '31016', phone: '041-521-7600' },
    { name: '청주여자교도소', address: '충북 서청주우체국 사서함 145호', postalCode: '28426', phone: '043-288-8140' },
    { name: '공주교도소', address: '충남 공주우체국 사서함 13호', postalCode: '32546', phone: '041-851-3200' },
    { name: '충주구치소', address: '충북 엄정우체국 사서함 1호', postalCode: '27313', phone: '043-856-9701' },
    { name: '홍성교도소', address: '충남 홍성우체국 사서함 9호', postalCode: '32247', phone: '041-630-8600' },
    { name: '홍성교도소 서산지소', address: '충남 성연우체국 사서함 1호', postalCode: '31930', phone: '041-669-6891' },
    { name: '대전교도소 논산지소', address: '충남 성동우체국 사서함 1호', postalCode: '32927', phone: '041-733-2220' },
    { name: '대전대산학교(대전소년원)', address: '대전광역시 동구 산내로 1398-41', postalCode: '34699', phone: '042-250-3100' },
    { name: '청주미평여자학교(청주소년원)', address: '충북 청주시 서원구 남지로 41번길 23', postalCode: '28632', phone: '043-295-7230' },
  ],
  '전라': [
    { name: '광주교도소', address: '광주시 북광주우체국 사서함 63호', postalCode: '61244', phone: '062-251-4321' },
    { name: '전주교도소', address: '전북 전주우체국 사서함 72호', postalCode: '54966', phone: '063-224-4361' },
    { name: '순천교도소', address: '전남 순천우체국 사서함 9호', postalCode: '57987', phone: '061-751-2114' },
    { name: '목포교도소', address: '전남 일로우체국 사서함 1호', postalCode: '58547', phone: '061-284-4101' },
    { name: '군산교도소', address: '전북 군산우체국 사서함 10호', postalCode: '54025', phone: '063-462-0101' },
    { name: '장흥교도소', address: '전남 장흥우체국 사서함 1호', postalCode: '59328', phone: '061-860-9114' },
    { name: '해남교도소', address: '전남 해남우체국 사서함 6호', postalCode: '59027', phone: '061-530-9300' },
    { name: '정읍교도소', address: '전북 정읍우체국 사서함 1호', postalCode: '56163', phone: '063-928-9114' },
    { name: '광주고룡학교(광주소년원)', address: '광주광역시 광산구 임곡로 273-3', postalCode: '62207', phone: '062-958-7900' },
    { name: '송천중고등학교(전주소년원)', address: '전북 전주시 덕진구 과학로 45-25', postalCode: '54816', phone: '063-900-2500' },
  ],
  '경상': [
    { name: '대구교도소', address: '대구시 성서우체국 사서함 7호', postalCode: '42620', phone: '053-430-1600' },
    { name: '부산구치소', address: '부산시 사상우체국 사서함 58호', postalCode: '46974', phone: '051-324-5501' },
    { name: '경북북부제1교도소', address: '경북 진보우체국 사서함 1호', postalCode: '37409', phone: '054-874-4500' },
    { name: '부산교도소', address: '부산시 강서우체국 사서함 50호', postalCode: '46700', phone: '051-971-0151' },
    { name: '창원교도소', address: '경남 마산우체국 사서함 7호', postalCode: '51304', phone: '055-298-9010' },
    { name: '진주교도소', address: '경남 진주우체국 사서함 68호', postalCode: '52684', phone: '055-741-2181' },
    { name: '포항교도소', address: '경북 흥해우체국 사서함 2호', postalCode: '37542', phone: '054-262-1100' },
    { name: '대구구치소', address: '대구시 수성우체국 사서함 48호', postalCode: '42123', phone: '053-740-5200' },
    { name: '경북직업훈련교도소', address: '경북 진보우체국 사서함 2호', postalCode: '37409', phone: '054-874-4600' },
    { name: '안동교도소', address: '경북 안동풍산우체국 사서함 1호', postalCode: '36621', phone: '054-858-7191' },
    { name: '경북북부제2교도소', address: '경북 진보우체국 사서함 5호', postalCode: '37409', phone: '054-872-4700' },
    { name: '김천소년교도소', address: '경북 김천우체국 사서함 12호', postalCode: '39590', phone: '054-436-2191' },
    { name: '경북북부제3교도소', address: '경북 진보우체국 사서함 3호', postalCode: '37409', phone: '054-872-9511' },
    { name: '울산구치소', address: '울산시 온양우체국 사서함 1호', postalCode: '44974', phone: '052-228-9700' },
    { name: '경주교도소', address: '경북 경주우체국 사서함 45호', postalCode: '38153', phone: '054-740-3100' },
    { name: '통영구치소', address: '경남 통영우체국 사서함 17호', postalCode: '53043', phone: '055-649-8911' },
    { name: '밀양구치소', address: '경남 밀양우체국 사서함 8호', postalCode: '50445', phone: '055-350-7700' },
    { name: '상주교도소', address: '경북 상주우체국 사서함 20호', postalCode: '37190', phone: '054-531-4100' },
    { name: '거창구치소', address: '경남 거창우체국 사서함 1호', postalCode: '50132', phone: '055-940-4700' },
    { name: '부산오륜학교(부산소년원)', address: '부산광역시 금정구 오륜대로 126번길 62', postalCode: '46255', phone: '051-519-7700' },
    { name: '읍내중고등학교(대구소년원)', address: '대구광역시 북구 칠곡중앙대로 99길 12', postalCode: '41442', phone: '053-260-7200' },
  ],
  '제주': [
    { name: '제주교도소', address: '제주도 제주우체국 사서함 161호', postalCode: '63166', phone: '064-741-2800' },
    { name: '제주한길학교(제주소년원)', address: '제주특별자치도 제주시 애월읍 장소로 515', postalCode: '63037', phone: '064-797-9100' },
  ],
};

// 생년월일 옵션
const currentYear = new Date().getFullYear();
const birthYears = Array.from({ length: 80 }, (_, i) => currentYear - i);
const birthMonths = Array.from({ length: 12 }, (_, i) => i + 1);
const birthDays = Array.from({ length: 31 }, (_, i) => i + 1);

// 연령대 옵션 (주석처리)
// const ageRanges = ['10대', '20대', '30대', '40대', '50대', '60대', '70대 이상'];

const colorOptions = [
  { id: "orange", bg: "bg-orange-100", border: "border-orange-400" },
  { id: "blue", bg: "bg-blue-100", border: "border-blue-400" },
  { id: "cyan", bg: "bg-cyan-100", border: "border-cyan-400" },
  { id: "green", bg: "bg-green-100", border: "border-green-400" },
  { id: "yellow", bg: "bg-yellow-100", border: "border-yellow-400" },
  { id: "pink", bg: "bg-pink-100", border: "border-pink-400" },
  { id: "rose", bg: "bg-rose-100", border: "border-rose-400" },
  { id: "amber", bg: "bg-amber-100", border: "border-amber-400" },
  { id: "violet", bg: "bg-violet-100", border: "border-violet-400" },
];

// ===== 섹션 헤더 컴포넌트 =====
function SectionHeader({
  step,
  title,
  isActive,
  isComplete,
  onClick,
  summary
}: {
  step: number;
  title: string;
  isActive: boolean;
  isComplete: boolean;
  onClick: () => void;
  summary?: string;
}) {
  return (
    <button
      className={`w-full flex items-center py-2.5 px-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-orange-50 text-orange-600 border border-orange-200'
          : isComplete
            ? 'bg-gray-50 text-gray-700 border border-gray-100 hover:bg-gray-100'
            : 'bg-white text-gray-400 cursor-not-allowed border border-transparent'
      }`}
      onClick={onClick}
      disabled={!isActive && !isComplete}
    >
      <div className={`w-6 h-6 rounded-full mr-2.5 flex items-center justify-center text-xs font-bold ${
        isComplete
          ? 'bg-orange-500 text-white'
          : isActive
            ? 'bg-orange-500 text-white'
            : 'bg-gray-200 text-gray-500'
      }`}>
        {isComplete ? <Check className="w-3.5 h-3.5" /> : step}
      </div>
      <span className="font-semibold text-sm mr-2 truncate flex-1 text-left">{title}</span>
      {isComplete && summary && (
        <span className="text-xs text-gray-500 truncate mr-3 max-w-[120px]">{summary}</span>
      )}
      {(isActive || isComplete) && (
        <motion.div animate={{ rotate: isActive ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      )}
    </button>
  );
}

// ===== 메인 컴포넌트 =====
export function AddRecipientInline({ isExpanded, onExpandedChange, onSuccess, editingMemberId }: AddRecipientInlineProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Form Data
  const [facilityType, setFacilityType] = useState('');
  const [region, setRegion] = useState('');
  const [facilitySearchQuery, setFacilitySearchQuery] = useState('');
  const [facility, setFacility] = useState('');
  const [facilityInfo, setFacilityInfo] = useState<FacilityInfo | null>(null);
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  // const [useAgeRange, setUseAgeRange] = useState(false);
  // const [ageRange, setAgeRange] = useState('');
  const [prisonerNumber, setPrisonerNumber] = useState('');
  const [militaryAffiliation, setMilitaryAffiliation] = useState('');
  const [militaryId, setMilitaryId] = useState('');
  const [relation, setRelation] = useState('');
  const [customRelation, setCustomRelation] = useState('');
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [autoCreateFolder, setAutoCreateFolder] = useState(true);
  const [needsAddressSearch, setNeedsAddressSearch] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);

  const { familyMembers, createFamilyMember, updateFamilyMember, isCreating } = useFamilyMembers();
  const { createFolder: createLetterFolder } = useLetterFolders();

  const isMilitary = facilityType === '군부대/훈련소';
  const isGeneral = facilityType === '일반 주소';

  // 시설 유형에 따라 시설 목록 필터링
  const getFilteredFacilities = (region: string) => {
    const allFacilities = facilitiesByRegion[region] || [];

    if (facilityType === '교도소') {
      return allFacilities.filter(f =>
        f.name.includes('교도소') &&
        !f.name.includes('구치소') &&
        !f.name.includes('소년')
      );
    }

    if (facilityType === '구치소') {
      return allFacilities.filter(f => f.name.includes('구치소'));
    }

    if (facilityType === '소년원') {
      return allFacilities.filter(f =>
        (f.name.includes('소년원') || f.name.includes('학교')) &&
        !f.name.includes('소년교도소')
      );
    }

    if (facilityType === '소년교도소') {
      return allFacilities.filter(f => f.name.includes('소년교도소'));
    }

    return allFacilities;
  };

  // 선택된 시설 유형에 따라 시설이 있는 지역만 필터링
  const availableRegions = regions.filter(region => {
    return getFilteredFacilities(region).length > 0;
  });

  // 시설 검색 결과 (region 포함)
  const facilitySearchResults = facilitySearchQuery.trim()
    ? availableRegions.flatMap(reg =>
        getFilteredFacilities(reg).map(fac => ({ ...fac, region: reg }))
      ).filter(fac =>
        fac.name.includes(facilitySearchQuery.trim()) ||
        fac.region.includes(facilitySearchQuery.trim()) ||
        fac.address.includes(facilitySearchQuery.trim())
      )
    : [];

  // 주소 검색 완료 핸들러
  const handleAddressSelect = (result: AddressResult) => {
    setPostalCode(result.zipNo);
    setAddress(result.roadAddr);
    setIsPostcodeOpen(false);
  };

  // Reset when facility type changes
  useEffect(() => {
    if (facilityType) {
      setCompletedSteps({ 1: true });
      setRegion('');
      setFacility('');
      setFacilityInfo(null);
      setAddress('');
      setPostalCode('');
      setDetailedAddress('');
      setName('');
      setPrisonerNumber('');
      setMilitaryAffiliation('');
      setMilitaryId('');
      setRelation('');
      setCustomRelation('');
      setNeedsAddressSearch(false);

      // 군부대/훈련소나 일반 주소는 지역 선택 건너뛰고 바로 다음 단계로
      if (isMilitary) {
        setCompletedSteps({ 1: true, 2: true });
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    }
  }, [facilityType, isMilitary]);

  // 접혔을 때 폼 리셋
  useEffect(() => {
    if (!isExpanded) {
      resetForm();
    }
  }, [isExpanded]);

  // 수정 모드: 기존 데이터로 폼 채우기
  useEffect(() => {
    if (editingMemberId && isExpanded) {
      const member = familyMembers.find(m => m.id === editingMemberId);
      if (member) {
        // 이름, 관계
        setName(member.name || '');
        setGender((member.gender as 'male' | 'female' | '') || '');
        setRelation(member.relation || '');
        setPrisonerNumber(member.prisonerNumber || '');

        // 생년월일 또는 연령대 (연령대 기능 주석처리)
        // if ((member as any).isEstimatedAge && member.birthDate) {
        //   // 연령대로 입력된 경우
        //   const parts = member.birthDate.split('-');
        //   if (parts.length === 3) {
        //     const age = currentYear - parseInt(parts[0]);
        //     // 나이를 연령대로 변환
        //     let range = '';
        //     if (age >= 10 && age < 20) range = '10대';
        //     else if (age >= 20 && age < 30) range = '20대';
        //     else if (age >= 30 && age < 40) range = '30대';
        //     else if (age >= 40 && age < 50) range = '40대';
        //     else if (age >= 50 && age < 60) range = '50대';
        //     else if (age >= 60 && age < 70) range = '60대';
        //     else if (age >= 70) range = '70대 이상';
        //
        //     if (range) {
        //       setUseAgeRange(true);
        //       setAgeRange(range);
        //     }
        //   }
        // } else
        if (member.birthDate) {
          // 정확한 생년월일
          const parts = member.birthDate.split('-');
          if (parts.length === 3) {
            // setUseAgeRange(false);
            setBirthYear(parts[0]);
            setBirthMonth(parts[1]);
            setBirthDay(parts[2]);
          }
        }

        // 시설 유형
        if (member.facilityType) {
          setFacilityType(member.facilityType);
        }

        // 시설/주소 정보
        if (member.facility) {
          setFacility(member.facility);
          if (member.facilityAddress) {
            setFacilityInfo({ name: member.facility, address: member.facilityAddress, postalCode: '', phone: '' });
          }
        }
        if (member.facilityAddress) {
          setAddress(member.facilityAddress);
        }

        // 군부대 정보
        if (member.militaryInfo) {
          setMilitaryAffiliation(member.militaryInfo.affiliation || '');
          setMilitaryId(member.militaryInfo.militaryId || '');
        }

        // 모든 스텝 완료 처리 → 마지막 스텝으로
        setCompletedSteps({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true });
        setCurrentStep(1);
      }
    }
  }, [editingMemberId, isExpanded, familyMembers]);

  const handleStepClick = (step: number) => {
    if (step === currentStep) {
      // 현재 열린 스텝을 닫으면 이전 완료된 스텝으로 돌아감
      const prevStep = step - 1;
      if (prevStep >= 1 && completedSteps[prevStep]) {
        setCurrentStep(prevStep);
      } else {
        if(step === 1) {
          return ;
        }
        // 이전 스텝이 없으면 닫기만 (0 = 아무것도 안 열림)
        setCurrentStep(0 as number);
      }
    } else if (completedSteps[step]) {
      setCurrentStep(step);
    }
  };

  const completeStep = (step: number) => {
    setCompletedSteps((prev) => ({ ...prev, [step]: true }));
    setCurrentStep(step + 1);
  };

  const getRecipientInfoStep = () => {
    if (isGeneral) return 3;
    if (isMilitary && needsAddressSearch) return 5;
    if (isMilitary) return 4;
    return 4;
  };

  const getFinalStep = () => {
    if (isGeneral) return 4;
    if (isMilitary && needsAddressSearch) return 6;
    if (isMilitary) return 5;
    return 5;
  };

  // 연령대를 중간 나이로 변환 (주석처리)
  // const ageRangeToAge = (range: string): number => {
  //   switch (range) {
  //     case '10대': return 15;
  //     case '20대': return 25;
  //     case '30대': return 35;
  //     case '40대': return 45;
  //     case '50대': return 55;
  //     case '60대': return 65;
  //     case '70대 이상': return 75;
  //     default: return 25;
  //   }
  // };

  const handleSubmit = async () => {
    if (!name.trim() || !relation) return;
    if (relation === '기타' && !customRelation.trim()) return;
    if (!isGeneral && !isMilitary && !prisonerNumber.trim()) return;
    if (isMilitary && !militaryId.trim()) return;

    const colorClass = colorOptions.find(c => c.id === selectedColor);

    let finalFacilityName = '';
    let finalFacilityAddress = '';
    let finalPostalCode = '';
    let finalDetailedAddress = '';

    if (isGeneral || (isMilitary && needsAddressSearch)) {
      finalFacilityName = address;
      finalFacilityAddress = address;
      finalPostalCode = postalCode;
      finalDetailedAddress = detailedAddress;
    } else if (facilityInfo) {
      finalFacilityName = facilityInfo.name;
      finalFacilityAddress = facilityInfo.address;
      finalPostalCode = facilityInfo.postalCode;
    } else {
      finalFacilityName = facility;
    }

    // 생년월일 또는 연령대 조합 (연령대 기능 주석처리)
    // 연령대 선택시 중간 나이로 생년월일 계산 (예: 20대 → 25세 → 2001-01-01)
    // const birthDate = useAgeRange && ageRange
    //   ? `${currentYear - ageRangeToAge(ageRange)}-01-01`
    //   : (birthYear && birthMonth && birthDay
    //       ? `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`
    //       : undefined);

    const birthDate = birthYear && birthMonth && birthDay
      ? `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`
      : undefined;

    const memberData = {
      name: name.trim(),
      gender: gender || undefined,
      birthDate,
      // isEstimatedAge: useAgeRange ? true : undefined, // 연령대로 입력된 경우 true
      relation: relation === '기타' ? customRelation.trim() : relation,
      facilityName: finalFacilityName,
      facilityAddress: finalFacilityAddress,
      facilityType,
      region: isGeneral ? undefined : region,
      prisonerNumber: prisonerNumber.trim() || undefined,
      militaryInfo: isMilitary ? { affiliation: militaryAffiliation, militaryId } : undefined,
      color: colorClass ? `${colorClass.bg} text-${selectedColor}-600` : "bg-orange-100 text-orange-600",
      postalCode: finalPostalCode,
      detailedAddress: finalDetailedAddress,
    };

    if (editingMemberId) {
      await updateFamilyMember(editingMemberId, memberData);
      resetForm();
      onExpandedChange(false);
      onSuccess?.(editingMemberId);
    } else {
      const newMember = await createFamilyMember(memberData);
      resetForm();
      onExpandedChange(false);
      if (newMember?.id) {
        onSuccess?.(newMember.id);
      }
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setCompletedSteps({});
    setFacilityType('');
    setRegion('');
    setFacility('');
    setFacilityInfo(null);
    setAddress('');
    setPostalCode('');
    setDetailedAddress('');
    setName('');
    setGender('');
    setBirthYear('');
    setBirthMonth('');
    setBirthDay('');
    // setUseAgeRange(false);
    // setAgeRange('');
    setPrisonerNumber('');
    setMilitaryAffiliation('');
    setMilitaryId('');
    setRelation('');
    setCustomRelation('');
    setSelectedColor('yellow');
    setIsPostcodeOpen(false);
    setNeedsAddressSearch(false);
  };

  return (
    <div className="w-full">
      {/* 닫혀있을 때만 추가/수정 버튼 표시 (열리면 취소 버튼으로 닫음) */}
      {!isExpanded && (
        <button
          onClick={() => onExpandedChange(true)}
          className="w-full p-3 border border-dashed border-border/60 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/40 hover:text-primary"
        >
          <Plus className="w-4 h-4" />
          <span>{editingMemberId ? '수신자 수정' : '새 수신자 추가'}</span>
        </button>
      )}

      {/* 아코디언 내용 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 mb-4 pb-3">
                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-800">{editingMemberId ? '받는 사람 수정' : '받는 사람 추가'}</h3>
              </div>

              <div className="space-y-2">
                {/* Step 1: 받는 곳 선택 */}
                <SectionHeader
                  step={1}
                  title="받는 곳 선택"
                  isActive={currentStep === 1}
                  isComplete={!!completedSteps[1]}
                  onClick={() => handleStepClick(1)}
                  summary={facilityType}
                />
                <AnimatePresence>
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 rounded-xl flex flex-wrap justify-between gap-2 mb-3">
                        {facilityTypes.map((type) => (
                          <button
                            key={type.id}
                            className={`flex items-center py-2 px-3 rounded-lg transition-all text-sm ${
                              facilityType === type.label
                                ? 'bg-white shadow-md border-2 border-orange-200'
                                : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                            }`}
                            onClick={() => setFacilityType(type.label)}
                          >
                            <span className="text-base mr-1.5">{type.icon}</span>
                            <span className={`font-semibold text-xs ${facilityType === type.label ? 'text-orange-600' : 'text-gray-600'}`}>
                              {type.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 2: 지역 선택 (일반 주소 제외) */}
                {!isGeneral && facilityType && (
                  <>
                    <SectionHeader
                      step={2}
                      title="지역 선택"
                      isActive={currentStep === 2}
                      isComplete={!!completedSteps[2]}
                      onClick={() => handleStepClick(2)}
                      summary={region}
                    />
                    <AnimatePresence>
                      {currentStep === 2 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mb-3">
                            <p className="font-semibold text-xs text-gray-700 mb-2 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-orange-500" />
                              지역 선택
                            </p>
                            {/* 시설 검색 */}
                            <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              <input
                                type="text"
                                placeholder="시설명 또는 지역으로 검색"
                                value={facilitySearchQuery}
                                onChange={(e) => {
                                  setFacilitySearchQuery(e.target.value);
                                  setSelectedSearchIndex(-1);
                                }}
                                onKeyDown={(e) => {
                                  if (!facilitySearchQuery.trim() || facilitySearchResults.length === 0) return;

                                  if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setSelectedSearchIndex((prev) =>
                                      prev < facilitySearchResults.length - 1 ? prev + 1 : prev
                                    );
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setSelectedSearchIndex((prev) => prev > 0 ? prev - 1 : -1);
                                  } else if (e.key === 'Enter' && selectedSearchIndex >= 0) {
                                    e.preventDefault();
                                    const selectedFac = facilitySearchResults[selectedSearchIndex];
                                    if (selectedFac) {
                                      setRegion(selectedFac.region);
                                      setFacility(selectedFac.name);
                                      setFacilityInfo(selectedFac);
                                      setNeedsAddressSearch(false);
                                      setFacilitySearchQuery('');
                                      setSelectedSearchIndex(-1);
                                      completeStep(2);
                                      completeStep(3);
                                    }
                                  }
                                }}
                                className="w-full pl-8 pr-3 py-2 text-xs border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors placeholder:text-gray-400 focus:placeholder:opacity-0"
                              />
                            </div>
                            {facilitySearchQuery.trim() ? (
                              /* 검색 결과 표시 */
                              <div className="grid grid-cols-1 gap-1.5 max-h-[280px] overflow-y-auto pr-1">
                                {facilitySearchResults.length === 0 ? (
                                  <p className="text-xs text-gray-400 text-center py-4">검색 결과가 없습니다</p>
                                ) : (
                                  facilitySearchResults.map((fac, index) => (
                                    <button
                                      key={fac.name}
                                      className={`rounded-lg px-3 py-2.5 text-left transition-all ${
                                        selectedSearchIndex === index || facility === fac.name
                                          ? 'border-2 border-dashed border-orange-500'
                                          : 'border-2 border-transparent hover:border-dashed hover:border-orange-300'
                                      }`}
                                      onClick={() => {
                                        setRegion(fac.region);
                                        setFacility(fac.name);
                                        setFacilityInfo(fac);
                                        setNeedsAddressSearch(false);
                                        setFacilitySearchQuery('');
                                        setSelectedSearchIndex(-1);
                                        completeStep(2);
                                        completeStep(3);
                                      }}
                                    >
                                      <p className={`text-xs font-medium ${selectedSearchIndex === index || facility === fac.name ? 'text-orange-700' : 'text-gray-700'}`}>{fac.name}</p>
                                      <p className="text-size-10 text-gray-400 mt-0.5">{fac.region} · {fac.address}</p>
                                    </button>
                                  ))
                                )}
                              </div>
                            ) : (
                              /* 지역 버튼 그리드 */
                              <div className="grid grid-cols-3 gap-1.5">
                                {availableRegions.map((reg) => (
                                  <button
                                    key={reg}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                                      region === reg
                                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                                        : 'border-gray-200 text-gray-600 hover:border-orange-300'
                                    }`}
                                    onClick={() => {
                                      setRegion(reg);
                                      completeStep(2);
                                    }}
                                  >
                                    {reg}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* Step 3: 시설 선택 (일반 주소 제외) */}
                {!isGeneral && (region || isMilitary) && (
                  <>
                    <SectionHeader
                      step={3}
                      title="시설 선택"
                      isActive={currentStep === 3}
                      isComplete={!!completedSteps[3]}
                      onClick={() => handleStepClick(3)}
                      summary={facilityInfo ? `${facilityInfo.name}` : facility}
                    />
                    <AnimatePresence>
                      {currentStep === 3 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-gray-100 pt-3 mb-3">
                            <p className="font-semibold text-xs text-gray-700 mb-2 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-orange-500" />
                              {isMilitary ? `군부대/훈련소 선택 (${militaryFacilities.length})` : `시설 선택 (${getFilteredFacilities(region).length})`}
                            </p>
                            <div className="grid grid-cols-1 gap-1.5 max-h-[280px] overflow-y-auto pr-1">
                              {isMilitary ? (
                                militaryFacilities.map((fac) => (
                                  <button
                                    key={fac.name}
                                    className={`rounded-lg px-3 py-2.5 text-left transition-all ${
                                      facility === fac.name
                                        ? 'border-2 border-dashed border-orange-500'
                                        : 'border-2 border-transparent hover:border-dashed hover:border-orange-300'
                                    }`}
                                    onClick={() => {
                                      setFacility(fac.name);
                                      if (fac.name === '기타 부대 (주소검색)') {
                                        setNeedsAddressSearch(true);
                                        setFacilityInfo(null);
                                        completeStep(3);
                                      } else {
                                        setNeedsAddressSearch(false);
                                        setFacilityInfo(fac);
                                        completeStep(3);
                                      }
                                    }}
                                  >
                                    <div className="font-medium text-xs mb-0.5">{fac.name}</div>
                                    {fac.address !== '주소검색으로 입력' && (
                                      <>
                                        <div className="text-size-10 text-gray-500">
                                          {fac.address}{fac.postalCode && ` (우편번호:${fac.postalCode})`}
                                        </div>
                                        <div className="text-size-10 mt-0.5 text-gray-400">
                                          📞 {fac.phone}
                                        </div>
                                      </>
                                    )}
                                    {fac.address === '주소검색으로 입력' && (
                                      <div className="text-size-10 text-gray-500">
                                        리스트에 없는 부대는 주소검색으로 입력
                                      </div>
                                    )}
                                  </button>
                                ))
                              ) : (
                                getFilteredFacilities(region).length === 0 ? (
                                  <div className="text-center py-6 text-gray-500 text-xs">
                                    해당 지역에 {facilityType} 시설이 없습니다.
                                  </div>
                                ) : (
                                  getFilteredFacilities(region).map((fac) => (
                                    <button
                                      key={fac.name}
                                      className={`rounded-lg px-3 py-2.5 text-left transition-all ${
                                        facility === fac.name
                                          ? 'border-2 border-dashed border-orange-500'
                                          : 'border-2 border-transparent hover:border-dashed hover:border-orange-300'
                                      }`}
                                      onClick={() => {
                                        setFacility(fac.name);
                                        setFacilityInfo(fac);
                                        completeStep(3);
                                      }}
                                    >
                                      <div className="font-medium text-xs mb-0.5">{fac.name}</div>
                                      <div className="text-size-10 text-gray-500">
                                        {fac.address}{fac.postalCode && ` (우편번호:${fac.postalCode})`}
                                      </div>
                                      <div className="text-size-10 mt-0.5 text-gray-400">
                                        📞 {fac.phone}
                                      </div>
                                    </button>
                                  ))
                                )
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* Step 4 (군부대 기타): 주소 입력 */}
                {isMilitary && needsAddressSearch && completedSteps[3] && (
                  <>
                    <SectionHeader
                      step={4}
                      title="부대 주소 입력"
                      isActive={currentStep === 4}
                      isComplete={!!completedSteps[4]}
                      onClick={() => handleStepClick(4)}
                      summary={address ? `${address}${detailedAddress ? ' ' + detailedAddress : ''}` : ''}
                    />
                    <AnimatePresence>
                      {currentStep === 4 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 mb-3">
                            {!isPostcodeOpen && (
                              <>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="우편번호"
                                    value={postalCode}
                                    readOnly
                                    className="h-9 text-sm flex-1 focus-visible:ring-0 placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all"
                                  />
                                  <Button
                                    onClick={() => setIsPostcodeOpen(true)}
                                    variant="outline"
                                    className="h-9 px-3 text-xs"
                                  >
                                    <Search className="w-3.5 h-3.5 mr-1" />
                                    주소검색
                                  </Button>
                                </div>
                                {address && (
                                  <>
                                    <Input
                                      placeholder="도로명 주소"
                                      value={address}
                                      readOnly
                                      className="h-9 text-sm bg-gray-50 focus-visible:ring-0 placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all"
                                    />
                                    <Input
                                      placeholder="상세주소 (동/호수 등)"
                                      value={detailedAddress}
                                      onChange={(e) => setDetailedAddress(e.target.value)}
                                      className="h-9 text-sm focus-visible:ring-0 focus-visible:border-primary placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all"
                                    />
                                  </>
                                )}
                              </>
                            )}

                            {isPostcodeOpen && (
                              <AddressSearch
                                onSelect={handleAddressSelect}
                                onClose={() => setIsPostcodeOpen(false)}
                                compact
                              />
                            )}

                            {!isPostcodeOpen && address && (
                              <Button onClick={() => completeStep(4)} className="w-full h-9 text-sm">
                                다음
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* Step 2 (일반 주소): 주소 입력 */}
                {isGeneral && (
                  <>
                    <SectionHeader
                      step={2}
                      title="주소 입력"
                      isActive={currentStep === 2}
                      isComplete={!!completedSteps[2]}
                      onClick={() => handleStepClick(2)}
                      summary={address ? `${address}${detailedAddress ? ' ' + detailedAddress : ''}` : ''}
                    />
                    <AnimatePresence>
                      {currentStep === 2 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 mb-3">
                            {!isPostcodeOpen && (
                              <>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="우편번호"
                                    value={postalCode}
                                    readOnly
                                    className="h-9 text-sm flex-1 focus-visible:ring-0 placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all"
                                  />
                                  <Button
                                    onClick={() => setIsPostcodeOpen(true)}
                                    variant="outline"
                                    className="h-9 px-3 text-xs"
                                  >
                                    <Search className="w-3.5 h-3.5 mr-1" />
                                    주소검색
                                  </Button>
                                </div>
                                {address && (
                                  <>
                                    <Input
                                      placeholder="도로명 주소"
                                      value={address}
                                      readOnly
                                      className="h-9 text-sm bg-gray-50 focus-visible:ring-0 placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all"
                                    />
                                    <Input
                                      placeholder="상세주소 (동/호수 등)"
                                      value={detailedAddress}
                                      onChange={(e) => setDetailedAddress(e.target.value)}
                                      className="h-9 text-sm focus-visible:ring-0 focus-visible:border-primary placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all"
                                    />
                                  </>
                                )}
                              </>
                            )}

                            {isPostcodeOpen && (
                              <AddressSearch
                                onSelect={handleAddressSelect}
                                onClose={() => setIsPostcodeOpen(false)}
                                compact
                              />
                            )}

                            {!isPostcodeOpen && address && (
                              <Button onClick={() => completeStep(2)} className="w-full h-9 text-sm">
                                다음
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* 받는 분 정보 */}
                {((isGeneral && completedSteps[2]) ||
                  (isMilitary && needsAddressSearch && completedSteps[4]) ||
                  (isMilitary && !needsAddressSearch && completedSteps[3]) ||
                  (!isGeneral && !isMilitary && completedSteps[3])) && (
                  <>
                    <SectionHeader
                      step={getRecipientInfoStep()}
                      title="받는 분 정보"
                      isActive={currentStep === getRecipientInfoStep()}
                      isComplete={!!completedSteps[getRecipientInfoStep()]}
                      onClick={() => handleStepClick(getRecipientInfoStep())}
                    />
                    <AnimatePresence>
                      {currentStep === getRecipientInfoStep() && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-3 mb-3">
                            {/* 기본 정보: 아이콘, 성별, 이름, 생년월일, 수용자번호 - PC에서 한줄 */}
                            <div className="flex flex-col gap-2">
                              {/* 첫 번째 줄: 아이콘 + 성별 + 이름 + 생년월일/연령대 + 수용자번호 */}
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-orange-500" />
                                </div>

                                {/* 성별 선택 */}
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setGender(gender === 'male' ? '' : 'male')}
                                    className={cn(
                                      "px-2 py-1.5 rounded-md text-xs font-medium border transition-all",
                                      gender === 'male'
                                        ? "bg-white text-orange-600 border-orange-500"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                                    )}
                                  >
                                    남
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setGender(gender === 'female' ? '' : 'female')}
                                    className={cn(
                                      "px-2 py-1.5 rounded-md text-xs font-medium border transition-all",
                                      gender === 'female'
                                        ? "bg-white text-orange-600 border-orange-500"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                                    )}
                                  >
                                    여
                                  </button>
                                </div>

                                {/* 이름 */}
                                <Input
                                  placeholder="받는 분 성함"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  className="w-32 h-9 text-sm focus-visible:ring-0 focus-visible:border-primary placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all"
                                />

                                {/* 수용자 번호 (교도소/구치소/소년원만) */}
                                {!isGeneral && !isMilitary && (
                                  <Input
                                    placeholder="수용자 번호"
                                    value={prisonerNumber}
                                    onChange={(e) => setPrisonerNumber(e.target.value)}
                                    maxLength={4}
                                    className="h-9 text-sm focus-visible:ring-0 focus-visible:border-primary w-28 placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all"
                                  />
                                )}

                                {/* 생년월일 (연령대 기능 주석처리) */}
                                <div className="flex gap-1 flex-1">
                                  <Select value={birthYear} onValueChange={setBirthYear}>
                                    <SelectTrigger className="h-9 text-sm border-gray-200">
                                      <SelectValue placeholder="생년" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white z-50 max-h-60">
                                      {birthYears.map((year) => (
                                        <SelectItem key={year} value={String(year)}>{year}년</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <Select value={birthMonth} onValueChange={setBirthMonth}>
                                    <SelectTrigger className="h-9 text-sm border-gray-200">
                                      <SelectValue placeholder="월" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white z-50">
                                      {birthMonths.map((month) => (
                                        <SelectItem key={month} value={String(month)}>{month}월</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <Select value={birthDay} onValueChange={setBirthDay}>
                                    <SelectTrigger className="h-9 text-sm border-gray-200">
                                      <SelectValue placeholder="일" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white z-50">
                                      {birthDays.map((day) => (
                                        <SelectItem key={day} value={String(day)}>{day}일</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            {/* 군부대 정보 (군부대만) */}
                            {isMilitary && (
                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <label className="text-xs text-gray-600">소속/군종</label>
                                  <Input
                                    placeholder="예: 1중대 2소대"
                                    value={militaryAffiliation}
                                    onChange={(e) => setMilitaryAffiliation(e.target.value)}
                                    className="h-9 text-sm focus-visible:ring-0 focus-visible:border-primary placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs text-gray-600 flex items-center gap-1">
                                    훈련번호/군번 <span className="text-red-500">*</span>
                                  </label>
                                  <Input
                                    placeholder="예: 23-12345678"
                                    value={militaryId}
                                    onChange={(e) => setMilitaryId(e.target.value)}
                                    className="h-9 text-sm focus-visible:ring-0 focus-visible:border-primary placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all"
                                  />
                                </div>
                              </div>
                            )}

                            <Button
                              onClick={() => completeStep(getRecipientInfoStep())}
                              disabled={!name || (!isGeneral && !isMilitary && !prisonerNumber.trim()) || (isMilitary && !militaryId.trim())}
                              className="w-full h-9 text-sm"
                            >
                              다음
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* 관계 선택 */}
                {((isGeneral && completedSteps[3]) ||
                  (isMilitary && completedSteps[getRecipientInfoStep()]) ||
                  (!isGeneral && !isMilitary && completedSteps[4])) && (
                  <>
                    <SectionHeader
                      step={getFinalStep()}
                      title="받는분과의 관계"
                      isActive={currentStep === getFinalStep()}
                      isComplete={!!completedSteps[getFinalStep()]}
                      onClick={() => handleStepClick(getFinalStep())}
                      summary={relation === '기타' ? customRelation : relation}
                    />
                    <AnimatePresence>
                      {currentStep === getFinalStep() && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-gray-100 pt-3 mb-3">
                            <div className="flex items-center mb-2">
                              <Users className="w-3.5 h-3.5 text-orange-500 mr-1.5" />
                              <h3 className="font-semibold text-xs text-gray-700">받는분과의 관계</h3>
                            </div>
                            <p className="text-size-11 text-gray-400 mb-2">나에게 받는분은 어떤 사이인가요?</p>
                            <div className="flex flex-wrap gap-1.5">
                              {relations.map((rel) => (
                                <button
                                  key={rel}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                                    relation === rel
                                      ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                                  }`}
                                  onClick={() => {
                                    setRelation(rel);
                                    if (rel !== '기타') {
                                      setCompletedSteps((prev) => ({ ...prev, [getFinalStep()]: true }));
                                    }
                                  }}
                                >
                                  {rel}
                                </button>
                              ))}
                            </div>

                            {relation === '기타' && (
                              <div className="mt-3">
                                <Input
                                  placeholder="관계를 입력해주세요 (예: 삼촌, 이모, 사촌 등)"
                                  value={customRelation}
                                  onChange={(e) => setCustomRelation(e.target.value)}
                                  className="h-9 text-sm focus-visible:ring-0 focus-visible:border-primary placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all"
                                  autoFocus
                                />
                              </div>
                            )}

                            {relation && (relation !== '기타' || customRelation.trim()) && facilityInfo && (
                              <div className="mt-3 pt-3 border-t">
                                {/* 시설 정보 요약 */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs">
                                  <div className="font-medium text-blue-900 mb-0.5">📍 {facilityInfo.name}</div>
                                  <div className="text-blue-700 text-size-10">{facilityInfo.address}</div>
                                  <div className="text-blue-600 text-size-10 mt-0.5">
                                    📞 {facilityInfo.phone} | <span className="text-size-9">(우)</span> {facilityInfo.postalCode}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>

              {/* 취소 / 추가(수정) 버튼 — 항상 표시 */}
              {!isPostcodeOpen && (
                <div className="flex gap-2 ">
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-sm"
                    onClick={() => {
                      resetForm();
                      onExpandedChange(false);
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    className="flex-1 h-9 text-sm"
                    onClick={handleSubmit}
                    disabled={
                      isCreating ||
                      !name.trim() ||
                      !relation ||
                      (relation === '기타' && !customRelation.trim()) ||
                      (isGeneral && !address) ||
                      (!isGeneral && !isMilitary && !facilityInfo) ||
                      (!isGeneral && !isMilitary && !prisonerNumber.trim()) ||
                      (isMilitary && !facilityInfo && !address) ||
                      (isMilitary && !militaryId.trim())
                    }
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        {editingMemberId ? '수정 중...' : '추가 중...'}
                      </>
                    ) : (
                      editingMemberId ? '수정하기' : '추가하기'
                    )}
                  </Button>
                </div>
              )}

              {/* 로딩 표시 */}
              {isCreating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 flex items-center justify-center gap-2 py-3 text-orange-600"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-medium">받는 사람 추가 중...</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
