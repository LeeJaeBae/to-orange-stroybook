import type { Meta, StoryObj } from '@storybook/react';
import HowItWorks from '@/components/landing/HowItWorks';

const meta = {
  title: 'Landing/HowItWorks',
  component: HowItWorks,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HowItWorks>;

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
