'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/index.client';
import { Button } from '@/components/ui/button';

export function NavAuthStatus() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
    );
  }

  if (user) {
    return (
      <Button variant="default" size="sm" asChild>
        <Link href="/letter">마이페이지</Link>
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/login">로그인</Link>
    </Button>
  );
}
