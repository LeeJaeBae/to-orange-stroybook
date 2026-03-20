import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const meta = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '커스텀 스크롤바가 있는 스크롤 영역 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const facilities = [
  '서울구치소',
  '서울남부구치소',
  '인천구치소',
  '수원구치소',
  '안양교도소',
  '의정부교도소',
  '춘천교도소',
  '원주교도소',
  '강릉교도소',
  '대전교도소',
  '청주교도소',
  '충주교도소',
  '공주교도소',
  '홍성교도소',
  '전주교도소',
  '군산교도소',
  '정읍교도소',
  '광주교도소',
  '목포교도소',
  '해남교도소',
];

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">교정시설 목록</h4>
        {facilities.map((facility) => (
          <div key={facility}>
            <div className="text-sm">{facility}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  name: '가로 스크롤',
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="shrink-0 w-32 h-40 rounded-md bg-muted flex items-center justify-center"
          >
            <span className="text-sm text-muted-foreground">편지지 {i + 1}</span>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

export const LongContent: Story = {
  name: '긴 텍스트 콘텐츠',
  render: () => (
    <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
      <div className="space-y-4 text-sm">
        <p>
          안녕하세요, 오랜만에 편지를 씁니다. 요즘 날씨가 많이 추워졌는데 건강은 잘 챙기고 계신가요?
        </p>
        <p>
          저는 요즘 새로운 취미를 시작했어요. 매일 아침 일찍 일어나서 산책을 하고 있는데,
          공기가 맑아서 기분이 정말 좋아요. 특히 단풍이 물들기 시작하면서 경치가 아주 예뻐요.
        </p>
        <p>
          지난주에는 가족들과 함께 모여서 식사를 했어요. 모두 건강하고 잘 지내고 있으니 걱정하지 마세요.
          아이들도 학교에서 잘 적응하고 있고, 부모님도 건강하세요.
        </p>
        <p>
          다음 면회 때 좋아하시는 책을 가져다 드릴게요. 읽고 싶은 책이 있으면 편지로 알려주세요.
          항상 응원하고 있습니다.
        </p>
        <p>
          따뜻하게 지내시고, 곧 또 소식 전할게요. 사랑합니다.
        </p>
      </div>
    </ScrollArea>
  ),
};
