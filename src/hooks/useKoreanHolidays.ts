'use client';

import { useState, useEffect } from 'react';

interface Holiday {
  date: string;       // YYYY-MM-DD
  name: string;       // 공휴일 이름
  isHoliday: boolean; // 공휴일 여부
}

interface UseKoreanHolidaysReturn {
  holidays: Holiday[];
  isLoading: boolean;
  isHoliday: (date: Date) => boolean;
  getHolidayName: (date: Date) => string | null;
}

// 연도별 캐시
const holidayCache = new Map<number, Holiday[]>();

/**
 * 한국 공휴일 훅
 * 공공데이터포털 특일정보 API (data.go.kr)
 * 대체공휴일, 임시공휴일 포함
 */
export function useKoreanHolidays(year: number): UseKoreanHolidaysReturn {
  const [holidays, setHolidays] = useState<Holiday[]>(holidayCache.get(year) || []);
  const [isLoading, setIsLoading] = useState(!holidayCache.has(year));

  useEffect(() => {
    if (holidayCache.has(year)) {
      setHolidays(holidayCache.get(year)!);
      setIsLoading(false);
      return;
    }

    const fetchHolidays = async () => {
      setIsLoading(true);
      try {
        // 내부 API 프록시를 통해 호출 (API 키 노출 방지)
        const res = await fetch(`/api/v1/holidays?year=${year}`);
        if (!res.ok) throw new Error('공휴일 데이터 로드 실패');
        const data = await res.json();

        const holidayList: Holiday[] = data.holidays || [];
        holidayCache.set(year, holidayList);
        setHolidays(holidayList);
      } catch (error) {
        console.error('공휴일 API 오류:', error);
        setHolidays([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHolidays();
  }, [year]);

  const isHoliday = (date: Date): boolean => {
    const dateStr = formatDate(date);
    return holidays.some(h => h.date === dateStr);
  };

  const getHolidayName = (date: Date): string | null => {
    const dateStr = formatDate(date);
    const holiday = holidays.find(h => h.date === dateStr);
    return holiday?.name || null;
  };

  return { holidays, isLoading, isHoliday, getHolidayName };
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
