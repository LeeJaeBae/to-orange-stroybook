"use client";

import type { Guide } from "./types";

export const guides: Guide[] = [
  { id: 1, label: "쪽지를 매일 전해야하나요?", content: "매일 보내지 않아도 괜찮아요. 하지만 하루에 하나씩 마음을 전하면 받는 분께 더 큰 감동이 될 수 있어요." },
  { id: 2, label: "타임캡슐은 어떻게 전달되나요?", content: "모바일 화면에 올라온 모든 기록을 종이로 출력하여 전달일에 맞춰 실제 대상자에게 전달해드립니다. 사진, 메시지, 선물 기록이 모두 포함되어 소중한 추억이 됩니다." },
  { id: 3, label: "영치금대신 왜 오렌지를 선물하나요?", content: "오렌지는 따뜻한 마음을 상징해요. 실제 선물 대신 마음을 담은 오렌지 포인트로 응원의 마음을 전할 수 있어요." },
  { id: 4, label: "타임캡슐 방 생성하는 방법", content: "홈 화면에서 '새 타임캡슐 만들기'를 눌러 받는 사람 정보와 전달일을 설정하면 바로 생성할 수 있어요." },
  { id: 5, label: "방장의 권한", content: "방장은 참여자 관리, 공지사항 작성, 링크 설정, 전달일 변경 권한을 가지고 있어요. 최종 발송 단계는 아직 운영 연결 전이에요." },
  { id: 6, label: "편지발송은 언제하나요?", content: "전달 예정일 7일 전부터 전달 준비 안내가 보여요. 다만 실제 우표 구매 및 발송 기능은 아직 준비 중이라, 현재는 쪽지를 계속 모으는 흐름만 지원하고 있어요." },
];

interface GuideChipsProps {
  onFaqClick?: (guide: Guide) => void;
}

export function GuideChips({ onFaqClick }: GuideChipsProps) {
  const handleChipClick = (guide: Guide) => {
    if (onFaqClick) {
      onFaqClick(guide);
    }
  };

  return (
    <div className="w-full">
      {/* Chips */}
      <div className="flex flex-wrap justify-center gap-2 px-4">
        {guides.map((guide) => (
          <button
            key={guide.id}
            onClick={() => handleChipClick(guide)}
            className="px-3 py-1.5 bg-white rounded-full text-xs text-muted-foreground border border-border hover:bg-muted/50 hover:border-muted-foreground/30 transition-all active:scale-95 shadow-sm"
          >
            {guide.label}
          </button>
        ))}
      </div>
    </div>
  );
}
