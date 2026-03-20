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
import { Calculator, Calendar, CreditCard, Settings, User, Mail, Search } from 'lucide-react';

const meta = {
  title: 'UI/Command',
  component: Command,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '검색 가능한 커맨드 팔레트 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[400px]">
      <CommandInput placeholder="명령어를 검색하세요..." />
      <CommandList>
        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
        <CommandGroup heading="추천">
          <CommandItem>
            <Calendar className="mr-2 h-4 w-4" />
            <span>일정 확인</span>
          </CommandItem>
          <CommandItem>
            <Mail className="mr-2 h-4 w-4" />
            <span>새 편지 작성</span>
          </CommandItem>
          <CommandItem>
            <Search className="mr-2 h-4 w-4" />
            <span>수신자 검색</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="설정">
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>프로필</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>결제 수단</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>설정</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const FacilitySearch: Story = {
  name: '시설 검색',
  render: () => (
    <Command className="rounded-lg border shadow-md w-[400px]">
      <CommandInput placeholder="교정시설을 검색하세요..." />
      <CommandList>
        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
        <CommandGroup heading="서울/경기">
          <CommandItem>서울구치소</CommandItem>
          <CommandItem>서울남부구치소</CommandItem>
          <CommandItem>안양교도소</CommandItem>
          <CommandItem>수원구치소</CommandItem>
          <CommandItem>의정부교도소</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="충청">
          <CommandItem>대전교도소</CommandItem>
          <CommandItem>청주교도소</CommandItem>
          <CommandItem>충주교도소</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="전라">
          <CommandItem>광주교도소</CommandItem>
          <CommandItem>전주교도소</CommandItem>
          <CommandItem>목포교도소</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const WithCalculator: Story = {
  name: '요금 계산기',
  render: () => (
    <Command className="rounded-lg border shadow-md w-[350px]">
      <CommandInput placeholder="요금 항목을 검색하세요..." />
      <CommandList>
        <CommandEmpty>해당 항목을 찾을 수 없습니다.</CommandEmpty>
        <CommandGroup heading="편지 요금">
          <CommandItem>
            <Calculator className="mr-2 h-4 w-4" />
            <span>일반 편지 (A4 1장)</span>
            <CommandShortcut>3,500원</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Calculator className="mr-2 h-4 w-4" />
            <span>추가 페이지</span>
            <CommandShortcut>500원/장</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Calculator className="mr-2 h-4 w-4" />
            <span>사진 첨부</span>
            <CommandShortcut>1,000원/장</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="편지지 추가 요금">
          <CommandItem>
            <Calculator className="mr-2 h-4 w-4" />
            <span>꽃무늬 편지지</span>
            <CommandShortcut>500원</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Calculator className="mr-2 h-4 w-4" />
            <span>감성 편지지</span>
            <CommandShortcut>800원</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
