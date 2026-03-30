'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/index.client';
import { track } from '@/lib/analytics/tracker';
import { toast } from 'sonner';

export function FloatingBottomBar() {
  const router = useRouter();
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // 스크롤 방향 감지
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const diff = currentScrollY - lastScrollY.current;

        if (currentScrollY <= 10) {
          setIsVisible(true);
        } else if (diff > 5) {
          setIsVisible(false);
        } else if (diff < -5) {
          setIsVisible(true);
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowLoginAlert(true);
      return;
    }

    const numbers = phoneNumber.replace(/[^\d]/g, '');
    if (numbers.length < 10 || numbers.length > 11) {
      alert('올바른 전화번호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // [Storybook mock] 실제 API 호출 대신 mock 처리
      console.log('[mock] SMS send-link:', numbers);
      toast.success('문자가 발송되었습니다!');
      setPhoneNumber('');
      track.ctaClick('floating_bar_sms');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '문자 발송에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-gray-900 text-white z-50 safe-bottom transition-transform duration-500 ease-in-out md:translate-y-0 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      {/* 로그인 필요 알림 */}
      {showLoginAlert && (
        <div className="absolute bottom-full left-0 right-0 bg-orange-50 border-t border-orange-200 px-4 py-3 flex items-center justify-between animate-in slide-in-from-bottom-2">
          <p className="text-sm text-orange-700">문자 발송은 로그인 후 이용할 수 있어요.</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLoginAlert(false)}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
            >
              닫기
            </button>
            <button
              onClick={() => router.push('/login')}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-colors"
            >
              로그인
            </button>
          </div>
        </div>
      )}

      {/* 모바일: 2줄 / PC: 1줄 */}
      <div className="max-w-6xl mx-auto px-4">
        {/* 모바일 레이아웃 (1줄 CTA) */}
        <div className="flex items-center justify-between h-14 md:hidden">
          {/* 좌측: 문구 */}
          <p className="text-sm text-gray-300">
            소중한 사람에게 마음을 전하세요
          </p>
          {/* 우측: CTA 버튼 */}
          <Link
            href="/letter/compose/1"
            onClick={() => track.ctaClick('floating_bar')}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 px-5 rounded-full transition-colors whitespace-nowrap"
          >
            편지 쓰러 가기
          </Link>
        </div>

        {/* PC 레이아웃 (1줄) */}
        <div className="hidden md:flex items-center justify-between h-[50px]">
          {/* 좌측: 문구 */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">투오렌지 앱 링크를 문자로 받아보세요</span>
          </div>
          {/* 우측: 인풋 + 버튼 */}
          <div className="flex items-center gap-2 mr-[70px]">
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="010-0000-0000"
              className="w-[140px] px-3 py-2 text-xs rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              maxLength={13}
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitting ? '발송 중...' : '문자로 링크 받기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
