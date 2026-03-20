import { Tag, X, Clock, ChevronRight, Percent, Zap, Gift, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useDealStore } from "@/stores/useDealStore";
import { cn } from "@/lib/utils";

interface DealsContentProps {
  onClose?: () => void;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  expiryDate: string;
  type: "time-limited" | "quantity-limited" | "first-come";
  remainingQuantity?: number;
  icon: string;
  tags: string[];
}

// 목업 특가 데이터
const mockDeals: Deal[] = [
  {
    id: "1",
    title: "첫 편지 무료 발송",
    description: "처음 이용하시는 분께 첫 편지 발송을 무료로 드립니다.",
    originalPrice: 2000,
    discountPrice: 0,
    discountRate: 100,
    expiryDate: "2025-12-31",
    type: "first-come",
    icon: "🎁",
    tags: ["신규회원"],
  },
];

export function DealsContent({ onClose }: DealsContentProps) {
  const { appliedDeal, applyDeal, removeDeal } = useDealStore();

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR") + "원";
  };

  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTypeBadge = (type: Deal["type"]) => {
    switch (type) {
      case "time-limited":
        return <Badge className="bg-orange-100 text-orange-600 text-xs border-0"><Clock className="w-3 h-3 mr-1" />기간 한정</Badge>;
      case "quantity-limited":
        return <Badge className="bg-orange-100 text-orange-600 text-xs border-0"><Zap className="w-3 h-3 mr-1" />수량 한정</Badge>;
      case "first-come":
        return <Badge className="bg-orange-100 text-orange-600 text-xs border-0"><Gift className="w-3 h-3 mr-1" />선착순</Badge>;
    }
  };

  const handleApply = (deal: Deal) => {
    if (appliedDeal?.id === deal.id) {
      removeDeal();
      toast.info(`"${deal.title}" 쿠폰이 해제되었습니다.`);
    } else {
      applyDeal(deal);
      toast.success(`"${deal.title}" 쿠폰이 적용되었습니다. 결제 시 자동 할인됩니다.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="hidden md:flex h-14 border-b border-border/40 bg-white/80 backdrop-blur-sm items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Tag className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">특가 할인</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="hidden">
          편지함으로 돌아가기
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:py-10 lg:px-6">
        <div className="max-w-4xl mx-auto">
          {/* 타이틀 */}
          <div className="mb-8">
            <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-[18px]">
              투오렌지의 <span className="text-primary underline underline-offset-4">특별한 혜택</span>을 만나보세요
            </h2>
            <div className="mb-6">
              <p className="text-size-15 md:text-base text-muted-foreground leading-normal">
                편지 발송 시 사용할 수 있는 할인 혜택을 확인하세요.
                <br />
                아래에서 원하는 특가를 선택하고 적용하면 결제 시 자동으로 할인됩니다.
              </p>
            </div>
          </div>

        {/* 특가 목록 */}
        <div className="space-y-3">
          {mockDeals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border/60 p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* 아이콘 */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0">
                  {deal.icon}
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-foreground text-lg">{deal.title}</h4>
                    <Badge className="bg-red-500 text-white text-xs border-0 px-2">
                      {deal.discountRate}% OFF
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {deal.description}
                  </p>
                </div>

                {/* 버튼 */}
                <Button
                  className={cn("flex-shrink-0", appliedDeal?.id === deal.id ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90")}
                  onClick={() => handleApply(deal)}
                >
                  {appliedDeal?.id === deal.id ? '✓ 적용됨' : '적용하기'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 안내 문구 */}
        <div className="mt-8 p-4 bg-muted/50 rounded-xl">
          <h4 className="text-sm font-medium text-foreground mb-2">이용 안내</h4>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>• 할인 쿠폰은 결제 시 자동 적용됩니다.</li>
            <li>• 일부 특가는 중복 적용이 불가할 수 있습니다.</li>
          </ul>
        </div>
        </div>
      </div>
    </div>
  );
}
