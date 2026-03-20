'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TrackingEvent {
    id: string;
    sortOrder: number;
    eventTime: string;
    status: string;
    location: string;
    description: string;
}

interface TrackingTimelineProps {
    events: TrackingEvent[];
    className?: string;
}

export function TrackingTimeline({ events, className = '' }: TrackingTimelineProps) {
    if (!events || events.length === 0) {
        return (
            <div className={`text-center py-6 text-gray-500 text-sm ${className}`}>
                배송 이력이 없습니다.
            </div>
        );
    }

    // 최신 이벤트가 위에 오도록 역순 정렬
    const sortedEvents = [...events].sort((a, b) => b.sortOrder - a.sortOrder);

    return (
        <div className={`relative ${className}`}>
            <div className="space-y-4">
                {sortedEvents.map((event, idx) => {
                    const isLatest = idx === 0;
                    const eventDate = new Date(event.eventTime);

                    return (
                        <div key={event.id} className="flex gap-4">
                            {/* 타임라인 마커 */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-3 h-3 rounded-full border-2 ${
                                        isLatest
                                            ? 'bg-orange-500 border-orange-500'
                                            : 'bg-white border-gray-300'
                                    }`}
                                />
                                {idx < sortedEvents.length - 1 && (
                                    <div className="w-0.5 flex-1 bg-gray-200 min-h-[40px]" />
                                )}
                            </div>

                            {/* 이벤트 내용 */}
                            <div className="flex-1 pb-4">
                                <div className={`text-sm font-medium ${isLatest ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {event.status}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                    {event.location}
                                    {event.description && (
                                        <span className="ml-1">· {event.description}</span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {format(eventDate, 'yyyy.MM.dd (EEE) HH:mm', { locale: ko })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
