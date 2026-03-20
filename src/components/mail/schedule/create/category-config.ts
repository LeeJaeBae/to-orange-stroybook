import type { ScheduleType } from "@/hooks/useSchedules";

export interface SubtypeOption {
  value: string;
  label: string;
}

export interface CategoryConfig {
  subtypeLabel?: string;
  subtypes?: SubtypeOption[];
  showFacilityPicker?: boolean;
  showRecipient?: 'required' | 'recommended' | 'optional';
  banner?: string;
  showTrialChecklist?: boolean;
}

export const categoryConfigs: Partial<Record<ScheduleType, CategoryConfig>> = {
  visit: {
    showFacilityPicker: true,
    showRecipient: 'recommended',
    banner: '접견 시간은 보통 오전 9:30~11:30, 오후 13:30~16:00입니다',
  },
  consultation: {
    subtypeLabel: '상담 유형',
    subtypes: [
      { value: '변호인접견', label: '변호인접견' },
      { value: '법률상담', label: '법률상담' },
      { value: '기타 상담', label: '기타 상담' },
    ],
    showFacilityPicker: true,
    showRecipient: 'recommended',
  },
  trial: {
    showTrialChecklist: true,
    showRecipient: 'optional',
  },
  letter: {
    subtypeLabel: '편지 유형',
    subtypes: [
      { value: '일반 편지', label: '일반 편지' },
      { value: '손편지', label: '손편지' },
    ],
    showRecipient: 'required',
  },
  birthday: {
    showRecipient: 'recommended',
    banner: '생일 타임캡슐을 만들어 축하 메시지를 모아보세요!',
  },
  anniversary: {
    subtypeLabel: '기념일 종류',
    subtypes: [
      { value: '결혼기념일', label: '결혼기념일' },
      { value: '만난 날', label: '만난 날' },
      { value: '기타', label: '기타' },
    ],
    showRecipient: 'recommended',
  },
  release: {
    subtypeLabel: '출소 유형',
    subtypes: [
      { value: '만기출소', label: '만기출소' },
      { value: '가석방', label: '가석방' },
      { value: '기타', label: '기타' },
    ],
    showRecipient: 'required',
  },
  health: {
    subtypeLabel: '건강 유형',
    subtypes: [
      { value: '정기검진', label: '정기검진' },
      { value: '병원 진료', label: '병원 진료' },
      { value: '약 복용', label: '약 복용' },
      { value: '기타', label: '기타' },
    ],
  },
  program: {
    subtypeLabel: '교육 유형',
    subtypes: [
      { value: '직업훈련', label: '직업훈련' },
      { value: '학과교육', label: '학과교육' },
      { value: '인성교육', label: '인성교육' },
      { value: '기타', label: '기타' },
    ],
  },
};
