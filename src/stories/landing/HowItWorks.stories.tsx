import type { Meta, StoryObj } from '@storybook/react';
import { HowItWorks } from '@/components/landing/sections/client/HowItWorks';

const meta: Meta<typeof HowItWorks> = {
  title: 'Landing/HowItWorks',
  component: HowItWorks,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof HowItWorks>;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
