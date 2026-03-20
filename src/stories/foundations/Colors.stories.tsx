import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Colors',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

interface SwatchProps {
  name: string;
  variable: string;
  hslValue: string;
  className?: string;
}

const Swatch = ({ name, variable, hslValue, className }: SwatchProps) => (
  <div className="flex flex-col items-center gap-2">
    <div
      className={`w-20 h-20 rounded-lg border border-gray-200 shadow-sm ${className ?? ''}`}
      style={{ backgroundColor: `hsl(${hslValue})` }}
    />
    <div className="text-center">
      <p className="text-xs font-semibold">{name}</p>
      <p className="text-[10px] text-gray-500 font-mono">{variable}</p>
      <p className="text-[10px] text-gray-400 font-mono">{hslValue}</p>
    </div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-bold mt-10 mb-4 border-b pb-2">{children}</h2>
);

const SubTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-base font-semibold mt-6 mb-3 text-gray-700">{children}</h3>
);

// ── Light Theme Semantic Colors ──
const lightSemanticColors: SwatchProps[] = [
  { name: 'background', variable: '--background', hslValue: '0 0% 100%' },
  { name: 'foreground', variable: '--foreground', hslValue: '20 10% 15%' },
  { name: 'primary', variable: '--primary', hslValue: '20 90% 55%' },
  { name: 'primary-foreground', variable: '--primary-foreground', hslValue: '0 0% 100%' },
  { name: 'secondary', variable: '--secondary', hslValue: '0 0% 96%' },
  { name: 'secondary-foreground', variable: '--secondary-foreground', hslValue: '20 10% 25%' },
  { name: 'muted', variable: '--muted', hslValue: '0 0% 96%' },
  { name: 'muted-foreground', variable: '--muted-foreground', hslValue: '20 15% 35%' },
  { name: 'accent', variable: '--accent', hslValue: '0 0% 98%' },
  { name: 'accent-foreground', variable: '--accent-foreground', hslValue: '20 90% 40%' },
  { name: 'destructive', variable: '--destructive', hslValue: '0 84% 60%' },
  { name: 'destructive-foreground', variable: '--destructive-foreground', hslValue: '0 0% 100%' },
  { name: 'popover', variable: '--popover', hslValue: '0 0% 100%' },
  { name: 'popover-foreground', variable: '--popover-foreground', hslValue: '20 10% 15%' },
  { name: 'card', variable: '--card', hslValue: '0 0% 100%' },
  { name: 'card-foreground', variable: '--card-foreground', hslValue: '20 10% 15%' },
  { name: 'success', variable: 'success', hslValue: '142 76% 36%' },
  { name: 'success-foreground', variable: 'success-foreground', hslValue: '0 0% 100%' },
  { name: 'border', variable: '--border', hslValue: '30 15% 82%' },
  { name: 'input', variable: '--input', hslValue: '30 15% 82%' },
  { name: 'ring', variable: '--ring', hslValue: '20 90% 55%' },
];

const lightSidebarColors: SwatchProps[] = [
  { name: 'sidebar', variable: '--sidebar-background', hslValue: '0 0% 100%' },
  { name: 'sidebar-foreground', variable: '--sidebar-foreground', hslValue: '20 10% 25%' },
  { name: 'sidebar-primary', variable: '--sidebar-primary', hslValue: '20 90% 55%' },
  { name: 'sidebar-primary-fg', variable: '--sidebar-primary-foreground', hslValue: '0 0% 100%' },
  { name: 'sidebar-accent', variable: '--sidebar-accent', hslValue: '30 30% 96%' },
  { name: 'sidebar-accent-fg', variable: '--sidebar-accent-foreground', hslValue: '20 10% 25%' },
  { name: 'sidebar-border', variable: '--sidebar-border', hslValue: '30 20% 92%' },
  { name: 'sidebar-ring', variable: '--sidebar-ring', hslValue: '20 90% 55%' },
];

