'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const painPoints = [
  {
    title: '무슨 말부터 꺼내야 할지 모르겠어요',
    body: '오랜만에 쓰는 편지는 첫 문장부터 막힙니다. 말하고 싶은 건 많은데, 쓰는 방식이 낯설면 시작조차 어려워져요.',
  },
  {
    title: '절차가 복잡하면 결국 미루게 돼요',
    body: '수신 정보, 우편 종류, 인쇄, 발송까지 챙길 게 많으면 마음보다 피로가 먼저 올라옵니다.',
  },
  {
    title: '전해지는지 알 수 없으면 더 불안해요',
    body: '쓴 편지가 어떻게 정리되고 언제 접수되는지 모르면 관계를 이어가는 일도 더 조심스러워집니다.',
  },
];

const serviceFlow = [
  {
    step: '01',
    title: '말하고 싶은 내용을 남깁니다',
    body: '직접 쓰셔도 되고, 음성으로 먼저 꺼내도 됩니다. 중요한 건 잘 쓰는 것이 아니라 마음을 꺼내는 일이에요.',
  },
  {
    step: '02',
    title: '편지답게 정리합니다',
    body: '흐름이 끊긴 문장, 어색한 표현, 막막한 첫 문장을 다듬어 읽히는 편지 형태로 정리합니다.',
  },
  {
    step: '03',
    title: '교정시설 기준에 맞춰 전달합니다',
    body: '수신자 정보, 우편 종류, 사진과 동봉 옵션까지 한 흐름으로 이어서 접수 전 단계까지 챙깁니다.',
  },
];

const principles = [
  {
    label: '01',
    title: '대신 쓰지 않습니다',
    body: '투오렌지는 사용자의 마음을 덮어쓰지 않고, 이미 있는 말을 더 또렷하게 전달되도록 정리합니다.',
  },
  {
    label: '02',
    title: '복잡함을 줄입니다',
    body: '낯선 절차를 서비스 안에서 하나의 흐름으로 묶어, 쓰는 사람의 에너지가 편지 내용에 남도록 설계합니다.',
  },
  {
    label: '03',
    title: '관계의 시간을 존중합니다',
    body: '한 통의 편지, 한 번의 안부, 출소 후를 준비하는 타임캡슐까지 관계가 이어지는 시간을 함께 다룹니다.',
  },
  {
    label: '04',
    title: '안전하게 보관합니다',
    body: '편지 내용과 기록은 서비스 안에서 안전하게 관리하고, 다시 돌아볼 수 있는 관계의 아카이브로 남깁니다.',
  },
];

const featurePanels = [
  {
    eyebrow: 'VOICE TO LETTER',
    title: '글이 막힐 땐, 말부터 꺼내면 됩니다',
    body: '직접 타이핑이 익숙하지 않은 사람도 음성으로 먼저 남기고 편지 형태로 정리할 수 있어요. 특히 부모님 세대나 시니어 사용자에게 이 차이가 큽니다.',
    points: ['30초 음성 입력 시작', '편지 문장 흐름 정리', '시작 문장 막힘 완화'],
    tone: 'from-[#fff4e8] via-[#ffe8cf] to-[#fffaf4]',
  },
  {
    eyebrow: 'TIME CAPSULE',
    title: '지금의 마음을, 미래의 만남까지 이어둡니다',
    body: '타임캡슐은 지금 바로 전하기 어려운 말이나 출소 후에 건네고 싶은 말을 미리 남겨두는 기능입니다. 단순 보관이 아니라 관계의 다음 장면을 준비하는 도구예요.',
    points: ['출소일 기준 메시지 준비', '여러 사람이 함께 참여', '미래 시점 감정 기록'],
    tone: 'from-[#fff8df] via-[#ffe9a8] to-[#fff5d1]',
  },
  {
    eyebrow: 'LETTER ARCHIVE',
    title: '편지는 보내고 끝나는 기록이 아니어야 하니까',
    body: '보낸 편지와 받은 편지를 함께 보관하면 관계의 시간축이 생깁니다. 투오렌지는 그 기록이 흩어지지 않도록 하나의 보관 흐름으로 묶습니다.',
    points: ['보낸/받은 편지 보관', '손편지 사진 정리', '관계 기록 누적'],
    tone: 'from-[#eef7f2] via-[#d9efe1] to-[#f7fbf8]',
  },
];

