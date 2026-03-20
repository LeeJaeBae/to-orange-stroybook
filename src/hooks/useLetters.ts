'use client';

import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useFamilyMembers } from './useFamilyMembers';
import type { Mail, FolderType, FamilyMember, LetterLifecycleStatus } from '@/types/mail';
import { apiFetch } from '@/lib/api/fetch';
import type { TRACKING_STATUS } from '@to-orange/api-contracts';

type TrackingStatus = typeof TRACKING_STATUS[number];

// API response types
export interface LetterRecipient {
    id: string;
    recipient_name: string;
    facility_name: string;
    facility_address: string | null;
    prisoner_number: string | null;
    family_member_id: string | null;
    sort_order: number;
}

export interface LetterImage {
    id: string;
    image_url: string;
    display_order: number;
    ocr_text?: string | null;
}

export interface LetterTrackingSummary {
    tracking_number: string;
    carrier: string;
    status: TrackingStatus;
    raw_status: string | null;
    last_location: string | null;
    delivered_at: string | null;
    last_checked_at: string | null;
}

export interface LetterDB {
    id: string;
    sender_name: string;
    sender_phone: string | null;
    sender_address: string | null;
    content: string;
    status: LetterLifecycleStatus;
    mail_price: number;
    photo_price: number;
    additional_options_price: number;
    total_price: number;
    points_used: number;
    created_at: string;
    updated_at: string;
    letter_recipients: LetterRecipient[];
    letter_images: LetterImage[];
    font?: string | null;
    font_size?: number | null;
    line_color?: string | null;
    stationeries: { id: string; name: string; code: string; category?: string; style?: Record<string, unknown> } | null;
    mail_types: { id: string; name: string; code: string; delivery_time: string } | null;
    letter_tracking?: LetterTrackingSummary | LetterTrackingSummary[] | null;
    letter_type?: string;
    is_handwritten?: boolean;
    original_image_url?: string;
    is_read?: boolean; // 받은 편지의 읽음 상태
}

// Status mapping
const statusMap: Record<LetterDB['status'], Mail['status']> = {
    DRAFT: undefined,
    PAID: '접수완료',
    PROCESSING: '동봉시작',
    READY_TO_PRINT: '출력 대기',
    PRINTED: '출력 완료',
    SENT: '우체국 발송완료',
    CANCELLED: undefined,
    RECEIVED: undefined,
};

function getReadableContent(content: string) {
    const cleaned = content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && line !== '---' && !/^\[\d+페이지\]$/.test(line));

    return cleaned.join('\n').trim();
}

