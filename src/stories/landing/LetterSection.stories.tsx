import type { Meta, StoryObj } from '@storybook/react';
import { LetterSection } from '@/components/landing/sections/client/LetterSection';

const meta: Meta<typeof LetterSection> = {
  title: 'Landing/LetterSection',
  component: LetterSection,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof LetterSection>;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
