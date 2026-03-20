import type { Meta, StoryObj } from '@storybook/react';
import TrustStats from '@/components/landing/TrustStats';

const meta = {
  title: 'Landing/TrustStats',
  component: TrustStats,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TrustStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
