interface OrangeSphereProps {
  size?: "sm" | "md" | "lg";
}

export function OrangeSphere({ size = "md" }: OrangeSphereProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-40 h-40",
  };

  const blurClasses = {
    sm: "blur-xl",
    md: "blur-2xl",
    lg: "blur-3xl",
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      {/* Animated light behind */}
      <div
        className={`absolute -inset-1 ${blurClasses[size]} opacity-[0.06]`}
        style={{
          background: `
            radial-gradient(circle at 30% 30%,
              hsl(40, 80%, 75%) 0%,
              transparent 35%
            )
          `,
          animation: 'lightMove 6s ease-in-out infinite',
        }}
      />
      <div
        className={`absolute -inset-1 ${blurClasses[size]} opacity-[0.05]`}
        style={{
          background: `
            radial-gradient(circle at 70% 70%,
              hsl(30, 80%, 70%) 0%,
              transparent 35%
            )
          `,
          animation: 'lightMove2 7s ease-in-out infinite',
        }}
      />

      {/* Soft gradient blur */}
      <div
        className={`absolute inset-0 ${blurClasses[size]}`}
        style={{
          background: `
            radial-gradient(circle at center,
              hsl(30, 100%, 60%) 0%,
              hsl(25, 95%, 55%) 30%,
              hsl(20, 90%, 50%) 50%,
              transparent 70%
            )
          `,
          animation: 'breathe 4s ease-in-out infinite',
        }}
      />

      {/* Secondary layer for depth */}
      <div
        className={`absolute inset-2 ${blurClasses[size]}`}
        style={{
          background: `
            radial-gradient(circle at 40% 40%,
              hsl(35, 100%, 70%) 0%,
              hsl(30, 95%, 60%) 40%,
              transparent 60%
            )
          `,
          animation: 'breathe2 4s ease-in-out infinite',
        }}
      />
    </div>
  );
}
