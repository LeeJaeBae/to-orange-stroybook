'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/features/auth/index.client';

interface SubMenuItem {
  title: string;
  url: string;
}

interface MenuItem {
  title: string;
  url: string;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: '마음전하기',
    url: '/',
    subItems: [
      { title: '편지쓰기', url: '/letter/compose/1' },
      { title: '받은 편지함', url: '/letter/inbox' },
      { title: '보낸 편지함', url: '/letter/sent' },
    ],
  },
  {
    title: '회사소개',
    url: '/about',
    subItems: [
      { title: '투오렌지 소개', url: '/about' },
      { title: '브랜드 철학', url: '/brand-philosophy' },
    ],
  },
  {
    title: '공지사항',
    url: '/notice',
  },
  {
    title: '고객센터',
    url: '/customer-service',
  },
];

const myPageSubItems: SubMenuItem[] = [
  { title: '내 정보', url: '/letter/profile' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // PC: 현재 열린 드롭다운 메뉴
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile: 현재 열린 아코디언 메뉴
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);

  // 스크롤 감지 상태
  const [isScrolled, setIsScrolled] = useState(false);

  const isLoggedIn = !!user;

  const handleLogout = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  // 현재 경로가 메뉴 URL과 일치하는지 확인
  const isActiveMenu = (url: string): boolean => {
    if (url === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(url) ?? false;
  };

  // 메뉴 또는 서브메뉴가 활성 상태인지 확인
  const isMenuOrSubMenuActive = (item: MenuItem): boolean => {
    if (isActiveMenu(item.url)) return true;
    if (item.subItems) {
      return item.subItems.some(sub => isActiveMenu(sub.url));
    }
    return false;
  };

  // PC 드롭다운 호버 핸들러
  const handleMouseEnter = (menuTitle: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(menuTitle);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // 모바일 아코디언 토글
  const toggleMobileMenu = (menuTitle: string) => {
    setExpandedMobileMenu(expandedMobileMenu === menuTitle ? null : menuTitle);
  };

  // 경로 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // 모바일 메뉴 열릴 때 스크롤 방지
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 클린업
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-200 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white'
    }`}>
      {/* 상단 카테고리 헤더 바 - PC 전용 */}
      <div className="hidden lg:block bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-10">
          <div className="flex items-center gap-6 text-xs font-medium">
            <span className="text-orange-600">구치소/교도소</span>
            <span className="text-gray-400 cursor-not-allowed">일반주소</span>
            <span className="text-gray-400 cursor-not-allowed">군부대/훈련소</span>
            <span className="text-gray-400 cursor-not-allowed">소년원/소년교도소</span>
          </div>
          <Link href="/login" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            회원가입
          </Link>
        </div>
      </div>

      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-12 lg:h-16">
            {/* 로고 */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center">
                <Image
                  src="/main/landing/logo.png"
                  alt="투오렌지"
                  width={80}
                  height={20}
                  priority
                  className="h-5 w-auto"
                />
              </Link>
            </div>

            {/* PC 메뉴 - 센터 정렬 */}
            <div className="hidden lg:flex items-center justify-center flex-1 space-x-6 xl:space-x-10">
              {menuItems.map((item) => (
                <div
                  key={item.title}
                  className="relative"
                  onMouseEnter={() => item.subItems && handleMouseEnter(item.title)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.url}
                    className={`text-sm font-medium transition-colors py-5 block ${
                      isMenuOrSubMenuActive(item)
                        ? 'text-orange-500'
                        : 'text-gray-600 hover:text-orange-500'
                    }`}
                  >
                    <span className="relative">
                      {item.title}
                      {isMenuOrSubMenuActive(item) && (
                        <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                      )}
                    </span>
                  </Link>

                  {/* PC 서브메뉴 드롭다운 */}
                  {item.subItems && activeDropdown === item.title && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-3">
                      <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-3 min-w-[160px]">
                        {item.subItems.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.url}
                            className={`block px-5 py-2.5 text-sm text-center transition-colors ${
                              isActiveMenu(subItem.url)
                                ? 'text-orange-500 bg-orange-50 font-medium'
                                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* 마이페이지 - 로그인한 사용자에게만 표시 */}
              {isLoggedIn && (
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('마이페이지')}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href="/letter/profile"
                    className={`text-sm font-medium transition-colors py-5 block ${
                      pathname?.startsWith('/letter/profile') || pathname?.startsWith('/letter/family') ||
                      pathname?.startsWith('/letter/address') || pathname?.startsWith('/letter/payments') ||
                      pathname?.startsWith('/letter/settings')
                        ? 'text-orange-500'
                        : 'text-gray-600 hover:text-orange-500'
                    }`}
                  >
                    <span className="relative">
                      마이페이지
                      {(pathname?.startsWith('/letter/profile') || pathname?.startsWith('/letter/family') ||
                        pathname?.startsWith('/letter/address') || pathname?.startsWith('/letter/payments') ||
                        pathname?.startsWith('/letter/settings')) && (
                        <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                      )}
                    </span>
                  </Link>

                  {activeDropdown === '마이페이지' && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-3">
                      <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-3 min-w-[140px]">
                        {myPageSubItems.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.url}
                            className={`block px-5 py-2.5 text-sm text-center transition-colors ${
                              isActiveMenu(subItem.url)
                                ? 'text-orange-500 bg-orange-50 font-medium'
                                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 우측 영역 */}
            <div className="flex items-center gap-2">
              {/* PC용 버튼 */}
              {isLoggedIn ? (
                <>
                  <Link
                    href="/letter/compose/1"
                    className="hidden lg:block bg-orange-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    편지쓰기
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden lg:block bg-white text-gray-700 text-sm font-semibold px-6 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/letter/compose/1"
                    className="hidden lg:block bg-orange-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    편지쓰기
                  </Link>
                  <Link
                    href="/login"
                    className="hidden lg:block bg-white text-gray-700 text-sm font-semibold px-6 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    회원가입/로그인
                  </Link>
                </>
              )}

              {/* 햄버거 메뉴 버튼 - 모바일에서만 */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:text-orange-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 오버레이 + 슬라이드 패널 */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 lg:hidden shadow-xl animate-in slide-in-from-right duration-200">
            <div className="flex justify-end p-4">
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 pb-6 h-[calc(100%-72px)] overflow-y-auto">
              <div className="border-t border-gray-100 pt-6">
                <p className="text-xs text-gray-400 mb-3">메뉴</p>
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <div key={item.title}>
                      {item.subItems ? (
                        <>
                          <button
                            onClick={() => toggleMobileMenu(item.title)}
                            className={`w-full flex items-center justify-between py-3 px-2 rounded-lg text-base font-medium transition-colors ${
                              isMenuOrSubMenuActive(item) ? 'text-orange-500' : 'text-gray-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {item.title}
                              {isMenuOrSubMenuActive(item) && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
                            </span>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedMobileMenu === item.title ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <div className={`overflow-hidden transition-all duration-200 ${expandedMobileMenu === item.title ? 'max-h-96' : 'max-h-0'}`}>
                            <div className="pl-4 py-2 space-y-1">
                              {item.subItems.map((subItem, subIndex) => (
                                <Link key={subIndex} href={subItem.url} onClick={() => setIsMobileMenuOpen(false)}
                                  className={`block py-2.5 px-3 rounded-lg text-sm transition-colors ${isActiveMenu(subItem.url) ? 'text-orange-500 bg-orange-50 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                                  {subItem.title}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <Link href={item.url} onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center justify-between py-3 px-2 rounded-lg text-base font-medium transition-colors ${isActiveMenu(item.url) ? 'text-orange-500 bg-orange-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <span className="flex items-center gap-2">
                            {item.title}
                            {isActiveMenu(item.url) && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
                          </span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  ))}
                  {isLoggedIn && (
                    <div>
                      <button onClick={() => toggleMobileMenu('마이페이지')}
                        className={`w-full flex items-center justify-between py-3 px-2 rounded-lg text-base font-medium transition-colors ${
                          pathname?.startsWith('/letter/profile') || pathname?.startsWith('/letter/family') || pathname?.startsWith('/letter/address') || pathname?.startsWith('/letter/payments') || pathname?.startsWith('/letter/settings') ? 'text-orange-500' : 'text-gray-700'
                        }`}>
                        <span className="flex items-center gap-2">
                          마이페이지
                          {(pathname?.startsWith('/letter/profile') || pathname?.startsWith('/letter/family') || pathname?.startsWith('/letter/address') || pathname?.startsWith('/letter/payments') || pathname?.startsWith('/letter/settings')) && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
                        </span>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedMobileMenu === '마이페이지' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className={`overflow-hidden transition-all duration-200 ${expandedMobileMenu === '마이페이지' ? 'max-h-96' : 'max-h-0'}`}>
                        <div className="pl-4 py-2 space-y-1">
                          {myPageSubItems.map((subItem, subIndex) => (
                            <Link key={subIndex} href={subItem.url} onClick={() => setIsMobileMenuOpen(false)}
                              className={`block py-2.5 px-3 rounded-lg text-sm transition-colors ${isActiveMenu(subItem.url) ? 'text-orange-500 bg-orange-50 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-8 space-y-3">
                {isLoggedIn ? (
                  <>
                    <Link href="/letter/compose/1" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-orange-500 text-white text-center text-base font-semibold py-4 rounded-xl hover:bg-orange-600 transition-colors">편지쓰기</Link>
                    <button onClick={handleLogout} className="block w-full bg-white text-gray-700 text-center text-base font-semibold py-4 rounded-xl border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors">로그아웃</button>
                  </>
                ) : (
                  <>
                    <Link href="/letter/compose/1" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-orange-500 text-white text-center text-base font-semibold py-4 rounded-xl hover:bg-orange-600 transition-colors">편지쓰기</Link>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-white text-gray-700 text-center text-base font-semibold py-4 rounded-xl border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors">로그인</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
