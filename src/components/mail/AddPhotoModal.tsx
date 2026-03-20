'use client';

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image, Loader2, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGalleryPhotos } from "@/hooks/useGalleryPhotos";
import { useGalleryFolders, type GalleryFolder } from "@/hooks/useGalleryFolders";

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFolderId?: string | null;
}

interface PendingPhoto {
  id: string;
  file: File;
  preview: string;
  caption: string;
  isUploading: boolean;
  error?: string;
}

export function AddPhotoModal({ isOpen, onClose, defaultFolderId }: AddPhotoModalProps) {
  const { uploadPhoto } = useGalleryPhotos();
  const { folders } = useGalleryFolders();

  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(defaultFolderId || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 유효성 검사
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'JPG, PNG, WebP, GIF 형식만 지원됩니다';
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return '파일 크기는 10MB 이하여야 합니다';
    }
    return null;
  };

  // 파일 추가
  const addFiles = useCallback((files: FileList | File[]) => {
    const newPhotos: PendingPhoto[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      const preview = URL.createObjectURL(file);

      newPhotos.push({
        id: crypto.randomUUID(),
        file,
        preview,
        caption: '',
        isUploading: false,
        error: error || undefined,
      });
    });

    setPendingPhotos(prev => [...prev, ...newPhotos]);
  }, []);

  // 파일 제거
  const removePhoto = (id: string) => {
    setPendingPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter(p => p.id !== id);
    });
  };

  // 캡션 수정
  const updateCaption = (id: string, caption: string) => {
    setPendingPhotos(prev =>
      prev.map(p => p.id === id ? { ...p, caption } : p)
    );
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      addFiles(files);
    }
  };

  // 파일 선택
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
    // 같은 파일 다시 선택할 수 있도록 초기화
    e.target.value = '';
  };

  // 업로드 실행
  const handleUpload = async () => {
    const validPhotos = pendingPhotos.filter(p => !p.error);
    if (validPhotos.length === 0) return;

    setIsUploading(true);

    for (const photo of validPhotos) {
      setPendingPhotos(prev =>
        prev.map(p => p.id === photo.id ? { ...p, isUploading: true } : p)
      );

      try {
        await uploadPhoto({
          file: photo.file,
          caption: photo.caption || undefined,
          folderId: selectedFolderId,
        });

        // 성공하면 목록에서 제거
        setPendingPhotos(prev => {
          const p = prev.find(item => item.id === photo.id);
          if (p) URL.revokeObjectURL(p.preview);
          return prev.filter(item => item.id !== photo.id);
        });
      } catch (error) {
        // 실패하면 에러 표시
        setPendingPhotos(prev =>
          prev.map(p => p.id === photo.id ? {
            ...p,
            isUploading: false,
            error: error instanceof Error ? error.message : '업로드 실패'
          } : p)
        );
      }
    }

    setIsUploading(false);

    // 모든 사진이 업로드되면 모달 닫기
    if (pendingPhotos.filter(p => !p.error).length === validPhotos.length) {
      handleClose();
    }
  };

  // 모달 닫기
  const handleClose = () => {
    // 미리보기 URL 정리
    pendingPhotos.forEach(p => URL.revokeObjectURL(p.preview));
    setPendingPhotos([]);
    setSelectedFolderId(defaultFolderId || null);
    onClose();
  };

  if (!isOpen) return null;

  const validPhotosCount = pendingPhotos.filter(p => !p.error).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">사진 추가</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 본문 */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* 폴더 선택 */}
            {folders.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  저장할 폴더 (선택)
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedFolderId(null)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      selectedFolderId === null
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    미분류
                  </button>
                  {folders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolderId(folder.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                        selectedFolderId === folder.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      {folder.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 드래그 앤 드롭 영역 */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                isDragging
                  ? "border-orange-400 bg-orange-50"
                  : "border-gray-300 hover:border-orange-400 hover:bg-orange-50/50"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-orange-500" />
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900">
                    사진을 드래그하거나 클릭해서 선택하세요
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG, WebP, GIF • 최대 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* 대기 중인 사진 목록 */}
            {pendingPhotos.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-700">
                  선택된 사진 ({pendingPhotos.length}장)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pendingPhotos.map(photo => (
                    <div
                      key={photo.id}
                      className={cn(
                        "relative rounded-xl overflow-hidden border",
                        photo.error ? "border-red-300 bg-red-50" : "border-gray-200"
                      )}
                    >
                      <div className="aspect-square relative">
                        <img
                          src={photo.preview}
                          alt="미리보기"
                          className="w-full h-full object-cover"
                        />
                        {photo.isUploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                          </div>
                        )}
                        {!photo.isUploading && (
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="p-2">
                        <input
                          type="text"
                          value={photo.caption}
                          onChange={(e) => updateCaption(photo.id, e.target.value)}
                          placeholder="캡션 (선택)"
                          disabled={photo.isUploading}
                          className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                        />
                        {photo.error && (
                          <p className="text-xs text-red-500 mt-1">{photo.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              취소
            </Button>
            <Button
              onClick={handleUpload}
              disabled={validPhotosCount === 0 || isUploading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  업로드 중...
                </>
              ) : (
                `업로드 (${validPhotosCount}장)`
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
