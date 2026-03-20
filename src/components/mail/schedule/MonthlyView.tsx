'use client';

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type ScheduleEvent, WEEK_DAYS, formatDateStr, isSameDay } from "./schedule-utils";

interface MonthlyViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  isHoliday: (date: Date) => boolean;
  getHolidayName: (date: Date) => string | null;
  onEmptyDateClick?: (dateStr: string) => void;
}

export function MonthlyView({ currentDate, events, isHoliday, getHolidayName, onEmptyDateClick }: MonthlyViewProps) {
  const router = useRouter();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: Array<{ date: Date; isCurrentMonth: boolean; events: ScheduleEvent[] }> = [];

    // 이전 달
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false, events: [] });
    }

    // 현재 달
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = formatDateStr(date);
      const dayEvents = events.filter((e) => e.date === dateStr);
      days.push({ date, isCurrentMonth: true, events: dayEvents });
    }

    // 다음 달
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false, events: [] });
    }

    return days;
  }, [year, month, events]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              "py-2 text-center text-sm font-medium",
              index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-muted-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((day, index) => {
          const hasEvents = day.events.length > 0 && day.isCurrentMonth;
          const isCurrentDay = isSameDay(day.date, today);
          const dateStr = formatDateStr(day.date);

          return (
            <div
              key={index}
              onClick={() => {
                if (!day.isCurrentMonth) return;
                if (hasEvents) {
                  router.push(`/letter/schedule/date/${dateStr}`);
                } else if (onEmptyDateClick) {
                  onEmptyDateClick(dateStr);
                } else {
                  router.push(`/letter/schedule/new?date=${dateStr}`);
                }
              }}
              className={cn(
                "relative min-h-[100px] p-2 rounded-xl transition-all",
                !day.isCurrentMonth && "opacity-30",
                day.isCurrentMonth && !hasEvents && "bg-gray-50/80 hover:bg-gray-100/80 cursor-pointer",
                day.isCurrentMonth && hasEvents && "bg-white shadow-sm ring-1 ring-orange-200/60 hover:shadow-md cursor-pointer",
              )}
            >
              {/* 날짜 숫자 */}
              <span
                className={cn(
                  "block text-sm font-medium text-center",
                  !day.isCurrentMonth && "text-muted-foreground",
                  day.isCurrentMonth && (day.date.getDay() === 0 || isHoliday(day.date)) && "text-red-500",
                  day.isCurrentMonth && day.date.getDay() === 6 && !isHoliday(day.date) && "text-blue-500",
                )}
              >
                {day.date.getDate()}
              </span>

              {/* 공휴일 이름 */}
              {day.isCurrentMonth && getHolidayName(day.date) && (
                <span className="block text-size-9 text-red-400 truncate text-center leading-tight">
                  {getHolidayName(day.date)}
                </span>
              )}

              {/* 컬러 태그 바 + 일정 제목 */}
              {hasEvents && (
                <div className="mt-1 space-y-0.5">
                  {day.events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); router.push(`/letter/schedule/${event.id}`); }}
                      className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
                    >
                      <div
                        className={cn("w-[3px] h-3.5 rounded-full flex-shrink-0", !event.tagHexColor && event.tagColor)}
                        style={event.tagHexColor ? { backgroundColor: event.tagHexColor } : undefined}
                      />
                      <span className="text-size-11 text-foreground/80 truncate leading-tight">
                        {event.title}
                      </span>
                    </div>
                  ))}
                  {day.events.length > 3 && (
                    <span className="text-size-10 text-muted-foreground text-center block">
                      +{day.events.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* 오늘 dot indicator */}
              {isCurrentDay && day.isCurrentMonth && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