const experienceCards = [
  {
    title: '손편지와 인터넷 편지를 한 화면 안에서',
    body: '원본 사진, 정리된 텍스트, 발송 흐름을 따로 흩어두지 않고 하나의 기록처럼 다룹니다.',
    image: '/special-orange-img.png',
    accent: 'bg-[#fff4e8]',
  },
  {
    title: '타임캡슐은 지금보다 나중의 감정을 준비합니다',
    body: '함께 쓰는 메시지 방으로, 출소 이후에 열릴 관계의 장면을 미리 남겨둘 수 있어요.',
    image: '/timecapsule-orange-new.png',
    accent: 'bg-[#fff8df]',
  },
  {
    title: '선물과 추가 자료도 같은 흐름에서 관리',
    body: '사진, 동봉 자료, 선물 옵션을 편지 바깥의 업무가 아니라 전달 흐름 안의 선택으로 묶습니다.',
    image: '/gift-orange.png',
    accent: 'bg-[#eef7f2]',
  },
];

const metrics = [
  { value: '1문장', label: '첫 문장만 있어도 시작 가능' },
  { value: '3단계', label: '작성부터 접수까지 핵심 흐름' },
  { value: '365일', label: '기다리는 시간을 관계의 기록으로 전환' },
  { value: '1서비스', label: '편지, 타임캡슐, 보관을 한곳에서' },
];

const faqs = [
  {
    question: 'AI가 제 마음을 대신 쓰나요?',
    answer: '아니요. 사용자가 남긴 내용을 바탕으로 문장 흐름과 표현을 정리합니다. 핵심 감정과 메시지는 사용자의 것이어야 한다고 봅니다.',
  },
  {
    question: '타임캡슐은 일반 편지와 뭐가 다른가요?',
    answer: '즉시 보내는 편지보다 미래 시점을 위한 메시지 방에 가깝습니다. 지금 당장 전하지 못하는 마음을 보관했다가 나중에 열 수 있어요.',
  },
  {
    question: '왜 회사소개에 countdown이 있나요?',
    answer: '교정시설을 둘러싼 관계에서 가장 무거운 감각 중 하나가 시간이라서요. 투오렌지는 그 기다림을 그냥 버티는 시간이 아니라 준비하는 시간으로 바꾸고 싶습니다.',
  },
];

