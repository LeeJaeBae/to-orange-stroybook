import type { Meta, StoryObj } from '@storybook/react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Calendar, CreditCard, Settings, User } from 'lucide-react';

const meta: Meta<typeof Command> = {
  title: 'UI/Command',
  component: Command,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Command>;

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[350px]">
      <CommandInput placeholder="명령어 검색..." />
      <CommandList>
        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
        <CommandGroup heading="제안">
          <CommandItem>
            <Calendar className="mr-2 h-4 w-4" />
            <span>일정</span>
          </CommandItem>
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>프로필</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="설정">
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>설정</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>결제 정보</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const WithSearch: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[350px]">
      <CommandInput placeholder="교정시설 검색..." />
      <CommandList>
        <CommandEmpty>해당 시설을 찾을 수 없습니다.</CommandEmpty>
        <CommandGroup heading="서울">
          <CommandItem>서울구치소</CommandItem>
          <CommandItem>서울남부교도소</CommandItem>
          <CommandItem>서울동부구치소</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="경기">
          <CommandItem>수원구치소</CommandItem>
          <CommandItem>수원교도소</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
