export const LETTER_PAGE_CHAR_LIMIT = 500;
export const LETTER_PAGE_FREE_COUNT = 3;
export const LETTER_EXTRA_PAGE_PRICE = 300;

export function getPrintableLetterContent(content: string) {
  return content.replace(/<[^>]*>/g, '').replace(/\r\n/g, '\n').trim();
}

export function calculateLetterPagePricing(content: string) {
  const printableContent = getPrintableLetterContent(content);
  const charCount = printableContent.length;
  const pageCount = Math.max(1, Math.ceil(charCount / LETTER_PAGE_CHAR_LIMIT));
  const extraPages = Math.max(pageCount - LETTER_PAGE_FREE_COUNT, 0);
  const pagePrice = extraPages * LETTER_EXTRA_PAGE_PRICE;

  return {
    charCount,
    pageCount,
    extraPages,
    pagePrice,
  };
}