export default function AboutPage() {
  const [countdown, setCountdown] = useState(365);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 365 : prev - 1));
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = mainRef.current?.querySelectorAll('.fade-up');
    elements?.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <title>회사소개 - To Orange</title>

      <main ref={mainRef} className="bg-[#f8f5ef] text-slate-900">
        <section className="relative overflow-hidden border-b border-black/5 bg-[radial-gradient(circle_at_top,#ffe7c6_0%,#f8f5ef_42%,#f8f5ef_100%)] page-fade-first">
          <div className="absolute left-[-8%] top-20 h-56 w-56 rounded-full bg-[#ff9c5b]/10 blur-3xl" />
          <div className="absolute right-[-6%] top-12 h-64 w-64 rounded-full bg-[#ffcf86]/30 blur-3xl" />
          <div className="absolute bottom-[-3rem] left-1/2 h-40 w-40 -translate-x-1/2 rounded-full border border-[#ffb067]/30" />

          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-20 xl:px-28 xl:py-24">
            <div className="fade-up">
              <p className="text-xs font-semibold tracking-[0.34em] text-[#c96b2c] sm:text-sm">
                ABOUT TO-ORANGE
              </p>
              <h1 className="mt-5 max-w-3xl text-size-35-2 font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-size-48 lg:text-size-70-4">
                마음이 먼저 있고,
                <br />
                편지는 그다음에
                <br />
                따라와야 하니까.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                투오렌지는 교정시설에 편지를 보내는 과정을 더 인간적인 흐름으로 바꾸려는 서비스예요.
                마음은 분명한데 표현이 막힐 때, 절차가 번거로워 포기하게 될 때, 그 사이를 메우는 쪽을 맡습니다.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/letter/compose/1"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#f97316] px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-[#ea6a11] sm:h-14 sm:px-7 sm:text-base"
                >
                  편지 쓰러 가기
                </Link>
                <a
                  href="#story"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white/70 px-6 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-white sm:h-14 sm:px-7 sm:text-base"
                >
                  우리가 하는 일 보기
                </a>
              </div>
            </div>

            <div className="fade-up fade-up-delay-1">
              <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-[#111111] p-6 text-white shadow-[0_25px_70px_rgba(15,23,42,0.18)] sm:p-8">
                <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs tracking-[0.24em] text-white/50">TIME MATTERS</p>
                    <p className="mt-3 text-sm leading-6 text-white/70">
                      기다리는 시간은 멈춰 있는 시간이 아니라,
                      <br />
                      관계를 붙들고 있는 시간이기도 합니다.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-size-11 font-medium text-white/70">
                    COUNTDOWN
                  </span>
                </div>

                <div className="mt-10 flex items-end justify-between gap-4 border-t border-white/10 pt-8">
                  <div>
                    <p className="text-6xl font-semibold leading-none tracking-[-0.06em] text-[#ffb067] sm:text-7xl">
                      {countdown}
                    </p>
                    <p className="mt-3 text-sm text-white/70">일 후면, 다시 만날 수 있습니다</p>
                  </div>
                  <div className="max-w-[9rem] text-right text-xs leading-5 text-white/50 sm:max-w-[10rem] sm:text-sm">
                    끝이 있다는 사실이 버티는 힘이 되도록,
                    그 사이를 편지로 메우는 서비스.
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs tracking-[0.18em] text-white/45">RELATION</p>
                    <p className="mt-2 text-lg font-semibold">끊기지 않는 안부</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs tracking-[0.18em] text-white/45">DELIVERY</p>
                    <p className="mt-2 text-lg font-semibold">전달될 수 있는 형태</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="story" className="border-b border-black/5 bg-[#f4efe7] py-16 sm:py-20 lg:py-24 page-fade-second">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-20 xl:px-28">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
              <div className="fade-up">
                <p className="text-sm font-semibold tracking-[0.24em] text-[#c96b2c]">WHY WE EXIST</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                  마음보다
                  <br />
                  절차가 앞서는 순간을
                  <br />
                  줄이고 싶었습니다.
                </h2>
                <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
                  편지는 원래 가장 개인적인 말인데, 교정시설 맥락에 들어가면 갑자기 가장 낯선 업무처럼 느껴집니다.
                  투오렌지는 그 낯섦을 제품으로 덜어내려 합니다.
                </p>
              </div>

              <div className="grid gap-4">
                {painPoints.map((item, index) => (
                  <article
                    key={item.title}
                    className={`fade-up rounded-[1.75rem] border border-black/5 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:px-7 ${index === 1 ? 'sm:ml-10' : ''} ${index === 2 ? 'sm:ml-20' : ''}`}
                  >
                    <p className="text-xs font-semibold tracking-[0.2em] text-[#c96b2c]">ISSUE 0{index + 1}</p>
                    <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                      {item.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-20 xl:px-28">
            <div className="fade-up text-center">
              <p className="text-sm font-semibold tracking-[0.24em] text-[#c96b2c]">HOW IT WORKS</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                투오렌지는 세 가지 일을 합니다
              </h2>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {serviceFlow.map((item) => (
                <article
                  key={item.step}
                  className="fade-up rounded-[1.75rem] border border-black/5 bg-[#fff9f3] p-6 shadow-[0_18px_45px_rgba(249,115,22,0.08)]"
                >
                  <p className="text-sm font-semibold tracking-[0.24em] text-[#f97316]">{item.step}</p>
                  <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.03em] text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-black/5 bg-[#111111] py-16 text-white sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-20 xl:px-28">
            <div className="fade-up grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold tracking-[0.24em] text-[#ffb067]">SERVICE MAP</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                  편지 한 통을 둘러싼
                  <br />
                  실제 장면들을 다룹니다.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                투오렌지는 단순 작성 툴이 아니라, 쓰기 전 망설임부터 보내고 난 뒤의 기록까지 한 관계의 흐름을 제품 안에 두려 합니다.
              </p>
            </div>

            <div className="mt-10 grid gap-5">
              {featurePanels.map((panel) => (
                <article
                  key={panel.eyebrow}
                  className={`fade-up rounded-[2rem] bg-gradient-to-br ${panel.tone} p-6 text-slate-950 shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:p-8`}
                >
                  <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.22em] text-[#c96b2c]">{panel.eyebrow}</p>
                      <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-size-32">
                        {panel.title}
                      </h3>
                      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
                        {panel.body}
                      </p>
                    </div>
                    <div className="grid gap-2 sm:min-w-[14rem]">
                      {panel.points.map((point) => (
                        <div
                          key={point}
                          className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-slate-800"
                        >
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f8f5ef] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-20 xl:px-28">
            <div className="fade-up flex flex-col gap-4 text-center sm:text-left lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold tracking-[0.24em] text-[#c96b2c]">PRODUCT EXPERIENCE</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                  서비스는 결국
                  <br className="hidden sm:block" />
                  사용 장면에서 설명돼야 하니까
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                투오렌지는 감성적인 메시지만 말하지 않으려고 합니다. 실제로 편지를 쓰고, 보관하고,
                기다리고, 다시 꺼내보는 장면이 제품 안에서 이어져야 의미가 생기니까요.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <article className="fade-up overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
                <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-[#f97316]">LETTER FLOW</p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-size-32">
                      편지 작성이
                      <br />
                      서류 작업처럼 느껴지지 않도록
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                      작성, 미리보기, 사진 추가, 옵션 선택, 결제까지 각각의 작업을 하나의 서사처럼 이어지게 설계합니다.
                      중간에 막히는 순간을 줄이는 게 우리가 만드는 제품의 핵심이에요.
                    </p>

                    <div className="mt-6 grid gap-3">
                      <div className="rounded-2xl bg-[#fff7ef] px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">작성 흐름</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">받는 사람 선택부터 미리보기까지 한 흐름 안에서 연결</p>
                      </div>
                      <div className="rounded-2xl bg-[#f5f2ec] px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">보관 흐름</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">보낸 편지함과 손편지 기록이 흩어지지 않도록 정리</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-[1.5rem] border border-black/5 bg-[#f6efe5] p-4">
                    <img
                      src="/assets/letters/to-orange.png"
                      alt="투오렌지 편지 예시"
                      className="w-full rounded-[1.25rem] border border-black/5 object-cover shadow-[0_14px_40px_rgba(15,23,42,0.12)]"
                    />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white/90 px-4 py-3">
                        <p className="text-size-11 font-semibold tracking-[0.18em] text-[#c96b2c]">WRITE</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">마음을 먼저 남김</p>
                      </div>
                      <div className="rounded-2xl bg-white/90 px-4 py-3">
                        <p className="text-size-11 font-semibold tracking-[0.18em] text-[#c96b2c]">DELIVER</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">전달 가능한 형태로 정리</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <div className="grid gap-5">
                {experienceCards.map((card) => (
                  <article
                    key={card.title}
                    className={`fade-up overflow-hidden rounded-[1.75rem] border border-black/5 ${card.accent} p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)]`}
                  >
                    <div className="grid grid-cols-[1fr_120px] gap-4 sm:grid-cols-[1fr_152px] sm:gap-5">
                      <div>
                        <h3 className="text-lg font-semibold leading-tight tracking-[-0.03em] text-slate-950">
                          {card.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {card.body}
                        </p>
                      </div>
                      <div className="flex items-center justify-center">
                        <img
                          src={card.image}
                          alt={card.title}
                          className="max-h-[120px] w-full rounded-[1.25rem] object-contain"
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f8f5ef] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-20 xl:px-28">
            <div className="fade-up text-center">
              <p className="text-sm font-semibold tracking-[0.24em] text-[#c96b2c]">OUR PRINCIPLES</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                우리가 운영하는 기준
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {principles.map((principle) => (
                <article
                  key={principle.label}
                  className="fade-up rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                      {principle.title}
                    </h3>
                    <span className="text-sm font-semibold tracking-[0.2em] text-[#f97316]">
                      {principle.label}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                    {principle.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-black/5 bg-white py-12 sm:py-14">
          <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-20 xl:px-28">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="fade-up rounded-[1.5rem] border border-black/5 bg-[#fff6ee] px-5 py-5 text-center"
              >
                <p className="text-3xl font-semibold tracking-[-0.05em] text-[#f97316] sm:text-4xl">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-20">
            <div className="fade-up text-center">
              <p className="text-sm font-semibold tracking-[0.24em] text-[#c96b2c]">FAQ</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                자주 묻는 질문
              </h2>
            </div>

            <div className="mt-10 space-y-4">
              {faqs.map((faq, index) => (
                <article
                  key={faq.question}
                  className={`fade-up rounded-[1.75rem] border border-black/5 px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] ${index === 1 ? 'bg-[#fff9f3]' : 'bg-[#f7f7f4]'}`}
                >
                  <p className="text-base font-semibold text-slate-950 sm:text-lg">
                    Q. {faq.question}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#f97316_0%,#ff8f3a_42%,#ffbf72_100%)] py-16 sm:py-20 lg:py-24">
          <div className="absolute left-0 top-0 h-40 w-40 -translate-x-1/4 -translate-y-1/4 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-white/20 blur-2xl" />

          <div className="relative z-10 mx-auto max-w-5xl px-5 text-center sm:px-8">
            <p className="fade-up text-sm font-semibold tracking-[0.24em] text-white/72">
              READY TO START
            </p>
            <h2 className="fade-up mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-size-51-2">
              지금 전하고 싶은 말이 있다면,
              <br />
              투오렌지가 편지가 되는 자리까지
              <br />
              같이 갈게요.
            </h2>
            <p className="fade-up mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/84 sm:text-base">
              완벽한 문장이 아니어도 괜찮아요. 하고 싶은 말부터 남겨두면,
              그다음은 서비스가 더 덜 막막하게 만들겠습니다.
            </p>

            <div className="fade-up mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/letter/compose/1"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#f97316] transition-transform hover:-translate-y-0.5 hover:bg-[#fff5eb] sm:h-14 sm:px-7 sm:text-base"
              >
                편지 쓰기 시작
              </Link>
              <Link
                href="/customer-service"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:h-14 sm:px-7 sm:text-base"
              >
                문의하기
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
