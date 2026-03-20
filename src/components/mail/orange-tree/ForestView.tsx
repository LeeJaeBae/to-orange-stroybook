'use client';

import { useOrangeTrees } from '@/hooks/useOrangeTrees';
import { ForestCanvas } from './ForestCanvas';
import { Skeleton } from '@/components/ui/skeleton';

export function ForestView() {
    const { trees, isLoading } = useOrangeTrees();

    if (isLoading) {
        return (
            <div className="flex flex-col h-full p-4 gap-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="flex-1 min-h-[50vh] rounded-xl" />
            </div>
        );
    }

    if (trees.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <span className="text-4xl">🌱</span>
                </div>
                <p className="text-lg font-bold text-gray-900">아직 오렌지나무가 없어요</p>
                <p className="text-sm text-gray-500 mt-2">
                    편지를 보내면 수신자의 오렌지나무가 자동으로 심어집니다
                </p>
            </div>
        );
    }

    const totalLeaves = trees.reduce((sum, t) => sum + t.leaf_count, 0);
    const totalOranges = trees.reduce((sum, t) => sum + t.orange_count, 0);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-3 border-b">
                <h1 className="text-xl font-bold text-gray-900">내 오렌지 숲</h1>
                <div className="flex gap-4 mt-1 text-sm text-gray-500">
                    <span>🌳 나무 {trees.length}그루</span>
                    <span>🍃 편지 {totalLeaves}통</span>
                    <span>🍊 선물 {totalOranges}개</span>
                </div>
            </div>

            {/* 3D Forest Canvas */}
            <div className="flex-1 min-h-[50vh] bg-gradient-to-b from-sky-100 to-sky-50">
                <ForestCanvas trees={trees} />
            </div>

            {/* Activity hint */}
            <div className="px-4 py-3 border-t bg-white">
                <p className="text-xs text-gray-400 font-medium">나무를 터치하면 상세 활동을 볼 수 있어요</p>
            </div>
        </div>
    );
}
