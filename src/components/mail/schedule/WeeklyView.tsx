'use client';

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type ScheduleEvent, WEEK_DAYS, formatDateStr, isSameDay } from "./schedule-utils";

interface WeeklyViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  isHoliday: (date: Date) => boolean;
  getHolidayName: (date: Date) => string | null;
  onAddClick?: (dateStr: string) => void;
}

export function WeeklyView({ currentDate, events, isHoliday, getHolidayName, onAddClick }: WeeklyViewProps) {
  const router = useRouter();
  const today = new Date();

  // 현재 주의 일~토 날짜 계산
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = formatDateStr(date);
      const dayEvents = events.filter((e) => e.date === dateStr);
      return { date, events: dayEvents };
    });
  }, [currentDate, events]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {weekDays.map((day, index) => {
        const isCurrentDay = isSameDay(day.date, today);
        const hasEvents = day.events.length > 0;
        const dateStr = formatDateStr(day.date);
        const holidayName = getHolidayName(day.date);
        const isSunOrHoliday = day.date.getDay() === 0 || isHoliday(day.date);
        const isSaturday = day.date.getDay() === 6 && !isHoliday(day.date);

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className={cn(
              "bg-white rounded-xl p-4 transition-all",
              isCurrentDay && "border-l-[3px] border-l-orange-500",
              !isCurrentDay && "border border-border/40",
              hasEvents ? "shadow-sm" : "opacity-80",
            )}
          >
            {/* 날짜 헤더 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-bold",
                  isSunOrHoliday && "text-red-500",
                  isSaturday && "text-blue-500",
                )}>
                  {WEEK_DAYS[day.date.getDay()]}
                </span>
                <span className={cn(
                  "text-lg font-bold",
                  isCurrentDay && "text-orange-500",
                )}>
                  {day.date.getDate()}일
                </span>
                {holidayName && (
                  <span className="text-xs text-red-400">{holidayName}</span>
                )}
                {isCurrentDay && (
                  <span className="text-size-10 font-medium text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">오늘</span>
                )}
              </div>
              <button
                onClick={() => onAddClick ? onAddClick(dateStr) : router.push(`/letter/schedule/new?date=${dateStr}`)}
                className="text-xs text-muted-foreground hover:text-orange-500 transition-colors"
              >
                + 추가
              </button>
            </div>

            {/* 일정 리스트 */}
            {hasEvents ? (
              <div className="space-y-1.5">
                {day.events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => router.push(`/letter/schedule/${event.id}`)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                  >
                    <div
                      className={cn("w-[3px] h-4 rounded-full flex-shrink-0", !event.tagHexColor && event.tagColor)}
                      style={event.tagHexColor ? { backgroundColor: event.tagHexColor } : undefined}
                    />
                    <span className="text-sm text-foreground truncate flex-1">{event.title}</span>
                    {event.time && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">{event.time}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/60 pl-1">일정 없음</p>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
