import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Typography',
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

// ── Font Size Scale (Tailwind standard) ──
const standardSizes = [
  { name: 'xs', css: '0.75rem (12px)', lineHeight: '1rem', twClass: 'text-xs' },
  { name: 'sm', css: '0.875rem (14px)', lineHeight: '1.25rem', twClass: 'text-sm' },
  { name: 'base', css: '1rem (16px)', lineHeight: '1.5rem', twClass: 'text-base' },
  { name: 'lg', css: '1.125rem (18px)', lineHeight: '1.75rem', twClass: 'text-lg' },
  { name: 'xl', css: '1.25rem (20px)', lineHeight: '1.75rem', twClass: 'text-xl' },
  { name: '2xl', css: '1.5rem (24px)', lineHeight: '2rem', twClass: 'text-2xl' },
  { name: '3xl', css: '1.875rem (30px)', lineHeight: '2.25rem', twClass: 'text-3xl' },
  { name: '4xl', css: '2.25rem (36px)', lineHeight: '2.5rem', twClass: 'text-4xl' },
  { name: '5xl', css: '3rem (48px)', lineHeight: '1', twClass: 'text-5xl' },
  { name: '6xl', css: '3.75rem (60px)', lineHeight: '1', twClass: 'text-6xl' },
  { name: '7xl', css: '4.5rem (72px)', lineHeight: '1', twClass: 'text-7xl' },
  { name: '8xl', css: '6rem (96px)', lineHeight: '1', twClass: 'text-8xl' },
  { name: '9xl', css: '8rem (128px)', lineHeight: '1', twClass: 'text-9xl' },
];

// ── Custom Pixel-based sizes ──
const customSizes = [
  { name: 'size-2', css: '2px', variable: '--font-size-2' },
  { name: 'size-8', css: '8px', variable: '--font-size-8' },
  { name: 'size-9', css: '9px', variable: '--font-size-9' },
  { name: 'size-10', css: '10px', variable: '--font-size-10' },
  { name: 'size-11', css: '11px', variable: '--font-size-11' },
  { name: 'size-12', css: '12px', variable: '--font-size-12' },
  { name: 'size-12-8', css: '0.8rem (12.8px)', variable: '--font-size-12-8' },
  { name: 'size-13', css: '13px', variable: '--font-size-13' },
  { name: 'size-14', css: '14px', variable: '--font-size-14' },
  { name: 'size-15', css: '15px', variable: '--font-size-15' },
  { name: 'size-16', css: '16px', variable: '--font-size-16' },
  { name: 'size-17', css: '17px', variable: '--font-size-17' },
  { name: 'size-18', css: '18px', variable: '--font-size-18' },
  { name: 'size-19', css: '19px', variable: '--font-size-19' },
  { name: 'size-20', css: '20px', variable: '--font-size-20' },
  { name: 'size-22', css: '22px', variable: '--font-size-22' },
  { name: 'size-24', css: '24px', variable: '--font-size-24' },
  { name: 'size-28', css: '28px', variable: '--font-size-28' },
  { name: 'size-28-8', css: '1.8rem (28.8px)', variable: '--font-size-28-8' },
  { name: 'size-32', css: '2rem (32px)', variable: '--font-size-32' },
  { name: 'size-34-4', css: '2.15rem (34.4px)', variable: '--font-size-34-4' },
  { name: 'size-35-2', css: '2.2rem (35.2px)', variable: '--font-size-35-2' },
  { name: 'size-36', css: '36px', variable: '--font-size-36' },
  { name: 'size-37-6', css: '2.35rem (37.6px)', variable: '--font-size-37-6' },
  { name: 'size-44', css: '44px', variable: '--font-size-44' },
  { name: 'size-44-8', css: '2.8rem (44.8px)', variable: '--font-size-44-8' },
  { name: 'size-48', css: '3rem (48px)', variable: '--font-size-48' },
  { name: 'size-49-6', css: '3.1rem (49.6px)', variable: '--font-size-49-6' },
  { name: 'size-50-4', css: '3.15rem (50.4px)', variable: '--font-size-50-4' },
  { name: 'size-51-2', css: '3.2rem (51.2px)', variable: '--font-size-51-2' },
  { name: 'size-52', css: '3.25rem (52px)', variable: '--font-size-52' },
  { name: 'size-52-8', css: '3.3rem (52.8px)', variable: '--font-size-52-8' },
  { name: 'size-70-4', css: '4.4rem (70.4px)', variable: '--font-size-70-4' },
  { name: 'size-75-2', css: '4.7rem (75.2px)', variable: '--font-size-75-2' },
];

