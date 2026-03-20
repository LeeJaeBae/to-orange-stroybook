import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiFetch } from '@/lib/api/fetch';
import { toast } from 'sonner';

export interface SpecialDay {
    id: string;
    tree_id: string;
    user_id: string;
    title: string;
    date: string;
    type: string;
    description: string | null;
    created_at: string;
}

const specialDayKeys = {
    all: ['specialDays'] as const,
    byTree: (treeId: string) => [...specialDayKeys.all, treeId] as const,
};

async function fetchSpecialDays(treeId: string): Promise<SpecialDay[]> {
    const response = await apiFetch(`/api/v1/orange-trees/${treeId}/special-days`);
    if (!response.ok) throw new Error('Failed to fetch special days');
    const { data } = await response.json();
    return data || [];
}

export function useSpecialDays(treeId: string | null) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: rawDays = [], isLoading } = useQuery({
        queryKey: specialDayKeys.byTree(treeId || ''),
        queryFn: () => fetchSpecialDays(treeId!),
        enabled: !!user && !!treeId,
        staleTime: 5 * 60 * 1000,
    });

    const specialDays = useMemo(() => rawDays, [rawDays]);

    const createDay = useMutation({
        mutationFn: async (input: { title: string; date: string; type: string; description?: string | null }) => {
            const response = await apiFetch(`/api/v1/orange-trees/${treeId}/special-days`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });
            if (!response.ok) throw new Error('Failed to create special day');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: specialDayKeys.byTree(treeId!) });
            toast.success('소중한 날이 추가되었습니다');
        },
    });

    const deleteDay = useMutation({
        mutationFn: async (dayId: string) => {
            const response = await apiFetch(`/api/v1/orange-trees/${treeId}/special-days/${dayId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete special day');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: specialDayKeys.byTree(treeId!) });
            toast.success('소중한 날이 삭제되었습니다');
        },
    });

    return {
        specialDays,
        isLoading,
        createSpecialDay: createDay.mutateAsync,
        deleteSpecialDay: deleteDay.mutateAsync,
    };
}
