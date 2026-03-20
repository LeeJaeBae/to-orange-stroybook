import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileHeaderProps {
  title: string;
  children: React.ReactNode;
}

export function MobileHeader({ title, children }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border/60 h-14 flex items-center px-4 safe-top">
        {/* Left: Hamburger Menu (opens sidebar) */}
        <div className="flex justify-start">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 h-12 w-12 -ml-4 p-0 hover:text-orange-500">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <div className="h-full" onClick={() => setIsOpen(false)}>
                {children}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Center: Title */}
        <div className="flex-1 flex justify-center">
          <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
        </div>

        {/* Right: Spacer for centering */}
        <div className="w-12 -mr-4" />
      </header>

    </div>
  );
}
