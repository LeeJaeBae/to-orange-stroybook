import type { Meta, StoryObj } from '@storybook/react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';

const meta = {
  title: 'UI/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Embla Carousel 기반의 캐러셀 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-xs mx-auto">
      <Carousel>
        <CarouselContent>
          {Array.from({ length: 5 }, (_, i) => (
            <CarouselItem key={i}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-3xl font-semibold">편지지 {i + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const MultiplePerView: Story = {
  name: '한번에 여러 개',
  render: () => (
    <div className="w-full max-w-lg mx-auto">
      <Carousel opts={{ align: 'start' }}>
        <CarouselContent className="-ml-2">
          {Array.from({ length: 8 }, (_, i) => (
            <CarouselItem key={i} className="pl-2 basis-1/3">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-4">
                  <span className="text-sm font-medium">디자인 {i + 1}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const Vertical: Story = {
  name: '세로 방향',
  render: () => (
    <div className="mx-auto max-w-xs">
      <Carousel orientation="vertical" className="w-full max-w-xs">
        <CarouselContent className="-mt-1 h-[200px]">
          {Array.from({ length: 5 }, (_, i) => (
            <CarouselItem key={i} className="pt-1 basis-1/2">
              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <span className="text-2xl font-semibold">{i + 1}번째</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const StationeryPreview: Story = {
  name: '편지지 미리보기',
  render: () => (
    <div className="w-full max-w-sm mx-auto">
      <Carousel>
        <CarouselContent>
          {['꽃무늬', '감성 라인', '수채화', '심플 화이트', '시즌 한정'].map((name, i) => (
            <CarouselItem key={i}>
              <Card>
                <CardContent className="flex flex-col items-center justify-center aspect-[3/4] p-6 gap-2">
                  <div className="w-full h-full bg-gradient-to-br from-orange-50 to-amber-50 rounded-md flex items-center justify-center">
                    <span className="text-muted-foreground">{name} 편지지</span>
                  </div>
                  <p className="text-sm font-medium">{name}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};
