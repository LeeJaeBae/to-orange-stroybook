interface WelcomeHeaderProps {
  title?: string;
  deliveryDate?: string;
  isActivated?: boolean;
}

export function WelcomeHeader({
  title = "출소축하",
  deliveryDate = "2026.12.23",
  isActivated = false
}: WelcomeHeaderProps) {
  return (
    <div className={`pt-14 px-5 pb-4 flex items-center justify-center transition-all duration-1000 ${!isActivated ? 'grayscale' : ''}`}>
      <div className="flex flex-col items-center">
        <span className={`text-lg font-black text-foreground transition-opacity duration-500 ${!isActivated ? 'opacity-70' : ''}`}>
          {title}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">
          {deliveryDate} 전달예정
        </span>
      </div>
    </div>
  );
}
