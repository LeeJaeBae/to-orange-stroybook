'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiFetch } from '@/lib/api/fetch';

export interface LetterFolder {
    id: string;
    user_id: string;
    name: string;
    icon: string;
    sort_order: number;
    color: string | null;
    family_member_id: string | null;
    is_system: boolean;
    is_secret: boolean;
    created_at: string;
    updated_at: string;
}

const folderKeys = {
    all: ['letter-folders'] as const,
    list: () => [...folderKeys.all, 'list'] as const,
};

async function fetchFolders(): Promise<LetterFolder[]> {
    const response = await apiFetch('/api/v1/folders');
    if (!response.ok) {
        throw new Error('폴더를 불러오는데 실패했습니다');
    }
    const { data } = await response.json();
    return data || [];
}

export function useLetterFolders() {
    const { user, loading: isAuthLoading } = useAuth();
    const queryClient = useQueryClient();

    const { data: customFolders = [], isLoading } = useQuery({
        queryKey: folderKeys.list(),
        queryFn: fetchFolders,
        enabled: !!user && !isAuthLoading,
        staleTime: 5 * 60 * 1000,
    });

    const createFolder = useMutation({
        mutationFn: async (params: string | { name: string; color?: string; familyMemberId?: string; isSecret?: boolean }) => {
            const body = typeof params === 'string' ? { name: params } : params;
            const response = await apiFetch('/api/v1/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || '폴더 생성 실패');
            }
            return (await response.json()).data as LetterFolder;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: folderKeys.list() });
        },
    });

    const updateFolder = useMutation({
        mutationFn: async ({ id, name, color, isSecret }: { id: string; name?: string; color?: string; isSecret?: boolean }) => {
            const updates: Record<string, unknown> = {};
            if (name !== undefined) updates.name = name;
            if (color !== undefined) updates.color = color;
            if (isSecret !== undefined) updates.isSecret = isSecret;
            const response = await apiFetch(`/api/v1/folders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || '폴더 수정 실패');
            }
            return (await response.json()).data as LetterFolder;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: folderKeys.list() });
        },
    });

    const deleteFolder = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiFetch(`/api/v1/folders/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || '폴더 삭제 실패');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: folderKeys.list() });
        },
    });

    return {
        customFolders,
        isLoading,
        createFolder,
        updateFolder,
        deleteFolder,
    };
}
