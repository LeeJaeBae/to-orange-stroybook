// 캔버스 상수 (A5 용지 기준: 148x210mm, 에디터 영역 650x784)
export const CANVAS_WIDTH = 772;
export const CANVAS_HEIGHT = 1096; // 헤더(168) + 에디터(784) + 푸터(144)
export const PADDING_X = 61; // (772 - 650) / 2
export const PADDING_TOP = 168; // 헤더 공간
export const PADDING_BOTTOM = 144; // 푸터 공간
export const EDITOR_HEIGHT = CANVAS_HEIGHT - PADDING_TOP - PADDING_BOTTOM; // 784
export const TOTAL_LINES_PER_PAGE = 18;
export const LINE_OFFSET = 8; // 텍스트-줄 간격 조정

export interface WritingAreaLayout {
  left: number;
  top: number;
  width: number;
  height: number;
  lineCount: number;
  lineOffset: number;
  lineColor?: string;
}

export interface LetterLayoutStyleLike {
  backgroundImage?: string;
  frontImage?: string;
  backImage?: string;
  writingArea?: Partial<WritingAreaLayout> | null;
  backWritingArea?: Partial<WritingAreaLayout> | null;
}

export type LetterPageSide = 'front' | 'back';

export const DEFAULT_WRITING_AREA: WritingAreaLayout = {
  left: PADDING_X,
  top: PADDING_TOP,
  width: CANVAS_WIDTH - PADDING_X * 2,
  height: EDITOR_HEIGHT,
  lineCount: TOTAL_LINES_PER_PAGE,
  lineOffset: LINE_OFFSET,
};

export function getPageSide(pageIndex: number): LetterPageSide {
  return pageIndex % 2 === 1 ? 'back' : 'front';
}

export function shouldRenderWritingLines(side: LetterPageSide = 'front') {
  // 편지 작성/미리보기에서는 앞뒷면 모두 같은 필기 가이드를 보여준다.
  // 기존에는 뒷면(back)에서 밑줄을 끄고 있었는데, n+1 빈 페이지를 포함한
  // 2페이지 이후 렌더링에서 밑줄이 사라지는 문제를 만들었다.
  void side;
  return true;
}

export function resolveWritingArea(
  style?: LetterLayoutStyleLike | null,
  side: LetterPageSide = 'front'
): WritingAreaLayout {
  const source = side === 'back' ? style?.backWritingArea ?? style?.writingArea : style?.writingArea;

  return {
    ...DEFAULT_WRITING_AREA,
    ...(source ?? {}),
    lineOffset: source?.lineOffset ?? DEFAULT_WRITING_AREA.lineOffset,
  };
}

export function getWritingAreaLineHeight(
  style?: LetterLayoutStyleLike | null,
  side: LetterPageSide = 'front'
): number {
  const writingArea = resolveWritingArea(style, side);
  return Math.max(1, Math.floor(writingArea.height / writingArea.lineCount));
}

export function getStationeryBackgroundImage(
  style?: LetterLayoutStyleLike | null,
  side: 'front' | 'back' = 'front'
) {
  if (!style) return undefined;

  if (side === 'back') {
    return style.backImage || style.frontImage || style.backgroundImage;
  }

  return style.frontImage || style.backgroundImage;
}

// 폰트 크기 옵션 (650px 너비 기준)
export const FONT_SIZES: Record<string, { label: string; size: number }> = {
  small: { label: '소', size: 19 },
  medium: { label: '중', size: 21 },
  large: { label: '대', size: 25 },
};

export const DEFAULT_FONT_SIZE_KEY = 'small';
export const DEFAULT_FONT_SIZE = FONT_SIZES[DEFAULT_FONT_SIZE_KEY].size;
export const MOBILE_EDITOR_FONT_SIZE_MULTIPLIER = 1.18;

// 폰트 옵션
export const FONT_FAMILIES: Record<
  string,
  { label: string; style: string; className: string; fontFamily: string }
