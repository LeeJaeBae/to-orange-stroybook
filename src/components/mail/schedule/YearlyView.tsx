'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSchedules } from "@/hooks/useSchedules";
import { useAuth } from "@/hooks/useAuth";
import { apiScheduleToEvent } from "./schedule-utils";

interface YearlyViewProps {
  year: number;
  onNavigateToMonth: (month: number) => void;
}

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export function YearlyView({ year, onNavigateToMonth }: YearlyViewProps) {
  const { user } = useAuth();

  // 12개월 데이터를 각각 로드
  const q1 = useSchedules({ month: `${year}-01` });
  const q2 = useSchedules({ month: `${year}-02` });
  const q3 = useSchedules({ month: `${year}-03` });
  const q4 = useSchedules({ month: `${year}-04` });
  const q5 = useSchedules({ month: `${year}-05` });
  const q6 = useSchedules({ month: `${year}-06` });
  const q7 = useSchedules({ month: `${year}-07` });
  const q8 = useSchedules({ month: `${year}-08` });
  const q9 = useSchedules({ month: `${year}-09` });
  const q10 = useSchedules({ month: `${year}-10` });
  const q11 = useSchedules({ month: `${year}-11` });
  const q12 = useSchedules({ month: `${year}-12` });

  const monthlyData = useMemo(() => {
    const queries = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12];
    return queries.map((q, i) => ({
      month: i,
      events: q.schedules.map(s => apiScheduleToEvent(s as any)),
      isLoading: q.isLoading,
    }));
  }, [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-3 gap-3"
    >
      {monthlyData.map((data, index) => {
        const hasEvents = data.events.length > 0;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onNavigateToMonth(index)}
            className={cn(
              "rounded-xl p-4 cursor-pointer transition-all",
              hasEvents
                ? "bg-white shadow-sm ring-1 ring-border/40 hover:shadow-md"
                : "bg-gray-50/80 hover:bg-gray-100/80",
            )}
          >
            {/* 월 헤더 */}
            <div className="flex items-center justify-between mb-3">
              <h3 className={cn(
                "text-base font-bold",
                hasEvents ? "text-foreground" : "text-muted-foreground",
              )}>
                {MONTHS[index]}
              </h3>
              {hasEvents && (
                <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                  {data.events.length}
                </span>
              )}
            </div>

            {/* 일정 미리보기 */}
            {hasEvents ? (
              <div className="space-y-1">
                {data.events.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center gap-1.5">
                    <div className={cn("w-[3px] h-3 rounded-full flex-shrink-0", event.tagColor)} />
                    <span className="text-xs text-foreground/70 truncate">{event.title}</span>
                  </div>
                ))}
                {data.events.length > 3 && (
                  <span className="text-size-10 text-muted-foreground">+{data.events.length - 3}개 더</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 py-1">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/50">일정 없음</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
