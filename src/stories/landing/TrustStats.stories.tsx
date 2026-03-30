import type { Meta, StoryObj } from '@storybook/react';
import { TrustStats } from '@/components/landing/sections/client/TrustStats';

const meta: Meta<typeof TrustStats> = {
  title: 'Landing/TrustStats',
  component: TrustStats,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof TrustStats>;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
