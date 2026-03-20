import { ChevronDown, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CustomerServiceContentProps {
  onClose?: () => void;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    id: "1",
    question: "[편지발송] 편지를 보내면 수용자에게 언제 도착하나요?",
    answer: "편지 발송 후 교정시설 검열 과정을 거쳐 약 3~7일 내에 수용자에게 전달됩니다. 시설 상황에 따라 다소 지연될 수 있습니다.",
  },
  {
    id: "2",
    question: "[편지발송] 편지에 사진을 동봉할 수 있나요?",
    answer: "네, 편지 작성 시 '사진 동봉' 옵션을 선택하시면 최대 5장까지 사진을 함께 보내실 수 있습니다. 단, 교정시설 규정에 따라 일부 사진은 전달이 제한될 수 있습니다.",
  },
  {
    id: "3",
    question: "[편지발송] 손편지를 스캔해서 보낼 수 있나요?",
    answer: "네, '손편지 업로드' 기능을 통해 직접 쓴 손편지를 촬영하거나 스캔하여 발송하실 수 있습니다. 자동 OCR 기능으로 텍스트 변환도 지원됩니다.",
  },
  {
    id: "4",
    question: "[수신자등록] 수신자(수용자) 정보는 어떻게 등록하나요?",
    answer: "'소중한 사람' 메뉴에서 수용자의 이름, 수용 시설, 수용번호를 입력하여 등록하실 수 있습니다. 정확한 정보를 입력해 주셔야 편지가 정상적으로 전달됩니다.",
  },
  {
    id: "5",
    question: "[수신자등록] 수용자의 수용번호를 모르면 어떻게 하나요?",
    answer: "수용번호는 해당 교정시설에 직접 문의하시거나, 수용자가 발송한 편지에서 확인하실 수 있습니다. 수용번호 없이는 편지 발송이 어려울 수 있습니다.",
  },
  {
    id: "6",
    question: "[결제/환불] 편지 발송 후 취소하고 환불받을 수 있나요?",
    answer: "편지가 인쇄 및 발송 전 단계('접수완료' 상태)까지는 취소 및 환불이 가능합니다. '우체국 접수' 이후에는 취소가 불가능하오니 참고 부탁드립니다.",
  },
  {
    id: "7",
    question: "[결제/환불] 사용 가능한 결제 수단은 무엇인가요?",
    answer: "신용/체크카드, 카카오페이, 네이버페이, 휴대폰 결제 등 다양한 결제 수단을 지원합니다. 적립금도 함께 사용하실 수 있습니다.",
  },
  {
    id: "8",
    question: "[오렌지나무] 오렌지 나무는 무엇인가요?",
    answer: "오렌지 나무는 소중한 사람과 주고받은 편지 수에 따라 성장하는 특별한 기능입니다. 편지를 주고받을수록 나무가 자라고, 특별한 날에는 열매가 열립니다.",
  },
  {
    id: "9",
    question: "[타임캡슐] 타임캡슐 편지는 언제 전달되나요?",
    answer: "타임캡슐 편지는 설정하신 날짜(예: 출소 예정일, 기념일 등)에 맞춰 자동으로 발송됩니다. 미리 작성해 두시면 특별한 날 마음을 전할 수 있습니다.",
  },
  {
    id: "10",
    question: "[계정] 회원 탈퇴는 어떻게 하나요?",
    answer: "마이페이지 > 설정 > 회원 탈퇴에서 진행하실 수 있습니다. 탈퇴 시 보관된 편지와 오렌지 나무 데이터는 복구가 불가능하오니 신중히 결정해 주세요.",
  },
  {
    id: "11",
    question: "[경품] 이벤트 경품은 어떻게 받나요?",
    answer: "이벤트 당첨 시 등록된 연락처로 안내 문자가 발송됩니다. '내가 받은 경품' 메뉴에서 당첨 내역을 확인하고 배송지를 입력해 주시면 됩니다.",
  },
];

// 문의 유형 옵션
const inquiryTypes = [
  { value: "", label: "문의 유형을 선택해 주세요" },
  { value: "delivery", label: "배송 문의" },
  { value: "payment", label: "결제/환불 문의" },
  { value: "letter", label: "편지 발송 문의" },
  { value: "account", label: "계정/회원 문의" },
  { value: "event", label: "이벤트/경품 문의" },
  { value: "suggestion", label: "서비스 건의/제안" },
  { value: "other", label: "기타 문의" },
];

// 답변 방법 옵션
const responseOptions = [
  { value: "history", label: "문의내역에서 확인" },
  { value: "phone", label: "전화" },
  { value: "sms", label: "문자" },
  { value: "none", label: "답변 불필요" },
];

