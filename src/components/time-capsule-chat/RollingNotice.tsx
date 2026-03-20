"use client";

import { useState, useEffect, useMemo } from "react";
import { Megaphone, Sun } from "lucide-react";
import type { Notice } from "./types";

interface DbNotice {
  id: string;
  content: string;
  isPinned: boolean;
}

interface RollingNoticeProps {
  notices?: Notice[];
  dbNotices?: DbNotice[];
  recipientName?: string;
}

export function RollingNotice({ notices: customNotices, dbNotices, recipientName = "받는분" }: RollingNoticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const defaultNotices: Notice[] = [
    {
      id: "1",
      type: "notice",
      content: "선물하기의 진짜 의미를 알려드려요!",
      icon: "megaphone",
    },
    {
      id: "2",
      type: "weather",
      content: `${recipientName}님 지역 날씨: 맑음 3°C`,
      icon: "weather",
    },
    {
      id: "3",
      type: "notice",
      content: "하루에 하나씩 따뜻한 메시지를 남겨주세요",
      icon: "megaphone",
    },
  ];

  // DB 공지가 있으면 pinned 우선으로 변환, 없으면 기존 하드코딩/커스텀
  const notices = useMemo(() => {
    if (dbNotices && dbNotices.length > 0) {
      // DB 공지가 있으면 사용
      return dbNotices.map((n) => ({
        id: n.id,
        type: "notice" as const,
        content: n.isPinned ? `📌 ${n.content}` : n.content,
        icon: "megaphone" as const,
      }));
    }
    return customNotices || defaultNotices;
  }, [dbNotices, customNotices, recipientName]);

  useEffect(() => {
    if (notices.length <= 1) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % notices.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [notices.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [notices]);

  const currentNotice = notices[currentIndex];

  if (!currentNotice) return null;

  return (
    <div className="w-full border-b border-border bg-white px-4 py-3 flex items-center gap-3 overflow-hidden">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        {currentNotice.icon === "weather" ? (
          <Sun className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Megaphone className="w-3.5 h-3.5 text-primary" />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <p
          className={`text-sm text-foreground transition-all duration-300 ${
            isAnimating
              ? "opacity-0 -translate-y-2"
              : "opacity-100 translate-y-0"
          }`}
        >
          <span>{currentNotice.content}</span>
        </p>
      </div>
      {/* Indicator dots */}
      {notices.length > 1 && <div className="flex gap-1">
        {notices.map((_, idx) => (
          <div
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              idx === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>}
    </div>
  );
}
