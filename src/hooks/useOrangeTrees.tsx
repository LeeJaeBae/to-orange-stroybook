import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiFetch } from '@/lib/api/fetch';

export interface OrangeTree {
    id: string;
    receiver_id: string;
    leaf_count: number;
    orange_count: number;
    created_at: string;
    receiverName: string;
    facilityName: string;
    relation: string;
    nickname: string;
    color: string;
    familyMemberId: string;
}

export const orangeTreeKeys = {
    all: ['orangeTrees'] as const,
    lists: () => [...orangeTreeKeys.all, 'list'] as const,
    detail: (id: string) => [...orangeTreeKeys.all, 'detail', id] as const,
};

async function fetchOrangeTrees(): Promise<OrangeTree[]> {
    const response = await apiFetch('/api/v1/orange-trees');
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch orange trees');
    }
    const { data } = await response.json();
    return data || [];
}

export function useOrangeTrees() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: rawTrees = [], isLoading, error } = useQuery({
        queryKey: orangeTreeKeys.lists(),
        queryFn: fetchOrangeTrees,
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
    });

    const trees = useMemo(() => rawTrees, [rawTrees]);

    return {
        trees,
        isLoading,
        error,
        refetch: () => queryClient.invalidateQueries({ queryKey: orangeTreeKeys.lists() }),
    };
}
