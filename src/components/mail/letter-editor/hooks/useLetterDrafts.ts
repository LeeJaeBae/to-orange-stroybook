import { useEffect, useCallback } from 'react';
import type { Page } from '../types';

interface UseLetterDraftsOptions {
  pages: Page[];
  onSaveDraft?: () => void;
}

export function useLetterDrafts({ pages, onSaveDraft }: UseLetterDraftsOptions) {
  // 페이지 이탈 시 자동 임시저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      const hasContent = pages.some((page) => page.content.trim().length > 0);
      if (hasContent && onSaveDraft) {
        onSaveDraft();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleBeforeUnload();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pages, onSaveDraft]);

  // 전체 페이지 내용 복사
  const copyAllPages = useCallback(async () => {
    const { toast } = await import('sonner');
    const allText = pages
      .map((p) => p.content)
      .join('\n');
    try {
      await navigator.clipboard.writeText(allText);
      toast.success('전체 내용이 복사되었습니다', { duration: 2000 });
    } catch {
      const ta = document.createElement('textarea');
      ta.value = allText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success('전체 내용이 복사되었습니다', { duration: 2000 });
    }
  }, [pages]);

  return { copyAllPages };
}
