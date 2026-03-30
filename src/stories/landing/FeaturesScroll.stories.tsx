import type { Meta, StoryObj } from '@storybook/react';
import { FeaturesScroll } from '@/components/landing/sections/client/FeaturesScroll';

const meta: Meta<typeof FeaturesScroll> = {
  title: 'Landing/FeaturesScroll',
  component: FeaturesScroll,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof FeaturesScroll>;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
