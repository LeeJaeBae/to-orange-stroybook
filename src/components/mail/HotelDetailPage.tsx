import React, { useState } from 'react';
import { ChevronLeft, Heart, Share2, MapPin, Phone, Check, ChevronRight, X, ImageOff, Sparkles, Coffee, BedDouble } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface HotelInfo {
  id: string;
  name: string;
  type: 'hotel' | 'cafe';
  location: string;
  distance: string;
  images: string[];
  phone: string;
  tags: string[];
  description: string;
  facilities: string[];
  serviceLanguage: string;
  facilityInfo: string[];
  totalRooms: number;
  price?: string;
  url?: string; // 카카오맵 상세 페이지 URL
}

interface HotelDetailPopupProps {
  hotel: HotelInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function HotelDetailPopup({ hotel, isOpen, onClose }: HotelDetailPopupProps): React.ReactElement | null {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'intro' | 'facilities' | 'guide' | 'notice'>('intro');
  const [isLiked, setIsLiked] = useState(false);

  const nextImage = () => {
    if (!hotel) return;
    setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
  };

  const prevImage = () => {
    if (!hotel) return;
    setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
  };

  // Reset state when hotel changes
  React.useEffect(() => {
    if (hotel) {
      setCurrentImageIndex(0);
      setActiveTab('intro');
    }
  }, [hotel?.id]);

  if (!hotel) return null;

  const isCafe = hotel.type === 'cafe';
  const tabs = [
    { key: 'intro', label: isCafe ? '장소 소개' : '숙소 소개' },
    { key: 'facilities', label: isCafe ? '편의 정보' : '시설/서비스' },
    { key: 'guide', label: '이용 안내' },
    { key: 'notice', label: isCafe ? '방문 팁' : '예약 공지' },
  ] as const;
  const title = isCafe ? '대기장소 상세' : '숙소 상세';
  const primaryActionLabel = isCafe ? '길찾기 보기' : '카카오맵에서 보기';
  const contactLabel = isCafe ? '매장문의' : '예약문의';
  const introTitle = isCafe ? '장소 소개' : '숙소 소개';
  const facilitiesTitle = isCafe ? '편의 정보' : '시설/서비스';
  const guideTitle = isCafe ? '이용 안내' : '이용 안내';
  const noticeTitle = isCafe ? '방문 팁' : '예약 공지';
  const emptyPhoneText = isCafe ? '전화번호 정보 없음' : '전화번호 정보 없음';
  const defaultDescription = isCafe
    ? '면회 전후 잠깐 머무르기 좋은 대기 장소예요. 운영 시간과 혼잡도를 미리 확인해두면 덜 지칩니다.'
    : '교정시설 방문 전후 머무르기 좋은 숙소예요. 체크인 가능 시간과 이동 동선을 함께 확인해두세요.';
  const guideCards = isCafe
    ? [
        {
          title: '방문 전 확인',
          body: '운영 시간, 좌석 여유, 주차 가능 여부를 먼저 확인해두세요.',
        },
        {
          title: '대기 시간 활용',
          body: '면회 전후 서류를 정리하거나 잠깐 쉬기에 좋아요.',
        },
        {
          title: '주의사항',
          body: '혼잡 시간대에는 오래 머무르기 어렵거나 주차가 제한될 수 있어요.',
        },
      ]
    : [
        {
          title: '체크인/체크아웃',
          body: '체크인: 15:00 / 체크아웃: 11:00',
        },
        {
          title: '취소/환불 규정',
          body: '예약 취소 시 숙소의 취소/환불 규정이 적용됩니다.',
        },
        {
          title: '주의사항',
          body: '반려동물 동반 불가, 객실 내 흡연 불가, 미성년자 단독 투숙 불가',
        },
      ];
  const noticeBody = isCafe
    ? '면회 시간 전후로 잠깐 대기하거나 일행을 만나기 좋은 장소예요.\n방문 전 영업 시간과 주차 가능 여부를 다시 확인해 주세요.'
    : '본 숙소는 교정시설 면회객을 위한 추천 숙소입니다.\n예약 시 면회 일정을 말씀해 주시면 체크인/체크아웃 시간 조정이 가능할 수 있습니다.\n자세한 사항은 숙소로 직접 문의해 주세요.';
  const description = hotel.description || defaultDescription;
  const tags = hotel.tags.length > 0 ? hotel.tags : (isCafe ? ['대기장소', '휴식'] : ['숙박', '교정시설 인근']);
  const facilities = hotel.facilities.length > 0
    ? hotel.facilities
    : (isCafe ? ['앉아서 대기 가능', '음료 주문 가능', '외부 이동 전 휴식'] : ['주변 숙박', '교정시설 이동 용이', '예약 전 문의 권장']);
  const facilityInfo = hotel.facilityInfo.length > 0
    ? hotel.facilityInfo
    : [isCafe ? '주소와 이용 팁을 정리 중이에요.' : '숙소 위치와 부대정보를 정리 중이에요.'];
  const PlaceholderIcon = isCafe ? Coffee : BedDouble;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Popup - 반응형 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[100px] pb-[50px] px-4"
          >
            <div className="w-full max-w-[600px] max-h-full bg-white rounded-2xl flex flex-col overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">{title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <Heart className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} size={20} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <Share2 className="text-gray-500" size={20} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="text-gray-500" size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Image Slider */}
              <div className="relative w-full aspect-[16/10] bg-gray-100">
                {hotel.images.length > 0 ? (
                  <>
                    <img
                      src={hotel.images[currentImageIndex]}
                      alt={`${hotel.name} ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Navigation Arrows */}
                    {hotel.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-all"
                        >
                          <ChevronLeft className="text-white" size={20} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-all"
                        >
                          <ChevronRight className="text-white" size={20} />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 rounded-full text-white text-sm">
                      {String(currentImageIndex + 1).padStart(2, '0')} / {hotel.images.length}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-50 via-amber-50 to-white flex flex-col items-center justify-center text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center mb-4">
                      <ImageOff className="text-orange-300" size={28} />
                    </div>
                    <p className="text-base font-semibold text-gray-800 mb-1">{hotel.name}</p>
                    <p className="text-sm text-gray-500">
                      {isCafe ? '사진은 아직 정리 중이야. 대신 위치랑 이용 정보부터 확인해.' : '객실 이미지는 아직 준비 중이야. 대신 위치랑 숙소 정보를 먼저 봐.'}
                    </p>
                    <div className="mt-5 flex items-center gap-2 text-xs text-orange-500 font-medium">
                      <Sparkles size={14} />
                      플레이스 홀더
                    </div>
                  </div>
                )}
              </div>

              {/* Hotel Info */}
              <div className="px-4 py-4 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin size={14} />
                  <span>{hotel.location}</span>
                  <ChevronRight size={14} />
                </div>
                <p className="text-orange-500 text-sm mt-1">교정시설로부터 {hotel.distance}</p>
                {hotel.url && (
                  <a
                    href={hotel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-[#FEE500] text-[#3C1E1E] rounded-lg text-sm font-medium hover:bg-[#FDD800] transition-all"
                  >
                    <MapPin size={14} />
                    {primaryActionLabel}
                  </a>
                )}
              </div>

              {/* Tabs */}
              <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                <div className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                        activeTab === tab.key
                          ? 'text-gray-900'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.key && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="px-4 py-5">
                {activeTab === 'intro' && (
                  <div className="space-y-6">
                    {/* 숙소/장소 소개 */}
                    <section>
                      <h2 className="text-base font-bold text-gray-900 mb-3">{introTitle}</h2>

                      {/* Tags */}
                      {tags.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl mb-3">
                          <span className="w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center text-white text-xs">
                            <PlaceholderIcon size={12} />
                          </span>
                          <span className="text-sm text-gray-700">
                            {tags.map(tag => `#${tag}`).join(' ')}
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
                    </section>

                    {/* 시설/서비스 */}
                    <section>
                      <h2 className="text-base font-bold text-gray-900 mb-3">{facilitiesTitle}</h2>
                      <div className="grid grid-cols-2 gap-2">
                        {facilities.map((facility, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-700">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* 서비스 언어 */}
                    <section>
                      <h2 className="text-base font-bold text-gray-900 mb-2">서비스 언어</h2>
                      <p className="text-sm text-gray-700">{hotel.serviceLanguage || '한국어'}</p>
                    </section>

                    {/* 편의시설 소개 */}
                    <section>
                      <h2 className="text-base font-bold text-gray-900 mb-2">{isCafe ? '추가 메모' : '편의시설 소개'}</h2>
                      <div className="space-y-2">
                        {facilityInfo.map((info, index) => (
                          <div
                            key={index}
                            className={`rounded-xl px-3 py-2.5 text-sm ${
                              hotel.facilityInfo.length > 0
                                ? 'bg-gray-50 text-gray-700'
                                : 'border border-dashed border-orange-200 bg-orange-50/70 text-gray-500'
                            }`}
                          >
                            {info}
                          </div>
                        ))}
                      </div>
                    </section>

                    {!isCafe && (
                      <section>
                        <h2 className="text-base font-bold text-gray-900 mb-2">총 객실 수</h2>
                        <p className="text-sm text-gray-700">{hotel.totalRooms}개</p>
                      </section>
                    )}
                  </div>
                )}

                {activeTab === 'facilities' && (
                  <div className="space-y-4">
                    <h2 className="text-base font-bold text-gray-900">{facilitiesTitle}</h2>
                    <div className="space-y-3">
                      {facilities.map((facility, index) => (
                        <div key={index} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                          <Check size={16} className="text-orange-500" />
                          <span className="text-sm text-gray-700">{facility}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'guide' && (
                  <div className="space-y-4">
                    <h2 className="text-base font-bold text-gray-900">{guideTitle}</h2>
                    <div className="space-y-3">
                      {guideCards.map((card) => (
                        <div key={card.title} className="p-3 bg-gray-50 rounded-xl">
                          <h3 className="font-semibold text-gray-800 text-sm mb-1">{card.title}</h3>
                          <p className="text-sm text-gray-600 whitespace-pre-line">{card.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'notice' && (
                  <div className="space-y-4">
                    <h2 className="text-base font-bold text-gray-900">{noticeTitle}</h2>
                    <div className="p-3 bg-orange-50 rounded-xl">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{noticeBody}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer - 예약 문의 */}
            <div className="border-t border-gray-200 px-4 py-3 bg-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">{contactLabel}</p>
                  <p className="text-base font-bold text-gray-900">{hotel.phone || emptyPhoneText}</p>
                </div>
                {hotel.phone ? (
                  <a
                    href={`tel:${hotel.phone.replace(/-/g, '')}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-full font-semibold text-sm hover:bg-orange-600 transition-all"
                  >
                    <Phone size={16} />
                    전화하기
                  </a>
                ) : (
                  <div className="px-5 py-2.5 bg-orange-50 text-orange-400 rounded-full font-semibold text-sm border border-dashed border-orange-200">
                    연락처 업데이트 중
                  </div>
                )}
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
