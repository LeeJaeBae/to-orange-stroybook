'use client';

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface ScheduleFABProps {
  onClick?: () => void;
}

export function ScheduleFAB({ onClick }: ScheduleFABProps) {
  const router = useRouter();

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      onClick={() => onClick ? onClick() : router.push('/letter/schedule/new')}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white shadow-[0_4px_14px_rgba(251,146,60,0.4)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-40"
      aria-label="일정 등록"
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  );
}
