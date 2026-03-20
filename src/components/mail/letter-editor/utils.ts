import type { Editor } from '@tiptap/react';
import type { Node as ProsemirrorNode } from '@tiptap/pm/model';
import {
  EDITOR_HEIGHT,
  TOTAL_LINES_PER_PAGE,
  STATIONERY_LINE_COLORS,
  getWritingAreaLineHeight,
  resolveWritingArea,
  type LetterLayoutStyleLike,
} from './constants';

type StationeryLineStyleLike = LetterLayoutStyleLike & {
  id?: string;
  patternColor?: string;
  border?: {
    color?: string;
  };
};

// 폰트 크기에 비례한 동적 줄 높이 (현재는 고정)
export function getLineHeight(
  _fontSize: number,
  stationeryStyle?: LetterLayoutStyleLike | null,
  side: 'front' | 'back' = 'front'
): number {
  if (stationeryStyle) {
    return getWritingAreaLineHeight(stationeryStyle, side);
  }

  return Math.floor(EDITOR_HEIGHT / TOTAL_LINES_PER_PAGE); // 784 / 18 = 43px 고정
}

// 줄 높이에 따른 총 줄 수 (현재는 고정 18줄)
export function getTotalLines(
  _lineHeight: number,
  stationeryStyle?: LetterLayoutStyleLike | null,
  side: 'front' | 'back' = 'front'
): number {
  if (stationeryStyle) {
    return resolveWritingArea(stationeryStyle, side).lineCount;
  }

  return TOTAL_LINES_PER_PAGE;
}

// 줄 수 기반 페이지 분할 (18줄 단위) — 빈 줄도 줄 수에 포함
export function splitTextIntoPages(content: string, totalLines: number): string[] {
  if (!content.trim()) return [''];

  const lines = content.split('\n');
  const pages: string[] = [];

  for (let i = 0; i < lines.length; i += totalLines) {
    const pageLines = lines.slice(i, i + totalLines);
    const pageContent = pageLines.join('\n');
    pages.push(pageContent);
  }

  return pages.length > 0 ? pages : [''];
}

// 편지지 밑줄 색상
export function getStationeryLineColor(
  stationeryStyle: StationeryLineStyleLike | null | undefined,
  side: 'front' | 'back' = 'front'
): string {
  if (!stationeryStyle) return '#f0f0f0';
  const writingArea = resolveWritingArea(stationeryStyle, side);
  if (writingArea.lineColor) return writingArea.lineColor;
  if (stationeryStyle.id && STATIONERY_LINE_COLORS[stationeryStyle.id]) return STATIONERY_LINE_COLORS[stationeryStyle.id];
  if (stationeryStyle.patternColor) return stationeryStyle.patternColor;
  if (stationeryStyle.border?.color) return stationeryStyle.border.color;
  return '#bdbdbd';
}

/**
 * plain text → Tiptap HTML 변환
 * 각 \n을 새 paragraph(<p>)로 변환합니다.
 * getEditorText() 포맷과 호환됩니다.
 */
function escapeHtmlPreservingSpaces(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // HTML 파싱 시 줄 시작/끝 공백과 연속 공백이 접히지 않도록 보존한다.
  return escaped
    .replace(/ {2,}/g, (spaces) => {
      const pairs = Math.floor(spaces.length / 2);
      const remainder = spaces.length % 2;
      return '&nbsp; '.repeat(pairs) + (remainder ? '&nbsp;' : '');
    })
    .replace(/^ /, '&nbsp;')
    .replace(/ $/, '&nbsp;');
}

export function textToHtml(text: string): string {
  if (!text) return '';
  return text
    .split('\n')
    .map((line) => {
      // 빈줄: <p></p>로 변환 — ProseMirror가 자체 trailing <br>을 추가함
      // <p><br></p>로 하면 hardBreak + trailing <br> = 이중 높이 버그 발생
      if (!line) return '<p></p>';
      return `<p>${escapeHtmlPreservingSpaces(line)}</p>`;
    })
    .join('');
}

