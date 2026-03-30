import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: '내용을 입력하세요',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="letter">편지 내용</Label>
      <Textarea
        placeholder="편지 내용을 입력해 주세요."
        id="letter"
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: '비활성 텍스트 영역',
    disabled: true,
  },
};

export const WithContent: Story = {
  args: {
    defaultValue: '사랑하는 아버지께,\n\n건강하게 잘 지내고 계신지요?\n저희 가족 모두 잘 있습니다.',
    rows: 6,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <Textarea placeholder="기본 텍스트 영역" />
      <Textarea placeholder="비활성" disabled />
      <Textarea
        placeholder="읽기 전용"
        readOnly
        defaultValue="읽기 전용 내용입니다."
      />
    </div>
  ),
};