export function CustomerServiceContent({ onClose }: CustomerServiceContentProps) {
  const [activeTab, setActiveTab] = useState<"faq" | "feedback">("faq");

  // 고객의 소리 상태
  const [inquiryType, setInquiryType] = useState("");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [responseMethod, setResponseMethod] = useState("history");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 업로드 핸들러
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (images.length + newFiles.length >= 3) return;
      if (file.size > 20 * 1024 * 1024) {
        alert("파일 크기는 20MB 이하만 가능합니다.");
        return;
      }
      if (!["image/jpeg", "image/png", "image/bmp", "image/gif"].includes(file.type)) {
        alert("jpg, png, bmp, gif 파일만 업로드 가능합니다.");
        return;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setImages((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  // 이미지 삭제 핸들러
  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 문의 제출 핸들러
  const handleSubmit = () => {
    if (!inquiryType) {
      alert("문의 유형을 선택해 주세요.");
      return;
    }
    if (!feedbackContent.trim()) {
      alert("문의 내용을 입력해 주세요.");
      return;
    }
    // TODO: 실제 제출 로직
    alert("문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.");
    setInquiryType("");
    setFeedbackContent("");
    setResponseMethod("history");
    setImages([]);
    setImagePreviews([]);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="hidden md:flex h-14 border-b border-border/40 bg-white/80 backdrop-blur-sm items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-foreground">고객센터</h1>
        <Button variant="ghost" size="sm" onClick={onClose} className="hidden">
          편지함으로 돌아가기
        </Button>
      </header>

      {/* Tabs */}
      <div className="border-b border-border/40 bg-white/50">
        <div className="flex px-6">
          <button
            onClick={() => setActiveTab("faq")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "faq"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            자주 묻는 질문
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "feedback"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            고객의 소리
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:py-10 lg:px-6">
        <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "faq" ? (
            <motion.div
              key="faq"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* 타이틀 */}
              <div className="mb-8">
                <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-[18px]">
                  무엇이든 <span className="text-primary underline underline-offset-4">물어보세요</span>
                </h2>
                <div className="mb-6">
                  <p className="text-size-15 md:text-base text-muted-foreground leading-normal">
                    자주 묻는 질문을 모았습니다.
                    <br />
                    찾으시는 답변이 없다면 '고객의 소리'를 이용해 주세요.
                  </p>
                </div>
              </div>

              {/* FAQ 목록 - 심플한 리스트 형태 */}
              <div className="border-y border-border divide-y divide-border">
                {faqItems.map((faq) => (
                  <Accordion key={faq.id} type="single" collapsible>
                    <AccordionItem value={faq.id} className="border-0">
                      <AccordionTrigger className="hover:no-underline py-5 px-0">
                        <div className="flex items-start gap-4 text-left">
                          <span className="text-primary font-bold text-base shrink-0">Q</span>
                          <span className="text-sm text-foreground">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 pl-8">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* 타이틀 */}
              <div className="mb-8">
                <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-[18px]">
                  투오렌지의 중심은 항상 <span className="text-primary underline underline-offset-4">고객님</span>입니다.
                </h2>
                <div className="mb-6">
                  <p className="text-size-15 md:text-base text-muted-foreground leading-normal">
                    투오렌지를 이용하면서 느끼신 불편사항이나 바라는 점을 알려주세요.
                    <br />
                    고객님의 소중한 의견으로 한 뼘 더 자라는 투오렌지가 되겠습니다.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  문의량이 많아 답변은 24시간 이상 소요될 수 있습니다.
                </p>
              </div>

              {/* 문의 폼 */}
              <div className="bg-card rounded-xl border border-border/60 p-5 space-y-5">
                {/* 문의 유형 */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    문의 유형 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm border border-border/60 rounded-lg bg-background hover:border-primary/30 transition-colors"
                    >
                      <span className={inquiryType ? "text-foreground" : "text-muted-foreground"}>
                        {inquiryTypes.find(t => t.value === inquiryType)?.label || "문의 유형을 선택해 주세요"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isTypeDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-card border border-border/60 rounded-lg shadow-lg z-10">
                        {inquiryTypes.slice(1).map((type) => (
                          <button
                            key={type.value}
                            onClick={() => {
                              setInquiryType(type.value);
                              setIsTypeDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-sm text-left hover:bg-muted first:rounded-t-lg last:rounded-b-lg ${
                              inquiryType === type.value ? 'bg-primary/10 text-primary' : 'text-foreground'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 문의 내용 */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    문의 내용 <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    placeholder="문의하실 내용을 자세히 작성해 주세요."
                    className="min-h-[150px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {feedbackContent.length}/1000자
                  </p>
                </div>

                {/* 이미지 첨부 */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    이미지 첨부 (선택)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/60">
                        <img src={preview} alt={`첨부 ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {images.length < 3 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-border/60 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                      >
                        <ImagePlus className="w-5 h-5 mb-1" />
                        <span className="text-size-10">추가</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/bmp,image/gif"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    최대 3장 / 20MB 이하 / jpg, png, bmp, gif
                  </p>
                </div>

                {/* 답변 받을 방법 */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    답변 받을 방법
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {responseOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                          responseMethod === option.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/60 bg-background text-foreground hover:border-primary/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="responseMethod"
                          value={option.value}
                          checked={responseMethod === option.value}
                          onChange={(e) => setResponseMethod(e.target.value)}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          responseMethod === option.value ? "border-primary" : "border-muted-foreground"
                        }`}>
                          {responseMethod === option.value && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 제출 버튼 */}
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  문의 접수하기
                </Button>
              </div>

              {/* 안내 문구 */}
              <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                <h4 className="text-sm font-medium text-foreground mb-2">문의 전 확인해 주세요</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• '자주 묻는 질문' 탭에서 빠르게 답을 찾을 수 있습니다.</li>
                  <li>• 개인정보(주민번호, 계좌번호 등)는 입력하지 마세요.</li>
                  <li>• 욕설, 비방 등 부적절한 내용은 답변이 제한될 수 있습니다.</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
