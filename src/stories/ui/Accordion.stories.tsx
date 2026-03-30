import type { Meta, StoryObj } from '@storybook/react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const meta: Meta<typeof Accordion> = {
  title: 'UI/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>자주 묻는 질문 1</AccordionTrigger>
        <AccordionContent>
          교도소 편지 서비스에 대한 자세한 안내입니다. 편지는 접수 후 2-3일 내에 발송됩니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>자주 묻는 질문 2</AccordionTrigger>
        <AccordionContent>
          사진 첨부는 최대 3장까지 가능하며, 각 사진의 크기는 10MB 이하여야 합니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>자주 묻는 질문 3</AccordionTrigger>
        <AccordionContent>
          편지 발송 후 취소는 불가능합니다. 신중하게 작성해 주세요.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>편지 작성 방법</AccordionTrigger>
        <AccordionContent>
          편지 작성 시 수신인의 이름, 수용번호, 시설명을 정확히 기입해야 합니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>결제 방법</AccordionTrigger>
        <AccordionContent>
          신용카드, 체크카드, 계좌이체 등 다양한 결제 방법을 지원합니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
