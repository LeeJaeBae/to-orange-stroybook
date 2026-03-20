import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface StationeryStyle {
  bgColor?: string;
  bgGradient?: string;
  pattern?: string;
  patternColor?: string;
  patternOpacity?: number;
  texture?: string;
  border?: {
    style: string;
    color: string;
    width: string;
  };
  cornerDecoration?: {
    type: string;
    color: string;
  };
  // AI 생성 커스텀 SVG
  customSvg?: {
    background?: string; // 배경 SVG (전체 커버)
    pattern?: string; // 반복 패턴 SVG
    corners?: string; // 코너 장식 SVG
    border?: string; // 테두리 장식 SVG
  };
  // AI 생성 이미지 배경 (Nano Banana)
  backgroundImage?: string;
  frontImage?: string;
  backImage?: string;
}

interface StationeryRendererProps {
  style: StationeryStyle;
  className?: string;
  children?: React.ReactNode;
  showCornerDecorations?: boolean;
  side?: 'front' | 'back';
}

// 텍스처 CSS 생성
function getTextureStyle(texture?: string): React.CSSProperties {
  if (!texture || texture === "none") return {};

  const textures: Record<string, React.CSSProperties> = {
    paper: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
      backgroundSize: "200px 200px",
    },
    watercolor: {
      backgroundImage: `radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 80%, rgba(255,255,255,0.2) 0%, transparent 40%)`,
    },
    linen: {
      backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px),
                        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)`,
    },
    canvas: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.05'%3E%3Cpath d='M5 0h1L0 5v1z'/%3E%3Cpath d='M6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")`,
    },
    parchment: {
      backgroundImage: `linear-gradient(90deg, rgba(139,119,101,0.03) 0%, transparent 50%, rgba(139,119,101,0.03) 100%),
                        linear-gradient(rgba(139,119,101,0.02) 0%, transparent 50%, rgba(139,119,101,0.02) 100%)`,
    },
  };

  return textures[texture] || {};
}

// 테두리 CSS 생성
function getBorderStyle(border?: StationeryStyle["border"]): React.CSSProperties {
  if (!border || border.style === "none") return {};

  const widthMap: Record<string, string> = {
    thin: "1px",
    medium: "2px",
    thick: "4px",
  };

  return {
    borderStyle: border.style,
    borderWidth: widthMap[border.width] || "1px",
    borderColor: `var(--tw-${border.color.replace("-", "-")}, ${getColorValue(border.color)})`,
  };
}

// Tailwind 색상을 HEX로 변환 (간단한 버전)
function getColorValue(colorClass: string): string {
  const colorMap: Record<string, string> = {
    "gray-300": "#d1d5db",
    "gray-400": "#9ca3af",
    "gray-500": "#6b7280",
    "red-300": "#fca5a5",
    "red-400": "#f87171",
    "red-500": "#ef4444",
    "orange-300": "#fdba74",
    "orange-400": "#fb923c",
    "orange-500": "#f97316",
    "amber-300": "#fcd34d",
    "amber-400": "#fbbf24",
    "amber-500": "#f59e0b",
    "yellow-300": "#fde047",
    "yellow-400": "#facc15",
    "yellow-500": "#eab308",
    "lime-300": "#bef264",
    "lime-400": "#a3e635",
    "lime-500": "#84cc16",
    "green-300": "#86efac",
    "green-400": "#4ade80",
    "green-500": "#22c55e",
    "emerald-300": "#6ee7b7",
    "emerald-400": "#34d399",
    "emerald-500": "#10b981",
    "teal-300": "#5eead4",
    "teal-400": "#2dd4bf",
    "teal-500": "#14b8a6",
    "cyan-300": "#67e8f9",
    "cyan-400": "#22d3ee",
    "cyan-500": "#06b6d4",
    "sky-300": "#7dd3fc",
    "sky-400": "#38bdf8",
    "sky-500": "#0ea5e9",
    "blue-300": "#93c5fd",
    "blue-400": "#60a5fa",
    "blue-500": "#3b82f6",
    "indigo-300": "#a5b4fc",
    "indigo-400": "#818cf8",
    "indigo-500": "#6366f1",
    "violet-300": "#c4b5fd",
    "violet-400": "#a78bfa",
    "violet-500": "#8b5cf6",
    "purple-300": "#d8b4fe",
    "purple-400": "#c084fc",
    "purple-500": "#a855f7",
    "fuchsia-300": "#f0abfc",
    "fuchsia-400": "#e879f9",
    "fuchsia-500": "#d946ef",
    "pink-300": "#f9a8d4",
    "pink-400": "#f472b6",
    "pink-500": "#ec4899",
    "rose-300": "#fda4af",
    "rose-400": "#fb7185",
    "rose-500": "#f43f5e",
  };

  return colorMap[colorClass] || "#d1d5db";
}

