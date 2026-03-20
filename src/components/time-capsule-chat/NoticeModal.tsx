"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Plus, Pin, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/fetch";

interface NoticeData {
  id: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorNickname: string | null;
  authorRelation: string | null;
  authorRole: string | null;
}

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeCapsuleId: string;
  isOwner: boolean;
  onNoticesUpdate?: (notices: NoticeData[]) => void;
}

export function NoticeModal({ isOpen, onClose, timeCapsuleId, isOwner, onNoticesUpdate }: NoticeModalProps) {
  const [notices, setNotices] = useState<NoticeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/v1/time-capsules/${timeCapsuleId}/notices`);
      const data = await res.json();
      if (data.data) {
        setNotices(data.data);
        onNoticesUpdate?.(data.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeCapsuleId]);

  useEffect(() => {
    if (isOpen) fetchNotices();
  }, [isOpen, fetchNotices]);

  const handleCreate = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      const res = await apiFetch(`/api/v1/time-capsules/${timeCapsuleId}/notices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), isPinned }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "공지 등록 실패");
        return;
      }
      toast.success("공지사항이 등록되었습니다");
      setContent("");
      setIsPinned(false);
      setIsCreating(false);
      fetchNotices();
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (noticeId: string) => {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      const res = await apiFetch(`/api/v1/time-capsules/${timeCapsuleId}/notices/${noticeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), isPinned }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "수정 실패");
        return;
      }
      toast.success("공지사항이 수정되었습니다");
      setEditingId(null);
      setContent("");
      setIsPinned(false);
      fetchNotices();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (noticeId: string) => {
    if (!confirm("공지사항을 삭제하시겠습니까?")) return;
    try {
      await apiFetch(`/api/v1/time-capsules/${timeCapsuleId}/notices/${noticeId}`, {
        method: "DELETE",
      });
      toast.success("삭제되었습니다");
      fetchNotices();
    } catch {
      toast.error("삭제 실패");
    }
  };

  const startEdit = (notice: NoticeData) => {
    setEditingId(notice.id);
    setContent(notice.content);
    setIsPinned(notice.isPinned);
    setIsCreating(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setContent("");
    setIsPinned(false);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setContent("");
    setIsPinned(false);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-[32px] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">공지사항</h2>
          <div className="flex items-center gap-2">
            {isOwner && !isCreating && !editingId && (
              <button onClick={startCreate} className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full">
                <Plus className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        {(isCreating || editingId) && (
          <div className="px-5 py-4 border-b bg-muted/30 space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지 내용을 입력하세요"
              className="w-full h-24 p-3 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded"
                />
                <Pin className="w-3.5 h-3.5" />
                상단 고정
              </label>
              <div className="flex gap-2">
                <button onClick={cancelForm} className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-lg">
                  취소
                </button>
                <button
                  onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
                  disabled={isSaving || !content.trim()}
                  className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"
                >
                  {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                  {editingId ? "수정" : "등록"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : notices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">등록된 공지사항이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y">
              {notices.map((notice) => (
                <div key={notice.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {notice.isPinned && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mb-1">
                          📌 고정됨
                        </span>
                      )}
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">{notice.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notice.authorRelation || notice.authorNickname || "관리자"} · {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    {isOwner && (
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => startEdit(notice)} className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-full">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleDelete(notice.id)} className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-full">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
