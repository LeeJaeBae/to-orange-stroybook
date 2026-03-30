import type { Meta, StoryObj } from '@storybook/react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof Sheet> = {
  title: 'UI/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">시트 열기</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>수신인 정보 편집</SheetTitle>
          <SheetDescription>
            수신인 정보를 수정하세요. 완료 후 저장 버튼을 클릭하세요.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sheet-name" className="text-right">
              이름
            </Label>
            <Input id="sheet-name" defaultValue="홍길동" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sheet-facility" className="text-right">
              시설
            </Label>
            <Input id="sheet-facility" defaultValue="서울구치소" className="col-span-3" />
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

export const LeftSide: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">왼쪽에서 열기</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>탐색 메뉴</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-2">
          <div className="text-sm font-medium hover:text-primary cursor-pointer">홈</div>
          <div className="text-sm font-medium hover:text-primary cursor-pointer">편지 작성</div>
          <div className="text-sm font-medium hover:text-primary cursor-pointer">발송 내역</div>
          <div className="text-sm font-medium hover:text-primary cursor-pointer">설정</div>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const BottomSheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">하단에서 열기</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>편지 옵션</SheetTitle>
          <SheetDescription>발송할 편지의 옵션을 선택해 주세요.</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">옵션 목록이 여기에 표시됩니다.</p>
        </div>
      </SheetContent>
    </Sheet>
  ),
};
