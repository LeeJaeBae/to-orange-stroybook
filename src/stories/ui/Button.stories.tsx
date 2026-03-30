import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = { args: { children: '버튼' } };
export const Destructive: Story = { args: { children: '삭제', variant: 'destructive' } };
export const Outline: Story = { args: { children: '아웃라인', variant: 'outline' } };
export const Secondary: Story = { args: { children: '보조', variant: 'secondary' } };
export const Ghost: Story = { args: { children: '고스트', variant: 'ghost' } };
export const Link: Story = { args: { children: '링크', variant: 'link' } };
export const Small: Story = { args: { children: '작은 버튼', size: 'sm' } };
export const Large: Story = { args: { children: '큰 버튼', size: 'lg' } };
export const Disabled: Story = { args: { children: '비활성', disabled: true } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>기본</Button>
      <Button variant="destructive">삭제</Button>
      <Button variant="outline">아웃라인</Button>
      <Button variant="secondary">보조</Button>
      <Button variant="ghost">고스트</Button>
      <Button variant="link">링크</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="xs">아주 작게</Button>
      <Button size="sm">작게</Button>
      <Button>기본</Button>
      <Button size="lg">크게</Button>
    </div>
  ),
};
