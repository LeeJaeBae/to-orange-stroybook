import type { Meta, StoryObj } from '@storybook/react';
import { GeneratingLoader } from '@/components/ui/GeneratingLoader';

const meta = {
  title: 'UI/GeneratingLoader',
  component: GeneratingLoader,
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'AI가 편지를 검토하는 동안 표시되는 로딩 애니메이션 컴포넌트입니다. 펄스, 회전, 반짝이는 효과가 포함되어 있습니다.',
      },
    },
  },
} satisfies Meta<typeof GeneratingLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InCard: Story = {
  name: '카드 내부',
  render: () => (
    <div className="w-[350px] rounded-lg border p-8 bg-white">
      <GeneratingLoader />
    </div>
  ),
};

export const FullPage: Story = {
  name: '전체 페이지',
  render: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-gradient-to-b from-white to-orange-50/30 rounded-lg">
      <GeneratingLoader />
    </div>
  ),
};

export const CustomClass: Story = {
  name: '커스텀 클래스',
  args: {
    className: 'p-8 bg-orange-50/50 rounded-xl',
  },
};
