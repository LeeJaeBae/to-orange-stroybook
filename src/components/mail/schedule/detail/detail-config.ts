export interface DetailCategoryConfig {
  showDirections?: boolean;
  showNearbyPlaces?: boolean;
  prepItems?: string[];
  showQuickActions?: boolean;
  showRecipientInfo?: boolean;
  emphasisMemo?: boolean;
}

export const detailConfigs: Record<string, DetailCategoryConfig> = {
  visit: {
    showDirections: true,
    showNearbyPlaces: true,
    prepItems: ['신분증', '접견 신청서', '필기도구', '소지품 보관함 동전'],
    showRecipientInfo: true,
  },
  consultation: {
    showDirections: true,
    showNearbyPlaces: true,
    prepItems: ['관련 서류', '사건번호 메모', '질문 목록', '신분증', '필기도구'],
    showRecipientInfo: true,
    emphasisMemo: true,
  },
  trial: {
    showDirections: true,
    prepItems: ['신분증', '소환장/통지서', '증거자료', '필기도구', '사건번호 메모'],
    showRecipientInfo: true,
  },
  letter: {
    showQuickActions: true,
    showRecipientInfo: true,
  },
  birthday: {
    showQuickActions: true,
    showRecipientInfo: true,
  },
  anniversary: {
    showQuickActions: true,
    showRecipientInfo: true,
  },
  release: {
    showQuickActions: true,
    showRecipientInfo: true,
    prepItems: ['출소 맞이 장소 정하기', '교통편 확인', '출소 후 첫 식사 계획', '필요한 물품 준비 (의류, 생필품)', '주거지 확인'],
  },
  health: {
    showDirections: true,
    emphasisMemo: true,
  },
  program: {
    showDirections: true,
    emphasisMemo: true,
  },
  custom: {},
};
