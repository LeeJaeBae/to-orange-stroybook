import type { Meta, StoryObj } from '@storybook/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '트리거 요소 근처에 떠 있는 팝오버 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">팝오버 열기</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">크기 설정</h4>
            <p className="text-sm text-muted-foreground">레이아웃 크기를 설정합니다.</p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">너비</Label>
              <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">높이</Label>
              <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const AlignStart: Story = {
  name: '시작 정렬',
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">시작 정렬</Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <p className="text-sm">시작 정렬된 팝오버입니다.</p>
      </PopoverContent>
    </Popover>
  ),
};

export const AlignEnd: Story = {
  name: '끝 정렬',
  render: () => (
    <div className="flex justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">끝 정렬</Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          <p className="text-sm">끝 정렬된 팝오버입니다.</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const WithCustomWidth: Story = {
  name: '커스텀 너비',
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">넓은 팝오버</Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-2">
          <h4 className="font-medium">편지 미리보기</h4>
          <p className="text-sm text-muted-foreground">
            안녕하세요, 잘 지내고 계신가요? 요즘 날씨가 많이 추워졌는데 건강 잘 챙기세요.
            다음에 면회 갈 때 따뜻한 옷을 가져다 드릴게요.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
