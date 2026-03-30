import type { Meta, StoryObj } from '@storybook/react';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const meta: Meta<typeof Toaster> = {
  title: 'UI/Sonner',
  component: Toaster,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div>
        <Story />
        <Toaster />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button
        variant="outline"
        onClick={() => toast('알림 메시지입니다.')}
      >
        기본 알림
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.success('편지가 성공적으로 발송되었습니다.')}
      >
        성공 알림
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.error('편지 발송에 실패했습니다.')}
      >
        오류 알림
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning('주의: 편지 내용을 확인해 주세요.')}
      >
        경고 알림
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.info('편지가 접수되어 처리 중입니다.')}
      >
        정보 알림
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.loading('편지를 발송하는 중...')
        }
      >
        로딩 알림
      </Button>
    </div>
  ),
};
