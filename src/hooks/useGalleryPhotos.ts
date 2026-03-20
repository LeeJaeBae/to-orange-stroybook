'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiFetch } from '@/lib/api/fetch';
import { toast } from 'sonner';

// DB 응답 타입
export interface GalleryPhotoDB {
    id: string;
    user_id: string;
    folder_id: string | null;
    image_url: string;
    caption: string | null;
    is_favorite: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    sent_count?: number;
}

// UI 타입
export interface GalleryPhoto {
    id: string;
    url: string;
    caption?: string;
    date: string;
    isFavorite: boolean;
    folderId?: string;
    sentCount: number;
}

// DB -> UI 변환
function toUIFormat(photo: GalleryPhotoDB): GalleryPhoto {
    return {
        id: photo.id,
        url: photo.image_url,
        caption: photo.caption || undefined,
        date: photo.created_at,
        isFavorite: photo.is_favorite,
        folderId: photo.folder_id || undefined,
        sentCount: photo.sent_count || 0,
    };
}

// Query key factory
const galleryKeys = {
    all: ['gallery'] as const,
    lists: () => [...galleryKeys.all, 'list'] as const,
    list: (filter?: string) => [...galleryKeys.lists(), filter] as const,
};

// Fetch function
async function fetchGalleryPhotos(filter?: string): Promise<GalleryPhotoDB[]> {
    const params = new URLSearchParams();
    if (filter) {
        params.set('filter', filter);
    }

    const url = `/api/v1/gallery${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiFetch(url);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '갤러리를 불러오는데 실패했습니다');
    }

    const { data } = await response.json();
    return data || [];
}

// 사진 추가 요청 타입
interface AddPhotoInput {
    imageUrl: string;
    caption?: string;
    isFavorite?: boolean;
    folderId?: string | null;
}

// 사진 수정 요청 타입
interface UpdatePhotoInput {
    id: string;
    caption?: string | null;
    isFavorite?: boolean;
    folderId?: string | null;
}

// 사진 업로드 요청 타입
interface UploadPhotoInput {
    file: File;
    caption?: string;
    folderId?: string | null;
}

export function useGalleryPhotos(filter?: 'favorites') {
    const { user, loading: isAuthLoading } = useAuth();
    const queryClient = useQueryClient();

    // 갤러리 사진 목록 조회
    const { data: rawPhotos = [], isLoading, error } = useQuery({
        queryKey: galleryKeys.list(filter),
        queryFn: () => fetchGalleryPhotos(filter),
        enabled: !!user && !isAuthLoading,
        staleTime: 5 * 60 * 1000, // 5분
    });

    // useMemo로 변환하여 무한 리렌더링 방지
    const photos = useMemo(() => rawPhotos.map(toUIFormat), [rawPhotos]);

    // 사진 추가 뮤테이션
    const addPhotoMutation = useMutation({
        mutationFn: async (input: AddPhotoInput) => {
            const response = await apiFetch('/api/v1/gallery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || '사진 추가에 실패했습니다');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
            toast.success('사진이 추가되었습니다');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // 사진 업로드 뮤테이션 (파일 + DB 저장)
    const uploadPhotoMutation = useMutation({
        mutationFn: async ({ file, caption, folderId }: UploadPhotoInput) => {
            const formData = new FormData();
            formData.append('file', file);
            if (caption) formData.append('caption', caption);
            if (folderId) formData.append('folderId', folderId);

            const response = await apiFetch('/api/v1/gallery/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.reason || errorData.error || '사진 업로드에 실패했습니다');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
            toast.success('사진이 업로드되었습니다');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // 사진 수정 뮤테이션 (캡션, 즐겨찾기)
    const updatePhotoMutation = useMutation({
        mutationFn: async ({ id, ...data }: UpdatePhotoInput) => {
            const response = await apiFetch(`/api/v1/gallery?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || '사진 수정에 실패했습니다');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // 즐겨찾기 토글
    const toggleFavorite = async (photoId: string, currentValue: boolean) => {
        await updatePhotoMutation.mutateAsync({
            id: photoId,
            isFavorite: !currentValue,
        });
    };

    // 사진 삭제 뮤테이션
    const deletePhotoMutation = useMutation({
        mutationFn: async (photoId: string) => {
            const response = await apiFetch(`/api/v1/gallery?id=${photoId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || '사진 삭제에 실패했습니다');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
            toast.success('사진이 삭제되었습니다');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // 일괄 삭제 뮤테이션
    const bulkDeletePhotosMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await apiFetch('/api/v1/gallery', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || '사진 일괄 삭제에 실패했습니다');
            }

            return response.json();
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
            toast.success(`${variables.length}개의 사진이 삭제되었습니다`);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // 통계
    const totalCount = photos.length;
    const favoritesCount = photos.filter((p) => p.isFavorite).length;

    return {
        photos,
        rawPhotos,
        isLoading,
        error: error as Error | null,
        refetch: () => queryClient.invalidateQueries({ queryKey: galleryKeys.lists() }),

        // 뮤테이션
        addPhoto: addPhotoMutation.mutateAsync,
        isAdding: addPhotoMutation.isPending,

        uploadPhoto: uploadPhotoMutation.mutateAsync,
        isUploading: uploadPhotoMutation.isPending,

        updatePhoto: updatePhotoMutation.mutateAsync,
        isUpdating: updatePhotoMutation.isPending,

        toggleFavorite,

        deletePhoto: deletePhotoMutation.mutateAsync,
        isDeleting: deletePhotoMutation.isPending,

        bulkDeletePhotos: bulkDeletePhotosMutation.mutateAsync,
        isBulkDeleting: bulkDeletePhotosMutation.isPending,

        // 통계
        totalCount,
        favoritesCount,
    };
}
