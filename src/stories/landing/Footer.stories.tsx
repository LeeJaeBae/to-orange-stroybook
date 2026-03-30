import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from '@/components/landing/components/Footer';

const meta: Meta<typeof Footer> = {
  title: 'Landing/Footer',
  component: Footer,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
