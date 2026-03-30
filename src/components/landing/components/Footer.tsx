'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useScrollReveal } from '../lib/useScrollReveal';
import { cn } from '@/lib/utils';

interface FooterLink {
  text: string;
  url: string;
}

interface FooterSection {
  title: string;
  lines?: string[];
  links?: FooterLink[];
}

const footerData: FooterSection[] = [
  {
    title: 'To-orange',
    lines: [
      '대구광역시 수성구 희망로 36길 112-15, 1층',
      '투오렌지 주식회사 | 김희은',
      '543-81-03600',
      '2026-대구수성구-0091',
    ],
  },
  {
    title: '서비스',
    links: [
      { text: '편지쓰기', url: '/letter/compose/1' },
      { text: '받은편지함', url: '/letter' },
    ],
  },
  {
    title: '고객지원',
    links: [
      { text: '이용가이드', url: '/letter/faq' },
      { text: '공지사항', url: '/notice' },
      { text: '고객센터', url: '/customer-service' },
      { text: '환불정책', url: '/refund-policy' },
      { text: '이용약관', url: '/terms' },
      { text: '개인정보처리방침', url: '/privacy' },
    ],
  },
  {
    title: '문의사항',
    lines: [
      'CS@toorange.co.kr',
      '1544-7433',
    ],
  },
];

export function Footer() {
  const { ref, revealed } = useScrollReveal();

  return (
    <footer
      ref={ref}
      className={cn('scroll-reveal', revealed && 'revealed', 'bg-stone-900 text-gray-400 py-12 pb-20 md:pb-24')}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8 mb-8">
          {footerData.map((section, index) => (
            <div
              key={index}
              className={`reveal-child ${section.title === 'To-orange' ? 'col-span-2 md:col-span-1' : ''}`}
            >
              {section.title === 'To-orange' ? (
                <Image
                  src="/main/landing/logo.png"
                  alt="To-orange"
                  width={80}
                  height={20}
                  className="h-5 w-auto mb-4 brightness-0 invert"
                />
              ) : (
                <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              )}
              {section.lines && (
                <p className="text-sm leading-relaxed">
                  {section.lines.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < section.lines!.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              )}
              {section.links && (
                <ul className="space-y-2 text-sm">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link href={link.url} className="inline-block py-1 transition-colors hover:text-white">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className="reveal-child border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2026 To-orange. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
