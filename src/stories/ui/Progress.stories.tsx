import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '@/components/ui/progress';

const meta = {
  title: 'UI/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: '진행률 (0~100)',
    },
  },
  args: {
    value: 50,
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Quarter: Story = {
  args: {
    value: 25,
  },
};

export const Half: Story = {
  args: {
    value: 50,
  },
};

export const ThreeQuarter: Story = {
  args: {
    value: 75,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
  },
};

export const LetterProgress: Story = {
  name: '편지 발송 진행 상태',
  render: () => (
    <div className="space-y-6 w-[400px]">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>편지 작성</span>
          <span>100%</span>
        </div>
        <Progress value={100} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>결제 완료</span>
          <span>100%</span>
        </div>
        <Progress value={100} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>인쇄 중</span>
          <span>60%</span>
        </div>
        <Progress value={60} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>발송 대기</span>
          <span>0%</span>
        </div>
        <Progress value={0} />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: '다양한 높이',
  render: () => (
    <div className="space-y-4 w-[400px]">
      <Progress value={60} className="h-1" />
      <Progress value={60} className="h-2" />
      <Progress value={60} className="h-4" />
      <Progress value={60} className="h-6" />
    </div>
  ),
};
