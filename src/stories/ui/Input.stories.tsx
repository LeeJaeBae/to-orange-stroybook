import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: '텍스트를 입력하세요' },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="name">수신인 이름</Label>
      <Input id="name" type="text" placeholder="홍길동" />
    </div>
  ),
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: '이메일을 입력하세요',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: '비밀번호를 입력하세요',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: '비활성 입력란',
    disabled: true,
  },
};

export const WithFile: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="photo">사진 첨부</Label>
      <Input id="photo" type="file" />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <Input placeholder="기본 입력란" />
      <Input placeholder="이메일" type="email" />
      <Input placeholder="비밀번호" type="password" />
      <Input placeholder="비활성" disabled />
      <Input placeholder="읽기 전용" readOnly defaultValue="읽기 전용 텍스트" />
    </div>
  ),
};
