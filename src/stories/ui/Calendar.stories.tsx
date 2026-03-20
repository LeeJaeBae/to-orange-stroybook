import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Calendar } from '@/components/ui/calendar';

const meta = {
  title: 'UI/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'react-day-picker 기반의 달력 컴포넌트입니다.',
      },
    },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function CalendarDemo() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    );
  },
};

export const WithDisabledDates: Story = {
  name: '비활성화 날짜',
  render: function DisabledDatesDemo() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
        className="rounded-md border"
      />
    );
  },
};

export const RangeSelection: Story = {
  name: '범위 선택',
  render: function RangeDemo() {
    const [range, setRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
      from: undefined,
      to: undefined,
    });
    return (
      <div className="space-y-2">
        <Calendar
          mode="range"
          selected={range}
          onSelect={(r: any) => setRange(r || { from: undefined, to: undefined })}
          numberOfMonths={2}
          className="rounded-md border"
        />
        <p className="text-sm text-muted-foreground">
          {range.from ? `시작: ${range.from.toLocaleDateString('ko-KR')}` : '시작일을 선택하세요'}
          {range.to ? ` ~ 종료: ${range.to.toLocaleDateString('ko-KR')}` : ''}
        </p>
      </div>
    );
  },
};

export const MultipleMonths: Story = {
  name: '다중 월',
  render: function MultiMonthDemo() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        numberOfMonths={2}
        className="rounded-md border"
      />
    );
  },
};
