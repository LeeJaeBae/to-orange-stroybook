import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: '활성화 상태',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="notifications" />
      <Label htmlFor="notifications">알림 받기</Label>
    </div>
  ),
};

export const SettingsList: Story = {
  name: '설정 목록',
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div className="flex items-center justify-between">
        <div>
          <Label>이메일 알림</Label>
          <p className="text-sm text-muted-foreground">편지 발송 상태를 이메일로 받습니다.</p>
        </div>
        <Switch defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label>SMS 알림</Label>
          <p className="text-sm text-muted-foreground">편지 발송 상태를 SMS로 받습니다.</p>
        </div>
        <Switch />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-muted-foreground">푸시 알림</Label>
          <p className="text-sm text-muted-foreground">준비 중인 기능입니다.</p>
        </div>
        <Switch disabled />
      </div>
    </div>
  ),
};
