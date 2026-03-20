import type { Meta, StoryObj } from '@storybook/react';
import AudioInterviewSection from '@/components/landing/AudioInterviewSection';

const meta = {
  title: 'Landing/AudioInterviewSection',
  component: AudioInterviewSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AudioInterviewSection>;

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

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
