"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import useScrollAnimation from "@/hooks/useScrollAnimation";
import * as gtag from "@/lib/gtag";
import { apiFetch } from "@/lib/api/fetch";
import { useVisibleInterval } from "@/hooks/useVisibleInterval";
// [관리자 전용] 해제 시: isAdmin 관련 state/useEffect/if문 삭제, apiFetch import 제거
// fade-up에서 visible 클래스 제거, section 인라인 style={{ opacity:1, transform:'none' }} 제거

interface Feature {
  title: string;
  subTitle: string;
  desc: string;
  link: string;
  linkText: string;
  image: string;
}

const features: Feature[] = [
  {
    title: "타임캡슐",
    subTitle: "응원 릴레이 기능",
    desc: "참여방을 만들고 사람들을 초대해\n한 사람을 위한 응원의 쪽지를 이어가세요.",
    link: "/timecapsule",
    linkText: "자세히보기",
    image: "/special-timecapsule-img.png",
  },
  {
    title: "오렌지나무",
    subTitle: "편지 기록 시각화",
    desc: "보낸 편지 한 통이 잎이 되고,\n쌓인 기록은 하나의 나무가 됩니다.",
    link: "/orange-tree",
    linkText: "자세히보기",
    image: "/assets/videos/orange-tree.mp4",
  },

  {
    title: "손편지 담기",
    subTitle: "OCR 스캔 기능",
    desc: "손편지 사진을 올리면\nAI가 글씨를 읽어 텍스트로 저장해드려요.",
    link: "/scan-letter",
    linkText: "자세히보기",
    image: "/assets/videos/ocr.mp4",
  },
];

interface Notification {
  message: string;
  date: string;
}

