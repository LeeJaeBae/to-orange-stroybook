import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Slider } from '@/components/ui/slider';

const meta = {
  title: 'UI/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: 'object',
      description: '기본값 배열',
    },
    max: {
      control: 'number',
      description: '최대값',
    },
    min: {
      control: 'number',
      description: '최소값',
    },
    step: {
      control: 'number',
      description: '단계',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
  },
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
  },
  parameters: {
    docs: {
      description: {
        component: '범위 값을 선택할 수 있는 슬라이더 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    className: 'w-[300px]',
  },
};

export const WithLabel: Story = {
  name: '라벨 포함',
  render: function SliderWithLabel() {
    const [value, setValue] = React.useState([30]);
    return (
      <div className="w-[300px] space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">글자 크기</span>
          <span className="font-medium">{value[0]}pt</span>
        </div>
        <Slider value={value} onValueChange={setValue} max={72} min={8} step={1} />
      </div>
    );
  },
};

export const Range: Story = {
  name: '범위 선택',
  render: function SliderRange() {
    const [value, setValue] = React.useState([1000, 5000]);
    return (
      <div className="w-[300px] space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">가격 범위</span>
          <span className="font-medium">{value[0].toLocaleString()}원 ~ {value[1].toLocaleString()}원</span>
        </div>
        <Slider value={value} onValueChange={setValue} max={10000} min={0} step={500} />
      </div>
    );
  },
};

export const Disabled: Story = {
  name: '비활성화',
  args: {
    defaultValue: [50],
    max: 100,
    disabled: true,
    className: 'w-[300px]',
  },
};

export const Steps: Story = {
  name: '단계별',
  render: function StepSlider() {
    const [value, setValue] = React.useState([3]);
    const labels = ['1장', '2장', '3장', '4장', '5장'];
    return (
      <div className="w-[300px] space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">편지 매수</span>
          <span className="font-medium">{labels[value[0] - 1]}</span>
        </div>
        <Slider value={value} onValueChange={setValue} max={5} min={1} step={1} />
      </div>
    );
  },
};
