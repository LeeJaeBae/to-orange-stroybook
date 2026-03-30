import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {};

export const InContainer: Story = {
  render: () => (
    <div className="w-[400px] h-[300px] border rounded-xl">
      <LoadingSpinner />
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner />
      <p className="text-sm text-muted-foreground">데이터를 불러오는 중...</p>
    </div>
  ),
};
