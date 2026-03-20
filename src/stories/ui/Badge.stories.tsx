import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: '배지 스타일 변형',
    },
  },
  args: {
    children: '배지',
    variant: 'default',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '기본',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '보조',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: '위험',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: '아웃라인',
  },
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>
        <Check className="mr-1 h-3 w-3" />
        완료
      </Badge>
      <Badge variant="destructive">
        <X className="mr-1 h-3 w-3" />
        실패
      </Badge>
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" />
        대기중
      </Badge>
      <Badge variant="outline">
        <AlertCircle className="mr-1 h-3 w-3" />
        알림
      </Badge>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">기본</Badge>
      <Badge variant="secondary">보조</Badge>
      <Badge variant="destructive">위험</Badge>
      <Badge variant="outline">아웃라인</Badge>
    </div>
  ),
};

export const LetterStatus: Story = {
  name: '편지 상태 배지',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">임시저장</Badge>
      <Badge variant="default">결제완료</Badge>
      <Badge variant="outline">처리중</Badge>
      <Badge>
        <Check className="mr-1 h-3 w-3" />
        발송완료
      </Badge>
      <Badge variant="destructive">취소됨</Badge>
    </div>
  ),
};
