import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api/fetch';
import { readSSEStream, readSSEStreamAsOptions, isSSEResponse } from '@/lib/ai/stream-reader';
import { getLetterGreeting } from '@/lib/ai/prompts/common';
import type { Editor } from '@tiptap/react';
import type { Page } from '../types';

/** 줄바꿈 정규화 (expand task용) */
function normalizeLineBreaks(text: string): string {
  return text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** HTML → 일반 텍스트 변환 (AI에 보낼 때 HTML 태그 제거) */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

interface UseLetterAIMenuOptions {
  editor: Editor | null;
  recipientName?: string;
  recipientRelation?: string;
  recipientFacility?: string;
  recipientAddress?: string;
  recipientPrisonerNumber?: string;
  recipientContext?: string;
  recipientId?: string;
  letterHistory?: Array<{ date: string; direction: 'sent' | 'received'; content: string }>;
  senderName?: string;
  saveCurrentPageContent: () => void;
  pages?: Page[];
}

export function useLetterAIMenu({
  editor,
  recipientName,
  recipientRelation,
  recipientFacility,
  recipientAddress,
  recipientPrisonerNumber,
  recipientContext,
  recipientId,
  letterHistory,
  senderName,
  saveCurrentPageContent,
  pages,
}: UseLetterAIMenuOptions) {
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [showAITooltip, setShowAITooltip] = useState(true);
  const [selectedSection, setSelectedSection] = useState<'start' | 'middle' | 'end'>('start');

  // 처음 탭
  const [introOptions, setIntroOptions] = useState<Array<{ label: string; text: string }>>([]);
  const [isLoadingIntroOptions, setIsLoadingIntroOptions] = useState(false);
  const [savedIntroText, setSavedIntroText] = useState('');

  // 중간 탭
  const [middleChatInput, setMiddleChatInput] = useState('');
  const [middleChatHistory, setMiddleChatHistory] = useState<Array<{ input: string; expanded: string }>>([]);
  const [isExpandingMiddle, setIsExpandingMiddle] = useState(false);
  const [middleExpandedPreview, setMiddleExpandedPreview] = useState<{ input: string; expanded: string } | null>(null);

  // 마무리 탭
  const [conclusionOptions, setConclusionOptions] = useState<Array<{ label: string; text: string }>>([]);
  const [isLoadingConclusionOptions, setIsLoadingConclusionOptions] = useState(false);
  const [showConclusionCustomInput, setShowConclusionCustomInput] = useState(false);
  const [conclusionCustomInput, setConclusionCustomInput] = useState('');
  const [isExpandingConclusion, setIsExpandingConclusion] = useState(false);

  // 툴팁 자동 숨김
  useEffect(() => {
    const timer = setTimeout(() => setShowAITooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // AI 메뉴 열릴 때 탭 옵션 자동 로드
  useEffect(() => {
    if (showAIMenu) {
      if (selectedSection === 'start') {
        // 이미 서문이 삽입된 상태면 중간 탭으로 전환
        const hasContent = editor?.getText().trim();
        if (savedIntroText || hasContent) {
          setSelectedSection('middle');
          return;
        }
        loadIntroOptions();
      } else if (selectedSection === 'end') {
        loadConclusionOptions();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAIMenu]);

  const loadIntroOptions = useCallback(async () => {
    setIsLoadingIntroOptions(true);
    setIntroOptions([]);
    try {
      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'intro-options',
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
      if (!response.ok) throw new Error('옵션 로드 실패');

      if (isSSEResponse(response)) {
        const options = await readSSEStreamAsOptions(response, (partialOptions) => {
          setIntroOptions(partialOptions);
        });
        setIntroOptions(options);
      } else {
        const result = await response.json();
        setIntroOptions(result.data || []);
      }
    } catch (error) {
      console.error('처음 옵션 로드 실패:', error);
    } finally {
      setIsLoadingIntroOptions(false);
    }
  }, [recipientName, recipientRelation, recipientFacility, recipientAddress, recipientPrisonerNumber, recipientContext, recipientId, letterHistory]);

  const handleIntroOptionSelect = useCallback(
    (text: string) => {
      if (!editor) return;
      // 호칭을 코드에서 결정적으로 삽입
      const greeting = recipientName && recipientRelation
        ? getLetterGreeting(recipientName, recipientRelation)
        : '';
      const introWithGreeting = greeting ? `${greeting}\n\n\n\n${text}` : text;
      const currentContent = editor.getText();
      const newContent = currentContent.trim() ? `${introWithGreeting}\n\n${currentContent}` : introWithGreeting;
      const html = `<p>${newContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')}</p><p></p><p></p>`;
      editor.commands.setContent(html);
      saveCurrentPageContent();
      editor.commands.focus('end');
      setSavedIntroText(introWithGreeting);
      // 처음 선택 후 → 중간 탭으로 자동 전환
      setSelectedSection('middle');
    },
    [editor, saveCurrentPageContent, recipientName, recipientRelation]
  );

  const handleMiddleExpand = useCallback(async () => {
    if (!middleChatInput.trim()) return;
    setIsExpandingMiddle(true);
    // 미리보기를 바로 보여주고 스트리밍 텍스트를 점진적으로 표시
    setMiddleExpandedPreview({ input: middleChatInput, expanded: '' });
    try {
      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'expand',
          userInput: middleChatInput,
          currentContent: editor?.getText() || '',
          recipientName,
          recipientRelation,
        }),
      });
      if (!response.ok) throw new Error('확장 실패');

      if (isSSEResponse(response)) {
        const fullText = await readSSEStream(response, (text) => {
          setMiddleExpandedPreview(prev => prev ? { ...prev, expanded: normalizeLineBreaks(text) } : null);
        });
        setMiddleExpandedPreview(prev => prev ? { ...prev, expanded: normalizeLineBreaks(fullText) } : null);
      } else {
        const result = await response.json();
        setMiddleExpandedPreview(prev => prev ? { ...prev, expanded: result.data || '' } : null);
      }
    } catch (error) {
      console.error('중간 확장 실패:', error);
      setMiddleExpandedPreview(null);
    } finally {
      setIsExpandingMiddle(false);
    }
  }, [middleChatInput, editor, recipientName, recipientRelation]);

  const handleMiddleInsert = useCallback(() => {
    if (!middleExpandedPreview || !editor) return;
    const currentContent = editor.getText();
    const isFirstInsert = middleChatHistory.length === 0 && currentContent.trim();
    const separator = isFirstInsert ? '\n\n' : ' ';
    const newContent = currentContent + separator + middleExpandedPreview.expanded;
    const html = `<p>${newContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')}</p>`;
    editor.commands.setContent(html);
    setMiddleChatHistory((prev) => [...prev, middleExpandedPreview]);
    setMiddleExpandedPreview(null);
    setMiddleChatInput('');
    saveCurrentPageContent();
    editor.commands.focus('end');
  }, [middleExpandedPreview, editor, middleChatHistory.length, saveCurrentPageContent]);

  const handleMiddleRetry = useCallback(() => {
    handleMiddleExpand();
  }, [handleMiddleExpand]);

  const loadConclusionOptions = useCallback(async () => {
    setIsLoadingConclusionOptions(true);
    setConclusionOptions([]);
    try {
      // 전체 페이지 내용을 합쳐서 전달 (HTML → 일반 텍스트 변환)
      const allPagesContent = pages
        ? pages.map((p) => htmlToPlainText(p.content)).filter(Boolean).join('\n')
        : '';
      const currentContent = allPagesContent || editor?.getText() || '';

      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'conclusion-options',
          currentContent,
          recipientName,
          recipientRelation,
          recipientFacility,
          recipientAddress,
          recipientPrisonerNumber,
          recipientContext,
          recipientId,
          letterHistory,
          senderName,
        }),
      });
      if (!response.ok) throw new Error('옵션 로드 실패');

      if (isSSEResponse(response)) {
        const options = await readSSEStreamAsOptions(response, (partialOptions) => {
          setConclusionOptions(partialOptions);
        });
        setConclusionOptions(options);
      } else {
        const result = await response.json();
        setConclusionOptions(result.data || []);
      }
    } catch (error) {
      console.error('마무리 옵션 로드 실패:', error);
    } finally {
      setIsLoadingConclusionOptions(false);
    }
  }, [pages, editor, recipientName, recipientRelation, recipientFacility, recipientAddress, recipientPrisonerNumber, recipientContext, recipientId, letterHistory, senderName]);

  const handleConclusionOptionSelect = useCallback(
    (text: string) => {
      if (!editor) return;
      const currentContent = editor.getText();
      const newContent = currentContent.trim() ? `${currentContent}\n\n${text}` : text;
      const html = `<p>${newContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')}</p>`;
      editor.commands.setContent(html);
      saveCurrentPageContent();
      editor.commands.focus('end');
      setShowAIMenu(false);
    },
    [editor, saveCurrentPageContent]
  );

  const handleConclusionCustomExpand = useCallback(async () => {
    if (!conclusionCustomInput.trim()) return;
    setIsExpandingConclusion(true);
    try {
      const response = await apiFetch('/api/v1/ai/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'expand',
          userInput: conclusionCustomInput,
          currentContent: editor?.getText() || '',
          recipientName,
          recipientRelation,
        }),
      });
      if (!response.ok) throw new Error('확장 실패');

      let expandedText = '';
      if (isSSEResponse(response)) {
        expandedText = normalizeLineBreaks(
          await readSSEStream(response, () => {})
        );
      } else {
        const result = await response.json();
        expandedText = result.data || '';
      }

      if (expandedText) {
        handleConclusionOptionSelect(expandedText);
        setConclusionCustomInput('');
        setShowConclusionCustomInput(false);
      }
    } catch (error) {
      console.error('마무리 확장 실패:', error);
    } finally {
      setIsExpandingConclusion(false);
    }
  }, [conclusionCustomInput, editor, recipientName, recipientRelation, handleConclusionOptionSelect]);

  return {
    showAIMenu,
    setShowAIMenu,
    showAITooltip,
    setShowAITooltip,
    selectedSection,
    setSelectedSection,
    // 처음 탭
    introOptions,
    isLoadingIntroOptions,
    loadIntroOptions,
    handleIntroOptionSelect,
    savedIntroText,
    setSavedIntroText,
    // 중간 탭
    middleChatInput,
    setMiddleChatInput,
    middleExpandedPreview,
    isExpandingMiddle,
    handleMiddleExpand,
    handleMiddleInsert,
    handleMiddleRetry,
    // 마무리 탭
    conclusionOptions,
    isLoadingConclusionOptions,
    loadConclusionOptions,
    handleConclusionOptionSelect,
    showConclusionCustomInput,
    setShowConclusionCustomInput,
    conclusionCustomInput,
    setConclusionCustomInput,
    isExpandingConclusion,
    handleConclusionCustomExpand,
  };
}
