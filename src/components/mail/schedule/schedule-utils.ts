'use client';

import {
  CalendarDays, Users, Briefcase, Scale, Mail, Home, Cake, Heart,
  GraduationCap, Activity, Edit3, Sparkles,
} from "lucide-react";
import type { Schedule } from "@/hooks/useSchedules";

// 뷰 타입
export type ScheduleViewType = 'yearly' | 'monthly' | 'weekly' | 'agenda';

// 일정 타입 정의
export type ScheduleEventType =
  | "special_day" | "letter_send" | "visit" | "custom"
  | "consultation" | "trial" | "letter" | "release"
  | "birthday" | "anniversary" | "program" | "health";

export interface ScheduleEvent {
  id: string;
  type: ScheduleEventType;
  title: string;
  date: string;
  time?: string;
  personName?: string;
  facility?: string;
  facilityAddress?: string;
  description?: string;
  icon: typeof CalendarDays;
  color: string;
  bgColor: string;
  // 컬러 태그 바 색상
  tagColor: string;
  tagHexColor?: string;
  familyMemberId?: string;
}

// 타입별 아이콘 매핑
export const typeIcons: Record<string, typeof CalendarDays> = {
  visit: Users,
  consultation: Briefcase,
  trial: Scale,
  letter: Mail,
  release: Home,
  birthday: Cake,
  anniversary: Heart,
  program: GraduationCap,
  health: Activity,
  custom: Edit3,
  other: Edit3,
  release_celebration: Home,
  parole_celebration: Sparkles,
  birthday_celebration: Cake,
  anniversary_celebration: Heart,
};

// 타입별 색상 매핑 (bgColor 제거 → tagColor 추가)
export const typeColors: Record<string, { color: string; bgColor: string; tagColor: string }> = {
  visit:        { color: "text-white", bgColor: "bg-orange-500", tagColor: "bg-orange-500" },
  consultation: { color: "text-white", bgColor: "bg-orange-400", tagColor: "bg-orange-400" },
  trial:        { color: "text-white", bgColor: "bg-orange-600", tagColor: "bg-orange-600" },
  letter:       { color: "text-white", bgColor: "bg-orange-500", tagColor: "bg-orange-500" },
  release:      { color: "text-white", bgColor: "bg-green-500",  tagColor: "bg-green-500" },
  birthday:     { color: "text-white", bgColor: "bg-pink-500",   tagColor: "bg-pink-500" },
  anniversary:  { color: "text-white", bgColor: "bg-red-400",    tagColor: "bg-red-400" },
  program:      { color: "text-white", bgColor: "bg-blue-500",   tagColor: "bg-blue-500" },
  health:       { color: "text-white", bgColor: "bg-teal-500",   tagColor: "bg-teal-500" },
  custom:       { color: "text-white", bgColor: "bg-gray-500",   tagColor: "bg-gray-400" },
  other:        { color: "text-orange-500", bgColor: "bg-gray-100", tagColor: "bg-gray-400" },
  release_celebration:    { color: "text-white", bgColor: "bg-green-500",  tagColor: "bg-green-500" },
  parole_celebration:     { color: "text-white", bgColor: "bg-purple-500", tagColor: "bg-purple-500" },
  birthday_celebration:   { color: "text-white", bgColor: "bg-pink-500",   tagColor: "bg-pink-500" },
  anniversary_celebration:{ color: "text-white", bgColor: "bg-red-400",    tagColor: "bg-red-400" },
};

// API Schedule → UI ScheduleEvent 변환
export function apiScheduleToEvent(schedule: Schedule): ScheduleEvent {
  const colors = typeColors[schedule.type] || typeColors.custom;
  return {
    id: schedule.id,
    type: schedule.type as ScheduleEventType,
    title: schedule.title,
    date: schedule.date,
    time: schedule.time,
    personName: schedule.personName,
    facility: schedule.facility || schedule.location,
    facilityAddress: schedule.facilityAddress || schedule.locationAddress,
    description: schedule.description,
    icon: typeIcons[schedule.type] || CalendarDays,
    color: colors.color,
    bgColor: colors.bgColor,
    tagColor: colors.tagColor,
    tagHexColor: schedule.tag?.color,
    familyMemberId: schedule.familyMemberId,
  };
}

// Mock 데이터 (비로그인 데모)
export const mockSpecialDays = [
  { id: '1', treeId: '1', type: 'birthday', title: '생일', date: '2026-02-15', time: '10:00', description: '생일 축하' },
  { id: '2', treeId: '1', type: 'release', title: '출소일', date: '2026-06-01', time: '09:00', description: '출소 예정일' },
];

export const mockOrangeTrees = [
  { id: '1', personId: '1', personName: '김철수' },
];

export const mockFamilyMembers = [
  { id: '1', name: '김철수', relation: '가족', facility: '서울남부교도소', facilityAddress: '서울특별시 금천구 시흥대로 439', avatar: '' },
  { id: '2', name: '이영희', relation: '친구', facility: '수원구치소', facilityAddress: '경기도 수원시 팔달구 효원로 439', avatar: '' },
];

// 날짜 유틸
export function formatDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

export const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function getDaysRemaining(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