// 패턴 렌더링 컴포넌트
function PatternOverlay({
  pattern,
  patternColor,
  patternOpacity = 0.2,
}: {
  pattern?: string;
  patternColor?: string;
  patternOpacity?: number;
}) {
  if (!pattern || pattern === "none") return null;

  const color = patternColor ? getColorValue(patternColor) : "#9ca3af";
  const opacity = patternOpacity;

  const patternStyles: Record<string, React.CSSProperties> = {
    lines: {
      backgroundImage: `repeating-linear-gradient(0deg, ${color} 0px, ${color} 1px, transparent 1px, transparent 24px)`,
      opacity,
    },
    grid: {
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: "24px 24px",
      opacity,
    },
    dots: {
      backgroundImage: `radial-gradient(${color} 1.5px, transparent 1.5px)`,
      backgroundSize: "12px 12px",
      opacity,
    },
    waves: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='12' viewBox='0 0 40 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6 Q10 0 20 6 T40 6' stroke='${encodeURIComponent(color)}' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
      backgroundSize: "40px 12px",
      opacity,
    },
    hearts: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E")`,
      backgroundSize: "24px 24px",
      opacity,
    },
    stars: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0l2.245 6.91h7.266l-5.878 4.27 2.245 6.91L10 13.82l-5.878 4.27 2.245-6.91L.489 6.91h7.266L10 0z' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E")`,
      backgroundSize: "20px 20px",
      opacity,
    },
    flowers: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='3' fill='${encodeURIComponent(color)}'/%3E%3Ccircle cx='12' cy='6' r='2.5' fill='${encodeURIComponent(color)}' opacity='0.7'/%3E%3Ccircle cx='17' cy='9' r='2.5' fill='${encodeURIComponent(color)}' opacity='0.7'/%3E%3Ccircle cx='17' cy='15' r='2.5' fill='${encodeURIComponent(color)}' opacity='0.7'/%3E%3Ccircle cx='12' cy='18' r='2.5' fill='${encodeURIComponent(color)}' opacity='0.7'/%3E%3Ccircle cx='7' cy='15' r='2.5' fill='${encodeURIComponent(color)}' opacity='0.7'/%3E%3Ccircle cx='7' cy='9' r='2.5' fill='${encodeURIComponent(color)}' opacity='0.7'/%3E%3C/svg%3E")`,
      backgroundSize: "24px 24px",
      opacity,
    },
    leaves: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E")`,
      backgroundSize: "24px 24px",
      opacity,
    },
    clouds: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='20' viewBox='0 0 40 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16a4 4 0 01-4-4 4 4 0 014-4h1a6 6 0 0111.6-2A5 5 0 0126 16H8z' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E")`,
      backgroundSize: "40px 20px",
      opacity,
    },
    confetti: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='5' y='3' width='4' height='8' rx='1' fill='%23f87171' transform='rotate(15 7 7)'/%3E%3Crect x='20' y='10' width='3' height='6' rx='1' fill='%2360a5fa' transform='rotate(-20 21.5 13)'/%3E%3Crect x='12' y='18' width='4' height='7' rx='1' fill='%234ade80' transform='rotate(30 14 21.5)'/%3E%3Ccircle cx='25' cy='5' r='2' fill='%23fbbf24'/%3E%3Ccircle cx='8' cy='22' r='1.5' fill='%23c084fc'/%3E%3C/svg%3E")`,
      backgroundSize: "30px 30px",
      opacity: opacity + 0.2, // confetti는 좀 더 진하게
    },
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={patternStyles[pattern]}
    />
  );
}

