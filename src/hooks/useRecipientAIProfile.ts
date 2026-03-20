'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export interface RecipientAIProfile {
    id?: string;
    recipientId: string;
    speechStyle: string;
    tone: string;
    context: string | null;
    episodes: string | null;
    emotions: string | null;
    chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export function useRecipientAIProfile(recipientId: string | null) {
    const [profile, setProfile] = useState<RecipientAIProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const hasProfile = !!profile;

    // 프로필 조회
    useEffect(() => {
        if (!recipientId) {
            setIsLoading(false);
            setProfile((current) => current === null ? current : null);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        const fetchProfile = async () => {
            try {
                const supabase = createSupabaseBrowserClient();
                const { data, error } = await supabase
                    .from('recipient_ai_profiles')
                    .select('*')
                    .eq('recipient_id', recipientId)
                    .maybeSingle();

                if (cancelled) return;

                if (error) {
                    console.error('AI 프로필 조회 실패:', JSON.stringify(error, null, 2), 'code:', error.code, 'message:', error.message, 'details:', error.details);
                    setProfile(null);
                } else if (data) {
                    setProfile({
                        id: data.id,
                        recipientId: data.recipient_id,
                        speechStyle: data.speech_style,
                        tone: data.tone,
                        context: data.context,
                        episodes: data.episodes,
                        emotions: data.emotions,
                        chatHistory: data.chat_history,
                    });
                } else {
                    setProfile(null);
                }
            } catch (err) {
                console.error('AI 프로필 조회 오류:', err);
                if (!cancelled) setProfile(null);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchProfile();
        return () => { cancelled = true; };
    }, [recipientId]);

    // 프로필 저장
    const saveProfile = useCallback(async (data: {
        recipientId: string;
        speechStyle: string;
        tone: string;
        context: string;
        episodes: string;
        emotions: string;
        chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    }) => {
        try {
            const supabase = createSupabaseBrowserClient();
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) throw new Error('로그인이 필요합니다');

            const { data: result, error } = await supabase
                .from('recipient_ai_profiles')
                .upsert({
                    user_id: userData.user.id,
                    recipient_id: data.recipientId,
                    speech_style: data.speechStyle,
                    tone: data.tone,
                    context: data.context,
                    episodes: data.episodes,
                    emotions: data.emotions,
                    chat_history: data.chatHistory || [],
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'user_id,recipient_id',
                })
                .select()
                .single();

            if (error) throw error;

            setProfile({
                id: result.id,
                recipientId: result.recipient_id,
                speechStyle: result.speech_style,
                tone: result.tone,
                context: result.context,
                episodes: result.episodes,
                emotions: result.emotions,
                chatHistory: result.chat_history,
            });

            return result;
        } catch (err) {
            console.error('AI 프로필 저장 실패:', err);
            throw err;
        }
    }, []);

    return { profile, isLoading, hasProfile, saveProfile };
}
