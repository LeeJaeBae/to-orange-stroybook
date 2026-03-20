import { MessageSquare, X, Send, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FeedbackContentProps {
  onClose?: () => void;
}

interface FeedbackHistory {
  id: string;
  title: string;
  category: string;
  status: "pending" | "answered" | "resolved";
  createdAt: string;
  answer?: string;
}

const feedbackCategories = [
  { value: "service", label: "서비스 이용 문의" },
  { value: "payment", label: "결제/환불 문의" },
  { value: "delivery", label: "배송 관련 문의" },
  { value: "bug", label: "오류/버그 신고" },
  { value: "suggestion", label: "서비스 개선 제안" },
  { value: "other", label: "기타 문의" },
];

// 목업 문의 내역
const mockFeedbackHistory: FeedbackHistory[] = [
  {
    id: "1",
    title: "편지 발송 후 취소 문의",
    category: "service",
    status: "answered",
    createdAt: "2025-01-15",
    answer: "안녕하세요. 문의하신 건에 대해 답변드립니다. 발송 전 상태의 편지는 취소 가능하나, 이미 발송된 편지는 취소가 불가합니다.",
  },
  {
    id: "2",
    title: "결제 오류 발생",
    category: "payment",
    status: "resolved",
    createdAt: "2025-01-10",
  },
];

export function FeedbackContent({ onClose }: FeedbackContentProps) {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "history">("write");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !title || !content) {
      toast.warning("모든 필수 항목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    
    // 목업: 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.");
    setCategory("");
    setTitle("");
    setContent("");
    setIsSubmitting(false);
  };

  const getStatusBadge = (status: FeedbackHistory["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />답변 대기</Badge>;
      case "answered":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700"><MessageSquare className="w-3 h-3 mr-1" />답변 완료</Badge>;
      case "resolved":
        return <Badge variant="secondary" className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />처리 완료</Badge>;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-orange-50/50 to-amber-50/30 overflow-hidden">
      {/* Header */}
      <header className="hidden md:flex h-14 border-b border-border/40 bg-white/80 backdrop-blur-sm items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">고객의 소리</h1>
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
            <MessageSquare className="w-5 h-5 text-orange-500" />
            <Badge className="bg-orange-100 text-orange-600 text-xs border-0">문의하기</Badge>
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">
            소중한 의견을 들려주세요
          </h2>
          <p className="text-sm text-muted-foreground">
            서비스 이용 중 불편한 점이나 개선 사항을 알려주세요.
          </p>
        </motion.div>

        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "write" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("write")}
          >
            문의하기
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("history")}
          >
            문의 내역
            {mockFeedbackHistory.length > 0 && (
              <Badge className="ml-2 bg-primary/20 text-primary">{mockFeedbackHistory.length}</Badge>
            )}
          </Button>
        </div>

        {activeTab === "write" ? (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* 문의 유형 */}
            <div className="space-y-2">
              <Label htmlFor="category">문의 유형 *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="문의 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {feedbackCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                placeholder="문의 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* 내용 */}
            <div className="space-y-2">
              <Label htmlFor="content">문의 내용 *</Label>
              <Textarea
                id="content"
                placeholder="문의 내용을 상세히 작성해주세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>

            {/* 이메일 */}
            <div className="space-y-2">
              <Label htmlFor="email">답변 받을 이메일 (선택)</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                입력하시면 답변 시 이메일로 알림을 받으실 수 있습니다.
              </p>
            </div>

            {/* 제출 버튼 */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "접수 중..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  문의 접수하기
                </>
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              내 문의 내역
            </h3>

            {mockFeedbackHistory.length > 0 ? (
              <div className="space-y-3">
                {mockFeedbackHistory.map((feedback, index) => (
                  <motion.div
                    key={feedback.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-xl border border-border/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-medium text-foreground">{feedback.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {feedbackCategories.find(c => c.value === feedback.category)?.label} · {feedback.createdAt}
                        </p>
                      </div>
                      {getStatusBadge(feedback.status)}
                    </div>
                    {feedback.answer && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-blue-700 mb-1">답변</p>
                        <p className="text-sm text-foreground">{feedback.answer}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>문의 내역이 없습니다.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* 안내 문구 */}
        <div className="mt-6 p-4 bg-muted/50 rounded-xl">
          <h4 className="text-sm font-medium text-foreground mb-2">안내 사항</h4>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>• 문의 접수 후 영업일 기준 1-2일 내에 답변드립니다.</li>
            <li>• 긴급한 문의는 고객센터(1588-0000)로 연락해 주세요.</li>
            <li>• 욕설, 비방 등 부적절한 내용은 답변이 제한될 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
