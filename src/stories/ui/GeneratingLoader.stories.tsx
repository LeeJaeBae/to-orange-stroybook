import type { Meta, StoryObj } from '@storybook/react';
import { GeneratingLoader } from '@/components/ui/GeneratingLoader';

const meta: Meta<typeof GeneratingLoader> = {
  title: 'UI/GeneratingLoader',
  component: GeneratingLoader,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof GeneratingLoader>;

export const Default: Story = {};

export const WithCustomClass: Story = {
  args: {
    className: 'p-8 bg-gray-50 rounded-xl',
  },
};

export const InCard: Story = {
  render: () => (
    <div className="w-[300px] h-[200px] border rounded-xl flex items-center justify-center bg-white shadow-sm">
      <GeneratingLoader />
    </div>
  ),
};
