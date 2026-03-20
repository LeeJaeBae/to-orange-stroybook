'use client';

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrepChecklistProps {
  title: string;
  items: string[];
}

export function PrepChecklist({ title, items }: PrepChecklistProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => toggle(idx)}
            className="flex items-center gap-2.5 w-full text-left"
          >
            <div className={cn(
              "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors",
              checked.has(idx)
                ? "bg-orange-500 border-orange-500"
                : "border-gray-300"
            )}>
              {checked.has(idx) && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={cn(
              "text-sm transition-colors",
              checked.has(idx) ? "text-muted-foreground line-through" : "text-foreground"
            )}>
              {item}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        {checked.size}/{items.length}개 완료
      </p>
    </div>
  );
}
