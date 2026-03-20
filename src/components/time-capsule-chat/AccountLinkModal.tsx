"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, User, Check, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface AccountLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  guestName?: string;
}

export function AccountLinkModal({ isOpen, onClose, onComplete, guestName = "" }: AccountLinkModalProps) {
  const [step, setStep] = useState<"form" | "complete">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState(guestName);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Email verification states
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Validation states
  const [emailError, setEmailError] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [existingAccount, setExistingAccount] = useState(false);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSendVerificationCode = async () => {
    if (!validateEmail(email)) {
      setEmailError("올바른 이메일 형식을 입력해주세요");
      return;
    }

    setIsEmailSending(true);
    setEmailError("");

    // TODO: API 연동 - 이메일 인증코드 발송
    console.warn('[TODO] 미구현: 이메일 인증코드 발송 API');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // TODO: API 연동 - 기존 계정 확인
    console.warn('[TODO] 미구현: 기존 계정 확인 API');
    if (email === "test@test.com") {
      setExistingAccount(true);
    } else {
      setExistingAccount(false);
    }

    setIsEmailSending(false);
    setIsEmailSent(true);
    setResendTimer(60);
    toast.success("인증코드가 발송되었습니다. 이메일을 확인해주세요.");
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setVerificationError("6자리 인증코드를 입력해주세요");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    // TODO: API 연동 - 인증코드 확인
    console.warn('[TODO] 미구현: 인증코드 확인 API');
    await new Promise(resolve => setTimeout(resolve, 800));

    if (verificationCode.length === 6) {
      setIsEmailVerified(true);
      toast.success("이메일 인증이 완료되었습니다!");
    } else {
      setVerificationError("잘못된 인증코드입니다");
    }

    setIsVerifying(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("이름을 입력해주세요");
      return;
    }
    if (!isEmailVerified) {
      toast.error("이메일 인증을 완료해주세요");
      return;
    }
    if (password.length < 6) {
      setPasswordError("비밀번호는 6자 이상이어야 합니다");
      return;
    }
    if (!existingAccount && password !== passwordConfirm) {
      setPasswordError("비밀번호가 일치하지 않습니다");
      return;
    }

    setIsSubmitting(true);

    // TODO: API 연동 - 회원가입/로그인
    console.warn('[TODO] 미구현: 회원가입/로그인 API');
    toast.info("계정 연동 기능을 준비 중입니다");
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setStep("complete");

    setTimeout(() => {
      onComplete();
      onClose();
      resetForm();
    }, 1500);
  };

  const handleSocialLogin = async (provider: "google" | "kakao") => {
    setIsSubmitting(true);

    // TODO: API 연동 - 소셜 로그인
    console.warn(`[TODO] 미구현: ${provider} 소셜 로그인 API`);
    toast.info("소셜 로그인 기능을 준비 중입니다");
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setStep("complete");

    setTimeout(() => {
      onComplete();
      onClose();
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setStep("form");
    setName(guestName);
    setEmail("");
    setVerificationCode("");
    setPassword("");
    setPasswordConfirm("");
    setIsEmailSent(false);
    setIsEmailVerified(false);
    setExistingAccount(false);
    setEmailError("");
    setVerificationError("");
    setPasswordError("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-[32px] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground">계정 연동하기</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    더 많은 쪽지를 작성하려면 계정 연동이 필요해요
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    이름 (본명) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="본명을 입력해주세요"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Email with verification */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    이메일 인증 <span className="text-destructive">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError("");
                          setIsEmailSent(false);
                          setIsEmailVerified(false);
                        }}
                        disabled={isEmailVerified}
                        placeholder="이메일을 입력해주세요"
                        className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-background text-sm outline-none transition-colors disabled:opacity-60 ${
                          emailError ? "border-destructive" : isEmailVerified ? "border-green-500" : "border-border focus:border-primary"
                        }`}
                      />
                      {isEmailVerified && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={isEmailSending || isEmailVerified || resendTimer > 0}
                      className="h-11 px-4 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex items-center gap-1"
                    >
                      {isEmailSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isEmailVerified ? (
                        "완료"
                      ) : resendTimer > 0 ? (
                        `${resendTimer}초`
                      ) : isEmailSent ? (
                        "재발송"
                      ) : (
                        "인증"
                      )}
                    </button>
                  </div>
                  {emailError && (
                    <p className="text-xs text-destructive mt-1">{emailError}</p>
                  )}
                  {existingAccount && isEmailSent && (
                    <p className="text-xs text-primary mt-1">기존 계정이 있어요! 인증 후 로그인해주세요.</p>
                  )}
                </div>

                {/* Verification Code */}
                {isEmailSent && !isEmailVerified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                  >
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      인증코드 <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setVerificationCode(value);
                            setVerificationError("");
                          }}
                          placeholder="6자리 인증코드"
                          maxLength={6}
                          className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-background text-sm outline-none transition-colors font-mono tracking-wider ${
                            verificationError ? "border-destructive" : "border-border focus:border-primary"
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={isVerifying || verificationCode.length !== 6}
                        className="h-11 px-4 bg-foreground text-white text-sm font-medium rounded-xl hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex items-center gap-1"
                      >
                        {isVerifying ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "확인"
                        )}
                      </button>
                    </div>
                    {verificationError && (
                      <p className="text-xs text-destructive mt-1">{verificationError}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      이메일로 발송된 6자리 인증코드를 입력해주세요
                    </p>
                  </motion.div>
                )}

                {/* Password */}
                {isEmailVerified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        비밀번호 <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError("");
                          }}
                          placeholder={existingAccount ? "비밀번호를 입력해주세요" : "비밀번호 설정 (6자 이상)"}
                          className="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password Confirm */}
                    {!existingAccount && (
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          비밀번호 확인 <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type={showPasswordConfirm ? "text" : "password"}
                            value={passwordConfirm}
                            onChange={(e) => {
                              setPasswordConfirm(e.target.value);
                              setPasswordError("");
                            }}
                            placeholder="비밀번호를 다시 입력해주세요"
                            className="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {showPasswordConfirm ? (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                        {passwordError && (
                          <p className="text-xs text-destructive mt-1">{passwordError}</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isEmailVerified}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {existingAccount ? "로그인하기" : "연결하기"}
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">또는</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Social Login */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSocialLogin("google")}
                    disabled={isSubmitting}
                    className="flex-1 h-11 border border-border rounded-xl flex items-center justify-center gap-2 hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium">Google</span>
                  </button>
                  <button
                    onClick={() => handleSocialLogin("kakao")}
                    disabled={isSubmitting}
                    className="flex-1 h-11 bg-[#FEE500] rounded-xl flex items-center justify-center gap-2 hover:bg-[#FEE500]/90 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#000000" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                    </svg>
                    <span className="text-sm font-medium">카카오</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">
                {existingAccount ? "로그인 완료!" : "회원가입 완료!"}
              </h2>
              <p className="text-sm text-muted-foreground">
                이제 무제한으로 쪽지를 작성할 수 있어요
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
