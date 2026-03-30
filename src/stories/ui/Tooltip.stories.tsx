import type { Meta, StoryObj } from '@storybook/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">툴팁 보기</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>수용번호는 교정시설 방문 시 부여됩니다</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithSide: Story = {
  render: () => (
    <div className="flex gap-8 justify-center items-center h-24">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">상단</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>상단 툴팁</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">우측</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>우측 툴팁</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">하단</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>하단 툴팁</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">좌측</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>좌측 툴팁</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const DelayedOpen: Story = {
  render: () => (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Button>0.5초 후 표시</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>지연 후 표시되는 툴팁</p>
      </TooltipContent>
    </Tooltip>
  ),
};
