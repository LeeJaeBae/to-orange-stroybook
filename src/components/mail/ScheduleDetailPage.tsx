import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Copy, Car, Bus, Building2, Coffee, Bed, Navigation, ExternalLink, Check, Calendar, Users, ChevronLeft, Share2, Pencil, Trash2, Briefcase, Scale, Home, Sparkles, Cake, Heart, GraduationCap, Activity, LucideIcon, ChevronRight, ChevronDown, Gift, BookOpen, Loader2, X, AlertTriangle, Train, Footprints, ArrowRight, RefreshCw, MapPinned, CornerDownLeft, CornerDownRight, ArrowUp, RotateCcw, CircleDot, Flag, MoveRight, MoveLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleEvent } from './ScheduleContent';
import HotelDetailPopup, { HotelInfo } from './HotelDetailPage';
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces';
import { NearbyPlace } from '@/lib/kakao-places';
import { usePublicTransit } from '@/hooks/usePublicTransit';
import { useDrivingDirections } from '@/hooks/useDrivingDirections';
import { formatDuration, formatDistance, formatDrivingDuration, TransitSection, DrivingGuide, DrivingSection } from '@/lib/kakao-mobility';
import { apiFetch } from '@/lib/api/fetch';
import { DdayBadge } from './schedule/detail/DdayBadge';
import { PrepChecklist } from './schedule/detail/PrepChecklist';
import { QuickActions, getQuickActions } from './schedule/detail/QuickActions';
import { detailConfigs } from './schedule/detail/detail-config';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { resolveFacilityNavigationInfo } from '@/lib/facility-navigation';

interface ScheduleDetailPageProps {
  event: ScheduleEvent;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onNavigateToTimeCapsule?: () => void;
}

type CopyType = 'phone' | 'address' | 'taxi';

