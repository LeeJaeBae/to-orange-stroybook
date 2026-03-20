'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// SpeechRecognition 인터페이스 정의
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface ISpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

// SpeechRecognition 생성자 타입
type SpeechRecognitionConstructor = new () => ISpeechRecognition;

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    lang = 'ko-KR',
    continuous = true,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  // 사용자가 명시적으로 중지했는지 추적
  const manuallyStoppedRef = useRef(false);
  // 재시작 시도 횟수 추적 (무한 루프 방지)
  const restartAttemptsRef = useRef(0);
  const maxRestartAttempts = 5;
  // 마지막으로 처리한 resultIndex 추적 (중복 입력 방지)
  const lastProcessedIndexRef = useRef(-1);

  // 콜백을 ref로 저장하여 useEffect 재실행 방지
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  // 콜백 업데이트
  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

  // 브라우저 지원 여부 확인
  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? ((window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
           (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition)
        : null;

    setIsSupported(!!SpeechRecognitionAPI);

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = lang;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        // 결과를 받았으므로 재시작 횟수 리셋
        restartAttemptsRef.current = 0;

        let finalTranscript = '';
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;

          if (result.isFinal) {
            // 이미 처리한 resultIndex는 건너뜀 (재시작 시 중복 방지)
            if (i <= lastProcessedIndexRef.current) continue;
            lastProcessedIndexRef.current = i;
            finalTranscript += text;
          } else {
            interimText += text;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
          onResultRef.current?.(finalTranscript, true);
        }

        setInterimTranscript(interimText);
        if (interimText) {
          onResultRef.current?.(interimText, false);
        }
      };

      recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);

        // 복구 가능한 에러는 자동 재시작되므로 메시지 표시 안함
        const recoverableErrors = ['no-speech', 'aborted', 'network'];

        if (recoverableErrors.includes(event.error)) {
          // 복구 가능한 에러는 onend에서 자동 재시작 처리
          // isListening 상태 유지
          return;
        }

        // 복구 불가능한 에러만 처리
        let errorMessage = '음성 인식 오류가 발생했습니다.';
        switch (event.error) {
          case 'audio-capture':
            errorMessage = '마이크를 찾을 수 없습니다. 마이크 연결을 확인해주세요.';
            manuallyStoppedRef.current = true; // 재시작 방지
            break;
          case 'not-allowed':
            // 브라우저/OS 별 안내 메시지
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isAndroid = /Android/.test(navigator.userAgent);
            const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

            if (isIOS) {
              errorMessage = '마이크 권한이 필요합니다.\n설정 > Safari > 마이크에서 권한을 허용해주세요.';
            } else if (isAndroid) {
              errorMessage = '마이크 권한이 필요합니다.\n설정 > 앱 > 브라우저 > 권한 > 마이크를 허용해주세요.';
            } else if (isSafari) {
              errorMessage = '마이크 권한이 필요합니다.\nSafari 메뉴 > 설정 > 웹사이트 > 마이크에서 허용해주세요.';
            } else {
              errorMessage = '마이크 권한이 필요합니다.\n주소창 왼쪽 🔒 아이콘 클릭 > 사이트 설정 > 마이크를 허용해주세요.';
            }
            manuallyStoppedRef.current = true; // 재시작 방지
            break;
        }

        onErrorRef.current?.(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended. manuallyStoppedRef:', manuallyStoppedRef.current, 'restartAttempts:', restartAttemptsRef.current);

        // 사용자가 명시적으로 중지하지 않았으면 자동 재시작
        if (!manuallyStoppedRef.current && restartAttemptsRef.current < maxRestartAttempts) {
          restartAttemptsRef.current += 1;
          // 약간의 딜레이 후 재시작 (브라우저 안정성)
          setTimeout(() => {
            if (!manuallyStoppedRef.current && recognitionRef.current) {
              try {
                console.log('Restarting speech recognition...');
                recognitionRef.current.start();
              } catch (error) {
                console.error('Failed to restart speech recognition:', error);
                // 이미 시작된 상태일 수 있음 - 무시
              }
            }
          }, 300);
        } else {
          setIsListening(false);
          setInterimTranscript('');
          restartAttemptsRef.current = 0;
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      // 클린업 시 재시작 방지
      manuallyStoppedRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, continuous, interimResults]); // onResult, onError는 ref로 관리

  const startListening = useCallback(() => {
    console.log('startListening called. recognitionRef:', !!recognitionRef.current, 'isListening:', isListening);

    if (recognitionRef.current && !isListening) {
      // 플래그 리셋
      manuallyStoppedRef.current = false;
      restartAttemptsRef.current = 0;
      lastProcessedIndexRef.current = -1;

      setTranscript('');
      setInterimTranscript('');
      try {
        console.log('Starting speech recognition...');
        recognitionRef.current.start();
        setIsListening(true);
        console.log('Speech recognition started successfully');
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        onErrorRef.current?.('음성 인식을 시작할 수 없습니다.');
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      // 사용자가 명시적으로 중지함을 표시
      manuallyStoppedRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  };
}
