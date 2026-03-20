import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api/fetch';
import { readSSEStream, isSSEResponse } from '@/lib/ai/stream-reader';
import type { Editor } from '@tiptap/react';
import type { Page } from '../types';
import { splitTextIntoPages, textToHtml } from '../utils';
import { setRefineHighlight } from '../extensions/RefineHighlightExtension';

/** 줄바꿈 정규화 (section, expand task용) */
function normalizeLineBreaks(text: string): string {
  return text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
}

interface UseLetterAIOptions {
  editor: Editor | null;
  pages: Page[];
  currentPage: number;
  totalLines: number;
  recipientName?: string;
  recipientRelation?: string;
  recipientFacility?: string;
  recipientAddress?: string;
  recipientPrisonerNumber?: string;
  recipientContext?: string;
  recipientId?: string;
  letterHistory?: Array<{ date: string; direction: 'sent' | 'received'; content: string }>;
  saveCurrentPageContent: () => void;
  replaceAllContent: (text: string, opts?: { focusEnd?: boolean }) => void;
  savedIntroText?: string;
  /** 인라인 다듬기 완료 후 호출 (마무리 탭 자동 전환용) */
  onRefineComplete?: () => void;
}

export function useLetterAI({
  editor,
  pages,
  currentPage,
  totalLines,
  recipientName,
  recipientRelation,
  recipientFacility,
  recipientAddress,
  recipientPrisonerNumber,
  recipientContext,
  recipientId,
  letterHistory,
  saveCurrentPageContent,
  replaceAllContent,
  savedIntroText = '',
  onRefineComplete,
}: UseLetterAIOptions) {
  // 이어쓰기 상태
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [continuePosition, setContinuePosition] = useState({ top: 200, left: 100 });
  const [isContinuing, setIsContinuing] = useState(false);
  const [showContinueSuggestion, setShowContinueSuggestion] = useState(false);
  const [continueSuggestionText, setContinueSuggestionText] = useState('');
  const continueTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 다듬기 상태
  const [showRefineButton, setShowRefineButton] = useState(false);
  const [refinePosition, setRefinePosition] = useState({ top: 200, left: 100 });
  const [selectedText, setSelectedText] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showRefineSuggestion, setShowRefineSuggestion] = useState(false);
  const [refinedText, setRefinedText] = useState('');

  // 생성 중 상태
  const [isGeneratingStart, setIsGeneratingStart] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState('');

  // 되돌리기
  const [canUndo, setCanUndo] = useState(false);
  const previousPagesRef = useRef<Page[] | null>(null);

  // 인라인 다듬기 버튼 상태
  const [showInlineRefineButton, setShowInlineRefineButton] = useState(false);
  const [showToneRefineSheet, setShowToneRefineSheet] = useState(false);
  const [isInlineRefining, setIsInlineRefining] = useState(false);
  // 이미 다듬어진 본문 추적 (중복 다듬기 방지)
  const [savedRefinedBody, setSavedRefinedBody] = useState('');
  // 단락 구분(두 칸 띄우기) 감지용
  const prevTextRef = useRef('');
  const onRefineCompleteRef = useRef(onRefineComplete);
  onRefineCompleteRef.current = onRefineComplete;

  // 온보딩/초안 상태
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [showDraftPreview, setShowDraftPreview] = useState(false);
  const [draftText, setDraftText] = useState('');

  // 이전 페이지 내용
  const getPreviousPagesContent = useCallback(() => {
    if (currentPage === 0) return '';
    return pages
      .slice(0, currentPage)
      .map((page) => page.content)
      .join('\n');
  }, [currentPage, pages]);

  // 에디터 내용 변화 감지 — 단락 구분(두 칸 띄우기 = \n\n) 시 인라인 다듬기 버튼 표시
  const checkInlineRefineEligibility = useCallback((text: string) => {
    if (!text) {
      setShowInlineRefineButton(false);
      prevTextRef.current = '';
      return;
    }

    const prev = prevTextRef.current;
    prevTextRef.current = text;

    // 대폭 변화(AI 삽입 등) = 길이 차이 > 5 → 무시
    if (Math.abs(text.length - prev.length) > 5) return;

    // 새로운 단락 구분(\n\n)이 생겼는지 확인
    const prevBreaks = (prev.match(/\n\n/g) || []).length;
    const currBreaks = (text.match(/\n\n/g) || []).length;

    if (currBreaks > prevBreaks && text.trim().length >= 10) {
      // 서문이 있으면 본문 부분만 확인 — 서문 직후 첫 단락에서는 버튼 표시 안 함
      if (savedIntroText) {
        const introNormalized = savedIntroText.replace(/\n\n/g, '\n');
        const idx = text.indexOf(introNormalized);
        if (idx !== -1) {
          const bodyContent = text.substring(idx + introNormalized.length).replace(/^\n+/, '');
          const bodyBreaks = (bodyContent.match(/\n\n/g) || []).length;
          if (bodyBreaks < 2) {
            return;
          }
        }
      }
      setShowInlineRefineButton(true);
    } else if (currBreaks < prevBreaks) {
      // 단락 구분이 줄어들면(백스페이스로 합침) 버튼 숨김
      setShowInlineRefineButton(false);
    }
  }, [savedIntroText]);

  // AI 이어쓰기 (스트리밍)
  const handleContinue = useCallback(async () => {
    setShowContinueButton(false);
    setIsContinuing(true);
    setContinueSuggestionText('');
    setShowContinueSuggestion(true);
    if (continueTimerRef.current) clearTimeout(continueTimerRef.current);

    try {
      const currentText = editor?.getText() || '';
      const response = await apiFetch('/api/v1/ai/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentText.slice(-500),
          recipientName,
          recipientRelation,
        }),
      });

      if (!response.ok) throw new Error('AI 이어쓰기 실패');

      const fullText = await readSSEStream(response, (text) => {
        setContinueSuggestionText(text);
      });

      if (!fullText) {
        toast.error('AI 응답이 비어있습니다');
        setShowContinueSuggestion(false);
      }
    } catch (error) {
      console.error('AI 이어쓰기 오류:', error);
      toast.error('AI 이어쓰기에 실패했습니다');
      setShowContinueSuggestion(false);
    } finally {
      setIsContinuing(false);
    }
  }, [editor, recipientName, recipientRelation]);

  // 다르게 (이어쓰기) (스트리밍)
  const handleDifferent = useCallback(async () => {
    setIsContinuing(true);
    setContinueSuggestionText('');
    setShowContinueSuggestion(true);

    try {
      const currentText = editor?.getText() || '';
      const response = await apiFetch('/api/v1/ai/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentText.slice(-500),
          recipientName,
          recipientRelation,
          different: true,
        }),
      });

      if (!response.ok) throw new Error('Failed');

      await readSSEStream(response, (text) => {
        setContinueSuggestionText(text);
      });
    } catch {
      toast.error('다른 제안을 불러오는데 실패했습니다');
    } finally {
      setIsContinuing(false);
    }
  }, [editor, recipientName, recipientRelation]);

  // 넣기 (이어쓰기 확정)
  const handleInsertSuggestion = useCallback(() => {
    if (editor && continueSuggestionText) {
      editor.chain().focus('end').insertContent(' ' + continueSuggestionText).run();
      saveCurrentPageContent();
    }
    setShowContinueSuggestion(false);
    setContinueSuggestionText('');
  }, [editor, continueSuggestionText, saveCurrentPageContent]);

  // AI 다듬기 (스트리밍)
  const handleRefine = useCallback(async () => {
    if (!selectedText) {
      toast.error('다듬을 텍스트를 선택해주세요');
      return;
    }
    setShowRefineButton(false);
    setIsRefining(true);
    setRefinedText('');
    setShowRefineSuggestion(true);

    try {
      const response = await apiFetch('/api/v1/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          context: editor?.getText() || '',
          recipientRelation,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      }

      const fullText = await readSSEStream(response, (text) => {
        setRefinedText(text);
      });

      if (!fullText) {
        setRefinedText(selectedText);
      }
      setIsRefining(false);
    } catch (error) {
      console.error('AI 다듬기 오류:', error);
      toast.error(error instanceof Error ? error.message : 'AI 다듬기에 실패했습니다');
      setIsRefining(false);
      setShowRefineSuggestion(false);
    }
  }, [selectedText, editor, recipientRelation]);

  // 다듬기 적용 (Tiptap selection 기반)
  const handleApplyRefine = useCallback(() => {
    if (!editor || !refinedText) return;
    // Tiptap의 현재 selection이 유지되어 있다면 교체
    const { from, to } = editor.state.selection;
    if (from !== to) {
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, refinedText).run();
    } else {
      // 선택이 없으면 끝에 삽입
      editor.chain().focus('end').insertContent(refinedText).run();
    }
    setShowRefineSuggestion(false);
    setRefinedText('');
    saveCurrentPageContent();
  }, [editor, refinedText, saveCurrentPageContent]);

  // 다듬기 취소
  const handleCancelRefine = useCallback(() => {
    setShowRefineSuggestion(false);
    setRefinedText('');
  }, []);

  // AI 되돌리기
  const handleUndoAI = useCallback(() => {
    if (!previousPagesRef.current) return;
    const prevPages = previousPagesRef.current;
    const allContent = prevPages
      .map((p) => p.content)
      .join('\n');
    replaceAllContent(allContent);
    previousPagesRef.current = null;
    setCanUndo(false);
    setSavedRefinedBody('');
    toast.success('이전 상태로 되돌렸습니다');
  }, [replaceAllContent]);

  // 전체 편지 말투 변환 (스트리밍)
  const handleToneConvert = useCallback(
    async (toneId: string, toneLabel: string, toneDescription: string) => {
      const allContent = pages
        .map((p) => p.content)
        .join('\n');

      if (!allContent.trim()) {
        toast.warning('변환할 내용이 없습니다');
        return;
      }

      previousPagesRef.current = pages.map((p) => ({ ...p }));
      setIsRefining(true);

      try {
        const response = await apiFetch('/api/v1/ai/letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: 'tone',
            toneId,
            toneLabel,
            toneDescription,
            content: allContent,
            recipientName,
            recipientRelation,
            recipientFacility,
            recipientAddress,
            recipientContext,
            recipientId,
            letterHistory,
          }),
        });

        if (!response.ok) throw new Error('AI 요청에 실패했습니다');

        let transformed = '';
        if (isSSEResponse(response)) {
          transformed = await readSSEStream(response, () => {});
        } else {
          const result = await response.json();
          transformed = typeof result.data === 'string' ? result.data : '';
        }
        if (!transformed) throw new Error('AI 응답이 비어있습니다');

        replaceAllContent(transformed);
        setCanUndo(true);
        toast.success(`"${toneLabel}" 스타일로 변환되었습니다`);
      } catch (error) {
        console.error('AI 말투 변환 오류:', error);
        toast.error('말투 변환에 실패했습니다. 다시 시도해주세요.');
        previousPagesRef.current = null;
      } finally {
        setIsRefining(false);
      }
    },
    [pages, recipientName, recipientRelation, recipientFacility, recipientAddress, recipientContext, recipientId, letterHistory, replaceAllContent]
  );

  // 빠른 태그 AI 생성 (스트리밍)
  const handleQuickTag = useCallback(
    async (label: string, section: 'intro' | 'middle' | 'conclusion') => {
      setIsGeneratingStart(true);
      setGeneratingLabel(label);

      const previousContent = getPreviousPagesContent();
      const currentEditorContent = editor?.getText() || '';
      const fullContent = previousContent ? `${previousContent}\n\n${currentEditorContent}`.trim() : currentEditorContent;

      try {
        const response = await apiFetch('/api/v1/ai/letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: 'section',
            section,
            optionLabel: label,
            currentContent: fullContent,
            recipientName,
            recipientRelation,
            recipientFacility,
            recipientAddress,
            recipientPrisonerNumber,
            recipientContext,
            recipientId,
            letterHistory,
          }),
        });

        if (!response.ok) throw new Error('AI 생성 실패');

        let generatedText = '';
        if (isSSEResponse(response)) {
          generatedText = normalizeLineBreaks(
            await readSSEStream(response, () => {})
          );
        } else {
          const result = await response.json();
          generatedText = result.data || '';
        }

        if (generatedText && editor) {
          const currentContent = editor.getText();
          const newContent = currentContent ? `${currentContent}\n\n${generatedText}` : generatedText;
          const html = `<p>${newContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')}</p>`;
          editor.commands.setContent(html);
          saveCurrentPageContent();
          editor.commands.focus('end');
          toast.success(`"${label}" 스타일로 작성되었습니다`);
        }
      } catch (error) {
        console.error('AI 빠른 태그 생성 오류:', error);
        toast.error('AI 생성에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsGeneratingStart(false);
        setGeneratingLabel('');
      }
    },
    [editor, getPreviousPagesContent, recipientName, recipientRelation, recipientFacility, recipientAddress, recipientPrisonerNumber, recipientContext, recipientId, letterHistory, saveCurrentPageContent]
  );

  // 인라인 다듬기 → 톤 선택 시트 열기
  const handleInlineRefine = useCallback(() => {
    setShowToneRefineSheet(true);
  }, []);

  // 톤 다듬기 실행 (말투 선택 후) — 새로 입력한 본문만 다듬기 (이미 다듬어진 부분 보존)
  const handleInlineToneRefine = useCallback(
    async (toneId: string, toneLabel: string, keepMyStyle: boolean) => {
      if (!editor || editor.isDestroyed) return;

      const fullText = editor.getText({ blockSeparator: '\n' });

      // savedIntroText가 있으면 인트로 부분 제거하고 본문만 추출
      let bodyContent = fullText;
      if (savedIntroText) {
        const introNormalized = savedIntroText.replace(/\n\n/g, '\n');
        const idx = fullText.indexOf(introNormalized);
        if (idx !== -1) {
          bodyContent = fullText.substring(idx + introNormalized.length).replace(/^\n+/, '');
        }
      }

      // 이미 다듬어진 부분 제외, 새로 입력한 부분만 추출
      let textToRefine = bodyContent;
      let existingRefinedPrefix = '';
      if (savedRefinedBody) {
        const idx = bodyContent.indexOf(savedRefinedBody);
        if (idx !== -1) {
          existingRefinedPrefix = savedRefinedBody;
          textToRefine = bodyContent.substring(idx + savedRefinedBody.length).replace(/^\n+/, '');
        }
        // indexOf 실패 = 사용자가 이전 다듬기 결과를 수정함 → 전체 본문 다시 다듬기
      }

      if (!textToRefine.trim()) {
        toast.info('새로 입력한 내용이 없습니다');
        return;
      }

      previousPagesRef.current = pages.map((p) => ({ ...p }));
      setShowToneRefineSheet(false);
      setIsInlineRefining(true);
      setRefineHighlight(editor, textToRefine);

      try {
        const response = await apiFetch('/api/v1/ai/letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: 'tone',
            toneId,
            toneLabel,
            keepMyStyle,
            content: textToRefine,
            currentContent: savedIntroText || '',
            recipientName,
            recipientRelation,
            recipientFacility,
            recipientAddress,
            recipientContext,
            recipientId,
            letterHistory,
          }),
        });

        if (!response.ok) throw new Error('AI 요청에 실패했습니다');

        let transformed = '';
        if (isSSEResponse(response)) {
          transformed = await readSSEStream(response, () => {});
        } else {
          const result = await response.json();
          transformed = typeof result.data === 'string' ? result.data : '';
        }
        if (!transformed) throw new Error('AI 응답이 비어있습니다');

        // 단락 정규화: 3줄 이상 연속 줄바꿈을 2줄로 통일
        transformed = transformed.replace(/\n{3,}/g, '\n\n').trim();

        // 기존 다듬어진 부분 + 새로 다듬어진 부분 합치기
        const updatedBody = existingRefinedPrefix
          ? existingRefinedPrefix + '\n\n' + transformed
          : transformed;
        setSavedRefinedBody(updatedBody);

        // 전체 텍스트 재구성: 인트로 + 다듬어진 본문
        if (!editor.isDestroyed) {
          const newFullText = savedIntroText
            ? savedIntroText + '\n\n' + updatedBody
            : updatedBody;
          editor.commands.setContent(textToHtml(newFullText));
          saveCurrentPageContent();
          editor.commands.focus('end');
        }
        setCanUndo(true);
        setShowInlineRefineButton(false);
        toast.success(
          keepMyStyle
            ? '맞춤법과 표현을 다듬었습니다'
            : `"${toneLabel}" 스타일로 변환되었습니다`
        );
        // 다듬기 완료 → 마무리 탭 자동 전환
        onRefineCompleteRef.current?.();
      } catch (error) {
        console.error('AI 톤 다듬기 오류:', error);
        toast.error('다듬기에 실패했습니다. 다시 시도해주세요.');
        previousPagesRef.current = null;
      } finally {
        setIsInlineRefining(false);
        if (editor && !editor.isDestroyed) setRefineHighlight(editor, null);
      }
    },
    [editor, pages, savedIntroText, savedRefinedBody, recipientName, recipientRelation, recipientFacility, recipientAddress, recipientContext, recipientId, letterHistory, saveCurrentPageContent]
  );

  // 초안 확정 → 에디터에 삽입 (끝에 빈 줄 추가 + 커서를 끝으로)
  const handleAcceptDraft = useCallback(() => {
    if (draftText && editor) {
      previousPagesRef.current = [...pages];
      const currentContent = editor.getText();
      const newContent = currentContent.trim() ? currentContent.trim() + '\n\n' + draftText : draftText;
      replaceAllContent(newContent + '\n', { focusEnd: true });
      setCanUndo(true);
    }
    setShowDraftPreview(false);
    setDraftText('');
    toast.success('편지에 적용했어요!');
  }, [draftText, editor, pages, replaceAllContent]);

  return {
    // 이어쓰기
    showContinueButton,
    setShowContinueButton,
    continuePosition,
    setContinuePosition,
    isContinuing,
    showContinueSuggestion,
    continueSuggestionText,
    continueTimerRef,
    handleContinue,
    handleDifferent,
    handleInsertSuggestion,
    // 다듬기
    showRefineButton,
    setShowRefineButton,
    refinePosition,
    setRefinePosition,
    selectedText,
    setSelectedText,
    isRefining,
    showRefineSuggestion,
    refinedText,
    handleRefine,
    handleApplyRefine,
    handleCancelRefine,
    // 생성
    isGeneratingStart,
    generatingLabel,
    setGeneratingLabel,
    handleQuickTag,
    handleToneConvert,
    // 인라인 다듬기
    showInlineRefineButton,
    setShowInlineRefineButton,
    checkInlineRefineEligibility,
    handleInlineRefine,
    isInlineRefining,
    showToneRefineSheet,
    setShowToneRefineSheet,
    handleInlineToneRefine,
    // 되돌리기
    canUndo,
    handleUndoAI,
    previousPagesRef,
    setCanUndo,
    // 온보딩/초안
    showOnboarding,
    setShowOnboarding,
    isGeneratingDraft,
    setIsGeneratingDraft,
    showDraftPreview,
    setShowDraftPreview,
    draftText,
    setDraftText,
    handleAcceptDraft,
    // 유틸
    getPreviousPagesContent,
  };
}
