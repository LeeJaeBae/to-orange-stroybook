import { useState, useCallback } from 'react';
import { DEFAULT_FONT_SIZE, FONT_SIZES } from '../constants';
import type { TextAlign } from '../types';

interface UseLetterFormattingOptions {
  font?: string;
  onFontChange?: (font: string) => void;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
  textAlign?: TextAlign;
  onTextAlignChange?: (align: TextAlign) => void;
  textColor?: string;
  onTextColorChange?: (color: string) => void;
}

export function useLetterFormatting(options: UseLetterFormattingOptions) {
  const [internalFont, setInternalFont] = useState('pretendard');
  const [internalFontSize, setInternalFontSize] = useState(DEFAULT_FONT_SIZE);
  const [internalTextAlign, setInternalTextAlign] = useState<TextAlign>('left');
  const [internalTextColor, setInternalTextColor] = useState('#1a1a1a');

  const font = options.font ?? internalFont;
  const fontSize = options.fontSize ?? internalFontSize;
  const textAlign = options.textAlign ?? internalTextAlign;
  const textColor = options.textColor ?? internalTextColor;

  const fontSizeKey = fontSize <= FONT_SIZES.small.size ? 'small' : fontSize >= FONT_SIZES.large.size ? 'large' : 'medium';

  const setFont = useCallback(
    (value: string) => {
      setInternalFont(value);
      options.onFontChange?.(value);
    },
    [options.onFontChange]
  );

  const setFontSize = useCallback(
    (value: number) => {
      setInternalFontSize(value);
      options.onFontSizeChange?.(value);
    },
    [options.onFontSizeChange]
  );

  const setTextAlign = useCallback(
    (value: TextAlign) => {
      setInternalTextAlign(value);
      options.onTextAlignChange?.(value);
    },
    [options.onTextAlignChange]
  );

  const setTextColor = useCallback(
    (value: string) => {
      setInternalTextColor(value);
      options.onTextColorChange?.(value);
    },
    [options.onTextColorChange]
  );

  return {
    font,
    fontSize,
    fontSizeKey,
    textAlign,
    textColor,
    setFont,
    setFontSize,
    setTextAlign,
    setTextColor,
  };
}
