import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: '기본' } };
export const Secondary: Story = { args: { children: '보조', variant: 'secondary' } };
export const Outline: Story = { args: { children: '아웃라인', variant: 'outline' } };
export const Destructive: Story = { args: { children: '삭제', variant: 'destructive' } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge>기본</Badge>
      <Badge variant="secondary">보조</Badge>
      <Badge variant="outline">아웃라인</Badge>
      <Badge variant="destructive">삭제</Badge>
    </div>
  ),
};

export const WithStatus: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge>초안</Badge>
      <Badge variant="secondary">결제 완료</Badge>
      <Badge variant="outline">처리 중</Badge>
      <Badge className="bg-green-500 text-white border-transparent">발송 완료</Badge>
      <Badge variant="destructive">취소됨</Badge>
    </div>
  ),
};
