import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import orangeRipe from "@/assets/emoticons/orange-ripe.png";

const orangeRipeSrc = typeof orangeRipe === "string" ? orangeRipe : orangeRipe.src;

interface DeadlineTimerProps {
  deadlineHour?: number;
  isCollapsed?: boolean;
}

export function DeadlineTimer({ deadlineHour = 16.5, isCollapsed = false }: DeadlineTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const deadline = new Date();
      const deadlineH = Math.floor(deadlineHour);
      const deadlineM = Math.round((deadlineHour - deadlineH) * 60);
      deadline.setHours(deadlineH, deadlineM, 0, 0);

      if (now >= deadline) {
        setIsExpired(true);
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const diff = deadline.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setIsExpired(false);
      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deadlineHour]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  // 30분 이하면 임박 상태
  const isUrgent = !isExpired && timeLeft.hours === 0 && timeLeft.minutes < 30;

  if (isCollapsed) {
    return (
      <div className="flex justify-center">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center">
          <Clock className={cn(
            "w-5 h-5", 
            isExpired ? "text-muted-foreground" : "text-orange-500",
            isUrgent && "animate-pulse"
          )} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 px-3 py-2">
      {/* 오렌지 이모티콘 */}
      <div className="flex-shrink-0 animate-bounce-gentle">
        <img src={orangeRipeSrc} alt="오렌지" className="w-10 h-10 object-contain" />
      </div>
      
      {/* 말풍선 */}
      <div className="flex-1 relative animate-wiggle">
        {/* 말풍선 꼬리 */}
        <div className="absolute left-0 bottom-2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-orange-100 border-b-[6px] border-b-transparent -ml-2" />
        
        {/* 말풍선 내용 */}
        <div className={cn(
          "bg-orange-100 rounded-xl px-3 py-2",
          isUrgent && "bg-orange-200"
        )}>
          <p className="text-size-11 text-orange-600 mb-0.5">편지 마감 시간까지</p>
          {isExpired ? (
            <p className="font-bold text-sm text-orange-500">오늘 마감 종료!</p>
          ) : (
            <p className={cn(
              "font-bold text-sm text-orange-600",
              isUrgent && "animate-pulse"
            )}>
              {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
