import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AddressSearch, type AddressResult } from '@/components/ui/AddressSearch';
import { fn } from '@storybook/test';

const meta = {
  title: 'UI/AddressSearch',
  component: AddressSearch,
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: '검색 입력 플레이스홀더',
    },
    compact: {
      control: 'boolean',
      description: '컴팩트 모드 (인라인 사용 시)',
    },
  },
  args: {
    onSelect: fn(),
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          '도로명주소 검색 컴포넌트입니다. 행정안전부 API를 사용합니다. Storybook에서는 실제 API 호출이 필요하므로 초기 상태만 확인할 수 있습니다.',
      },
    },
  },
} satisfies Meta<typeof AddressSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSelect: fn(),
  },
  render: (args) => (
    <div className="w-[400px]">
      <AddressSearch {...args} />
    </div>
  ),
};

export const Compact: Story = {
  name: '컴팩트 모드',
  args: {
    compact: true,
    onSelect: fn(),
  },
  render: (args) => (
    <div className="w-[350px]">
      <AddressSearch {...args} />
    </div>
  ),
};

export const CustomPlaceholder: Story = {
  name: '커스텀 플레이스홀더',
  args: {
    placeholder: '발신자 주소를 검색하세요',
    onSelect: fn(),
  },
  render: (args) => (
    <div className="w-[400px]">
      <AddressSearch {...args} />
    </div>
  ),
};

export const InDialog: Story = {
  name: '대화상자 내 사용',
  render: () => (
    <div className="w-[420px] rounded-lg border p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold">발신자 주소 검색</h3>
        <p className="text-xs text-muted-foreground">편지에 표시될 발신자 주소를 검색해주세요.</p>
      </div>
      <AddressSearch
        onSelect={(result: AddressResult) => {
          console.log('선택된 주소:', result);
        }}
        compact
      />
    </div>
  ),
};
