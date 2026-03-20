'use client';

import { useMemo } from 'react';

interface CrumblingWallProps {
  percentage: number;
  wallSrc?: string;
  height?: number;
}

// 벽돌 그리드: 가로로 긴 직사각형
const BRICK_COLS = 16;
const BRICK_ROWS = 10;
const BRICK_W = 2;    // 벽돌 가로 (줄눈 포함)
const BRICK_H = 1;    // 벽돌 세로
const VW = BRICK_COLS * BRICK_W;
const VH = BRICK_ROWS * BRICK_H;
const SEED = 42;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

// 벽 색감 팔레트 (orange-tree-wall.png 기반: 따뜻한 베이지/크림/샌드)
const BRICK_PALETTE = [
  { r: 225, g: 210, b: 185 }, // 따뜻한 베이지
  { r: 215, g: 198, b: 172 }, // 모래색
  { r: 232, g: 220, b: 200 }, // 크림
  { r: 205, g: 188, b: 162 }, // 진한 샌드
  { r: 220, g: 205, b: 180 }, // 밀색
  { r: 210, g: 195, b: 175 }, // 황토
  { r: 228, g: 215, b: 195 }, // 연한 베이지
  { r: 200, g: 182, b: 158 }, // 갈색 베이지
];

const MORTAR_COLOR = '#D4C8B4'; // 줄눈 색

function generateCrumbleOrder() {
  const cells: { row: number; col: number; priority: number }[] = [];
  const rand = seededRandom(SEED);

  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      const distTop = r;
      const distLeft = c;
      const distRight = BRICK_COLS - 1 - c;
      const distBottom = BRICK_ROWS - 1 - r;
      const edgeDist = Math.min(distTop * 0.7, distLeft, distRight);
      const bottomBonus = distBottom < 2 ? (2 - distBottom) * 5 : 0;
      const priority = edgeDist + bottomBonus + rand() * 2.5;
      cells.push({ row: r, col: c, priority });
    }
  }

  cells.sort((a, b) => a.priority - b.priority);
  return cells;
}

const crumbleOrder = generateCrumbleOrder();

