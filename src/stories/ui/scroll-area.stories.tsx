import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const meta: Meta<typeof ScrollArea> = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

const tags = [
  '서울구치소',
  '서울남부교도소',
  '서울동부구치소',
  '서울북부교도소',
  '수원구치소',
  '수원교도소',
  '인천구치소',
  '인천교도소',
  '부산구치소',
  '부산교도소',
  '대구교도소',
  '광주교도소',
  '대전교도소',
  '울산구치소',
];

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">교정시설 목록</h4>
        {tags.map((tag) => (
          <div key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const HorizontalScroll: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="flex h-24 w-24 flex-col items-center justify-center rounded-md border bg-muted text-sm"
          >
            편지지 {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
