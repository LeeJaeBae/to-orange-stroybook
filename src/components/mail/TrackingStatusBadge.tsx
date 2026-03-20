'use client';

import { getTrackingStatusLabel, getTrackingStatusColor } from '@/lib/korea-post-api';
import type { TRACKING_STATUS } from '@to-orange/api-contracts';

type TrackingStatus = typeof TRACKING_STATUS[number];

interface TrackingStatusBadgeProps {
    status: TrackingStatus;
    className?: string;
}

export function TrackingStatusBadge({ status, className = '' }: TrackingStatusBadgeProps) {
    const label = getTrackingStatusLabel(status);
    const colorClass = getTrackingStatusColor(status);

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass} ${className}`}>
            {status === 'IN_TRANSIT' && (
                <svg className="w-3 h-3 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h4a1 1 0 011 1v6h-1.05a2.5 2.5 0 00-4.9 0H14V7z" />
                </svg>
            )}
            {status === 'DELIVERED' && (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            )}
            {label}
        </span>
    );
}
