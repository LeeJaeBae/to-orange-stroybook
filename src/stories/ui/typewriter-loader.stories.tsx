import type { Meta, StoryObj } from '@storybook/react';
import { TypewriterLoader } from '@/components/ui/typewriter-loader';

const meta: Meta<typeof TypewriterLoader> = {
  title: 'UI/TypewriterLoader',
  component: TypewriterLoader,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof TypewriterLoader>;

export const Default: Story = {};

export const WithCustomClass: Story = {
  args: {
    className: 'scale-150',
  },
};

export const InCard: Story = {
  render: () => (
    <div className="w-[300px] h-[200px] border rounded-xl flex flex-col items-center justify-center gap-4 bg-amber-50">
      <TypewriterLoader />
      <p className="text-sm text-amber-700">편지를 작성하는 중...</p>
    </div>
  ),
};
