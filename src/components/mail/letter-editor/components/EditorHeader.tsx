'use client';

import { FolderOpen, Trash2 } from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';
import type { Draft, WeatherData } from '../types';

interface EditorHeaderProps {
  drafts: Draft[];
  showDraftActions?: boolean;
  showDraftDropdown: boolean;
  onToggleDraftDropdown: () => void;
  onLoadDraft?: (id: string) => void;
  onDeleteDraft?: (id: string) => void;
  recipientWeather: WeatherData | null;
  recipientAddress?: string;
  recipientFacility?: string;
  title?: string;
}

export function EditorHeader({
  drafts,
  showDraftActions = true,
  showDraftDropdown,
  onToggleDraftDropdown,
  onLoadDraft,
  onDeleteDraft,
  recipientWeather,
  recipientAddress,
  recipientFacility,
  title = '편지 작성',
}: EditorHeaderProps) {
  return (
    <header className="border-b border-neutral-100 px-3 py-2 flex items-center shrink-0">
      <div className="flex-1 flex items-center min-w-0">
        <span className="text-sm font-medium text-neutral-800">{title}</span>
      </div>

      {/* 임시저장 드롭다운 */}
      {showDraftActions && (
      <div className="dropdown relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleDraftDropdown();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-all"
        >
          <FolderOpen className="w-4 h-4 text-neutral-500" />
          <span className="text-sm text-neutral-700">임시저장</span>
          {drafts.length > 0 && (
            <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-orange-500 text-white text-xs font-medium rounded-full px-1">
              {drafts.length}
            </span>
          )}
        </button>

        {showDraftDropdown && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden z-50">
            <div className="p-3 border-b border-neutral-100 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-800">임시저장된 편지</span>
              <span className="text-xs text-neutral-400">{drafts.length}개</span>
            </div>
            <div className="max-h-64 overflow-y-auto overflow-x-hidden">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="group flex items-center p-3 hover:bg-neutral-50 transition-all border-b border-neutral-50 last:border-0"
                >
                  <button
                    className="flex-1 min-w-0 text-left"
                    onClick={() => onLoadDraft?.(draft.id)}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-medium text-neutral-800 text-sm truncate">{draft.title}</span>
                      <span className="text-xs text-neutral-400 shrink-0">{draft.date}</span>
                    </div>
                    <p className="text-xs text-neutral-500 truncate">{draft.preview}</p>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDraft?.(draft.id);
                    }}
                    className="ml-2 p-1.5 shrink-0 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 active:text-red-500 active:bg-red-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {drafts.length === 0 && (
              <div className="p-6 text-center text-neutral-400 text-sm">임시저장된 편지가 없습니다</div>
            )}
          </div>
        )}
      </div>
      )}

      <div className="flex-1 flex items-center justify-end min-w-0">
        {recipientWeather && (
          <WeatherWidget
            weather={recipientWeather}
            recipientAddress={recipientAddress}
            recipientFacility={recipientFacility}
          />
        )}
      </div>
    </header>
  );
}
