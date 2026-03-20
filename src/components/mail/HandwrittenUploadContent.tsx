import { useState, useCallback, useRef, useEffect, type PointerEvent as ReactPointerEvent, type TouchEvent as ReactTouchEvent, type WheelEvent as ReactWheelEvent } from "react";
import { Upload, User, Loader2, Check, AlertCircle, FileText, Send, RotateCcw, Plus, UserPlus, Edit2, Building2, MapPin, Trash2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ArrowUpDown, HelpCircle, PenLine, X, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api/fetch";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { AddRecipientModal } from "./AddRecipientModal";
import Image from "next/image";

interface UploadedPage {
  id: string;
  fileName: string;
  imageUrl: string;
  ocrStatus: "idle" | "processing" | "streaming" | "refining" | "completed" | "error";
  ocrText: string;
}

interface HandwrittenUploadContentProps {
  onClose: () => void;
  onComposeWithText?: (text: string, senderName?: string) => void;
  onSaveToInbox?: (data: { senderName: string; pages: { imageUrl: string; ocrText: string }[] }) => void;
}

export function HandwrittenUploadContent({ onClose, onComposeWithText, onSaveToInbox }: HandwrittenUploadContentProps) {
  const [selectedReceiverId, setSelectedReceiverId] = useState<string>("");
  const [senderName, setSenderName] = useState("");
  const [pages, setPages] = useState<UploadedPage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAddRecipientModalOpen, setIsAddRecipientModalOpen] = useState(false);

  // 삭제 확인 모달
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);

  // 순서 바꾸기 모드
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [originalOrderPages, setOriginalOrderPages] = useState<UploadedPage[]>([]);
  const [reorderExitConfirmOpen, setReorderExitConfirmOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // 도움말 토글
  const [showUploadHelp, setShowUploadHelp] = useState(true);
  const [zoomedPageIndex, setZoomedPageIndex] = useState<number | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pagesRef = useRef<UploadedPage[]>([]);
  const isDraggingImage = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastTap = useRef(0);
  const pinchStartDist = useRef(0);
  const pinchStartZoom = useRef(1);
  useEffect(() => { pagesRef.current = pages; }, [pages]);

  const { rawMembers, isLoading: isMembersLoading } = useFamilyMembers();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    // Reset input value so the same file can be selected again
    e.target.value = '';
  };

  const processFiles = async (files: File[]) => {
    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const validFiles = files.filter(file => {
      if (!validExtensions.includes(file.type)) {
        toast.error(`${file.name}: 지원하지 않는 파일 형식입니다.`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: 파일 크기는 10MB 이하여야 합니다.`);
        return false;
      }
      return true;
    });

    // 1단계: 모든 파일의 업로드 + OCR을 순차 처리
    const processedPages: { pageId: string; uploadedUrl: string; ocrText: string }[] = [];
    for (const file of validFiles) {
      const result = await processFile(file);
      if (result) processedPages.push(result);
    }

    // 2단계: 모든 OCR 완료 후, AI 보정을 순차 처리
    for (const { pageId, uploadedUrl, ocrText } of processedPages) {
      await refinePageOCR({ id: pageId, imageUrl: uploadedUrl, ocrText, fileName: '', ocrStatus: 'completed' });
    }
  };

  // SSE 스트림을 읽어 ocrText를 점진적으로 업데이트, 최종 텍스트 반환
  const readOCRStream = async (response: Response, pageId: string): Promise<string> => {
    if (!response.body) throw new Error('스트림을 읽을 수 없습니다');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    // streaming 상태로 전환
    setPages(prev => prev.map(p =>
      p.id === pageId ? { ...p, ocrStatus: 'streaming' } : p
    ));

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;
        try {
          const data = JSON.parse(trimmed.slice(6));
          if (data.error) throw new Error(data.error);
          if (data.text) {
            fullText += data.text;
            setPages(prev => prev.map(p =>
              p.id === pageId ? { ...p, ocrText: fullText } : p
            ));
          }
        } catch (e) {
          if (e instanceof Error && e.message) throw e;
        }
      }
    }

    if (!fullText.trim()) throw new Error('텍스트를 인식할 수 없습니다');

    const finalText = fullText.trim();
    setPages(prev => prev.map(p =>
      p.id === pageId ? { ...p, ocrText: finalText, ocrStatus: 'completed' } : p
    ));
    toast.success("페이지 인식이 완료되었습니다");
    return finalText;
  };

  // AI 보정 요청 (이미지 대조)
  const refinePageOCR = async (page: UploadedPage) => {
    if (!page.imageUrl || !page.ocrText) return;

    setPages(prev => prev.map(p =>
      p.id === page.id ? { ...p, ocrStatus: 'refining' } : p
    ));

    try {
      const response = await apiFetch('/api/v1/ai/ocr/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: page.imageUrl, ocrText: page.ocrText }),
      });

      if (!response.ok) {
        console.warn('AI 보정 실패, OCR 결과 유지');
        setPages(prev => prev.map(p =>
          p.id === page.id ? { ...p, ocrStatus: 'completed' } : p
        ));
        return;
      }

      const { data: refined } = await response.json();
      setPages(prev => prev.map(p =>
        p.id === page.id ? { ...p, ocrText: refined?.trim() || page.ocrText, ocrStatus: 'completed' } : p
      ));
    } catch (error) {
      console.warn('AI 보정 오류:', error);
      setPages(prev => prev.map(p =>
        p.id === page.id ? { ...p, ocrStatus: 'completed' } : p
      ));
    }
  };

  const processFile = async (file: File): Promise<{ pageId: string; uploadedUrl: string; ocrText: string } | null> => {
    const pageId = `page-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // 즉시 로컬 미리보기 + placeholder 추가
    const previewUrl = URL.createObjectURL(file);
    const newPage: UploadedPage = {
      id: pageId,
      fileName: file.name,
      imageUrl: previewUrl,
      ocrStatus: 'processing',
      ocrText: '',
    };

    setPages(prev => [...prev, newPage]);

    // Supabase 업로드와 OCR을 병렬 실행
    const uploadPromise = (async () => {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await apiFetch('/api/v1/uploads/handwritten', {
        method: 'POST',
        body: formData,
      });
      if (!uploadResponse.ok) {
        const error = await uploadResponse.json().catch(() => ({}));
        throw new Error(error.error || '이미지 업로드에 실패했습니다');
      }
      const { url } = await uploadResponse.json();
      URL.revokeObjectURL(previewUrl);
      setPages(prev => prev.map(p =>
        p.id === pageId ? { ...p, imageUrl: url } : p
      ));
      return url;
    })();

    const ocrPromise = (async () => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiFetch('/api/v1/ai/ocr', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'OCR 처리에 실패했습니다');
      }
      return await readOCRStream(response, pageId);
    })();

    const [uploadResult, ocrResult] = await Promise.allSettled([uploadPromise, ocrPromise]);

    if (uploadResult.status === 'rejected') {
      console.error('Upload error:', uploadResult.reason);
      toast.error(uploadResult.reason instanceof Error ? uploadResult.reason.message : '이미지 업로드에 실패했습니다');
    }

    if (ocrResult.status === 'rejected') {
      console.error('OCR error:', ocrResult.reason);
      toast.error(ocrResult.reason instanceof Error ? ocrResult.reason.message : 'OCR 처리 중 오류가 발생했습니다');
      setPages(prev => prev.map(p =>
        p.id === pageId ? { ...p, ocrStatus: 'error' } : p
      ));
      return null;
    }

    const uploadedUrl = uploadResult.status === 'fulfilled' ? uploadResult.value : null;
    const ocrText = ocrResult.status === 'fulfilled' ? ocrResult.value : '';
    return uploadedUrl && ocrText ? { pageId, uploadedUrl, ocrText } : null;
  };

  const handleRetryOCR = async (pageId: string) => {
    const page = pagesRef.current.find(p => p.id === pageId);
    if (!page || !page.imageUrl) return;

    setPages(prev => prev.map(p =>
      p.id === pageId ? { ...p, ocrStatus: 'processing', ocrText: '' } : p
    ));

    try {
      const response = await apiFetch('/api/v1/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: page.imageUrl }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'OCR 처리에 실패했습니다');
      }
      const ocrText = await readOCRStream(response, pageId);

      // OCR 완료 후 AI 보정
      if (ocrText) {
        await refinePageOCR({ id: pageId, imageUrl: page.imageUrl, ocrText, fileName: '', ocrStatus: 'completed' });
      }
    } catch (error) {
      console.error('OCR retry error:', error);
      toast.error(error instanceof Error ? error.message : 'OCR 처리 중 오류가 발생했습니다');
      setPages(prev => prev.map(p =>
        p.id === pageId ? { ...p, ocrStatus: 'error' } : p
      ));
    }
  };

  const handleRemovePage = (pageId: string) => {
    setPages(prev => prev.filter(p => p.id !== pageId));
  };

  // 삭제 확인 팝업 열기
  const openDeleteConfirm = (id: string) => {
    setPageToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // 이미지 삭제 실행
  const handleConfirmDelete = () => {
    if (!pageToDelete) return;
    handleRemovePage(pageToDelete);
    setDeleteConfirmOpen(false);
    setPageToDelete(null);
    toast.success("사진이 삭제되었습니다.");
  };

  // 순서 바꾸기 모드 시작
  const startReorderMode = () => {
    setOriginalOrderPages([...pages]);
    setIsReorderMode(true);
  };

  // 순서 바꾸기 완료
  const finishReorderMode = () => {
    setIsReorderMode(false);
    setOriginalOrderPages([]);
    toast.success("사진 순서가 정리되었어요", {
      description: "이 순서대로 편지가 전달됩니다."
    });
  };

  // 순서 바꾸기 취소 (원래 순서로 복원)
  const cancelReorderMode = () => {
    setPages(originalOrderPages);
    setIsReorderMode(false);
    setOriginalOrderPages([]);
    setReorderExitConfirmOpen(false);
  };

  // 순서 바꾸기 중 나가기 시도
  const handleReorderModeExit = () => {
    setReorderExitConfirmOpen(true);
  };

  // 드래그 앤 드롭 핸들러
  const handleImageDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleImageDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    setPages(prev => {
      const items = [...prev];
      const draggedIndex = items.findIndex(p => p.id === draggedItem);
      const targetIndex = items.findIndex(p => p.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const [draggedPage] = items.splice(draggedIndex, 1);
      items.splice(targetIndex, 0, draggedPage);

      return items;
    });
  };

  const handleImageDragEnd = () => {
    setDraggedItem(null);
  };

  // ▲▼ 버튼으로 순서 이동
  const handleMoveImage = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    setPages(prev => {
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const items = [...prev];
      [items[idx], items[targetIdx]] = [items[targetIdx], items[idx]];
      return items;
    });
  };

  const handleReceiverSelect = (value: string) => {
    if (value === "_add_new") {
      setIsAddRecipientModalOpen(true);
      return;
    }

    setSelectedReceiverId(value);
    const selectedMember = rawMembers.find(m => m.receiverId === value);
    if (selectedMember) {
      setSenderName(selectedMember.nickname || selectedMember.name);
    }
  };

  const handleAddRecipientSuccess = (memberId: string) => {
    const newMember = rawMembers.find(m => m.id === memberId);
    if (newMember) {
      setSelectedReceiverId(newMember.receiverId);
      setSenderName(newMember.nickname || newMember.name);
    }
    setIsAddRecipientModalOpen(false);
  };

  const handleUpdateOcrText = (pageId: string, text: string) => {
    setPages(prev => prev.map(p =>
      p.id === pageId ? { ...p, ocrText: text } : p
    ));
  };

  const resetImageZoom = useCallback(() => {
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
    isDraggingImage.current = false;
  }, []);

  const closeZoomModal = useCallback(() => {
    resetImageZoom();
    setZoomedPageIndex(null);
  }, [resetImageZoom]);

  const openZoomModal = useCallback((pageIndex: number) => {
    resetImageZoom();
    setZoomedPageIndex(pageIndex);
  }, [resetImageZoom]);

  const handleZoomWheel = useCallback((e: ReactWheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setImageZoom(prev => {
      const nextZoom = Math.min(Math.max(prev + delta, 1), 5);
      if (nextZoom <= 1) {
        setImagePosition({ x: 0, y: 0 });
      }
      return nextZoom;
    });
  }, []);

  const handleZoomPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (imageZoom <= 1) return;
    isDraggingImage.current = true;
    dragStart.current = {
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [imagePosition.x, imagePosition.y, imageZoom]);

  const handleZoomPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingImage.current) return;

    setImagePosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }, []);

  const handleZoomPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    isDraggingImage.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const handleZoomTouchStart = useCallback((e: ReactTouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDist.current = Math.hypot(dx, dy);
      pinchStartZoom.current = imageZoom;
      return;
    }

    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        if (imageZoom > 1) {
          resetImageZoom();
        } else {
          setImageZoom(2.5);
        }
      }
      lastTap.current = now;
    }
  }, [imageZoom, resetImageZoom]);

  const handleZoomTouchMove = useCallback((e: ReactTouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 2 || pinchStartDist.current === 0) return;

    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const scale = dist / pinchStartDist.current;
    const nextZoom = Math.min(Math.max(pinchStartZoom.current * scale, 1), 5);

    setImageZoom(nextZoom);
    if (nextZoom <= 1) {
      setImagePosition({ x: 0, y: 0 });
    }
  }, []);

  useEffect(() => {
    if (zoomedPageIndex === null) {
      resetImageZoom();
    }
  }, [zoomedPageIndex, resetImageZoom]);

  useEffect(() => {
    if (zoomedPageIndex !== null && !pages[zoomedPageIndex]) {
      closeZoomModal();
    }
  }, [closeZoomModal, pages, zoomedPageIndex]);

  // 모든 페이지의 OCR이 완료되었는지 확인
  const allOcrCompleted = pages.length > 0 && pages.every(p => p.ocrStatus === 'completed');
  const anyProcessing = pages.some(p => p.ocrStatus === 'processing' || p.ocrStatus === 'streaming' || p.ocrStatus === 'refining');
  const zoomedPage = zoomedPageIndex !== null ? pages[zoomedPageIndex] : null;

  // 모든 OCR 텍스트를 순서대로 합치기
  const getCombinedOcrText = () => {
    if (pages.length === 1) {
      return pages[0].ocrText;
    }
    return pages.map((p, idx) =>
      `[${idx + 1}페이지]\n${p.ocrText}`
    ).join('\n\n---\n\n');
  };

  const handleSaveToInbox = async () => {
    if (!senderName.trim()) {
      toast.warning("발신자를 선택해주세요.");
      return;
    }
    if (pages.length === 0) {
      toast.warning("손편지 이미지를 업로드해주세요.");
      return;
    }
    if (!allOcrCompleted) {
      toast.info("모든 페이지의 인식이 완료될 때까지 기다려주세요.");
      return;
    }

    try {
      const response = await apiFetch('/api/v1/received-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedReceiverId || undefined,
          senderName,
          // 첫 페이지 이미지를 대표 이미지로
          originalImageUrl: pages[0].imageUrl,
          // 모든 텍스트 합침
          ocrText: getCombinedOcrText(),
          // 다중 이미지 정보
          pages: pages.map((p, idx) => ({
            imageUrl: p.imageUrl,
            ocrText: p.ocrText,
            displayOrder: idx,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || '저장에 실패했습니다');
      }

      if (onSaveToInbox) {
        onSaveToInbox({
          senderName,
          pages: pages.map(p => ({ imageUrl: p.imageUrl, ocrText: p.ocrText })),
        });
      }

      toast.success("손편지가 받은 편지함에 저장되었습니다.");
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다');
    }
  };

  const handleReplyLetter = () => {
    if (!senderName.trim()) {
      toast.error("발신자를 입력해주세요.");
      return;
    }
    if (!allOcrCompleted) {
      toast.error("모든 페이지의 인식이 완료되어야 합니다.");
      return;
    }

    if (onComposeWithText) {
      onComposeWithText(getCombinedOcrText(), senderName);
    }
    toast.success("답장 편지 작성 화면으로 이동합니다.");
    onClose();
  };


  return (
    <>
      <AddRecipientModal
        open={isAddRecipientModalOpen}
        onOpenChange={setIsAddRecipientModalOpen}
        onSuccess={handleAddRecipientSuccess}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Header */}
        <header className="hidden md:flex h-14 border-b border-border/40 bg-white/80 backdrop-blur-sm items-center px-6">
          <div className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">손편지 담기</h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto px-4 py-6 md:py-10 lg:px-6">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* 타이틀 영역 */}
            <div className="mb-8">
              <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-4">
                받은 <span className="text-primary">손편지</span>를 담아보세요
              </h2>
              <div className="text-size-15 md:text-base text-muted-foreground leading-relaxed mb-4 md:mb-6">
                <p>
                  종이에 적어 받은 손편지를 휴대폰으로 사진 찍어 올리면,<br />
                  AI가 원본이미지 글씨를 인식해 글자로 옮겨드립니다.
                </p>
              </div>
            </div>

            {/* Step 1: Sender Selection */}
            <section className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">1</span>
                <h2 className="font-semibold text-foreground">누구로부터 받은 편지인가요?</h2>
              </div>

              {!selectedReceiverId ? (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <Select value={selectedReceiverId} onValueChange={handleReceiverSelect}>
                    <SelectTrigger className="flex-1 h-12 text-base">
                      <SelectValue placeholder="주소록에서 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {isMembersLoading ? (
                        <SelectItem value="_loading" disabled>
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>불러오는 중...</span>
                          </div>
                        </SelectItem>
                      ) : rawMembers.length === 0 ? (
                        <SelectItem value="_empty" disabled>
                          주소록이 비어있습니다
                        </SelectItem>
                      ) : (
                        rawMembers.map((member) => (
                          <SelectItem key={member.receiverId} value={member.receiverId}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{member.nickname || member.name}</span>
                              <span className="text-xs text-muted-foreground">({member.relation})</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                      <SelectItem value="_add_new">
                        <div className="flex items-center gap-2 text-primary">
                          <UserPlus className="w-4 h-4" />
                          <span className="font-medium">새 발신자 추가</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {(() => {
                    const selectedMember = rawMembers.find(m => m.receiverId === selectedReceiverId);
                    if (!selectedMember) return null;

                    return (
                      <motion.div
                        key="selected-sender"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        {/* 선택된 발신자 카드 */}
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                          <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm",
                            selectedMember.color || "bg-orange-100 text-orange-600"
                          )}>
                            {selectedMember.avatarUrl ? (
                              <Image src={selectedMember.avatarUrl} alt={selectedMember.name} width={64} height={64} className="rounded-full object-cover" />
                            ) : (
                              <span>{selectedMember.name.charAt(0)}</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-foreground text-lg">
                                {selectedMember.nickname || selectedMember.name}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                                {selectedMember.relation}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary/70" />
                                <span className="font-medium">{selectedMember.facilityName}</span>
                              </div>
                              {selectedMember.facilityAddress && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-primary/70" />
                                  <span className="truncate text-xs">{selectedMember.facilityAddress}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReceiverId("");
                              setSenderName("");
                            }}
                            className="flex-shrink-0 hover:bg-primary/10 border-primary/20"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                            변경
                          </Button>
                        </div>

                        {/* 표시 이름 수정 */}
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold text-foreground min-w-[72px] md:min-w-[90px]">
                              표시할 이름
                            </label>
                            <Input
                              value={senderName}
                              onChange={(e) => setSenderName(e.target.value)}
                              placeholder="필요시 이름을 수정하세요"
                              className="flex-1 max-w-sm bg-background"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground pl-[84px] md:pl-[102px]">
                            받은 편지함에 표시될 이름입니다. 원하는 호칭으로 변경할 수 있어요.
                          </p>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              )}
            </section>

            {/* Step 2: Upload Multiple Pages */}
            <section className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">2</span>
                  <h2 className="font-semibold text-foreground">손편지 담기 ({pages.length}장)</h2>
                </div>
                <div className="flex items-center gap-2">
                  {pages.length > 1 && !isReorderMode && (
                    <Button
                      variant="outline"
                      onClick={startReorderMode}
                      className="gap-2"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                      순서 바꾸기
                    </Button>
                  )}
                  {isReorderMode && (
                    <Button
                      onClick={finishReorderMode}
                      className="gap-2 bg-orange-500 hover:bg-orange-600"
                    >
                      <Check className="w-4 h-4" />
                      순서 맞추기 끝
                    </Button>
                  )}
                </div>
              </div>

              {/* 순서 바꾸기 모드 안내 */}
              {isReorderMode && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-orange-800">
                    사진을 꾹 눌러서 좌우 혹은 위아래로 옮겨주세요
                  </p>
                  <p className="text-sm text-orange-600 mt-1">
                    순서만 바뀌고, 사진은 지워지지 않습니다.
                  </p>
                </div>
              )}

              {/* 파일 input (숨김) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />

              {/* Upload Area - 이미지가 없을 때 */}
              {pages.length === 0 && (
                <>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                      isDragOver
                        ? "border-primary bg-orange-200"
                        : "border-border bg-orange-100 hover:border-primary/50 hover:bg-orange-200/70"
                    )}
                  >
                    <Upload className="w-16 h-16 mx-auto text-orange-400 mb-3" />
                    <p className="text-base font-medium text-foreground mb-2">
                      손편지 사진을 여기에 올려주세요
                    </p>
                  </div>

                  {/* 도움말 토글 */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setShowUploadHelp(!showUploadHelp)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>사진 올리는 방법이 어려우신가요?</span>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        showUploadHelp && "rotate-180"
                      )} />
                    </button>

                    {showUploadHelp && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="space-y-4 text-sm text-muted-foreground">

                          {/* 📱 휴대폰에서 바로 올리기 */}
                          <div>
                            <p className="font-medium text-foreground mb-2">📱 휴대폰에서 바로 올리기</p>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                                <p>손편지를 <span className="font-medium text-foreground">밝은 곳에서 그림자 없이</span> 촬영하세요</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                                <p>위 주황색 네모 칸을 눌러 <span className="font-medium text-foreground">갤러리에서 사진을 선택</span>하세요</p>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-gray-200" />

                          {/* 💻 PC에서 올리기 (카카오톡 활용) */}
                          <div>
                            <p className="font-medium text-foreground mb-2">💻 PC에서 올리기 (카카오톡 활용)</p>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                                <p>휴대폰 카카오톡 → <span className="font-medium text-foreground">나와의 채팅</span> 열기</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                                <p>왼쪽 아래 <span className="font-medium text-foreground">+ 버튼</span> → <span className="font-medium text-foreground">앨범</span> → 손편지 사진 선택 후 전송</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                                <p>PC 카카오톡에서 <span className="font-medium text-foreground">나와의 채팅</span> 열기 → 사진을 <span className="font-medium text-foreground">다운로드</span> (사진 클릭 → 💾 저장)</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                                <p>위 주황색 네모 칸을 클릭해서 다운로드한 사진을 선택하세요</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-orange-50 rounded-md p-3 mt-2">
                            <p className="text-xs text-orange-700">💡 <span className="font-medium">촬영 팁:</span> 그림자가 지지 않도록 밝은 곳에서 찍어주세요. 글씨가 더 선명하게 인식됩니다!</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* 이미지 카드 그리드 */}
              {pages.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {pages.map((page, idx) => (
                    <div
                      key={page.id}
                      draggable={pages.length > 1 && isReorderMode}
                      onDragStart={() => pages.length > 1 && isReorderMode && handleImageDragStart(page.id)}
                      onDragOver={(e) => pages.length > 1 && isReorderMode && handleImageDragOver(e, page.id)}
                      onDragEnd={handleImageDragEnd}
                      onClick={() => {
                        if (!isReorderMode && page.imageUrl) {
                          openZoomModal(idx);
                        }
                      }}
                      title={isReorderMode ? undefined : "클릭하면 크게 볼 수 있어요"}
                      className={cn(
                        "relative group aspect-[3/4] rounded-2xl border-[3px] overflow-hidden transition-all",
                        isReorderMode && pages.length > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                        draggedItem === page.id ? "opacity-50 border-orange-500" : "border-orange-400"
                      )}
                    >
                      {page.imageUrl ? (
                        <Image
                          src={page.imageUrl}
                          alt={`손편지 ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                      )}

                      {/* 순서 표시 (항상 표시) */}
                      <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-orange-500 text-white text-lg flex items-center justify-center font-bold shadow-lg">
                        {idx + 1}
                      </div>

                      {/* OCR Status */}
                      <div className="absolute top-3 right-3">
                        {(page.ocrStatus === 'processing' || page.ocrStatus === 'streaming' || page.ocrStatus === 'refining') && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-yellow-500 text-white text-xs font-medium shadow-lg">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            인식 중
                          </div>
                        )}
                        {page.ocrStatus === 'completed' && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRetryOCR(page.id); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs font-medium shadow-lg transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            다시 인식
                          </button>
                        )}
                        {page.ocrStatus === 'error' && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRetryOCR(page.id); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-medium shadow-lg transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            다시 인식
                          </button>
                        )}
                      </div>

                      {/* 순서 이동 버튼 (우측) - 순서 바꾸기 모드에서만 */}
                      {isReorderMode && pages.length > 1 && (
                        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => { e.stopPropagation(); handleMoveImage(idx, 'up'); }}
                            className="w-9 h-9 rounded-lg bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                          >
                            <ChevronUp className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === pages.length - 1}
                            onClick={(e) => { e.stopPropagation(); handleMoveImage(idx, 'down'); }}
                            className="w-9 h-9 rounded-lg bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        </div>
                      )}

                      {/* 삭제 버튼 (하단 왼쪽) - 순서 바꾸기 모드가 아닐 때만 */}
                      {!isReorderMode && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteConfirm(page.id);
                            }}
                            className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            이 사진 지우기
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openZoomModal(idx);
                            }}
                            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                            title="크게 보기"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}

                  {/* 추가 카드 (+) - 순서 바꾸기 모드가 아닐 때만 */}
                  {!isReorderMode && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      className={cn(
                        "aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all",
                        isDragOver
                          ? "border-primary bg-primary/5"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      )}
                    >
                      <Plus className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-lg text-gray-500 font-medium">추가</span>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Step 3: All Pages View */}
            {pages.length > 0 && (
              <section className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">3</span>
                  <h2 className="font-semibold text-foreground">
                    인식 결과 확인 ({pages.length}페이지)
                  </h2>
                </div>

                <div className="space-y-6">
                  {pages.map((page, idx) => (
                    <div key={page.id}>
                      {pages.length > 1 && (
                        <div className="text-sm font-medium text-muted-foreground mb-2">{idx + 1}페이지</div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Original Image */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-foreground">손편지 원본</h3>
                          <div
                            className="group aspect-[3/4] bg-secondary/30 rounded-2xl border border-border overflow-hidden relative cursor-zoom-in"
                            onClick={() => {
                              if (page.imageUrl) {
                                openZoomModal(idx);
                              }
                            }}
                            title="클릭하면 크게 볼 수 있어요"
                          >
                            <div className="w-full h-full overflow-auto flex items-center justify-center p-2">
                              {page.imageUrl ? (
                                <Image
                                  src={page.imageUrl}
                                  alt={`손편지 ${idx + 1}페이지`}
                                  width={900}
                                  height={1200}
                                  unoptimized
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                              )}
                            </div>

                            {page.imageUrl && (
                              <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                                <ZoomIn className="w-3.5 h-3.5" />
                                크게 보기
                              </div>
                            )}

                            {/* 스캔 레이저 이펙트 */}
                            {(page.ocrStatus === "processing" || page.ocrStatus === "streaming") && (
                              <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-0 bg-black/40" />
                                <motion.div
                                  className="absolute left-0 right-0 h-3"
                                  style={{
                                    background: 'linear-gradient(to bottom, transparent, rgba(34, 197, 94, 0.5), rgb(34, 197, 94), rgb(34, 197, 94), rgba(34, 197, 94, 0.5), transparent)',
                                    boxShadow: '0 0 30px rgba(34, 197, 94, 1), 0 0 60px rgba(34, 197, 94, 0.6), 0 0 90px rgba(34, 197, 94, 0.3)',
                                    filter: 'blur(1px)',
                                  }}
                                  animate={{ top: ['0%', '100%', '0%'] }}
                                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                                />
                                <div className="absolute bottom-4 left-0 right-0 text-center">
                                  <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-green-500 text-white text-sm font-bold font-mono rounded-full">
                                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                                    SCANNING...
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Recognized Text */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-foreground">인식된 내용</h3>
                          <div className="aspect-[3/4] bg-secondary/30 rounded-2xl border border-border overflow-hidden relative">
                            {(page.ocrStatus === "processing" || page.ocrStatus === "streaming" || page.ocrStatus === "refining") && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                                <p className="text-sm text-muted-foreground">
                                  {page.ocrStatus === "refining" ? "AI가 내용을 다듬고 있어요..." : "손글씨를 인식하고 있어요..."}
                                </p>
                              </div>
                            )}
                            {page.ocrStatus === "error" && (
                              <>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <AlertCircle className="w-8 h-8 text-destructive mb-3" />
                                  <p className="text-sm text-muted-foreground">인식에 실패했습니다.</p>
                                  <p className="text-xs text-muted-foreground mt-1">다시 시도해주세요.</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRetryOCR(page.id)}
                                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 hover:bg-destructive/20 text-xs text-destructive transition-colors z-10"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  다시 인식
                                </button>
                              </>
                            )}
                            {page.ocrStatus === "completed" && (
                              <>
                                <Textarea
                                  value={page.ocrText}
                                  onChange={(e) => handleUpdateOcrText(page.id, e.target.value)}
                                  className="w-full h-full resize-none border-0 bg-transparent p-4 pt-10 text-sm leading-relaxed"
                                  placeholder="인식된 내용이 여기에 표시됩니다."
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRetryOCR(page.id)}
                                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-muted hover:bg-muted-foreground/20 text-xs text-muted-foreground hover:text-foreground transition-colors z-10"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  다시 인식
                                </button>
                              </>
                            )}
                            {page.ocrStatus === "idle" && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <FileText className="w-8 h-8 text-muted-foreground/50 mb-3" />
                                <p className="text-sm text-muted-foreground">인식 대기 중...</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {idx < pages.length - 1 && <div className="border-t border-border mt-6" />}
                    </div>
                  ))}
                </div>

                {/* Reply Button */}
                {allOcrCompleted && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button
                      onClick={handleReplyLetter}
                      className="w-full"
                      size="lg"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      답장 편지 작성하기
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      AI가 인식된 편지 내용을 분석하여 답장 작성을 도와드려요
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* 하단 안내 메시지 */}
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-center">
              <p className="text-sm text-orange-800 leading-relaxed">
                손편지는 시간이 지나면 잃어버리거나 훼손되기 쉽습니다.<br />
                <span className="font-medium">지금 담아두면, 소중한 마음을 오래오래 간직할 수 있어요.</span>
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={isReorderMode ? handleReorderModeExit : onClose}>
                취소
              </Button>
              <Button
                onClick={handleSaveToInbox}
                disabled={!senderName.trim() || pages.length === 0 || !allOcrCompleted || anyProcessing}
              >
                {anyProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    인식 중...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    받은 편지함에 저장 ({pages.length}장)
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 사진 삭제 확인 모달 */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-semibold">이 사진을 지울까요?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground leading-relaxed">
            지워도 다른 사진에는 영향이 없습니다.
            <br />
            필요하면 다시 올릴 수 있어요.
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setPageToDelete(null);
              }}
              className="px-6 border-gray-300"
            >
              취소
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="px-6 bg-gray-500 hover:bg-gray-600 text-white"
            >
              지우기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 순서 바꾸기 나가기 확인 모달 */}
      <Dialog open={reorderExitConfirmOpen} onOpenChange={setReorderExitConfirmOpen}>
        <DialogContent className="sm:max-w-sm p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-semibold">사진 순서를 바꾸는 중입니다</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground leading-relaxed">
            지금 나가면, 바꾼 순서는 저장되지 않습니다.
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setReorderExitConfirmOpen(false)}
              className="px-6 border-gray-300"
            >
              계속 순서 바꾸기
            </Button>
            <Button
              onClick={cancelReorderMode}
              className="px-6 bg-gray-500 hover:bg-gray-600 text-white"
            >
              그만두기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {zoomedPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/85"
            onClick={closeZoomModal}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="flex h-full flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 px-4 py-4 text-white md:px-6">
                <div>
                  <p className="text-sm font-medium">손편지 원본 크게 보기</p>
                  <p className="text-xs text-white/70">
                    {zoomedPageIndex !== null ? `${zoomedPageIndex + 1} / ${pages.length}페이지` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setImageZoom(prev => {
                          const nextZoom = Math.max(1, prev - 0.5);
                          if (nextZoom <= 1) {
                            setImagePosition({ x: 0, y: 0 });
                          }
                          return nextZoom;
                        });
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white hover:bg-white/20"
                    >
                      -
                    </button>
                    <span className="min-w-12 text-center text-xs font-medium">
                      {Math.round(imageZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageZoom(prev => Math.min(5, prev + 0.5))}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white hover:bg-white/20"
                    >
                      +
                    </button>
                    {imageZoom > 1 && (
                      <button
                        type="button"
                        onClick={resetImageZoom}
                        className="text-xs text-white/70 hover:text-white"
                      >
                        초기화
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={closeZoomModal}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 md:px-6">
                {pages.length > 1 && zoomedPageIndex !== null && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        resetImageZoom();
                        setZoomedPageIndex(prev => prev === null ? prev : Math.max(0, prev - 1));
                      }}
                      disabled={zoomedPageIndex === 0}
                      className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 md:left-6"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetImageZoom();
                        setZoomedPageIndex(prev => prev === null ? prev : Math.min(pages.length - 1, prev + 1));
                      }}
                      disabled={zoomedPageIndex === pages.length - 1}
                      className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 md:right-6"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                <div
                  className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl"
                  style={{
                    cursor: imageZoom > 1 ? "grab" : "zoom-in",
                    touchAction: "none",
                  }}
                  onWheel={handleZoomWheel}
                  onPointerDown={handleZoomPointerDown}
                  onPointerMove={handleZoomPointerMove}
                  onPointerUp={handleZoomPointerUp}
                  onPointerCancel={handleZoomPointerUp}
                  onTouchStart={handleZoomTouchStart}
                  onTouchMove={handleZoomTouchMove}
                >
                  <Image
                    src={zoomedPage.imageUrl}
                    alt={`손편지 ${zoomedPageIndex !== null ? zoomedPageIndex + 1 : 1}페이지 확대 이미지`}
                    width={1600}
                    height={2200}
                    unoptimized
                    className="max-h-full max-w-full select-none object-contain"
                    draggable={false}
                    style={{
                      transform: `scale(${imageZoom}) translate(${imagePosition.x / imageZoom}px, ${imagePosition.y / imageZoom}px)`,
                      transition: isDraggingImage.current ? "none" : "transform 0.2s ease",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
