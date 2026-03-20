'use client';

import Link from 'next/link';
import useScrollAnimation from '@/hooks/useScrollAnimation';

interface FooterLink {
  text: string;
  url: string;
}

interface FooterSection {
  title: string;
  content?: string;
  links?: FooterLink[];
}

const footerData: FooterSection[] = [
  {
    title: 'To-orange',
    content: '대구광역시 수성구 희망로 36길 112-15, 1층<br>투오렌지 주식회사 | 김희은<br>543-81-03600<br>2026-대구수성구-0091',
  },
  {
    title: '서비스',
    links: [
      { text: '편지쓰기', url: '/letter/compose/1' },
      { text: '받은편지함', url: '/letter' },
      // { text: '타임캡슐', url: '/letter/time-capsule' },
      // { text: '오렌지나무', url: '/letter/orangetree' },
    ],
  },
  {
    title: '고객지원',
    links: [
      { text: '이용가이드', url: '/letter/faq' },
      { text: '공지사항', url: '/letter/notice' },
      { text: '고객센터', url: '/customer-service' },
      { text: '환불정책', url: '/refund-policy' },
      { text: '이용약관', url: '/terms' },
      { text: '개인정보처리방침', url: '/privacy' },
    ],
  },
  {
    title: '문의사항',
    content: 'CS@toorange.co.kr<br>1544-7433',
  },
];

export default function Footer() {
  const sectionRef = useScrollAnimation<HTMLElement>();

  return (
    <footer ref={sectionRef} className="bg-stone-900 text-gray-400 py-12 pb-20 md:pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
          {footerData.map((section, index) => (
            <div
              key={index}
              className={`fade-up fade-up-delay-${index} ${section.title === 'To-orange' ? 'col-span-2 md:col-span-1' : ''}`}
            >
              {section.title === 'To-orange' ? (
                <img
                  src="/main/landing/logo.png"
                  alt="To-orange"
                  className="h-5 mb-4 brightness-0 invert"
                />
              ) : (
                <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              )}
              {section.content && (
                <p
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              )}
              {section.links && (
                <ul className="space-y-3 text-sm">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link href={link.url} className="hover:text-white transition-colors py-1 inline-block">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-8 text-sm text-center fade-up fade-up-delay-4">
          <p>&copy; 2026 To-orange. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
