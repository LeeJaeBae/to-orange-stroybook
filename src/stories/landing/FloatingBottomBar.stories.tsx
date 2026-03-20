import type { Meta, StoryObj } from '@storybook/react';
import FloatingBottomBar from '@/components/landing/FloatingBottomBar';

const meta = {
  title: 'Landing/FloatingBottomBar',
  component: FloatingBottomBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '200vh', paddingTop: '80vh' }}>
        <p style={{ textAlign: 'center', color: '#999' }}>
          스크롤하여 하단 바 동작을 확인하세요
        </p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FloatingBottomBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
