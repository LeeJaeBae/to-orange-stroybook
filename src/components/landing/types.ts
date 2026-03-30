// apps/to-orange/src/features/landing/types.ts

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Stat {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  decimal?: number;
}

export interface Step {
  num: number;
  title: string;
  sub: string;
  details: string[];
  isTag?: boolean;
  highlight?: boolean;
  image: string;
}

export interface DeliveryStep {
  num: number;
  title: string;
  sub: string;
  details: string[];
  image: string;
}

export interface Feature {
  title: string;
  subTitle: string;
  description: string;
  link: string;
  linkText: string;
  image: string;
}

export interface InterviewItem {
  title: string;
  subtitle: string;
  image: string;
  author: string;
  age: number;
  detail: string;
  lines: string[];
  duration: number;
}

export interface LetterPreview {
  id: number;
  preview: string;
  date: string;
}

export interface FooterSection {
  title: string;
  content?: string;
  links?: { text: string; url: string }[];
}

// HeroSection 전용
export interface AIDemoData {
  before: string;
  after: string;
}

export interface BadgeConfig {
  type: 'relation' | 'event' | 'care' | 'custom';
  label: string;
}
