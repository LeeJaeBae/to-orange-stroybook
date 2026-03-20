import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Spacing',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-bold mt-10 mb-4 border-b pb-2">{children}</h2>
);

// ── Tailwind Default Spacing Scale ──
const spacingScale = [
  { key: '0', value: '0px' },
  { key: 'px', value: '1px' },
  { key: '0.5', value: '0.125rem (2px)' },
  { key: '1', value: '0.25rem (4px)' },
  { key: '1.5', value: '0.375rem (6px)' },
  { key: '2', value: '0.5rem (8px)' },
  { key: '2.5', value: '0.625rem (10px)' },
  { key: '3', value: '0.75rem (12px)' },
  { key: '3.5', value: '0.875rem (14px)' },
  { key: '4', value: '1rem (16px)' },
  { key: '5', value: '1.25rem (20px)' },
  { key: '6', value: '1.5rem (24px)' },
  { key: '7', value: '1.75rem (28px)' },
  { key: '8', value: '2rem (32px)' },
  { key: '9', value: '2.25rem (36px)' },
  { key: '10', value: '2.5rem (40px)' },
  { key: '11', value: '2.75rem (44px)' },
  { key: '12', value: '3rem (48px)' },
  { key: '14', value: '3.5rem (56px)' },
  { key: '16', value: '4rem (64px)' },
  { key: '20', value: '5rem (80px)' },
  { key: '24', value: '6rem (96px)' },
  { key: '28', value: '7rem (112px)' },
  { key: '32', value: '8rem (128px)' },
  { key: '36', value: '9rem (144px)' },
  { key: '40', value: '10rem (160px)' },
  { key: '44', value: '11rem (176px)' },
  { key: '48', value: '12rem (192px)' },
  { key: '52', value: '13rem (208px)' },
  { key: '56', value: '14rem (224px)' },
  { key: '60', value: '15rem (240px)' },
  { key: '64', value: '16rem (256px)' },
  { key: '72', value: '18rem (288px)' },
  { key: '80', value: '20rem (320px)' },
  { key: '96', value: '24rem (384px)' },
];

// px values for rendering
const spacingPx: Record<string, number> = {
  '0': 0, 'px': 1, '0.5': 2, '1': 4, '1.5': 6, '2': 8, '2.5': 10,
  '3': 12, '3.5': 14, '4': 16, '5': 20, '6': 24, '7': 28, '8': 32,
  '9': 36, '10': 40, '11': 44, '12': 48, '14': 56, '16': 64, '20': 80,
  '24': 96, '28': 112, '32': 128, '36': 144, '40': 160, '44': 176, '48': 192,
  '52': 208, '56': 224, '60': 240, '64': 256, '72': 288, '80': 320, '96': 384,
};

const containerWidths = [
  { name: 'sm', value: '640px' },
  { name: 'md', value: '768px' },
  { name: 'nav', value: '915px' },
  { name: 'lg', value: '1024px' },
  { name: 'xl', value: '1280px' },
  { name: '2xl', value: '1536px' },
  { name: 'container (2xl)', value: '1400px' },
];