// Convert DB letter to UI Mail format
function toMailFormat(letter: LetterDB, familyMembers: FamilyMember[]): Mail {
    const recipient = letter.letter_recipients[0];
    const hasImages = letter.letter_images && letter.letter_images.length > 0;
    const tracking = Array.isArray(letter.letter_tracking)
        ? letter.letter_tracking[0] ?? null
        : (letter.letter_tracking ?? null);

    // 받은 편지인 경우 발신자 정보 처리
    let sender: FamilyMember;
    if (letter.status === 'RECEIVED') {
        // 받은 편지: sender_name이 발신자
        const matchingMember = familyMembers.find(
            (m) => m.id === recipient?.family_member_id || m.name === letter.sender_name
        );

        if (matchingMember) {
            sender = matchingMember;
        } else {
            // 가족 구성원이 없으면 발신자 이름으로 생성
            sender = {
                id: recipient?.family_member_id || letter.id,
                name: letter.sender_name || '발신자',
                relation: '',
                facility: '',
                avatar: (letter.sender_name || '발').charAt(0),
                color: 'bg-orange-100 text-orange-600',
            };
        }
    } else {
        // 보낸 편지: recipient가 수신자
        const matchingMember = familyMembers.find(
            (m) => m.id === recipient?.family_member_id || m.name === recipient?.recipient_name
        );

        if (matchingMember) {
            sender = matchingMember;
        } else {
            // Create a pseudo family member from recipient data
            // family_member_id를 우선 사용 (가족 구성원 필터링에 필요)
            sender = {
                id: recipient?.family_member_id || recipient?.id || letter.id,
                name: recipient?.recipient_name || '수신자',
                relation: '',
                facility: recipient?.facility_name || '',
                facilityAddress: recipient?.facility_address || undefined,
                prisonerNumber: recipient?.prisoner_number || undefined,
                avatar: (recipient?.recipient_name || '수').charAt(0),
                color: 'bg-gray-100 text-gray-600',
            };
        }
    }

    // Calculate date display - 항상 날짜로 표시
    const createdDate = new Date(letter.created_at);
    const dateDisplay = createdDate.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });

    // Determine folder: folder_id takes priority, then status-based mapping
    let folder: FolderType = 'inbox';
    if ((letter as any).folder_id) {
        folder = `custom-${(letter as any).folder_id}` as FolderType;
    } else if (letter.status === 'DRAFT') {
        folder = 'draft';
    } else if (letter.status === 'PAID' || letter.status === 'PROCESSING' || letter.status === 'READY_TO_PRINT' || letter.status === 'PRINTED' || letter.status === 'SENT') {
        folder = 'sent';
    } else if (letter.status === 'CANCELLED') {
        folder = 'trash';
    } else if (letter.status === 'RECEIVED') {
        folder = (letter as any).is_spam ? 'spam' : 'inbox';
    }

    // Create preview (first 50 chars of content)
    const readableContent = getReadableContent(letter.content);
    const previewSource = readableContent || letter.content;
    const preview = previewSource.length > 50 ? previewSource.substring(0, 50) + '...' : previewSource;

    // Generate subject from content
    const firstLine = (readableContent.split('\n').find((line) => line.trim().length > 0) || '').trim();
    const subject = firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine || '제목 없음';

    return {
        id: letter.id,
        sender,
        subject,
        preview,
        content: letter.content,
        date: dateDisplay,
        createdAt: letter.created_at, // ISO 날짜 문자열 (정렬용)
        isRead: letter.status === 'RECEIVED' ? (letter.is_read ?? false) : (letter.status !== 'DRAFT'),
        isNew: letter.status === 'PAID' || (letter.status === 'RECEIVED' && !letter.is_read),
        folder,
        status: statusMap[letter.status],
        rawStatus: letter.status,
        canEditBeforePrint: letter.status === 'PAID',
        trackingStatus: tracking?.status,
        trackingNumber: tracking?.tracking_number ?? null,
        trackingLastLocation: tracking?.last_location ?? null,
        trackingLastCheckedAt: tracking?.last_checked_at ?? null,
        hasAttachments: hasImages,
        attachmentCount: hasImages ? letter.letter_images.length : undefined,
        isHandwritten: letter.is_handwritten || false,
        originalImage: letter.original_image_url,
        stationeryStyle: letter.stationeries?.style ?? null,
        stationeryName: letter.stationeries?.name ?? null,
        font: letter.font ?? null,
        fontSize: letter.font_size ?? null,
        lineColor: letter.line_color ?? null,
    };
}

interface UseLettersOptions {
    folder?: FolderType;
    status?: LetterDB['status'];
    enabled?: boolean; // 쿼리 활성화 여부 (기본값: true)
}

// Query key factory
const lettersKeys = {
    all: ['letters'] as const,
    lists: () => [...lettersKeys.all, 'list'] as const,
    list: (filters: UseLettersOptions) => [...lettersKeys.lists(), filters.folder, filters.status] as const,
};

