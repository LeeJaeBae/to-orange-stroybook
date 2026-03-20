'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { FamilyMember } from '@/types/mail';
import { apiFetch } from '@/lib/api/fetch';
import { useTempRecipientsStore, type TempRecipient } from '@/stores/useTempRecipientsStore';

// API 응답 타입 (평탄화된 데이터)
export interface FamilyMemberDB {
    id: string;
    receiverId: string;
    name: string;
    gender?: 'male' | 'female' | null; // 성별
    birthDate?: string | null; // 생년월일 (YYYY-MM-DD) - 타임캡슐 매칭용
    relation: string;
    nickname: string | null;
    facilityId: string | null;
    facilityType?: string;
    region?: string | null;
    facilityName: string;
    facilityAddress: string | null;
    postalCode?: string | null;
    detailedAddress?: string | null;
    prisonerNumber: string | null;
    militaryInfo?: { affiliation: string; militaryId?: string } | null;
    avatarUrl: string | null;
    color: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    facility?: {
        id: string;
        name: string;
        address: string;
    } | null;
}

export interface CreateFamilyMemberInput {
    // 기존 수신자 사용 시
    receiverId?: string;
    // 새 수신자 생성 시
    name?: string;
    gender?: 'male' | 'female'; // 성별
    birthDate?: string; // 생년월일 (YYYY-MM-DD) - 타임캡슐 매칭용
    facilityId?: string;
    facilityType?: string; // '교도소', '구치소', '소년원/소년교도소', '군부대/훈련소', '일반 주소'
    region?: string; // '서울/경기', '강원' 등
    facilityName?: string;
    facilityAddress?: string;
    postalCode?: string; // 우편번호
    detailedAddress?: string; // 상세주소
    prisonerNumber?: string;
    militaryInfo?: { affiliation: string; militaryId?: string }; // 군부대 정보
    // 관계 정보
    relation: string;
    nickname?: string;
    color?: string;
}

// Convert API format to UI format
function toUIFormat(member: FamilyMemberDB): FamilyMember {
    return {
        id: member.id,
        name: member.nickname || member.name,
        relation: member.relation,
        facility: member.facilityName,
        facilityAddress: member.facilityAddress || undefined,
        postalCode: member.postalCode || undefined,
        prisonerNumber: member.prisonerNumber || undefined,
        avatar: member.avatarUrl || member.name.charAt(0),
        color: member.color || 'bg-orange-100 text-orange-600',
        // 추가 메타데이터 (AI 활용)
        gender: member.gender,
        birthDate: member.birthDate,
        facilityType: member.facilityType,
        region: member.region,
        militaryInfo: member.militaryInfo,
    };
}

// Convert TempRecipient to UI format
function tempToUIFormat(temp: TempRecipient): FamilyMember {
    return {
        id: temp.id,
        name: temp.name,
        relation: temp.relation,
        facility: temp.facilityName,
        facilityAddress: temp.facilityAddress,
        postalCode: temp.postalCode,
        prisonerNumber: temp.prisonerNumber,
        avatar: temp.name.charAt(0),
        color: temp.color || 'bg-orange-100 text-orange-600',
        // 추가 메타데이터 (AI 활용)
        gender: temp.gender,
        birthDate: temp.birthDate,
        facilityType: temp.facilityType,
        region: temp.region,
        militaryInfo: temp.militaryInfo,
    };
}

// Query key factory
const familyMembersKeys = {
    all: ['family-members'] as const,
    lists: () => [...familyMembersKeys.all, 'list'] as const,
};

// Fetch function
async function fetchFamilyMembers(): Promise<FamilyMemberDB[]> {
    const response = await apiFetch('/api/v1/family-members');

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `수신자 목록을 불러오는데 실패했습니다 (${response.status})`);
    }

    const { data } = await response.json();
    return data || [];
}

