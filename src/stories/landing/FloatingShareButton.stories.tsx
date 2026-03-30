import type { Meta, StoryObj } from '@storybook/react';
import { FloatingShareButton } from '@/components/landing/components/client/FloatingShareButton';

const meta: Meta<typeof FloatingShareButton> = {
  title: 'Landing/FloatingShareButton',
  component: FloatingShareButton,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof FloatingShareButton>;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
