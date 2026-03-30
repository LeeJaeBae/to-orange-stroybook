import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from '@/components/ui/toggle';
import { Bold, Italic, Underline } from 'lucide-react';

const meta: Meta<typeof Toggle> = {
  title: 'UI/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: { children: '토글 버튼' },
};

export const Outline: Story = {
  args: { children: '아웃라인', variant: 'outline' },
};

export const Pressed: Story = {
  args: { children: '활성', pressed: true },
};

export const WithIcon: Story = {
  render: () => (
    <Toggle aria-label="굵게">
      <Bold className="h-4 w-4" />
    </Toggle>
  ),
};

export const TextFormatting: Story = {
  render: () => (
    <div className="flex gap-1">
      <Toggle aria-label="굵게" pressed>
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

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle size="sm">작게</Toggle>
      <Toggle>기본</Toggle>
      <Toggle size="lg">크게</Toggle>
    </div>
  ),
};
