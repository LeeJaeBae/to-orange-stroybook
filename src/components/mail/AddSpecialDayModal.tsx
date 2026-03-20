import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Calendar, Tag, Bell, Home, Cake, Heart, Users, GraduationCap, Scale, Activity, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AddSpecialDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (day: SpecialDay) => void;
}

interface SpecialDay {
  id: string;
  type: string;
  title: string;
  date: string;
  description: string;
  reminder: boolean;
}

const dayTypes = [
  { id: "release", label: "출소일", icon: Home },
  { id: "birthday", label: "생일", icon: Cake },
  { id: "anniversary", label: "기념일", icon: Heart },
  { id: "visit", label: "면회", icon: Users },
  { id: "program", label: "교육/프로그램", icon: GraduationCap },
  { id: "trial", label: "재판", icon: Scale },
  { id: "health", label: "건강검진", icon: Activity },
  { id: "other", label: "기타 (직접입력)", icon: Edit3 },
];

export function AddSpecialDayModal({ isOpen, onClose, onAdd }: AddSpecialDayModalProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [reminder, setReminder] = useState(true);

  if (!isOpen) return null;

  // 선택된 유형의 라벨을 제목으로 사용 (기타인 경우 직접 입력값 사용)
  const getTitle = () => {
    if (selectedType === "other") {
      return customTitle;
    }
    const selectedDayType = dayTypes.find(t => t.id === selectedType);
    return selectedDayType?.label || "";
  };

  const handleSubmit = () => {
    if (!selectedType) {
      toast.warning("날짜 유형을 선택해주세요.");
      return;
    }
    if (selectedType === "other" && !customTitle.trim()) {
      toast.warning("날짜 이름을 입력해주세요.");
      return;
    }
    if (!date) {
      toast.warning("날짜를 선택해주세요.");
      return;
    }

    const newDay: SpecialDay = {
      id: Date.now().toString(),
      type: selectedType,
      title: getTitle(),
      date,
      description,
      reminder,
    };

    onAdd?.(newDay);
    toast.success("소중한 날이 추가되었습니다!");
    onClose();

    // Reset form
    setSelectedType("");
    setCustomTitle("");
    setDate("");
    setDescription("");
    setReminder(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-amber-400 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">새 날짜 추가</h2>
                <p className="text-sm text-white/80">소중한 날을 등록하세요</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* 날짜 유형 선택 */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Tag className="w-4 h-4 text-orange-500" />
              날짜 유형
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dayTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-orange-400 bg-orange-50 shadow-sm"
                        : "border-border/60 bg-white hover:border-orange-200"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                      <Icon className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? "text-orange-600" : "text-foreground"}`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 기타 선택 시 직접 입력 필드 */}
            {selectedType === "other" && (
              <div className="mt-3">
                <Input
                  placeholder="날짜 이름을 입력하세요"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="h-12 text-base border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* 날짜 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="w-4 h-4 text-orange-500" />
              날짜
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 text-base border-orange-200 focus:border-orange-400 focus:ring-orange-400"
            />
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              메모 (선택)
            </label>
            <Textarea
              placeholder="추가 메모를 입력하세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] text-base border-orange-200 focus:border-orange-400 focus:ring-orange-400 resize-none"
            />
          </div>

          {/* 알림 설정 */}
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">편지 발송 알림</p>
                  <p className="text-xs text-muted-foreground">7일 전, 3일 전, 당일에 알림을 받아요</p>
                </div>
              </div>
              <div 
                onClick={() => setReminder(!reminder)}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  reminder ? "bg-orange-400" : "bg-gray-300"
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  reminder ? "left-6" : "left-1"
                }`} />
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-border/40 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            날짜 추가하기
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
