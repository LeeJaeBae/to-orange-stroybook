import { getPageSide, resolveWritingArea, shouldRenderWritingLines, type LetterLayoutStyleLike } from '../constants';
import { getLineHeight, getTotalLines } from '../utils';

interface LetterRuledLinesProps {
  pageIndex: number;
  fontSize: number;
  lineColor: string;
  stationeryStyle?: LetterLayoutStyleLike | null;
}

export function LetterRuledLines({ pageIndex, fontSize, lineColor, stationeryStyle }: LetterRuledLinesProps) {
  const pageSide = getPageSide(pageIndex);
  const writingArea = resolveWritingArea(stationeryStyle, pageSide);
  const lineHeight = getLineHeight(fontSize, stationeryStyle, pageSide);
  const totalLines = getTotalLines(lineHeight, stationeryStyle, pageSide);

  if (!shouldRenderWritingLines(pageSide)) {
    return null;
  }

  return (
    <>
      {Array.from({ length: totalLines }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: writingArea.top + (i + 1) * lineHeight - writingArea.lineOffset,
            left: writingArea.left,
            width: writingArea.width,
            borderBottom: `2px solid ${lineColor}`,
          }}
        />
      ))}
    </>
  );
}
