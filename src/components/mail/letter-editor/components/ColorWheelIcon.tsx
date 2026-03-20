// CMY 색상 겹침 아이콘 (3원색 겹침 스타일)
export function ColorWheelIcon({ size = 16 }: { size?: number }) {
  const r = size * 0.32;
  const cx = size / 2;
  const cy = size / 2;
  const offset = size * 0.18;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy - offset} r={r} fill="#00CFFF" style={{ mixBlendMode: 'multiply' }} />
      <circle cx={cx - offset * 0.87} cy={cy + offset * 0.5} r={r} fill="#FF0090" style={{ mixBlendMode: 'multiply' }} />
      <circle cx={cx + offset * 0.87} cy={cy + offset * 0.5} r={r} fill="#FFE000" style={{ mixBlendMode: 'multiply' }} />
    </svg>
  );
}
