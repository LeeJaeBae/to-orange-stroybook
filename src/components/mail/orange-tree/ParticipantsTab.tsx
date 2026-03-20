'use client';

interface Participant {
    masked_name: string;
    relation: string;
    is_me: boolean;
}

interface ParticipantsTabProps {
    participants: Participant[];
    count: number;
}

export function ParticipantsTab({ participants, count }: ParticipantsTabProps) {
    return (
        <div className="p-4">
            <p className="text-sm text-gray-500 mb-3">
                이 나무를 함께 키우는 사람들 ({count}명)
            </p>
            <div className="space-y-3">
                {participants.map((p, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-medium text-orange-700">
                            {p.masked_name[0]}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {p.masked_name}
                                {p.is_me && (
                                    <span className="ml-2 text-xs text-orange-500 font-normal">나</span>
                                )}
                            </p>
                            <p className="text-xs text-gray-500">{p.relation}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
