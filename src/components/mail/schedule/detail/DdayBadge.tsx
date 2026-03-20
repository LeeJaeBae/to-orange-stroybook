'use client';

import { cn } from "@/lib/utils";
import { getDaysRemaining } from "../schedule-utils";

interface DdayBadgeProps {
  date: string;
  type?: string;
  size?: 'sm' | 'lg';
}

export function DdayBadge({ date, type, size = 'sm' }: DdayBadgeProps) {
  const days = getDaysRemaining(date);

  const label = days === 0 ? 'D-DAY' : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
  const isUrgent = days >= 0 && days <= 3;
  const isToday = days === 0;
  const isPast = days < 0;

  return (
    <span className={cn(
      "inline-flex items-center font-bold rounded-full",
      size === 'sm' && "px-2.5 py-0.5 text-xs",
      size === 'lg' && "px-4 py-1.5 text-lg",
      isToday && "bg-orange-500 text-white",
      isUrgent && !isToday && "bg-red-100 text-red-600",
      !isUrgent && !isPast && "bg-orange-100 text-orange-600",
      isPast && "bg-gray-100 text-gray-500",
    )}>
      {label}
    </span>
  );
}
