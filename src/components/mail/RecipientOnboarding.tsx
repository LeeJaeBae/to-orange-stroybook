'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api/fetch';
import type { RecipientAIProfile } from '@/hooks/useRecipientAIProfile';

interface RecipientOnboardingProps {
    recipientId: string;
    recipientName: string;
    recipientRelation: string;
    recipientFacility?: string;
    recipientAddress?: string;
    senderAddress?: string;
    lastLetterDate?: string;
    letterHistory?: Array<{ date: string; direction: 'sent' | 'received'; content: string }>;
    currentContent?: string;
    onComplete: (profile: RecipientAIProfile, letterParts?: { intro: string; bodyGuide: string }) => void;
    onSkip: () => void;
}

// 단계 정의
type Step = 'tone' | 'emotion' | 'keyword' | 'generating';

interface PresetData {
    tones: Array<{ id: string; label: string; emoji: string; desc: string; example: string }>;
    emotions: Array<{ id: string; label: string; emoji: string }>;
    keywords: string[];
}

// 폴백 프리셋 (AI 호출 실패 시)
const fallbackPresets: PresetData = {
    tones: [
        { id: 'warm', label: '따뜻하게', emoji: '🧡', desc: '부드럽고 따뜻한 말투', example: '요즘 많이 추워졌는데, 건강은 괜찮아? 네 생각이 많이 나서 편지를 써.' },
        { id: 'casual', label: '편하게', emoji: '😊', desc: '친구처럼 편한 말투', example: '야 잘 지내지? 할 말이 있어서 이렇게 써본다.' },
        { id: 'formal', label: '정중하게', emoji: '🙏', desc: '존댓말, 격식 있게', example: '안녕하세요, 그동안 잘 지내셨는지요. 오랜만에 안부 전합니다.' },
        { id: 'cheerful', label: '밝게', emoji: '✨', desc: '밝고 긍정적인 말투', example: '안녕! 오늘 너한테 편지 쓴다 생각하니까 벌써 기분이 좋아!' },
        { id: 'calm', label: '담담하게', emoji: '🌿', desc: '차분하고 담백하게', example: '오랜만이다. 별일 없이 지내고 있어. 문득 네가 생각나서 적어본다.' },
        { id: 'honest', label: '솔직하게', emoji: '💬', desc: '꾸밈없이 솔직하게', example: '사실 이 편지를 쓸까 말까 고민을 많이 했어. 근데 지금 아니면 못 할 것 같아서.' },
    ],
    emotions: [
        { id: 'miss', label: '보고싶다', emoji: '💭' },
        { id: 'thanks', label: '고맙다', emoji: '🙏' },
        { id: 'sorry', label: '미안하다', emoji: '😔' },
        { id: 'cheer', label: '힘내', emoji: '💪' },
        { id: 'love', label: '사랑해', emoji: '❤️' },
        { id: 'proud', label: '자랑스럽다', emoji: '🌟' },
        { id: 'worry', label: '걱정된다', emoji: '🥺' },
        { id: 'happy', label: '기쁘다', emoji: '😄' },
    ],
    keywords: ['안부', '감사', '응원', '사과', '축하', '그리움', '건강', '일상', '추억', '약속'],
};

