import type { Meta, StoryObj } from '@storybook/react';
import { AudioInterviewSection } from '@/components/landing/sections/client/AudioInterviewSection';

const meta: Meta<typeof AudioInterviewSection> = {
  title: 'Landing/AudioInterviewSection',
  component: AudioInterviewSection,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AudioInterviewSection>;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
