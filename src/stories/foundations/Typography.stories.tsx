import type { Meta, StoryObj } from '@storybook/react';

function TypographyShowcase() {
  return (
    <div className="p-6 space-y-10">
      <section>
        <h2 className="text-2xl font-bold mb-4">Font Families</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Pretendard (sans-serif) — 기본 본문</p>
            <p className="font-sans text-xl">가나다라마바사 ABCDEFG abcdefg 0123456789</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Nanum Myeongjo (serif) — 브랜드/감성</p>
            <p className="font-serif text-xl">가나다라마바사 ABCDEFG abcdefg 0123456789</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Nanum Pen Script (handwriting) — 손글씨</p>
            <p className="font-handwriting text-xl">가나다라마바사 ABCDEFG abcdefg 0123456789</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Font Sizes</h2>
        <div className="space-y-3">
          {[
            { label: 'xs (0.75rem)', cls: 'text-xs' },
            { label: 'sm (0.875rem)', cls: 'text-sm' },
            { label: 'base (1rem)', cls: 'text-base' },
            { label: 'lg (1.125rem)', cls: 'text-lg' },
            { label: 'xl (1.25rem)', cls: 'text-xl' },
            { label: '2xl (1.5rem)', cls: 'text-2xl' },
            { label: '3xl (1.875rem)', cls: 'text-3xl' },
          ].map(({ label, cls }) => (
            <div key={label} className="flex items-baseline gap-4">
              <span className="text-xs text-muted-foreground w-32 shrink-0">{label}</span>
              <span className={cls}>소중한 사람에게 마음을 전하세요</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Font Weights</h2>
        <div className="space-y-2">
          {[
            { label: 'Light (300)', cls: 'font-light' },
            { label: 'Normal (400)', cls: 'font-normal' },
            { label: 'Medium (500)', cls: 'font-medium' },
            { label: 'Semibold (600)', cls: 'font-semibold' },
            { label: 'Bold (700)', cls: 'font-bold' },
          ].map(({ label, cls }) => (
            <div key={label} className="flex items-baseline gap-4">
              <span className="text-xs text-muted-foreground w-32 shrink-0">{label}</span>
              <span className={`text-lg ${cls}`}>투 오렌지 To Orange</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta: Meta = {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const All: Story = {
  render: () => <TypographyShowcase />,
};
