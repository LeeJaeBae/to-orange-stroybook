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
  Search
} from "lucide-react";
// daumPostcodeTheme removed — using AddressSearch
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { cn } from "@/lib/utils";
import { useLetterFolders } from "@/hooks/useLetterFolders";

interface AddRecipientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (memberId: string) => void;
}

// ===== 데이터 정의 =====
const facilityTypes = [
  { id: 'prison', label: '교도소', icon: '🏢' },
  { id: 'detention', label: '구치소', icon: '🏢' },
  { id: 'juvenile-detention', label: '소년원', icon: '🏫' },
  { id: 'juvenile-prison', label: '소년교도소', icon: '🏫' },
  { id: 'military', label: '군부대/훈련소', icon: '🪖' },
  { id: 'general', label: '일반 주소', icon: '🏠' },
];

const relations = [
  "나의 조부모", "나의 어머니", "나의 아버지", "나의 형제", "나의 자매", "나의 자녀", "나의 남편", "나의 아내",
  "나의 연인", "나의 친구", "나의 선배", "나의 후배", "나의 지인", "법률대리인", "기타"
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

// 전국 교도소/구치소/소년원 시설 목록 (2024년 기준)
const facilitiesByRegion: Record<string, FacilityInfo[]> = {
  '서울/경기/인천': [
    { name: '서울구치소', address: '경기도 의왕시 안양판교로 143 (포일동)', postalCode: '15829', phone: '031-423-6100' },
    { name: '안양교도소', address: '경기도 안양시 동안구 경수대로508번길 42 (호계동)', postalCode: '14047', phone: '031-452-2181' },
    { name: '수원구치소', address: '경기도 수원시 팔달구 팔달문로 176 (우만동)', postalCode: '16326', phone: '031-217-7101' },
    { name: '서울동부구치소', address: '서울특별시 송파구 정의로 37 (문정동)', postalCode: '05661', phone: '02-402-9131' },
    { name: '인천구치소', address: '인천광역시 미추홀구 학익소로 30 (학익동)', postalCode: '21552', phone: '032-868-8771' },
    { name: '서울남부구치소', address: '서울특별시 구로구 금오로 865 (천왕동)', postalCode: '08576', phone: '02-2105-0391' },
    { name: '화성직업훈련교도소', address: '경기도 화성시 마도면 화성로 741', postalCode: '18270', phone: '031-357-9400' },
    { name: '여주교도소', address: '경기도 여주시 가남읍 양화로 107', postalCode: '12627', phone: '031-884-7800' },
    { name: '의정부교도소', address: '경기도 의정부시 송산로 1111-76 (고산동)', postalCode: '11778', phone: '031-850-1000' },
    { name: '서울남부교도소', address: '서울특별시 구로구 금오로 867 (천왕동)', postalCode: '08576', phone: '02-2083-0200' },
    { name: '수원구치소 평택지소', address: '경기도 평택시 평남로 1046-10 (동삭동)', postalCode: '17895', phone: '031-650-5800' },
    { name: '소망교도소(민영)', address: '경기도 여주시 북내읍 아가페길 140', postalCode: '12627', phone: '031-887-5900' },
    { name: '고봉중고등학교(서울소년원)', address: '경기도 의왕시 고산로 87', postalCode: '16075', phone: '031-455-6111' },
    { name: '정심여자중고등학교(안양소년원)', address: '경기도 안양시 만안구 삼막로 96번길 11', postalCode: '13910', phone: '031-473-3781' },
    { name: '서울소년분류심사원', address: '경기도 안양시 동안구 경수대로 500', postalCode: '14122', phone: '031-451-2683' },
  ],
  '강원': [
    { name: '춘천교도소', address: '강원특별자치도 춘천시 동내면 신촌양지길 5', postalCode: '24364', phone: '033-262-1332' },
    { name: '원주교도소', address: '강원특별자치도 원주시 북원로 2155 (무실동)', postalCode: '26485', phone: '033-741-4800' },
    { name: '강릉교도소', address: '강원특별자치도 강릉시 공제로 413-15 (홍제동)', postalCode: '25534', phone: '033-649-8100' },
    { name: '영월교도소', address: '강원특별자치도 영월군 영월읍 팔괴로 110-27', postalCode: '26233', phone: '033-372-1730' },
    { name: '강원북부교도소', address: '강원특별자치도 속초시 동해대로 4511번길 13', postalCode: '24862', phone: '033-634-7114' },
    { name: '춘천신촌학교(춘천소년원)', address: '강원특별자치도 춘천시 동내면 장안길 51', postalCode: '24407', phone: '033-250-2300' },
  ],
  '충청': [
    { name: '대전교도소', address: '대전광역시 유성구 한우물로66번길 6 (대정동)', postalCode: '34186', phone: '042-544-9301' },
    { name: '천안개방교도소', address: '충청남도 천안시 서북구 신당새터1길 1 (신당동)', postalCode: '31158', phone: '041-561-4301' },
    { name: '청주교도소', address: '충청북도 청주시 서원구 청남로 1887번길 49', postalCode: '28426', phone: '043-296-8171' },
    { name: '천안교도소', address: '충청남도 천안시 서북구 성거읍 상고1길 127', postalCode: '31016', phone: '041-521-7600' },
    { name: '청주여자교도소', address: '충청북도 청주시 서원구 청남로1887번길 78', postalCode: '28426', phone: '043-288-8140' },
    { name: '공주교도소', address: '충청남도 공주시 장기로 21-45 (금흥동)', postalCode: '32546', phone: '041-851-3200' },
    { name: '충주구치소', address: '충청북도 충주시 산척면 천등박달로 222', postalCode: '27313', phone: '043-856-9701' },
    { name: '홍성교도소', address: '충청남도 홍성군 홍성읍 충서로 1245', postalCode: '32247', phone: '041-630-8600' },
    { name: '홍성교도소 서산지소', address: '충청남도 서산시 성연면 두치로 343', postalCode: '31930', phone: '041-669-6891' },
    { name: '대전교도소 논산지소', address: '충청남도 논산시 성동면 금백로 662-19', postalCode: '32927', phone: '041-733-2220' },
    { name: '대전대산학교(대전소년원)', address: '대전광역시 동구 산내로 1398-41', postalCode: '34699', phone: '042-250-3100' },
    { name: '청주미평여자학교(청주소년원)', address: '충북 청주시 서원구 남지로 41번길 23', postalCode: '28632', phone: '043-295-7230' },
  ],
  '전라': [
    { name: '광주교도소', address: '광주광역시 북구 북부순환로 396', postalCode: '61244', phone: '062-251-4321' },
    { name: '전주교도소', address: '전북특별자치도 전주시 완산구 구이로 2034 (평화동3가)', postalCode: '54966', phone: '063-224-4361' },
    { name: '순천교도소', address: '전라남도 순천시 서면 백강로 790', postalCode: '57987', phone: '061-751-2114' },
    { name: '목포교도소', address: '전라남도 무안군 일로읍 일로중앙로 78', postalCode: '58547', phone: '061-284-4101' },
    { name: '군산교도소', address: '전북특별자치도 군산시 옥구읍 할미로 127', postalCode: '54025', phone: '063-462-0101' },
    { name: '장흥교도소', address: '전라남도 장흥군 용산면 장흥대로 2667', postalCode: '59328', phone: '061-860-9114' },
    { name: '해남교도소', address: '전라남도 해남군 옥천면 해남로 521', postalCode: '59027', phone: '061-530-9300' },
    { name: '정읍교도소', address: '전북특별자치도 정읍시 소성면 저동길 45', postalCode: '56163', phone: '063-928-9114' },
    { name: '광주고룡학교(광주소년원)', address: '광주광역시 광산구 임곡로 273-3', postalCode: '62207', phone: '062-958-7900' },
    { name: '송천중고등학교(전주소년원)', address: '전북 전주시 덕진구 과학로 45-25', postalCode: '54816', phone: '063-900-2500' },
  ],
  '경상': [
    { name: '대구교도소', address: '대구광역시 달성군 하빈로 204', postalCode: '42620', phone: '053-430-1600' },
    { name: '부산구치소', address: '부산광역시 사상구 학장로 268 (주례동)', postalCode: '46974', phone: '051-324-5501' },
    { name: '경북북부제1교도소', address: '경상북도 청송군 진보면 양정길 231', postalCode: '37409', phone: '054-874-4500' },
    { name: '부산교도소', address: '부산광역시 강서구 대저중앙로29번길 62 (대저1동)', postalCode: '46700', phone: '051-971-0151' },
    { name: '창원교도소', address: '경상남도 창원시 마산회원구 송평로 39 (회성동)', postalCode: '51304', phone: '055-298-9010' },
    { name: '진주교도소', address: '경상남도 진주시 대곡면 월암로23번길 39', postalCode: '52684', phone: '055-741-2181' },
    { name: '포항교도소', address: '경상북도 포항시 북구 흥해읍 동해대로 1001', postalCode: '37542', phone: '054-262-1100' },
    { name: '대구구치소', address: '대구광역시 수성구 달구벌대로541길 36 (만촌동)', postalCode: '42123', phone: '053-740-5200' },
    { name: '경북직업훈련교도소', address: '경상북도 청송군 진보면 양정길 231', postalCode: '37409', phone: '054-874-4600' },
    { name: '안동교도소', address: '경상북도 안동시 풍산읍 경서로 4380-23', postalCode: '36621', phone: '054-858-7191' },
    { name: '경북북부제2교도소', address: '경상북도 청송군 진보면 양정길 110', postalCode: '37409', phone: '054-872-4700' },
    { name: '김천소년교도소', address: '경상북도 김천시 영남대로 1968 (지좌동)', postalCode: '36590', phone: '054-436-2191' },
    { name: '경북북부제3교도소', address: '경상북도 청송군 진보면 양정길 231', postalCode: '37409', phone: '054-872-9511' },
    { name: '울산구치소', address: '울산광역시 울주군 청량면 청량천변로 103-9', postalCode: '44974', phone: '052-228-9700' },
    { name: '경주교도소', address: '경상북도 경주시 내남면 포석로 550', postalCode: '38153', phone: '054-740-3100' },
    { name: '통영구치소', address: '경상남도 통영시 용남면 용남해안로 277', postalCode: '53043', phone: '055-649-8911' },
    { name: '밀양구치소', address: '경남 밀양시 부북면 춘화로 124', postalCode: '50445', phone: '055-350-7700' },
    { name: '상주교도소', address: '경북 상주시 사벌면 목가2길 130', postalCode: '37190', phone: '054-531-4100' },
    { name: '거창구치소', address: '경상남도 거창군 거창읍 거열산성로 73', postalCode: '50132', phone: '055-940-4700' },
    { name: '부산오륜학교(부산소년원)', address: '부산광역시 금정구 오륜대로 126번길 62', postalCode: '46255', phone: '051-519-7700' },
    { name: '읍내중고등학교(대구소년원)', address: '대구광역시 북구 칠곡중앙대로 99길 12', postalCode: '41442', phone: '053-260-7200' },
  ],
  '제주': [
    { name: '제주교도소', address: '제주특별자치도 제주시 정실동길 51 (오라이동)', postalCode: '63166', phone: '064-741-2800' },
    { name: '제주한길학교(제주소년원)', address: '제주특별자치도 제주시 애월읍 장소로 515', postalCode: '63037', phone: '064-797-9100' },
  ],
};

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
      className={`w-full flex items-center py-3 px-4 rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-orange-50 text-orange-600 border border-orange-200'
          : isComplete
            ? 'bg-gray-50 text-gray-700 border border-gray-100 hover:bg-gray-100'
            : 'bg-white text-gray-400 cursor-not-allowed border border-transparent'
      }`}
      onClick={onClick}
      disabled={!isActive && !isComplete}
    >
      <div className={`w-7 h-7 rounded-full mr-3 flex items-center justify-center text-sm font-bold ${
        isComplete
          ? 'bg-orange-500 text-white'
          : isActive
            ? 'bg-orange-500 text-white'
            : 'bg-gray-200 text-gray-500'
      }`}>
        {isComplete ? <Check className="w-4 h-4" /> : step}
      </div>
      <span className="font-bold mr-2 truncate flex-1 text-left">{title}</span>
      {isComplete && summary && (
        <span className="text-xs text-gray-500 truncate mr-4 max-w-[150px]">{summary}</span>
      )}
      {(isActive || isComplete) && (
        <motion.div animate={{ rotate: isActive ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      )}
    </button>
  );
}

// ===== 메인 컴포넌트 =====
export function AddRecipientModal({ open, onOpenChange, onSuccess }: AddRecipientModalProps) {
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
  const [birthDate, setBirthDate] = useState(''); // 생년월일 (YYYY-MM-DD)
  const [prisonerNumber, setPrisonerNumber] = useState('');
  const [militaryAffiliation, setMilitaryAffiliation] = useState('');
  const [militaryId, setMilitaryId] = useState('');
  const [relation, setRelation] = useState('');
  const [customRelation, setCustomRelation] = useState('');
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [autoCreateFolder, setAutoCreateFolder] = useState(true);
  const [needsAddressSearch, setNeedsAddressSearch] = useState(false);

  const { createFamilyMember, isCreating } = useFamilyMembers();
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

  const handleStepClick = (step: number) => {
    if (completedSteps[step] || step === currentStep) {
      setCurrentStep(step);
    }
  };

  const completeStep = (step: number) => {
    setCompletedSteps((prev) => ({ ...prev, [step]: true }));
    setCurrentStep(step + 1);
  };

  const getRecipientInfoStep = () => {
    if (isGeneral) return 3; // 시설유형 → 주소검색 → 받는분정보
    if (isMilitary && needsAddressSearch) return 5; // 시설유형 → 시설선택 → 주소검색 → 받는분정보
    if (isMilitary) return 4; // 시설유형 → 시설선택 → 받는분정보
    return 4; // 시설유형 → 지역 → 시설 → 받는분정보
  };

  const getMilitaryInfoStep = () => {
    if (isMilitary && needsAddressSearch) return 6; // 받는분정보 다음
    return 5; // 받는분정보 다음
  };

  const getFinalStep = () => {
    if (isGeneral) return 4; // 시설유형 → 주소검색 → 받는분정보 → 관계
    if (isMilitary && needsAddressSearch) return 7; // 시설유형 → 시설 → 주소 → 받는분정보 → 군부대정보 → 관계
    if (isMilitary) return 6; // 시설유형 → 시설 → 받는분정보 → 군부대정보 → 관계
    return 5; // 시설유형 → 지역 → 시설 → 받는분정보 → 관계
  };

  const isFormComplete = completedSteps[getFinalStep()];

  const handleSubmit = async () => {
    if (!name.trim() || !relation) return;

    // 기타 선택 시 customRelation 확인
    if (relation === '기타' && !customRelation.trim()) return;

    // 교정시설: 수용자 번호 필수
    if (!isGeneral && !isMilitary && !prisonerNumber.trim()) return;

    // 군부대/훈련소: 훈련번호/군번 필수
    if (isMilitary && !militaryId.trim()) return;

    const colorClass = colorOptions.find(c => c.id === selectedColor);

    // 시설명과 주소 구성
    let finalFacilityName = '';
    let finalFacilityAddress = '';
    let finalPostalCode = '';
    let finalDetailedAddress = '';

    if (isGeneral || (isMilitary && needsAddressSearch)) {
      // 일반 주소 또는 기타 부대 (주소검색)
      finalFacilityName = address;
      finalFacilityAddress = address;
      finalPostalCode = postalCode;
      finalDetailedAddress = detailedAddress;
    } else if (facilityInfo) {
      // 시설 리스트에서 선택한 경우
      finalFacilityName = facilityInfo.name;
      finalFacilityAddress = `${facilityInfo.address} (우편번호: ${facilityInfo.postalCode})`;
      finalPostalCode = facilityInfo.postalCode;
    } else {
      finalFacilityName = facility;
    }

    const memberName = name.trim();
    const newMember = await createFamilyMember({
      name: name.trim(),
      birthDate: birthDate || undefined,
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
    });

    // Reset & Close
    resetForm();
    onOpenChange(false);

    // 추가된 멤버의 ID 전달
    if (newMember?.id) {
      onSuccess?.(newMember.id);
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
    setBirthDate('');
    setPrisonerNumber('');
    setMilitaryAffiliation('');
    setMilitaryId('');
    setRelation('');
    setCustomRelation('');
    setSelectedColor('yellow');
    setIsPostcodeOpen(false);
    setNeedsAddressSearch(false);
  };

  // 모달이 닫힐 때 폼 리셋
  const handleOpenChange = (open: boolean) => {
    if (!open && !isCreating) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">받는 사람 추가</h2>
        </div>

        <div className="space-y-3">
          {/* Step 1: 시설 유형 선택 */}
          <SectionHeader
            step={1}
            title="시설 유형 선택"
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
                <div className="bg-gray-50 p-4 rounded-2xl flex flex-wrap gap-2 mb-4">
                  {facilityTypes.map((type) => (
                    <button
                      key={type.id}
                      className={`flex items-center py-3 px-4 rounded-xl transition-all ${
                        facilityType === type.label
                          ? 'bg-white shadow-md border-2 border-orange-200'
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                      onClick={() => setFacilityType(type.label)}
                    >
                      <span className="text-xl mr-2">{type.icon}</span>
                      <span className={`font-bold text-sm ${facilityType === type.label ? 'text-orange-600' : 'text-gray-600'}`}>
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
                    <div className="mb-4">
                      <p className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        지역 선택
                      </p>
                      {/* 시설 검색 */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="시설명 또는 지역으로 검색"
                          value={facilitySearchQuery}
                          onChange={(e) => setFacilitySearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
                        />
                      </div>
                      {facilitySearchQuery.trim() ? (
                        /* 검색 결과 */
                        <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-1">
                          {facilitySearchResults.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">검색 결과가 없습니다</p>
                          ) : (
                            facilitySearchResults.map((fac) => (
                              <button
                                key={fac.name}
                                className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${
                                  facility === fac.name
                                    ? 'bg-orange-50 border-orange-500'
                                    : 'border-gray-200 hover:border-orange-300'
                                }`}
                                onClick={() => {
                                  setRegion(fac.region);
                                  setFacility(fac.name);
                                  setFacilityInfo(fac);
                                  setNeedsAddressSearch(false);
                                  setFacilitySearchQuery('');
                                  completeStep(2);
                                  completeStep(3);
                                }}
                              >
                                <p className={`text-sm font-medium ${facility === fac.name ? 'text-orange-700' : 'text-gray-700'}`}>{fac.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{fac.region} · {fac.address}</p>
                              </button>
                            ))
                          )}
                        </div>
                      ) : (
                        /* 지역 버튼 그리드 */
                        <div className="grid grid-cols-3 gap-2">
                          {availableRegions.map((reg) => (
                            <button
                              key={reg}
                              className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
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
                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <p className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-orange-500" />
                        {isMilitary ? '군부대/훈련소 선택' : '시설 선택'}
                      </p>
                      <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-2">
                        {isMilitary ? (
                          // 군부대/훈련소 리스트
                          militaryFacilities.map((fac) => (
                            <button
                              key={fac.name}
                              className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${
                                facility === fac.name
                                  ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                                  : 'bg-white border-gray-200 hover:border-orange-300'
                              }`}
                              onClick={() => {
                                setFacility(fac.name);
                                // "기타 부대" 선택 시 주소검색 필요 플래그 설정
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
                              <div className="font-medium text-sm mb-1">{fac.name}</div>
                              {fac.address !== '주소검색으로 입력' && (
                                <>
                                  <div className={`text-xs ${facility === fac.name ? 'text-orange-100' : 'text-gray-500'}`}>
                                    {fac.address}
                                  </div>
                                  <div className={`text-xs mt-1 ${facility === fac.name ? 'text-orange-100' : 'text-gray-400'}`}>
                                    📞 {fac.phone} {fac.postalCode && `| 📮 ${fac.postalCode}`}
                                  </div>
                                </>
                              )}
                              {fac.address === '주소검색으로 입력' && (
                                <div className={`text-xs ${facility === fac.name ? 'text-orange-100' : 'text-gray-500'}`}>
                                  리스트에 없는 부대는 주소검색으로 입력할 수 있어요
                                </div>
                              )}
                            </button>
                          ))
                        ) : (
                          // 교도소/구치소/소년원 리스트
                          getFilteredFacilities(region).length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                              해당 지역에 {facilityType} 시설이 없습니다.
                            </div>
                          ) : (
                            getFilteredFacilities(region).map((fac) => (
                              <button
                                key={fac.name}
                                className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${
                                  facility === fac.name
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                                    : 'bg-white border-gray-200 hover:border-orange-300'
                                }`}
                                onClick={() => {
                                  setFacility(fac.name);
                                  setFacilityInfo(fac);
                                  completeStep(3);
                                }}
                              >
                                <div className="font-medium text-sm mb-1">{fac.name}</div>
                                <div className={`text-xs ${facility === fac.name ? 'text-orange-100' : 'text-gray-500'}`}>
                                  {fac.address}
                                </div>
                                <div className={`text-xs mt-1 ${facility === fac.name ? 'text-orange-100' : 'text-gray-400'}`}>
                                  📞 {fac.phone} | 📮 {fac.postalCode}
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
                    <div className="space-y-3 mb-4 p-1">
                      {/* 우편번호 검색 */}
                      {!isPostcodeOpen && (
                        <>
                          <div className="flex gap-2">
                            <Input
                              placeholder="우편번호"
                              value={postalCode}
                              readOnly
                              className="h-11 text-base flex-1"
                            />
                            <Button
                              onClick={() => setIsPostcodeOpen(true)}
                              variant="outline"
                              className="h-11 px-4"
                            >
                              <Search className="w-4 h-4 mr-1" />
                              주소검색
                            </Button>
                          </div>
                          {address && (
                            <>
                              <Input
                                placeholder="도로명 주소"
                                value={address}
                                readOnly
                                className="h-11 text-base bg-gray-50"
                              />
                              <Input
                                placeholder="상세주소 (동/호수 등)"
                                value={detailedAddress}
                                onChange={(e) => setDetailedAddress(e.target.value)}
                                className="h-11 text-base"
                              />
                            </>
                          )}
                        </>
                      )}

                      {/* 주소 검색 */}
                      {isPostcodeOpen && (
                        <AddressSearch
                          onSelect={handleAddressSelect}
                          onClose={() => setIsPostcodeOpen(false)}
                        />
                      )}

                      {/* 다음 버튼 */}
                      {!isPostcodeOpen && address && (
                        <Button
                          onClick={() => completeStep(4)}
                          className="w-full"
                        >
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
                    <div className="space-y-3 mb-4 p-1">
                      {/* 우편번호 검색 */}
                      {!isPostcodeOpen && (
                        <>
                          <div className="flex gap-2">
                            <Input
                              placeholder="우편번호"
                              value={postalCode}
                              readOnly
                              className="h-11 text-base flex-1"
                            />
                            <Button
                              onClick={() => setIsPostcodeOpen(true)}
                              variant="outline"
                              className="h-11 px-4"
                            >
                              <Search className="w-4 h-4 mr-1" />
                              주소검색
                            </Button>
                          </div>
                          {address && (
                            <>
                              <Input
                                placeholder="도로명 주소"
                                value={address}
                                readOnly
                                className="h-11 text-base bg-gray-50"
                              />
                              <Input
                                placeholder="상세주소 (동/호수 등)"
                                value={detailedAddress}
                                onChange={(e) => setDetailedAddress(e.target.value)}
                                className="h-11 text-base"
                              />
                            </>
                          )}
                        </>
                      )}

                      {/* 주소 검색 */}
                      {isPostcodeOpen && (
                        <AddressSearch
                          onSelect={handleAddressSelect}
                          onClose={() => setIsPostcodeOpen(false)}
                        />
                      )}

                      {/* 다음 버튼 */}
                      {!isPostcodeOpen && address && (
                        <Button
                          onClick={() => completeStep(2)}
                          className="w-full"
                        >
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
                summary={name ? `${name}` : ''}
              />
              <AnimatePresence>
                {currentStep === getRecipientInfoStep() && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 mb-4 p-1">
                      {/* 선택한 시설 정보 표시 */}
                      {facilityInfo && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
                          <div className="font-medium text-blue-900 mb-1">📍 {facilityInfo.name}</div>
                          <div className="text-blue-700 text-xs">{facilityInfo.address}</div>
                          <div className="text-blue-600 text-xs mt-1">
                            📞 {facilityInfo.phone} | 📮 {facilityInfo.postalCode}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-orange-500" />
                        </div>
                        <Input
                          placeholder="받는 분 성함"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="flex-1 h-11 text-base"
                        />
                      </div>
                      {/* 생년월일 입력 */}
                      <div className="space-y-1.5">
                        <label className="text-sm text-gray-600">
                          생년월일 (선택사항)
                        </label>
                        <Input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          placeholder="YYYY-MM-DD"
                          className="h-11 text-base"
                        />
                        <p className="text-xs text-gray-500">
                          타임캡슐 기능을 위해 생년월일을 입력하면 더 정확하게 매칭됩니다
                        </p>
                      </div>

                      {/* 교정시설만 수용자 번호 표시 (필수) */}
                      {!isGeneral && !isMilitary && (
                        <div className="space-y-1.5">
                          <label className="text-sm text-gray-600 flex items-center gap-1">
                            수용자 번호 <span className="text-red-500">*</span>
                          </label>
                          <Input
                            placeholder="수용자 번호 (예: 2024-12345)"
                            value={prisonerNumber}
                            onChange={(e) => setPrisonerNumber(e.target.value)}
                            className="h-11 text-base"
                          />
                          <p className="text-xs text-gray-500">
                            정확한 배송을 위해 수용자 번호는 필수입니다
                          </p>
                        </div>
                      )}
                      <Button
                        onClick={() => completeStep(getRecipientInfoStep())}
                        disabled={!name || (!isGeneral && !isMilitary && !prisonerNumber.trim())}
                        className="w-full h-11"
                      >
                        다음
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* 군부대 정보 (군부대만) */}
          {isMilitary && completedSteps[getRecipientInfoStep()] && (
            <>
              <SectionHeader
                step={getMilitaryInfoStep()}
                title="군부대 정보"
                isActive={currentStep === getMilitaryInfoStep()}
                isComplete={!!completedSteps[getMilitaryInfoStep()]}
                onClick={() => handleStepClick(getMilitaryInfoStep())}
                summary={militaryAffiliation}
              />
              <AnimatePresence>
                {currentStep === getMilitaryInfoStep() && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-green-50 rounded-2xl border border-green-100 p-4 mb-4">
                      <div className="space-y-3 p-1">
                        <div className="space-y-1.5">
                          <label className="text-sm text-gray-600">
                            소속/군종
                          </label>
                          <Input
                            placeholder="예: 1중대 2소대"
                            value={militaryAffiliation}
                            onChange={(e) => setMilitaryAffiliation(e.target.value)}
                            className="h-11 text-base"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm text-gray-600 flex items-center gap-1">
                            훈련번호/군번 <span className="text-red-500">*</span>
                          </label>
                          <Input
                            placeholder="예: 23-12345678"
                            value={militaryId}
                            onChange={(e) => setMilitaryId(e.target.value)}
                            className="h-11 text-base"
                          />
                          <p className="text-xs text-gray-500">
                            정확한 배송을 위해 훈련번호 또는 군번은 필수입니다
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => completeStep(getMilitaryInfoStep())}
                        disabled={!militaryId.trim()}
                        className="w-full mt-4 h-11 bg-green-600 hover:bg-green-700"
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
            (isMilitary && completedSteps[getMilitaryInfoStep()]) ||
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
                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <div className="flex items-center mb-3">
                        <Users className="w-4 h-4 text-orange-500 mr-2" />
                        <h3 className="font-bold text-sm text-gray-700">받는분과의 관계</h3>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">나에게 받는분은 어떤 사이인가요?</p>
                      <div className="flex flex-wrap gap-2">
                        {relations.map((rel) => (
                          <button
                            key={rel}
                            className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                              relation === rel
                                ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                            }`}
                            onClick={() => {
                              setRelation(rel);
                              // 아코디언을 열어둔 채로 단계만 완료로 표시
                              if (rel !== '기타') {
                                setCompletedSteps((prev) => ({ ...prev, [getFinalStep()]: true }));
                              }
                            }}
                          >
                            {rel}
                          </button>
                        ))}
                      </div>

                      {/* 기타 관계 직접 입력 */}
                      {relation === '기타' && (
                        <div className="mt-4 p-1">
                          <Input
                            placeholder="관계를 입력해주세요 (예: 삼촌, 이모, 사촌 등)"
                            value={customRelation}
                            onChange={(e) => setCustomRelation(e.target.value)}
                            className="h-11 text-base"
                            autoFocus
                          />
                        </div>
                      )}

                      {/* 색상 선택 */}
                      {relation && (relation !== '기타' || customRelation.trim()) && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">색상 선택:</span>
                            <span className="text-xs text-gray-400">색상을 선택하면 자동으로 등록돼요</span>
                          </div>
                          <div className="flex gap-3 p-1">
                            {colorOptions.map((color) => (
                              <button
                                key={color.id}
                                type="button"
                                onClick={async () => {
                                  setSelectedColor(color.id);
                                  // 색상 선택 후 0.3초 뒤 자동 저장 및 닫기
                                  setTimeout(async () => {
                                    await handleSubmit();
                                  }, 300);
                                }}
                                className={cn(
                                  "w-8 h-8 rounded-full transition-all flex-shrink-0",
                                  color.bg,
                                  selectedColor === color.id
                                    ? `ring-2 ring-offset-1 ${color.border} scale-105`
                                    : "hover:scale-105"
                                )}
                              />
                            ))}
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

        {/* 로딩 표시 */}
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center justify-center gap-2 py-4 text-orange-600"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">받는 사람 추가 중...</span>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
