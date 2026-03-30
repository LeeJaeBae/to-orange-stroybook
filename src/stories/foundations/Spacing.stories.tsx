import type { Meta, StoryObj } from '@storybook/react';

function SpacingShowcase() {
  const spacings = [
    { name: '0', value: '0' },
    { name: '1', value: '0.25rem (4px)' },
    { name: '2', value: '0.5rem (8px)' },
    { name: '3', value: '0.75rem (12px)' },
    { name: '4', value: '1rem (16px)' },
    { name: '6', value: '1.5rem (24px)' },
    { name: '8', value: '2rem (32px)' },
  ];

  const radii = [
    { name: 'sm', value: '0.375rem', cls: 'rounded-sm' },
    { name: 'md', value: '0.5rem', cls: 'rounded-md' },
    { name: 'lg', value: '0.75rem', cls: 'rounded-lg' },
    { name: 'full', value: '9999px', cls: 'rounded-full' },
  ];

  return (
    <div className="p-6 space-y-10">
      <section>
        <h2 className="text-2xl font-bold mb-4">Spacing Scale</h2>
        <div className="space-y-3">
          {spacings.map(({ name, value }) => (
            <div key={name} className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-24 shrink-0">spacing-{name}</span>
              <div className="h-4 bg-orange-400 rounded" style={{ width: `${parseInt(name) * 16 || 2}px` }} />
              <span className="text-xs text-muted-foreground">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Border Radius</h2>
        <div className="flex gap-6">
          {radii.map(({ name, value, cls }) => (
            <div key={name} className="text-center">
              <div className={`w-16 h-16 bg-orange-400 ${cls} mb-2`} />
              <div className="text-xs font-medium">{name}</div>
              <div className="text-xs text-muted-foreground">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Breakpoints</h2>
        <div className="space-y-2">
          {[
            { name: 'sm', value: '640px' },
            { name: 'md', value: '768px' },
            { name: 'lg', value: '1024px' },
            { name: 'xl', value: '1280px' },
            { name: '2xl', value: '1536px' },
          ].map(({ name, value }) => (
            <div key={name} className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-16">{name}</span>
              <span className="text-sm">{value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta: Meta = {
  title: 'Foundations/Spacing',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const All: Story = {
  render: () => <SpacingShowcase />,
};
