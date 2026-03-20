import type { Meta, StoryObj } from '@storybook/react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const meta = {
  title: 'UI/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: '선택 유형 (단일/다중)',
    },
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      description: '스타일 변형',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: '크기',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
  },
  args: {
    type: 'multiple',
    variant: 'default',
    size: 'default',
  },
  parameters: {
    docs: {
      description: {
        component: '여러 토글을 그룹으로 묶어 사용하는 토글 그룹 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'multiple',
    children: (
      <>
        <ToggleGroupItem value="bold" aria-label="굵게">
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="기울임">
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="밑줄">
          <Underline className="h-4 w-4" />
        </ToggleGroupItem>
      </>
    ),
  },
};

export const SingleSelection: Story = {
  name: '단일 선택',
  render: () => (
    <ToggleGroup type="single" defaultValue="center">
      <ToggleGroupItem value="left" aria-label="왼쪽 정렬">
        <AlignLeft className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="가운데 정렬">
        <AlignCenter className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="오른쪽 정렬">
        <AlignRight className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const OutlineVariant: Story = {
  name: '아웃라인 변형',
  render: () => (
    <ToggleGroup type="single" variant="outline" defaultValue="normal">
      <ToggleGroupItem value="normal">일반</ToggleGroupItem>
      <ToggleGroupItem value="express">빠른</ToggleGroupItem>
      <ToggleGroupItem value="registered">등기</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Sizes: Story = {
  name: '크기 비교',
  render: () => (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Small</p>
        <ToggleGroup type="single" size="sm" defaultValue="a">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
          <ToggleGroupItem value="c">C</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Default</p>
        <ToggleGroup type="single" size="default" defaultValue="a">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
          <ToggleGroupItem value="c">C</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Large</p>
        <ToggleGroup type="single" size="lg" defaultValue="a">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
          <ToggleGroupItem value="c">C</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  name: '비활성화',
  render: () => (
    <ToggleGroup type="single" disabled defaultValue="a">
      <ToggleGroupItem value="a">A</ToggleGroupItem>
      <ToggleGroupItem value="b">B</ToggleGroupItem>
      <ToggleGroupItem value="c">C</ToggleGroupItem>
    </ToggleGroup>
  ),
};