// TimeCapsule Illustration
function TimeCapsuleIllust() {
  return (
    <div className="w-full h-[280px]">
      <div className="w-full h-full flex flex-col space-y-3">
        {/* Note collection status card */}
        <div className="bg-white rounded-[20px] p-4 border border-[#F6F6F6] shadow-[0_0_8px_0_#EFEFEF]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-gray-800">
              쪽지 모음 현황
            </span>
            <span className="text-orange-500 font-bold text-base">3/5통</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full animate-progress-fill" />
          </div>
          <p className="text-size-10 text-gray-500">
            목표까지 2통 남았어요. 조금만 더 모아볼까요?
          </p>
        </div>

        {/* Participants card */}
        <div className="bg-white rounded-[20px] p-4 border border-[#F6F6F6] shadow-[0_0_8px_0_#EFEFEF] flex-1">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-gray-800">참여자</span>
            <span className="text-orange-500 text-size-11 font-medium">
              + 초대하기
            </span>
          </div>

          <div className="space-y-2">
            <div
              className="flex items-center gap-2.5 animate-slide-in-up"
              style={{ animationDelay: "0.8s" }}
            >
              <div className="w-7 h-7 bg-yellow-100 rounded-full flex items-center justify-center text-sm">
                😊
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-size-11 font-semibold text-gray-800">
                    어머니
                  </span>
                  <span className="text-size-9 text-gray-400">배우자</span>
                </div>
                <span className="text-size-9 text-gray-400">
                  2025-01-02 작성
                </span>
              </div>
              <span className="text-size-9 text-green-500 bg-green-50 px-2 py-1 rounded font-medium flex items-center gap-0.5">
                <svg
                  className="w-2.5 h-2.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                작성완료
              </span>
            </div>

            <div
              className="flex items-center gap-2.5 animate-slide-in-up"
              style={{ animationDelay: "1.2s" }}
            >
              <div className="w-7 h-7 bg-yellow-100 rounded-full flex items-center justify-center text-sm">
                😄
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-size-11 font-semibold text-gray-800">
                    나
                  </span>
                  <span className="text-size-8 bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold">
                    본인
                  </span>
                  <span className="text-size-9 text-gray-400">자녀</span>
                </div>
                <span className="text-size-9 text-gray-400">
                  2025-01-05 작성
                </span>
              </div>
              <span className="text-size-9 text-green-500 bg-green-50 px-2 py-1 rounded font-medium flex items-center gap-0.5">
                <svg
                  className="w-2.5 h-2.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                작성완료
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tree SVG components
const treeImages = [
  { src: "/assets/trees/tree1.svg", alt: "새싹", width: 55, height: 66 },
  { src: "/assets/trees/tree2.svg", alt: "어린나무", width: 61, height: 96 },
  { src: "/assets/trees/tree3.svg", alt: "성장나무", width: 113, height: 137 },
  { src: "/assets/trees/tree4.svg", alt: "열매나무", width: 118, height: 156 },
];

// OrangeTree Illustration
function OrangeTreeIllust() {
  const [currentStage, setCurrentStage] = useState(0);
  const [notificationIndex, setNotificationIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const notifications: Notification[] = [
    { message: "아들에게 편지가 발송되었습니다.", date: "3일 전" },
    { message: "아들에게 편지가 도착했어요!", date: "7일 전" },
    { message: "아들에게 편지가 발송되었습니다.", date: "10일 전" },
    { message: "아들에게 편지가 도착했어요!", date: "15일 전" },
    { message: "아들에게 편지가 발송되었습니다.", date: "20일 전" },
    { message: "아들에게 편지가 도착했어요!", date: "25일 전" },
  ];

  useVisibleInterval(
    containerRef,
    () => {
      setCurrentStage((prev) => (prev + 1) % 4);
      setNotificationIndex((prev) => (prev + 1) % notifications.length);
    },
    2500,
  );

  return (
    <div ref={containerRef} className="w-full h-[280px]">
      <div className="w-full h-full flex flex-col justify-end space-y-3">
        {/* Tree illustration area */}
        <div className="bg-[#FFFDF6] rounded-2xl shadow-sm flex items-end justify-center relative overflow-hidden w-full flex-1">
          {/* Bottom curved background (fixed) */}
          <div className="absolute bottom-0 left-0 right-0 h-[70px]">
            <svg
              viewBox="0 0 390 70"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <ellipse cx="195" cy="70" rx="220" ry="70" fill="#F5DFC5" />
            </svg>
          </div>

          {/* Sign */}
          <img
            src="/assets/trees/sign.svg"
            alt="우리아들"
            className="absolute bottom-[20px] right-[15%]"
            style={{ width: "50px", height: "33px" }}
          />

          {/* 4-stage trees - fade transition */}
          {treeImages.map((tree, index) => (
            <div
              key={index}
              className="absolute bottom-[20px] left-1/2 -translate-x-1/2 transition-opacity duration-700 ease-in-out"
              style={{ opacity: currentStage === index ? 1 : 0 }}
            >
              <img
                src={tree.src}
                alt={tree.alt}
                style={{ width: tree.width, height: tree.height }}
              />
            </div>
          ))}

          {/* Orange basket (only shown at stage 4) */}
          <img
            src="/assets/trees/tree4-right-bucket.svg"
            alt="오렌지 바구니"
            className="absolute bottom-[20px] left-[12%] transition-opacity duration-500"
            style={{
              width: "45px",
              height: "37px",
              opacity: currentStage === 3 ? 1 : 0,
            }}
          />
        </div>

        {/* Bottom notification area */}
        <div className="bg-white rounded-[20px] p-4 border border-[#F6F6F6] shadow-[0_0_8px_0_#EFEFEF] overflow-hidden">
          <div
            key={notificationIndex}
            className="flex items-center gap-3 animate-notification-slide-up"
          >
            <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-orange-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-800">
                {notifications[notificationIndex].message}
              </p>
              <p className="text-size-10 text-gray-400 mt-0.5">
                {notifications[notificationIndex].date}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ScanLetter Illustration
function ScanLetterIllust() {
  return (
    <div className="w-full h-[280px]">
      <div className="w-full h-full flex flex-col space-y-3">
        {/* Sender input card */}
        <div
          className="bg-white rounded-[20px] p-3 border border-[#F6F6F6] shadow-[0_0_8px_0_#EFEFEF] animate-slide-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
            <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span className="text-size-10 text-gray-400">
              받는 사람 이름을 입력하세요
            </span>
          </div>
        </div>

        {/* Handwritten letter scan area */}
        <div
          className="bg-white rounded-[20px] p-3 border border-[#F6F6F6] shadow-[0_0_8px_0_#EFEFEF] animate-slide-in-up flex-1 flex flex-col"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-gray-800">손편지 담기</span>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-2 relative overflow-hidden flex-1 flex flex-col">
            <div className="bg-amber-50 rounded-lg p-2 relative flex-1">
              <div className="space-y-1.5">
                <div className="h-1 bg-gray-300 rounded w-4/5" />
                <div className="h-1 bg-gray-300 rounded w-full" />
                <div className="h-1 bg-gray-300 rounded w-3/5" />
                <div className="h-1 bg-gray-300 rounded w-4/5" />
                <div className="h-1 bg-gray-300 rounded w-4/5" />
                <div className="h-1 bg-gray-300 rounded w-full" />
                <div className="h-1 bg-gray-300 rounded w-3/5" />
                <div className="h-1 bg-gray-300 rounded w-4/5" />
                <div className="h-1 bg-gray-300 rounded w-4/5" />
                <div className="h-1 bg-gray-300 rounded w-full" />
              </div>
              <div className="absolute left-0 right-0 h-0.5 bg-orange-500 animate-scan-line" />
            </div>
            <p className="text-size-8 text-gray-400 mt-1.5 text-center">
              AI가 손글씨를 인식하고 있어요...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SpecialFeatures() {
  const sectionRef = useScrollAnimation<HTMLElement>();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    apiFetch("/api/v1/auth/profile")
      .then((r) => r.json())
      .then(({ data }) => setIsAdmin(data?.role?.toUpperCase() === "ADMIN"))
      .catch(() => setIsAdmin(false));
  }, []);

  // [관리자 전용] 해제하려면 아래 if문 삭제하고, fade-up에서 visible 제거, section의 인라인 style 제거
  if (!isAdmin) return null;

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20 bg-white"
      style={{ opacity: 1, transform: "none" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* [관리자 전용] 해제 시 "visible" 클래스 제거 → fade-up 애니메이션 복구 */}
        <div className="text-center mb-12 fade-up visible">
          <span className="text-orange-500 font-semibold text-sm md:text-base">
            Special Features
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
            마음을 전하는 특별한 기능
          </h2>
          <p className="text-gray-500 mt-3">
            자세히보기를 눌러 천천히 살펴보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            return (
              <Link
                key={index}
                href={feature.link}
                onClick={() =>
                  gtag.trackCtaClick(
                    feature.linkText,
                    `special_${feature.title}`,
                  )
                }
                className="group block fade-up visible" // [관리자 전용] 해제 시 "visible" 제거
                style={{ transitionDelay: `${(index + 1) * 0.1}s` }}
              >
                {/* 이미지 영역 */}

                {feature.image.startsWith("/assets/videos/") ? (
                  <video
                    src={feature.image}
                    autoPlay
                    loop
                    muted
                    className="w-full h-auto object-contain rounded-2xl bg-gray-50"
                  />
                ) : (
                  <div className="w-full rounded-2xl overflow-hidden bg-gray-50">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}

                {/* 텍스트 영역 */}
                <div className="mt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {feature.title}
                    </h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {feature.subTitle}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-5">
                    {feature.desc}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[#ffaa40] text-sm font-medium">
                    {feature.linkText}
                    <svg
                      className="w-[11px] h-[11px] transition-transform duration-300 group-hover:translate-x-1"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M1 1l4 4-4 4" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
