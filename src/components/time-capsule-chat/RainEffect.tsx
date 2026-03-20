"use client";

import { useEffect, useState } from "react";

interface RainDropProps {
  delay: number;
  left: number;
  duration: number;
}

function RainDrop({ delay, left, duration }: RainDropProps) {
  return (
    <div
      className="absolute w-[1px] bg-gradient-to-b from-transparent via-gray-400/40 to-gray-400/60 will-change-transform"
      style={{
        left: `${left}%`,
        top: '-20px',
        height: '15px',
        animation: `rainFall ${duration}s linear ${delay}s infinite`,
      }}
    />
  );
}

export function RainEffect() {
  const [drops, setDrops] = useState<RainDropProps[]>([]);

  useEffect(() => {
    // 성능 개선: 50개 → 25개로 축소
    const newDrops: RainDropProps[] = [];
    for (let i = 0; i < 25; i++) {
      newDrops.push({
        delay: Math.random() * 2,
        left: Math.random() * 100,
        duration: 0.5 + Math.random() * 0.5,
      });
    }
    setDrops(newDrops);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {drops.map((drop, i) => (
        <RainDrop key={i} {...drop} />
      ))}
    </div>
  );
}
