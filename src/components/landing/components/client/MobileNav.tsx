'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { NavAuthStatus } from './NavAuthStatus';

interface MobileNavProps {
  items: { label: string; href: string }[];
}

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="size-5" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 p-0">
        <SheetHeader className="border-b border-border/40 px-6 py-4">
          <SheetTitle className="text-base">메뉴</SheetTitle>
          <SheetDescription className="sr-only">
            내비게이션 메뉴
          </SheetDescription>
        </SheetHeader>
        <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border/40 px-6 py-4">
          <NavAuthStatus />
        </div>
      </SheetContent>
    </Sheet>
  );
}
