"use client"

import { cn } from "@/lib/utils"

interface GeneratingLoaderProps {
  className?: string
}

export function GeneratingLoader({ className }: GeneratingLoaderProps) {
  return (
    <div
      data-slot="generating-loader"
      className={cn("flex flex-col items-center justify-center gap-3", className)}
    >
      {/* AI Brain Pulse Loader */}
      <div className="relative w-16 h-16">
        {/* Outer glow rings */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400/20 to-amber-400/20 animate-ping" />
        <div className="absolute inset-1 rounded-full bg-gradient-to-r from-orange-400/30 to-amber-400/30 animate-pulse" />

        {/* Core circle */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-400/50">
          {/* Inner shimmer */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{
                animation: "shimmer 2s ease-in-out infinite",
                transform: "translateX(-100%)",
              }}
            />
          </div>

          {/* AI Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v2m0 14v2M3 12h2m14 0h2" className="animate-pulse" />
              <circle cx="12" cy="12" r="4" className="fill-white/20" />
              <path d="M12 8v8M8 12h8" className="stroke-white" />
            </svg>
          </div>
        </div>

        {/* Orbiting particles */}
        <div
          className="absolute inset-0"
          style={{ animation: "spin 3s linear infinite" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-orange-300 shadow-sm shadow-orange-400" />
        </div>
        <div
          className="absolute inset-0"
          style={{ animation: "spin 4s linear infinite reverse" }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-sm shadow-amber-400" />
        </div>
      </div>

      {/* Text with animated dots */}
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <span>AI가 편지를 검토하고 있어요</span>
        <span className="flex gap-0.5">
          <span
            className="w-1 h-1 rounded-full bg-orange-400 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1 h-1 rounded-full bg-orange-400 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1 h-1 rounded-full bg-orange-400 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </span>
      </div>
    </div>
  )
}
