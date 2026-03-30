import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '@/components/ui/separator';

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">투오렌지</h4>
        <p className="text-sm text-muted-foreground">교도소 편지 서비스</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>편지 작성</div>
        <Separator orientation="vertical" />
        <div>발송 내역</div>
        <Separator orientation="vertical" />
        <div>설정</div>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-10 items-center gap-4 text-sm">
      <span>편지 작성</span>
      <Separator orientation="vertical" />
      <span>수신인 관리</span>
      <Separator orientation="vertical" />
      <span>결제</span>
    </div>
  ),
};
