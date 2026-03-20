import type { Meta, StoryObj } from '@storybook/react';
import { toast, Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Toast',
  component: Toaster,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div>
        <Story />
        <Toaster />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Sonner 기반의 토스트 알림 컴포넌트입니다. 다양한 상태의 알림을 표시합니다.',
      },
    },
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast('편지가 저장되었습니다.')}
    >
      기본 토스트
    </Button>
  ),
};

export const Success: Story = {
  name: '성공',
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.success('편지가 성공적으로 발송되었습니다!')}
    >
      성공 토스트
    </Button>
  ),
};

export const Error: Story = {
  name: '에러',
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.error('편지 발송에 실패했습니다. 다시 시도해주세요.')}
    >
      에러 토스트
    </Button>
  ),
};

export const Info: Story = {
  name: '정보',
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.info('편지 인쇄가 시작되었습니다.')}
    >
      정보 토스트
    </Button>
  ),
};

export const Warning: Story = {
  name: '경고',
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.warning('편지 내용이 너무 깁니다. 일부가 잘릴 수 있습니다.')}
    >
      경고 토스트
    </Button>
  ),
};

export const WithDescription: Story = {
  name: '설명 포함',
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast('결제 완료', {
          description: '편지 발송을 위한 결제가 완료되었습니다. 곧 인쇄가 시작됩니다.',
        })
      }
    >
      설명 포함 토스트
    </Button>
  ),
};

export const WithAction: Story = {
  name: '액션 버튼 포함',
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast('편지가 삭제되었습니다.', {
          action: {
            label: '되돌리기',
            onClick: () => toast.success('편지가 복원되었습니다.'),
          },
        })
      }
    >
      액션 토스트
    </Button>
  ),
};

export const AllTypes: Story = {
  name: '모든 유형',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast('기본 메시지')}>기본</Button>
      <Button variant="outline" onClick={() => toast.success('성공 메시지')}>성공</Button>
      <Button variant="outline" onClick={() => toast.error('에러 메시지')}>에러</Button>
      <Button variant="outline" onClick={() => toast.info('정보 메시지')}>정보</Button>
      <Button variant="outline" onClick={() => toast.warning('경고 메시지')}>경고</Button>
    </div>
  ),
};
