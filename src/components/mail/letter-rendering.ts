import {
  FONT_FAMILIES,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDING_X,
  PADDING_TOP,
  PADDING_BOTTOM,
  getPageSide,
  resolveWritingArea,
  type LetterLayoutStyleLike,
  type LetterPageSide,
} from './letter-editor/constants';
import { getLineHeight, getTotalLines } from './letter-editor/utils';

const LEGACY_FONT_FAMILIES: Record<string, string> = {
  'nanum-gothic': "'Nanum Gothic', sans-serif",
  'gowun-dodum': "'Gowun Dodum', sans-serif",
};

export {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDING_X,
  PADDING_TOP,
  PADDING_BOTTOM,
} from './letter-editor/constants';

function escapeHtmlPreservingSpaces(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .replace(/ {2,}/g, (spaces) => {
      const pairs = Math.floor(spaces.length / 2);
      const remainder = spaces.length % 2;
      return '&nbsp; '.repeat(pairs) + (remainder ? '&nbsp;' : '');
    })
    .replace(/^ /, '&nbsp;')
    .replace(/ $/, '&nbsp;');
}

export function renderLetterContentHtml(text: string): string {
  if (!text) return '';

  return text
    .split('\n')
    .map((line) => {
      if (!line) return '<p style="margin:0"><br></p>';
      return `<p style="margin:0">${escapeHtmlPreservingSpaces(line)}</p>`;
    })
    .join('');
}

function setMeasureContent(measureDiv: HTMLDivElement, content: string) {
  measureDiv.innerHTML = renderLetterContentHtml(content);
}

export function resolveLetterFontFamily(font?: string | null): string {
  if (font && FONT_FAMILIES[font]) {
    return FONT_FAMILIES[font].fontFamily;
  }

  if (font && LEGACY_FONT_FAMILIES[font]) {
    return LEGACY_FONT_FAMILIES[font];
  }

  return FONT_FAMILIES.pretendard.fontFamily;
}

function splitOverflowingParagraph(
  paragraph: string,
  measureDiv: HTMLDivElement,
  maxHeight: number
): { fits: string; overflow: string } {
  const wordSegments = paragraph.split(/(\s+)/).filter((segment) => segment.length > 0);
  const segments = wordSegments.length > 1 ? wordSegments : Array.from(paragraph);
  let fittingContent = '';

  for (let index = 0; index < segments.length; index += 1) {
    const candidate = fittingContent + segments[index];
    setMeasureContent(measureDiv, candidate);

    if (measureDiv.scrollHeight > maxHeight) {
      return {
        fits: fittingContent,
        overflow: segments.slice(index).join(''),
      };
    }

    fittingContent = candidate;
  }

  return {
    fits: fittingContent,
    overflow: '',
  };
}

export function splitLetterContentIntoPages(
  content: string,
  fontSize: number,
  fontFamily: string,
  stationeryStyle?: LetterLayoutStyleLike | null,
): string[] {
  if (!content.trim()) return [''];
  if (typeof document === 'undefined') return [content];

  const measureDiv = document.createElement('div');
  measureDiv.style.cssText = `
    position: absolute;
    visibility: hidden;
    font-size: ${fontSize}px;
    font-family: ${fontFamily};
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: break-word;
    box-sizing: border-box;
  `;
  document.body.appendChild(measureDiv);

  const pages: string[] = [];
  const paragraphs = content.split('\n');
  let currentPageContent = '';

  try {
    for (let paragraphIndex = 0; paragraphIndex < paragraphs.length; paragraphIndex += 1) {
      const pageIndex = pages.length;
      const pageSide: LetterPageSide = getPageSide(pageIndex);
      const writingArea = resolveWritingArea(stationeryStyle, pageSide);
      const lineHeight = getLineHeight(fontSize, stationeryStyle, pageSide);
      const editorHeight = writingArea.height;
      measureDiv.style.width = `${writingArea.width}px`;
      measureDiv.style.lineHeight = `${lineHeight}px`;

      const paragraph = paragraphs[paragraphIndex];
      const testContent = currentPageContent + (currentPageContent ? '\n' : '') + paragraph;
      setMeasureContent(measureDiv, testContent);

      if (measureDiv.scrollHeight <= editorHeight) {
        currentPageContent = testContent;
        continue;
      }

      if (currentPageContent) {
        pages.push(currentPageContent);
        currentPageContent = '';
        paragraphIndex -= 1;
        continue;
      }

      const { fits, overflow } = splitOverflowingParagraph(paragraph, measureDiv, editorHeight);
      if (fits) {
        pages.push(fits);
      }

      if (!overflow) {
        currentPageContent = '';
        continue;
      }

      paragraphs.splice(paragraphIndex + 1, 0, overflow);
    }

    if (currentPageContent) {
      pages.push(currentPageContent);
    }
  } finally {
    document.body.removeChild(measureDiv);
  }

  return pages.length > 0 ? pages : [''];
}

export function getLetterRenderingMetrics(
  fontSize: number,
  stationeryStyle?: LetterLayoutStyleLike | null,
  side: LetterPageSide = 'front'
) {
  const lineHeight = getLineHeight(fontSize, stationeryStyle, side);
  return {
    lineHeight,
    totalLines: getTotalLines(lineHeight, stationeryStyle, side),
  };
}