export default function ScheduleDetailPage({ event, onClose, onEdit, onDelete, onNavigateToTimeCapsule }: ScheduleDetailPageProps): React.ReactElement {
  const [transportTab, setTransportTab] = useState<'car' | 'public'>('car');
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [copiedTaxiScript, setCopiedTaxiScript] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<HotelInfo | null>(null);
  const [isPlacePopupOpen, setIsPlacePopupOpen] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // 대중교통 길찾기 관련 상태
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [isGeocodingDestination, setIsGeocodingDestination] = useState<boolean>(false);

  const { routes, trainRoutes, busRoutes, otherRoutes, message: transitMessage, isLoading: isLoadingTransit, error: transitError, getDirections, reset: resetTransit } = usePublicTransit();
  const { summary: drivingSummary, guide: drivingGuide, sections: drivingSections, message: drivingMessage, isLoading: isLoadingDriving, error: drivingError, getDirections: getDrivingDirectionsClient, reset: resetDriving } = useDrivingDirections();
  const [showDrivingGuide, setShowDrivingGuide] = useState<boolean>(true);
  const [transitTypeTab, setTransitTypeTab] = useState<'all' | 'train' | 'bus'>('all');
  const [expandedRouteIndex, setExpandedRouteIndex] = useState<number>(0);

  const resolvedFacility = resolveFacilityNavigationInfo(event.facility, event.facilityAddress);
  const facilityInfo = {
    name: resolvedFacility?.label || event.facility || '시설 정보 없음',
    address: resolvedFacility?.navigationAddress || event.facilityAddress || '주소 정보 없음',
    fallbackAddress: resolvedFacility?.navigationFallbackAddress,
    phone: '', // 시설 전화번호는 별도 데이터 필요
    latitude: resolvedFacility?.latitude,
    longitude: resolvedFacility?.longitude,
  };
  const canSearchDirections = facilityInfo.address !== '주소 정보 없음';
  const destinationLabel = facilityInfo.name !== '시설 정보 없음'
    ? facilityInfo.name
    : facilityInfo.address;

  // 대중교통 정보
  const publicTransportInfo = {
    taxiScript: `${facilityInfo.name} 민원실 정문 앞으로 가주세요`
  };

  // 타임캡슐 일정 유형 (훅 호출 전에 미리 계산)
  const timeCapsuleTypes = ['출소 축하', '출소 예정', '가석방 축하', '생일 축하', '기념일', 'release', 'birthday', 'anniversary'];
  const isTimeCapsuleType = timeCapsuleTypes.includes(event.type) || timeCapsuleTypes.includes(event.title);

  // 주변 편의시설 API 조회
  const {
    hotels: nearbyHotels,
    cafes: nearbyCafes,
    isLoading: isLoadingPlaces,
    error: placesError,
  } = useNearbyPlaces({
    address: facilityInfo.address,
    fallbackAddress: facilityInfo.fallbackAddress,
    facilityName: facilityInfo.name,
    latitude: facilityInfo.latitude,
    longitude: facilityInfo.longitude,
    enabled: !isTimeCapsuleType && facilityInfo.address !== '주소 정보 없음',
  });

  // NearbyPlace를 상세 팝업용 데이터로 변환
  const convertToPlaceInfo = (place: NearbyPlace, type: 'hotel' | 'cafe'): HotelInfo => ({
    id: place.id,
    type,
    name: place.name,
    location: place.roadAddress || place.address,
    distance: place.distance,
    images: place.imageUrl ? [place.imageUrl] : [],
    phone: place.phone,
    tags: place.category.split(' > ').slice(-2).filter(Boolean),
    description: type === 'cafe'
      ? '면회 전후 잠깐 쉬거나 일행을 기다리기 좋은 주변 카페예요.'
      : '교정시설 방문 전후 머무르기 좋은 주변 숙박시설이에요.',
    facilities: type === 'cafe'
      ? ['앉아서 대기 가능', '음료 주문 가능', '짧은 휴식']
      : ['인근 숙박', '휴식 가능', '이동 전후 머무르기 좋음'],
    serviceLanguage: '한국어',
    facilityInfo: [place.roadAddress || place.address],
    totalRooms: 0,
    price: '',
    url: place.url,
  });

  // 일정 유형 아이콘 매핑
  const typeIcons: Record<string, LucideIcon> = {
    'visit': Users,
    'consultation': Briefcase,
    'special_day': Scale,
    '일반접견': Users,
    '공식변호인접견': Briefcase,
    '사건관련일': Scale,
    '출소 예정': Home,
    '출소 축하': Home,
    '가석방 축하': Sparkles,
    '생일 축하': Cake,
    '기념일': Heart,
    '교육': GraduationCap,
    '건강': Activity,
  };

  const typeLabels: Record<string, string> = {
    'visit': '일반접견',
    'consultation': '공식변호인접견',
    'special_day': '사건관련일',
  };

  const handleCopy = (text: string, type: CopyType): void => {
    navigator.clipboard.writeText(text);
    if (type === 'phone') {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else if (type === 'address') {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } else if (type === 'taxi') {
      setCopiedTaxiScript(true);
      setTimeout(() => setCopiedTaxiScript(false), 2000);
    }
  };

  // 사용자 현재 위치 가져오기
  const getUserLocation = useCallback((): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('이 브라우저에서 위치 서비스를 지원하지 않습니다'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('위치 정보를 사용할 수 없습니다'));
              break;
            case error.TIMEOUT:
              reject(new Error('위치 정보 요청 시간이 초과되었습니다'));
              break;
            default:
              reject(new Error('위치를 가져오는 중 오류가 발생했습니다'));
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  // 목적지 주소를 좌표로 변환
  const geocodeDestination = useCallback(async (
    address: string,
    fallbackAddress?: string
  ): Promise<{ latitude: number; longitude: number }> => {
    console.log('[schedule-detail] geocode request', {
      destinationLabel,
      address,
      fallbackAddress,
    });

    const response = await apiFetch('/api/v1/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, fallbackAddress, label: destinationLabel }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[schedule-detail] geocode failed', {
        destinationLabel,
        address,
        fallbackAddress,
        status: response.status,
        error: errorData,
      });
      throw new Error(errorData.error || '주소 변환에 실패했습니다');
    }

    const { data } = await response.json();
    console.log('[schedule-detail] geocode success', {
      destinationLabel,
      address,
      fallbackAddress,
      data,
    });
    return { latitude: data.latitude, longitude: data.longitude };
  }, [destinationLabel]);

  const ensureDestinationCoords = useCallback(async () => {
    if (!canSearchDirections) {
      console.warn('[schedule-detail] missing destination address', {
        destinationLabel,
        facilityInfo,
      });
      throw new Error('주소 정보가 없어 길찾기를 할 수 없습니다');
    }

    if (destinationCoords) {
      console.log('[schedule-detail] reuse cached destination coords', {
        destinationLabel,
        destinationCoords,
      });
      return destinationCoords;
    }

    if (facilityInfo.latitude && facilityInfo.longitude) {
      const coords = {
        latitude: facilityInfo.latitude,
        longitude: facilityInfo.longitude,
      };
      console.log('[schedule-detail] use registered destination coords', {
        destinationLabel,
        coords,
      });
      setDestinationCoords(coords);
      return coords;
    }

    setIsGeocodingDestination(true);
    try {
      console.log('[schedule-detail] resolving destination coords', {
        destinationLabel,
        address: facilityInfo.address,
        fallbackAddress: facilityInfo.fallbackAddress,
      });
      const coords = await geocodeDestination(facilityInfo.address, facilityInfo.fallbackAddress);
      setDestinationCoords(coords);
      return coords;
    } finally {
      setIsGeocodingDestination(false);
    }
  }, [canSearchDirections, destinationCoords, destinationLabel, facilityInfo.address, facilityInfo.fallbackAddress, facilityInfo.latitude, facilityInfo.longitude, geocodeDestination]);

  const openExternalSchemeWithFallback = useCallback((schemeUrl: string, webUrl: string) => {
    const timer = window.setTimeout(() => {
      window.open(webUrl, '_blank', 'noopener,noreferrer');
    }, 1200);

    const clearTimer = () => window.clearTimeout(timer);
    window.addEventListener('pagehide', clearTimer, { once: true });
    window.location.href = schemeUrl;
  }, []);

  const handleOpenKakaoMap = useCallback(async () => {
    setLocationError(null);

    try {
      const coords = await ensureDestinationCoords();
      const url = `https://map.kakao.com/link/to/${encodeURIComponent(destinationLabel)},${coords.latitude},${coords.longitude}`;
      console.log('[schedule-detail] open kakao map', {
        destinationLabel,
        coords,
        url,
      });
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('[schedule-detail] open kakao map failed', {
        destinationLabel,
        address: facilityInfo.address,
        fallbackAddress: facilityInfo.fallbackAddress,
        error,
      });
      setLocationError(error instanceof Error ? error.message : '카카오맵 길찾기를 열 수 없습니다');
    }
  }, [destinationLabel, ensureDestinationCoords, facilityInfo.address, facilityInfo.fallbackAddress]);

  const handleOpenNaverMap = useCallback(async (mode: 'car' | 'public') => {
    setLocationError(null);

    try {
      const coords = await ensureDestinationCoords();
      const params = new URLSearchParams({
        dlat: String(coords.latitude),
        dlng: String(coords.longitude),
        dname: destinationLabel,
        appname: window.location.origin,
      });

      if (userLocation) {
        params.set('slat', String(userLocation.latitude));
        params.set('slng', String(userLocation.longitude));
        params.set('sname', '현재 위치');
      }

      const schemeUrl = `nmap://route/${mode === 'car' ? 'car' : 'public'}?${params.toString()}`;
      const webUrl = `https://map.naver.com/v5/search/${encodeURIComponent(`${destinationLabel} ${facilityInfo.address}`)}`;
      console.log('[schedule-detail] open naver map', {
        mode,
        destinationLabel,
        coords,
        userLocation,
        schemeUrl,
        webUrl,
      });
      openExternalSchemeWithFallback(schemeUrl, webUrl);
    } catch (error) {
      console.error('[schedule-detail] open naver map failed', {
        mode,
        destinationLabel,
        address: facilityInfo.address,
        fallbackAddress: facilityInfo.fallbackAddress,
        error,
      });
      setLocationError(error instanceof Error ? error.message : '네이버지도 길찾기를 열 수 없습니다');
    }
  }, [destinationLabel, ensureDestinationCoords, facilityInfo.address, facilityInfo.fallbackAddress, openExternalSchemeWithFallback, userLocation]);

  // 대중교통 길찾기 실행
  const handleSearchTransit = useCallback(async () => {
    setLocationError(null);
    resetTransit();

    try {
      console.log('[schedule-detail] transit search start', {
        destinationLabel,
        address: facilityInfo.address,
        fallbackAddress: facilityInfo.fallbackAddress,
      });
      // 1. 사용자 위치 가져오기
      setIsGettingLocation(true);
      const location = await getUserLocation();
      setUserLocation(location);
      setIsGettingLocation(false);

      // 2. 목적지 좌표 가져오기 (캐시 확인)
      const destCoords = await ensureDestinationCoords();

      // 3. 경로 검색
      console.log('[schedule-detail] transit search request', {
        origin: location,
        destination: destCoords,
      });
      getDirections(location, destCoords);
    } catch (error) {
      setIsGettingLocation(false);
      console.error('[schedule-detail] transit search failed', {
        destinationLabel,
        address: facilityInfo.address,
        fallbackAddress: facilityInfo.fallbackAddress,
        error,
      });
      setLocationError(error instanceof Error ? error.message : '길찾기에 실패했습니다');
    }
  }, [destinationLabel, ensureDestinationCoords, facilityInfo.address, facilityInfo.fallbackAddress, getDirections, getUserLocation, resetTransit]);

  // 자동차 경로 검색 실행
  const handleSearchDriving = useCallback(async () => {
    setLocationError(null);
    resetDriving();

    try {
      console.log('[schedule-detail] driving search start', {
        destinationLabel,
        address: facilityInfo.address,
        fallbackAddress: facilityInfo.fallbackAddress,
      });
      // 1. 사용자 위치 가져오기
      setIsGettingLocation(true);
      const location = userLocation || await getUserLocation();
      if (!userLocation) setUserLocation(location);
      setIsGettingLocation(false);

      // 2. 목적지 좌표 가져오기
      const destCoords = await ensureDestinationCoords();

      // 3. 경로 검색
      console.log('[schedule-detail] driving search request', {
        origin: location,
        destination: destCoords,
      });
      getDrivingDirectionsClient(location, destCoords);
    } catch (error) {
      setIsGettingLocation(false);
      console.error('[schedule-detail] driving search failed', {
        destinationLabel,
        address: facilityInfo.address,
        fallbackAddress: facilityInfo.fallbackAddress,
        error,
      });
      setLocationError(error instanceof Error ? error.message : '길찾기에 실패했습니다');
    }
  }, [destinationLabel, ensureDestinationCoords, facilityInfo.address, facilityInfo.fallbackAddress, getDrivingDirectionsClient, getUserLocation, resetDriving, userLocation]);

  // 대중교통 구간 렌더링 컴포넌트
  const renderTransitSection = (section: TransitSection, index: number) => {
    const getSectionIcon = () => {
      switch (section.type) {
        case 'WALK':
          return <Footprints size={16} className="text-gray-500" />;
        case 'SUBWAY':
          return <Train size={16} className="text-green-600" />;
        case 'BUS':
          return <Bus size={16} className="text-blue-500" />;
        case 'TRAIN':
          return <Train size={16} className="text-indigo-600" />;
        case 'EXPRESS_BUS':
          return <Bus size={16} className="text-red-500" />;
        default:
          return <ArrowRight size={16} className="text-gray-400" />;
      }
    };

    const getSectionColor = () => {
      if (section.route?.color) {
        return section.route.color;
      }
      switch (section.type) {
        case 'SUBWAY':
          return '#00A84D';
        case 'BUS':
          return '#33A8FF';
        case 'TRAIN':
          return '#003399';
        case 'EXPRESS_BUS':
          return '#E60012';
        default:
          return '#9CA3AF';
      }
    };

    return (
      <div key={index} className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${getSectionColor()}20` }}
        >
          {getSectionIcon()}
        </div>
        <div className="flex-1 min-w-0">
          {section.type === 'WALK' ? (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700">도보 이동</p>
              <p className="text-xs text-gray-500">
                {formatDistance(section.distance)} · {formatDuration(section.duration)}
              </p>
              {section.steps && section.steps.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">{section.steps[0].instruction}</p>
              )}
            </div>
          ) : (
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: `${getSectionColor()}10`, borderLeft: `3px solid ${getSectionColor()}` }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold text-white"
                  style={{ backgroundColor: getSectionColor() }}
                >
                  {section.route?.name || (section.type === 'SUBWAY' ? '지하철' : '버스')}
                </span>
                {section.route?.passStops ? (
                  <span className="text-xs text-gray-500">{section.route.passStops}개 정류장</span>
                ) : null}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-gray-700">{section.route?.departure.name || '출발'}</span>
                <ArrowRight size={14} className="text-gray-400" />
                <span className="text-gray-700">{section.route?.arrival.name || '도착'}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistance(section.distance)} · {formatDuration(section.duration)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TypeIcon = typeIcons[event.type] || Users;
  const typeLabel = typeLabels[event.type] || event.title;
  const detailConfig = detailConfigs[event.type] || detailConfigs.custom || {};

  // familyMemberId로 수신자 이름 fallback 조회
  const { familyMembers = [] } = useFamilyMembers();
  const linkedMember = event.familyMemberId ? familyMembers.find((m: any) => m.id === event.familyMemberId) : null;
  const recipientName = event.personName || linkedMember?.name || '';
  const recipientFacility = event.facility || linkedMember?.facility || '';
  const recipientRelation = linkedMember?.relation || '';

  const quickActions = detailConfig.showQuickActions ? getQuickActions(event.type, event.familyMemberId) : [];

  // 받는 사람 정보 (타임캡슐용)
  const recipientInfo = {
    name: recipientName,
    facility: recipientFacility,
    relation: recipientRelation,
  };

  // 날짜 포맷
  const eventDate = new Date(event.date);
  const formattedDate = `${eventDate.getFullYear()}년 ${eventDate.getMonth() + 1}월 ${eventDate.getDate()}일`;

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="hidden md:flex h-14 border-b border-border/40 bg-white/80 backdrop-blur-sm items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-all"
            >
              <ChevronLeft className="text-gray-500" size={24} />
            </button>
            <h1 className="text-lg font-semibold text-foreground">일정 상세</h1>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <Share2 className="text-gray-500" size={20} />
            </button>
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <Pencil className="text-gray-500" size={20} />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <Trash2 className="text-gray-500" size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto px-4 py-6 md:py-10 lg:px-6">
          <div className="max-w-4xl mx-auto space-y-6">
          {/* 날짜 및 시간 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="text-orange-500" size={18} />
                <h2 className="font-semibold text-gray-800 text-sm">날짜 및 시간</h2>
              </div>
              {/* 수정/삭제 버튼 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-all"
                >
                  <Pencil size={14} />
                  수정
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-all"
                >
                  <Trash2 size={14} />
                  삭제
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-full text-orange-600 text-sm font-medium">
                {formattedDate}
              </span>
              {event.time && (
                <span className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-gray-700 text-sm font-medium">
                  {event.time}
                </span>
              )}
              <DdayBadge date={event.date} type={event.type} />
            </div>
          </section>

          {/* 일정유형 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Users className="text-orange-500" size={18} />
              <h2 className="font-semibold text-gray-800 text-sm">일정유형</h2>
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-medium">
              <TypeIcon size={14} />
              {typeLabel}
            </span>

            {/* 안내 메시지 - Tip */}
            <div className="rounded-2xl p-4 bg-orange-50 mt-4">
              {typeLabel === '출소 축하' || typeLabel === '출소 예정' ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <Home className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-800 text-sm">출소 일정을 선택한 경우</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    출소는 끝이 아니라, <span className="font-bold text-gray-800">새로운 시작의 날</span>입니다.
                  </p>
                  <p className="text-gray-600 text-sm mb-4">그날을 위해 타임캡슐과 함께 준비해보세요.</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <Gift size={16} className="text-orange-400" />
                      출소복 선물하기
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <BookOpen size={16} className="text-green-500" />
                      도서 선물하기
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm">
                    출소 이후의 생활을 바로 시작할 수 있도록,<br />
                    실질적으로 도움이 되는 선물을 담을 수 있어요.
                  </p>
                </>
              ) : typeLabel === '일반접견' ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <Users className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-800 text-sm">일반접견을 선택한 경우</span>
                  </div>
                  <ol className="text-sm text-gray-600 space-y-1 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500">1.</span>
                      <span>신분증 + 가족관계증명서 필수 <span className="text-gray-400">- 휴대폰, 가방 반입 불가</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500">2.</span>
                      당일 상황에 따라 면회가 취소될 수 있어요
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500">3.</span>
                      <span>접견 30-40분 전 도착 권장</span>
                    </li>
                  </ol>
                  <div className="border-t border-orange-200 pt-3">
                    <p className="text-orange-600 font-bold text-sm mb-1">필독! 일정 등록 후 상세화면에서 확인하세요!</p>
                    <p className="text-gray-500 text-sm">찾아가는 법, 준비물 체크리스트, 주변 숙박 및 대기장소 정보를 추천해드립니다.</p>
                  </div>
                </>
              ) : typeLabel === '공식변호인접견' ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <Briefcase className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-800 text-sm">공식변호인접견을 선택한 경우</span>
                  </div>
                  <ol className="text-sm text-gray-600 space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500">1.</span>
                      <div>
                        <p>접견 시간 30~40분 전 도착을 권장합니다.</p>
                        <p className="text-gray-400">특히 처음 방문하는 경우 길 찾는 데 시간이 걸릴 수 있어요.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500">2.</span>
                      선임된 변호인이 사건 진행을 위해 공식적으로 접견하는 방식이에요.
                    </li>
                  </ol>
                  <div className="bg-orange-100 rounded-xl p-3">
                    <p className="text-orange-700 font-semibold text-sm mb-1">변호사 선임 전이라면?</p>
                    <p className="text-gray-600 text-sm">선임 전 변호사 방문은 &quot;일반접견&quot;으로 진행돼요.</p>
                  </div>
                </>
              ) : typeLabel === '사건관련일' ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    아직 재판이 시작되지 않았어도 괜찮아요. 조사, 출석, 재판 등 사건과 관련된 중요한 날짜라면 이곳에 모두 등록할 수 있어요.
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <Scale className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-800 text-sm">사건관련일을 선택한 경우</span>
                  </div>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500">1.</span>
                      일정은 변경될 수 있으니 사전에 확인하세요
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500">2.</span>
                      장소 위치와 주차 정보를 미리 확인해두세요
                    </li>
                  </ol>
                </>
              ) : typeLabel === '가석방 축하' ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <Sparkles className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-800 text-sm">가석방 축하 일정을 선택한 경우</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    가석방은 <span className="font-bold text-gray-800">새로운 희망의 시작</span>입니다.
                  </p>
                  <p className="text-gray-600 text-sm mb-4">소중한 그날을 타임캡슐에 기록하고, 함께 축하해보세요.</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <Gift size={16} className="text-orange-400" />
                      축하 선물하기
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <Heart size={16} className="text-pink-500" />
                      타임캡슐 편지 쓰기
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm">
                    가석방 후 새 출발을 응원하는 마음을 담아<br />
                    미리 준비한 선물과 편지를 전해보세요.
                  </p>
                </>
              ) : typeLabel === '생일 축하' ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <Cake className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-800 text-sm">생일 축하 일정을 선택한 경우</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    멀리 있어도 마음은 가까이, <span className="font-bold text-gray-800">특별한 생일</span>을 만들어주세요.
                  </p>
                  <p className="text-gray-600 text-sm mb-4">타임캡슐에 생일 축하 편지를 미리 담아두면 그날 전달됩니다.</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <Cake size={16} className="text-pink-400" />
                      생일 카드 보내기
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <Gift size={16} className="text-orange-400" />
                      생일 선물하기
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm">
                    생일 당일에 도착할 수 있도록<br />
                    미리 편지와 선물을 준비해보세요.
                  </p>
                </>
              ) : typeLabel === '기념일' ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <Heart className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-800 text-sm">기념일을 선택한 경우</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    결혼기념일, 만난 날, 특별한 날... <span className="font-bold text-gray-800">함께한 시간</span>을 기억해주세요.
                  </p>
                  <p className="text-gray-600 text-sm mb-4">기념일에 맞춰 타임캡슐 편지를 전달해보세요.</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <Heart size={16} className="text-pink-500" />
                      기념일 편지 쓰기
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C9C1B9] rounded-full text-sm text-gray-600 hover:bg-gray-50">
                      <Gift size={16} className="text-orange-400" />
                      기념일 선물하기
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm">
                    떨어져 있어도 기념일의 의미를 잊지 않도록<br />
                    미리 마음을 담은 편지를 준비해보세요.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-sm">Tip</span>
                    <span className="font-semibold text-gray-800 text-sm">일정 안내</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    등록된 일정의 상세 정보를 확인하고 필요한 준비를 해보세요.
                  </p>
                </>
              )}
            </div>
          </section>

          {/* 수신자 정보 카드 (카테고리 설정에 따라) */}
          {!isTimeCapsuleType && detailConfig.showRecipientInfo && (recipientName || event.familyMemberId) && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Users className="text-orange-500" size={18} />
                <h2 className="font-semibold text-gray-800 text-sm">받는 사람</h2>
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium">
                  {recipientName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium text-sm">
                    {recipientName}
                    {recipientRelation && <span className="text-gray-500 font-normal ml-1">({recipientRelation})</span>}
                  </p>
                  {recipientFacility && (
                    <p className="text-orange-500 text-xs">{recipientFacility}</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* 준비물 체크리스트 */}
          {detailConfig.prepItems && detailConfig.prepItems.length > 0 && (
            <section>
              <PrepChecklist title="준비물 체크리스트" items={detailConfig.prepItems} />
            </section>
          )}

          {/* 빠른 액션 */}
          {quickActions.length > 0 && (
            <section>
              <QuickActions actions={quickActions} />
            </section>
          )}

          {/* 메모 강조 */}
          {detailConfig.emphasisMemo && event.description && (
            <section>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-amber-800 mb-2">메모</h3>
                <p className="text-sm text-amber-900 whitespace-pre-wrap">{event.description}</p>
              </div>
            </section>
          )}

          {/* 타임캡슐 일정 - 받는 사람 */}
          {isTimeCapsuleType && (
            <>
              <div className="border-t border-gray-300"></div>
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="text-orange-500" size={18} />
                  <h2 className="font-semibold text-gray-800 text-sm">받는 사람</h2>
                </div>
                <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium">
                    {recipientInfo.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium text-sm">{recipientInfo.name} <span className="text-gray-500 font-normal">({recipientInfo.relation})</span></p>
                    <p className="text-orange-500 text-xs">{recipientInfo.facility}</p>
                  </div>
                </div>
              </section>

              {/* 타임캡슐로 이동 버튼 */}
              <button
                onClick={onNavigateToTimeCapsule}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-all"
              >
                <Sparkles size={18} />
                타임캡슐로 이동
              </button>
            </>
          )}

          {/* 구분선 - 위치 섹션용 (타임캡슐 아닐 때만) */}
          {!isTimeCapsuleType && detailConfig.showDirections && <div className="border-t border-gray-300"></div>}

          {/* 위치 섹션 - 타임캡슐이 아니고 길찾기 설정이 있을 때만 표시 */}
          {!isTimeCapsuleType && detailConfig.showDirections && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-orange-500" size={18} />
              <h2 className="font-semibold text-gray-800 text-sm">위치</h2>
            </div>

            {/* 찾아가는 법 */}
            <p className="text-gray-500 text-sm mb-4">찾아가는 법</p>

            {/* 위치 정보 카드 */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <Building2 size={32} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base mb-1">{facilityInfo.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-gray-600 text-sm truncate">{facilityInfo.address}</p>
                    <button
                      onClick={() => handleCopy(facilityInfo.address, 'address')}
                      className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-all"
                    >
                      {copiedAddress ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                    </button>
                  </div>
                  {facilityInfo.phone && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <a href={`tel:${facilityInfo.phone}`} className="text-orange-500 text-sm font-medium">{facilityInfo.phone}</a>
                      <button
                        onClick={() => handleCopy(facilityInfo.phone, 'phone')}
                        className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-all"
                      >
                        {copiedPhone ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                      </button>
                    </div>
                  )}
                  <p className="text-gray-400 text-xs mt-1">주차 가능 여부는 시설마다 달라요. 방문 전 전화로 미리 확인하세요.</p>
                </div>
              </div>
            </div>

            {/* 교통수단 탭 */}
            <div className="flex bg-gray-100 rounded-full p-1 mb-4">
              <button
                onClick={() => setTransportTab('car')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all ${
                  transportTab === 'car' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Car size={16} />
                자가용 이용자
              </button>
              <button
                onClick={() => setTransportTab('public')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all ${
                  transportTab === 'public' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Bus size={16} />
                대중교통 이용자
              </button>
            </div>

            {/* 자가용 탭 컨텐츠 */}
            {transportTab === 'car' && (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation size={16} className="text-orange-500" />
                    <span className="font-semibold text-gray-800 text-sm">근처까지 내비게이션 안내</span>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 mb-4">
                    <p className="text-orange-700 text-sm">
                      교정시설은 지도 앱에 정확히 표시되지 않는 경우가 많아요. 주소 또는 정류장 기준 안내를 따라주세요.
                    </p>
                  </div>

                  {/* 네비게이션 앱 버튼들 */}
                  <div className="space-y-2">
                    <p className="text-gray-500 text-xs mb-2">원하시는 지도 앱을 선택하세요</p>
                    <div className="flex flex-wrap gap-2">
                      {/* 카카오맵 */}
                      <button
                        onClick={handleOpenKakaoMap}
                        disabled={!canSearchDirections}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#FEE500] text-[#3C1E1E] rounded-xl text-sm font-medium hover:bg-[#FDD800] transition-all"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.82 5.27 4.58 6.72l-.96 3.57c-.08.3.26.54.52.37l4.3-2.88c.52.05 1.04.08 1.56.08 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                        </svg>
                        카카오맵
                        <ExternalLink size={12} />
                      </button>

                      {/* 네이버지도 */}
                      <button
                        onClick={() => handleOpenNaverMap('car')}
                        disabled={!canSearchDirections}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#03C75A] text-white rounded-xl text-sm font-medium hover:bg-[#02b351] transition-all"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.273 12.845L7.376 3H4v18h3.727V9.155L16.624 19H20V3h-3.727v9.845z"/>
                        </svg>
                        네이버지도
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🚶</span>
                    <span className="font-semibold text-gray-800 text-sm">도착 후 확인사항</span>
                  </div>
                  <p className="text-gray-500 text-xs mb-3">길찾기 결과와 실제 출입 동선이 다를 수 있어요</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <ol className="text-sm text-gray-600 space-y-2">
                      <li className="flex gap-2"><span className="text-orange-500 font-medium">1.</span>정문, 민원실, 접견동 표지판을 먼저 확인하세요.</li>
                      <li className="flex gap-2"><span className="text-orange-500 font-medium">2.</span>시설 보안상 지도 앱 경로와 실제 출입구가 다를 수 있어요.</li>
                      <li className="flex gap-2"><span className="text-orange-500 font-medium">3.</span>도착 후에는 안내실 또는 경비실 안내를 따르는 편이 가장 정확해요.</li>
                      <li className="flex gap-2"><span className="text-orange-500 font-medium">4.</span>방문 전 운영 시간과 출입 절차를 한 번 더 확인하세요.</li>
                    </ol>
                  </div>
                </div>

                {/* 내 위치에서 자동차 경로 검색 */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Car size={16} className="text-orange-500" />
                      <span className="font-semibold text-gray-800 text-sm">내 위치에서 자동차 경로 검색</span>
                    </div>
                    {drivingSummary && (
                      <button
                        onClick={handleSearchDriving}
                        className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600"
                      >
                        <RefreshCw size={12} />
                        다시 검색
                      </button>
                    )}
                  </div>

                  {/* 검색 버튼 */}
                  {!drivingSummary && !isLoadingDriving && !isGettingLocation && !isGeocodingDestination && !drivingError && !locationError && (
                    <button
                      onClick={handleSearchDriving}
                      disabled={facilityInfo.address === '주소 정보 없음'}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Car size={18} />
                      현재 위치에서 자동차 경로 검색
                    </button>
                  )}

                  {/* 로딩 상태 */}
                  {(isGettingLocation || isGeocodingDestination || isLoadingDriving) && (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Loader2 className="animate-spin text-orange-500 mb-2" size={24} />
                      <p className="text-gray-500 text-sm">
                        {isGettingLocation && '현재 위치를 확인하고 있어요...'}
                        {isGeocodingDestination && '목적지 위치를 확인하고 있어요...'}
                        {isLoadingDriving && '자동차 경로를 검색하고 있어요...'}
                      </p>
                    </div>
                  )}

                  {/* 에러 */}
                  {(locationError || drivingError) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">
                        {locationError || drivingError?.message || '경로 검색에 실패했습니다'}
                      </p>
                      <button
                        onClick={handleSearchDriving}
                        className="mt-2 text-sm text-red-500 underline hover:text-red-600"
                      >
                        다시 시도
                      </button>
                    </div>
                  )}

                  {/* 자동차 경로 결과 */}
                  {drivingSummary && (
                    <div className="space-y-3">
                      {drivingMessage && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                          <p className="text-yellow-700 text-xs">{drivingMessage}</p>
                        </div>
                      )}
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Car size={18} className="text-orange-600" />
                          <span className="text-xl font-bold text-orange-600">
                            {formatDrivingDuration(drivingSummary.duration)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({formatDistance(drivingSummary.distance)})
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white rounded-lg p-3 text-center">
                            <p className="text-size-10 text-gray-400 mb-1">톨게이트</p>
                            <p className="text-sm font-bold text-gray-800">
                              {drivingSummary.tollFare > 0 ? `${drivingSummary.tollFare.toLocaleString()}원` : '없음'}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <p className="text-size-10 text-gray-400 mb-1">택시 요금</p>
                            <p className="text-sm font-bold text-gray-800">
                              {drivingSummary.taxiFare > 0 ? `${drivingSummary.taxiFare.toLocaleString()}원` : '-'}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <p className="text-size-10 text-gray-400 mb-1">유류비</p>
                            <p className="text-sm font-bold text-gray-800">
                              {drivingSummary.fuelPrice > 0 ? `${drivingSummary.fuelPrice.toLocaleString()}원` : '-'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 구간별 경로 안내 */}
                      {drivingGuide.length > 0 && (
                        <div className="mt-3">
                          <button
                            onClick={() => setShowDrivingGuide(!showDrivingGuide)}
                            className="w-full flex items-center justify-between py-2 text-sm text-gray-600 hover:text-gray-800"
                          >
                            <span className="font-medium">구간별 경로 안내 ({drivingGuide.length}개 구간)</span>
                            <motion.div
                              animate={{ rotate: showDrivingGuide ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown size={16} className="text-gray-400" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {showDrivingGuide && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden"
                              >
                                {/* 주요 도로 구간 */}
                                {drivingSections.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-xs font-medium text-gray-500 mb-2">주요 도로</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {drivingSections.filter(s => s.name).map((section, i) => {
                                        const congestionColors: Record<number, string> = {
                                          0: '#9CA3AF', // 정보없음
                                          1: '#22C55E', // 원활
                                          2: '#F59E0B', // 서행
                                          3: '#EF4444', // 정체
                                        };
                                        const congestionLabels: Record<number, string> = {
                                          0: '',
                                          1: '원활',
                                          2: '서행',
                                          3: '정체',
                                        };
                                        return (
                                          <span
                                            key={i}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-size-11 bg-gray-50 border border-gray-200"
                                          >
                                            <span
                                              className="w-1.5 h-1.5 rounded-full"
                                              style={{ backgroundColor: congestionColors[section.congestion] || '#9CA3AF' }}
                                            />
                                            <span className="text-gray-700 font-medium">{section.name}</span>
                                            <span className="text-gray-400">{formatDistance(section.distance)}</span>
                                            {congestionLabels[section.congestion] && (
                                              <span style={{ color: congestionColors[section.congestion] }} className="font-medium">
                                                {congestionLabels[section.congestion]}
                                              </span>
                                            )}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* 턴바이턴 안내 */}
                                <div className="space-y-0">
                                  {drivingGuide.map((g, i) => {
                                    // 분기점 코드별 아이콘
                                    const getGuideIcon = (type: number) => {
                                      switch (type) {
                                        case 1: return <ArrowUp size={14} className="text-gray-500" />;
                                        case 2: return <CornerDownLeft size={14} className="text-blue-500" />;
                                        case 3: return <CornerDownRight size={14} className="text-blue-500" />;
                                        case 4: return <MoveLeft size={14} className="text-gray-500" />;
                                        case 5: return <MoveRight size={14} className="text-gray-500" />;
                                        case 6: return <RotateCcw size={14} className="text-orange-500" />;
                                        case 50: return <ArrowRight size={14} className="text-green-600" />;
                                        case 51: return <ArrowRight size={14} className="text-red-500" />;
                                        case 87: return <CircleDot size={14} className="text-orange-500" />;
                                        case 88: return <Flag size={14} className="text-red-500" />;
                                        default: return <ArrowRight size={14} className="text-gray-400" />;
                                      }
                                    };

                                    const isDestination = g.type === 88;
                                    const isHighway = g.type === 50 || g.type === 51;

                                    return (
                                      <div key={i} className="flex items-start gap-3 relative">
                                        {/* 타임라인 연결선 */}
                                        {i < drivingGuide.length - 1 && (
                                          <div className="absolute left-[13px] top-7 bottom-0 w-px bg-gray-200" />
                                        )}
                                        {/* 아이콘 */}
                                        <div
                                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                                            isDestination ? 'bg-red-100' :
                                            isHighway ? 'bg-green-50' :
                                            'bg-gray-100'
                                          }`}
                                        >
                                          {getGuideIcon(g.type)}
                                        </div>
                                        {/* 내용 */}
                                        <div className={`flex-1 min-w-0 pb-3 ${isDestination ? 'pb-0' : ''}`}>
                                          <p className={`text-sm ${isDestination ? 'font-bold text-red-600' : 'text-gray-700'}`}>
                                            {g.instructions}
                                          </p>
                                          {(g.distance > 0 || g.duration > 0) && !isDestination && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                              {g.distance > 0 && formatDistance(g.distance)}
                                              {g.distance > 0 && g.duration > 0 && ' · '}
                                              {g.duration > 0 && formatDrivingDuration(g.duration)}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 대중교통 탭 컨텐츠 */}
            {transportTab === 'public' && (
              <div className="space-y-4">
                {/* 내 위치에서 대중교통 경로 찾기 */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPinned size={16} className="text-orange-500" />
                      <span className="font-semibold text-gray-800 text-sm">내 위치에서 경로 찾기</span>
                    </div>
                    {routes.length > 0 && (
                      <button
                        onClick={handleSearchTransit}
                        className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600"
                      >
                        <RefreshCw size={12} />
                        다시 검색
                      </button>
                    )}
                  </div>

                  {/* 경로 검색 버튼 */}
                  {routes.length === 0 && !isLoadingTransit && !isGettingLocation && !isGeocodingDestination && !transitError && !locationError && (
                    <button
                      onClick={handleSearchTransit}
                      disabled={facilityInfo.address === '주소 정보 없음'}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Navigation size={18} />
                      현재 위치에서 경로 검색
                    </button>
                  )}

                  {/* 로딩 상태 */}
                  {(isGettingLocation || isGeocodingDestination || isLoadingTransit) && (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Loader2 className="animate-spin text-orange-500 mb-2" size={24} />
                      <p className="text-gray-500 text-sm">
                        {isGettingLocation && '현재 위치를 확인하고 있어요...'}
                        {isGeocodingDestination && '목적지 위치를 확인하고 있어요...'}
                        {isLoadingTransit && '경로를 검색하고 있어요...'}
                      </p>
                    </div>
                  )}

                  {/* 에러 메시지 */}
                  {(locationError || transitError) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-600 text-sm">
                        {locationError || transitError?.message || '경로 검색에 실패했습니다'}
                      </p>
                      <button
                        onClick={handleSearchTransit}
                        className="mt-2 text-sm text-red-500 underline hover:text-red-600"
                      >
                        다시 시도
                      </button>
                    </div>
                  )}

                  {/* 경로 결과 */}
                  {routes.length > 0 && (
                    <div className="space-y-4">
                      {/* 안내 메시지 */}
                      {transitMessage && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                          <p className="text-yellow-700 text-xs">{transitMessage}</p>
                        </div>
                      )}

                      {/* 교통수단 분류 탭 (기차/고속버스 경로가 있을 때만) */}
                      {(trainRoutes.length > 0 || busRoutes.length > 0) && (
                        <div className="flex bg-gray-100 rounded-full p-1">
                          <button
                            onClick={() => { setTransitTypeTab('all'); setExpandedRouteIndex(0); }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium transition-all ${
                              transitTypeTab === 'all' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            전체
                          </button>
                          {trainRoutes.length > 0 && (
                            <button
                              onClick={() => { setTransitTypeTab('train'); setExpandedRouteIndex(0); }}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium transition-all ${
                                transitTypeTab === 'train' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              <Train size={14} />
                              기차 ({trainRoutes.length})
                            </button>
                          )}
                          {busRoutes.length > 0 && (
                            <button
                              onClick={() => { setTransitTypeTab('bus'); setExpandedRouteIndex(0); }}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium transition-all ${
                                transitTypeTab === 'bus' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              <Bus size={14} />
                              고속버스 ({busRoutes.length})
                            </button>
                          )}
                        </div>
                      )}

                      {/* 선택된 탭에 따른 경로 표시 */}
                      {(() => {
                        const displayRoutes = transitTypeTab === 'train' ? trainRoutes
                          : transitTypeTab === 'bus' ? busRoutes
                          : routes;

                        if (displayRoutes.length === 0) {
                          return (
                            <div className="text-center py-6 text-gray-400 text-sm">
                              해당 교통수단의 경로가 없습니다
                            </div>
                          );
                        }

                        // 소요시간 기준 정렬
                        const sortedRoutes = [...displayRoutes].sort((a, b) => a.totalDuration - b.totalDuration);

                        return (
                        <div className="space-y-3">
                          {sortedRoutes.map((route, routeIndex) => {
                            const isExpanded = expandedRouteIndex === routeIndex;
                            // 경로의 주요 교통수단 파악
                            const mainTransport = route.sections.find(s => s.type !== 'WALK');
                            const transportLabel = mainTransport?.route?.name ||
                              (mainTransport?.type === 'SUBWAY' ? '지하철' :
                               mainTransport?.type === 'BUS' ? '버스' :
                               mainTransport?.type === 'TRAIN' ? '열차' :
                               mainTransport?.type === 'EXPRESS_BUS' ? '고속버스' : '');
                            const transportColor = mainTransport?.route?.color || '#666';

                            // 경로 요약 태그들 (도보 제외한 교통수단)
                            const transitSections = route.sections.filter(s => s.type !== 'WALK');

                            return (
                            <div key={routeIndex} className="border border-gray-200 rounded-xl overflow-hidden">
                              {/* 경로 요약 헤더 (클릭으로 토글) */}
                              <button
                                onClick={() => setExpandedRouteIndex(isExpanded ? -1 : routeIndex)}
                                className="w-full text-left"
                              >
                                <div className={`p-4 transition-colors ${isExpanded ? 'bg-gradient-to-r from-orange-50 to-orange-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {routeIndex === 0 && (
                                        <span className="px-1.5 py-0.5 bg-orange-500 text-white text-size-10 font-bold rounded">최적</span>
                                      )}
                                      <span className={`text-xl font-bold ${isExpanded ? 'text-orange-600' : 'text-gray-800'}`}>
                                        {formatDuration(route.totalDuration)}
                                      </span>
                                      {/* 교통수단 태그들 */}
                                      <div className="flex items-center gap-1">
                                        {transitSections.map((s, i) => (
                                          <span
                                            key={i}
                                            className="px-1.5 py-0.5 rounded text-size-10 font-bold text-white"
                                            style={{ backgroundColor: s.route?.color || transportColor }}
                                          >
                                            {s.route?.name || s.type}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">
                                        {formatDistance(route.totalDistance)}
                                      </span>
                                      <motion.div
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <ChevronDown size={16} className="text-gray-400" />
                                      </motion.div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Footprints size={12} />
                                      도보 {formatDuration(route.totalWalkDuration)}
                                    </span>
                                    {route.transferCount > 0 && (
                                      <span className="flex items-center gap-1">
                                        <ArrowRight size={12} />
                                        환승 {route.transferCount}회
                                      </span>
                                    )}
                                    {route.fare > 0 && (
                                      <span>💰 {route.fare.toLocaleString()}원</span>
                                    )}
                                  </div>
                                </div>
                              </button>

                              {/* 상세 경로 (아코디언) */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-4 space-y-3 border-t border-gray-100">
                                      {route.sections.map((section, sectionIndex) => renderTransitSection(section, sectionIndex))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            );
                          })}
                        </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* 대중교통 길찾기 (외부 앱) */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bus size={16} className="text-orange-500" />
                    <span className="font-semibold text-gray-800 text-sm">외부 지도 앱으로 검색</span>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 mb-4">
                    <p className="text-orange-700 text-sm">
                      교정시설은 대중교통으로 접근이 어려운 경우가 많아요. 가까운 역/정류장까지 이동 후 택시 이용을 권장드려요.
                    </p>
                  </div>

                  {/* 길찾기 앱 버튼들 */}
                  <div className="space-y-2">
                    <p className="text-gray-500 text-xs mb-2">대중교통 경로 검색</p>
                    <div className="flex flex-wrap gap-2">
                      {/* 카카오맵 대중교통 */}
                      <button
                        onClick={handleOpenKakaoMap}
                        disabled={!canSearchDirections}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#FEE500] text-[#3C1E1E] rounded-xl text-sm font-medium hover:bg-[#FDD800] transition-all"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.82 5.27 4.58 6.72l-.96 3.57c-.08.3.26.54.52.37l4.3-2.88c.52.05 1.04.08 1.56.08 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                        </svg>
                        카카오맵
                        <ExternalLink size={12} />
                      </button>

                      {/* 네이버지도 대중교통 */}
                      <button
                        onClick={() => handleOpenNaverMap('public')}
                        disabled={!canSearchDirections}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#03C75A] text-white rounded-xl text-sm font-medium hover:bg-[#02b351] transition-all"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.273 12.845L7.376 3H4v18h3.727V9.155L16.624 19H20V3h-3.727v9.845z"/>
                        </svg>
                        네이버지도
                        <ExternalLink size={12} />
                      </button>

                      {/* 카카오맵 지하철 노선도 */}
                      <a
                        href="https://map.kakao.com/link/subway"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="4" y="3" width="16" height="18" rx="2"/>
                          <line x1="4" y1="9" x2="20" y2="9"/>
                          <line x1="4" y1="15" x2="20" y2="15"/>
                          <circle cx="8" cy="18" r="1" fill="currentColor"/>
                          <circle cx="16" cy="18" r="1" fill="currentColor"/>
                        </svg>
                        지하철 노선도
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 버스 정류장 안내 */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🚌</span>
                    <span className="font-semibold text-gray-800 text-sm">버스 이용 안내</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-gray-700 text-sm font-medium mb-1">{facilityInfo.name} 인근 정류장</p>
                    <p className="text-gray-500 text-xs mb-2">
                      버스 노선에 따라 정류장 이름이 다를 수 있어요
                    </p>
                    <p className="text-gray-600 text-sm">
                      하차 후 <span className="font-medium text-orange-600">택시 이용을 권장</span>드려요.<br />
                      도보 이동은 길이 복잡하고 시간이 오래 걸릴 수 있어요.
                    </p>
                  </div>
                  <p className="text-gray-400 text-xs">정류장 이름이 달라도 괜찮아요. 택시 기사님이 알아요.</p>
                </div>

                {/* 택시 예약 */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🚕</span>
                    <span className="font-semibold text-gray-800 text-sm">택시 미리 예약하세요</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">면회 시간대에는 택시 잡기가 어려울 수 있어요.</p>
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <p className="text-gray-500 text-xs mb-2">택시 기사님께 이렇게 말씀하세요</p>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-700 text-sm font-medium">&quot;{publicTransportInfo.taxiScript}&quot;</p>
                      <button
                        onClick={() => handleCopy(publicTransportInfo.taxiScript, 'taxi')}
                        className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded transition-all"
                      >
                        {copiedTaxiScript ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://kakaot.app.link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full text-sm font-medium hover:bg-yellow-500 transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.82 5.27 4.58 6.72l-.96 3.57c-.08.3.26.54.52.37l4.3-2.88c.52.05 1.04.08 1.56.08 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                      </svg>
                      카카오T
                      <ExternalLink size={12} />
                    </a>
                    <a
                      href="https://tadatada.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-medium hover:bg-purple-600 transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                      </svg>
                      타다
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </section>
          )}

          {/* 구분선 - 주변 편의시설용 (타임캡슐 아닐 때만) */}
          {!isTimeCapsuleType && <div className="border-t border-gray-300"></div>}

          {/* 주변 편의시설 - 타임캡슐 일정이 아닐 때만 표시 */}
          {!isTimeCapsuleType && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="text-orange-500" size={18} />
              <h2 className="font-semibold text-gray-800 text-sm">주변 편의시설</h2>
            </div>

            {/* 로딩 상태 */}
            {isLoadingPlaces && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-orange-500" size={24} />
                <span className="ml-2 text-gray-500 text-sm">주변 장소를 검색하고 있어요...</span>
              </div>
            )}

            {/* 에러 상태 */}
            {placesError && (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-gray-500 text-sm">주변 장소 정보를 불러올 수 없습니다</p>
                <p className="text-gray-400 text-xs mt-1">{placesError.message}</p>
              </div>
            )}

            {/* 데이터 표시 */}
            {!isLoadingPlaces && !placesError && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 숙박시설 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Bed size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">숙박시설</span>
                  {nearbyHotels.length > 0 && (
                    <span className="text-xs text-gray-400">({nearbyHotels.length}개)</span>
                  )}
                </div>
                <div className="space-y-3">
                  {nearbyHotels.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-gray-400 text-sm">주변 숙박시설이 없습니다</p>
                    </div>
                  ) : (
                    nearbyHotels.slice(0, 5).map((hotel) => (
                      <div
                        key={hotel.id}
                        onClick={() => {
                          setSelectedPlace(convertToPlaceInfo(hotel, 'hotel'));
                          setIsPlacePopupOpen(true);
                        }}
                        className="bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-all cursor-pointer"
                      >
                        <div className="flex">
                          <div className="w-20 h-20 bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {hotel.imageUrl ? (
                              <img
                                src={hotel.imageUrl}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <Building2 size={24} className={`text-gray-400 ${hotel.imageUrl ? 'hidden' : ''}`} />
                          </div>
                          <div className="flex-1 min-w-0 p-3">
                            <p className="text-gray-800 text-sm font-medium truncate">{hotel.name}</p>
                            <p className="text-gray-500 text-xs">{hotel.distance}</p>
                            <p className="text-gray-400 text-xs truncate">{hotel.roadAddress || hotel.address}</p>
                          </div>
                          <div className="flex items-center pr-3">
                            <ChevronRight size={16} className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 대기장소/카페 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Coffee size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">대기장소 및 카페</span>
                  {nearbyCafes.length > 0 && (
                    <span className="text-xs text-gray-400">({nearbyCafes.length}개)</span>
                  )}
                </div>
                <div className="space-y-3">
                  {nearbyCafes.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-gray-400 text-sm">주변 카페가 없습니다</p>
                    </div>
                  ) : (
                    nearbyCafes.slice(0, 5).map((cafe) => (
                      <button
                        key={cafe.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlace(convertToPlaceInfo(cafe, 'cafe'));
                          setIsPlacePopupOpen(true);
                        }}
                        className="block w-full text-left bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-all cursor-pointer"
                      >
                        <div className="flex">
                          <div className="w-20 h-20 bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {cafe.imageUrl ? (
                              <img
                                src={cafe.imageUrl}
                                alt={cafe.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <Coffee size={24} className={`text-gray-400 ${cafe.imageUrl ? 'hidden' : ''}`} />
                          </div>
                          <div className="flex-1 min-w-0 p-3">
                            <p className="text-gray-800 text-sm font-medium truncate">{cafe.name}</p>
                            <p className="text-gray-500 text-xs">{cafe.distance}</p>
                            <p className="text-gray-400 text-xs truncate">{cafe.roadAddress || cafe.address}</p>
                          </div>
                          <div className="flex items-center pr-3">
                            <ChevronRight size={16} className="text-gray-400" />
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
            )}
          </section>
          )}
          </div>
        </div>
      </div>

      {/* 장소 상세 팝업 */}
      <HotelDetailPopup
        hotel={selectedPlace}
        isOpen={isPlacePopupOpen}
        onClose={() => {
          setIsPlacePopupOpen(false);
          setSelectedPlace(null);
        }}
      />

      {/* 삭제 확인 모달 */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                  일정을 삭제하시겠습니까?
                </h3>
                <p className="text-gray-500 text-sm text-center mb-6">
                  삭제된 일정은 복구할 수 없습니다.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      onDelete?.();
                    }}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
