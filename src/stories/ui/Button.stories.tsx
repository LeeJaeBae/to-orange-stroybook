import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, ChevronRight, Plus, Download } from 'lucide-react';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: '버튼 스타일 변형',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: '버튼 크기',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    asChild: {
      control: 'boolean',
      description: 'Slot으로 렌더링',
    },
  },
  args: {
    children: '버튼',
    variant: 'default',
    size: 'default',
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '기본 버튼',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: '삭제',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: '아웃라인',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '보조 버튼',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: '고스트',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: '링크 버튼',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: '작은 버튼',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: '큰 버튼',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: <Plus className="h-4 w-4" />,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: '비활성화',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail className="h-4 w-4" />
        편지 보내기
      </>
    ),
  },
};

export const WithIconRight: Story = {
  args: {
    children: (
      <>
        다음 단계
        <ChevronRight className="h-4 w-4" />
      </>
    ),
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        처리 중...
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="default">기본</Button>
      <Button variant="destructive">삭제</Button>
      <Button variant="outline">아웃라인</Button>
      <Button variant="secondary">보조</Button>
      <Button variant="ghost">고스트</Button>
      <Button variant="link">링크</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  ),
};
