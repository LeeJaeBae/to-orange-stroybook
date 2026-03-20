// Mock @to-orange/api-contracts for Storybook

export const USER_ROLES = ['USER', 'ADMIN'] as const;
export const LETTER_STATUS = ['DRAFT', 'PAID', 'PROCESSING', 'READY_TO_PRINT', 'PRINTED', 'SENT', 'CANCELLED'] as const;
export const ORDER_STATUS = ['PENDING', 'COMPLETED', 'CANCELLED'] as const;
export const RECEIVED_LETTER_TYPE = ['HANDWRITTEN', 'STANDARD'] as const;
export const TRACKING_STATUS = ['PENDING', 'ACCEPTED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'UNKNOWN'] as const;
export const DOCUMENT_PRINT_MODES = ['BLACK_WHITE', 'COLOR'] as const;

export type TRACKING_STATUS = (typeof TRACKING_STATUS)[number];
export type DocumentPrintMode = (typeof DOCUMENT_PRINT_MODES)[number];
export type LetterStatus = (typeof LETTER_STATUS)[number];

export const DEFAULT_STATIONERY_CATEGORY_SETTINGS = [
  { id: 'basic', label: '기본', order: 0, isActive: true },
  { id: 'premium', label: '상용', order: 1, isActive: true },
  { id: 'designer', label: '디자이너', order: 2, isActive: true },
  { id: 'ai', label: 'AI', order: 3, isActive: false },
] as const;

export const AI_STATIONERY_CATEGORY_ID = 'ai' as const;
export const SYSTEM_STATIONERY_CATEGORY_IDS = ['basic', 'premium', 'designer'] as const;
export const STATIONERY_CATEGORY_IDS = ['basic', 'premium', 'designer', 'ai'] as const;

export type StationeryCategoryId = (typeof STATIONERY_CATEGORY_IDS)[number];
export type SystemStationeryCategoryId = (typeof SYSTEM_STATIONERY_CATEGORY_IDS)[number];
export type StationeryCategorySetting = {
  id: StationeryCategoryId;
  label: string;
  order: number;
  isActive: boolean;
};
