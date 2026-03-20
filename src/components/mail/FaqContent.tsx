import { HelpCircle, X, ChevronDown, Search, Mail, Clock, Gift, CreditCard, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqContentProps {
  onClose?: () => void;
}

interface FaqCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
}

const categories: FaqCategory[] = [
  { id: "letter", name: "편지 발송", icon: Mail, color: "bg-gray-100" },
  { id: "delivery", name: "배송 안내", icon: Truck, color: "bg-gray-100" },
  { id: "payment", name: "결제/환불", icon: CreditCard, color: "bg-gray-100" },
  { id: "rewards", name: "경품/이벤트", icon: Gift, color: "bg-gray-100" },
  { id: "account", name: "계정/보안", icon: Shield, color: "bg-gray-100" },
  { id: "general", name: "일반 문의", icon: HelpCircle, color: "bg-gray-100" },
];

const faqItems: FaqItem[] = [
  {
    id: "1",
    question: "편지는 어떻게 전달되나요?",
    answer: "작성하신 편지는 당일 오후 4시 30분까지 접수된 건에 한해 다음 날 해당 교정시설로 발송됩니다. 배송은 보통 1-2일 정도 소요되며, 시설 내 검열 절차 후 수신자에게 전달됩니다.",
    categoryId: "letter",
  },
  {
    id: "2",
    question: "우편특급 서비스란 무엇인가요?",
    answer: "우편특급은 일반 발송보다 빠른 당일 발송 서비스입니다. 오후 4시 30분 이후에 작성해도 당일 발송되며, 수신자에게 더 빨리 전달됩니다.",
    categoryId: "delivery",
  },
  {
    id: "3",
    question: "결제 수단은 어떤 것이 있나요?",
    answer: "신용카드, 체크카드, 카카오페이, 네이버페이, 토스 등 다양한 결제 수단을 지원합니다. 편의점 결제도 가능합니다.",
    categoryId: "payment",
  },
  {
    id: "4",
    question: "이벤트 경품은 어떻게 사용하나요?",
    answer: "당첨된 경품은 '내가 받은 경품' 메뉴에서 확인할 수 있으며, 편지 발송 시 결제 단계에서 자동으로 적용됩니다. 유효기간 내에 사용해 주세요.",
    categoryId: "rewards",
  },
  {
    id: "5",
    question: "계정 비밀번호를 잊어버렸어요",
    answer: "로그인 페이지에서 '비밀번호 찾기'를 클릭하신 후, 가입 시 등록한 이메일로 비밀번호 재설정 링크를 받으실 수 있습니다.",
    categoryId: "account",
  },
  {
    id: "6",
    question: "편지 내용을 수정할 수 있나요?",
    answer: "발송 전 상태의 편지는 '임시보관함'에서 수정이 가능합니다. 단, 이미 발송된 편지는 수정이 불가능합니다.",
    categoryId: "letter",
  },
  {
    id: "7",
    question: "환불은 어떻게 받나요?",
    answer: "발송 전 취소한 편지에 대해서는 전액 환불이 가능합니다. 환불 요청은 '고객의 소리'를 통해 접수해 주시면 영업일 기준 3-5일 내에 처리됩니다.",
    categoryId: "payment",
  },
  {
    id: "8",
    question: "타임캡슐 기능은 무엇인가요?",
    answer: "타임캡슐은 여러 사람이 함께 편지를 모아 지정된 날짜에 한 번에 전달하는 서비스입니다. 출소일, 기념일 등 특별한 날에 감동을 전할 수 있습니다.",
    categoryId: "general",
  },
];

export function FaqContent({ onClose }: FaqContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqItems.filter((faq) => {
    const matchesCategory = !selectedCategory || faq.categoryId === selectedCategory;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-orange-50/50 to-amber-50/30 overflow-hidden">
      {/* Header */}
      <header className="hidden md:flex h-14 border-b border-border/40 bg-white/80 backdrop-blur-sm items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">자주 묻는 질문</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="hidden">
          편지함으로 돌아가기
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* 배너 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50/50 rounded-2xl p-5 mb-6 border border-orange-200/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-orange-500" />
            <Badge className="bg-orange-100 text-orange-600 text-xs border-0">FAQ</Badge>
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">
            무엇을 도와드릴까요?
          </h2>
          <p className="text-sm text-muted-foreground">
            자주 묻는 질문에서 빠르게 답을 찾아보세요.
          </p>
        </motion.div>

        {/* 검색 */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="질문 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 카테고리 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                className={`p-3 rounded-xl border transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border/60 bg-card hover:border-primary/30"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-xs font-medium text-foreground">{category.name}</p>
              </button>
            );
          })}
        </div>

        {/* FAQ 목록 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            {selectedCategory 
              ? `${categories.find(c => c.id === selectedCategory)?.name} 관련 질문`
              : "전체 질문"}
            <Badge variant="secondary" className="text-xs">{filteredFaqs.length}개</Badge>
          </h3>

          <Accordion type="single" collapsible className="space-y-2">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem value={faq.id} className="bg-card rounded-xl border border-border/60 px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="text-sm font-medium text-left">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 안내 문구 */}
        <div className="mt-6 p-4 bg-muted/50 rounded-xl">
          <h4 className="text-sm font-medium text-foreground mb-2">찾는 답이 없으신가요?</h4>
          <p className="text-xs text-muted-foreground">
            '고객의 소리'를 통해 문의해 주시면 빠르게 답변드리겠습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