// 코너 장식 렌더링 컴포넌트
function CornerDecoration({
  type,
  color,
}: {
  type?: string;
  color?: string;
}) {
  if (!type || type === "none") return null;

  const decorationColor = color ? getColorValue(color) : "#f9a8d4";

  const decorations: Record<string, React.ReactNode> = {
    flower: (
      <>
        <div className="absolute top-2 left-2 w-8 h-8" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="4" />
            <circle cx="12" cy="4" r="3" opacity="0.8" />
            <circle cx="19" cy="8" r="3" opacity="0.8" />
            <circle cx="19" cy="16" r="3" opacity="0.8" />
            <circle cx="12" cy="20" r="3" opacity="0.8" />
            <circle cx="5" cy="16" r="3" opacity="0.8" />
            <circle cx="5" cy="8" r="3" opacity="0.8" />
          </svg>
        </div>
        <div className="absolute top-2 right-2 w-8 h-8 rotate-90" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="4" />
            <circle cx="12" cy="4" r="3" opacity="0.8" />
            <circle cx="19" cy="8" r="3" opacity="0.8" />
            <circle cx="19" cy="16" r="3" opacity="0.8" />
            <circle cx="12" cy="20" r="3" opacity="0.8" />
            <circle cx="5" cy="16" r="3" opacity="0.8" />
            <circle cx="5" cy="8" r="3" opacity="0.8" />
          </svg>
        </div>
        <div className="absolute bottom-2 left-2 w-8 h-8 -rotate-90" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="4" />
            <circle cx="12" cy="4" r="3" opacity="0.8" />
            <circle cx="19" cy="8" r="3" opacity="0.8" />
            <circle cx="19" cy="16" r="3" opacity="0.8" />
            <circle cx="12" cy="20" r="3" opacity="0.8" />
            <circle cx="5" cy="16" r="3" opacity="0.8" />
            <circle cx="5" cy="8" r="3" opacity="0.8" />
          </svg>
        </div>
        <div className="absolute bottom-2 right-2 w-8 h-8 rotate-180" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="4" />
            <circle cx="12" cy="4" r="3" opacity="0.8" />
            <circle cx="19" cy="8" r="3" opacity="0.8" />
            <circle cx="19" cy="16" r="3" opacity="0.8" />
            <circle cx="12" cy="20" r="3" opacity="0.8" />
            <circle cx="5" cy="16" r="3" opacity="0.8" />
            <circle cx="5" cy="8" r="3" opacity="0.8" />
          </svg>
        </div>
      </>
    ),
    ribbon: (
      <>
        <div className="absolute top-0 left-0 w-12 h-12" style={{ color: decorationColor }}>
          <svg viewBox="0 0 48 48" fill="currentColor">
            <path d="M0 0 L48 0 L48 8 L8 48 L0 48 Z" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-12 h-12 rotate-90" style={{ color: decorationColor }}>
          <svg viewBox="0 0 48 48" fill="currentColor">
            <path d="M0 0 L48 0 L48 8 L8 48 L0 48 Z" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-12 h-12 -rotate-90" style={{ color: decorationColor }}>
          <svg viewBox="0 0 48 48" fill="currentColor">
            <path d="M0 0 L48 0 L48 8 L8 48 L0 48 Z" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-12 h-12 rotate-180" style={{ color: decorationColor }}>
          <svg viewBox="0 0 48 48" fill="currentColor">
            <path d="M0 0 L48 0 L48 8 L8 48 L0 48 Z" opacity="0.6" />
          </svg>
        </div>
      </>
    ),
    heart: (
      <>
        <div className="absolute top-2 left-2 w-6 h-6" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <div className="absolute top-2 right-2 w-6 h-6" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <div className="absolute bottom-2 left-2 w-6 h-6" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <div className="absolute bottom-2 right-2 w-6 h-6" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </>
    ),
    star: (
      <>
        <div className="absolute top-2 left-2 w-6 h-6" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
          </svg>
        </div>
        <div className="absolute top-2 right-2 w-6 h-6" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
          </svg>
        </div>
        <div className="absolute bottom-2 left-2 w-6 h-6" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
          </svg>
        </div>
        <div className="absolute bottom-2 right-2 w-6 h-6" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
          </svg>
        </div>
      </>
    ),
    leaf: (
      <>
        <div className="absolute top-2 left-2 w-8 h-8 -rotate-45" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
          </svg>
        </div>
        <div className="absolute top-2 right-2 w-8 h-8 rotate-45" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
          </svg>
        </div>
        <div className="absolute bottom-2 left-2 w-8 h-8 rotate-[225deg]" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
          </svg>
        </div>
        <div className="absolute bottom-2 right-2 w-8 h-8 rotate-[135deg]" style={{ color: decorationColor }}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
          </svg>
        </div>
      </>
    ),
    vine: (
      <>
        <div className="absolute top-0 left-0 w-16 h-16" style={{ color: decorationColor }}>
          <svg viewBox="0 0 64 64" fill="currentColor">
            <path d="M0 0 Q20 0 20 20 Q20 40 0 40" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.6" />
            <circle cx="10" cy="10" r="4" opacity="0.8" />
            <circle cx="15" cy="25" r="3" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 scale-x-[-1]" style={{ color: decorationColor }}>
          <svg viewBox="0 0 64 64" fill="currentColor">
            <path d="M0 0 Q20 0 20 20 Q20 40 0 40" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.6" />
            <circle cx="10" cy="10" r="4" opacity="0.8" />
            <circle cx="15" cy="25" r="3" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-16 h-16 scale-y-[-1]" style={{ color: decorationColor }}>
          <svg viewBox="0 0 64 64" fill="currentColor">
            <path d="M0 0 Q20 0 20 20 Q20 40 0 40" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.6" />
            <circle cx="10" cy="10" r="4" opacity="0.8" />
            <circle cx="15" cy="25" r="3" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16 scale-[-1]" style={{ color: decorationColor }}>
          <svg viewBox="0 0 64 64" fill="currentColor">
            <path d="M0 0 Q20 0 20 20 Q20 40 0 40" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.6" />
            <circle cx="10" cy="10" r="4" opacity="0.8" />
            <circle cx="15" cy="25" r="3" opacity="0.6" />
          </svg>
        </div>
      </>
    ),
  };

  return <>{decorations[type]}</>;
}

