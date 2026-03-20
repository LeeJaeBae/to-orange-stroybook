'use client';

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays, Plus,
  Users, Briefcase, Cake,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSchedules } from "@/hooks/useSchedules";
import { useAuth } from "@/hooks/useAuth";
import { useKoreanHolidays } from "@/hooks/useKoreanHolidays";
import {
  type ScheduleEvent,
  type ScheduleEventType,
  type ScheduleViewType,
  typeIcons,
  typeColors,
  mockSpecialDays as specialDays,
  mockOrangeTrees as orangeTrees,
  mockFamilyMembers as familyMembers,
  apiScheduleToEvent,
  getDaysRemaining,
} from "./schedule/schedule-utils";
import { ScheduleHeader } from "./schedule/ScheduleHeader";
import { MonthlyView } from "./schedule/MonthlyView";
import { WeeklyView } from "./schedule/WeeklyView";
import { AgendaView } from "./schedule/AgendaView";
import { YearlyView } from "./schedule/YearlyView";
import { ScheduleFAB } from "./schedule/ScheduleFAB";
import { ScheduleCreateSheet } from "./schedule/ScheduleCreateSheet";

export type { ScheduleEvent, ScheduleEventType };
export { apiScheduleToEvent };

interface ScheduleContentProps {
  onClose?: () => void;
}

