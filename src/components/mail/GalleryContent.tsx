'use client';

import { useState, useMemo, useRef, useCallback } from "react";

import {
  Image, Plus, Heart, Calendar, X, ChevronLeft, ChevronRight,
  Download, Trash2, FolderPlus, MoreVertical, Pencil, Mail,
  List, Grid3X3, Check, Clock, Send, ArrowLeft, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGalleryPhotos, type GalleryPhoto } from "@/hooks/useGalleryPhotos";
import { useGalleryFolders, type GalleryFolder } from "@/hooks/useGalleryFolders";
import { AddPhotoModal } from "./AddPhotoModal";

interface GalleryContentProps {
  onClose?: () => void;
}

export function GalleryContent({ onClose }: GalleryContentProps) {
  const {
    photos,
    isLoading,
    totalCount,
    favoritesCount,
    toggleFavorite: toggleFavoriteApi,
    deletePhoto,
    isDeleting,
    bulkDeletePhotos,
    isBulkDeleting,
  } = useGalleryPhotos();

  const {
    folders,
    isLoading: isFoldersLoading,
    createFolder: createFolderApi,
    isCreating: isCreatingFolder,
    updateFolder: updateFolderApi,
    isUpdating: isUpdatingFolder,
    deleteFolder: deleteFolderApi,
    isDeleting: isDeletingFolder,
  } = useGalleryFolders();

  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [filter, setFilter] = useState<"all" | "favorites" | "recent" | "sent">("all");
  const [viewMode, setViewMode] = useState<"thumbnail" | "list">("thumbnail");
  const [showFolderCreatePopup, setShowFolderCreatePopup] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderMenuOpen, setFolderMenuOpen] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderFilter, setFolderFilter] = useState<"all" | "favorites" | "recent" | "sent">("all");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const folderInputRef = useRef<HTMLInputElement>(null);

  // 선택된 폴더 정보
  const selectedFolder = selectedFolderId ? folders.find(f => f.id === selectedFolderId) : null;

  // 발송한 사진 수
  const sentCount = useMemo(() => photos.filter(p => (p as any).sentTo).length, [photos]);

  // 미분류 사진 (폴더에 속하지 않은 사진들) - 시간순 정렬
  const unclassifiedPhotos = useMemo(() =>
    photos
      .filter(p => !p.folderId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [photos]
  );

  // 필터링된 사진
  const filteredPhotos = useMemo(() => {
    switch (filter) {
      case "favorites":
        return photos.filter(p => p.isFavorite);
      case "recent":
        return [...photos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case "sent":
        return photos.filter(p => (p as any).sentTo);
      default:
        return photos;
    }
  }, [photos, filter]);

  // 선택 모드 토글
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds(new Set());
  };

  const toggleSelectPhoto = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = (photoList: GalleryPhoto[]) => {
    setSelectedIds(new Set(photoList.map(p => p.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size}개의 사진을 삭제하시겠습니까?`)) return;
    await bulkDeletePhotos(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  const handleToggleFavorite = async (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (!photo) return;

    await toggleFavoriteApi(id, photo.isFavorite);

    // 선택된 사진이면 로컬 상태도 업데이트
    if (selectedPhoto?.id === id) {
      setSelectedPhoto({ ...selectedPhoto, isFavorite: !selectedPhoto.isFavorite });
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm('이 사진을 삭제하시겠습니까?')) return;

    await deletePhoto(id);

    // 선택된 사진이면 모달 닫기
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(null);
    }
  };

  const navigatePhoto = (direction: "prev" | "next") => {
    if (!selectedPhoto) return;
    const currentPhotos = selectedFolderId ? getFolderPhotos() : (filter === "all" ? unclassifiedPhotos : filteredPhotos);
    const currentIndex = currentPhotos.findIndex(p => p.id === selectedPhoto.id);
    const newIndex = direction === "prev"
      ? (currentIndex - 1 + currentPhotos.length) % currentPhotos.length
      : (currentIndex + 1) % currentPhotos.length;
    setSelectedPhoto(currentPhotos[newIndex]);
  };

  // 폴더 생성
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolderApi({ name: newFolderName.trim() });
      setNewFolderName("");
      setShowFolderCreatePopup(false);
    } catch {
      // 에러는 hook에서 toast로 처리됨
    }
  };

  // 폴더 삭제
  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolderApi(folderId);
      setFolderMenuOpen(null);
    } catch {
      // 에러는 hook에서 toast로 처리됨
    }
  };

  // 폴더 이름 변경
  const handleRenameFolder = async (folderId: string) => {
    if (!editFolderName.trim()) return;
    try {
      await updateFolderApi({ id: folderId, name: editFolderName.trim() });
      setEditingFolderId(null);
      setEditFolderName("");
    } catch {
      // 에러는 hook에서 toast로 처리됨
    }
  };

  // 폴더 내 사진 필터링
  const getFolderPhotos = () => {
    if (!selectedFolderId) return [];
    let folderPhotos = photos.filter(p => p.folderId === selectedFolderId);

    switch (folderFilter) {
      case "favorites":
        folderPhotos = folderPhotos.filter(p => p.isFavorite);
        break;
      case "recent":
        folderPhotos = [...folderPhotos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "sent":
        folderPhotos = folderPhotos.filter(p => (p as any).sentTo);
        break;
      default:
        break;
    }
    return folderPhotos;
  };

  const folderPhotos = getFolderPhotos();

  // 사진 렌더링 컴포넌트
  const PhotoItem = ({ photo, index }: { photo: GalleryPhoto; index: number }) => {
    const photoAny = photo as any;

    if (viewMode === "list") {
      return (
        <div
          key={photo.id}
          className={cn(
            "flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100",
            isSelectMode && selectedIds.has(photo.id) && "bg-orange-50 border-orange-200"
          )}
          onClick={() => isSelectMode ? toggleSelectPhoto(photo.id) : setSelectedPhoto(photo)}
        >
          {/* 선택 모드 체크박스 */}
          {isSelectMode && (
            <div className={cn(
              "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              selectedIds.has(photo.id)
                ? "bg-orange-500 border-orange-500"
                : "border-gray-300"
            )}>
              {selectedIds.has(photo.id) && <Check className="w-4 h-4 text-white" />}
            </div>
          )}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={photo.url}
              alt={photo.caption || "갤러리 사진"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {photo.caption || "제목 없음"}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {new Date(photo.date).toLocaleDateString("ko-KR")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {photo.isFavorite && (
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            )}
          </div>
          {/* 발송 완료 표시 */}
          {photoAny.sentTo && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-[17px]">
              <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                </svg>
              </div>
              <span>발송 1회</span>
            </div>
          )}
        </div>
      );
    }

    // 썸네일 뷰
    return (
      <div
        key={photo.id}
        className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-muted"
        onClick={() => isSelectMode ? toggleSelectPhoto(photo.id) : setSelectedPhoto(photo)}
      >
        {/* 선택 모드 체크 오버레이 */}
        {isSelectMode && (
          <div className={cn(
            "absolute inset-0 z-10 transition-colors",
            selectedIds.has(photo.id) ? "bg-black/30" : ""
          )}>
            <div className={cn(
              "absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              selectedIds.has(photo.id)
                ? "bg-orange-500 border-orange-500"
                : "border-white bg-black/20"
            )}>
              {selectedIds.has(photo.id) && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>
        )}
        <img
          src={photo.url}
          alt={photo.caption || "갤러리 사진"}
          loading="lazy"
          className="w-full h-full object-cover"
        />

        {/* 오버레이 - 선택 모드 아닐 때만 */}
        {!isSelectMode && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        )}

        {/* 즐겨찾기 표시 */}
        {photo.isFavorite && (
          <div className="absolute top-2 right-2">
            <Heart className="w-5 h-5 text-white fill-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          </div>
        )}

        {/* 발송 완료 표시 */}
        {photoAny.sentTo && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-xs text-white bg-black/50 px-2.5 py-1.5 rounded-[17px]">
            <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
              </svg>
            </div>
            <span>발송 1회</span>
          </div>
        )}

        {/* 캡션 (발송 완료가 없을 때만) */}
        {!photoAny.sentTo && (
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {photo.caption && (
              <p className="text-white text-sm font-medium line-clamp-2 mb-1">
                {photo.caption}
              </p>
            )}
            <p className="text-white/70 text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(photo.date).toLocaleDateString("ko-KR")}
            </p>
          </div>
        )}
      </div>
    );
  };

  // 폴더 카드 컴포넌트
  const FolderCard = ({ folder }: { folder: GalleryFolder }) => {
    return (
      <div className="relative group">
        <div
          className="bg-orange-50 rounded-xl px-4 py-3 cursor-pointer hover:bg-orange-100 transition-colors flex items-center gap-3"
          onClick={() => {
            setSelectedFolderId(folder.id);
            setFolderFilter("all");
          }}
        >
          {/* 폴더 아이콘 */}
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-orange-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
          </div>

          {/* 폴더 이름 */}
          <div className="flex-1 min-w-0">
            {editingFolderId === folder.id ? (
              <input
                ref={folderInputRef}
                type="text"
                value={editFolderName}
                onChange={(e) => setEditFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameFolder(folder.id);
                  if (e.key === "Escape") {
                    setEditingFolderId(null);
                    setEditFolderName("");
                  }
                }}
                onBlur={() => handleRenameFolder(folder.id)}
                className="w-full text-sm font-medium bg-white border border-orange-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
            ) : (
              <p className="text-sm font-medium text-gray-900 truncate">{folder.name}</p>
            )}
          </div>

          {/* 더보기 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFolderMenuOpen(folderMenuOpen === folder.id ? null : folder.id);
            }}
            className="flex-shrink-0 p-1 rounded-full hover:bg-orange-200 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* 폴더 메뉴 */}
        
          {folderMenuOpen === folder.id && (
            <div
              className="absolute top-10 right-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 min-w-[180px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  // 다운로드 기능
                  setFolderMenuOpen(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                다운로드
              </button>
              <button
                onClick={() => {
                  setEditingFolderId(folder.id);
                  setEditFolderName(folder.name);
                  setFolderMenuOpen(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="w-4 h-4" />
                이름 바꾸기
              </button>
              <button
                onClick={() => {
                  // 편지쓰기로 사진동봉 기능
                  setFolderMenuOpen(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Mail className="w-4 h-4" />
                편지쓰기로 사진동봉
              </button>
              <hr className="my-2 border-gray-100" />
              <button
                onClick={() => handleDeleteFolder(folder.id)}
                disabled={isDeletingFolder}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {isDeletingFolder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                휴지통으로 이동
              </button>
            </div>
          )}
      </div>
    );
  };

  // 사진 상세 모달
  const PhotoDetailModal = () => {
    if (!selectedPhoto) return null;
    const photoAny = selectedPhoto as any;

    return (
      <div
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        onClick={() => setSelectedPhoto(null)}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={() => setSelectedPhoto(null)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 이전/다음 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigatePhoto("prev");
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigatePhoto("next");
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* 이미지 & 정보 */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="max-w-4xl max-h-[90vh] flex flex-col"
        >
          <img
            src={selectedPhoto.url}
            alt={selectedPhoto.caption || "갤러리 사진"}
            className="max-h-[70vh] w-auto object-contain rounded-lg"
          />

          {/* 사진 정보 */}
          <div className="mt-4 text-center">
            {selectedPhoto.caption && (
              <h3 className="text-white text-lg font-medium mb-2">
                "{selectedPhoto.caption}"
              </h3>
            )}
            <p className="text-white/60 text-sm flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(selectedPhoto.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            {/* 발송 정보 */}
            {photoAny.sentTo && (
              <p className="text-green-400 text-sm flex items-center justify-center gap-2 mt-2">
                <Check className="w-4 h-4" />
                {photoAny.sentTo}님에게 발송완료 ({photoAny.sentDate})
              </p>
            )}

            {/* 액션 버튼들 */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => handleToggleFavorite(selectedPhoto.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                  selectedPhoto.isFavorite
                    ? "bg-red-500 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <Heart className={cn("w-4 h-4", selectedPhoto.isFavorite && "fill-current")} />
                {selectedPhoto.isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
              </button>
              <a
                href={selectedPhoto.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 text-sm font-medium transition-all"
              >
                <Download className="w-4 h-4" />
                다운로드
              </a>
              <button
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-red-500/80 text-sm font-medium transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 폴더 상세 화면
  if (selectedFolder) {
    const allFolderPhotos = photos.filter(p => p.folderId === selectedFolderId);

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Header */}
        <header className="hidden md:flex h-14 border-b border-border/40 bg-white/80 backdrop-blur-sm items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedFolderId(null)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
              </svg>
              <h1 className="text-lg font-semibold text-foreground">{selectedFolder.name}</h1>
            </div>
          </div>
          <Button
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600"
            onClick={() => setShowAddPhotoModal(true)}
          >
            <Plus className="w-4 h-4" />
            사진 추가
          </Button>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto px-4 py-6 md:py-10 lg:px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 필터 탭 */}
            <div className="flex gap-2">
              <button
                onClick={() => setFolderFilter("all")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  folderFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                전체 ({allFolderPhotos.length})
              </button>
              <button
                onClick={() => setFolderFilter("favorites")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                  folderFilter === "favorites"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                <Heart className={cn("w-3.5 h-3.5", folderFilter === "favorites" && "fill-current")} />
                즐겨찾기 ({allFolderPhotos.filter(p => p.isFavorite).length})
              </button>
              <button
                onClick={() => setFolderFilter("recent")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                  folderFilter === "recent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                <Clock className={cn("w-3.5 h-3.5")} />
                등록순
              </button>
              <button
                onClick={() => setFolderFilter("sent")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                  folderFilter === "sent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                <Send className={cn("w-3.5 h-3.5")} />
                발송한 이미지 ({allFolderPhotos.filter(p => (p as any).sentTo).length})
              </button>
            </div>

            {/* 사진 영역 */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              {/* 타이틀 & 뷰 모드 토글 */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">
                  {folderFilter === "all" ? "전체" :
                   folderFilter === "favorites" ? "즐겨찾기" :
                   folderFilter === "recent" ? "등록순" : "발송한 이미지"} ({folderPhotos.length})
                </h3>
                <div className="flex items-center bg-gray-100 rounded-full p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-full transition-all",
                      viewMode === "list"
                        ? "bg-white shadow-sm text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("thumbnail")}
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-full transition-all",
                      viewMode === "thumbnail"
                        ? "bg-white shadow-sm text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {folderPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center mb-4">
                    <Image className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {folderFilter === "favorites" ? "즐겨찾기한 사진이 없어요" :
                     folderFilter === "sent" ? "발송한 이미지가 없어요" :
                     "폴더에 사진이 없어요"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-[280px]">
                    {folderFilter === "favorites"
                      ? "하트를 눌러 소중한 사진을 즐겨찾기에 추가해보세요"
                      : folderFilter === "sent"
                      ? "편지와 함께 사진을 보내보세요"
                      : "사진을 추가해서 소중한 추억을 보관하세요"}
                  </p>
                </div>
              ) : viewMode === "list" ? (
                <div className="space-y-2">
                  
                    {folderPhotos.map((photo, index) => (
                      <PhotoItem key={photo.id} photo={photo} index={index} />
                    ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  
                    {folderPhotos.map((photo, index) => (
                      <PhotoItem key={photo.id} photo={photo} index={index} />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 사진 상세 모달 */}
        
          <PhotoDetailModal />

        {/* 사진 추가 모달 */}
        <AddPhotoModal
          isOpen={showAddPhotoModal}
          onClose={() => setShowAddPhotoModal(false)}
          defaultFolderId={selectedFolderId}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <header className="hidden md:flex h-14 border-b border-border/40 bg-white/80 backdrop-blur-sm items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-foreground">갤러리</h1>
        <Button variant="ghost" size="sm" onClick={onClose} className="hidden">
          편지함으로 돌아가기
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 py-6 md:py-10 lg:px-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* 타이틀 */}
          <div className="mb-[18px]">
            <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-[18px]">
              소중한 <span className="text-primary underline underline-offset-4">추억</span>을 보관하세요
            </h2>
            <div className="mb-6">
              <p className="text-size-15 md:text-base text-muted-foreground leading-normal">
                편지 작성 시 갤러리에서 사진을 첨부할 수 있어요.
                <br />
                소중한 순간들을 이곳에 보관하고, 편지를 쓸 때 함께 전해보세요.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                className="gap-2 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-[0_4px_14px_rgba(251,146,60,0.3)]"
                onClick={() => setShowAddPhotoModal(true)}
              >
                <Plus className="w-4 h-4" />
                사진 추가
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-gray-300"
                onClick={() => setShowFolderCreatePopup(true)}
              >
                <FolderPlus className="w-4 h-4" />
                폴더 생성
              </Button>
              {photos.length > 0 && (
                <Button
                  variant="outline"
                  className={cn("gap-2 border-gray-300", isSelectMode && "bg-gray-100")}
                  onClick={toggleSelectMode}
                >
                  {isSelectMode ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {isSelectMode ? "취소" : "선택"}
                </Button>
              )}
            </div>
          </div>

          {/* 폴더 영역 */}
          {folders.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">폴더</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folders.map(folder => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
              </div>
            </div>
          )}

          {/* 선택 모드 액션 바 */}
          {isSelectMode && (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedIds.size}개 선택됨
                </span>
                <button
                  onClick={() => handleSelectAll(filter === "all" ? unclassifiedPhotos : filteredPhotos)}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  전체 선택
                </button>
                {selectedIds.size > 0 && (
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm text-gray-500 hover:text-gray-600 font-medium"
                  >
                    선택 해제
                  </button>
                )}
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5"
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0 || isBulkDeleting}
              >
                {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {selectedIds.size}개 삭제
              </Button>
            </div>
          )}

          {/* 필터 탭 */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              )}
            >
              전체 ({totalCount})
            </button>
            <button
              onClick={() => setFilter("favorites")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                filter === "favorites"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", filter === "favorites" && "fill-current")} />
              즐겨찾기 ({favoritesCount})
            </button>
            <button
              onClick={() => setFilter("recent")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                filter === "recent"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              )}
            >
              <Clock className={cn("w-3.5 h-3.5")} />
              등록순
            </button>
            <button
              onClick={() => setFilter("sent")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                filter === "sent"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              )}
            >
              <Send className={cn("w-3.5 h-3.5")} />
              발송한 이미지 ({sentCount})
            </button>
          </div>

          {/* 전체 사진 영역 */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            {/* 전체 타이틀 & 뷰 모드 토글 */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                {filter === "all" ? "전체" :
                 filter === "favorites" ? "즐겨찾기" :
                 filter === "recent" ? "등록순" : "발송한 이미지"} ({filter === "all" ? unclassifiedPhotos.length : filteredPhotos.length})
              </h3>
              {/* 뷰 모드 토글 */}
              <div className="flex items-center bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full transition-all",
                    viewMode === "list"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("thumbnail")}
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full transition-all",
                    viewMode === "thumbnail"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isLoading ? (
              /* 스켈레톤 로딩 UI */
              <div className={cn(
                viewMode === "list" ? "space-y-2" : "grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              )}>
                {Array.from({ length: 10 }).map((_, index) => (
                  viewMode === "list" ? (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-xl border border-gray-100"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="w-16 h-16 rounded-lg bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ) : (
                    <div
                      key={index}
                      className="aspect-square rounded-xl bg-muted animate-pulse"
                      style={{ animationDelay: `${index * 50}ms` }}
                    />
                  )
                ))}
              </div>
            ) : (filter === "all" ? unclassifiedPhotos : filteredPhotos).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center mb-4">
                  <Image className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {filter === "favorites" ? "즐겨찾기한 사진이 없어요" :
                   filter === "sent" ? "발송한 이미지가 없어요" :
                   "아직 추억이 없어요"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-[280px]">
                  {filter === "favorites"
                    ? "하트를 눌러 소중한 사진을 즐겨찾기에 추가해보세요"
                    : filter === "sent"
                    ? "편지와 함께 사진을 보내보세요"
                    : "기다림의 순간들을 사진으로 담아보세요. 편지와 함께 전할 수 있어요."}
                </p>
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-2">
                
                  {(filter === "all" ? unclassifiedPhotos : filteredPhotos).map((photo, index) => (
                    <PhotoItem key={photo.id} photo={photo} index={index} />
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                
                  {(filter === "all" ? unclassifiedPhotos : filteredPhotos).map((photo, index) => (
                    <PhotoItem key={photo.id} photo={photo} index={index} />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 폴더 생성 팝업 */}
      
        {showFolderCreatePopup && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
            onClick={() => setShowFolderCreatePopup(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">새 폴더 만들기</h3>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                }}
                placeholder="폴더 이름을 입력하세요"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowFolderCreatePopup(false);
                    setNewFolderName("");
                  }}
                >
                  취소
                </Button>
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim() || isCreatingFolder}
                >
                  {isCreatingFolder ? <Loader2 className="w-4 h-4 animate-spin" /> : "만들기"}
                </Button>
              </div>
            </div>
          </div>
        )}

      {/* 사진 상세 모달 */}
      
        <PhotoDetailModal />

      {/* 사진 추가 모달 */}
      <AddPhotoModal
        isOpen={showAddPhotoModal}
        onClose={() => setShowAddPhotoModal(false)}
        defaultFolderId={null}
      />

      {/* 클릭 외부 영역 클릭시 폴더 메뉴 닫기 */}
      {folderMenuOpen && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setFolderMenuOpen(null)}
        />
      )}
    </div>
  );
}
