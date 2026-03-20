import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: '플레이스홀더 텍스트',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    rows: {
      control: 'number',
      description: '행 수',
    },
  },
  args: {
    placeholder: '내용을 입력하세요...',
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: '편지 내용을 입력하세요...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: '안녕하세요. 잘 지내고 계신지요.\n\n요즘 날씨가 많이 추워졌습니다.\n건강 잘 챙기세요.',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: '수정할 수 없는 내용입니다.',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">편지 내용</Label>
      <Textarea id="message" placeholder="편지 내용을 작성해주세요..." />
      <p className="text-sm text-muted-foreground">최대 2,000자까지 입력 가능합니다.</p>
    </div>
  ),
};

export const CustomRows: Story = {
  name: '높이 조절',
  render: () => (
    <div className="space-y-4">
      <div>
        <Label>3줄</Label>
        <Textarea rows={3} placeholder="짧은 메모..." />
      </div>
      <div>
        <Label>10줄</Label>
        <Textarea rows={10} placeholder="긴 편지 내용..." />
      </div>
    </div>
  ),
};

export const WithButton: Story = {
  name: '전송 버튼과 함께',
  render: () => (
    <div className="grid w-full gap-2">
      <Textarea placeholder="편지 내용을 입력하세요..." />
      <Button className="ml-auto">편지 보내기</Button>
    </div>
  ),
};
