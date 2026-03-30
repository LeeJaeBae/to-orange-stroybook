import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">옵션 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">옵션 2</Label>
      </div>
    </RadioGroup>
  ),
};

export const LetterType: Story = {
  render: () => (
    <RadioGroup defaultValue="standard">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="standard" id="standard" />
          <Label htmlFor="standard">
            <span className="font-medium">일반 편지</span>
            <span className="ml-2 text-sm text-muted-foreground">2,500원</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="express" id="express" />
          <Label htmlFor="express">
            <span className="font-medium">빠른 편지</span>
            <span className="ml-2 text-sm text-muted-foreground">4,000원</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="photo" id="photo" />
          <Label htmlFor="photo">
            <span className="font-medium">사진 동봉</span>
            <span className="ml-2 text-sm text-muted-foreground">3,500원</span>
          </Label>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="r-one" />
        <Label htmlFor="r-one">활성 옵션</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="r-two" disabled />
        <Label htmlFor="r-two">비활성 옵션</Label>
      </div>
    </RadioGroup>
  ),
};
