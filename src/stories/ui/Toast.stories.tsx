import type { Meta, StoryObj } from '@storybook/react';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from '@/components/ui/toast';

const meta: Meta<typeof Toast> = {
  title: 'UI/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <Toast>
        <div className="grid gap-1">
          <ToastTitle>편지 저장 완료</ToastTitle>
          <ToastDescription>편지가 임시 저장되었습니다.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  ),
};

export const Destructive: Story = {
  render: () => (
    <ToastProvider>
      <Toast variant="destructive">
        <div className="grid gap-1">
          <ToastTitle>오류 발생</ToastTitle>
          <ToastDescription>편지 발송에 실패했습니다. 다시 시도해 주세요.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  ),
};

export const WithAction: Story = {
  render: () => (
    <ToastProvider>
      <Toast>
        <div className="grid gap-1">
          <ToastTitle>편지 삭제</ToastTitle>
          <ToastDescription>편지가 삭제되었습니다.</ToastDescription>
        </div>
        <ToastAction altText="취소">취소</ToastAction>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  ),
};
