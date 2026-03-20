# To Orange Design Share

디자이너 공유용 Storybook 프로젝트입니다. `apps/web`의 전체 디자인 소스를 독립적으로 확인하고 수정할 수 있습니다.

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

> 모노레포(`to-orange`) 루트에서 실행해도 됩니다:
> ```bash
> pnpm install --filter @to-orange/design-share
> ```

### 2. Storybook 실행

```bash
pnpm storybook
```

브라우저에서 `http://localhost:6006` 으로 접속합니다.

### 3. 정적 빌드 (배포/공유용)

```bash
pnpm build-storybook
```

`storybook-static/` 폴더가 생성됩니다. 이 폴더를 zip으로 압축하거나 Vercel/Netlify에 배포하면 됩니다.

## 스토리 구조

```
src/stories/
├── foundations/          # 디자인 토큰
│   ├── Colors            # 색상 팔레트 (시맨틱, 오렌지, 사이드바)
│   ├── Typography        # 폰트 패밀리, 사이즈 스케일
│   ├── Spacing           # 간격, 브레이크포인트, 반경
│   └── Animations        # 커스텀 애니메이션 목록
├── ui/                   # shadcn/ui 컴포넌트 (49개)
│   ├── Button, Input, Card, Badge ...
│   └── 각 컴포넌트별 variants, states, controls
├── landing/              # 랜딩 페이지 섹션 (13개)
│   ├── Navbar, HeroSection, FAQ ...
│   └── 반응형 뷰포트 프리셋 포함
└── pages/                # 풀페이지 조합
    └── LandingPage       # 랜딩 전체 조합
```

## 컴포넌트 수정하기

컴포넌트 소스는 `src/components/`에 있습니다. 자유롭게 수정 가능합니다.

```
src/components/
├── ui/                   # shadcn/ui 기본 컴포넌트
├── landing/              # 랜딩 페이지
├── mail/                 # 편지 관련 (에디터, 모달 등)
├── payment/              # 결제
├── time-capsule-chat/    # 타임캡슐
├── common/               # 공통
└── layout/               # 레이아웃
```

## 새 스토리 추가하기

`src/stories/` 아래에 `.stories.tsx` 파일을 만들면 자동으로 Storybook에 표시됩니다.

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Button',       // Storybook 사이드바 경로
  component: Button,
  tags: ['autodocs'],        // Props 문서 자동 생성
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '버튼',
    variant: 'default',
  },
};
```

## 기술 스택

| 항목 | 버전 |
|------|------|
| Storybook | 8.6 |
| React | 19 |
| TypeScript | 5.7 |
| Tailwind CSS | 3.4 |
| Vite | (Storybook 내장) |

## 참고

- Next.js, Supabase, TanStack Query 등 서버 의존성은 mock 처리되어 있습니다 (`src/mocks/`)
- 스타일은 `src/styles/globals.css`와 `tailwind.config.js`에서 관리합니다
- 폰트: Pretendard (산세리프), Nanum Myeongjo (명조), Nanum Pen Script (손글씨)
