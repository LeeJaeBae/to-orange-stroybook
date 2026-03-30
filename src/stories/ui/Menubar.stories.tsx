import type { Meta, StoryObj } from '@storybook/react';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from '@/components/ui/menubar';

const meta: Meta<typeof Menubar> = {
  title: 'UI/Menubar',
  component: Menubar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Menubar>;

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
            인쇄 <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>편집</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>
            실행 취소 <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            다시 실행 <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>찾기</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>찾기 <MenubarShortcut>⌘F</MenubarShortcut></MenubarItem>
              <MenubarItem>바꾸기 <MenubarShortcut>⌘H</MenubarShortcut></MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>보기</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>미리보기</MenubarCheckboxItem>
          <MenubarCheckboxItem>전체 화면</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel>글꼴 크기</MenubarLabel>
          <MenubarRadioGroup value="medium">
            <MenubarRadioItem value="small">작게</MenubarRadioItem>
            <MenubarRadioItem value="medium">보통</MenubarRadioItem>
            <MenubarRadioItem value="large">크게</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};
