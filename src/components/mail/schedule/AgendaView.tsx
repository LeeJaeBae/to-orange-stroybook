'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSchedules } from "@/hooks/useSchedules";
import { useAuth } from "@/hooks/useAuth";
import { type ScheduleEvent, WEEK_DAYS, formatDateStr, isSameDay, apiScheduleToEvent } from "./schedule-utils";

interface AgendaViewProps {
  initialEvents: ScheduleEvent[];
  initialMonth: string; // "YYYY-MM"
}

export function AgendaView({ initialEvents, initialMonth }: AgendaViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const today = new Date();
  const observerRef = useRef<HTMLDivElement>(null);

  // 추가 로드할 월 목록
  const [extraMonths, setExtraMonths] = useState<string[]>([]);

  // 다음 월 계산
  const getNextMonth = useCallback((monthStr: string): string => {
    const [y, m] = monthStr.split('-').map(Number);
    const next = new Date(y, m, 1); // m은 이미 1-based이므로 다음 달
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // 추가 월 데이터 로드
  const lastExtraMonth = extraMonths.length > 0 ? extraMonths[extraMonths.length - 1] : initialMonth;
  const nextMonth = getNextMonth(lastExtraMonth);
  const { schedules: nextSchedules, isLoading: isLoadingNext } = useSchedules(
    extraMonths.length < 12 ? { month: nextMonth } : {}
  );

  const nextEvents = useMemo(() => {
    if (!user) return [];
    return nextSchedules.map(s => apiScheduleToEvent(s as any));
  }, [nextSchedules, user]);

  // 오늘 이후 이벤트만 필터 + 날짜별 그룹핑
  const groupedEvents = useMemo(() => {
    const todayStr = formatDateStr(today);
    const filtered = initialEvents
      .filter(e => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));

    const groups: { date: string; dateObj: Date; events: ScheduleEvent[] }[] = [];
    let currentGroup: typeof groups[0] | null = null;

    for (const event of filtered) {
      if (!currentGroup || currentGroup.date !== event.date) {
        currentGroup = { date: event.date, dateObj: new Date(event.date + 'T00:00:00'), events: [] };
        groups.push(currentGroup);
      }
      currentGroup.events.push(event);
    }

    return groups;
  }, [initialEvents]);

  // 무한 스크롤 observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingNext && extraMonths.length < 12) {
          setExtraMonths(prev => {
            const next = getNextMonth(prev.length > 0 ? prev[prev.length - 1] : initialMonth);
            if (prev.includes(next)) return prev;
            return [...prev, next];
          });
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [isLoadingNext, extraMonths, initialMonth, getNextMonth]);

  if (groupedEvents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">예정된 일정이 없습니다</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1"
    >
      {groupedEvents.map((group) => {
        const isCurrentDay = isSameDay(group.dateObj, today);

        return (
          <div key={group.date}>
            {/* 날짜 sticky header */}
            <div className={cn(
              "sticky top-0 z-10 py-2 px-1 backdrop-blur-sm",
              isCurrentDay ? "bg-orange-50/90" : "bg-white/90"
            )}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {group.dateObj.getMonth() + 1}월 {group.dateObj.getDate()}일
                </span>
                <span className="text-sm text-muted-foreground">
                  {WEEK_DAYS[group.dateObj.getDay()]}요일
                </span>
                {isCurrentDay && (
                  <span className="text-size-10 font-medium text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded-full">오늘</span>
                )}
              </div>
            </div>

            {/* 일정 카드 */}
            <div className="space-y-1.5 pb-3">
              {group.events.map((event) => {
                const Icon = event.icon;
                return (
                  <div
                    key={event.id}
                    onClick={() => router.push(`/letter/schedule/${event.id}`)}
                    className="flex items-center gap-3 bg-white rounded-xl border border-border/40 p-3.5 cursor-pointer hover:shadow-sm transition-all"
                  >
                    <div
                      className={cn("w-[3px] h-10 rounded-full flex-shrink-0", !event.tagHexColor && event.tagColor)}
                      style={event.tagHexColor ? { backgroundColor: event.tagHexColor } : undefined}
                    />
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4.5 h-4.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {event.time && <span>{event.time}</span>}
                        {event.facility && <span>{event.time ? ' · ' : ''}{event.facility}</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 무한 스크롤 감지 영역 */}
      <div ref={observerRef} className="py-4 text-center">
        {isLoadingNext && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />}
      </div>
    </motion.div>
  );
}
