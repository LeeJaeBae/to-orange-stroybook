import type { Meta, StoryObj } from '@storybook/react';
import { Navbar } from '@/components/landing/components/Navbar';

const meta: Meta<typeof Navbar> = {
  title: 'Landing/Navbar',
  component: Navbar,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
