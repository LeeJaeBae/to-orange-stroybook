'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api/fetch';

// API 응답 타입
export interface PointBalance {
  balance: number;
}

export interface PointTransaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  memo: string | null;
  payment_method: string | null;
  created_at: string;
}

export interface ChargePointsInput {
  amount: number;
  paymentMethod: 'card' | 'phone' | 'bank';
  paymentKey?: string;
}

export interface UsePointsInput {
  amount: number;
  type: 'GIFT' | 'STAMP' | 'OTHER';
  memo?: string;
  timeCapsuleId?: string;
  giftId?: string;
}

// Query key factory
const pointKeys = {
  all: ['points'] as const,
  balance: () => [...pointKeys.all, 'balance'] as const,
  history: () => [...pointKeys.all, 'history'] as const,
};

// Fetch functions
async function fetchBalance(): Promise<PointBalance> {
  const response = await apiFetch('/api/v1/points');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '포인트 조회에 실패했습니다');
  }
  const { data } = await response.json();
  return data;
}

async function fetchHistory(): Promise<PointTransaction[]> {
  const response = await apiFetch('/api/v1/points/history');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '거래 내역 조회에 실패했습니다');
  }
  const { data } = await response.json();
  return data || [];
}

async function chargePoints(input: ChargePointsInput): Promise<{ balance: number; charged: number }> {
  const response = await apiFetch('/api/v1/points/charge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '포인트 충전에 실패했습니다');
  }
  const { data } = await response.json();
  return data;
}

async function usePoints(input: UsePointsInput): Promise<{ balance: number; used: number }> {
  const response = await apiFetch('/api/v1/points/use', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '포인트 사용에 실패했습니다');
  }
  const { data } = await response.json();
  return data;
}

export function usePointsHook() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 포인트 잔액 조회
  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    error: balanceError,
  } = useQuery({
    queryKey: pointKeys.balance(),
    queryFn: fetchBalance,
    enabled: !!user,
    staleTime: 30 * 1000, // 30초
  });

  // 거래 내역 조회
  const {
    data: rawHistory = [],
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery({
    queryKey: pointKeys.history(),
    queryFn: fetchHistory,
    enabled: !!user,
    staleTime: 60 * 1000, // 1분
  });

  const history = rawHistory;
  const balance = balanceData?.balance || 0;

  // 포인트 충전 mutation
  const chargeMutation = useMutation({
    mutationFn: chargePoints,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: pointKeys.balance() });
      queryClient.invalidateQueries({ queryKey: pointKeys.history() });
      toast.success(`${data.charged.toLocaleString()}P 충전 완료!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || '포인트 충전에 실패했습니다');
    },
  });

  // 포인트 사용 mutation
  const useMutation_ = useMutation({
    mutationFn: usePoints,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.balance() });
      queryClient.invalidateQueries({ queryKey: pointKeys.history() });
    },
    onError: (error: Error) => {
      toast.error(error.message || '포인트 사용에 실패했습니다');
    },
  });

  return {
    // 데이터
    balance,
    history,

    // 로딩 상태
    isLoadingBalance,
    isLoadingHistory,

    // 에러 상태
    balanceError,
    historyError,

    // 액션
    charge: chargeMutation.mutateAsync,
    usePoints: useMutation_.mutateAsync,

    // 충전/사용 로딩 상태
    isCharging: chargeMutation.isPending,
    isUsing: useMutation_.isPending,

    // 캐시 무효화
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.all });
    },
  };
}
