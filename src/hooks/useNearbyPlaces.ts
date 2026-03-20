'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';
import { NearbyPlace } from '@/lib/kakao-places';

interface NearbyPlacesResponse {
    hotels: NearbyPlace[];
    cafes: NearbyPlace[];
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

interface UseNearbyPlacesOptions {
    address?: string;
    fallbackAddress?: string;
    facilityName?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    enabled?: boolean;
}

// Query key factory
const nearbyPlacesKeys = {
    all: ['nearbyPlaces'] as const,
    byAddress: (
        address: string,
        fallbackAddress?: string,
        facilityName?: string,
        latitude?: number,
        longitude?: number,
        radius?: number
    ) => [...nearbyPlacesKeys.all, address, fallbackAddress, facilityName, latitude, longitude, radius] as const,
};

async function fetchNearbyPlaces(
    address: string,
    fallbackAddress?: string,
    facilityName?: string,
    latitude?: number,
    longitude?: number,
    radius?: number
): Promise<NearbyPlacesResponse> {
    const params = new URLSearchParams({ address });

    if (fallbackAddress) {
        params.set('fallbackAddress', fallbackAddress);
    }
    if (facilityName) {
        params.set('facilityName', facilityName);
    }
    if (typeof latitude === 'number' && typeof longitude === 'number') {
        params.set('latitude', String(latitude));
        params.set('longitude', String(longitude));
    }
    if (radius) {
        params.set('radius', String(radius));
    }

    const response = await apiFetch(`/api/v1/places/nearby?${params.toString()}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '주변 장소를 불러오는데 실패했습니다');
    }

    const { data } = await response.json();
    return data;
}

export function useNearbyPlaces(options: UseNearbyPlacesOptions = {}) {
    const { address, fallbackAddress, facilityName, latitude, longitude, radius = 5000, enabled = true } = options;

    const {
        data,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: nearbyPlacesKeys.byAddress(address || '', fallbackAddress, facilityName, latitude, longitude, radius),
        queryFn: () => fetchNearbyPlaces(address!, fallbackAddress, facilityName, latitude, longitude, radius),
        enabled: enabled && !!address && address !== '주소 정보 없음',
        staleTime: 30 * 60 * 1000, // 30분
        retry: 1,
    });

    return {
        hotels: data?.hotels || [],
        cafes: data?.cafes || [],
        coordinates: data?.coordinates,
        isLoading,
        error: error as Error | null,
        refetch,
    };
}
