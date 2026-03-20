'use client';

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ScheduleViewType } from "./schedule-utils";

interface ScheduleHeaderProps {
  currentDate: Date;
  viewType: ScheduleViewType;
  onViewChange: (view: ScheduleViewType) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const VIEW_OPTIONS: { value: ScheduleViewType; label: string; mobileOnly?: boolean }[] = [
  { value: 'yearly', label: '연간', mobileOnly: false },
  { value: 'monthly', label: '월간' },
  { value: 'weekly', label: '주간' },
  { value: 'agenda', label: '일정' },
];

export function ScheduleHeader({
  currentDate,
  viewType,
  onViewChange,
  onPrevMonth,
  onNextMonth,
  onToday,
}: ScheduleHeaderProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  return (
    <div className="space-y-3">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between">
        <button onClick={onPrevMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-foreground">
            {viewType === 'yearly' ? `${year}년` : `${year}년 ${month + 1}월`}
          </h2>
          <button
            onClick={onToday}
            className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
          >
            오늘
          </button>
        </div>
        <button onClick={onNextMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 세그먼트 컨트롤 (pill) */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        {VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onViewChange(option.value)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              // 모바일에서 연간 숨김
              option.value === 'yearly' && "hidden md:block",
              viewType === option.value
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
