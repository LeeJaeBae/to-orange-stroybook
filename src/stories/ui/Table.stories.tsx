import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const meta: Meta<typeof Table> = {
  title: 'UI/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Table>;

const letters = [
  {
    id: 'L001',
    recipient: '홍길동',
    facility: '서울구치소',
    date: '2024-03-15',
    status: '발송 완료',
    variant: 'default' as const,
  },
  {
    id: 'L002',
    recipient: '김철수',
    facility: '수원교도소',
    date: '2024-03-14',
    status: '처리 중',
    variant: 'secondary' as const,
  },
  {
    id: 'L003',
    recipient: '이영희',
    facility: '부산구치소',
    date: '2024-03-13',
    status: '초안',
    variant: 'outline' as const,
  },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>편지 발송 내역</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">편지 ID</TableHead>
          <TableHead>수신인</TableHead>
          <TableHead>시설</TableHead>
          <TableHead>작성일</TableHead>
          <TableHead className="text-right">상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {letters.map((letter) => (
          <TableRow key={letter.id}>
            <TableCell className="font-medium">{letter.id}</TableCell>
            <TableCell>{letter.recipient}</TableCell>
            <TableCell>{letter.facility}</TableCell>
            <TableCell>{letter.date}</TableCell>
            <TableCell className="text-right">
              <Badge variant={letter.variant}>{letter.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>총 편지 수</TableCell>
          <TableCell className="text-right">{letters.length}건</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Simple: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>항목</TableHead>
          <TableHead>수량</TableHead>
          <TableHead className="text-right">금액</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>편지 발송 (일반)</TableCell>
          <TableCell>2</TableCell>
          <TableCell className="text-right">5,000원</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>사진 첨부</TableCell>
          <TableCell>1</TableCell>
          <TableCell className="text-right">1,000원</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
