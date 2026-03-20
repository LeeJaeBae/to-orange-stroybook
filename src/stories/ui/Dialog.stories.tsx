import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">다이얼로그 열기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
          <DialogDescription>
            프로필 정보를 수정합니다. 완료 후 저장 버튼을 클릭하세요.
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter>
          <Button type="submit">저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Simple: Story = {
  name: '간단한 다이얼로그',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>안내 보기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이용 안내</DialogTitle>
          <DialogDescription>
            편지는 결제 완료 후 영업일 기준 1~2일 내에 발송됩니다.
            발송 후 교정시설 도착까지 추가로 1~3일이 소요될 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>확인</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithLongContent: Story = {
  name: '긴 내용',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">이용약관</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>이용약관</DialogTitle>
          <DialogDescription>
            서비스 이용 전 약관을 확인해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p>제1조 (목적) 이 약관은 투 오렌지 서비스의 이용조건 및 절차에 관한 사항을 규정합니다.</p>
          <p>제2조 (정의) 서비스란 회사가 제공하는 편지 발송 서비스를 의미합니다.</p>
          <p>제3조 (약관의 효력) 이 약관은 서비스를 이용하고자 하는 모든 회원에게 적용됩니다.</p>
          <p>제4조 (서비스의 제공) 회사는 편지 작성, 결제, 인쇄, 발송 서비스를 제공합니다.</p>
          <p>제5조 (이용 요금) 서비스 이용 요금은 별도로 공지된 요금표에 따릅니다.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">닫기</Button>
          </DialogClose>
          <Button>동의</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
