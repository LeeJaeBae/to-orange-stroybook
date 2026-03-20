import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const meta = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '로딩 상태를 표시하는 스피너 컴포넌트입니다. 오렌지 색상의 회전 아이콘을 표시합니다.',
      },
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InCard: Story = {
  name: '카드 내부',
  render: () => (
    <div className="w-[300px] rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold">편지 불러오는 중</h3>
      </div>
      <LoadingSpinner />
    </div>
  ),
};

export const FullPage: Story = {
  name: '전체 페이지',
  render: () => (
    <div className="h-[400px] w-full flex flex-col items-center justify-center bg-muted/30 rounded-lg">
      <LoadingSpinner />
      <p className="text-sm text-muted-foreground mt-2">데이터를 불러오고 있습니다...</p>
    </div>
  ),
};
