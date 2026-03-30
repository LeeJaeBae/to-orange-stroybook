import type { Meta, StoryObj } from '@storybook/react';
import { DeleteButton } from '@/components/ui/delete-button';

const meta: Meta<typeof DeleteButton> = {
  title: 'UI/DeleteButton',
  component: DeleteButton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof DeleteButton>;

export const Default: Story = {
  args: {
    onClick: () => alert('삭제 클릭'),
  },
};

export const InContext: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4 border rounded-md w-fit">
      <span className="text-sm">첨부된 사진</span>
      <div className="relative w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
        <span className="text-xs text-gray-500">사진.jpg</span>
        <div className="absolute -top-2 -right-2">
          <DeleteButton onClick={() => alert('사진 삭제')} />
        </div>
      </div>
    </div>
  ),
};

export const MultipleItems: Story = {
  render: () => (
    <div className="flex gap-4">
      {['사진1', '사진2', '사진3'].map((name) => (
        <div key={name} className="relative">
          <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-xs text-gray-500">{name}</span>
          </div>
          <div className="absolute -top-2 -right-2">
            <DeleteButton onClick={() => alert(`${name} 삭제`)} />
          </div>
        </div>
      ))}
    </div>
  ),
};
