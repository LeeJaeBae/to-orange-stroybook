import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Plus, X, ZoomIn, RotateCw, Loader2, Upload, ImageIcon, Check, Send, Heart, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/fetch";
import { usePhotoUploadStore } from "@/stores/photoUploadStore";
import { useGalleryPhotos, type GalleryPhoto } from "@/hooks/useGalleryPhotos";
import { useGalleryFolders } from "@/hooks/useGalleryFolders";

interface PhotoUploadProps {
  maxPhotos?: number;
}

type TabType = "upload" | "gallery";

export function PhotoUpload({ maxPhotos = 10 }: PhotoUploadProps) {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { photos, addPhoto, removePhoto, updatePhotoRotation } = usePhotoUploadStore();
  const { photos: galleryPhotos, isLoading: isGalleryLoading } = useGalleryPhotos();
  const { folders } = useGalleryFolders();

  // 폴더별 필터링된 갤러리 사진
  const filteredGalleryPhotos = useMemo(() => {
    if (selectedFolderId === null) {
      return galleryPhotos;
    }
    return galleryPhotos.filter(p => p.folderId === selectedFolderId);
  }, [galleryPhotos, selectedFolderId]);

  // 이미 선택된 사진 URL 목록
  const selectedUrls = useMemo(() => new Set(photos.map(p => p.url)), [photos]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      toast.warning(`최대 ${maxPhotos}장까지 추가할 수 있습니다`);
      return;
    }

    const filesToProcess = Math.min(files.length, remainingSlots);
    let uploadedCount = 0;

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        toast.warning("이미지 파일만 업로드할 수 있습니다");
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.warning("파일 크기는 10MB 이하여야 합니다");
        continue;
      }

      // 임시 ID로 로딩 상태 표시
      const tempId = `temp-${Date.now()}-${i}`;
      const previewUrl = URL.createObjectURL(file);

      addPhoto({
        id: tempId,
        url: previewUrl,
        path: '',
        rotation: 0,
        isUploading: true,
      });

      try {
        // 즉시 Supabase에 업로드
        const formData = new FormData();
        formData.append('file', file);
        formData.append('isTemp', 'true');

        const response = await apiFetch('/api/v1/uploads/images', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          const errorMessage = errorBody.reason
            ? `${errorBody.error}: ${errorBody.reason}`
            : (errorBody.error || '사진 업로드에 실패했습니다.');
          throw new Error(errorMessage);
        }

        const { url, path } = await response.json();

        // 업로드 성공 - 임시 항목 제거하고 실제 데이터 추가
        removePhoto(tempId);
        URL.revokeObjectURL(previewUrl);

        addPhoto({
          id: path, // path를 id로 사용
          url,
          path,
          rotation: 0,
          isUploading: false,
        });

        uploadedCount++;
      } catch (error) {
        // 업로드 실패 - 임시 항목 제거
        removePhoto(tempId);
        URL.revokeObjectURL(previewUrl);
        toast.error(error instanceof Error ? error.message : '사진 업로드에 실패했습니다.');
      }
    }

    if (uploadedCount > 0) {
      toast.success(`${uploadedCount}장의 사진이 업로드되었습니다`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (id: string) => {
    removePhoto(id);
    if (selectedPhotoId === id) {
      setSelectedPhotoId(null);
    }
  };

  const handleRotatePhoto = (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (photo) {
      updatePhotoRotation(id, (photo.rotation + 90) % 360);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // 갤러리 사진 선택/해제
  const handleGalleryPhotoToggle = (galleryPhoto: GalleryPhoto) => {
    const isSelected = selectedUrls.has(galleryPhoto.url);

    if (isSelected) {
      // 선택 해제
      const photoToRemove = photos.find(p => p.url === galleryPhoto.url);
      if (photoToRemove) {
        removePhoto(photoToRemove.id);
      }
    } else {
      // 선택
      if (photos.length >= maxPhotos) {
        toast.warning(`최대 ${maxPhotos}장까지 추가할 수 있습니다`);
        return;
      }

      addPhoto({
        id: `gallery-${galleryPhoto.id}`,
        url: galleryPhoto.url,
        path: galleryPhoto.url,
        rotation: 0,
        isUploading: false,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2.5">
        <Image className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-base font-semibold text-foreground">사진 출력 추가</h2>
          <p className="text-muted-foreground text-xs">편지와 함께 사진을 동봉해보세요</p>
        </div>
      </div>

      {/* 흰색 라운딩 박스 - 메인 컨테이너 */}
      <div className="bg-card rounded-3xl p-6 shadow-lg border border-border/50 space-y-6">
        {/* 사진 인화 서비스 안내 */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-card flex items-center justify-center shrink-0 text-2xl">
              📸
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">사진 인화 서비스</h3>
              <p className="text-sm text-muted-foreground">
                업로드하신 사진은 <span className="text-orange-600 dark:text-orange-400 font-medium">고품질 사진 인화지에 인화</span>되어 편지와 함께 동봉됩니다. 소중한 추억을 선물하세요!
              </p>
            </div>
          </div>
        </div>

        {/* 탭 선택 */}
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
          <button
            onClick={() => setActiveTab("upload")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === "upload"
                ? "bg-white dark:bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Upload className="w-4 h-4" />
            직접 업로드
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === "gallery"
                ? "bg-white dark:bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ImageIcon className="w-4 h-4" />
            갤러리에서 선택
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <AnimatePresence mode="wait">
          {activeTab === "upload" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* 사진 그리드 */}
              <div className="bg-muted/30 rounded-2xl p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {/* 업로드된 사진들 */}
                  <AnimatePresence>
                    {photos.map((photo) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-border group"
                      >
                        <img
                          src={photo.url}
                          alt="업로드된 사진"
                          className="w-full h-full object-cover transition-transform duration-300"
                          style={{ transform: `rotate(${photo.rotation}deg)` }}
                        />

                        {/* 업로드 중 오버레이 */}
                        {photo.isUploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                              <span className="text-xs text-white">업로드 중...</span>
                            </div>
                          </div>
                        )}

                        {/* 호버 오버레이 */}
                        {!photo.isUploading && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleRotatePhoto(photo.id)}
                              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                              title="회전"
                            >
                              <RotateCw className="w-4 h-4 text-white" />
                            </button>
                            <button
                              onClick={() => setSelectedPhotoId(photo.id)}
                              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                              title="확대"
                            >
                              <ZoomIn className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        )}

                        {/* 삭제 버튼 */}
                        {!photo.isUploading && (
                          <button
                            onClick={() => handleRemovePhoto(photo.id)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* 사진 추가 버튼 */}
                  {photos.length < maxPhotos && (
                    <button
                      onClick={openFilePicker}
                      className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary bg-card"
                    >
                      <Plus className="w-8 h-8" />
                      <span className="text-sm font-medium">추가</span>
                    </button>
                  )}
                </div>

                {/* 사진 개수 표시 */}
                {photos.length > 0 && (
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {photos.length} / {maxPhotos}장 선택됨
                    </span>
                    <span className="text-primary font-medium">
                      +{photos.length * 500}원
                    </span>
                  </div>
                )}

                {/* 숨겨진 파일 입력 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* 갤러리 사진 선택 */}
              <div className="bg-muted/30 rounded-2xl p-6 space-y-4">
                {/* 폴더 필터 */}
                {folders.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedFolderId(null)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                        selectedFolderId === null
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      전체
                    </button>
                    {folders.map(folder => (
                      <button
                        key={folder.id}
                        onClick={() => setSelectedFolderId(folder.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                          selectedFolderId === folder.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        {folder.name}
                      </button>
                    ))}
                  </div>
                )}

                {isGalleryLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : filteredGalleryPhotos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-foreground mb-1">갤러리가 비어있어요</h3>
                    <p className="text-sm text-muted-foreground">
                      갤러리에 사진을 먼저 추가해주세요
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredGalleryPhotos.map((photo) => {
                      const isSelected = selectedUrls.has(photo.url);
                      return (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            "relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all",
                            isSelected
                              ? "ring-3 ring-primary ring-offset-2"
                              : "hover:ring-2 hover:ring-primary/50"
                          )}
                          onClick={() => handleGalleryPhotoToggle(photo)}
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption || "갤러리 사진"}
                            className="w-full h-full object-cover"
                          />

                          {/* 선택 체크마크 */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                              <Check className="w-4 h-4" />
                            </div>
                          )}

                          {/* 즐겨찾기 표시 */}
                          {photo.isFavorite && !isSelected && (
                            <div className="absolute top-2 left-2">
                              <Heart className="w-4 h-4 text-white fill-white drop-shadow-md" />
                            </div>
                          )}

                          {/* 발송 횟수 배지 */}
                          {photo.sentCount > 0 && (
                            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                              <Send className="w-3 h-3" />
                              <span>{photo.sentCount}회 발송</span>
                            </div>
                          )}

                          {/* 호버 오버레이 */}
                          <div className={cn(
                            "absolute inset-0 bg-black/30 transition-opacity",
                            isSelected ? "opacity-0" : "opacity-0 hover:opacity-100"
                          )} />
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* 선택된 사진 수 표시 */}
                {photos.length > 0 && (
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {photos.length} / {maxPhotos}장 선택됨
                    </span>
                    <span className="text-primary font-medium">
                      +{photos.length * 500}원
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 가격 안내 - 사진이 있을 때만 표시 */}
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl p-4 border border-orange-200/50 dark:border-orange-800/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">사진 인화 비용</p>
                <p className="text-sm text-muted-foreground">1장당 500원 (4x6 사이즈)</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  +{(photos.length * 500).toLocaleString()}원
                </p>
                <p className="text-xs text-muted-foreground">{photos.length}장 선택</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 안내 메시지 */}
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">
            💡 사진을 추가하지 않으셔도 진행 가능해요
          </p>
        </div>
      </div>

      {/* 사진 확대 모달 */}
      <AnimatePresence>
        {selectedPhotoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedPhotoId(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-3xl max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos.find((p) => p.id === selectedPhotoId)?.url}
                alt="확대된 사진"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                style={{
                  transform: `rotate(${photos.find((p) => p.id === selectedPhotoId)?.rotation || 0}deg)`,
                }}
              />
              <button
                onClick={() => setSelectedPhotoId(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