export const SpacingScale: Story = {
  name: '간격 스케일',
  render: () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">간격 스케일</h1>
      <p className="text-sm text-gray-500 mb-6">
        Tailwind 기본 간격 스케일. padding, margin, gap, width, height 등에 사용됩니다.
      </p>

      <div className="space-y-0">
        {spacingScale.map((s) => {
          const px = spacingPx[s.key] ?? 0;
          // Cap visual width at 384px for display
          const displayWidth = Math.min(px, 384);
          return (
            <div key={s.key} className="flex items-center gap-4 py-1.5 border-b border-gray-50">
              <div className="w-12 shrink-0 text-right">
                <span className="text-xs font-mono font-bold text-orange-600">{s.key}</span>
              </div>
              <div className="w-40 shrink-0">
                <span className="text-xs font-mono text-gray-400">{s.value}</span>
              </div>
              <div className="flex-1">
                <div
                  className="h-4 rounded-sm bg-orange-400/70"
                  style={{ width: displayWidth > 0 ? `${displayWidth}px` : '1px' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ),
};

export const SmallSpacing: Story = {
  name: '작은 간격 (0-12)',
  render: () => {
    const small = spacingScale.filter((s) => (spacingPx[s.key] ?? 0) <= 48);
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">작은 간격 상세</h1>
        <p className="text-sm text-gray-500 mb-6">0부터 12까지 (0px ~ 48px) - 컴포넌트 내부 간격에 주로 사용</p>

        <div className="flex flex-wrap gap-6 mt-4">
          {small.map((s) => {
            const px = spacingPx[s.key] ?? 0;
            return (
              <div key={s.key} className="flex flex-col items-center gap-2">
                <div className="relative w-20 h-20 border border-dashed border-gray-300 rounded flex items-end justify-center p-1">
                  <div
                    className="bg-orange-400 rounded-sm"
                    style={{
                      width: `${Math.max(px, 1)}px`,
                      height: `${Math.max(px, 1)}px`,
                      maxWidth: '72px',
                      maxHeight: '72px',
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-mono font-bold">{s.key}</p>
                  <p className="text-[10px] font-mono text-gray-400">{px}px</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};

export const ContainerWidths: Story = {
  name: '컨테이너 / 브레이크포인트',
  render: () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">컨테이너 및 브레이크포인트</h1>
      <p className="text-sm text-gray-500 mb-6">반응형 레이아웃 브레이크포인트와 컨테이너 최대 너비</p>

      <SectionTitle>브레이크포인트</SectionTitle>
      <div className="space-y-3 mt-4">
        {containerWidths.map((cw) => {
          const px = parseInt(cw.value);
          const barWidth = Math.min((px / 1536) * 100, 100);
          return (
            <div key={cw.name} className="flex items-center gap-4">
              <div className="w-32 shrink-0 text-right">
                <span className="text-sm font-mono font-bold text-orange-600">{cw.name}</span>
              </div>
              <div className="w-24 shrink-0">
                <span className="text-xs font-mono text-gray-400">{cw.value}</span>
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-orange-400/60 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${barWidth}%` }}
                >
                  <span className="text-[10px] font-mono text-white font-bold">{cw.value}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs font-mono text-gray-500">
          container: center: true, padding: &quot;2rem&quot;, 2xl max-width: 1400px
        </p>
      </div>
    </div>
  ),
};

export const BorderRadius: Story = {
  name: '테두리 반경',
  render: () => {
    const radii = [
      { name: 'none', value: '0px', css: '0px' },
      { name: 'sm', value: 'calc(var(--radius) - 4px)', css: 'calc(0.75rem - 4px) = 8px' },
      { name: 'md (DEFAULT)', value: 'calc(var(--radius) - 2px)', css: 'calc(0.75rem - 2px) = 10px' },
      { name: 'lg', value: 'var(--radius)', css: '0.75rem (12px)' },
      { name: 'xl', value: '0.75rem', css: '12px' },
      { name: '2xl', value: '1rem', css: '16px' },
      { name: '3xl', value: '1.5rem', css: '24px' },
      { name: 'full', value: '9999px', css: '9999px' },
    ];

    const radiusPx: Record<string, number> = {
      'none': 0, 'sm': 8, 'md (DEFAULT)': 10, 'lg': 12, 'xl': 12, '2xl': 16, '3xl': 24, 'full': 9999,
    };

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">테두리 반경 (Border Radius)</h1>
        <p className="text-sm text-gray-500 mb-6">
          --radius: 0.75rem (12px) 기반 커스텀 반경 토큰
        </p>

        <div className="flex flex-wrap gap-6 mt-4">
          {radii.map((r) => {
            const px = radiusPx[r.name] ?? 0;
            return (
              <div key={r.name} className="flex flex-col items-center gap-3">
                <div
                  className="w-24 h-24 bg-orange-400 border-2 border-orange-500"
                  style={{ borderRadius: px === 9999 ? '9999px' : `${px}px` }}
                />
                <div className="text-center">
                  <p className="text-xs font-bold">{r.name}</p>
                  <p className="text-[10px] font-mono text-gray-400">{r.css}</p>
                </div>
              </div>
            );
          })}
        </div>

        <SectionTitle>박스 그림자</SectionTitle>
        <div className="flex gap-8 mt-4">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-32 h-32 bg-white rounded-lg"
              style={{ boxShadow: '0 1px 3px hsl(20 10% 15% / 0.04), 0 4px 12px hsl(20 10% 15% / 0.06)' }}
            />
            <div className="text-center">
              <p className="text-xs font-bold">shadow-card</p>
              <p className="text-[10px] font-mono text-gray-400">--card-shadow</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-32 h-32 bg-white rounded-lg"
              style={{ boxShadow: '0 4px 20px hsl(20 90% 55% / 0.15)' }}
            />
            <div className="text-center">
              <p className="text-xs font-bold">shadow-card-hover</p>
              <p className="text-[10px] font-mono text-gray-400">--card-shadow-hover</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
