'use client';

import { useMemo } from 'react';

interface Activity {
    id: string;
    type: 'letter' | 'gift';
    created_at: string;
    user: { id: string; name: string };
}

interface ActivityFeedProps {
    activities: Activity[];
    limit?: number;
}

function maskName(name: string): string {
    if (!name || name.length <= 1) return name + '*';
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

function formatTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}일 전`;
    return `${Math.floor(days / 30)}개월 전`;
}

export function ActivityFeed({ activities, limit = 3 }: ActivityFeedProps) {
    const displayActivities = useMemo(
        () => activities.slice(0, limit),
        [activities, limit]
    );

    if (displayActivities.length === 0) {
        return (
            <div className="px-4 py-3 border-t bg-white">
                <p className="text-xs text-gray-400 font-medium">최근 활동</p>
                <p className="text-sm text-gray-500 mt-1">아직 활동이 없습니다</p>
            </div>
        );
    }

    return (
        <div className="px-4 py-3 border-t bg-white space-y-2">
            <p className="text-xs text-gray-400 font-medium">최근 활동</p>
            {displayActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-2 text-sm">
                    <span>{activity.type === 'letter' ? '🍃' : '🍊'}</span>
                    <span className="text-gray-700">
                        {maskName(activity.user.name)}님이{' '}
                        {activity.type === 'letter' ? '편지를 보냈습니다' : '선물을 보냈습니다'}
                    </span>
                    <span className="text-gray-400 text-xs ml-auto">
                        {formatTimeAgo(activity.created_at)}
                    </span>
                </div>
            ))}
        </div>
    );
}
