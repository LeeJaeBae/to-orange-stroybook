import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from '@/components/ui/menubar';

const meta = {
  title: 'UI/Menubar',
  component: Menubar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '데스크톱 애플리케이션 스타일의 메뉴바 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>파일</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            새 편지 <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            열기 <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            저장 <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            다른 이름으로 저장 <MenubarShortcut>⇧⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>인쇄</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>편집</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            실행 취소 <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            다시 실행 <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            잘라내기 <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            복사 <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            붙여넣기 <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>보기</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>미리보기</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>확대</MenubarItem>
          <MenubarItem>축소</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>도움말</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>이용 안내</MenubarItem>
          <MenubarItem>문의하기</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithCheckboxAndRadio: Story = {
  name: '체크박스 및 라디오',
  render: function MenubarDemo() {
    const [showToolbar, setShowToolbar] = React.useState(true);
    const [theme, setTheme] = React.useState('light');

    return (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>설정</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={showToolbar} onCheckedChange={setShowToolbar}>
              도구 모음 표시
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarLabel>테마</MenubarLabel>
            <MenubarRadioGroup value={theme} onValueChange={setTheme}>
              <MenubarRadioItem value="light">라이트</MenubarRadioItem>
              <MenubarRadioItem value="dark">다크</MenubarRadioItem>
              <MenubarRadioItem value="system">시스템</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
  },
};

export const WithSubMenu: Story = {
  name: '하위 메뉴',
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>편지</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>새 편지 쓰기</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>편지지 선택</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>기본 편지지</MenubarItem>
              <MenubarItem>꽃무늬 편지지</MenubarItem>
              <MenubarItem>감성 편지지</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem disabled>임시 저장 (0)</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};
