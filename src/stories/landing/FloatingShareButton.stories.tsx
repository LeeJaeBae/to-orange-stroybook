import type { Meta, StoryObj } from '@storybook/react';
import FloatingShareButton from '@/components/landing/FloatingShareButton';

const meta = {
  title: 'Landing/FloatingShareButton',
  component: FloatingShareButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '300px', position: 'relative' }}>
        <p style={{ textAlign: 'center', color: '#999', paddingTop: '40px' }}>
          우측 하단의 공유 버튼을 확인하세요
        </p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FloatingShareButton>;

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
