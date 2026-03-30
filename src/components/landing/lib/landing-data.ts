// apps/to-orange/src/features/landing/lib/landing-data.ts
import type {
  FaqItem, Stat, Step, DeliveryStep, Feature,
  InterviewItem, LetterPreview, FooterSection,
} from '../types';

export const stats: Stat[] = [
  { value: 12847, label: '전달 완료' },
  { value: 100, label: '교정시설 발송', suffix: '+' },
  { value: 3, label: '평균 도착 기간', suffix: '일' },
  { value: 4.8, label: '이용자 만족도', decimal: 1 },
];

export const faqItems: FaqItem[] = [
  {
    question: '비용은 얼마인가요?',
    answer: '기본 편지 1,800원(준등기)부터 시작합니다. 사진 동봉, 추가 콘텐츠 등 옵션에 따라 달라집니다.',
  },
  {
    question: '보내고 얼마나 걸리나요?',
    answer: '평균 3~5일 내 도착합니다. 교정시설은 내부 검열 절차에 따라 1~2일 추가될 수 있어요.',
  },
  {
    question: '수용자도 답장 보낼 수 있나요?',
    answer: '네, 손편지담기 기능으로 받은 편지를 사진 찍어 보관하고, 바로 답장도 작성할 수 있습니다.',
  },
  {
    question: '환불 가능한가요?',
    answer: '발송 전이라면 전액 환불 가능합니다. 발송 후에는 환불이 어렵습니다.',
  },
];

export const steps: Step[] = [
  { num: 1, title: '받는 사람', sub: '수신자 선택', details: ['주소록에서 빠르게 선택', '새 수신자 추가 가능', '우편 종류 선택'], isTag: true, image: '/main/steps/step-1.png' },
  { num: 2, title: '편지지', sub: '디자인 선택', details: ['기본', '상용', '디자이너', 'AI'], isTag: true, image: '/main/steps/step-2.png' },
  { num: 3, title: '편지 작성', sub: 'AI 도움', details: ['처음 인사', '중간 내용', '마무리'], isTag: true, highlight: true, image: '/main/steps/step-3.png' },
  { num: 4, title: '사진출력', sub: '사진 인화', details: ['최대 6장', '고화질 인화', '편지와 함께 동봉'], isTag: true, image: '/main/steps/step-4.png' },
  { num: 5, title: '미리보기', sub: '말투 변환', details: ['친근하게', '격식체', '엄마 말투', '친구 말투'], isTag: true, image: '/main/steps/step-5.png' },
  { num: 6, title: '추가옵션', sub: '콘텐츠 동봉', details: ['월간 식단표', '영화 편성표', '유머', '스도쿠'], isTag: true, image: '/main/steps/step-6.png' },
];

export const deliverySteps: DeliveryStep[] = [
  { num: 1, title: '인쇄(출력)', sub: '고품질 출력', details: ['선택한 편지지 디자인에 맞춰 전용 인쇄소에서 고해상도로 출력합니다.', '편지가 깨끗하고 선명하게 전달되도록 전 과정에서 품질을 관리합니다.'], image: '/main/steps/print.png' },
  { num: 2, title: '동봉 작업', sub: '정성 포장', details: ['사진, 향기, 작은 선물 등 선택한 항목을 함께 담아 준비합니다.', '바깥세상을 떠올릴 수 있는 통로가 흐트러지지 않도록 정성스럽게 동봉합니다.'], image: '/main/steps/package.png' },
  { num: 3, title: '우체국 접수·발송', sub: '정식 발송', details: ['편지는 우체국을 통해 등기우편으로 정식 접수되어 발송됩니다.', '교정시설 반입 규정에 맞춰 처리되며, 발송 완료 시 알림톡으로 안내드립니다.'], image: '/main/steps/postoffice.png' },
  { num: 4, title: '배송 추적 안내', sub: '실시간 확인', details: ['우체국 배송 시스템을 통해 편지의 이동 과정을 확인할 수 있습니다.', '접수 → 배송 → 도착까지의 과정을 사용자가 직접 확인할 수 있습니다.'], image: '/main/steps/tracking.png' },
];

