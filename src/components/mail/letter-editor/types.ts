import type { Stationery } from '../StationerySelector';

export type TextAlign = 'left' | 'center' | 'right';

export type FontKey = 'pretendard' | 'nanum-myeongjo' | 'nanum-pen';
export type FontSizeKey = 'small' | 'medium' | 'large';

export interface Draft {
  id: string;
  title: string;
  date: string;
  preview: string;
}

export interface Page {
  id: number;
  content: string;
  continuesFromPrevious: boolean;
}

export interface LetterEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  recipientName?: string;
  recipientRelation?: string;
  recipientFacility?: string;
  recipientAddress?: string;
  senderName?: string;
  senderAddress?: string;
  recipientPrisonerNumber?: string;
  recipientContext?: string;
  recipientId?: string;
  letterHistory?: Array<{
    date: string;
    direction: 'sent' | 'received';
    content: string;
  }>;
  recipientGender?: 'male' | 'female' | null;
  recipientBirthDate?: string | null;
  recipientFacilityType?: string;
  recipientRegion?: string | null;
  stationeryStyle?: Stationery | null;
  font?: string;
  onFontChange?: (font: string) => void;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
  isBold?: boolean;
  onBoldChange?: (bold: boolean) => void;
  textAlign?: TextAlign;
  onTextAlignChange?: (align: TextAlign) => void;
  textColor?: string;
  onTextColorChange?: (color: string) => void;
  lineColor?: string | null;
  onLineColorChange?: (color: string | null) => void;
  // 임시저장 관련
  drafts?: Draft[];
  onLoadDraft?: (id: string) => void;
  onDeleteDraft?: (id: string) => void;
  onSaveDraft?: () => void;
  showDraftActions?: boolean;
  headerTitle?: string;
  onResetContent?: () => void;
  // 페이지 상태 (부모에서 관리)
  currentPage?: number;
  onCurrentPageChange?: (page: number) => void;
  // 에디터 페이지 분할 결과를 부모에 전달 (미리보기 동기화용)
  onPagesChange?: (pages: string[]) => void;
  // 스텝 네비게이션
  onStepPrev?: () => void;
  onStepNext?: () => void;
  canStepNext?: boolean;
}

export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  windSpeed: number;
}
