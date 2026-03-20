import type { Meta, StoryObj } from '@storybook/react';
import { DeleteButton } from '@/components/ui/delete-button';
import { fn } from '@storybook/test';

const meta = {
  title: 'UI/DeleteButton',
  component: DeleteButton,
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
  args: {
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        component: '호버 시 확장되는 애니메이션 삭제 버튼 컴포넌트입니다. 마우스를 올려보세요.',
      },
    },
  },
} satisfies Meta<typeof DeleteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InContext: Story = {
  name: '컨텍스트 내 사용',
  render: () => (
    <div className="space-y-3 w-[300px]">
      {['홍길동 - 서울구치소', '김철수 - 인천구치소', '이영희 - 수원구치소'].map((item) => (
        <div key={item} className="flex items-center justify-between rounded-md border p-3">
          <span className="text-sm">{item}</span>
          <DeleteButton onClick={(e) => { e.stopPropagation(); }} />
        </div>
      ))}
    </div>
  ),
};

export const CustomClass: Story = {
  name: '커스텀 스타일',
  args: {
    className: 'shadow-lg',
  },
};