export const FontFamilies: Story = {
  name: '폰트 패밀리',
  render: () => (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">폰트 패밀리</h1>
      <p className="text-sm text-gray-500">프로젝트에서 사용하는 3가지 폰트 패밀리</p>

      <div className="space-y-8 mt-6">
        {/* Pretendard */}
        <div className="p-6 border rounded-xl">
          <div className="flex items-baseline gap-3 mb-4">
            <h3 className="text-lg font-bold">Pretendard</h3>
            <span className="text-xs font-mono text-gray-400">font-sans / font-pretendard</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            기본 본문 폰트. UI 텍스트, 버튼, 레이블 등에 사용됩니다.
          </p>
          <div className="space-y-2" style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            <p className="text-base font-light">Light 300 - 따뜻한 마음을 전하는 편지 서비스</p>
            <p className="text-base font-normal">Regular 400 - 따뜻한 마음을 전하는 편지 서비스</p>
            <p className="text-base font-medium">Medium 500 - 따뜻한 마음을 전하는 편지 서비스</p>
            <p className="text-base font-semibold">SemiBold 600 - 따뜻한 마음을 전하는 편지 서비스</p>
            <p className="text-base font-bold">Bold 700 - 따뜻한 마음을 전하는 편지 서비스</p>
            <p className="text-base font-extrabold">ExtraBold 800 - 따뜻한 마음을 전하는 편지 서비스</p>
          </div>
        </div>

        {/* Nanum Myeongjo */}
        <div className="p-6 border rounded-xl">
          <div className="flex items-baseline gap-3 mb-4">
            <h3 className="text-lg font-bold">Nanum Myeongjo</h3>
            <span className="text-xs font-mono text-gray-400">font-nanum-myeongjo</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            명조체 폰트. 편지 본문, 감성적인 텍스트에 사용됩니다.
          </p>
          <div className="space-y-2" style={{ fontFamily: '"Nanum Myeongjo", serif' }}>
            <p className="text-base font-normal">Regular 400 - 따뜻한 마음을 전하는 편지 서비스</p>
            <p className="text-base font-bold">Bold 700 - 따뜻한 마음을 전하는 편지 서비스</p>
            <p className="text-lg">사랑하는 가족에게 마음을 담아 편지를 보내보세요.</p>
            <p className="text-xl">그리움은 마음을 더 깊게 만듭니다.</p>
          </div>
        </div>

        {/* Nanum Pen Script */}
        <div className="p-6 border rounded-xl">
          <div className="flex items-baseline gap-3 mb-4">
            <h3 className="text-lg font-bold">Nanum Pen Script</h3>
            <span className="text-xs font-mono text-gray-400">font-nanum-pen</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            손글씨 폰트. 편지지 위의 손글씨 느낌을 표현할 때 사용됩니다.
          </p>
          <div className="space-y-2" style={{ fontFamily: '"Nanum Pen Script", cursive' }}>
            <p className="text-lg">따뜻한 마음을 전하는 편지 서비스</p>
            <p className="text-xl">사랑하는 가족에게 마음을 담아 편지를 보내보세요.</p>
            <p className="text-2xl">그리움은 마음을 더 깊게 만듭니다.</p>
            <p className="text-3xl">안녕하세요, 잘 지내고 계시죠?</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const StandardFontSizes: Story = {
  name: '표준 폰트 사이즈',
  render: () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">표준 폰트 사이즈</h1>
      <p className="text-sm text-gray-500 mb-6">Tailwind 표준 사이즈 스케일 (xs ~ 9xl)</p>

      <div className="space-y-0">
        {standardSizes.map((size) => (
          <div key={size.name} className="flex items-baseline gap-4 py-3 border-b border-gray-100">
            <div className="w-16 shrink-0">
              <span className="text-xs font-mono font-bold text-orange-600">{size.name}</span>
            </div>
            <div className="w-40 shrink-0">
              <span className="text-xs font-mono text-gray-400">{size.css}</span>
            </div>
            <div className="w-28 shrink-0">
              <span className="text-xs font-mono text-gray-300">LH: {size.lineHeight}</span>
            </div>
            <p className={size.twClass}>따뜻한 마음을 전합니다</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const CustomFontSizes: Story = {
  name: '커스텀 폰트 사이즈',
  render: () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">커스텀 폰트 사이즈</h1>
      <p className="text-sm text-gray-500 mb-6">프로젝트 전용 픽셀 기반 사이즈 토큰 (size-2 ~ size-75-2)</p>

      <div className="space-y-0">
        {customSizes.map((size) => (
          <div key={size.name} className="flex items-baseline gap-4 py-3 border-b border-gray-100">
            <div className="w-24 shrink-0">
              <span className="text-xs font-mono font-bold text-orange-600">{size.name}</span>
            </div>
            <div className="w-44 shrink-0">
              <span className="text-xs font-mono text-gray-400">{size.css}</span>
            </div>
            <div className="w-48 shrink-0">
              <span className="text-[10px] font-mono text-gray-300">{size.variable}</span>
            </div>
            <p style={{ fontSize: `var(${size.variable})` }}>
              따뜻한 마음
            </p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const LineHeightMapping: Story = {
  name: '라인 하이트 매핑',
  render: () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">라인 하이트 매핑</h1>
      <p className="text-sm text-gray-500 mb-6">표준 폰트 사이즈별 line-height 매핑 관계</p>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-2 pr-4 font-semibold">사이즈</th>
            <th className="text-left py-2 pr-4 font-semibold">font-size</th>
            <th className="text-left py-2 pr-4 font-semibold">line-height</th>
            <th className="text-left py-2 font-semibold">비율</th>
          </tr>
        </thead>
        <tbody>
          {standardSizes.map((size) => {
            const ratio = size.lineHeight === '1'
              ? '1.0'
              : `~${(parseFloat(size.lineHeight) / parseFloat(size.css)).toFixed(2)}`;
            return (
              <tr key={size.name} className="border-b border-gray-100">
                <td className="py-2 pr-4 font-mono font-bold text-orange-600">{size.name}</td>
                <td className="py-2 pr-4 font-mono text-gray-500">{size.css}</td>
                <td className="py-2 pr-4 font-mono text-gray-500">{size.lineHeight}</td>
                <td className="py-2 font-mono text-gray-400">{ratio}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <SectionTitle>라인 하이트 시각 비교</SectionTitle>
      <div className="grid grid-cols-3 gap-6 mt-4">
        {[
          { label: 'leading-none (1)', cls: 'leading-none' },
          { label: 'leading-tight (1.25)', cls: 'leading-tight' },
          { label: 'leading-normal (1.5)', cls: 'leading-normal' },
          { label: 'leading-relaxed (1.625)', cls: 'leading-relaxed' },
          { label: 'leading-loose (2)', cls: 'leading-loose' },
        ].map((item) => (
          <div key={item.label} className="p-3 border rounded-lg">
            <p className="text-xs font-mono text-gray-400 mb-2">{item.label}</p>
            <p className={`text-base ${item.cls}`}>
              따뜻한 마음을 전하는 편지 서비스입니다. 사랑하는 가족에게 마음을 담아 편지를 보내보세요.
              그리움은 마음을 더 깊게 만듭니다.
            </p>
          </div>
        ))}
      </div>
    </div>
  ),
};
