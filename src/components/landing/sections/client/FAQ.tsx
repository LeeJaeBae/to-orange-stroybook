'use client';

import { useState } from 'react';
import Link from 'next/link';
import useScrollAnimation from '@/lib/hooks/useScrollAnimation';

interface FaqItem {
  q: string;
  a: string;
}

interface UploadedImage {
  file: File;
  preview: string;
}

const faqItems: FaqItem[] = [
  {
    q: '비용은 얼마인가요?',
    a: '기본 편지 1,800원(준등기)부터 시작합니다. 사진 동봉, 추가 콘텐츠 등 옵션에 따라 달라집니다.',
  },
  {
    q: '보내고 얼마나 걸리나요?',
    a: '평균 3~5일 내 도착합니다. 교정시설은 내부 검열 절차에 따라 1~2일 추가될 수 있어요.',
  },
  {
    q: '수용자도 답장 보낼 수 있나요?',
    a: '네, 손편지담기 기능으로 받은 편지를 사진 찍어 보관하고, 바로 답장도 작성할 수 있습니다.',
  },
  {
    q: '환불 가능한가요?',
    a: '발송 전이라면 전액 환불 가능합니다. 발송 후에는 환불이 어렵습니다.',
  },
];

export function FAQ() {
  const sectionRef = useScrollAnimation<HTMLElement>();
  const [activeTab, setActiveTab] = useState<'faq' | 'voice'>('faq');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // 고객의 소리 폼 상태
  const [content, setContent] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [phone, setPhone] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 3) {
      alert('이미지는 최대 3장까지 첨부 가능합니다.');
      return;
    }

    const validFiles = files.filter((file) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif'];
      const maxSize = 20 * 1024 * 1024;
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('문의 내용을 입력해 주세요.');
      return;
    }
    const phoneNumbers = phone.replace(/[^\d]/g, '');
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      alert('올바른 전화번호를 입력해 주세요.');
      return;
    }
    if (!agreePrivacy) {
      alert('개인정보 수집·이용에 동의해 주세요.');
      return;
    }
    alert('문의가 접수되었습니다. 빠른 시일 내에 문자로 답변 드리겠습니다.');
    setContent('');
    setImages([]);
    setPhone('');
    setAgreePrivacy(false);
  };

  return (
    <section ref={sectionRef} className="py-8 md:py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        {/* 헤더 */}
        <div className="text-center mb-8 fade-up">
          <p className="text-orange-500 font-medium mb-2">고객센터</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">무엇을 도와드릴까요?</h2>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex bg-white rounded-xl border border-gray-200 p-1 mb-8 fade-up" style={{ transitionDelay: '0.1s' }}>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'faq'
                ? 'bg-orange-500 text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            자주묻는질문
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'voice'
                ? 'bg-orange-500 text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            고객의 소리
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'faq' ? (
          /* 자주묻는질문 탭 */
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl border border-gray-200 overflow-hidden fade-up${index >= 3 ? ' hidden md:block' : ''}`}
                style={{ transitionDelay: `${(index + 2) * 0.1}s` }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-5 cursor-pointer text-left"
                >
                  <span className="font-medium text-gray-900">{item.q}</span>
                  <span className="text-xl text-gray-400 font-light transition-transform">
                    {openIndex === index ? '−' : '+'}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="px-5 pb-5 text-gray-600">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* 고객의 소리 탭 */
          <div>
          {/* 모바일: 고객센터 링크 버튼 */}
          <div className="md:hidden flex flex-col items-center gap-4 py-8">
            <p className="text-gray-600 text-center">문의사항이 있으신가요?</p>
            <Link
              href="/customer-service"
              className="inline-flex items-center justify-center bg-orange-500 text-white font-semibold px-8 py-4 rounded-xl hover:bg-orange-600 transition-colors"
            >
              고객센터로 문의하기
            </Link>
          </div>
          {/* PC: 기존 폼 */}
          <form onSubmit={handleSubmit} className="hidden md:block bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            {/* 문의 내용 */}
            <div className="mb-6">
              <label className="block text-gray-900 font-medium mb-2">
                문의 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 1000))}
                placeholder="문의하실 내용을 자세히 작성해 주세요."
                rows={5}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors resize-none sm:min-h-[200px]"
              />
              <p className="text-gray-400 text-sm mt-1">{content.length}/1000자</p>
            </div>

            {/* 이미지 첨부 */}
            <div className="mb-6">
              <label className="block text-gray-900 font-medium mb-2">
                이미지 첨부 (선택)
              </label>
              <div className="flex gap-3 flex-wrap">
                {images.map((image, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img
                      src={image.preview}
                      alt={`첨부 이미지 ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {images.length < 3 && (
                  <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    <span className="text-xs text-gray-400 mt-1">추가</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/bmp,image/gif"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-2">최대 3장 / 20MB 이하 / jpg, png, bmp, gif</p>
            </div>

            {/* 전화번호 입력 */}
            <div className="mb-6">
              <label className="block text-gray-900 font-medium mb-2">
                전화번호 <span className="text-red-500">*</span> <span className="text-gray-400 font-normal text-sm">(문자를 통해 답변을 드립니다.)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="010-0000-0000"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <p className="text-gray-400 text-xs mt-2">※ 문의 내용에 따라 답변까지 시간이 소요될 수 있습니다.</p>
            </div>

            {/* 개인정보 동의 */}
            <div className="mb-8">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">
                  문의 접수 및 답변 안내를 위해 개인정보 수집·이용에 동의합니다. <span className="text-red-500">(필수)</span>
                </span>
              </label>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              className="w-full bg-orange-500 text-white font-semibold py-4 rounded-xl hover:bg-orange-600 transition-colors"
            >
              문의 접수하기
            </button>
          </form>
          </div>
        )}
      </div>
    </section>
  );
}
