"use client";

import { TimeCapsuleChatPage } from "./TimeCapsuleChatPage";

/**
 * 데모용 타임캡슐 채팅 컴포넌트
 * 실제 로직은 TimeCapsuleChatPage에 통합되어 있으며,
 * 이 컴포넌트는 데모 모드로 동작하는 래퍼입니다.
 */
interface TimeCapsuleChatProps {
  timeCapsuleId?: string;
  recipientName?: string;
  title?: string;
  deliveryDate?: string;
}

export function TimeCapsuleChat({
  recipientName = "서은우",
  title = "출소축하",
  deliveryDate = "2026.12.23",
}: TimeCapsuleChatProps) {
  return (
    <TimeCapsuleChatPage
      timeCapsuleId="demo"
      mode="demo"
      demoProps={{ recipientName, title, deliveryDate }}
    />
  );
}
