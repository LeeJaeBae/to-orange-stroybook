import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="선택하세요" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="letter">일반 편지</SelectItem>
        <SelectItem value="express">빠른 편지</SelectItem>
        <SelectItem value="photo">사진 편지</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  name: '그룹이 있는 셀렉트',
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="교정시설을 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>서울/경기</SelectLabel>
          <SelectItem value="seoul">서울구치소</SelectItem>
          <SelectItem value="anyang">안양교도소</SelectItem>
          <SelectItem value="suwon">수원구치소</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>충청</SelectLabel>
          <SelectItem value="daejeon">대전교도소</SelectItem>
          <SelectItem value="cheongju">청주교도소</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>경상</SelectLabel>
          <SelectItem value="busan">부산교도소</SelectItem>
          <SelectItem value="daegu">대구교도소</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label>편지 유형</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="유형을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="general">일반 편지</SelectItem>
          <SelectItem value="express">빠른 편지</SelectItem>
          <SelectItem value="premium">프리미엄 편지</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="비활성화됨" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">옵션 1</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithDefaultValue: Story = {
  name: '기본값 설정',
  render: () => (
    <Select defaultValue="letter">
      <SelectTrigger className="w-[240px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="letter">일반 편지</SelectItem>
        <SelectItem value="express">빠른 편지</SelectItem>
        <SelectItem value="photo">사진 편지</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const DisabledItems: Story = {
  name: '비활성화된 항목',
  render: () => (
    <Select>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="선택하세요" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="letter">일반 편지</SelectItem>
        <SelectItem value="express">빠른 편지</SelectItem>
        <SelectItem value="premium" disabled>프리미엄 (준비중)</SelectItem>
      </SelectContent>
    </Select>
  ),
};