// Fetch function
async function fetchLetters(options: UseLettersOptions): Promise<LetterDB[]> {
    const params = new URLSearchParams();
    if (options.folder) {
        params.set('folder', options.folder);
    }
    if (options.status) {
        params.set('status', options.status);
    }

    const url = `/api/v1/letters${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiFetch(url);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `편지를 불러오는데 실패했습니다 (${response.status})`);
    }

    const { data } = await response.json();
    return data || [];
}

export function useLetters(options: UseLettersOptions = {}) {
    const { user, loading: isAuthLoading } = useAuth();
    const queryClient = useQueryClient();
    const { familyMembers } = useFamilyMembers({ enabled: options.enabled !== false });

    // Query for fetching letters
    const { data: rawLetters = [], isLoading, error } = useQuery({
        queryKey: lettersKeys.list(options),
        queryFn: () => fetchLetters(options),
        enabled: !!user && !isAuthLoading && (options.enabled !== false),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    const letters = useMemo(
        () => rawLetters.map((letter) => toMailFormat(letter, familyMembers)),
        [rawLetters, familyMembers]
    );

    // Local update functions (optimistic updates)
    const markAsRead = async (letterId: string, isRead: boolean = true) => {
        try {
            const response = await apiFetch(`/api/v1/received-letters/${letterId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead }),
            });

            if (!response.ok) {
                throw new Error('읽음 상태 변경 실패');
            }

            // Refetch to update UI
            queryClient.invalidateQueries({ queryKey: lettersKeys.list(options) });
        } catch (error) {
            console.error('읽음 상태 변경 오류:', error);
            throw error;
        }
    };

    const markAsReadBatch = async (letterIds: string[], isRead: boolean) => {
        try {
            const response = await apiFetch('/api/v1/received-letters/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: letterIds, isRead }),
            });

            if (!response.ok) {
                throw new Error('읽음 상태 일괄 변경 실패');
            }

            queryClient.invalidateQueries({ queryKey: lettersKeys.lists() });
        } catch (error) {
            console.error('읽음 상태 일괄 변경 오류:', error);
            throw error;
        }
    };

    const moveToFolder = async (letterId: string, targetFolder: FolderType) => {
        try {
            if (targetFolder.startsWith('custom-')) {
                // 커스텀 폴더로 이동
                const folderId = targetFolder.replace('custom-', '');
                await apiFetch(`/api/v1/letters/${letterId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ folder_id: folderId }),
                });
            } else if (targetFolder === 'spam') {
                await apiFetch(`/api/v1/letters/${letterId}/spam`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isSpam: true }),
                });
            } else if (targetFolder === 'inbox') {
                // 스팸 해제 + 커스텀 폴더 해제
                await apiFetch(`/api/v1/letters/${letterId}/spam`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isSpam: false }),
                });
                await apiFetch(`/api/v1/letters/${letterId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ folder_id: null }),
                });
            }
            queryClient.invalidateQueries({ queryKey: lettersKeys.lists() });
        } catch (error) {
            console.error('폴더 이동 오류:', error);
            throw error;
        }
    };

    const cancelLetter = async (letterId: string) => {
        try {
            const response = await apiFetch(`/api/v1/letters/${letterId}/cancel`, {
                method: 'POST',
            });

            if (!response.ok) {
                const { error } = await response.json().catch(() => ({ error: '편지 취소에 실패했습니다.' }));
                throw new Error(error);
            }

            // 모든 letters 쿼리 무효화
            queryClient.invalidateQueries({ queryKey: lettersKeys.lists() });
        } catch (error) {
            console.error('편지 취소 오류:', error);
            throw error;
        }
    };

    const deleteLetter = async (letterId: string) => {
        try {
            // 편지 정보 찾기
            const letter = letters.find(l => l.id === letterId);
            if (!letter) {
                throw new Error('편지를 찾을 수 없습니다');
            }

            // 받은 편지함인 경우 received_letters API 사용
            // 보낸 편지함/임시보관함인 경우 letters API 사용
            const endpoint = letter.folder === 'inbox'
                ? `/api/v1/received-letters/${letterId}`
                : `/api/v1/letters/${letterId}`;

            const response = await apiFetch(endpoint, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('편지 삭제 실패');
            }

            // Refetch to update UI - 모든 letters 쿼리 무효화
            queryClient.invalidateQueries({ queryKey: lettersKeys.lists() });
        } catch (error) {
            console.error('편지 삭제 오류:', error);
            throw error;
        }
    };

    // 일괄 삭제 (여러 편지를 한 번에 삭제)
    const deleteLettersBatch = async (letterIds: string[]) => {
        if (letterIds.length === 0) return;

        try {
            // 각 편지의 endpoint를 결정하고 병렬로 삭제 요청
            const deletePromises = letterIds.map(async (letterId) => {
                const letter = letters.find(l => l.id === letterId);
                if (!letter) return; // 찾을 수 없으면 스킵

                const endpoint = letter.folder === 'inbox'
                    ? `/api/v1/received-letters/${letterId}`
                    : `/api/v1/letters/${letterId}`;

                const response = await apiFetch(endpoint, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    console.error(`편지 삭제 실패: ${letterId}`);
                }
            });

            // 모든 삭제 요청을 병렬로 실행
            await Promise.all(deletePromises);

            // 모든 삭제 완료 후 한 번만 쿼리 무효화
            queryClient.invalidateQueries({ queryKey: lettersKeys.lists() });
        } catch (error) {
            console.error('일괄 삭제 오류:', error);
            throw error;
        }
    };

    // Computed values
    const unreadCount = letters.filter((m) => !m.isRead && m.folder === 'inbox').length;
    const draftCount = letters.filter((m) => m.folder === 'draft').length;
    const trashCount = letters.filter((m) => m.folder === 'trash').length;

    // 수신자(family member)별 편지 수 계산 (임시보관/취소 제외, 보낸/받은 편지 모두)
    const letterCountsByMember = useMemo(() => {
        const counts: Record<string, number> = {};
        rawLetters
            .filter((letter) => letter.status !== 'DRAFT' && letter.status !== 'CANCELLED')
            .forEach((letter) => {
                letter.letter_recipients.forEach((recipient) => {
                    if (recipient.family_member_id) {
                        counts[recipient.family_member_id] = (counts[recipient.family_member_id] || 0) + 1;
                    }
                });
            });
        return counts;
    }, [rawLetters]);

    return {
        letters,
        rawLetters,
        isLoading,
        error: error as Error | null,
        refetch: () => queryClient.invalidateQueries({ queryKey: lettersKeys.list(options) }),
        markAsRead,
        markAsReadBatch,
        moveToFolder,
        cancelLetter,
        deleteLetter,
        deleteLettersBatch,
        unreadCount,
        draftCount,
        trashCount,
        letterCountsByMember,
    };
}
