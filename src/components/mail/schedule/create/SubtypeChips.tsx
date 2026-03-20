'use client';

import { cn } from "@/lib/utils";

interface SubtypeOption {
  value: string;
  label: string;
}

interface SubtypeChipsProps {
  label: string;
  options: SubtypeOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SubtypeChips({ label, options, value, onChange }: SubtypeChipsProps) {
  return (
    <div>
      <span className="text-sm text-muted-foreground mb-2 block">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value === value ? '' : opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              opt.value === value
                ? "bg-orange-500 text-white border-orange-500"
                : "border-border/60 text-foreground/70 hover:border-orange-300"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
