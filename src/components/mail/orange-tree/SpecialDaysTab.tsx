'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Send } from 'lucide-react';
import type { SpecialDay } from '@/hooks/useSpecialDays';

interface SpecialDaysTabProps {
    treeId: string;
    specialDays: SpecialDay[];
    onCreateDay: (input: { title: string; date: string; type: string; description?: string | null }) => Promise<unknown>;
    onDeleteDay: (dayId: string) => Promise<unknown>;
}

const DAY_TYPES = [
    { value: 'release', label: '출소일' },
    { value: 'birthday', label: '생일' },
    { value: 'anniversary', label: '기념일' },
    { value: 'visit', label: '면회일' },
    { value: 'trial', label: '재판일' },
    { value: 'education', label: '교육일' },
    { value: 'other', label: '기타' },
];

function formatDDay(dateStr: string): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'D-Day';
    if (diff > 0) return `D-${diff}`;
    return `D+${Math.abs(diff)}`;
}

export function SpecialDaysTab({ treeId, specialDays, onCreateDay, onDeleteDay }: SpecialDaysTabProps) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [type, setType] = useState('other');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title || !date) return;
        setIsSubmitting(true);
        try {
            await onCreateDay({ title, date, type });
            setTitle('');
            setDate('');
            setType('other');
            setShowForm(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Sort by date, closest first
    const sortedDays = [...specialDays].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
        <div className="p-4">
            {/* Add button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className="w-full mb-4"
            >
                <Plus className="w-4 h-4 mr-1" />
                소중한 날 추가
            </Button>

            {/* Add form */}
            {showForm && (
                <div className="p-3 bg-gray-50 rounded-lg mb-4 space-y-3">
                    <Input
                        placeholder="제목 (예: 출소일)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {DAY_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={handleSubmit}
                        disabled={!title || !date || isSubmitting}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                        {isSubmitting ? '추가 중...' : '추가'}
                    </Button>
                </div>
            )}

            {/* Days list */}
            {sortedDays.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                    등록된 소중한 날이 없습니다
                </p>
            ) : (
                <div className="space-y-2">
                    {sortedDays.map((day) => {
                        const dday = formatDDay(day.date);
                        const isPast = dday.startsWith('D+');
                        const isToday = dday === 'D-Day';

                        return (
                            <div
                                key={day.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${
                                    isToday ? 'bg-orange-50 border-orange-200' :
                                    isPast ? 'bg-gray-50 border-gray-200' :
                                    'bg-white border-gray-200'
                                }`}
                            >
                                <div className={`text-sm font-bold min-w-[60px] ${
                                    isToday ? 'text-orange-600' :
                                    isPast ? 'text-gray-400' :
                                    'text-blue-600'
                                }`}>
                                    {dday}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{day.title}</p>
                                    <p className="text-xs text-gray-500">
                                        {DAY_TYPES.find(t => t.value === day.type)?.label || day.type}
                                        {' · '}
                                        {day.date}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => router.push('/letter/compose/1')}
                                        className="p-1.5 text-orange-500 hover:bg-orange-50 rounded"
                                        title="편지 쓰기"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteDay(day.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                        title="삭제"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
