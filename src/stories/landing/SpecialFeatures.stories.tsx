import type { Meta, StoryObj } from '@storybook/react';
import SpecialFeatures from '@/components/landing/SpecialFeatures';

const meta = {
  title: 'Landing/SpecialFeatures',
  component: SpecialFeatures,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      // SpecialFeatures는 관리자 전용으로 apiFetch로 role 확인 후 렌더링함
      // mock에서 apiFetch가 빈 응답을 줄 수 있으므로 참고
      return <Story />;
    },
  ],
} satisfies Meta<typeof SpecialFeatures>;

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
