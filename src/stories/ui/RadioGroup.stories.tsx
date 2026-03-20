import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    defaultValue: {
      control: 'text',
      description: '기본 선택값',
    },
  },
  parameters: {
    docs: {
      description: {
        component: '여러 옵션 중 하나를 선택할 수 있는 라디오 그룹 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="normal">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="normal" id="normal" />
        <Label htmlFor="normal">일반 편지</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="express" id="express" />
        <Label htmlFor="express">빠른 편지</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="registered" id="registered" />
        <Label htmlFor="registered">등기 편지</Label>
      </div>
    </RadioGroup>
  ),
};

export const WithDescription: Story = {
  name: '설명 포함',
  render: () => (
    <RadioGroup defaultValue="a4">
      <div className="flex items-start space-x-2">
        <RadioGroupItem value="a4" id="a4" className="mt-1" />
        <div>
          <Label htmlFor="a4">A4 용지</Label>
          <p className="text-sm text-muted-foreground">표준 크기의 편지지입니다.</p>
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <RadioGroupItem value="letter" id="letter" className="mt-1" />
        <div>
          <Label htmlFor="letter">편지지</Label>
          <p className="text-sm text-muted-foreground">감성적인 디자인의 편지지입니다.</p>
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <RadioGroupItem value="postcard" id="postcard" className="mt-1" />
        <div>
          <Label htmlFor="postcard">엽서</Label>
          <p className="text-sm text-muted-foreground">짧은 인사를 전하기 좋은 엽서입니다.</p>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  name: '비활성화',
  render: () => (
    <RadioGroup defaultValue="normal" disabled>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="normal" id="d-normal" />
        <Label htmlFor="d-normal">일반 편지</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="express" id="d-express" />
        <Label htmlFor="d-express">빠른 편지</Label>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  name: '가로 배치',
  render: () => (
    <RadioGroup defaultValue="all" className="flex gap-4">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="all" id="h-all" />
        <Label htmlFor="h-all">전체</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="draft" id="h-draft" />
        <Label htmlFor="h-draft">작성 중</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="sent" id="h-sent" />
        <Label htmlFor="h-sent">발송 완료</Label>
      </div>
    </RadioGroup>
  ),
};
