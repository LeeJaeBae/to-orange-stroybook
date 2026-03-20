import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const meta = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: '라벨 텍스트',
    },
    htmlFor: {
      control: 'text',
      description: '연결할 input의 id',
    },
  },
  args: {
    children: '라벨',
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '이름',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">이메일</Label>
      <Input type="email" id="email" placeholder="이메일을 입력하세요" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="agree" />
      <Label htmlFor="agree">이용약관에 동의합니다</Label>
    </div>
  ),
};

export const Required: Story = {
  name: '필수 항목',
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="required-name">
        이름 <span className="text-destructive">*</span>
      </Label>
      <Input id="required-name" placeholder="이름을 입력하세요" />
    </div>
  ),
};

export const DisabledState: Story = {
  name: '비활성화 상태',
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="disabled-input" className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        비활성화된 항목
      </Label>
      <Input id="disabled-input" disabled placeholder="수정 불가" />
    </div>
  ),
};
