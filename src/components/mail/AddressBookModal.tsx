import { useState, useEffect } from "react";
import { X, Plus, Pencil, Trash2, Check, User, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFamilyMembers, type FamilyMemberDB } from "@/hooks/useFamilyMembers";
import { useSenderAddresses, type SenderAddress } from "@/hooks/useSenderAddresses";
import { DaumPostcodeButton } from "@/components/common/DaumPostcodeButton";

// 시설 정보 타입
interface FacilityInfo {
  name: string;
  address: string;
  postalCode: string;
  phone: string;
}

// 시설 유형
const facilityTypes = [
  { id: 'prison', label: '교도소' },
  { id: 'detention', label: '구치소' },
  { id: 'juvenile-detention', label: '소년원' },
  { id: 'juvenile-prison', label: '소년교도소' },
  { id: 'military', label: '군부대/훈련소' },
  { id: 'general', label: '일반 주소' },
];

// 지역 목록
const regions = [
  '서울/경기/인천', '강원', '충청', '전라', '경상', '제주'
];

// 관계 유형
const relationTypes = [
  "조부모", "어머니", "아버지", "형제/자매", "자녀", "배우자",
  "연인", "친구", "선배/후배", "지인", "법률대리인"
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

interface AddressBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "recipients" | "senders";
  autoAddNew?: boolean;
}

type TabType = "recipients" | "senders";

const colorOptions = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-red-100 text-red-700",
  "bg-yellow-100 text-yellow-700",
  "bg-indigo-100 text-indigo-700",
];

