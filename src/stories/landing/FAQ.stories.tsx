import type { Meta, StoryObj } from '@storybook/react';
import { FAQ } from '@/components/landing/sections/client/FAQ';

const meta: Meta<typeof FAQ> = {
  title: 'Landing/FAQ',
  component: FAQ,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof FAQ>;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
