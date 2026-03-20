import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '@/components/ui/separator';

const meta = {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: '구분선 방향',
    },
    decorative: {
      control: 'boolean',
      description: '장식용 여부 (접근성)',
    },
  },
  args: {
    orientation: 'horizontal',
    decorative: true,
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="space-y-1">
      <h4 className="text-sm font-medium leading-none">편지 서비스</h4>
      <p className="text-sm text-muted-foreground">교도소 편지 발송 서비스</p>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>편지 작성</div>
        <Separator orientation="vertical" />
        <div>결제</div>
        <Separator orientation="vertical" />
        <div>발송</div>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>홈</div>
      <Separator orientation="vertical" />
      <div>편지</div>
      <Separator orientation="vertical" />
      <div>설정</div>
    </div>
  ),
};

export const InContent: Story = {
  name: '콘텐츠 내 구분선',
  render: () => (
    <div className="w-[300px] space-y-4">
      <div>
        <h3 className="font-semibold">보낸 사람</h3>
        <p className="text-sm text-muted-foreground">홍길동</p>
      </div>
      <Separator />
      <div>
        <h3 className="font-semibold">받는 사람</h3>
        <p className="text-sm text-muted-foreground">김철수</p>
      </div>
      <Separator />
      <div>
        <h3 className="font-semibold">교정시설</h3>
        <p className="text-sm text-muted-foreground">서울구치소</p>
      </div>
    </div>
  ),
};