export function RecipientOnboarding({
    recipientId,
    recipientName,
    recipientRelation,
    recipientFacility,
    recipientAddress,
    senderAddress,
    lastLetterDate,
    letterHistory,
    currentContent,
    onComplete,
    onSkip,
}: RecipientOnboardingProps) {
    const [step, setStep] = useState<Step>('tone');
    const [selectedTone, setSelectedTone] = useState<string | null>(null);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [presets, setPresets] = useState<PresetData>(fallbackPresets);
    const [isLoadingPresets, setIsLoadingPresets] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 날씨 가져오기 (wttr.in, 무료, 키 불필요)
    const fetchWeather = async (location?: string): Promise<string | undefined> => {
        if (!location) return undefined;
        try {
            // 주소에서 시/도 추출
            const city = location.match(/([가-힣]+[시도군구])/)?.[1] || location.slice(0, 10);
            const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=%t+%C&lang=ko`, {
                signal: AbortSignal.timeout(3000),
            });
            if (res.ok) return await res.text();
        } catch { /* 무시 */ }
        return undefined;
    };

    // AI 프리셋 로드
    useEffect(() => {
        const loadPresets = async () => {
            try {
                // 날씨 병렬 로드
                const [senderWeather, recipientWeather] = await Promise.all([
                    fetchWeather(senderAddress),
                    fetchWeather(recipientAddress),
                ]);

                const res = await apiFetch('/api/v1/ai/onboarding/presets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        recipientName,
                        recipientRelation,
                        recipientFacility,
                        recipientAddress,
                        senderAddress,
                        lastLetterDate,
                        letterHistory,
                        weatherInfo: (senderWeather || recipientWeather) ? {
                            sender: senderWeather,
                            recipient: recipientWeather,
                        } : undefined,
                    }),
                });
                const data = await res.json();
                if (data.tones && data.emotions && data.keywords) {
                    setPresets(data);
                }
            } catch (err) {
                console.error('프리셋 로드 실패, 폴백 사용:', err);
            } finally {
                setIsLoadingPresets(false);
            }
        };
        loadPresets();
    }, [recipientName, recipientRelation, recipientFacility, recipientAddress, senderAddress, lastLetterDate]);

    const tonePresets = presets.tones;
    const emotionPresets = presets.emotions;
    const keywords = presets.keywords;

    const toggleEmotion = (id: string) => {
        setSelectedEmotions(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : prev.length < 3 ? [...prev, id] : prev
        );
    };

    const toggleKeyword = (kw: string) => {
        setSelectedKeywords(prev =>
            prev.includes(kw) ? prev.filter(k => k !== kw) : prev.length < 5 ? [...prev, kw] : prev
        );
    };

    const canProceed = () => {
        if (step === 'tone') return !!selectedTone;
        if (step === 'emotion') return selectedEmotions.length > 0;
        if (step === 'keyword') return selectedKeywords.length > 0;
        return false;
    };

    const nextStep = () => {
        if (step === 'tone') setStep('emotion');
        else if (step === 'emotion') setStep('keyword');
        else if (step === 'keyword') handleGenerate();
    };

    const prevStep = () => {
        if (step === 'emotion') setStep('tone');
        else if (step === 'keyword') setStep('emotion');
    };

    const stepIndex = step === 'tone' ? 0 : step === 'emotion' ? 1 : step === 'keyword' ? 2 : 3;

    const handleGenerate = async () => {
        setStep('generating');
        setIsGenerating(true);

        try {
            const tone = tonePresets.find(t => t.id === selectedTone);
            const emotions = selectedEmotions.map(id => emotionPresets.find(e => e.id === id)?.label).filter(Boolean);

            // 날씨 가져오기
            const [sw, rw] = await Promise.all([
                fetchWeather(senderAddress),
                fetchWeather(recipientAddress),
            ]);

            const res = await apiFetch('/api/v1/ai/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId,
                    recipientName,
                    recipientRelation,
                    recipientFacility,
                    letterHistory,
                    currentContent,
                    // 새로운 프리셋 기반 데이터
                    presetMode: true,
                    selectedTone: tone?.label,
                    selectedEmotions: emotions,
                    selectedKeywords,
                    // 추가 컨텍스트
                    recipientAddress,
                    senderAddress,
                    lastLetterDate,
                    weatherInfo: (sw || rw) ? { sender: sw, recipient: rw } : undefined,
                }),
            });

            const data = await res.json();

            if (data.profile) {
                toast.success('편지 도우미 준비 완료! 🍊');
                onComplete(
                    {
                        recipientId,
                        speechStyle: tone?.label || '따뜻하게',
                        tone: tone?.id || 'warm',
                        context: `감정: ${emotions.join(', ')} / 키워드: ${selectedKeywords.join(', ')}`,
                        episodes: selectedKeywords.join(', '),
                        emotions: emotions.join(', '),
                        chatHistory: [],
                    },
                    {
                        intro: data.intro || '',
                        bodyGuide: data.bodyGuide || '',
                    }
                );
            } else if (data.error) {
                toast.error(data.error);
                setStep('keyword');
            }
        } catch (err) {
            console.error('생성 실패:', err);
            toast.error('편지 생성에 실패했습니다');
            setStep('keyword');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[55vh] w-full max-w-md mx-auto flex flex-col"
        >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🍊</span>
                    <span className="font-semibold text-gray-800">
                        {recipientName}님에게 편지 쓰기
                    </span>
                </div>
                <button
                    onClick={onSkip}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* 프로그레스 바 */}
            <div className="px-5 pb-3">
                <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                i <= stepIndex ? 'bg-orange-400' : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* 컨텐츠 */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-4">
                <AnimatePresence mode="wait">
                    {/* 프리셋 로딩 */}
                    {isLoadingPresets && step === 'tone' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-8"
                        >
                            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                            <p className="text-sm text-gray-500 mt-3">
                                {recipientName}님에게 맞는 옵션을 준비하고 있어요...
                            </p>
                        </motion.div>
                    )}

                    {/* Step 1: 말투 선택 */}
                    {step === 'tone' && !isLoadingPresets && (
                        <motion.div
                            key="tone"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-3"
                        >
                            <div>
                                <h3 className="text-base font-bold text-gray-800">어떤 말투로 쓸까요?</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {recipientName}님에게 어울리는 말투를 골라주세요
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                {tonePresets.map(tone => (
                                    <button
                                        key={tone.id}
                                        onClick={() => setSelectedTone(tone.id)}
                                        className={`w-full p-2.5 rounded-lg border-2 text-left transition-all ${
                                            selectedTone === tone.id
                                                ? 'border-orange-400 bg-orange-50'
                                                : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm">{tone.emoji}</span>
                                            <span className="font-semibold text-xs text-gray-800">{tone.label}</span>
                                        </div>
                                        <p className="text-size-11 text-gray-400 mt-1 leading-relaxed italic">&ldquo;{tone.example}&rdquo;</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: 감정 선택 */}
                    {step === 'emotion' && (
                        <motion.div
                            key="emotion"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-3"
                        >
                            <div>
                                <h3 className="text-base font-bold text-gray-800">어떤 마음을 전하고 싶으세요?</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    최대 3개까지 선택할 수 있어요
                                </p>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {emotionPresets.map(emotion => (
                                    <button
                                        key={emotion.id}
                                        onClick={() => toggleEmotion(emotion.id)}
                                        className={`p-2 rounded-lg border-2 text-center transition-all ${
                                            selectedEmotions.includes(emotion.id)
                                                ? 'border-orange-400 bg-orange-50'
                                                : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                        }`}
                                    >
                                        <span className="text-base">{emotion.emoji}</span>
                                        <p className="text-size-10 font-medium text-gray-700 mt-0.5">{emotion.label}</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: 키워드 선택 */}
                    {step === 'keyword' && (
                        <motion.div
                            key="keyword"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-3"
                        >
                            <div>
                                <h3 className="text-base font-bold text-gray-800">어떤 이야기를 담을까요?</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {recipientName}님에게 전할 이야기 키워드를 골라주세요 (최대 5개)
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {keywords.map(kw => (
                                    <button
                                        key={kw}
                                        onClick={() => toggleKeyword(kw)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                            selectedKeywords.includes(kw)
                                                ? 'bg-orange-400 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {kw}
                                    </button>
                                ))}
                            </div>

                            {/* 선택 요약 */}
                            <div className="bg-orange-50 rounded-lg p-2.5 mt-1">
                                <p className="text-size-11 text-orange-700 leading-relaxed">
                                    <span className="font-semibold">💡 이렇게 만들어요:</span>{' '}
                                    {tonePresets.find(t => t.id === selectedTone)?.label} 말투로,{' '}
                                    {selectedEmotions.map(id => emotionPresets.find(e => e.id === id)?.label).join(' · ')} 감정을 담아,{' '}
                                    {selectedKeywords.length > 0 ? selectedKeywords.join(' · ') + ' 이야기' : '...'}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: 생성 중 */}
                    {step === 'generating' && (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-12"
                        >
                            <div className="relative">
                                <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
                                <Sparkles className="w-4 h-4 text-orange-300 absolute -top-1 -right-1 animate-pulse" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 mt-4">
                                {recipientName}님에게 맞는 편지를 준비하고 있어요...
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                서문과 마무리를 만들어 드릴게요
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 하단 버튼 */}
            {step !== 'generating' && (
                <div className="px-5 pb-5 pt-2 flex gap-2">
                    {step !== 'tone' && (
                        <button
                            onClick={prevStep}
                            className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium text-sm hover:bg-gray-200 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            이전
                        </button>
                    )}
                    <button
                        onClick={nextStep}
                        disabled={!canProceed()}
                        className={`flex-1 flex items-center justify-center gap-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                            canProceed()
                                ? 'bg-orange-400 text-white hover:bg-orange-500'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {step === 'keyword' ? (
                            <>
                                <Sparkles className="w-4 h-4" />
                                편지 만들기
                            </>
                        ) : (
                            <>
                                다음
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            )}
        </motion.div>
    );
}
