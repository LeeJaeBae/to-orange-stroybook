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

const meta = {
  title: 'UI/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '데이터를 행과 열로 표시하는 테이블 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const letters = [
  { id: 'LTR001', recipient: '홍길동', facility: '서울구치소', status: '발송 완료', date: '2026-03-15', price: '3,500원' },
  { id: 'LTR002', recipient: '김철수', facility: '인천구치소', status: '인쇄 중', date: '2026-03-16', price: '4,200원' },
  { id: 'LTR003', recipient: '이영희', facility: '수원구치소', status: '결제 완료', date: '2026-03-17', price: '3,500원' },
  { id: 'LTR004', recipient: '박민수', facility: '대전교도소', status: '작성 중', date: '2026-03-18', price: '5,000원' },
  { id: 'LTR005', recipient: '최지은', facility: '광주교도소', status: '발송 완료', date: '2026-03-19', price: '3,500원' },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>최근 편지 발송 내역</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">편지번호</TableHead>
          <TableHead>수신자</TableHead>
          <TableHead>수용시설</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>날짜</TableHead>
          <TableHead className="text-right">금액</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {letters.map((letter) => (
          <TableRow key={letter.id}>
            <TableCell className="font-medium">{letter.id}</TableCell>
            <TableCell>{letter.recipient}</TableCell>
            <TableCell>{letter.facility}</TableCell>
            <TableCell>{letter.status}</TableCell>
            <TableCell>{letter.date}</TableCell>
            <TableCell className="text-right">{letter.price}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5}>합계</TableCell>
          <TableCell className="text-right">19,700원</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Simple: Story = {
  name: '심플 테이블',
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead>관계</TableHead>
          <TableHead>시설</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>홍길동</TableCell>
          <TableCell>친구</TableCell>
          <TableCell>서울구치소</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>김철수</TableCell>
          <TableCell>가족</TableCell>
          <TableCell>인천구치소</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const Empty: Story = {
  name: '빈 테이블',
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>편지번호</TableHead>
          <TableHead>수신자</TableHead>
          <TableHead>상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
            발송 내역이 없습니다.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const Striped: Story = {
  name: '줄무늬 테이블',
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>시설명</TableHead>
          <TableHead>주소</TableHead>
          <TableHead>유형</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          { name: '서울구치소', addr: '경기도 의왕시', type: '구치소' },
          { name: '인천구치소', addr: '인천광역시 미추홀구', type: '구치소' },
          { name: '수원구치소', addr: '경기도 수원시', type: '구치소' },
          { name: '대전교도소', addr: '대전광역시 유성구', type: '교도소' },
        ].map((f, i) => (
          <TableRow key={f.name} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
            <TableCell className="font-medium">{f.name}</TableCell>
            <TableCell>{f.addr}</TableCell>
            <TableCell>{f.type}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