> = {
  pretendard: {
    label: 'Pretendard',
    style: '기본체',
    className: 'font-pretendard',
    fontFamily: 'Pretendard, sans-serif',
  },
  'nanum-myeongjo': {
    label: '나눔명조',
    style: '명조체',
    className: 'font-nanum-myeongjo',
    fontFamily: '"Nanum Myeongjo", serif',
  },
  'nanum-pen': {
    label: '나눔손글씨',
    style: '손글씨체',
    className: 'font-nanum-pen',
    fontFamily: '"Nanum Pen Script", cursive',
  },
};

// 색상 옵션
export const FONT_COLORS = [
  { id: 'default', value: '#1a1a1a' },
  { id: 'gray', value: '#4a4a4a' },
  { id: 'white', value: '#ffffff' },
  { id: 'blue', value: '#2563eb' },
  { id: 'red', value: '#dc2626' },
  { id: 'green', value: '#16a34a' },
  { id: 'purple', value: '#7c3aed' },
  { id: 'orange', value: '#ea580c' },
  { id: 'brown', value: '#92400e' },
];

// 이모지 목록
export const EMOJIS = [
  '😊', '🥰', '😢', '🙏', '❤️', '💛', '💚', '💙',
  '🌸', '🌷', '☀️', '🌙', '⭐', '✨', '🎁', '💌',
];

// 빠른 태그
export const QUICK_TAGS = {
  start: {
    label: '처음',
    tags: [
      { label: '따뜻한 인사', text: '안녕하세요, 그동안 잘 지내셨나요?' },
      { label: '안부 묻기', text: '오랜만에 편지를 드립니다. 건강하게 지내고 계신가요?' },
      { label: '계절 인사', text: '어느덧 계절이 바뀌었습니다. 따스한 햇살처럼 좋은 일만 가득하시길 바랍니다.' },
      { label: '감사 인사', text: '항상 저를 생각해주시고 응원해주셔서 진심으로 감사드립니다.' },
    ],
  },
  middle: {
    label: '중간',
    tags: [
      { label: '근황 전하기', text: '요즘 저는 잘 지내고 있습니다. ' },
      { label: '추억 이야기', text: '지난번에 함께했던 시간이 떠오릅니다. ' },
      { label: '감사 표현', text: '그동안 해주신 것들에 대해 항상 감사하게 생각하고 있습니다. ' },
      { label: '걱정/응원', text: '많이 힘드시진 않으신지 걱정이 됩니다. 늘 응원하고 있습니다. ' },
    ],
  },
  end: {
    label: '마무리',
    tags: [
      { label: '건강 바람', text: '항상 건강하시고, 좋은 일만 가득하시길 바랍니다.' },
      { label: '재회 약속', text: '다음에 꼭 찾아뵙겠습니다. 그날을 기다리며.' },
      { label: '사랑 표현', text: '멀리서나마 늘 생각하고 있습니다. 사랑합니다.' },
      { label: '짧은 마무리', text: '그럼 안녕히 계세요.' },
    ],
  },
};

// 밑줄 색상 선택 옵션
export const LINE_COLORS = [
  { id: 'light-gray', label: '연한 회색', value: '#e0e0e0' },
  { id: 'gray', label: '회색', value: '#b0b0b0' },
  { id: 'warm-beige', label: '베이지', value: '#bda888' },
  { id: 'sky-blue', label: '하늘색', value: '#6daad0' },
  { id: 'pink', label: '분홍', value: '#d4809a' },
  { id: 'mint', label: '민트', value: '#6daa90' },
  { id: 'purple', label: '보라', value: '#9878bd' },
  { id: 'sunset', label: '노을', value: '#bd8068' },
  { id: 'none', label: '없음', value: 'transparent' },
];

// 편지지 밑줄 색상 매핑
export const STATIONERY_LINE_COLORS: Record<string, string> = {
  white: '#b0b0b0',
  cream: '#bda888',
  sky: '#6daad0',
  pink: '#d4809a',
  mint: '#6daa90',
  'formal-white': '#a0aabb',
  'formal-cream': '#bd9a70',
  business: '#9aa0a8',
  elegant: '#bd88b0',
  sunset: '#bd8068',
  ocean: '#6888bd',
  forest: '#68b088',
  blossom: '#bd8088',
  'ai-dream': '#9878bd',
  'ai-aurora': '#68a890',
  'ai-cosmic': '#8878bd',
};
