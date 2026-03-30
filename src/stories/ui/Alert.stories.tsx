import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Info as InfoIcon, Terminal } from 'lucide-react';

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>안내</AlertTitle>
      <AlertDescription>
        편지는 발송 후 2-3일 내에 해당 교정시설에 도착합니다.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>오류 발생</AlertTitle>
      <AlertDescription>
        결제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.
      </AlertDescription>
    </Alert>
  ),
};

export const InfoAlert: Story = {
  render: () => (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>알림</AlertTitle>
      <AlertDescription>
        수신인 정보를 정확히 입력해야 편지가 정상적으로 전달됩니다.
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert className="border-green-500 text-green-700">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <AlertTitle>편지 발송 완료</AlertTitle>
      <AlertDescription>
        편지가 성공적으로 접수되었습니다.
      </AlertDescription>
    </Alert>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>기본 알림</AlertTitle>
        <AlertDescription>기본 알림 메시지입니다.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>오류</AlertTitle>
        <AlertDescription>오류 알림 메시지입니다.</AlertDescription>
      </Alert>
    </div>
  ),
};
