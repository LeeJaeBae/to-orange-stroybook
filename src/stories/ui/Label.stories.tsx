import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: { children: '수신인 이름' },
};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="name">수신인 이름</Label>
      <Input id="name" type="text" placeholder="홍길동" />
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
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="required">
        수용번호 <span className="text-destructive">*</span>
      </Label>
      <Input id="required" type="text" placeholder="필수 입력" />
    </div>
  ),
};
