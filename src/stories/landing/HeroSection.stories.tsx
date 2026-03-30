import type { Meta, StoryObj } from '@storybook/react';
import { HeroSection } from '@/components/landing/sections/client/HeroSection';

const meta: Meta<typeof HeroSection> = {
  title: 'Landing/HeroSection',
  component: HeroSection,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof HeroSection>;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