export const features: Feature[] = [
  { title: '타임캡슐', subTitle: '응원 릴레이 기능', description: '참여방을 만들고 사람들을 초대해\n한 사람을 위한 응원의 쪽지를 이어가세요.', link: '/timecapsule', linkText: '자세히보기', image: '/special-timecapsule-img.png' },
  { title: '오렌지나무', subTitle: '편지 기록 시각화', description: '보낸 편지 한 통이 잎이 되고,\n쌓인 기록은 하나의 나무가 됩니다.', link: '/orange-tree', linkText: '자세히보기', image: '/assets/videos/orange-tree.mp4' },
  { title: '손편지 담기', subTitle: 'OCR 스캔 기능', description: '손편지 사진을 올리면\nAI가 글씨를 읽어 텍스트로 저장해드려요.', link: '/scan-letter', linkText: '자세히보기', image: '/assets/videos/ocr.mp4' },
];

export const interviews: InterviewItem[] = [
  { title: '월간식단표', subtitle: '달력형, 2개월치 식단 정보', image: '/main/interview/sikdanpyo.jpg', author: '김OO씨', age: 38, detail: '3년수감 2024년 출소', lines: ['미리 알 수 있다는 것만으로도', '하루를 준비하는 기준이 생깁니다.', '뭘 먹을지 알면 그날이 기다려져요.'], duration: 4 },
  { title: '스도쿠', subtitle: '두뇌 훈련 게임', image: '/main/interview/sudoku.png', author: '김OO씨', age: 37, detail: '3년수감 2024년 출소', lines: ['머리 안 쓰면 진짜 굳어요.', '그거 풀면서 버텼어요.', '놀이가 아닌 생존방법이죠.'], duration: 4 },
  { title: '보라미 영화', subtitle: 'TV 시청 편성표', image: '/main/interview/movie.png', author: '이OO씨', age: 42, detail: '4년수감 2023년 출소', lines: ['기다릴 수 있는 무언가가 있다는 건', '시간을 버티는 힘이 됩니다.', '영화 뭐 하는지 아는 게 소소한 행복이에요.'], duration: 4 },
  { title: '가석방 계산기', subtitle: '형기/점수 관리 시뮬레이션', image: '/main/interview/calculator.png', author: '최OO씨', age: 41, detail: '4년수감 2023년 출소', lines: ['나가는 날을 알고 나서부터', '준비할 수 있었어요.', '날짜가 생기니까 계획이 생기더라고요.'], duration: 4 },
  { title: '최신유머', subtitle: '웃음을 선물하세요', image: '/main/interview/phone.png', author: '박OO씨', age: 45, detail: '5년수감 2023년 출소', lines: ['유머책 하나로 방 전체가 돌려봤어요.', '웃을 일이 있어야 하루가 가요.', '그거 없으면 진짜 아무 말도 안 해요.'], duration: 4 },
  { title: '직업훈련 안내', subtitle: '자격증 취득 정보', image: '/main/interview/news.jpg', author: '정OO씨', age: 33, detail: '3년수감 2024년 출소', lines: ['나가자마자 일하려면 안에서 미리 따야 해요.', '바깥에서 뭐가 필요한지 알아야 준비를 하죠.', '그 정보가 없으면 막막해요.'], duration: 4 },
];

export const letterPreviews: LetterPreview[] = [
  { id: 1, preview: '오늘 하루도 수고했어요...', date: '2025.12.22' },
  { id: 2, preview: '보고 싶은 마음을 담아...', date: '2025.12.15' },
  { id: 3, preview: '처음 만났던 그 날처럼...', date: '2025.12.08' },
  { id: 4, preview: '항상 고마워요...', date: '2025.12.01' },
];

export const footerSections: FooterSection[] = [
  { title: 'To-orange', content: '대구광역시 수성구 희망로 36길 112-15, 1층\n투오렌지 주식회사 | 김희은\n543-81-03600\n2026-대구수성구-0091' },
  { title: '서비스', links: [{ text: '편지쓰기', url: '/letter/compose/1' }, { text: '받은편지함', url: '/letter' }] },
  { title: '고객지원', links: [{ text: '이용가이드', url: '/faq' }, { text: '공지사항', url: '/notice' }, { text: '고객센터', url: '/customer-service' }, { text: '환불정책', url: '/refund-policy' }, { text: '이용약관', url: '/terms' }, { text: '개인정보처리방침', url: '/privacy' }] },
  { title: '문의사항', content: 'CS@toorange.co.kr\n1544-7433' },
];

export const ctaContent = {
  title: '오늘, 한 통 보내볼까요?',
  subtitle: '처음 쓰는 편지도, 매주 보내는 안부도, 특별한 날도',
  buttonText: '편지 쓰러 가기',
  buttonLink: '/letter/compose/1',
};