export function AddressBookModal({
  isOpen,
  onClose,
  initialTab = "recipients",
  autoAddNew = false,
}: AddressBookModalProps) {
  const { rawMembers, updateFamilyMember, deactivateFamilyMember, refetch } = useFamilyMembers();
  const { senderAddresses, createSenderAddress, updateSenderAddress, isCreating } = useSenderAddresses();

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FamilyMemberDB>>({});
  const [senderEditForm, setSenderEditForm] = useState<Partial<SenderAddress>>({});

  // 삭제 확인 모달 상태
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmType, setDeleteConfirmType] = useState<"recipient" | "sender" | null>(null);

  // 받는사람 추가용 상태
  const [selectedFacilityType, setSelectedFacilityType] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  // 모달이 열릴 때 초기화 및 자동 추가 처리
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      // 모달이 열린 직후 자동으로 새 항목 추가 모드로 전환
      if (autoAddNew && initialTab === "senders") {
        const newSender: Partial<SenderAddress> = {
          id: `new-${Date.now()}`,
          name: "",
          phone: "",
          address: "",
          detailedAddress: "",
          postCode: null,
          isDefault: false,
        };
        setEditingId(newSender.id!);
        setSenderEditForm(newSender);
      }
    }
  }, [isOpen, initialTab, autoAddNew]);

  // 시설 유형에 따라 시설 목록 필터링
  const getFilteredFacilities = (region: string, facilityType: string) => {
    // 군부대는 별도 리스트 반환
    if (facilityType === '군부대/훈련소') {
      return militaryFacilities;
    }

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
  const getAvailableRegions = (facilityType: string) => {
    // 군부대와 일반 주소는 지역 선택 불필요
    if (facilityType === '군부대/훈련소' || facilityType === '일반 주소') {
      return [];
    }

    return regions.filter(region => {
      return getFilteredFacilities(region, facilityType).length > 0;
    });
  };

  // 필터된 시설 목록
  const filteredFacilities = selectedFacilityType === '군부대/훈련소'
    ? militaryFacilities
    : getFilteredFacilities(selectedRegion, selectedFacilityType);

  // 받는사람 관련 함수들
  const handleEditMember = (member: FamilyMemberDB) => {
    console.log('🔍 편집 시작 - 기존 멤버 데이터:', member);
    setEditingId(member.id);
    setEditForm(member);

    // DB에서 가져온 facilityType이 있으면 사용
    if (member.facilityType) {
      console.log('✅ facilityType 있음:', member.facilityType, '지역:', member.region);
      setSelectedFacilityType(member.facilityType);
      setSelectedRegion(member.region || '');
      return;
    }

    // facilityType이 없는 경우 (레거시 데이터) 추론
    let foundType = '';
    let foundRegion = '';

    // 먼저 군부대에서 찾기
    const militaryFacility = militaryFacilities.find(f => f.name === member.facilityName);
    if (militaryFacility) {
      setSelectedFacilityType('군부대/훈련소');
      setSelectedRegion('');
      return;
    }

    // 각 지역의 시설에서 찾기
    let facilityFound = false;
    for (const region of regions) {
      const facilities = facilitiesByRegion[region] || [];
      const facility = facilities.find(f => f.name === member.facilityName);

      if (facility) {
        foundRegion = region;
        facilityFound = true;

        // 시설 타입 결정
        if (facility.name.includes('소년교도소')) {
          foundType = '소년교도소';
        } else if (facility.name.includes('소년원') || facility.name.includes('학교')) {
          foundType = '소년원';
        } else if (facility.name.includes('구치소')) {
          foundType = '구치소';
        } else if (facility.name.includes('교도소')) {
          foundType = '교도소';
        }

        break;
      }
    }

    // 시설을 찾지 못한 경우 일반 주소로 간주
    if (!facilityFound) {
      setSelectedFacilityType('일반 주소');
      setSelectedRegion('');
      return;
    }

    setSelectedFacilityType(foundType);
    setSelectedRegion(foundRegion);
  };

  const handleSaveMemberEdit = async () => {
    console.log('💾 저장 시도 - editForm:', editForm);
    console.log('💾 저장 시도 - selectedFacilityType:', selectedFacilityType);
    console.log('💾 저장 시도 - selectedRegion:', selectedRegion);

    if (!editingId || !editForm.name || !editForm.relation || !editForm.facilityName) {
      console.warn('⚠️ 필수 필드 누락');
      return;
    }

    // 시설 유형 결정
    let determinedFacilityType = selectedFacilityType;
    if (!determinedFacilityType) {
      // 기존 멤버에서 시설 유형 추출
      if (militaryFacilities.find(f => f.name === editForm.facilityName)) {
        determinedFacilityType = '군부대/훈련소';
      } else if (!Object.values(facilitiesByRegion).flat().find(f => f.name === editForm.facilityName)) {
        determinedFacilityType = '일반 주소';
      }
    }

    // 기본 업데이트 데이터
    const updateData: any = {
      name: editForm.name,
      birthDate: editForm.birthDate || null,
      relation: editForm.relation,
      facilityName: editForm.facilityName,
      facilityAddress: editForm.facilityAddress,
      facilityType: determinedFacilityType,
      color: editForm.color,
    };

    // 시설 유형에 따라 필드 추가/제외
    if (determinedFacilityType === '군부대/훈련소') {
      // 군부대는 prisonerNumber 제외, militaryInfo 포함
      updateData.militaryInfo = editForm.militaryInfo || null;
      updateData.prisonerNumber = null; // 명시적으로 null 설정
    } else if (determinedFacilityType === '일반 주소') {
      // 일반 주소는 둘 다 제외
      updateData.prisonerNumber = null;
      updateData.militaryInfo = null;
      updateData.postalCode = editForm.postalCode || null;
      updateData.detailedAddress = editForm.detailedAddress || null;
    } else {
      // 교도소/구치소/소년원 등: militaryInfo 제외, prisonerNumber 포함
      updateData.prisonerNumber = editForm.prisonerNumber || null;
      updateData.militaryInfo = null; // 명시적으로 null 설정
      updateData.region = selectedRegion || null;
      updateData.postalCode = editForm.postalCode || null;
    }

    console.log('📤 전송할 데이터:', updateData);

    await updateFamilyMember(editingId, updateData);

    console.log('⏳ 업데이트 완료, 데이터 새로고침 중...');

    // 데이터 리페치하여 UI 즉시 업데이트
    await refetch();

    setEditingId(null);
    setEditForm({});
    setSelectedFacilityType("");
    setSelectedRegion("");

    console.log('✅ 편집 모드 종료');
  };

  const handleDeleteMember = async (id: string) => {
    await deactivateFamilyMember(id);
    setDeleteConfirmId(null);
    setDeleteConfirmType(null);
  };

  const handleDeleteMemberClick = (id: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmType("recipient");
  };

  const formatSenderAddress = (sender: Pick<SenderAddress, "address" | "detailedAddress">) => {
    if (!sender.detailedAddress) {
      return sender.address;
    }

    return `${sender.address} ${sender.detailedAddress}`;
  };

  // 보내는사람 관련 함수들
  const handleEditSender = (sender: SenderAddress) => {
    setEditingId(sender.id);
    setSenderEditForm(sender);
  };

  const handleSaveSenderEdit = async () => {
    if (!senderEditForm.name || !senderEditForm.phone || !senderEditForm.address) {
      return;
    }

    // 새 항목 추가
    if (editingId && editingId.startsWith('new-')) {
      await createSenderAddress({
        name: senderEditForm.name,
        phone: senderEditForm.phone,
        address: senderEditForm.address,
        detailedAddress: senderEditForm.detailedAddress,
        postCode: senderEditForm.postCode,
        isDefault: senderEditForm.isDefault,
      });
    } else if (editingId) {
      await updateSenderAddress(editingId, {
        name: senderEditForm.name,
        phone: senderEditForm.phone,
        address: senderEditForm.address,
        detailedAddress: senderEditForm.detailedAddress ?? null,
        postCode: senderEditForm.postCode ?? null,
        isDefault: senderEditForm.isDefault,
      });
    }

    setEditingId(null);
    setSenderEditForm({});
  };

  const handleDeleteSender = (id: string) => {
    // TODO: 삭제 API 구현 필요
    console.warn('보내는사람 삭제 API는 아직 구현되지 않았습니다:', id);
    setDeleteConfirmId(null);
    setDeleteConfirmType(null);
  };

  const handleDeleteSenderClick = (id: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmType("sender");
  };

  const handleAddNewSender = () => {
    const newSender: Partial<SenderAddress> = {
      id: `new-${Date.now()}`,
      name: "",
      phone: "",
      address: "",
      detailedAddress: "",
      postCode: null,
      isDefault: false,
    };
    setEditingId(newSender.id!);
    setSenderEditForm(newSender);
  };

  const handleSaveAll = () => {
    onClose();
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setSenderEditForm({});
    setSelectedFacilityType("");
    setSelectedRegion("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={handleCancel}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">주소록 관리</h2>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => {
                setActiveTab("recipients");
                setEditingId(null);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === "recipients"
                  ? "text-primary border-primary bg-primary/5"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              <Users className="w-4 h-4" />
              받는사람 ({rawMembers.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("senders");
                setEditingId(null);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === "senders"
                  ? "text-primary border-primary bg-primary/5"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              <User className="w-4 h-4" />
              보내는사람 ({senderAddresses.length})
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[50vh] space-y-3">
            {activeTab === "recipients" ? (
              // 받는사람 목록
              <>
                {rawMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 bg-secondary/50 rounded-xl border border-border/50"
                  >
                    {editingId === member.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0",
                              editForm.color || member.color
                            )}
                          >
                            {editForm.name?.charAt(0) || "?"}
                          </div>
                          <Input
                            value={editForm.name || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            placeholder="수용자 이름"
                            className="flex-1"
                          />
                        </div>

                        {/* 생년월일 입력 */}
                        <div className="space-y-1.5">
                          <label className="text-sm text-gray-600">
                            생년월일 (선택사항)
                          </label>
                          <Input
                            type="date"
                            value={editForm.birthDate || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, birthDate: e.target.value })
                            }
                            placeholder="YYYY-MM-DD"
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500">
                            타임캡슐 기능을 위해 생년월일을 입력하면 더 정확하게 매칭됩니다
                          </p>
                        </div>

                        {/* 관계 선택 */}
                        <p className="text-xs text-muted-foreground mb-1">나에게 받는분은 어떤 사이인가요?</p>
                        <Select
                          value={editForm.relation || undefined}
                          onValueChange={(value) => setEditForm({ ...editForm, relation: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="관계 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {relationTypes.map((relation) => (
                              <SelectItem key={relation} value={relation}>
                                {relation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* 시설 유형 선택 */}
                        <Select
                          value={selectedFacilityType || undefined}
                          onValueChange={(value) => {
                            setSelectedFacilityType(value);
                            setSelectedRegion("");
                            // 시설 유형 변경 시 관련 필드 모두 초기화
                            setEditForm({
                              ...editForm,
                              facilityName: "",
                              facilityAddress: "",
                              postalCode: null,
                              detailedAddress: null,
                              prisonerNumber: null,
                              militaryInfo: null,
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="시설 유형 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {facilityTypes.map((type) => (
                              <SelectItem key={type.id} value={type.label}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* 지역 선택 (군부대, 일반 주소 제외) */}
                        {selectedFacilityType &&
                         selectedFacilityType !== '군부대/훈련소' &&
                         selectedFacilityType !== '일반 주소' && (
                          <Select
                            value={selectedRegion || undefined}
                            onValueChange={(value) => {
                              setSelectedRegion(value);
                              // 지역 변경 시 시설 정보 초기화
                              setEditForm({
                                ...editForm,
                                facilityName: "",
                                facilityAddress: "",
                                postalCode: null,
                                detailedAddress: null,
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="지역 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableRegions(selectedFacilityType).map((region) => (
                                <SelectItem key={region} value={region}>
                                  {region}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {/* 시설 선택 (일반 주소 제외) */}
                        {((selectedFacilityType === '군부대/훈련소') ||
                          (selectedFacilityType && selectedRegion && selectedFacilityType !== '일반 주소')) && (
                          <Select
                            value={editForm.facilityName || undefined}
                            onValueChange={(value) => {
                              const facility = filteredFacilities.find(f => f.name === value);
                              setEditForm({
                                ...editForm,
                                facilityName: value,
                                facilityAddress: facility ? `${facility.address} (우편번호: ${facility.postalCode})` : "",
                                postalCode: facility?.postalCode || null,
                                detailedAddress: null,
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="시설 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredFacilities.length === 0 ? (
                                <SelectItem value="no-facilities" disabled>
                                  해당 지역에 {selectedFacilityType} 시설이 없습니다
                                </SelectItem>
                              ) : (
                                filteredFacilities.map((facility) => (
                                  <SelectItem key={facility.name} value={facility.name}>
                                    {facility.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}

                        {/* 일반 주소 입력 */}
                        {selectedFacilityType === '일반 주소' && (
                          <>
                            <Input
                              value={editForm.facilityName || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, facilityName: e.target.value })
                              }
                              placeholder="주소 (예: 서울시 강남구 테헤란로 123)"
                            />
                            <Input
                              value={editForm.facilityAddress || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, facilityAddress: e.target.value })
                              }
                              placeholder="상세주소 (예: 101동 1001호)"
                            />
                          </>
                        )}

                        {/* 수용자 번호 (교정시설만) */}
                        {selectedFacilityType &&
                         selectedFacilityType !== '군부대/훈련소' &&
                         selectedFacilityType !== '일반 주소' && (
                          <Input
                            value={editForm.prisonerNumber || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, prisonerNumber: e.target.value })
                            }
                            placeholder="수용자 번호 (예: 2024-12345)"
                          />
                        )}

                        {/* 색상 선택 */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">색상:</span>
                          <div className="flex gap-1 flex-wrap">
                            {colorOptions.map((color) => (
                              <button
                                key={color}
                                onClick={() => setEditForm({ ...editForm, color })}
                                className={cn(
                                  "w-6 h-6 rounded-full transition-all",
                                  color.split(" ")[0],
                                  editForm.color === color
                                    ? "ring-2 ring-primary ring-offset-2"
                                    : "hover:scale-110"
                                )}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingId(null);
                              setEditForm({});
                              setSelectedFacilityType("");
                              setSelectedRegion("");
                            }}
                          >
                            취소
                          </Button>
                          <Button size="sm" onClick={handleSaveMemberEdit}>
                            <Check className="w-4 h-4 mr-1" />
                            확인
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0",
                            member.color
                          )}
                        >
                          {member.avatarUrl || member.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {member.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {member.relation} · {member.facilityName}
                          </p>
                          {member.prisonerNumber && (
                            <p className="text-xs text-muted-foreground/70">
                              수용자번호: {member.prisonerNumber}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditMember(member)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMemberClick(member.id)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              // 보내는사람 목록
              <>
                {/* 편집 중인 새 항목 표시 */}
                {editingId && editingId.startsWith('new-') && (
                  <div className="p-4 bg-secondary/50 rounded-xl border border-border/50">
                    <div className="space-y-3">
                      <Input
                        value={senderEditForm.name || ""}
                        onChange={(e) =>
                          setSenderEditForm({ ...senderEditForm, name: e.target.value })
                        }
                        placeholder="이름"
                      />
                      <Input
                        value={senderEditForm.phone || ""}
                        onChange={(e) =>
                          setSenderEditForm({ ...senderEditForm, phone: e.target.value })
                        }
                        placeholder="전화번호 (예: 010-1234-5678)"
                      />

                      {/* 주소 검색 버튼 */}
                      <div className="space-y-2">
                        <DaumPostcodeButton
                          onComplete={(data) => {
                            setSenderEditForm({
                              ...senderEditForm,
                              address: data.address,
                              postCode: data.zonecode,
                            });
                          }}
                          buttonText="우편번호 찾기"
                          variant="outline"
                          size="sm"
                          className="w-full"
                        />
                        <Input
                          value={senderEditForm.address || ""}
                          onChange={(e) =>
                            setSenderEditForm({ ...senderEditForm, address: e.target.value })
                          }
                          placeholder="주소 (우편번호 찾기 버튼을 눌러주세요)"
                          disabled
                        />
                        <Input
                          value={senderEditForm.detailedAddress || ""}
                          onChange={(e) =>
                            setSenderEditForm({ ...senderEditForm, detailedAddress: e.target.value })
                          }
                          placeholder="상세주소 (동/호수 등)"
                        />
                        {senderEditForm.postCode && (
                          <p className="text-xs text-muted-foreground">
                            우편번호: {senderEditForm.postCode}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(null);
                            setSenderEditForm({});
                          }}
                        >
                          취소
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveSenderEdit}
                          disabled={!senderEditForm.name || !senderEditForm.phone || !senderEditForm.address}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          확인
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 기존 보내는사람 목록 */}
                {senderAddresses.map((sender) => (
                  <div
                    key={sender.id}
                    className="p-4 bg-secondary/50 rounded-xl border border-border/50"
                  >
                    {editingId === sender.id ? (
                      <div className="space-y-3">
                        <Input
                          value={senderEditForm.name || ""}
                          onChange={(e) =>
                            setSenderEditForm({ ...senderEditForm, name: e.target.value })
                          }
                          placeholder="이름"
                        />
                        <Input
                          value={senderEditForm.phone || ""}
                          onChange={(e) =>
                            setSenderEditForm({ ...senderEditForm, phone: e.target.value })
                          }
                          placeholder="전화번호 (예: 010-1234-5678)"
                        />

                        {/* 주소 검색 버튼 */}
                        <div className="space-y-2">
                          <DaumPostcodeButton
                            onComplete={(data) => {
                              setSenderEditForm({
                                ...senderEditForm,
                                address: data.address,
                                postCode: data.zonecode,
                              });
                            }}
                            buttonText="우편번호 찾기"
                            variant="outline"
                            size="sm"
                            className="w-full"
                          />
                          <Input
                            value={senderEditForm.address || ""}
                            onChange={(e) =>
                              setSenderEditForm({ ...senderEditForm, address: e.target.value })
                            }
                            placeholder="주소"
                          />
                          <Input
                            value={senderEditForm.detailedAddress || ""}
                            onChange={(e) =>
                              setSenderEditForm({ ...senderEditForm, detailedAddress: e.target.value })
                            }
                            placeholder="상세주소 (동/호수 등)"
                          />
                          {senderEditForm.postCode && (
                            <p className="text-xs text-muted-foreground">
                              우편번호: {senderEditForm.postCode}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingId(null);
                              setSenderEditForm({});
                            }}
                          >
                            취소
                          </Button>
                          <Button size="sm" onClick={handleSaveSenderEdit}>
                            <Check className="w-4 h-4 mr-1" />
                            확인
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                          {sender.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {sender.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {sender.phone}
                          </p>
                          <p className="text-xs text-muted-foreground/70 truncate">
                            {formatSenderAddress(sender)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditSender(sender)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSenderClick(sender.id)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            {activeTab === "senders" && (
              <Button
                variant="outline"
                onClick={handleAddNewSender}
              >
                <Plus className="w-4 h-4 mr-2" />
                보내는사람 추가
              </Button>
            )}
            {activeTab === "recipients" && <div />}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleCancel}>
                취소
              </Button>
              <Button onClick={handleSaveAll}>저장</Button>
            </div>
          </div>
        </motion.div>

        {/* 삭제 확인 모달 */}
        <AnimatePresence>
          {deleteConfirmId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10"
              onClick={() => {
                setDeleteConfirmId(null);
                setDeleteConfirmType(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card rounded-xl shadow-xl p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {deleteConfirmType === "recipient" ? "받는사람 삭제" : "보내는사람 삭제"}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setDeleteConfirmId(null);
                      setDeleteConfirmType(null);
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (deleteConfirmType === "recipient") {
                        handleDeleteMember(deleteConfirmId);
                      } else {
                        handleDeleteSender(deleteConfirmId);
                      }
                    }}
                  >
                    삭제
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
