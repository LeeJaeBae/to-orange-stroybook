import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';

const meta = {
  title: 'UI/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '마우스를 올리면 나타나는 호버 카드 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" className="text-base">@투오렌지</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-lg">
            T
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-semibold">투오렌지</h4>
            <p className="text-sm text-muted-foreground">
              소중한 사람에게 마음을 전하는 교정시설 편지 서비스
            </p>
            <div className="flex items-center pt-2">
              <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-xs text-muted-foreground">2024년 서비스 시작</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const UserProfile: Story = {
  name: '사용자 프로필',
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">홍길동</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">홍길동</h4>
          <p className="text-sm text-muted-foreground">발송 편지 23통 | 수신자 3명</p>
          <p className="text-xs text-muted-foreground">마지막 발송: 2026년 3월 15일</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const FacilityInfo: Story = {
  name: '시설 정보',
  render: () => (
    <p className="text-sm">
      편지를{' '}
      <HoverCard>
        <HoverCardTrigger asChild>
          <span className="cursor-pointer underline underline-offset-4 decoration-dashed text-orange-600">
            서울구치소
          </span>
        </HoverCardTrigger>
        <HoverCardContent className="w-72">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">서울구치소</h4>
            <p className="text-xs text-muted-foreground">경기도 의왕시 삼동로 33</p>
            <p className="text-xs text-muted-foreground">유형: 구치소</p>
            <p className="text-xs text-muted-foreground">평균 배달 소요: 3~5일</p>
          </div>
        </HoverCardContent>
      </HoverCard>
      (으)로 발송합니다.
    </p>
  ),
};
