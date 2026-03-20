import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Info as InfoIcon, Terminal } from 'lucide-react';

const meta = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: '알림 스타일 변형',
    },
  },
  args: {
    variant: 'default',
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>알림</AlertTitle>
      <AlertDescription>기본 알림 메시지입니다.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>오류</AlertTitle>
      <AlertDescription>문제가 발생했습니다. 다시 시도해주세요.</AlertDescription>
    </Alert>
  ),
};

export const InfoAlert: Story = {
  name: '정보 알림',
  render: () => (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>안내</AlertTitle>
      <AlertDescription>편지는 결제 후 영업일 기준 1~2일 내에 발송됩니다.</AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  name: '성공 알림',
  render: () => (
    <Alert>
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>성공</AlertTitle>
      <AlertDescription>편지가 성공적으로 발송되었습니다.</AlertDescription>
    </Alert>
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <Alert>
      <AlertTitle>제목만 있는 알림</AlertTitle>
      <AlertDescription>아이콘 없이 표시되는 알림입니다.</AlertDescription>
    </Alert>
  ),
};

export const TitleOnly: Story = {
  render: () => (
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>설명 없는 간단한 알림</AlertTitle>
    </Alert>
  ),
};
