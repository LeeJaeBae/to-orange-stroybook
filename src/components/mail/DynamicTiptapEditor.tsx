'use client';

import dynamic from 'next/dynamic';
import { forwardRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { TiptapEditorRef } from './TiptapEditor';

// Tiptap 에디터는 무거우므로 동적 로딩
const TiptapEditorLazy = dynamic(
  () => import('./TiptapEditor').then((mod) => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="relative rounded-xl overflow-hidden border border-black/[0.05] dark:border-white/[0.05] bg-muted/10">
        <div className="min-h-[320px] px-6 py-6 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ),
  }
);

interface TiptapEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  font: string;
  fontSize: number;
  isBold: boolean;
  textAlign: 'left' | 'center' | 'right';
  textColor?: string;
  placeholder?: string;
  className?: string;
  autocompleteEnabled?: boolean;
  recipientName?: string;
  recipientRelation?: string;
  recipientGender?: 'male' | 'female' | null;
  recipientBirthDate?: string | null;
  recipientFacilityType?: string;
  recipientRegion?: string | null;
  fillContainer?: boolean;
}

// forwardRef를 사용하는 동적 컴포넌트는 별도 처리 필요
export const DynamicTiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  (props, ref) => {
    return <TiptapEditorLazy ref={ref} {...props} />;
  }
);

DynamicTiptapEditor.displayName = 'DynamicTiptapEditor';
