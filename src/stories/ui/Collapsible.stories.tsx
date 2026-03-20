import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';

const meta = {
  title: 'UI/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '접었다 펼 수 있는 콜랩서블 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function CollapsibleDemo() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[350px] space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">발송 내역 (3건)</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">토글</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-3 text-sm">
          홍길동 - 서울구치소 (2026.03.15)
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 text-sm">
            김철수 - 인천구치소 (2026.03.10)
          </div>
          <div className="rounded-md border px-4 py-3 text-sm">
            이영희 - 수원구치소 (2026.03.05)
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const DefaultOpen: Story = {
  name: '기본 열림',
  render: () => (
    <Collapsible defaultOpen className="w-[350px] space-y-2">
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">편지지 옵션</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-3 text-sm">기본 편지지 - 무료</div>
        <div className="rounded-md border px-4 py-3 text-sm">꽃무늬 편지지 - 500원</div>
        <div className="rounded-md border px-4 py-3 text-sm">감성 편지지 - 800원</div>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const Multiple: Story = {
  name: '여러 개',
  render: function MultipleDemo() {
    const sections = [
      { title: '발신자 정보', items: ['이름: 홍길동', '주소: 서울시 강남구', '전화: 010-1234-5678'] },
      { title: '수신자 정보', items: ['이름: 김철수', '시설: 서울구치소', '수용번호: 2024-1234'] },
      { title: '발송 정보', items: ['우편 유형: 일반', '편지지: 감성 편지지', '매수: 3장'] },
    ];

    return (
      <div className="w-[350px] space-y-4">
        {sections.map((section) => (
          <Collapsible key={section.title} className="space-y-2">
            <div className="flex items-center justify-between px-4">
              <h4 className="text-sm font-semibold">{section.title}</h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-1">
              {section.items.map((item) => (
                <div key={item} className="rounded-md border px-4 py-2 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    );
  },
};
