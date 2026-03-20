import { XMLParser } from 'fast-xml-parser';
import type { TRACKING_STATUS } from '@to-orange/api-contracts';

type TrackingStatus = typeof TRACKING_STATUS[number];

export interface KoreaPostEvent {
    sortOrder: number;
    eventTime: Date;
    status: string;
    location: string;
    description: string;
}

export interface KoreaPostTrackingResult {
    success: boolean;
    trackingNumber: string;
    rawStatus: string;
    normalizedStatus: TrackingStatus;
    lastLocation: string | null;
    deliveredAt: Date | null;
    events: KoreaPostEvent[];
    errorMessage?: string;
}

const STATUS_MAP: Record<string, TrackingStatus> = {
    '접수': 'ACCEPTED',
    '발송': 'IN_TRANSIT',
    '도착': 'IN_TRANSIT',
    '배달준비': 'OUT_FOR_DELIVERY',
    '배달중': 'OUT_FOR_DELIVERY',
    '배달완료': 'DELIVERED',
    '반송': 'RETURNED',
};

/**
 * 우체국 API 원본 상태를 정규화된 상태로 변환
 */
export function normalizeTrackingStatus(rawStatus: string): TrackingStatus {
    for (const [keyword, status] of Object.entries(STATUS_MAP)) {
        if (rawStatus.includes(keyword)) {
            return status;
        }
    }
    return 'UNKNOWN';
}

/**
 * 한국 날짜/시간 문자열을 Date 객체로 변환
 * 예: "2025-01-15", "10:30:00" → Date
 */
function parseKoreanDateTime(dateStr: string, timeStr?: string): Date {
    const [year, month, day] = dateStr.split(/[-.]/).map(Number);
    let hours = 0, minutes = 0, seconds = 0;

    if (timeStr) {
        const timeParts = timeStr.split(':').map(Number);
        hours = timeParts[0] || 0;
        minutes = timeParts[1] || 0;
        seconds = timeParts[2] || 0;
    }

    // KST (UTC+9) 기준으로 Date 생성
    return new Date(Date.UTC(year, month - 1, day, hours - 9, minutes, seconds));
}

/**
 * 우체국 종적 조회 API 호출
 * KOREA_POST_REGKEY가 있으면 biz.epost.go.kr 사용, 아니면 KOREA_POST_API_KEY로 openapi.epost.go.kr 사용
 */
