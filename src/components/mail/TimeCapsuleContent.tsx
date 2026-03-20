import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimeCapsules } from "@/hooks/useTimeCapsules";
import { useAuth } from "@/hooks/useAuth";
import { formatRecipientDisplay } from "@/lib/formatRecipient";

interface TimeCapsuleContentProps {
  onClose: () => void;
}

export function TimeCapsuleContent({ onClose }: TimeCapsuleContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { timeCapsules: apiCapsules, isLoading } = useTimeCapsules();
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // API 데이터 사용 (비로그인 시 빈 배열)
  const capsules = apiCapsules;

  const canNavigate = capsules.length > 1;

  // 카드 너비 + 간격 (모바일: 260px, 데스크톱: 290px)
  const CARD_GAP = 16;
  const getCardWidth = useCallback(() => {
    return window.innerWidth < 640 ? 260 : 290;
  }, []);

  // 스크롤 위치에 따라 현재 인덱스 업데이트
  const handleScroll = useCallback(() => {
    if (!carouselRef.current || capsules.length === 0) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = getCardWidth();
    const newIndex = Math.round(scrollLeft / (cardWidth + CARD_GAP));
    setCurrentIndex(Math.min(Math.max(newIndex, 0), capsules.length - 1));
  }, [capsules.length, getCardWidth]);

  // 특정 인덱스로 스크롤
  const scrollToIndex = useCallback((index: number) => {
    if (!carouselRef.current) return;
    const cardWidth = getCardWidth();
    const scrollPosition = index * (cardWidth + CARD_GAP);
    carouselRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  }, [getCardWidth]);

  const handlePrev = () => {
    if (!canNavigate) return;
    const newIndex = currentIndex === 0 ? capsules.length - 1 : currentIndex - 1;
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    if (!canNavigate) return;
    const newIndex = currentIndex === capsules.length - 1 ? 0 : currentIndex + 1;
    scrollToIndex(newIndex);
  };

  // 터치 스와이프 핸들링
  const touchStartX = useRef(0);
  const touchStartScrollLeft = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!carouselRef.current) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartScrollLeft.current = carouselRef.current.scrollLeft;
    isDragging.current = true;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!carouselRef.current || !isDragging.current) return;
    isDragging.current = false;
    // snap-mandatory가 자동으로 가장 가까운 카드에 정렬해줌
    // 짧은 딜레이 후 인덱스 업데이트
    requestAnimationFrame(() => handleScroll());
  }, [handleScroll]);

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.addEventListener('scroll', handleScroll, { passive: true });
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* Header - 간소화 */}
      <header className="hidden md:flex h-14 border-b border-border/40 bg-white items-center justify-between px-4 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-foreground">타임캡슐</h1>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          편지함
        </button>
      </header>

      {/* 비로그인 안내 배너 */}
      {!user && (
        <div className="bg-orange-50 border-b border-orange-100 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-orange-700">
            로그인하면 타임캡슐을 만들고 관리할 수 있습니다.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-100"
            onClick={() => router.push('/auth')}
          >
            로그인
          </Button>
        </div>
      )}

      {/* 타이틀 섹션 */}
      <div className="w-full max-w-5xl mx-auto px-4 pt-8 sm:px-6 sm:pt-12 lg:px-10">
        <section className="text-center mb-8 sm:mb-12">
          <p
            className="text-[#ff7430] text-size-14 sm:text-size-18 font-bold tracking-[1.8px] uppercase mb-2"
            style={{ fontFamily: 'Anonymous Pro, monospace' }}
          >
            Time Capsule
          </p>
          <p className="text-[#525252] text-size-16 sm:text-size-20 font-normal leading-[1.5] mb-1">
            한 사람을 위해, 여러 사람들이 모여
          </p>
          <h1 className="text-black text-size-22 sm:text-size-28 font-semibold leading-[1.4]">
            특별한 날에 타임캡슐을 전달해요.
          </h1>
        </section>
      </div>

      {/* 타임캡슐 카드 캐러셀 - 전체 너비 사용 */}
      {capsules.length > 0 && (
        <section className="mb-8 sm:mb-12 w-full relative z-0 bg-white">
          <div className="flex items-center justify-center gap-2">
            {/* 왼쪽 화살표 */}
            {canNavigate && (
              <button
                onClick={handlePrev}
                className="flex-shrink-0 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-all text-[#666] hover:text-[#ff7430] hidden md:flex"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* 캐러셀 컨테이너 */}
            <div
              ref={carouselRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className={`flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide px-4 md:px-6 touch-pan-x w-full ${
                capsules.length <= 3 ? 'md:justify-center' : ''
              }`}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {capsules.map((capsule, index) => (
                <motion.div
                  key={capsule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -4, boxShadow: "0px 4px 50px 0px rgba(255, 116, 48, 0.25)" }}
                  onClick={() => router.push(`/letter/time-capsule/${capsule.id}`)}
                  className="relative flex-shrink-0 w-[260px] sm:w-[290px] bg-white rounded-[20px] border border-gray-100 px-4 sm:px-5 py-6 sm:py-[30px] cursor-pointer transition-shadow snap-center"
                >
                  {/* D-Day & Message */}
                  <div className="flex gap-3 items-start">
                    <div className="bg-[#ff7430] rounded-[4px] px-2 py-1.5 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-white text-size-12 font-bold leading-normal">{capsule.collectingDaysLabel}</span>
                      <span className="text-white text-size-12 font-bold leading-normal" style={{ fontFamily: 'Paperlogy, sans-serif' }}>
                        D-{capsule.collectingDays}
                      </span>
                    </div>
                    <p className="text-[#3d3d3d] text-size-14 font-medium leading-[1.5] tracking-[-0.28px] flex-1">
                      곧 마음이 모이는 날이에요.<br />
                      지금부터 천천히 적어도 괜찮아요
                    </p>
                  </div>

                  {/* Capsule Image */}
                  <div className="relative w-[167px] h-[207px] mx-auto my-2">
                    <img
                      src="/timecapsule-orange-new.png"
                      alt="타임캡슐"
                      className="w-full h-full object-contain"
                    />
                    {/* 하단 그라데이션 페이드 */}
                    <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-t from-white to-transparent" />
                  </div>

                  {/* Recipient & Tags */}
                  <div className="flex flex-col gap-[14px]">
                    <div className="leading-[1.4]">
                      <p className="text-[#010101] text-size-22 font-semibold tracking-[-0.44px]">
                        To. <span className="font-bold">{capsule.recipientName}</span>
                      </p>
                      {(capsule.recipientFacility || capsule.recipientPrisonerNumber) && (
                        <p className="text-[#808080] text-size-12 mt-0.5">
                          {[capsule.recipientFacility, capsule.recipientPrisonerNumber].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {capsule.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-[#fdf3e3] text-[#ff7430] text-size-12 px-2.5 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="bg-[#fdf3e3] text-[#ff7430] text-size-12 px-2.5 py-1 rounded-full">
                        {capsule.daysLeftLabel}
                      </span>
                    </div>
                    {/* 멤버/편지 수 표시 */}
                    <div className="flex gap-2 text-xs text-gray-500">
                      <span>{capsule.memberCount}명 참여</span>
                      <span>•</span>
                      <span>{capsule.letterCount}개의 쪽지</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 오른쪽 화살표 */}
            {canNavigate && (
              <button
                onClick={handleNext}
                className="flex-shrink-0 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-all text-[#666] hover:text-[#ff7430] hidden md:flex"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* 페이지 인디케이터 (2개 이상일 때 모바일에서, 4개 이상일 때 데스크톱에서) */}
          {capsules.length > 1 && (
            <div className={`flex justify-center gap-2 mt-4 ${capsules.length <= 3 ? 'md:hidden' : ''}`}>
              {capsules.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-[#ff7430] w-4" : "bg-gray-300 w-2"
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 나머지 콘텐츠 - max-w 컨테이너 */}
      <div className="w-full max-w-5xl mx-auto px-4 pb-8 sm:px-6 sm:pb-12 lg:px-10">
        {/* 타임캡슐이 없을 때 빈 상태 카드 */}
        {capsules.length === 0 && !isLoading && (
          <section className="mb-12">
            <div className="flex flex-col items-center">
              <div className="w-[290px] bg-white border border-gray-100 rounded-[20px]  px-5 py-[30px]">
                {/* D-Day & Message */}
                <div className="flex gap-3 items-start">
                  <div className="bg-gray-300 rounded-[4px] px-2 py-1.5 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-white text-size-12 font-bold leading-normal">?일 뒤</span>
                    <span className="text-white text-size-12 font-bold leading-normal">D-?</span>
                  </div>
                  <p className="text-[#3d3d3d] text-size-13 font-medium leading-[1.5] tracking-[-0.26px] flex-1">
                    아직 타임캡슐이 없어요.<br />
                    특별한 날을 위해 만들어보세요
                  </p>
                </div>

                {/* Empty Capsule Image */}
                <div className="relative w-[196px] h-[207px] mx-auto my-2 opacity-50">
                  <img
                    src="/timecapsule-orange-new.png"
                    alt="타임캡슐"
                    className="w-full h-full object-contain grayscale"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-t from-white to-transparent" />
                </div>

                {/* 안내 텍스트 */}
                <div className="text-center">
                  <p className="text-[#010101] text-size-18 font-semibold mb-1">타임캡슐을 만들어보세요</p>
                  <p className="text-[#808080] text-size-13">소중한 사람을 위한 마음을 모아보세요</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 로딩 상태 */}
        {isLoading && capsules.length === 0 && (
          <section className="mb-12">
            <div className="flex flex-col items-center">
              <div className="w-[290px] bg-white border border-gray-100 rounded-[20px]  px-5 py-[30px]">
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 하단 CTA 섹션 */}
        <section className="flex flex-col items-center gap-[15px]">
          <Button
            onClick={() => router.push("/letter/time-capsule/create")}
            className="w-full max-w-[290px] bg-[#ff7512] hover:bg-[#ff6b24] text-white text-size-16 font-semibold leading-[1.5] px-8 py-2.5 rounded-[27px] h-auto"
          >
            + 새 타임캡슐 생성하기
          </Button>
{/* 초대 코드 참여 기능 — 추후 재활성화 */}
          {!user && (
            <p className="text-[#808080] text-size-15 text-center leading-[1.7]">
              예시모드입니다. 내 타임캡슐을 만들면 그대로 시작할 수 있어요.
            </p>
          )}
        </section>

      </div>

{/* 초대 코드 모달 — 추후 재활성화 */}
    </div>
  );
}
