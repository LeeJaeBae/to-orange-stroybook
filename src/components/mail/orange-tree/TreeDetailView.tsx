'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useOrangeTreeDetail } from '@/hooks/useOrangeTreeDetail';
import { useSpecialDays } from '@/hooks/useSpecialDays';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParticipantsTab } from './ParticipantsTab';
import { SpecialDaysTab } from './SpecialDaysTab';
import { ActivityFeed } from './ActivityFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface TreeDetailViewProps {
    treeId: string;
}

export function TreeDetailView({ treeId }: TreeDetailViewProps) {
    const router = useRouter();
    const { tree, participants, participantCount, activities, isLoading } = useOrangeTreeDetail(treeId);
    const { specialDays, createSpecialDay, deleteSpecialDay } = useSpecialDays(treeId);

    if (isLoading || !tree) {
        return (
            <div className="flex flex-col h-full p-4 gap-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    const receiverName = tree.receiver?.name || '알 수 없음';
    const facilityName = tree.receiver?.facility_name || '';

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b">
                <button onClick={() => router.push('/letter/orangetree')} className="p-1">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-lg font-bold">{receiverName}의 나무</h1>
                    <p className="text-xs text-gray-500">{facilityName}</p>
                </div>
            </div>

            {/* Tree Visualization */}
            <div className="relative bg-gradient-to-b from-sky-100 to-green-50 p-6 flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative"
                >
                    {/* Simple tree illustration */}
                    <div className="flex flex-col items-center">
                        {/* Canopy */}
                        <div
                            className="rounded-full bg-green-500 relative"
                            style={{
                                width: `${Math.max(80, Math.min(160, 80 + tree.leaf_count * 2))}px`,
                                height: `${Math.max(80, Math.min(160, 80 + tree.leaf_count * 2))}px`,
                            }}
                        >
                            {/* Orange dots */}
                            {Array.from({ length: Math.min(tree.orange_count, 8) }).map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-4 h-4 bg-orange-400 rounded-full border-2 border-orange-500"
                                    style={{
                                        top: `${20 + Math.sin(i * 0.8) * 30}%`,
                                        left: `${20 + Math.cos(i * 1.2) * 30}%`,
                                    }}
                                />
                            ))}
                        </div>
                        {/* Trunk */}
                        <div className="w-6 h-12 bg-amber-800 rounded-b-md" />
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="flex gap-6 mt-4 text-sm">
                    <div className="text-center">
                        <p className="font-bold text-green-700">{tree.leaf_count}</p>
                        <p className="text-gray-500 text-xs">편지(잎)</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-orange-600">{tree.orange_count}</p>
                        <p className="text-gray-500 text-xs">선물(오렌지)</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-blue-600">{participantCount}</p>
                        <p className="text-gray-500 text-xs">참여자</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="participants" className="flex-1 flex flex-col">
                <TabsList className="w-full rounded-none border-b bg-white">
                    <TabsTrigger value="participants" className="flex-1">참여자</TabsTrigger>
                    <TabsTrigger value="activities" className="flex-1">활동</TabsTrigger>
                    <TabsTrigger value="special-days" className="flex-1">소중한 날</TabsTrigger>
                </TabsList>

                <TabsContent value="participants" className="flex-1 overflow-y-auto mt-0">
                    <ParticipantsTab participants={participants} count={participantCount} />
                </TabsContent>

                <TabsContent value="activities" className="flex-1 overflow-y-auto mt-0">
                    <ActivityFeed activities={activities} limit={20} />
                </TabsContent>

                <TabsContent value="special-days" className="flex-1 overflow-y-auto mt-0">
                    <SpecialDaysTab
                        treeId={treeId}
                        specialDays={specialDays}
                        onCreateDay={createSpecialDay}
                        onDeleteDay={deleteSpecialDay}
                    />
                </TabsContent>
            </Tabs>

            {/* CTA */}
            <div className="p-4 border-t bg-white">
                <Button
                    onClick={() => router.push('/letter/compose/1')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                    편지 쓰기
                </Button>
            </div>
        </div>
    );
}
