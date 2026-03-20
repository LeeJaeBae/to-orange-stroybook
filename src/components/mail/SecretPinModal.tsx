'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X } from 'lucide-react';

const PIN_HASH_KEY = 'to-orange-secret-pin-hash';

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getSavedHash(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PIN_HASH_KEY);
}

async function saveHash(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_HASH_KEY, hash);
}

async function verifyPin(pin: string): Promise<boolean> {
  const saved = getSavedHash();
  if (!saved) return false;
  const hash = await hashPin(pin);
  return hash === saved;
}

export function resetSecretPin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PIN_HASH_KEY);
  }
}

export function hasSecretPin(): boolean {
  return !!getSavedHash();
}

interface SecretPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'default' | 'change';
}

export function SecretPinModal({ isOpen, onClose, onSuccess, mode = 'default' }: SecretPinModalProps) {
  const isSetupMode = mode === 'change' ? false : !getSavedHash();
  const isChangeMode = mode === 'change';
  const [step, setStep] = useState<'enter' | 'confirm' | 'new' | 'new-confirm'>('enter');
  const [pins, setPins] = useState(['', '', '', '']);
  const [confirmPins, setConfirmPins] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const resetState = useCallback(() => {
    setPins(['', '', '', '']);
    setConfirmPins(['', '', '', '']);
    setStep('enter');
    setError('');
    setShake(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetState();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen, resetState]);

  const triggerShake = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handlePinChange = (index: number, value: string, target: 'pins' | 'confirm' | 'new' | 'new-confirm' = 'pins') => {
    if (!/^\d?$/.test(value)) return;

    const setterMap = { pins: setPins, confirm: setConfirmPins, new: setNewPins, 'new-confirm': setNewConfirmPins };
    const refsMap = { pins: inputRefs, confirm: confirmInputRefs, new: newInputRefs, 'new-confirm': newConfirmInputRefs };
    const setter = setterMap[target];
    const refs = refsMap[target];

    setter((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    if (value && index < 3) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, target: 'pins' | 'confirm' | 'new' | 'new-confirm' = 'pins') => {
    const refsMap = { pins: inputRefs, confirm: confirmInputRefs, new: newInputRefs, 'new-confirm': newConfirmInputRefs };
    const pinsMap = { pins, confirm: confirmPins, new: newPins, 'new-confirm': newConfirmPins };
    const refs = refsMap[target];
    const currentPins = pinsMap[target];

    if (e.key === 'Backspace' && !currentPins[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const [newPins, setNewPins] = useState(['', '', '', '']);
  const [newConfirmPins, setNewConfirmPins] = useState(['', '', '', '']);
  const newInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const newConfirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = async () => {
    const pin = pins.join('');
    if (pin.length !== 4) return;

    if (isChangeMode) {
      if (step === 'enter') {
        // 기존 비밀번호 확인
        const ok = await verifyPin(pin);
        if (ok) {
          setStep('new');
          setNewPins(['', '', '', '']);
          setTimeout(() => newInputRefs.current[0]?.focus(), 100);
        } else {
          triggerShake('현재 비밀번호가 틀렸습니다');
          setPins(['', '', '', '']);
          setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
        return;
      }
      if (step === 'new') {
        const newPin = newPins.join('');
        if (newPin.length !== 4) return;
        setStep('new-confirm');
        setNewConfirmPins(['', '', '', '']);
        setTimeout(() => newConfirmInputRefs.current[0]?.focus(), 100);
        return;
      }
      if (step === 'new-confirm') {
        const newPin = newPins.join('');
        const newConfirmPin = newConfirmPins.join('');
        if (newConfirmPin.length !== 4) return;
        if (newPin !== newConfirmPin) {
          triggerShake('비밀번호가 일치하지 않습니다');
          setNewConfirmPins(['', '', '', '']);
          setTimeout(() => newConfirmInputRefs.current[0]?.focus(), 100);
          return;
        }
        await saveHash(newPin);
        onSuccess();
        return;
      }
    } else if (isSetupMode) {
      if (step === 'enter') {
        setStep('confirm');
        setConfirmPins(['', '', '', '']);
        setTimeout(() => confirmInputRefs.current[0]?.focus(), 100);
        return;
      }

      const confirmPin = confirmPins.join('');
      if (confirmPin.length !== 4) return;

      if (pin !== confirmPin) {
        triggerShake('비밀번호가 일치하지 않습니다');
        setConfirmPins(['', '', '', '']);
        setTimeout(() => confirmInputRefs.current[0]?.focus(), 100);
        return;
      }

      await saveHash(pin);
      onSuccess();
    } else {
      const ok = await verifyPin(pin);
      if (ok) {
        onSuccess();
      } else {
        triggerShake('비밀번호가 틀렸습니다');
        setPins(['', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    }
  };

  // Auto-submit when all pins filled
  useEffect(() => {
    const pin = pins.join('');
    if (pin.length === 4) {
      if (isSetupMode && step === 'enter') {
        handleSubmit();
      } else if (!isSetupMode && step === 'enter') {
        handleSubmit();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins]);

  useEffect(() => {
    if (step === 'confirm') {
      const confirmPin = confirmPins.join('');
      if (confirmPin.length === 4) {
        handleSubmit();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmPins]);

  useEffect(() => {
    if (step === 'new') {
      const newPin = newPins.join('');
      if (newPin.length === 4) {
        handleSubmit();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPins]);

  useEffect(() => {
    if (step === 'new-confirm') {
      const newConfirmPin = newConfirmPins.join('');
      if (newConfirmPin.length === 4) {
        handleSubmit();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newConfirmPins]);

  if (!isOpen) return null;

  const renderPinInputs = (values: string[], refs: React.MutableRefObject<(HTMLInputElement | null)[]>, target: 'pins' | 'confirm' | 'new' | 'new-confirm' = 'pins') => (
    <div className="flex gap-3 justify-center">
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={(e) => handlePinChange(i, e.target.value, target)}
          onKeyDown={(e) => handleKeyDown(i, e, target)}
          className="w-12 h-14 text-center text-xl font-bold border-2 border-border rounded-xl bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, x: shake ? [0, -10, 10, -10, 10, 0] : 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: shake ? 0.4 : 0.2 }}
          className="bg-card rounded-2xl p-6 w-[340px] shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">
                {isChangeMode ? '비밀번호 변경' : isSetupMode ? '비밀번호 설정' : '비밀번호 입력'}
              </h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {isSetupMode && step === 'enter' && (
            <>
              <p className="text-sm text-muted-foreground text-center mb-4">
                비밀 편지함 비밀번호를 설정해주세요
              </p>
              {renderPinInputs(pins, inputRefs)}
            </>
          )}

          {isSetupMode && step === 'confirm' && (
            <>
              <p className="text-sm text-muted-foreground text-center mb-4">
                비밀번호를 다시 입력해주세요
              </p>
              {renderPinInputs(confirmPins, confirmInputRefs, 'confirm')}
            </>
          )}

          {!isSetupMode && step === 'enter' && (
            <>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {isChangeMode ? '현재 비밀번호를 입력해주세요' : '비밀 편지함 비밀번호를 입력해주세요'}
              </p>
              {renderPinInputs(pins, inputRefs)}
            </>
          )}

          {isChangeMode && step === 'new' && (
            <>
              <p className="text-sm text-muted-foreground text-center mb-4">
                새 비밀번호를 입력해주세요
              </p>
              {renderPinInputs(newPins, newInputRefs, 'new')}
            </>
          )}

          {isChangeMode && step === 'new-confirm' && (
            <>
              <p className="text-sm text-muted-foreground text-center mb-4">
                새 비밀번호를 다시 입력해주세요
              </p>
              {renderPinInputs(newConfirmPins, newConfirmInputRefs, 'new-confirm')}
            </>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-destructive text-center mt-3"
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
