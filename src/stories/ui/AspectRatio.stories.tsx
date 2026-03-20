import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const meta = {
  title: 'UI/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  argTypes: {
    ratio: {
      control: 'number',
      description: '가로세로 비율 (너비/높이)',
    },
  },
  parameters: {
    docs: {
      description: {
        component: '콘텐츠의 가로세로 비율을 유지하는 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
        <div className="flex h-full items-center justify-center text-muted-foreground">
          16:9 비율
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  name: '1:1 정사각형',
  render: () => (
    <div className="w-[200px]">
      <AspectRatio ratio={1} className="bg-muted rounded-md overflow-hidden">
        <div className="flex h-full items-center justify-center text-muted-foreground">
          1:1 비율
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Portrait: Story = {
  name: '3:4 세로',
  render: () => (
    <div className="w-[200px]">
      <AspectRatio ratio={3 / 4} className="bg-muted rounded-md overflow-hidden">
        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
          3:4 편지지 비율
        </div>
      </AspectRatio>
    </div>
  ),
};

export const AllRatios: Story = {
  name: '모든 비율',
  render: () => (
    <div className="flex flex-wrap gap-4 items-start">
      {[
        { ratio: 1, label: '1:1' },
        { ratio: 4 / 3, label: '4:3' },
        { ratio: 16 / 9, label: '16:9' },
        { ratio: 3 / 4, label: '3:4' },
        { ratio: 21 / 9, label: '21:9' },
      ].map(({ ratio, label }) => (
        <div key={label} className="w-[150px]">
          <AspectRatio ratio={ratio} className="bg-muted rounded-md overflow-hidden">
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {label}
            </div>
          </AspectRatio>
          <p className="text-xs text-center mt-1 text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  ),
};

export const WithImage: Story = {
  name: '이미지 포함',
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={16 / 9} className="bg-orange-50 rounded-md overflow-hidden">
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
          <div className="text-center">
            <p className="text-orange-600 font-semibold">편지 미리보기</p>
            <p className="text-sm text-orange-400">이미지 영역</p>
          </div>
        </div>
      </AspectRatio>
    </div>
  ),
};
