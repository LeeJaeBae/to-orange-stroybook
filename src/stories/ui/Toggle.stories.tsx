import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from '@/components/ui/toggle';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      description: '토글 스타일 변형',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: '토글 크기',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    pressed: {
      control: 'boolean',
      description: '눌린 상태',
    },
  },
  args: {
    variant: 'default',
    size: 'default',
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Bold className="h-4 w-4" />,
    'aria-label': '굵게',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: <Italic className="h-4 w-4" />,
    'aria-label': '기울임',
  },
};

export const WithText: Story = {
  args: {
    children: (
      <>
        <Bold className="h-4 w-4" />
        굵게
      </>
    ),
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: <Bold className="h-4 w-4" />,
    'aria-label': '굵게',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: <Bold className="h-4 w-4" />,
    'aria-label': '굵게',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: <Bold className="h-4 w-4" />,
    'aria-label': '굵게',
  },
};

export const Pressed: Story = {
  args: {
    defaultPressed: true,
    children: <Bold className="h-4 w-4" />,
    'aria-label': '굵게',
  },
};

export const TextFormatting: Story = {
  name: '텍스트 서식 도구',
  render: () => (
    <div className="flex items-center gap-1">
      <Toggle aria-label="굵게" defaultPressed>
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="기울임">
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="밑줄">
        <Underline className="h-4 w-4" />
      </Toggle>
    </div>
  ),
};

export const Alignment: Story = {
  name: '정렬 도구',
  render: () => (
    <div className="flex items-center gap-1">
      <Toggle variant="outline" aria-label="왼쪽 정렬" defaultPressed>
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle variant="outline" aria-label="가운데 정렬">
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle variant="outline" aria-label="오른쪽 정렬">
        <AlignRight className="h-4 w-4" />
      </Toggle>
    </div>
  ),
};

export const AllSizes: Story = {
  name: '모든 크기',
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle size="sm" aria-label="작은 토글">
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="default" aria-label="기본 토글">
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="lg" aria-label="큰 토글">
        <Bold className="h-4 w-4" />
      </Toggle>
    </div>
  ),
};
