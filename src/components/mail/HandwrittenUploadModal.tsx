import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, Image, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface HandwrittenUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
}

export function HandwrittenUploadModal({ isOpen, onClose }: HandwrittenUploadModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.warning("이미지 파일만 업로드 가능합니다.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.warning("파일 크기는 10MB 이하여야 합니다.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setUploadedFiles((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

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
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleProcess = async () => {
    if (uploadedFiles.length === 0) {
      toast.warning("업로드할 이미지를 선택해주세요.");
      return;
    }

    setIsProcessing(true);
    
    // Simulate OCR processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast.success("손편지가 성공적으로 변환되었습니다!");
    setIsProcessing(false);
    setUploadedFiles([]);
    onClose();
  };

  const handleClose = () => {
    if (!isProcessing) {
      setUploadedFiles([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-orange-500" />
            손편지 자동등록
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            손편지 사진을 업로드하면 OCR로 자동 변환되어 발송용 문장으로 정리됩니다.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              isDragging
                ? "border-orange-500 bg-orange-50"
                : "border-border hover:border-orange-400 hover:bg-orange-50/50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <Upload className={cn(
              "w-12 h-12 mx-auto mb-4",
              isDragging ? "text-orange-500" : "text-muted-foreground"
            )} />
            <p className="text-sm font-medium text-foreground mb-1">
              클릭하거나 이미지를 드래그하세요
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, JPEG (최대 10MB, 여러 장 가능)
            </p>
          </div>

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground mb-3">
                업로드된 이미지 ({uploadedFiles.length}장)
              </p>
              <div className="grid grid-cols-3 gap-3">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-border"
                  >
                    <img
                      src={file.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="p-2 bg-white rounded-full text-destructive hover:bg-destructive hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-size-10 px-1.5 py-0.5 rounded">
                      {index + 1}장
                    </div>
                  </div>
                ))}
                
                {/* Add More Button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-orange-400 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <div className="text-center">
                    <Image className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">추가</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            onClick={handleProcess}
            disabled={uploadedFiles.length === 0 || isProcessing}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                변환 중...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                OCR 변환하기
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
