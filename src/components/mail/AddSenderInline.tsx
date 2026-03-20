'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Plus,
  X,
  Search,
  User,
  Phone,
  MapPin,
  Loader2,
  ShieldCheck,
  CheckCircle,
  Calendar
} from "lucide-react";
import { AddressSearch, type AddressResult } from "@/components/ui/AddressSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSenderAddresses } from "@/hooks/useSenderAddresses";

interface AddSenderInlineProps {
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onAdd: (sender: {
    name: string;
    gender?: 'male' | 'female';
    phone: string;
    birthDate?: string;
    address: string;
    detailedAddress?: string;
    postCode?: string;
    isDefault?: boolean;
  }) => Promise<{ id: string } | null | undefined>;
  isLoading?: boolean;
  editingSenderId?: string | null;
}

export function AddSenderInline({
  isExpanded,
  onExpandedChange,
  onAdd,
  isLoading = false,
  editingSenderId,
}: AddSenderInlineProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<'male' | 'female' | ''>("");
  const [phone, setPhone] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [address, setAddress] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [postCode, setPostCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const birthMonths = Array.from({ length: 12 }, (_, i) => i + 1);
  const birthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const { senderAddresses } = useSenderAddresses();

  useEffect(() => {
    if (!isExpanded) {
      resetForm();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (editingSenderId && isExpanded) {
      const sender = senderAddresses.find(s => s.id === editingSenderId);
      if (sender) {
        setName(sender.name || '');
        setPhone(sender.phone || '');
        if ((sender as any).birthDate) {
          const [y, m, d] = (sender as any).birthDate.split('-');
          setBirthYear(y || '');
          setBirthMonth(String(parseInt(m)) || '');
          setBirthDay(String(parseInt(d)) || '');
        }
        setAddress(sender.address || '');
        setDetailedAddress(sender.detailedAddress || '');
        setPostCode(sender.postCode || '');
        setPhoneVerified(!!(sender as any).phoneVerified);
      }
    }
  }, [editingSenderId, isExpanded, senderAddresses]);

  const resetForm = () => {
    setName("");
    setGender("");
    setPhone("");
    setBirthYear("");
    setBirthMonth("");
    setBirthDay("");
    setAddress("");
    setDetailedAddress("");
    setPostCode("");
    setIsDefault(false);
    setIsPostcodeOpen(false);
    setVerificationSent(false);
    setVerificationCode("");
    setPhoneVerified(false);
  };

  const handleAddressSelect = (result: AddressResult) => {
    setPostCode(result.zipNo);
    setAddress(result.roadAddr);
    setIsPostcodeOpen(false);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim()) return;
    if (phone.trim() && !phoneVerified) {
      alert('연락처 인증을 완료해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const birthDate = birthYear && birthMonth && birthDay
        ? `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`
        : undefined;

      await onAdd({
        name: name.trim(),
        gender: gender || undefined,
        phone: phone.trim(),
        birthDate,
        address: address.trim(),
        detailedAddress: detailedAddress.trim() || undefined,
        postCode: postCode || undefined,
        isDefault,
      });

      resetForm();
      onExpandedChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = name.trim() && phone.trim() && address.trim() && phoneVerified;

  return (
    <div className="w-full">
      {!isExpanded && (
        <button
          onClick={() => onExpandedChange(true)}
          className="w-full p-3 border border-dashed border-border/60 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/40 hover:text-primary"
        >
          <Plus className="w-4 h-4" />
          <span>{editingSenderId ? '주소 수정' : '새 주소 추가'}</span>
        </button>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {/* 이름 + 성별 */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-orange-500" />
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setGender(gender === 'male' ? '' : 'male')}
                    className={cn(
                      "px-2 py-1.5 rounded-md text-xs font-medium border transition-all",
                      gender === 'male'
                        ? "bg-white text-orange-600 border-orange-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                    )}
                  >
                    남
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender(gender === 'female' ? '' : 'female')}
                    className={cn(
                      "px-2 py-1.5 rounded-md text-xs font-medium border transition-all",
                      gender === 'female'
                        ? "bg-white text-orange-600 border-orange-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                    )}
                  >
                    여
                  </button>
                </div>

                <Input
                  placeholder="보내는 분 이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-32 h-9 text-sm placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all"
                />

                {/* 생년월일 */}
                <div className="flex gap-1 flex-1">
                  <Select value={birthYear} onValueChange={setBirthYear}>
                    <SelectTrigger className="h-9 text-sm border-gray-200">
                      <SelectValue placeholder="생년" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50 max-h-60">
                      {birthYears.map((year) => (
                        <SelectItem key={year} value={String(year)}>{year}년</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={birthMonth} onValueChange={setBirthMonth}>
                    <SelectTrigger className="h-9 text-sm border-gray-200">
                      <SelectValue placeholder="월" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {birthMonths.map((month) => (
                        <SelectItem key={month} value={String(month)}>{month}월</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={birthDay} onValueChange={setBirthDay}>
                    <SelectTrigger className="h-9 text-sm border-gray-200">
                      <SelectValue placeholder="일" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {birthDays.map((day) => (
                        <SelectItem key={day} value={String(day)}>{day}일</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 연락처 + 인증 + 문구 */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-orange-500" />
                </div>
                <Input
                  placeholder="연락처를 입력하세요"
                  value={phone}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    let formatted = raw;
                    if (raw.length <= 3) {
                      formatted = raw;
                    } else if (raw.length <= 7) {
                      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
                    } else {
                      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
                    }
                    setPhone(formatted);
                  }}
                  maxLength={13}
                  className="w-[12.25rem] h-9 text-sm placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all"
                />
                {phoneVerified ? (
                  <div className="h-9 px-2 flex items-center gap-1 text-xs text-green-600 font-medium flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" />
                    인증완료
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="h-9 px-3 text-xs flex-shrink-0"
                    onClick={async () => {
                      if (!phone.trim()) return;
                      setIsVerifying(true);
                      try {
                        await fetch('/api/v1/verification/send', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ phone: phone.trim() }),
                        });
                        setVerificationSent(true);
                      } catch (e) {
                        console.error('인증 발송 실패:', e);
                      } finally {
                        setIsVerifying(false);
                      }
                    }}
                    disabled={!phone.trim() || isVerifying}
                  >
                    {isVerifying ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        인증
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* 인증코드 입력 */}
              {verificationSent && (
                <div className="flex items-center gap-2 ml-11">
                  <Input
                    placeholder="인증번호 6자리"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="w-[12.25rem] h-9 text-sm placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all"
                  />
                  <Button
                    variant="outline"
                    className="h-9 px-3 text-xs flex-shrink-0"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/v1/verification/verify', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ phone: phone.trim(), code: verificationCode }),
                        });
                        if (res.ok) {
                          setVerificationSent(false);
                          setPhoneVerified(true);
                        } else {
                          alert('인증번호가 일치하지 않습니다.');
                        }
                      } catch (e) {
                        console.error('인증 확인 실패:', e);
                      }
                    }}
                    disabled={verificationCode.length < 6}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    확인
                  </Button>
                </div>
              )}

              {/* 주소 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-orange-500" />
                  </div>
                  <Input
                    placeholder="* 받는사람 부재시 보낸사람 주소로 편지가 반송 처리 되오니 정확한 주소입력을 바랍니다."
                    value={postCode}
                    readOnly
                    className="h-9 text-sm flex-1 placeholder:text-gray-400 transition-all"
                  />
                  <Button
                    onClick={() => setIsPostcodeOpen(true)}
                    variant="outline"
                    className="h-9 px-3 text-xs"
                  >
                    <Search className="w-3.5 h-3.5 mr-1" />
                    주소검색
                  </Button>
                </div>

                {isPostcodeOpen && (
                  <div className="ml-11">
                    <AddressSearch
                      onSelect={handleAddressSelect}
                      onClose={() => setIsPostcodeOpen(false)}
                      compact
                    />
                  </div>
                )}

                {!isPostcodeOpen && address && (
                  <div className="space-y-2 ml-11">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="도로명 주소"
                        value={`${postCode ? `(우편번호:${postCode}) ` : ''}${address}`}
                        readOnly
                        className="h-9 text-sm bg-gray-50 placeholder:text-gray-400 transition-all flex-1"
                      />
                      {/* 주소검색 버튼과 동일한 폭의 빈 공간 */}
                      <Button
                        variant="outline"
                        className="h-9 px-3 text-xs invisible pointer-events-none"
                        tabIndex={-1}
                        aria-hidden
                      >
                        <Search className="w-3.5 h-3.5 mr-1" />
                        주소검색
                      </Button>
                    </div>
                    <Input
                      placeholder="상세주소 (동/호수 등)"
                      value={detailedAddress}
                      onChange={(e) => setDetailedAddress(e.target.value)}
                      className="h-9 text-sm placeholder:text-gray-400 focus:placeholder:opacity-0 transition-all w-[25.25rem]"
                    />
                  </div>
                )}
              </div>

              {/* 버튼 */}
              {!isPostcodeOpen && (
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-sm"
                    onClick={() => onExpandedChange(false)}
                  >
                    취소
                  </Button>
                  <Button
                    className="flex-1 h-9 text-sm"
                    onClick={handleSubmit}
                    disabled={!isValid || isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        추가 중...
                      </>
                    ) : (
                      editingSenderId ? '수정하기' : '추가하기'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
