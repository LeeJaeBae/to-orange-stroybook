import { ReactNode, useState, useEffect } from "react";

function useCurrentTime() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 10000);
    return () => clearInterval(id);
  }, []);
  return time;
}

interface MobileFrameProps {
  children: ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  const currentTime = useCurrentTime();

  return (
    <div className="w-[390px] h-[844px] bg-white rounded-[50px] overflow-hidden flex flex-col mobile-frame-shadow relative border-[12px] border-foreground/90">
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-8 z-50">
        <span className="text-sm font-semibold text-foreground">{currentTime}</span>
        <div className="w-[100px] h-[28px] bg-foreground/90 rounded-full absolute left-1/2 -translate-x-1/2 top-2" />
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            <div className="w-1 h-2 bg-foreground/80 rounded-sm" />
            <div className="w-1 h-2.5 bg-foreground/80 rounded-sm" />
            <div className="w-1 h-3 bg-foreground/80 rounded-sm" />
            <div className="w-1 h-3.5 bg-foreground/80 rounded-sm" />
          </div>
          <svg className="w-4 h-4 text-foreground/80" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l2.48 2.48c.18.18.43.29.71.29.27 0 .52-.11.7-.28.79-.74 1.69-1.36 2.66-1.85.33-.16.56-.5.56-.9v-3.1c1.45-.48 3-.73 4.6-.73s3.15.25 4.6.73v3.1c0 .4.23.74.56.9.98.49 1.87 1.12 2.67 1.85.18.18.43.28.7.28.28 0 .53-.11.71-.29l2.48-2.48c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z"/>
          </svg>
          <div className="w-6 h-3 bg-foreground/80 rounded-sm relative">
            <div className="absolute right-0.5 top-0.5 bottom-0.5 w-4 bg-foreground rounded-sm" />
          </div>
        </div>
      </div>
      {children}
      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/30 rounded-full" />
    </div>
  );
}
