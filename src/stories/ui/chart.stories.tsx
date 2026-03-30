import type { Meta, StoryObj } from '@storybook/react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

const chartData = [
  { month: '1월', 편지수: 18 },
  { month: '2월', 편지수: 30 },
  { month: '3월', 편지수: 23 },
  { month: '4월', 편지수: 45 },
  { month: '5월', 편지수: 38 },
  { month: '6월', 편지수: 52 },
];

const chartConfig = {
  편지수: {
    label: '편지 수',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const meta: Meta = {
  title: 'UI/Chart',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

export const BarChartExample: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="편지수" fill="var(--color-편지수)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
};
