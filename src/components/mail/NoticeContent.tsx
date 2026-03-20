import { Search, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

interface NoticeContentProps {
  onClose?: () => void;
}

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  isHot: boolean;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// API 응답을 NoticeItem으로 변환
function mapApiNotice(raw: any): NoticeItem {
  return {
    id: raw.id,
    title: raw.title,
    content: raw.content || '',
    author: raw.author || '운영자',
    date: raw.created_at ? raw.created_at.slice(0, 10) : '',
    isHot: raw.is_pinned ?? false,
  };
}

const searchOptions = [
  { value: 'title', label: '제목' },
  { value: 'content', label: '내용' },
  { value: 'author', label: '작성자' },
];

export function NoticeContent({ onClose }: NoticeContentProps) {
  const [searchType, setSearchType] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const itemsPerPage = 10;

  // API 데이터 상태
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API에서 공지사항 로드
  const fetchNotices = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/notices?page=${page}&pageSize=${itemsPerPage}`);
      if (!res.ok) throw new Error('공지사항을 불러오는데 실패했습니다.');
      const json = await res.json();
      setNotices((json.data || []).map(mapApiNotice));
      setPagination(json.pagination);
    } catch (e: any) {
      setError(e.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchNotices(currentPage);
  }, [currentPage, fetchNotices]);

  // 클라이언트 검색 필터링
  const filteredNotices = notices.filter((notice) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (searchType === 'title') return notice.title.toLowerCase().includes(q);
    if (searchType === 'content') return notice.content.toLowerCase().includes(q);
    if (searchType === 'author') return notice.author.toLowerCase().includes(q);
    return true;
  });

  // 검색 중일 때는 클라이언트 필터링 결과 사용, 아닐 때는 서버 페이지네이션
  const totalPages = searchQuery
    ? Math.ceil(filteredNotices.length / itemsPerPage) || 1
    : pagination?.totalPages || 1;

  const displayNotices = searchQuery
    ? filteredNotices
    : filteredNotices;

  // 이전글/다음글 네비게이션
  const currentIndex = selectedNotice
    ? notices.findIndex((n) => n.id === selectedNotice.id)
    : -1;
  const prevNotice = currentIndex > 0 ? notices[currentIndex - 1] : null;
  const nextNotice = currentIndex >= 0 && currentIndex < notices.length - 1 ? notices[currentIndex + 1] : null;

  // 로딩 스켈레톤
  const renderSkeleton = () => (
    <div className="divide-y divide-border/40">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 md:gap-4 py-4 px-4 animate-pulse">
          <div className="col-span-2 md:col-span-1 flex justify-center">
            <div className="h-4 w-6 bg-muted rounded" />
          </div>
          <div className="col-span-10 md:col-span-7">
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
          <div className="hidden md:flex col-span-2 justify-center">
            <div className="h-4 w-12 bg-muted rounded" />
          </div>
          <div className="hidden md:flex col-span-2 justify-center">
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  // 에러 표시
  const renderError = () => (
    <div className="text-center py-12">
      <p className="text-destructive mb-4">{error}</p>
      <Button variant="outline" size="sm" onClick={() => fetchNotices(currentPage)}>
        다시 시도
      </Button>
    </div>
  );

  // 상세 화면
  if (selectedNotice) {
    return (
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <header className="hidden md:flex h-14 border-b border-border/40 bg-white/80 backdrop-blur-sm items-center justify-between px-6">
          <button
            onClick={() => setSelectedNotice(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">목록으로</span>
          </button>
          <Button variant="ghost" size="sm" onClick={onClose} className="hidden">
            편지함으로 돌아가기
          </Button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:py-10 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* 제목 영역 */}
              <div className="mb-6 pb-6 border-b border-border/40">
                <div className="flex items-center gap-2 mb-3">
                  {selectedNotice.isHot && (
                    <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded">
                      HOT
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-foreground mb-3">
                  {selectedNotice.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{selectedNotice.author}</span>
                  <span>{selectedNotice.date}</span>
                </div>
              </div>

              {/* 본문 */}
              <div className="prose prose-sm max-w-none">
                <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
                  {selectedNotice.content}
                </p>
              </div>

              {/* 이전/다음 글 네비게이션 */}
              <div className="mt-10 pt-6 border-t border-border/40">
                <div className="flex flex-col gap-2">
                  {prevNotice && (
                    <button
                      onClick={() => setSelectedNotice(prevNotice)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground shrink-0">이전 글</span>
                      <span className="text-sm text-foreground truncate">
                        {prevNotice.title}
                      </span>
                    </button>
                  )}
                  {nextNotice && (
                    <button
                      onClick={() => setSelectedNotice(nextNotice)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground shrink-0">다음 글</span>
                      <span className="text-sm text-foreground truncate">
                        {nextNotice.title}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // 목록 화면
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="hidden md:flex h-14 border-b border-border/40 bg-white/80 backdrop-blur-sm items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-foreground">공지사항</h1>
        <Button variant="ghost" size="sm" onClick={onClose} className="hidden">
          편지함으로 돌아가기
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:py-10 lg:px-6">
        <div className="max-w-4xl mx-auto">
          {/* 상단 타이틀 */}
          <div className="mb-8">
            <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-[18px]">
              투오렌지의 <span className="text-primary underline underline-offset-4">새 소식</span>을 전해드려요
            </h2>
            <div className="mb-6">
              <p className="text-size-15 md:text-base text-muted-foreground leading-normal">
                서비스 업데이트, 이벤트, 점검 안내 등
                <br />
                투오렌지의 중요한 소식을 확인해 보세요.
              </p>
            </div>
          </div>

          {/* 검색 영역 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <p className="text-sm text-muted-foreground">
              {loading ? '불러오는 중...' : `${searchQuery ? filteredNotices.length : pagination?.total || 0}개의 공지사항`}
            </p>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* 검색 타입 드롭다운 */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between w-24 px-3 py-2 text-sm border border-border/60 rounded-lg bg-card hover:border-primary/30 transition-colors"
                >
                  <span className="text-foreground">{searchOptions.find(opt => opt.value === searchType)?.label}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-card border border-border/60 rounded-lg shadow-lg z-10">
                    {searchOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSearchType(option.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-muted first:rounded-t-lg last:rounded-b-lg ${
                          searchType === option.value ? 'bg-primary/10 text-primary' : 'text-foreground'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 검색 입력 */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색어를 입력해 주세요."
                  className="w-full sm:w-64 pl-10"
                />
              </div>
            </div>
          </div>

          {/* 테이블 */}
          <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="hidden md:grid grid-cols-12 gap-4 py-3 px-4 border-b border-border/60 bg-muted/30">
              <div className="col-span-1 text-center text-sm font-medium text-muted-foreground">번호</div>
              <div className="col-span-7 text-sm font-medium text-muted-foreground">제목</div>
              <div className="col-span-2 text-center text-sm font-medium text-muted-foreground">작성자</div>
              <div className="col-span-2 text-center text-sm font-medium text-muted-foreground">작성일</div>
            </div>

            {/* 테이블 바디 */}
            {loading ? renderSkeleton() : error ? renderError() : (
              <>
                <div className="divide-y divide-border/40">
                  {displayNotices.map((notice, index) => (
                    <motion.div
                      key={notice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => setSelectedNotice(notice)}
                      className="grid grid-cols-12 gap-2 md:gap-4 py-4 px-4 hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      {/* 번호 */}
                      <div className="col-span-2 md:col-span-1 text-center text-sm text-muted-foreground">
                        {searchQuery
                          ? index + 1
                          : (pagination ? pagination.total - ((currentPage - 1) * itemsPerPage + index) : index + 1)}
                      </div>

                      {/* 제목 */}
                      <div className="col-span-10 md:col-span-7 flex items-center gap-2">
                        <span className="text-sm text-foreground hover:text-primary transition-colors line-clamp-1">
                          {notice.title}
                        </span>
                        {notice.isHot && (
                          <span className="shrink-0 px-1.5 py-0.5 text-size-10 font-bold text-white bg-red-500 rounded">
                            HOT
                          </span>
                        )}
                      </div>

                      {/* 작성자 - 데스크탑 */}
                      <div className="hidden md:block col-span-2 text-center text-sm text-muted-foreground">
                        {notice.author}
                      </div>

                      {/* 작성일 - 데스크탑 */}
                      <div className="hidden md:block col-span-2 text-center text-sm text-muted-foreground">
                        {notice.date}
                      </div>

                      {/* 모바일: 작성자 + 작성일 */}
                      <div className="col-span-12 md:hidden pl-8 text-xs text-muted-foreground">
                        {notice.author} · {notice.date}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredNotices.length === 0 && !loading && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>검색 결과가 없습니다.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 페이지네이션 */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-muted/50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-muted/50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* 안내 문구 */}
          <div className="mt-6 p-4 bg-muted/50 rounded-xl">
            <h4 className="text-sm font-medium text-foreground mb-2">더 궁금한 점이 있으신가요?</h4>
            <p className="text-xs text-muted-foreground">
              '고객의 소리'를 통해 문의해 주시면 빠르게 답변드리겠습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
