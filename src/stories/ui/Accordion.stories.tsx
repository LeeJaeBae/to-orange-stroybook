import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: '단일/다중 열기 모드',
    },
    collapsible: {
      control: 'boolean',
      description: 'single 모드에서 모두 닫기 허용',
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>편지는 어떻게 보내나요?</AccordionTrigger>
        <AccordionContent>
          편지를 작성한 후 결제를 완료하면, 저희가 인쇄하여 해당 교정시설로 발송합니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>배송은 얼마나 걸리나요?</AccordionTrigger>
        <AccordionContent>
          결제 완료 후 영업일 기준 1~2일 내에 발송되며, 교정시설 도착까지 추가로 1~3일 소요됩니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>사진을 첨부할 수 있나요?</AccordionTrigger>
        <AccordionContent>
          네, 편지 작성 시 사진을 첨부할 수 있습니다. 최대 5장까지 첨부 가능합니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  name: '다중 열기',
  render: () => (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>서비스 소개</AccordionTrigger>
        <AccordionContent>
          투 오렌지는 교도소에 수감된 가족에게 편지를 보낼 수 있는 서비스입니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>이용 요금</AccordionTrigger>
        <AccordionContent>
          기본 편지 발송 요금은 1통당 3,000원이며, 사진 첨부 시 추가 요금이 발생합니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>환불 정책</AccordionTrigger>
        <AccordionContent>
          발송 전 취소 시 전액 환불되며, 발송 후에는 환불이 불가합니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const DefaultOpen: Story = {
  name: '기본 열림 상태',
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>처음부터 열려있는 항목</AccordionTrigger>
        <AccordionContent>
          이 항목은 기본적으로 열려있습니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>닫혀있는 항목</AccordionTrigger>
        <AccordionContent>
          이 항목은 클릭해야 열립니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
