import type { Meta, StoryObj } from '@storybook/react';
import { SpecialFeatures } from '@/components/landing/sections/client/SpecialFeatures';

const meta: Meta<typeof SpecialFeatures> = {
  title: 'Landing/SpecialFeatures',
  component: SpecialFeatures,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof SpecialFeatures>;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
