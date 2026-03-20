'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiFetch } from '@/lib/api/fetch';
import { toast } from 'sonner';

// DB 응답 타입
export interface GalleryFolderDB {
    id: string;
    user_id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// UI 타입
export interface GalleryFolder {
    id: string;
    name: string;
    createdAt: string;
}

// DB -> UI 변환
function toUIFormat(folder: GalleryFolderDB): GalleryFolder {
    return {
        id: folder.id,
        name: folder.name,
        createdAt: folder.created_at,
    };
}

// Query key factory
const folderKeys = {
    all: ['gallery-folders'] as const,
    lists: () => [...folderKeys.all, 'list'] as const,
};

// Fetch function
async function fetchGalleryFolders(): Promise<GalleryFolderDB[]> {
    const response = await apiFetch('/api/v1/gallery/folders');

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '폴더를 불러오는데 실패했습니다');
    }

    const { data } = await response.json();
    return data || [];
}

// 폴더 생성 요청 타입
interface CreateFolderInput {
    name: string;
}

// 폴더 수정 요청 타입
interface UpdateFolderInput {
    id: string;
    name: string;
}

export function useGalleryFolders() {
    const { user, loading: isAuthLoading } = useAuth();
    const queryClient = useQueryClient();

    // 폴더 목록 조회
    const { data: rawFolders = [], isLoading, error } = useQuery({
        queryKey: folderKeys.lists(),
        queryFn: fetchGalleryFolders,
        enabled: !!user && !isAuthLoading,
        staleTime: 5 * 60 * 1000, // 5분
    });

    // useMemo로 변환하여 무한 리렌더링 방지
    const folders = useMemo(() => rawFolders.map(toUIFormat), [rawFolders]);

    // 폴더 생성 뮤테이션
    const createFolderMutation = useMutation({
        mutationFn: async (input: CreateFolderInput) => {
            const response = await apiFetch('/api/v1/gallery/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || '폴더 생성에 실패했습니다');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
            toast.success('폴더가 생성되었습니다');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // 폴더 수정 뮤테이션
    const updateFolderMutation = useMutation({
        mutationFn: async ({ id, name }: UpdateFolderInput) => {
            const response = await apiFetch(`/api/v1/gallery/folders?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || '폴더 수정에 실패했습니다');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
            toast.success('폴더 이름이 변경되었습니다');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // 폴더 삭제 뮤테이션
    const deleteFolderMutation = useMutation({
        mutationFn: async (folderId: string) => {
            const response = await apiFetch(`/api/v1/gallery/folders?id=${folderId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || '폴더 삭제에 실패했습니다');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
            // 갤러리 사진도 새로고침 (folder_id가 null로 변경됨)
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
            toast.success('폴더가 삭제되었습니다');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    return {
        folders,
        rawFolders,
        isLoading,
        error: error as Error | null,
        refetch: () => queryClient.invalidateQueries({ queryKey: folderKeys.lists() }),

        // 뮤테이션
        createFolder: createFolderMutation.mutateAsync,
        isCreating: createFolderMutation.isPending,

        updateFolder: updateFolderMutation.mutateAsync,
        isUpdating: updateFolderMutation.isPending,

        deleteFolder: deleteFolderMutation.mutateAsync,
        isDeleting: deleteFolderMutation.isPending,
    };
}
