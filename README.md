# To Orange Design Share

디자이너 공유용 Storybook 프로젝트입니다. `apps/to-orange`의 디자인 소스를 독립적으로 확인할 수 있습니다.

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. Storybook 실행

```bash
pnpm storybook
```

브라우저에서 `http://localhost:6006` 으로 접속합니다.

### 3. 정적 빌드 (배포/공유용)

```bash
pnpm build-storybook
```

`storybook-static/` 폴더가 생성됩니다. zip으로 압축하거나 Vercel/Netlify에 배포하면 됩니다.

## 스토리 구조

```
src/stories/
├── foundations/          # 디자인 토큰
│   ├── Colors            # 색상 팔레트 (오렌지 브랜드, 시맨틱, 사이드바)
│   ├── Typography        # 폰트 패밀리, 사이즈 스케일
│   ├── Spacing           # 간격, 브레이크포인트, 반경
│   └── Animations        # CSS 애니메이션, 스크롤 리빌, 페이드업
├── ui/                   # shadcn/ui 컴포넌트 (48개)
│   ├── Button, Input, Card, Badge ...
│   └── 각 컴포넌트별 variants, states, controls
├── landing/              # 랜딩 페이지 섹션 (13개)
│   ├── Navbar, HeroSection, FAQ ...
│   └── Desktop / Tablet / Mobile 뷰포트 프리셋
├── pages/                # 풀페이지 조합
│   └── LandingPage       # Navbar + 전체 섹션 + Footer
└── about/                # 소개 페이지
    ├── AboutPage          # 투오렌지 소개
    └── BrandPhilosophyPage # 브랜드 철학
```

## 컴포넌트 구조

```
src/components/
├── ui/                   # shadcn/ui 기본 컴포넌트 (radix-ui 기반)
├── landing/              # 랜딩 페이지
│   ├── components/       # Navbar, Footer, FloatingBottomBar 등
│   ├── sections/client/  # HeroSection, FAQ, CTASection 등
│   └── lib/              # 애니메이션, 데이터, 스크롤 훅
└── about/                # AboutPage, BrandPhilosophyPage
```

## 새 스토리 추가하기

`src/stories/` 아래에 `.stories.tsx` 파일을 만들면 자동으로 Storybook에 표시됩니다.

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: '버튼' },
};
```

## 기술 스택

| 항목 | 버전 |
|------|------|
| Storybook | 8.6 |
| React | 19 |
| TypeScript | 5.7 |
| Tailwind CSS | 4 |
| Radix UI | 1.4 (통합 패키지) |
| Framer Motion | 12 |
| Vite | (Storybook 내장) |

## 참고

- Next.js, Supabase, Auth, Analytics 등 서버 의존성은 mock 처리되어 있습니다 (`src/mocks/`)
- 스타일은 `src/styles/globals.css`에서 관리합니다 (Tailwind v4 `@theme inline` 방식)
- 폰트: Pretendard (산세리프), Nanum Myeongjo (명조), Nanum Pen Script (손글씨)
