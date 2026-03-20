import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddSenderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (sender: {
    name: string;
    phone: string;
    address: string;
    detailedAddress?: string;
  }) => void;
}

export function AddSenderModal({ open, onOpenChange, onAdd }: AddSenderModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !address.trim()) return;
    
    onAdd({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      detailedAddress: detailedAddress.trim() || undefined,
    });

    // Reset form
    setName("");
    setPhone("");
    setAddress("");
    setDetailedAddress("");
    onOpenChange(false);
  };

  const isValid = name.trim() && address.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-primary" />
            </div>
            새 주소 추가
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="senderName">이름 *</Label>
            <Input
              id="senderName"
              placeholder="보내는 분 이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderPhone">연락처</Label>
            <Input
              id="senderPhone"
              placeholder="연락처를 입력하세요 (선택)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderAddress">주소 *</Label>
            <Input
              id="senderAddress"
              placeholder="보내는 분 주소를 입력하세요"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderDetailedAddress">상세주소</Label>
            <Input
              id="senderDetailedAddress"
              placeholder="동/호수 등 상세주소를 입력하세요"
              value={detailedAddress}
              onChange={(e) => setDetailedAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            추가하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
