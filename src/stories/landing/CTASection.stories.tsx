import type { Meta, StoryObj } from '@storybook/react';
import { CTASection } from '@/components/landing/sections/client/CTASection';

const meta: Meta<typeof CTASection> = {
  title: 'Landing/CTASection',
  component: CTASection,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof CTASection>;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
