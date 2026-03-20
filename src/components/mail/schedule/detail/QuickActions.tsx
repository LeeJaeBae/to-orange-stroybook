'use client';

import { useRouter } from "next/navigation";
import { Mail, Gift, ChevronRight, type LucideIcon } from "lucide-react";

interface QuickAction {
  icon: LucideIcon;
  label: string;
  description?: string;
  href: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const router = useRouter();

  if (actions.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">빠른 액션</h3>
      {actions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <button
            key={idx}
            onClick={() => router.push(action.href)}
            className="w-full flex items-center gap-3 p-3 bg-white border border-border/40 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium">{action.label}</p>
              {action.description && (
                <p className="text-xs text-muted-foreground">{action.description}</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </button>
        );
      })}
    </div>
  );
}

// 팩토리: 카테고리별 액션 생성
export function getQuickActions(type: string, familyMemberId?: string): QuickAction[] {
  const composeUrl = familyMemberId
    ? `/letter/compose/1?recipientId=${familyMemberId}`
    : '/letter/compose/1';

  const capsuleUrl = '/letter/time-capsule/create';

  switch (type) {
    case 'birthday':
      return [
        { icon: Mail, label: '축하 편지 쓰기', href: composeUrl },
        { icon: Gift, label: '생일 타임캡슐 만들기', description: '축하 메시지를 모아보세요', href: capsuleUrl },
      ];
    case 'anniversary':
      return [
        { icon: Mail, label: '기념 편지 쓰기', href: composeUrl },
        { icon: Gift, label: '기념 타임캡슐 만들기', href: capsuleUrl },
      ];
    case 'release':
      return [
        { icon: Gift, label: '축하 타임캡슐 만들기', description: '출소 축하 메시지를 모아보세요', href: capsuleUrl },
        { icon: Mail, label: '축하 편지 쓰기', href: composeUrl },
      ];
    case 'letter':
      return [
        { icon: Mail, label: '편지 쓰기', href: composeUrl },
      ];
    default:
      return [];
  }
}