// ── Dark Theme Semantic Colors ──
const darkSemanticColors: SwatchProps[] = [
  { name: 'background', variable: '--background', hslValue: '20 15% 8%' },
  { name: 'foreground', variable: '--foreground', hslValue: '30 20% 95%' },
  { name: 'primary', variable: '--primary', hslValue: '20 85% 55%' },
  { name: 'primary-foreground', variable: '--primary-foreground', hslValue: '0 0% 100%' },
  { name: 'secondary', variable: '--secondary', hslValue: '20 12% 18%' },
  { name: 'secondary-foreground', variable: '--secondary-foreground', hslValue: '30 20% 90%' },
  { name: 'muted', variable: '--muted', hslValue: '20 10% 20%' },
  { name: 'muted-foreground', variable: '--muted-foreground', hslValue: '30 15% 60%' },
  { name: 'accent', variable: '--accent', hslValue: '20 30% 20%' },
  { name: 'accent-foreground', variable: '--accent-foreground', hslValue: '20 85% 65%' },
  { name: 'destructive', variable: '--destructive', hslValue: '0 62% 30%' },
  { name: 'destructive-foreground', variable: '--destructive-foreground', hslValue: '0 0% 100%' },
  { name: 'popover', variable: '--popover', hslValue: '20 12% 12%' },
  { name: 'popover-foreground', variable: '--popover-foreground', hslValue: '30 20% 95%' },
  { name: 'card', variable: '--card', hslValue: '20 12% 12%' },
  { name: 'card-foreground', variable: '--card-foreground', hslValue: '30 20% 95%' },
  { name: 'border', variable: '--border', hslValue: '20 10% 18%' },
  { name: 'input', variable: '--input', hslValue: '20 10% 18%' },
  { name: 'ring', variable: '--ring', hslValue: '20 85% 55%' },
];

const darkSidebarColors: SwatchProps[] = [
  { name: 'sidebar', variable: '--sidebar-background', hslValue: '20 12% 10%' },
  { name: 'sidebar-foreground', variable: '--sidebar-foreground', hslValue: '30 20% 90%' },
  { name: 'sidebar-primary', variable: '--sidebar-primary', hslValue: '20 85% 55%' },
  { name: 'sidebar-primary-fg', variable: '--sidebar-primary-foreground', hslValue: '0 0% 100%' },
  { name: 'sidebar-accent', variable: '--sidebar-accent', hslValue: '20 10% 15%' },
  { name: 'sidebar-accent-fg', variable: '--sidebar-accent-foreground', hslValue: '30 20% 90%' },
  { name: 'sidebar-border', variable: '--sidebar-border', hslValue: '20 10% 15%' },
  { name: 'sidebar-ring', variable: '--sidebar-ring', hslValue: '20 85% 55%' },
];

// ── Orange Palette ──
const orangePalette: SwatchProps[] = [
  { name: '50', variable: '--orange-50', hslValue: '30 100% 97%' },
  { name: '100', variable: '--orange-100', hslValue: '28 100% 93%' },
  { name: '200', variable: '--orange-200', hslValue: '25 100% 85%' },
  { name: '300', variable: '--orange-300', hslValue: '22 100% 72%' },
  { name: '400', variable: '--orange-400', hslValue: '20 95% 62%' },
  { name: '500', variable: '--orange-500', hslValue: '20 90% 55%' },
  { name: '600', variable: '--orange-600', hslValue: '18 85% 48%' },
  { name: '700', variable: '#CC4A22', hslValue: '15 72% 47%' },
  { name: '800', variable: '#B33A19', hslValue: '14 75% 40%' },
  { name: '900', variable: '#992A10', hslValue: '14 81% 33%' },
];

export const LightTheme: Story = {
  name: '라이트 테마',
  render: () => (
    <div className="p-6 space-y-2 bg-white rounded-xl">
      <h1 className="text-2xl font-bold mb-2">라이트 테마 색상</h1>
      <p className="text-sm text-gray-500 mb-6">:root CSS 변수 기반 시맨틱 색상 토큰</p>

      <SectionTitle>시맨틱 색상</SectionTitle>
      <div className="flex flex-wrap gap-4">
        {lightSemanticColors.map((c) => (
          <Swatch key={c.name + c.variable} {...c} />
        ))}
      </div>

      <SectionTitle>사이드바 색상</SectionTitle>
      <div className="flex flex-wrap gap-4">
        {lightSidebarColors.map((c) => (
          <Swatch key={c.name} {...c} />
        ))}
      </div>
    </div>
  ),
};

