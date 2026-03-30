'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RelationshipData {
  label: string;
  count: number;
  img: string;
}

interface BadgeConfig {
  type: 'relationship' | 'event' | 'care' | 'custom';
  icon?: string;
  text?: string;
}

// ---------------------------------------------------------------------------
// Data (hero-specific, tightly coupled to presentation)
// ---------------------------------------------------------------------------

export const relationshipData: RelationshipData[] = [
  { label: '엄마', count: 156, img: '/main/banner/mother.png' },
  { label: '아빠', count: 89, img: '/main/banner/father.png' },
  { label: '연인', count: 67, img: '/main/banner/gf.png' },
  { label: '친구', count: 42, img: '/main/banner/friend.png' },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PingDot() {
  return (
    <span className="relative flex h-1.5 w-1.5 lg:h-2 lg:w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary lg:h-2 lg:w-2" />
    </span>
  );
}

// ---------------------------------------------------------------------------
// HeroBadge
// ---------------------------------------------------------------------------

export function HeroBadge({
  badge,
  currentRelation,
}: {
  badge: BadgeConfig;
  currentRelation: RelationshipData;
}) {
  if (badge.type === 'relationship') {
    return (
      <div className="flex items-center gap-1 lg:gap-1.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRelation.label}
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={currentRelation.img}
              alt={currentRelation.label}
              width={32}
              height={32}
              className="h-6 w-6 rounded-full object-cover lg:h-8 lg:w-8"
            />
          </motion.div>
        </AnimatePresence>
        <PingDot />
        <div className="h-4 min-w-[140px] overflow-hidden text-xs text-muted-foreground lg:h-5 lg:min-w-[180px] lg:text-sm">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentRelation.label}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-muted-foreground">현재 </span>
              <span className="font-bold text-primary">{currentRelation.count}</span>
              <span className="text-muted-foreground">명 접속 중</span>
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (badge.type === 'event') {
    return (
      <>
        <span className="text-xl lg:text-2xl">{badge.icon}</span>
        <PingDot />
        <span className="text-sm font-medium text-primary lg:text-base">{badge.text}</span>
      </>
    );
  }

  if (badge.type === 'care') {
    return (
      <>
        <span className="text-lg lg:text-xl">{badge.icon}</span>
        <span className="text-sm font-medium text-muted-foreground lg:text-base">{badge.text}</span>
      </>
    );
  }

  return null;
}
