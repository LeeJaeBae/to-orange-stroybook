import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Check, BookOpen, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { savedAddresses, type SavedAddress } from "@/data/facilities";

interface SenderInfo {
  name: string;
  phone: string;
  address: string;
}

interface SenderInfoStepProps {
  senderInfo: SenderInfo;
  setSenderInfo: (info: SenderInfo) => void;
  isRecipientComplete: boolean;
}

export function SenderInfoStep({
  senderInfo,
  setSenderInfo,
  isRecipientComplete,
}: SenderInfoStepProps) {
  const [expandedStep, setExpandedStep] = useState<number>(0);
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [addresses] = useState<SavedAddress[]>(savedAddresses);

  const isStep1Complete = senderInfo.name.trim() !== "" && senderInfo.phone.trim() !== "" && senderInfo.address.trim() !== "";

  const handleSelectAddress = (address: SavedAddress) => {
    setSenderInfo({
      name: address.name,
      phone: address.phone,
      address: address.address,
    });
    setShowAddressBook(false);
    setExpandedStep(0);
  };

  const StepHeader = ({ 
    step, 
    title, 
    isComplete, 
    isExpanded, 
    value,
    onClick,
    disabled = false
  }: { 
    step: number; 
    title: string; 
    isComplete: boolean; 
    isExpanded: boolean;
    value?: string;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-xl transition-all",
        disabled && "opacity-50 cursor-not-allowed",
        isExpanded ? "bg-primary/5" : "hover:bg-secondary/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium",
          isComplete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {isComplete ? <Check className="w-4 h-4" /> : step}
        </div>
        <span className={cn(
          "font-medium",
          isExpanded ? "text-primary" : "text-foreground"
        )}>
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {value && !isExpanded && (
          <span className="text-sm text-muted-foreground">{value}</span>
        )}
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-primary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
    </button>
  );

  if (!isRecipientComplete) {
    return (
      <div className="border border-border rounded-xl p-6 text-center text-muted-foreground">
        받는 사람 정보를 먼저 입력해주세요
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Step 1: 연락처 정보 */}
      <div className="border border-border rounded-xl overflow-hidden">
        <StepHeader
          step={1}
          title="연락처 정보"
          isComplete={isStep1Complete}
          isExpanded={expandedStep === 1}
          value={senderInfo.name || undefined}
          onClick={() => setExpandedStep(expandedStep === 1 ? 0 : 1)}
        />
        <AnimatePresence>
          {expandedStep === 1 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4">
                {/* 주소록에서 선택 버튼 */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddressBook(!showAddressBook)}
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    주소록에서 선택
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    새로 입력
                  </Button>
                </div>

                {/* 주소록 목록 */}
                <AnimatePresence>
                  {showAddressBook && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-secondary/30 rounded-xl p-3 space-y-2"
                    >
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 bg-background transition-all"
                        >
                          <p className="font-medium text-foreground">{addr.name}</p>
                          <p className="text-sm text-muted-foreground">{addr.phone}</p>
                          <p className="text-sm text-muted-foreground truncate">{addr.address}</p>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 입력 폼 */}
                <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">이름</label>
                      <Input
                        value={senderInfo.name}
                        onChange={(e) => setSenderInfo({ ...senderInfo, name: e.target.value })}
                        placeholder="이름을 입력하세요"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">연락처</label>
                      <Input
                        value={senderInfo.phone}
                        onChange={(e) => setSenderInfo({ ...senderInfo, phone: e.target.value })}
                        placeholder="- 없이 입력"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">주소</label>
                    <div className="flex gap-2">
                      <Input
                        value={senderInfo.address}
                        onChange={(e) => setSenderInfo({ ...senderInfo, address: e.target.value })}
                        placeholder="주소를 입력하세요"
                        className="flex-1"
                      />
                      <Button variant="secondary" className="shrink-0">
                        주소 찾기
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
