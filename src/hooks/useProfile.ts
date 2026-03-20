'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiFetch } from '@/lib/api/fetch';

// 프로필 데이터 타입
export interface UserProfile {
  id: string;
  nickname: string;
  phone: string | null;
  phoneVerifiedAt: string | null;
  email: string;
  name: string;
  role: string;
  pointsBalance: number;
  createdAt: string;
}

// API 응답을 UI 타입으로 변환
function toProfileFormat(data: Record<string, unknown>): UserProfile {
  return {
    id: data.id as string,
    nickname: data.nickname as string,
    phone: data.phone as string | null,
    phoneVerifiedAt: data.phone_verified_at as string | null,
    email: data.email as string,
    name: data.name as string,
    role: data.role as string,
    pointsBalance: data.points_balance as number,
    createdAt: data.created_at as string,
  };
}

// Query key factory
const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

// Fetch function
async function fetchProfile(): Promise<UserProfile> {
  const response = await apiFetch('/api/v1/auth/profile');

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '프로필을 불러오는데 실패했습니다');
  }

  const { data } = await response.json();
  return toProfileFormat(data);
}

export function useProfile() {
  const { user, loading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: profileKeys.detail(),
    queryFn: fetchProfile,
    enabled: !!user && !isAuthLoading,
    staleTime: 5 * 60 * 1000, // 5분
  });

  return {
    profile,
    isLoading: user ? isLoading : false,
    error: error as Error | null,
    refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: profileKeys.detail() }),
  };
}