export function ScheduleContent({ onClose }: ScheduleContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ScheduleViewType>('monthly');
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [createDate, setCreateDate] = useState<string | null>(null);
  const searchCreateDate = searchParams.get('create') === 'true'
    ? searchParams.get('date')
    : null;
  const isCreateSheetOpen = showCreateSheet || searchCreateDate !== null;
  const effectiveCreateDate = createDate || searchCreateDate;

  const handleOpenCreateSheet = (dateStr?: string) => {
    setCreateDate(dateStr || null);
    setShowCreateSheet(true);
  };

  const handleCloseCreateSheet = () => {
    setShowCreateSheet(false);
    setCreateDate(null);

    if (searchCreateDate !== null) {
      router.replace('/letter/schedule');
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // API에서 스케줄 데이터 가져오기
  const currentMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
  const { schedules: apiSchedules, isLoading } = useSchedules({ month: currentMonth });

  // 한국 공휴일 데이터
  const { isHoliday, getHolidayName } = useKoreanHolidays(year);

  // 모든 일정 데이터 통합
  const allEvents = useMemo(() => {
    const events: ScheduleEvent[] = [];

    // 로그인한 사용자: API 데이터 사용
    if (user && apiSchedules.length > 0) {
      apiSchedules.forEach((schedule) => {
        events.push(apiScheduleToEvent(schedule));
      });
    }

    // 비로그인 시: 샘플 데이터 표시 (데모용)
    if (!user) {
      specialDays.forEach((day) => {
        const tree = orangeTrees.find((t) => t.id === day.treeId);
        const member = tree ? familyMembers.find((m) => m.id === tree.personId) : null;
        const colors = typeColors[day.type] || typeColors.other;

        events.push({
          id: day.id,
          type: "special_day",
          title: day.title,
          date: day.date,
          time: day.time,
          personName: tree?.personName,
          facility: member?.facility,
          facilityAddress: member?.facilityAddress,
          description: day.description,
          icon: typeIcons[day.type] || CalendarDays,
          color: colors.color,
          bgColor: colors.bgColor,
          tagColor: colors.tagColor,
        });
      });

      const sampleEvents: ScheduleEvent[] = [
        {
          id: "visit-sample-1",
          type: "visit",
          title: "일반접견",
          date: `${year}-${String(month + 1).padStart(2, '0')}-04`,
          time: "10:00",
          facility: "서울남부교도소",
          facilityAddress: "서울특별시 금천구 시흥대로 439",
          icon: Users,
          color: "text-white",
          bgColor: "bg-orange-500",
          tagColor: "bg-orange-500",
        },
        {
          id: "consultation-sample-1",
          type: "consultation",
          title: "변호인접견",
          date: `${year}-${String(month + 1).padStart(2, '0')}-08`,
          time: "14:00",
          facility: "서울남부교도소",
          icon: Briefcase,
          color: "text-white",
          bgColor: "bg-orange-400",
          tagColor: "bg-orange-400",
        },
        {
          id: "birthday-sample-1",
          type: "custom",
          title: "생일 축하",
          date: `${year}-${String(month + 1).padStart(2, '0')}-15`,
          personName: "김철수",
          description: "생일 축하",
          icon: Cake,
          color: "text-white",
          bgColor: "bg-pink-500",
          tagColor: "bg-pink-500",
        },
      ];
      events.push(...sampleEvents);
    }

    return events;
  }, [year, month, user, apiSchedules]);

  // 다가오는 일정 (오늘 이후 30일 이내)
  const upcomingEvents = useMemo(() => {
    return allEvents
      .filter((e) => {
        const days = getDaysRemaining(e.date);
        return days >= 0 && days <= 30;
      })
      .sort((a, b) => getDaysRemaining(a.date) - getDaysRemaining(b.date));
  }, [allEvents]);

  const goToPrevMonth = () => {
    if (viewType === 'yearly') {
      setCurrentDate(new Date(year - 1, month, 1));
    } else if (viewType === 'weekly') {
      setCurrentDate(new Date(year, month, currentDate.getDate() - 7));
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const goToNextMonth = () => {
    if (viewType === 'yearly') {
      setCurrentDate(new Date(year + 1, month, 1));
    } else if (viewType === 'weekly') {
      setCurrentDate(new Date(year, month, currentDate.getDate() + 7));
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleNavigateToMonth = (monthIndex: number) => {
    setCurrentDate(new Date(year, monthIndex, 1));
    setViewType('monthly');
  };

  const createSheetKey = isCreateSheetOpen
    ? `schedule-create-${effectiveCreateDate ?? 'today'}`
    : 'schedule-create-closed';

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Desktop Header */}
      <header className="hidden md:flex h-14 border-b border-border/40 bg-white/80 backdrop-blur-sm items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-foreground">스케줄 관리</h1>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            로딩 중...
          </div>
        )}
      </header>

      {/* 비로그인 안내 배너 */}
      {!user && (
        <div className="bg-orange-50 border-b border-orange-100 px-6 py-3 flex items-center justify-between">
          <p className="text-sm text-orange-700">
            로그인하면 일정을 저장하고 관리할 수 있습니다.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-100"
            onClick={() => router.push('/auth')}
          >
            로그인
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 py-6 md:py-10 lg:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 타이틀 */}
          <div className="mb-[18px]">
            <h2 className="text-lg md:text-2xl font-bold text-foreground mb-[18px]">
              모든 <span className="text-primary underline underline-offset-4">일정</span>을 한 곳에서 관리하세요
            </h2>
            <div className="mb-6">
              <p className="text-size-15 md:text-base text-muted-foreground leading-normal">
                면회일, 접견일, 재판일, 쪽지발송일 등 일정을 등록만 하면
                <br />
                미리 중요한 날에 맞춰 필요한 정보가 함께 정리됩니다.
              </p>
            </div>
            <Button
              className="gap-2 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-[0_4px_14px_rgba(251,146,60,0.3)]"
              onClick={() => handleOpenCreateSheet()}
            >
              <Plus className="w-4 h-4" />
              일정 등록
            </Button>
          </div>

          {/* 다가오는 일정 */}
          {upcomingEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="flex items-center gap-3 mt-1"
            >
              <span className="text-sm text-muted-foreground whitespace-nowrap">곧 다가오고 있어요</span>
              <div className="flex items-center gap-2 flex-wrap">
                {upcomingEvents.slice(0, 3).map((event) => {
                  const daysUntil = getDaysRemaining(event.date);
                  return (
                    <button
                      key={event.id}
                      onClick={() => router.push(`/letter/schedule/${event.id}`)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                        daysUntil === 0 ? "bg-red-100 text-red-600 hover:bg-red-200" :
                        daysUntil <= 3 ? "bg-orange-100 text-orange-600 hover:bg-orange-200" :
                        "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {event.title.length > 6 ? event.title.slice(0, 6) + "..." : event.title} {daysUntil === 0 ? "오늘" : `D-${daysUntil}`}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Header + 세그먼트 */}
          <ScheduleHeader
            currentDate={currentDate}
            viewType={viewType}
            onViewChange={setViewType}
            onPrevMonth={goToPrevMonth}
            onNextMonth={goToNextMonth}
            onToday={goToToday}
          />

          {/* 뷰 영역 */}
          {viewType === 'monthly' && (
            <MonthlyView
              currentDate={currentDate}
              events={allEvents}
              isHoliday={isHoliday}
              getHolidayName={getHolidayName}
              onEmptyDateClick={handleOpenCreateSheet}
            />
          )}

          {viewType === 'weekly' && (
            <WeeklyView
              currentDate={currentDate}
              events={allEvents}
              isHoliday={isHoliday}
              getHolidayName={getHolidayName}
              onAddClick={handleOpenCreateSheet}
            />
          )}

          {viewType === 'agenda' && (
            <AgendaView
              initialEvents={allEvents}
              initialMonth={currentMonth}
            />
          )}

          {viewType === 'yearly' && (
            <YearlyView
              year={year}
              onNavigateToMonth={handleNavigateToMonth}
            />
          )}
        </div>
      </div>

      {/* FAB */}
      <ScheduleFAB onClick={() => handleOpenCreateSheet()} />

      {/* 바텀시트 */}
      <ScheduleCreateSheet
        key={createSheetKey}
        open={isCreateSheetOpen}
        onClose={handleCloseCreateSheet}
        initialDate={effectiveCreateDate || undefined}
      />
    </div>
  );
}
