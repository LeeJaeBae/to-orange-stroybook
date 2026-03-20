import { useCallback } from 'react';
import { toast } from 'sonner';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface UseLetterVoiceOptions {
  onTranscript: (text: string) => void;
}

export function useLetterVoice({ onTranscript }: UseLetterVoiceOptions) {
  const {
    isListening,
    isSupported: isSpeechSupported,
    interimTranscript,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang: 'ko-KR',
    continuous: true,
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        onTranscript(transcript);
      }
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleVoiceToggle = useCallback(() => {
    if (isListening) {
      stopListening();
      toast.success('음성 입력이 종료되었습니다.');
    } else {
      startListening();
      toast.info('음성 입력을 시작합니다. 말씀해주세요!', {
        description: '마이크 버튼을 다시 누르면 종료됩니다.',
      });
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSpeechSupported,
    interimTranscript,
    handleVoiceToggle,
  };
}
