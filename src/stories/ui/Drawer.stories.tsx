import type { Meta, StoryObj } from '@storybook/react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '화면 하단에서 올라오는 드로어 컴포넌트입니다. 모바일 환경에 최적화되어 있습니다.',
      },
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">드로어 열기</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>발송 방법 선택</DrawerTitle>
          <DrawerDescription>편지를 보낼 방법을 선택해주세요.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-3">
          <Button className="w-full" variant="outline">일반 우편 (3~5일)</Button>
          <Button className="w-full" variant="outline">빠른 우편 (1~2일)</Button>
          <Button className="w-full" variant="outline">등기 우편 (2~3일)</Button>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">취소</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const WithForm: Story = {
  name: '폼 포함',
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">수신자 추가</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>수신자 추가</DrawerTitle>
          <DrawerDescription>편지를 받을 수신자 정보를 입력해주세요.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">이름</label>
            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="수신자 이름" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">수용번호</label>
            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="수용번호를 입력하세요" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">시설</label>
            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="교정시설 검색" />
          </div>
        </div>
        <DrawerFooter>
          <Button>추가</Button>
          <DrawerClose asChild>
            <Button variant="outline">취소</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const Confirmation: Story = {
  name: '확인 드로어',
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="destructive">편지 삭제</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>편지를 삭제하시겠습니까?</DrawerTitle>
          <DrawerDescription>
            삭제된 편지는 복원할 수 없습니다. 정말 삭제하시겠습니까?
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button variant="destructive">삭제</Button>
          <DrawerClose asChild>
            <Button variant="outline">취소</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
