import type { Meta, StoryObj } from '@storybook/react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '화면 가장자리에서 슬라이드되어 나오는 패널 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">시트 열기</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>프로필 수정</SheetTitle>
          <SheetDescription>프로필 정보를 변경할 수 있습니다.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">이름</Label>
            <Input id="name" defaultValue="홍길동" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">이메일</Label>
            <Input id="email" defaultValue="hong@example.com" className="col-span-3" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">저장</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const SideRight: Story = {
  name: '오른쪽 (기본)',
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">오른쪽 시트</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>오른쪽 시트</SheetTitle>
          <SheetDescription>기본 방향입니다.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const SideLeft: Story = {
  name: '왼쪽',
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">왼쪽 시트</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>왼쪽 시트</SheetTitle>
          <SheetDescription>왼쪽에서 슬라이드됩니다.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const SideTop: Story = {
  name: '위쪽',
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">위쪽 시트</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>위쪽 시트</SheetTitle>
          <SheetDescription>위에서 슬라이드됩니다.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const SideBottom: Story = {
  name: '아래쪽',
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">아래쪽 시트</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>아래쪽 시트</SheetTitle>
          <SheetDescription>아래에서 슬라이드됩니다.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const AllSides: Story = {
  name: '모든 방향',
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline">{side}</Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>{side} 시트</SheetTitle>
              <SheetDescription>{side} 방향에서 열립니다.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
};
