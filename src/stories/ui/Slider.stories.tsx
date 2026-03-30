import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof Slider> = {
  title: 'UI/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div className="space-y-2">
        <Label>글꼴 크기</Label>
        <Slider defaultValue={[14]} min={10} max={24} step={1} />
      </div>
    </div>
  ),
};

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    max: 100,
    step: 1,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="w-[300px] space-y-6">
      <div className="space-y-2">
        <Label>기본 (50%)</Label>
        <Slider defaultValue={[50]} />
      </div>
      <div className="space-y-2">
        <Label>0%</Label>
        <Slider defaultValue={[0]} />
      </div>
      <div className="space-y-2">
        <Label>100%</Label>
        <Slider defaultValue={[100]} />
      </div>
      <div className="space-y-2">
        <Label>비활성</Label>
        <Slider defaultValue={[50]} disabled />
      </div>
    </div>
  ),
};