// AI 생성 커스텀 SVG 렌더링 컴포넌트
function CustomSvgLayer({ svg, type }: { svg?: string; type: 'background' | 'pattern' | 'corners' | 'border' }) {
  const sanitizedSvg = useMemo(() => {
    if (!svg) return null;

    // 기본적인 SVG 검증 (악성 스크립트 방지)
    if (svg.includes('<script') || svg.includes('javascript:') || svg.includes('on')) {
      console.warn('Potentially unsafe SVG content detected');
      return null;
    }

    // SVG 태그가 없으면 감싸기
    if (!svg.trim().startsWith('<svg')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 400">${svg}</svg>`;
    }

    return svg;
  }, [svg]);

  if (!sanitizedSvg) return null;

  const layerStyles: Record<string, React.CSSProperties> = {
    background: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    },
    pattern: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      opacity: 0.6,
    },
    corners: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    },
    border: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    },
  };

  return (
    <div
      style={layerStyles[type]}
      dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
    />
  );
}

export function StationeryRenderer({
  style,
  className,
  children,
  showCornerDecorations = true,
  side = 'front',
}: StationeryRendererProps) {
  const textureStyle = getTextureStyle(style.texture);
  const borderStyle = getBorderStyle(style.border);

  // AI 생성 SVG가 있으면 커스텀 렌더링
  const hasCustomSvg = style.customSvg && (
    style.customSvg.background ||
    style.customSvg.pattern ||
    style.customSvg.corners ||
    style.customSvg.border
  );

  // AI 생성 이미지 배경
  const resolvedBackgroundImage =
    side === 'back'
      ? style.backImage || style.frontImage || style.backgroundImage
      : style.frontImage || style.backgroundImage || style.backImage;
  const hasBackgroundImage = !!resolvedBackgroundImage;

  // 배경 이미지 스타일
  const backgroundImageStyle: React.CSSProperties = hasBackgroundImage ? {
    backgroundImage: `url(${resolvedBackgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } : {};

  return (
    <div
      className={cn(
        "relative overflow-hidden flex flex-col",
        // 이미지 배경이나 커스텀 SVG 배경이 있으면 Tailwind 배경 사용 안함
        !hasBackgroundImage && !style.customSvg?.background && (style.bgGradient || style.bgColor || "bg-white"),
        className
      )}
      style={{ ...textureStyle, ...borderStyle, ...backgroundImageStyle }}
    >
      {/* AI 생성 커스텀 SVG 레이어들 (이미지 배경이 없을 때만) */}
      {!hasBackgroundImage && hasCustomSvg && (
        <>
          <CustomSvgLayer svg={style.customSvg?.background} type="background" />
          <CustomSvgLayer svg={style.customSvg?.pattern} type="pattern" />
          <CustomSvgLayer svg={style.customSvg?.border} type="border" />
          {showCornerDecorations && (
            <CustomSvgLayer svg={style.customSvg?.corners} type="corners" />
          )}
        </>
      )}

      {/* 기존 패턴 오버레이 (이미지 배경이나 커스텀 SVG 패턴이 없을 때만) */}
      {!hasBackgroundImage && !style.customSvg?.pattern && (
        <PatternOverlay
          pattern={style.pattern}
          patternColor={style.patternColor}
          patternOpacity={style.patternOpacity}
        />
      )}

      {/* 기존 코너 장식 (이미지 배경이나 커스텀 SVG 코너가 없을 때만) */}
      {!hasBackgroundImage && !style.customSvg?.corners && showCornerDecorations && style.cornerDecoration && (
        <CornerDecoration
          type={style.cornerDecoration.type}
          color={style.cornerDecoration.color}
        />
      )}

      {/* 콘텐츠 */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
}

export { getColorValue };
