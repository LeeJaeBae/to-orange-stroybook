import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Plus, Info, HelpCircle } from 'lucide-react';

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">마우스를 올려보세요</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>툴팁 내용입니다</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>새 편지 작성</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const Sides: Story = {
  name: '방향별 툴팁',
  render: () => (
    <div className="flex items-center justify-center gap-8 p-12">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">위</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>위쪽 툴팁</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">아래</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>아래쪽 툴팁</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">왼쪽</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>왼쪽 툴팁</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">오른쪽</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>오른쪽 툴팁</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const HelpTooltip: Story = {
  name: '도움말 툴팁',
  render: () => (
    <div className="flex items-center gap-2">
      <span className="text-sm">수번</span>
      <Tooltip>
        <TooltipTrigger>
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          <p>수용자에게 부여된 고유 번호입니다</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};
