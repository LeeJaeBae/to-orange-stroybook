'use client';

import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { siteConfig } from '@/config/site';
import { track } from '@/lib/analytics/tracker';

export function FloatingShareButton() {
  const handleShare = async () => {
    const shareUrl = siteConfig.url;

    if (typeof navigator.share === 'function') {
      track.shareClick('native');
      try {
        await navigator.share({
          title: siteConfig.name,
          text: siteConfig.description,
          url: shareUrl,
        });
      } catch {
        // 사용자가 공유를 취소한 경우 무시
      }
    } else {
      track.shareClick('clipboard');
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('링크가 복사되었습니다');
      } catch {
        toast.error('링크 복사에 실패했습니다');
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="fixed bottom-20 right-4 lg:bottom-8 z-50 bg-orange-500 text-white w-12 h-12 rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-105 flex items-center justify-center"
      aria-label="링크 공유"
    >
      <Share2 className="w-5 h-5" />
    </button>
  );
}
