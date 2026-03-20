'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface AddressResult {
  /** 도로명 주소 */
  roadAddr: string;
  /** 지번 주소 */
  jibunAddr: string;
  /** 우편번호 */
  zipNo: string;
  /** 건물명 */
  bdNm: string;
  /** 시도 */
  siNm: string;
  /** 시군구 */
  sggNm: string;
  /** 읍면동 */
  emdNm: string;
}

interface AddressSearchProps {
  onSelect: (result: AddressResult) => void;
  onClose?: () => void;
  placeholder?: string;
  className?: string;
  /** 컴팩트 모드 (인라인 사용 시) */
  compact?: boolean;
}

export function AddressSearch({
  onSelect,
  onClose,
  placeholder = '도로명, 건물명, 지번으로 검색',
  className,
  compact = false,
}: AddressSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchAddress = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setTotalCount(0);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/v1/address/search?keyword=${encodeURIComponent(query.trim())}&page=${page}`);
      if (!res.ok) throw new Error('검색 실패');
      const data = await res.json();
      
      if (page === 1) {
        setResults(data.results || []);
      } else {
        setResults(prev => [...prev, ...(data.results || [])]);
      }
      setTotalCount(data.totalCount || 0);
      setCurrentPage(page);
    } catch (e) {
      console.error('주소 검색 오류:', e);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setKeyword(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchAddress(value, 1);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      searchAddress(keyword, 1);
    }
  };

  const handleSelect = (result: AddressResult) => {
    onSelect(result);
  };

  const handleLoadMore = () => {
    searchAddress(keyword, currentPage + 1);
  };

  return (
    <div className={cn('flex flex-col', compact ? 'gap-2' : 'gap-3', className)}>
      {/* 검색 입력 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={keyword}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'pl-9 pr-9 text-sm placeholder:text-gray-400',
            compact ? 'h-9' : 'h-10'
          )}
        />
        {keyword && (
          <button
            onClick={() => { setKeyword(''); setResults([]); setHasSearched(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 검색 결과 */}
      <div className={cn(
        'overflow-y-auto border rounded-lg',
        compact ? 'max-h-[240px]' : 'max-h-[320px]',
        results.length === 0 && !isLoading ? 'border-dashed' : ''
      )}>
        {isLoading && results.length === 0 && (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            검색 중...
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
            <MapPin className="w-5 h-5 mb-2 opacity-40" />
            <p>검색 결과가 없습니다</p>
            <p className="text-xs mt-1">도로명, 건물명, 지번으로 검색해보세요</p>
          </div>
        )}

        {!hasSearched && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
            <Search className="w-5 h-5 mb-2 opacity-40" />
            <p>주소를 검색해주세요</p>
            <p className="text-xs mt-1">예: 세종대로 110, 강남대로, 역삼동 123</p>
          </div>
        )}

        {results.length > 0 && (
          <ul className="divide-y">
            {results.map((result, idx) => (
              <li key={`${result.zipNo}-${idx}`}>
                <button
                  onClick={() => handleSelect(result)}
                  className="w-full text-left px-3 py-2.5 hover:bg-orange-50/50 transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 text-size-10 font-medium bg-orange-100 text-orange-600 rounded px-1.5 py-0.5">
                      {result.zipNo}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium truncate group-hover:text-orange-600 transition-colors">
                        {result.roadAddr}
                      </p>
                      {result.jibunAddr && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          [지번] {result.jibunAddr}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* 더보기 */}
        {results.length > 0 && results.length < totalCount && (
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="w-full py-2.5 text-xs text-muted-foreground hover:text-orange-600 hover:bg-orange-50/30 transition-colors border-t"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> 불러오는 중...
              </span>
            ) : (
              `더보기 (${results.length}/${totalCount})`
            )}
          </button>
        )}
      </div>

      {/* 하단 안내 */}
      {totalCount > 0 && (
        <p className="text-size-10 text-muted-foreground text-right">
          총 {totalCount.toLocaleString()}건 · 행정안전부 도로명주소
        </p>
      )}
    </div>
  );
}