function getPmNodeText(node: ProsemirrorNode): string {
  let text = '';

  node.forEach((child) => {
    if (child.isText) {
      text += (child.text || '').replace(/\u00A0/g, ' ');
      return;
    }

    if (child.type.name === 'hardBreak') {
      text += '\n';
    }
  });

  return text;
}

function normalizePmText(text: string): string {
  return text.replace(/\u00A0/g, ' ');
}

export function getDocText(doc: ProsemirrorNode): string {
  const parts: string[] = [];

  doc.forEach((child) => {
    parts.push(getPmNodeText(child));
  });

  return parts.join('\n');
}

export function getDocTextOffsetAtPos(doc: ProsemirrorNode, pos: number): number {
  if (pos <= 0) return 0;

  let textLen = 0;
  let posBeforeChild = 0;

  for (let i = 0; i < doc.childCount; i++) {
    const child = doc.child(i);
    const childStart = posBeforeChild + 1;
    const childEnd = posBeforeChild + child.nodeSize;

    if (i > 0) {
      textLen += 1;
      if (pos <= childStart) {
        return textLen;
      }
    } else if (pos <= childStart) {
      return 0;
    }

    if (pos <= childEnd) {
      const relativePos = Math.min(Math.max(pos - childStart, 0), child.content.size);
      const partialText = normalizePmText(child.textBetween(0, relativePos, '\n'));
      return textLen + partialText.length;
    }

    textLen += getPmNodeText(child).length;
    posBeforeChild += child.nodeSize;
  }

  return textLen;
}

export function getDocTextSlice(doc: ProsemirrorNode, fromPos: number, toPos: number): string {
  const fullText = getDocText(doc);
  const startOffset = getDocTextOffsetAtPos(doc, fromPos);
  const endOffset = getDocTextOffsetAtPos(doc, toPos);
  return fullText.slice(startOffset, endOffset);
}

export function getEditorText(editor: Editor | null | undefined): string {
  if (!editor || editor.isDestroyed) return '';
  return getDocText(editor.state.doc);
}

/**
 * 레거시 페이지 구분자 제거 (빈 줄은 보존)
 * 이전 버전에서 사용하던 "--- 페이지 구분 ---" 마커만 제거합니다.
 * 의도적인 빈 줄(\n\n)은 그대로 유지하여 페이지 수 계산에 반영합니다.
 */
export function cleanLegacySeparators(text: string): string {
  return text.replace(/\n\n--- 페이지 구분 ---\n\n/g, '\n');
}

/**
 * @deprecated cleanLegacySeparators를 사용하세요.
 * 기존 호환용 — AI 생성 텍스트에서 3개 이상 연속 개행만 축소합니다.
 * 의도적 빈 줄(단일 \n\n)은 보존합니다.
 */
export function normalizeLineBreaks(text: string): string {
  // 3개 이상 연속 개행 → 2개로 축소 (빈 줄 1개 유지)
  return text.replace(/\n{3,}/g, '\n\n');
}

/**
 * 페이지 내용 배열을 단일 문자열로 합침 (빈 페이지 보존)
 * 끝에 붙은 빈 페이지만 제거합니다.
 */
export function joinPageContents(pageContents: string[]): string {
  // 끝에서부터 빈 페이지 제거 (최소 1개는 유지)
  let lastNonEmpty = pageContents.length - 1;
  while (lastNonEmpty > 0 && !pageContents[lastNonEmpty].trim()) {
    lastNonEmpty--;
  }
  return pageContents.slice(0, lastNonEmpty + 1).join('\n');
}

// Tiptap HTML → plain text (간단 폴백)
export function htmlToText(html: string): string {
  if (!html) return '';
  return html
    .replace(/&nbsp;/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '');
}
