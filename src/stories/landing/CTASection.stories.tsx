import type { Meta, StoryObj } from '@storybook/react';
import CTASection from '@/components/landing/CTASection';

const meta = {
  title: 'Landing/CTASection',
  component: CTASection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CTASection>;

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
