import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>편지 작성</CardTitle>
        <CardDescription>수용자에게 편지를 보내세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">편지 내용을 입력하고 발송하면 2-3일 내에 전달됩니다.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button>발송하기</Button>
        <Button variant="outline">임시저장</Button>
      </CardFooter>
    </Card>
  ),
};

export const LetterCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>홍길동에게</CardTitle>
          <Badge variant="secondary">초안</Badge>
        </div>
        <CardDescription>서울구치소 · 수용번호: 12345</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          사랑하는 아버지께, 건강하게 잘 지내고 계신지요? 저희 가족 모두 잘 있습니다...
        </p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        마지막 수정: 2024년 3월 15일
      </CardFooter>
    </Card>
  ),
};

export const SimpleCard: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardContent className="pt-6">
        <p>카드 내용만 있는 간단한 카드입니다.</p>
      </CardContent>
    </Card>
  ),
};
