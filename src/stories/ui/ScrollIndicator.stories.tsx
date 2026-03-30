import type { Meta, StoryObj } from '@storybook/react';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';

const meta: Meta<typeof ScrollIndicator> = {
  title: 'UI/ScrollIndicator',
  component: ScrollIndicator,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ScrollIndicator>;

export const Default: Story = {
  render: () => (
    <div className="relative">
      <ScrollIndicator />
      <div className="h-[300vh] p-8">
        <p className="text-muted-foreground">
          스크롤을 내리면 상단에 진행 표시줄이 나타납니다.
        </p>
        <div className="mt-[100vh] text-center text-muted-foreground">
          중간 지점
        </div>
        <div className="mt-[100vh] text-center text-muted-foreground">
          하단 지점
        </div>
      </div>
    </div>
  ),
};