export function useFamilyMembers(options?: { enabled?: boolean }) {
    const { user, loading: isAuthLoading } = useAuth();
    const externalEnabled = options?.enabled ?? true;
    const queryClient = useQueryClient();

    // 비로그인 사용자용 임시 저장소
    const tempStore = useTempRecipientsStore();

    // Query for fetching family members
    const { data: rawMembers = [], isLoading, error } = useQuery({
        queryKey: familyMembersKeys.lists(),
        queryFn: fetchFamilyMembers,
        enabled: externalEnabled && !!user && !isAuthLoading,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // 하이드레이션 데이터 우선 사용: SSR 프리페치 데이터가 있으면 auth 로딩 완료 전에도 즉시 표시
    const familyMembers = useMemo(() => {
        if (rawMembers.length > 0) return rawMembers.map(toUIFormat);
        if (user) return [];
        // 비로그인 시 임시 저장소의 수신자 목록 반환
        return tempStore.recipients.map(tempToUIFormat);
    }, [user, rawMembers, tempStore.recipients]);

    // Mutation for creating family member
    const createMemberMutation = useMutation({
        mutationFn: async (input: CreateFamilyMemberInput) => {
            const response = await apiFetch('/api/v1/family-members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || '수신자 추가에 실패했습니다');
            }

            const { data } = await response.json();
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: familyMembersKeys.lists() });
            toast.success('소중한 사람이 추가되었습니다!');
        },
        onError: (error: Error) => {
            console.error('수신자 추가 오류:', error);
            toast.error(error.message || '추가에 실패했습니다');
        },
    });

    const createFamilyMember = async (input: CreateFamilyMemberInput) => {
        // 비로그인 사용자: localStorage에 임시 저장
        if (!user) {
            try {
                const tempRecipient = tempStore.addRecipient({
                    name: input.name || '',
                    gender: input.gender,
                    birthDate: input.birthDate,
                    relation: input.relation,
                    facilityType: input.facilityType,
                    region: input.region,
                    facilityName: input.facilityName || '',
                    facilityAddress: input.facilityAddress,
                    postalCode: input.postalCode,
                    detailedAddress: input.detailedAddress,
                    prisonerNumber: input.prisonerNumber,
                    militaryInfo: input.militaryInfo,
                    color: input.color || 'bg-orange-100 text-orange-600',
                });
                toast.success('받는 사람이 추가되었습니다', {
                    description: '로그인 후 서버에 저장됩니다.',
                });
                return tempToUIFormat(tempRecipient);
            } catch {
                toast.error('추가에 실패했습니다');
                return null;
            }
        }

        // 로그인 사용자: API로 저장
        try {
            const data = await createMemberMutation.mutateAsync(input);
            return toUIFormat(data);
        } catch {
            return null;
        }
    };

    // Mutation for updating family member
    const updateMemberMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateFamilyMemberInput> }) => {
            const response = await apiFetch(`/api/v1/family-members/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || '수신자 정보 수정에 실패했습니다');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: familyMembersKeys.lists() });
            toast.success('정보가 수정되었습니다');
        },
        onError: (error: Error) => {
            console.error('수신자 수정 오류:', error);
            toast.error(error.message || '수정에 실패했습니다');
        },
    });

    const updateFamilyMember = async (id: string, updates: Partial<CreateFamilyMemberInput>) => {
        if (!user) {
            toast.warning('로그인이 필요합니다');
            return;
        }

        await updateMemberMutation.mutateAsync({ id, updates });
    };

    // Mutation for deactivating family member
    const deactivateMemberMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiFetch(`/api/v1/family-members/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('수신자 삭제에 실패했습니다');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: familyMembersKeys.lists() });
            toast.success('수신자가 삭제되었습니다');
        },
        onError: (error: Error) => {
            console.error('수신자 삭제 오류:', error);
            toast.error(error.message || '삭제에 실패했습니다');
        },
    });

    const deactivateFamilyMember = async (id: string) => {
        // 비로그인 사용자: localStorage에서 삭제
        if (!user) {
            // temp_ 로 시작하는 임시 ID인 경우
            if (id.startsWith('temp_')) {
                tempStore.removeRecipient(id);
                toast.success('수신자가 삭제되었습니다');
                return;
            }
            toast.warning('로그인이 필요합니다');
            return;
        }

        await deactivateMemberMutation.mutateAsync(id);
    };

    return {
        familyMembers,
        rawMembers,
        isLoading: user ? isLoading : false,
        error: error as Error | null,
        createFamilyMember,
        updateFamilyMember,
        deactivateFamilyMember,
        isCreating: createMemberMutation.isPending,
        refetch: () => queryClient.refetchQueries({ queryKey: familyMembersKeys.lists() }),
        // 비로그인용 임시 저장소 관련
        tempRecipients: tempStore.recipients,
        clearTempRecipients: tempStore.clearRecipients,
    };
}
