import type { Meta, StoryObj } from '@storybook/react';

function ColorSwatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm"
        style={{ backgroundColor: value }}
      />
      <div>
        <div className="font-medium text-sm">{name}</div>
        <div className="text-xs text-muted-foreground">{value}</div>
      </div>
    </div>
  );
}

function ColorSection({ title, colors }: { title: string; colors: { name: string; value: string }[] }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {colors.map((c) => (
          <ColorSwatch key={c.name} {...c} />
        ))}
      </div>
    </div>
  );
}

function AllColors() {
  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold">Color System</h2>

      <ColorSection
        title="Orange Brand"
        colors={[
          { name: 'orange-50', value: '#FFF9F5' },
          { name: 'orange-100', value: '#FFE8D6' },
          { name: 'orange-200', value: '#FFCFA3' },
          { name: 'orange-300', value: '#FFB06E' },
          { name: 'orange-400', value: '#F98D3D' },
          { name: 'orange-500', value: '#F46A25' },
          { name: 'orange-600', value: '#EA580C' },
          { name: 'orange-700', value: '#C2410C' },
        ]}
      />

      <ColorSection
        title="Semantic"
        colors={[
          { name: 'background', value: '#ffffff' },
          { name: 'foreground', value: '#111827' },
          { name: 'primary', value: '#F46A25' },
          { name: 'muted', value: '#f3f4f6' },
          { name: 'muted-foreground', value: '#6b7280' },
          { name: 'border', value: '#e5e7eb' },
          { name: 'destructive', value: '#ef4444' },
          { name: 'success', value: '#22c55e' },
        ]}
      />

      <ColorSection
        title="Sidebar"
        colors={[
          { name: 'sidebar-background', value: '#ffffff' },
          { name: 'sidebar-foreground', value: '#463e39' },
          { name: 'sidebar-primary', value: '#f46a25' },
          { name: 'sidebar-accent', value: '#f8f5f2' },
          { name: 'sidebar-border', value: '#efebe7' },
        ]}
      />
    </div>
  );
}

const meta: Meta = {
  title: 'Foundations/Colors',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const All: Story = {
  render: () => <AllColors />,
};