export const DarkTheme: Story = {
  name: '다크 테마',
  render: () => (
    <div className="p-6 space-y-2 bg-gray-900 text-white rounded-xl">
      <h1 className="text-2xl font-bold mb-2">다크 테마 색상</h1>
      <p className="text-sm text-gray-400 mb-6">.dark 클래스 CSS 변수 기반 시맨틱 색상 토큰</p>

      <SectionTitle>시맨틱 색상</SectionTitle>
      <div className="flex flex-wrap gap-4">
        {darkSemanticColors.map((c) => (
          <Swatch key={c.name + c.variable} {...c} />
        ))}
      </div>

      <SectionTitle>사이드바 색상</SectionTitle>
      <div className="flex flex-wrap gap-4">
        {darkSidebarColors.map((c) => (
          <Swatch key={c.name} {...c} />
        ))}
      </div>
    </div>
  ),
};

export const OrangePalette: Story = {
  name: '오렌지 팔레트',
  render: () => (
    <div className="p-6 bg-white rounded-xl">
      <h1 className="text-2xl font-bold mb-2">오렌지 팔레트</h1>
      <p className="text-sm text-gray-500 mb-6">브랜드 오렌지 색상 스케일 (50-900)</p>

      <div className="flex gap-1">
        {orangePalette.map((c) => (
          <div key={c.name} className="flex-1">
            <div
              className="h-24 rounded-lg first:rounded-l-xl last:rounded-r-xl"
              style={{ backgroundColor: `hsl(${c.hslValue})` }}
            />
            <div className="mt-2 text-center">
              <p className="text-xs font-bold">{c.name}</p>
              <p className="text-[10px] text-gray-400 font-mono">{c.hslValue}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, hsl(30 100% 97%) 0%, hsl(25 80% 95%) 100%)' }}>
        <p className="text-xs font-mono text-gray-500">--warm-gradient</p>
        <p className="text-xs text-gray-400">linear-gradient(135deg, hsl(30 100% 97%) 0%, hsl(25 80% 95%) 100%)</p>
      </div>
    </div>
  ),
};

export const AllColors: Story = {
  name: '전체 색상 요약',
  render: () => (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">전체 색상 토큰 요약</h1>

      <div className="grid grid-cols-2 gap-8">
        {/* Light */}
        <div className="p-4 bg-white rounded-xl border">
          <h2 className="text-lg font-bold mb-4">라이트</h2>
          <div className="flex flex-wrap gap-2">
            {lightSemanticColors.map((c) => (
              <div
                key={c.name + '-light'}
                title={`${c.name}: hsl(${c.hslValue})`}
                className="w-10 h-10 rounded border border-gray-200"
                style={{ backgroundColor: `hsl(${c.hslValue})` }}
              />
            ))}
          </div>
        </div>

        {/* Dark */}
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
          <h2 className="text-lg font-bold mb-4 text-white">다크</h2>
          <div className="flex flex-wrap gap-2">
            {darkSemanticColors.map((c) => (
              <div
                key={c.name + '-dark'}
                title={`${c.name}: hsl(${c.hslValue})`}
                className="w-10 h-10 rounded border border-gray-600"
                style={{ backgroundColor: `hsl(${c.hslValue})` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Orange bar */}
      <div>
        <h2 className="text-lg font-bold mb-3">오렌지 팔레트</h2>
        <div className="flex h-12 rounded-xl overflow-hidden">
          {orangePalette.map((c) => (
            <div
              key={c.name}
              className="flex-1"
              title={`orange-${c.name}: hsl(${c.hslValue})`}
              style={{ backgroundColor: `hsl(${c.hslValue})` }}
            />
          ))}
        </div>
        <div className="flex mt-1">
          {orangePalette.map((c) => (
            <p key={c.name} className="flex-1 text-center text-[10px] text-gray-400">{c.name}</p>
          ))}
        </div>
      </div>
    </div>
  ),
};
