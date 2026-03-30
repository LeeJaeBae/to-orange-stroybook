import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '@/components/ui/progress';

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: { value: 50 },
};

export const Empty: Story = {
  args: { value: 0 },
};

export const Full: Story = {
  args: { value: 100 },
};

export const AllValues: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>편지 작성</span>
          <span>25%</span>
        </div>
        <Progress value={25} />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>수신인 확인</span>
          <span>50%</span>
        </div>
        <Progress value={50} />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>결제 완료</span>
          <span>75%</span>
        </div>
        <Progress value={75} />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>발송 완료</span>
          <span>100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
  ),
};