function BrickCell({ r, c }: { r: number; c: number }) {
  const rand = seededRandom(r * BRICK_COLS + c + 777);
  const isOffset = r % 2 === 1;
  const gap = 0.08; // 줄눈 두께
  const bw = BRICK_W - gap;
  const bh = BRICK_H - gap;
  const bx = c * BRICK_W + gap / 2 + (isOffset ? BRICK_W / 2 : 0);
  const by = r * BRICK_H + gap / 2;

  // 팔레트에서 랜덤 선택 + 미세 변화
  const base = BRICK_PALETTE[Math.floor(rand() * BRICK_PALETTE.length)];
  const vr = Math.floor((rand() - 0.5) * 20);
  const vg = Math.floor((rand() - 0.5) * 18);
  const vb = Math.floor((rand() - 0.5) * 15);
  const cr = Math.min(255, Math.max(0, base.r + vr));
  const cg = Math.min(255, Math.max(0, base.g + vg));
  const cb = Math.min(255, Math.max(0, base.b + vb));

  const filterId = `wc-${r}-${c}`;

  return (
    <g>
      {/* SVG filter: 수채화 느낌 */}
      <defs>
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency={0.04 + rand() * 0.03} numOctaves={3} seed={r * 100 + c} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={0.15} xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation={0.02} />
        </filter>
      </defs>

      {/* 벽돌 본체 */}
      <rect
        x={bx}
        y={by}
        width={bw}
        height={bh}
        rx={0.04}
        fill={`rgb(${cr}, ${cg}, ${cb})`}
        filter={`url(#${filterId})`}
      />

      {/* 수채화 번짐 효과 1: 밝은 얼룩 */}
      <ellipse
        cx={bx + rand() * bw}
        cy={by + rand() * bh}
        rx={0.3 + rand() * 0.5}
        ry={0.15 + rand() * 0.25}
        fill={`rgba(255, 248, 235, ${0.15 + rand() * 0.2})`}
        transform={`rotate(${rand() * 30 - 15}, ${bx + bw / 2}, ${by + bh / 2})`}
      />

      {/* 수채화 번짐 효과 2: 어두운 얼룩 */}
      <ellipse
        cx={bx + 0.3 + rand() * (bw - 0.6)}
        cy={by + 0.1 + rand() * (bh - 0.2)}
        rx={0.2 + rand() * 0.4}
        ry={0.08 + rand() * 0.15}
        fill={`rgba(${base.r - 30}, ${base.g - 30}, ${base.b - 20}, ${0.1 + rand() * 0.15})`}
        transform={`rotate(${rand() * 40 - 20}, ${bx + bw / 2}, ${by + bh / 2})`}
      />

      {/* 물감 흘러내린 느낌: 세로 선 */}
      {rand() > 0.6 && (
        <line
          x1={bx + 0.3 + rand() * (bw - 0.6)}
          y1={by + bh * 0.3}
          x2={bx + 0.3 + rand() * (bw - 0.6)}
          y2={by + bh * (0.7 + rand() * 0.3)}
          stroke={`rgba(${base.r - 15}, ${base.g - 20}, ${base.b - 15}, ${0.08 + rand() * 0.1})`}
          strokeWidth={0.06 + rand() * 0.05}
          strokeLinecap="round"
        />
      )}

      {/* 벽돌 테두리 (연한 그림자) */}
      <rect
        x={bx}
        y={by}
        width={bw}
        height={bh}
        rx={0.04}
        fill="none"
        stroke={`rgba(${base.r - 40}, ${base.g - 40}, ${base.b - 30}, 0.15)`}
        strokeWidth={0.03}
      />

      {/* 벽돌 질감: 미세 결 */}
      <line
        x1={bx + rand() * 0.4}
        y1={by + 0.15 + rand() * (bh - 0.3)}
        x2={bx + bw * 0.5 + rand() * (bw * 0.5)}
        y2={by + 0.15 + rand() * (bh - 0.3)}
        stroke={`rgba(${base.r - 20}, ${base.g - 25}, ${base.b - 15}, ${0.06 + rand() * 0.08})`}
        strokeWidth={0.02}
        strokeLinecap="round"
      />

      {/* 두번째 결 */}
      {rand() > 0.4 && (
        <line
          x1={bx + rand() * 0.3}
          y1={by + 0.3 + rand() * (bh - 0.5)}
          x2={bx + bw * 0.4 + rand() * (bw * 0.6)}
          y2={by + 0.25 + rand() * (bh - 0.4)}
          stroke={`rgba(${base.r - 15}, ${base.g - 18}, ${base.b - 10}, ${0.04 + rand() * 0.06})`}
          strokeWidth={0.015}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

// ─── 균열 네트워크: 시작점에서 뻗어나가는 트리 구조 ───

interface CrackSegment {
  x1: number; y1: number;
  x2: number; y2: number;
  mx: number; my: number; // 꺾임점
  width: number;
  depth: number; // 0=메인, 1=가지, 2=잔가지
}

function generateCrackTree(pct: number): CrackSegment[] {
  if (pct <= 0) return [];
  const rand = seededRandom(SEED + 999);
  const segments: CrackSegment[] = [];

  // 균열 시작점들 (벽의 약한 지점: 상단, 모서리 근처)
  const startPoints = [
    { x: VW * 0.35, y: 0.2 },       // 상단 좌
    { x: VW * 0.7, y: 0.3 },        // 상단 우
    { x: VW * 0.5, y: VH * 0.3 },   // 중앙
    { x: 0.3, y: VH * 0.4 },        // 좌측
    { x: VW - 0.3, y: VH * 0.35 },  // 우측
  ];

  // pct에 따라 활성화할 시작점 수
  const activeStarts = Math.max(1, Math.ceil((pct / 100) * startPoints.length));

  for (let s = 0; s < activeStarts; s++) {
    const start = startPoints[s];
    const maxDepth = pct < 10 ? 1 : pct < 25 ? 2 : 3;
    const branchChance = 0.3 + (pct / 100) * 0.4;

    // 재귀적으로 가지를 뻗는 함수
    function growCrack(
      x: number, y: number,
      angle: number, // 진행 방향 (라디안)
      depth: number,
      length: number,
      width: number,
    ) {
      if (depth > maxDepth) return;
      if (segments.length > 80) return; // 성능 제한

      // 주로 아래쪽 + 좌우로 뻗어나감
      const stepLen = length * (0.6 + rand() * 0.8);
      const bend = (rand() - 0.5) * 0.8; // 방향 꺾임

      const newAngle = angle + bend;
      const x2 = x + Math.cos(newAngle) * stepLen;
      const y2 = y + Math.sin(newAngle) * stepLen;

      // 벽 범위 밖이면 중단
      if (x2 < -0.5 || x2 > VW + 0.5 || y2 < -0.5 || y2 > VH + 0.5) return;

      // 중간 꺾임점 (직선이 아닌 지그재그)
      const mx = (x + x2) / 2 + (rand() - 0.5) * stepLen * 0.4;
      const my = (y + y2) / 2 + (rand() - 0.5) * stepLen * 0.3;

      segments.push({ x1: x, y1: y, x2, y2, mx, my, width, depth });

      // 직진 계속
      if (rand() < 0.7 + depth * 0.1) {
        growCrack(x2, y2, newAngle + (rand() - 0.5) * 0.5, depth, length * 0.85, width * 0.9);
      }

      // 가지 분기
      if (rand() < branchChance && depth < maxDepth) {
        const branchAngle = newAngle + (rand() > 0.5 ? 1 : -1) * (0.5 + rand() * 1.0);
        growCrack(x2, y2, branchAngle, depth + 1, length * 0.6, width * 0.6);
      }

      // 추가 잔가지
      if (rand() < 0.25 && depth < maxDepth) {
        const branchAngle2 = newAngle + (rand() > 0.5 ? 1 : -1) * (0.8 + rand() * 0.8);
        growCrack(
          (x + x2) / 2 + (rand() - 0.5) * 0.3,
          (y + y2) / 2 + (rand() - 0.5) * 0.2,
          branchAngle2, depth + 1, length * 0.4, width * 0.45,
        );
      }
    }

    // 각 시작점에서 2~3 방향으로 뻗어나감
    const numBranches = 2 + Math.floor(rand() * 2);
    for (let b = 0; b < numBranches; b++) {
      const angle = Math.PI * 0.3 + rand() * Math.PI * 0.4; // 주로 아래쪽
      const baseLen = 1.5 + rand() * 2;
      const baseWidth = 0.06 + (pct / 100) * 0.04;
      growCrack(start.x, start.y, angle, 0, baseLen, baseWidth);
    }
  }

  return segments;
}

function CrackNetwork({ pct, cellStates }: { pct: number; cellStates: Map<string, string> }) {
  const crackPct = Math.min(pct, 40); // 균열은 40%까지만 성장
  const segments = useMemo(() => generateCrackTree(crackPct), [crackPct]);

  return (
    <>
      {/* 균열 그림자 (넓고 흐린 선 → 벽이 벌어진 느낌) */}
      {segments.map((seg, i) => (
        <path
          key={`shadow-${i}`}
          d={`M${seg.x1},${seg.y1} Q${seg.mx},${seg.my} ${seg.x2},${seg.y2}`}
          stroke="#B8A48C"
          strokeWidth={seg.width * 3}
          fill="none"
          opacity={0.12}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* 메인 균열선 (어두운 선) */}
      {segments.map((seg, i) => (
        <path
          key={`crack-${i}`}
          d={`M${seg.x1},${seg.y1} Q${seg.mx},${seg.my} ${seg.x2},${seg.y2}`}
          stroke="#4A3828"
          strokeWidth={seg.width}
          fill="none"
          opacity={seg.depth === 0 ? 0.6 : seg.depth === 1 ? 0.4 : 0.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* 균열 하이라이트 (한쪽 가장자리 밝은 선 → 입체감) */}
      {segments.filter(s => s.depth <= 1).map((seg, i) => (
        <path
          key={`hi-${i}`}
          d={`M${seg.x1 + 0.03},${seg.y1 - 0.02} Q${seg.mx + 0.03},${seg.my - 0.02} ${seg.x2 + 0.03},${seg.y2 - 0.02}`}
          stroke="#F5EDE0"
          strokeWidth={seg.width * 0.4}
          fill="none"
          opacity={0.3}
          strokeLinecap="round"
        />
      ))}

      {/* 경계 파편 */}
      {Array.from(cellStates).map(([key, state]) => {
        if (state !== 'brick' && state !== 'gone') return null;
        const [r, c] = key.split('-').map(Number);
        const neighbors = [
          [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
        ];
        const isBorder = neighbors.some(([nr, nc]) => {
          if (nr < 0 || nr >= BRICK_ROWS || nc < 0 || nc >= BRICK_COLS) return false;
          const ns = cellStates.get(`${nr}-${nc}`);
          return ns === 'intact' || ns === 'cracked';
        });
        if (!isBorder) return null;

        const rand = seededRandom(r * BRICK_COLS + c + 500);
        const isOffset = r % 2 === 1;
        const bx = c * BRICK_W + (isOffset ? BRICK_W / 2 : 0);
        const by = r * BRICK_H;
        const debris = [];
        const count = 2 + Math.floor(rand() * 3);

        for (let i = 0; i < count; i++) {
          const dx = bx + rand() * BRICK_W;
          const dy = by + rand() * BRICK_H;
          const w = 0.08 + rand() * 0.12;
          const h = 0.04 + rand() * 0.06;
          const pal = BRICK_PALETTE[Math.floor(rand() * BRICK_PALETTE.length)];
          debris.push(
            <rect
              key={`debris-${key}-${i}`}
              x={dx} y={dy} width={w} height={h}
              fill={`rgb(${pal.r}, ${pal.g}, ${pal.b})`}
              opacity={0.3 + rand() * 0.35}
              rx={0.01}
              transform={`rotate(${rand() * 50 - 25}, ${dx + w / 2}, ${dy + h / 2})`}
            />
          );
        }

        return <g key={`debris-${key}`}>{debris}</g>;
      })}
    </>
  );
}

export function CrumblingWall({ percentage, wallSrc = '/orange-tree-wall.png', height = 380 }: CrumblingWallProps) {
  const pct = Math.max(0, Math.min(100, Math.round(percentage / 5) * 5));

  const cellStates = useMemo(() => {
    const totalCells = BRICK_COLS * BRICK_ROWS;
    const states = new Map<string, 'intact' | 'cracked' | 'brick' | 'gone'>();

    const crackProgress = Math.min(pct / 30, 1);
    const crackCount = Math.floor(crackProgress * totalCells * 0.6);

    const brickProgress = pct < 15 ? 0 : Math.min((pct - 15) / 50, 1);
    const brickCount = Math.floor(brickProgress * totalCells * 0.7);

    const goneProgress = pct < 40 ? 0 : Math.min((pct - 40) / 60, 1);
    const goneCount = Math.floor(goneProgress * totalCells);

    for (let i = 0; i < totalCells; i++) {
      const { row, col } = crumbleOrder[i];
      const key = `${row}-${col}`;

      if (i < goneCount) {
        states.set(key, 'gone');
      } else if (i < brickCount) {
        states.set(key, 'brick');
      } else if (i < crackCount) {
        states.set(key, 'cracked');
      } else {
        states.set(key, 'intact');
      }
    }

    return states;
  }, [pct]);

  const maskId = `wall-mask-${pct}`;
  const brickMaskId = `brick-mask-${pct}`;

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {/* 레이어 1: 하늘 (벽 뒤, 수채화풍 그라데이션) */}
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8DFF0" />
            <stop offset="50%" stopColor="#DDE9EE" />
            <stop offset="100%" stopColor="#EAE4D8" />
          </linearGradient>
          <filter id="sky-texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={7} />
            <feColorMatrix type="saturate" values="0.1" />
            <feBlend in="SourceGraphic" mode="overlay" />
          </filter>
        </defs>
        <rect x="0" y="0" width={VW} height={VH} fill="url(#sky-grad)" filter="url(#sky-texture)" />
      </svg>

      {/* 레이어 2: 벽돌 (brick + gone 상태인 셀에만 표시, gone은 나중에 사라짐) */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="none"
      >
        <defs>
          <mask id={brickMaskId}>
            <rect x="0" y="0" width={VW} height={VH} fill="black" />
            {Array.from(cellStates).map(([key, state]) => {
              if (state !== 'brick') return null;
              const [r, c] = key.split('-').map(Number);
              const isOffset = r % 2 === 1;
              const bx = c * BRICK_W + (isOffset ? BRICK_W / 2 : 0);
              const by = r * BRICK_H;
              return <rect key={key} x={bx} y={by} width={BRICK_W} height={BRICK_H} fill="white" />;
            })}
          </mask>
        </defs>

        {/* 줄눈 배경 */}
        <rect x="0" y="0" width={VW} height={VH} fill={MORTAR_COLOR} mask={`url(#${brickMaskId})`} />

        {/* 벽돌 셀 */}
        <g mask={`url(#${brickMaskId})`}>
          {Array.from({ length: BRICK_ROWS }, (_, r) =>
            Array.from({ length: BRICK_COLS }, (_, c) => (
              <BrickCell key={`brick-${r}-${c}`} r={r} c={c} />
            ))
          )}
        </g>
      </svg>

      {/* 레이어 3: 벽 표면 */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="none"
      >
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width={VW} height={VH} fill="white" />
            {Array.from(cellStates).map(([key, state]) => {
              if (state !== 'brick' && state !== 'gone') return null;
              const [r, c] = key.split('-').map(Number);
              const rand = seededRandom(r * BRICK_COLS + c + SEED);
              const isOffset = r % 2 === 1;
              const bx = c * BRICK_W + (isOffset ? BRICK_W / 2 : 0);
              const by = r * BRICK_H;
              // 불규칙한 뜯어짐 가장자리
              const dx = (rand() - 0.5) * 0.15;
              const dy = (rand() - 0.5) * 0.1;
              return (
                <rect
                  key={key}
                  x={bx + dx - 0.05}
                  y={by + dy - 0.05}
                  width={BRICK_W + 0.1}
                  height={BRICK_H + 0.1}
                  fill="black"
                  rx={0.05}
                />
              );
            })}
          </mask>
        </defs>

        <image
          href={wallSrc}
          x="0"
          y="0"
          width={VW}
          height={VH}
          preserveAspectRatio="xMidYMid slice"
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* 레이어 4: 균열 (트리 구조로 뻗어나가는 갈라짐) + 파편 */}
      {pct > 0 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="none"
        >
          <CrackNetwork pct={pct} cellStates={cellStates} />
        </svg>
      )}
    </div>
  );
}
