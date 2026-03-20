import type { Meta, StoryObj } from '@storybook/react';
import FeaturesScroll from '@/components/landing/FeaturesScroll';

const meta = {
  title: 'Landing/FeaturesScroll',
  component: FeaturesScroll,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof FeaturesScroll>;

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
