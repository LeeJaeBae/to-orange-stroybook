import { DOCUMENT_PRINT_MODES, type DocumentPrintMode } from '@to-orange/api-contracts';

export type { DocumentPrintMode };

export interface UserDocument {
  id: string;
  url: string;
  path: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  pageCount: number;
  printMode: DocumentPrintMode;
  isPageCountEstimated: boolean;
}

export interface LetterDocumentPayload {
  url: string;
  path: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  pageCount: number;
  printMode: DocumentPrintMode;
  isPageCountEstimated: boolean;
}

export const MAX_DOCUMENT_COUNT = 5;
export const MAX_DOCUMENT_FILE_SIZE = 30 * 1024 * 1024;
export const DOCUMENT_BLACK_WHITE_PRICE = 200;
export const DOCUMENT_COLOR_PRICE = 300;
export const DOCUMENT_PRINT_MODE_LABELS: Record<DocumentPrintMode, string> = {
  BLACK_WHITE: '흑백',
  COLOR: '컬러',
};

export const SUPPORTED_DOCUMENT_EXTENSIONS = [
  'pdf',
  'hwp',
  'hwpx',
  'doc',
  'docx',
  'jpg',
  'jpeg',
  'png',
] as const;

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);
const WORD_EXTENSIONS = new Set(['doc', 'docx']);
const HANGUL_EXTENSIONS = new Set(['hwp', 'hwpx']);

export function getDocumentExtension(fileName: string) {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() ?? '' : '';
}

export function isSupportedDocumentExtension(extension: string) {
  return SUPPORTED_DOCUMENT_EXTENSIONS.includes(extension as (typeof SUPPORTED_DOCUMENT_EXTENSIONS)[number]);
}

export function isSupportedDocumentFile(fileName: string) {
  return isSupportedDocumentExtension(getDocumentExtension(fileName));
}

export function getDocumentTypeLabel(fileName: string, fileType: string) {
  const extension = getDocumentExtension(fileName);

  if (extension === 'pdf' || fileType === 'application/pdf') return 'PDF';
  if (HANGUL_EXTENSIONS.has(extension)) return '한글 문서';
  if (WORD_EXTENSIONS.has(extension)) return 'Word 문서';
  if (IMAGE_EXTENSIONS.has(extension) || fileType.startsWith('image/')) return '이미지';
  return '문서';
}

export function isImageDocument(fileName: string, fileType: string) {
  const extension = getDocumentExtension(fileName);
  return IMAGE_EXTENSIONS.has(extension) || fileType.startsWith('image/');
}

export function getDocumentUnitPrice(printMode: DocumentPrintMode) {
  return printMode === 'COLOR' ? DOCUMENT_COLOR_PRICE : DOCUMENT_BLACK_WHITE_PRICE;
}

export function calculateDocumentPrice(pageCount: number, printMode: DocumentPrintMode) {
  const normalizedPageCount = Math.max(1, Math.floor(Number.isFinite(pageCount) ? pageCount : 1));
  return normalizedPageCount * getDocumentUnitPrice(printMode);
}

export function calculateDocumentsPrice(documents: Array<Pick<LetterDocumentPayload, 'pageCount' | 'printMode'>>) {
  return documents.reduce((sum, document) => sum + calculateDocumentPrice(document.pageCount, document.printMode), 0);
}

export function toLetterDocumentPayload(document: UserDocument): LetterDocumentPayload {
  return {
    url: document.url,
    path: document.path,
    fileName: document.fileName,
    fileType: document.fileType,
    fileSize: document.fileSize,
    pageCount: document.pageCount,
    printMode: document.printMode,
    isPageCountEstimated: document.isPageCountEstimated,
  };
}

export function createUserDocument(input: LetterDocumentPayload): UserDocument {
  return {
    id: crypto.randomUUID(),
    url: input.url,
    path: input.path,
    fileName: input.fileName,
    fileType: input.fileType,
    fileSize: input.fileSize,
    pageCount: Math.max(1, input.pageCount),
    printMode: DOCUMENT_PRINT_MODES.includes(input.printMode) ? input.printMode : 'BLACK_WHITE',
    isPageCountEstimated: Boolean(input.isPageCountEstimated),
  };
}
