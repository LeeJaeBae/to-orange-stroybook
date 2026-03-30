import type { Meta, StoryObj } from '@storybook/react';
import { FloatingBottomBar } from '@/components/landing/components/client/FloatingBottomBar';

const meta: Meta<typeof FloatingBottomBar> = {
  title: 'Landing/FloatingBottomBar',
  component: FloatingBottomBar,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof FloatingBottomBar>;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
