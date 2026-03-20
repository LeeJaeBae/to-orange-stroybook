import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';

const meta = {
  title: 'UI/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '우클릭 시 나타나는 컨텍스트 메뉴 컴포넌트입니다. 아래 영역을 우클릭해보세요.',
      },
    },
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        우클릭하세요
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>
          편지 복사
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          편지 수정
          <ContextMenuShortcut>⌘E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          편지 삭제
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithCheckboxAndRadio: Story = {
  name: '체크박스 및 라디오',
  render: function CheckboxRadioDemo() {
    const [showPreview, setShowPreview] = React.useState(true);
    const [fontSize, setFontSize] = React.useState('medium');

    return (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          우클릭하세요
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuLabel>편지 설정</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked={showPreview} onCheckedChange={setShowPreview}>
            미리보기 표시
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>글자 크기</ContextMenuLabel>
          <ContextMenuRadioGroup value={fontSize} onValueChange={setFontSize}>
            <ContextMenuRadioItem value="small">작게</ContextMenuRadioItem>
            <ContextMenuRadioItem value="medium">보통</ContextMenuRadioItem>
            <ContextMenuRadioItem value="large">크게</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
};

export const WithSubMenu: Story = {
  name: '하위 메뉴',
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        우클릭하세요
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>새 편지 작성</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>편지지 변경</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>기본 편지지</ContextMenuItem>
            <ContextMenuItem>꽃무늬 편지지</ContextMenuItem>
            <ContextMenuItem>감성 편지지</ContextMenuItem>
            <ContextMenuItem>시즌 한정 편지지</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem disabled>보관함으로 이동 (준비 중)</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
