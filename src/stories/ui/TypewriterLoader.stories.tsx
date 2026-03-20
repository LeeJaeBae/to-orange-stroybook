import type { Meta, StoryObj } from '@storybook/react';
import { TypewriterLoader } from '@/components/ui/typewriter-loader';

const meta = {
  title: 'UI/TypewriterLoader',
  component: TypewriterLoader,
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
        component: '타자기 모양의 로딩 애니메이션 컴포넌트입니다. 편지 작성 관련 로딩에 사용됩니다.',
      },
    },
  },
} satisfies Meta<typeof TypewriterLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithMessage: Story = {
  name: '메시지 포함',
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8">
      <TypewriterLoader />
      <p className="text-sm text-muted-foreground">편지를 준비하고 있습니다...</p>
    </div>
  ),
};

export const InCard: Story = {
  name: '카드 내부',
  render: () => (
    <div className="w-[300px] rounded-lg border p-6 flex flex-col items-center gap-3">
      <TypewriterLoader />
      <div className="text-center">
        <p className="text-sm font-medium">편지 인쇄 중</p>
        <p className="text-xs text-muted-foreground">잠시만 기다려주세요</p>
      </div>
    </div>
  ),
};

export const CustomClass: Story = {
  name: '커스텀 크기',
  args: {
    className: 'scale-150',
  },
};