export async function fetchKoreaPostTracking(trackingNumber: string): Promise<KoreaPostTrackingResult> {
    const regkey = process.env.KOREA_POST_REGKEY;
    const serviceKey = process.env.KOREA_POST_API_KEY;

    if (!regkey && !serviceKey) {
        return {
            success: false,
            trackingNumber,
            rawStatus: '',
            normalizedStatus: 'UNKNOWN',
            lastLocation: null,
            deliveredAt: null,
            events: [],
            errorMessage: 'KOREA_POST_REGKEY 또는 KOREA_POST_API_KEY가 설정되지 않았습니다',
        };
    }

    try {
        let apiUrl: string;

        if (regkey) {
            // biz.epost.go.kr 계약고객 API
            const url = new URL('http://biz.epost.go.kr/KpostPortal/openapi2');
            url.searchParams.set('regkey', regkey);
            url.searchParams.set('target', 'trace');
            url.searchParams.set('query', trackingNumber);
            apiUrl = url.toString();
        } else {
            // openapi.epost.go.kr 공공데이터포털 API
            // ServiceKey는 이미 URL 인코딩된 상태로 저장되어 있을 수 있으므로 디코딩 후 set
            const decodedKey = decodeURIComponent(serviceKey!);
            const url = new URL('http://openapi.epost.go.kr/trace/retrieveLongitudinalCombinedService/retrieveLongitudinalCombinedService/getLongitudinalCombinedList');
            url.searchParams.set('ServiceKey', decodedKey);
            url.searchParams.set('rgist', trackingNumber);
            apiUrl = url.toString();
        }

        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/xml',
            },
        });

        if (!response.ok) {
            return {
                success: false,
                trackingNumber,
                rawStatus: '',
                normalizedStatus: 'UNKNOWN',
                lastLocation: null,
                deliveredAt: null,
                events: [],
                errorMessage: `API request failed with status ${response.status}`,
            };
        }

        const xmlText = await response.text();
        return parseKoreaPostXML(xmlText, trackingNumber);
    } catch (error) {
        return {
            success: false,
            trackingNumber,
            rawStatus: '',
            normalizedStatus: 'UNKNOWN',
            lastLocation: null,
            deliveredAt: null,
            events: [],
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * 아이템에서 날짜 필드 추출 (다양한 필드명 대응)
 */
function getItemDate(item: Record<string, string>): string {
    return item.date || item.dlvyDate || item.cntcDate || item.processDe || new Date().toISOString().split('T')[0];
}

/**
 * 아이템에서 시간 필드 추출
 */
function getItemTime(item: Record<string, string>): string | undefined {
    return item.time || item.dlvyTime || item.cntcTime || item.processTimeStr;
}

/**
 * 아이템에서 상태 필드 추출
 */
function getItemStatus(item: Record<string, string>): string {
    const raw = item.statue || item.Statue || item.processSttus || item.dlvySttus || item.trackState || '';
    // API 응답에 공백/개행이 포함될 수 있으므로 첫 줄만 trim
    return raw.split('\n')[0].trim();
}

/**
 * 아이템에서 장소 필드 추출
 */
function getItemLocation(item: Record<string, string>): string {
    return item.location || item.nowLc || item.ofcName || '';
}

/**
 * 아이템에서 설명 필드 추출
 */
function getItemDescription(item: Record<string, string>): string {
    // remark 필드 우선, 없으면 statue의 부가 정보(두 번째 줄 이후) 사용
    if (item.remark?.trim()) return item.remark.trim();
    if (item.detailDc?.trim()) return item.detailDc.trim();
    if (item.dtlCnts?.trim()) return item.dtlCnts.trim();
    if (item.nm?.trim()) return item.nm.trim();
    // statue에 개행이 있으면 두 번째 줄부터 상세설명으로 추출
    const rawStatue = item.statue || item.Statue || '';
    const lines = rawStatue.split('\n');
    if (lines.length > 1) {
        return lines.slice(1).join(' ').trim().replace(/^\(|\)$/g, '');
    }
    return '';
}

/**
 * 우체국 API XML 응답 파싱
 * biz.epost.go.kr / openapi.epost.go.kr 두 형식 모두 대응
 */
function parseKoreaPostXML(xmlText: string, trackingNumber: string): KoreaPostTrackingResult {
    const parser = new XMLParser({
        ignoreAttributes: false,
        removeNSPrefix: true,
        cdataPropName: '__cdata',
    });

    try {
        const result = parser.parse(xmlText);

        // biz.epost.go.kr 에러 형식: <error><error_code>ERR-xxx</error_code><message>...</message></error>
        if (result?.error) {
            return {
                success: false,
                trackingNumber,
                rawStatus: '',
                normalizedStatus: 'UNKNOWN',
                lastLocation: null,
                deliveredAt: null,
                events: [],
                errorMessage: result.error.message || `API error: ${result.error.error_code}`,
            };
        }

        // openapi.epost.go.kr combined 에러: <response><header><successYN>N</successYN>...</header></response>
        const header = result?.response?.header;
        if (header?.successYN === 'N') {
            return {
                success: false,
                trackingNumber,
                rawStatus: '',
                normalizedStatus: 'UNKNOWN',
                lastLocation: null,
                deliveredAt: null,
                events: [],
                errorMessage: header.errorMessage || 'API returned error',
            };
        }

        // openapi.epost.go.kr domestic 에러: <...Response><cmmMsgHeader>...</cmmMsgHeader></...Response>
        const cmmMsgHeader = result?.response?.cmmMsgHeader
            || result?.LongitudinalDomesticListResponse?.cmmMsgHeader
            || result?.cmmMsgHeader;
        if (cmmMsgHeader?.successYN === 'N' || (cmmMsgHeader?.returnCode && cmmMsgHeader.returnCode !== '00')) {
            return {
                success: false,
                trackingNumber,
                rawStatus: '',
                normalizedStatus: 'UNKNOWN',
                lastLocation: null,
                deliveredAt: null,
                events: [],
                errorMessage: cmmMsgHeader.errMsg || cmmMsgHeader.returnReasonMsg || 'API returned error',
            };
        }

        // 아이템 리스트 추출 (다양한 XML 구조 대응)
        const itemList =
            // openapi.epost.go.kr combined: <response><trackInfo><detaileTrackList>
            result?.response?.trackInfo?.detaileTrackList
            // biz.epost.go.kr: <trace><itemlist><item>
            || result?.trace?.itemlist?.item
            // openapi.epost.go.kr domestic: <...Response><body><itemList>
            || result?.response?.body?.itemList
            || result?.LongitudinalDomesticListResponse?.body?.itemList
            || result?.body?.itemList
            // biz.epost.go.kr 다른 형식
            || result?.trace?.item
            || result?.itemlist?.item;

        if (!itemList) {
            return {
                success: false,
                trackingNumber,
                rawStatus: '',
                normalizedStatus: 'UNKNOWN',
                lastLocation: null,
                deliveredAt: null,
                events: [],
                errorMessage: '배송 정보를 찾을 수 없습니다',
            };
        }

        // 배열이 아닌 경우 배열로 변환
        const items = Array.isArray(itemList) ? itemList : [itemList];

        // CDATA 값 처리 헬퍼
        const unwrapCdata = (val: unknown): string => {
            if (val && typeof val === 'object' && '__cdata' in (val as Record<string, unknown>)) {
                return String((val as Record<string, string>).__cdata);
            }
            return val != null ? String(val) : '';
        };

        // 아이템을 일반 문자열 맵으로 변환 (CDATA 해제)
        const normalizedItems = items.map((item: Record<string, unknown>) => {
            const normalized: Record<string, string> = {};
            for (const [key, val] of Object.entries(item)) {
                normalized[key] = unwrapCdata(val);
            }
            return normalized;
        });

        // 이벤트 파싱
        const events: KoreaPostEvent[] = normalizedItems.map((item, index) => ({
            sortOrder: index + 1,
            eventTime: parseKoreanDateTime(getItemDate(item), getItemTime(item)),
            status: getItemStatus(item),
            location: getItemLocation(item),
            description: getItemDescription(item),
        }));

        // 최신 이벤트 기준으로 상태 결정
        const latestEvent = events[events.length - 1];
        const rawStatus = latestEvent?.status || '';
        const normalizedStatus = normalizeTrackingStatus(rawStatus);

        // 배달 완료 시간 결정
        let deliveredAt: Date | null = null;
        if (normalizedStatus === 'DELIVERED') {
            const deliveredEvent = events.find(e => e.status.includes('배달완료'));
            deliveredAt = deliveredEvent?.eventTime || latestEvent?.eventTime || null;
        }

        return {
            success: true,
            trackingNumber,
            rawStatus,
            normalizedStatus,
            lastLocation: latestEvent?.location || null,
            deliveredAt,
            events,
        };
    } catch (error) {
        return {
            success: false,
            trackingNumber,
            rawStatus: '',
            normalizedStatus: 'UNKNOWN',
            lastLocation: null,
            deliveredAt: null,
            events: [],
            errorMessage: `XML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * 배송 상태 한글 라벨 반환
 */
export function getTrackingStatusLabel(status: TrackingStatus): string {
    const labels: Record<TrackingStatus, string> = {
        PENDING: '조회대기',
        ACCEPTED: '접수',
        IN_TRANSIT: '배송중',
        OUT_FOR_DELIVERY: '배달중',
        DELIVERED: '배달완료',
        RETURNED: '반송',
        UNKNOWN: '조회불가',
    };
    return labels[status] || '알 수 없음';
}

/**
 * 배송 상태 색상 클래스 반환
 */
export function getTrackingStatusColor(status: TrackingStatus): string {
    const colors: Record<TrackingStatus, string> = {
        PENDING: 'bg-gray-100 text-gray-600',
        ACCEPTED: 'bg-blue-100 text-blue-600',
        IN_TRANSIT: 'bg-yellow-100 text-yellow-600',
        OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-600',
        DELIVERED: 'bg-green-100 text-green-600',
        RETURNED: 'bg-red-100 text-red-600',
        UNKNOWN: 'bg-gray-100 text-gray-500',
    };
    return colors[status] || 'bg-gray-100 text-gray-500';
}
