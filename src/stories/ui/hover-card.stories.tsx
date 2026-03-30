import type { Meta, StoryObj } from '@storybook/react';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const meta: Meta<typeof HoverCard> = {
  title: 'UI/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@toOrange</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>TO</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">투오렌지</h4>
            <p className="text-sm">
              교도소 편지 서비스 - 소중한 사람에게 마음을 전하세요.
            </p>
            <div className="flex items-center pt-2">
              <span className="text-xs text-muted-foreground">
                2024년 1월부터 서비스 시작
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <HoverCard openDelay={0}>
      <HoverCardTrigger asChild>
        <Button variant="outline">프로필 보기</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">홍길동</h4>
          <p className="text-sm text-muted-foreground">
            발신인 정보: 서울시 마포구 OO동
          </p>
          <p className="text-sm text-muted-foreground">
            편지 발송 횟수: 12회
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};
