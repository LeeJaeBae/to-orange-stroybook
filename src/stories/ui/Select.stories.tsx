import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="선택하세요" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">옵션 1</SelectItem>
        <SelectItem value="option2">옵션 2</SelectItem>
        <SelectItem value="option3">옵션 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const FacilitySelect: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label>교정시설 선택</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="시설을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>서울</SelectLabel>
            <SelectItem value="seoul-detention">서울구치소</SelectItem>
            <SelectItem value="seoul-south">서울남부교도소</SelectItem>
            <SelectItem value="seoul-east">서울동부구치소</SelectItem>
            <SelectItem value="seoul-north">서울북부교도소</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>경기</SelectLabel>
            <SelectItem value="suwon-detention">수원구치소</SelectItem>
            <SelectItem value="suwon-prison">수원교도소</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>부산</SelectLabel>
            <SelectItem value="busan-detention">부산구치소</SelectItem>
            <SelectItem value="busan-prison">부산교도소</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="비활성 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">옵션 1</SelectItem>
      </SelectContent>
    </Select>
  ),
};
