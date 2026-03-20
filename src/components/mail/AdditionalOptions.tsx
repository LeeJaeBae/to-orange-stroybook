import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Gift, Eye, Plus, Check, X, RefreshCw, Sparkles, Upload, FileText, Trash2, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/fetch";
import {
  DOCUMENT_BLACK_WHITE_PRICE,
  DOCUMENT_COLOR_PRICE,
  DOCUMENT_PRINT_MODE_LABELS,
  MAX_DOCUMENT_COUNT,
  MAX_DOCUMENT_FILE_SIZE,
  calculateDocumentPrice,
  createUserDocument,
  getDocumentTypeLabel,
  getDocumentUnitPrice,
  isImageDocument,
  type UserDocument,
} from "@/lib/document-pricing";

export type PreviewType = 'text' | 'image' | 'fortune' | 'sudoku' | 'questions' | 'humor' | 'parole-calc' | 'user-document';
export type { UserDocument } from "@/lib/document-pricing";

export interface AdditionalItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  isNew?: boolean;
  previewContent?: string;
  previewType?: PreviewType;
  previewImageUrl?: string;
  price?: number;
  image?: string;
  isGift?: boolean;
}

// ===== 인터랙티브 미리보기 컴포넌트들 =====

// 운세/타로 미리보기
function FortunePreview() {
  const fortunes = [
    { category: "오늘의 운세", content: "새로운 시작을 위한 좋은 날입니다. 긍정적인 마음가짐이 행운을 가져다줄 것입니다." },
    { category: "사랑운", content: "소중한 사람과의 관계가 더욱 깊어지는 시기입니다. 마음을 표현하세요." },
    { category: "금전운", content: "꾸준한 노력이 결실을 맺는 시기입니다. 작은 것부터 차근차근 준비하세요." },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleNext = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % fortunes.length);
      setIsFlipping(false);
    }, 300);
  };

  return (
    <div className="space-y-4">
      <motion.div
        animate={{ rotateY: isFlipping ? 180 : 0, opacity: isFlipping ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl p-6 text-center"
      >
        <div className="text-4xl mb-3">🔮</div>
        <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
          {fortunes[currentIndex].category}
        </div>
        <p className="text-foreground leading-relaxed">
          {fortunes[currentIndex].content}
        </p>
      </motion.div>
      <button
        onClick={handleNext}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        다른 운세 보기
      </button>
      <p className="text-xs text-muted-foreground text-center">
        * 실제 편지에는 AI가 생성한 맞춤형 운세가 포함됩니다
      </p>
    </div>
  );
}

// 스도쿠 미리보기
function SudokuPreview() {
  const samplePuzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="grid grid-cols-9 gap-0.5 max-w-[280px] mx-auto">
          {samplePuzzle.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={cn(
                  "aspect-square flex items-center justify-center text-xs font-medium",
                  "bg-card border border-border/50",
                  cell === 0 ? "text-muted-foreground" : "text-foreground",
                  // 3x3 블록 구분선
                  j % 3 === 2 && j !== 8 && "border-r-2 border-r-border",
                  i % 3 === 2 && i !== 8 && "border-b-2 border-b-border"
                )}
              >
                {cell || ""}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500/20 rounded" />
          쉬움
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500/20 rounded" />
          보통
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500/20 rounded" />
          어려움
        </span>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        * 난이도별 스도쿠와 다양한 퍼즐이 포함됩니다
      </p>
    </div>
  );
}

// 100가지 질문 미리보기
function QuestionsPreview() {
  const themes = [
    { name: "추억", emoji: "🌟", questions: ["우리가 함께한 가장 행복했던 순간은?", "어렸을 때 가장 좋아했던 음식은?"] },
    { name: "미래", emoji: "🌈", questions: ["나가면 가장 먼저 하고 싶은 것은?", "함께 가고 싶은 여행지는?"] },
    { name: "감사", emoji: "💕", questions: ["내가 당신에게 고마운 점은?", "당신이 나에게 해준 가장 따뜻한 말은?"] },
  ];
  const [currentTheme, setCurrentTheme] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleNextQuestion = () => {
    const theme = themes[currentTheme];
    if (currentQuestion < theme.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setCurrentTheme((prev) => (prev + 1) % themes.length);
      setCurrentQuestion(0);
    }
  };

  const theme = themes[currentTheme];

  return (
    <div className="space-y-4">
      {/* 테마 선택 */}
      <div className="flex justify-center gap-2">
        {themes.map((t, i) => (
          <button
            key={t.name}
            onClick={() => { setCurrentTheme(i); setCurrentQuestion(0); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              currentTheme === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {t.emoji} {t.name}
          </button>
        ))}
      </div>

      {/* 질문 카드 */}
      <motion.div
        key={`${currentTheme}-${currentQuestion}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 text-center"
      >
        <div className="text-3xl mb-3">{theme.emoji}</div>
        <p className="text-foreground font-medium leading-relaxed">
          {theme.questions[currentQuestion]}
        </p>
      </motion.div>

      <button
        onClick={handleNextQuestion}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        다음 질문
      </button>
      <p className="text-xs text-muted-foreground text-center">
        * 10가지 테마, 100가지 질문이 포함됩니다
      </p>
    </div>
  );
}

// 가석방/급수 계산기 미리보기
function ParoleCalculatorPreview() {
  const [sentenceMonths, setSentenceMonths] = useState(36); // 형기 (개월)
  const [servedMonths, setServedMonths] = useState(12); // 복역기간 (개월)
  const [currentPoints, setCurrentPoints] = useState(100); // 현재 처우점
  const [grade, setGrade] = useState(3); // 현재 급수

  // 급수 계산 (형집행법 시행령 기준)
  // 1급: 160점 이상, 2급: 120~159점, 3급: 80~119점, 4급: 79점 이하
  const calculateGrade = (points: number): number => {
    if (points >= 160) return 1;
    if (points >= 120) return 2;
    if (points >= 80) return 3;
    return 4;
  };

  // 가석방 가능 여부 계산
  // - 형기의 1/3 이상 복역 (무기형은 10년 이상)
  // - 2급 이상 (일부 경우 3급도 가능)
  const calculateParoleEligibility = () => {
    const requiredMonths = Math.ceil(sentenceMonths / 3);
    const monthsUntilEligible = Math.max(0, requiredMonths - servedMonths);
    const currentGrade = calculateGrade(currentPoints);
    const isGradeEligible = currentGrade <= 2; // 2급 이상

    return {
      requiredMonths,
      monthsUntilEligible,
      isTimeEligible: servedMonths >= requiredMonths,
      isGradeEligible,
      currentGrade,
    };
  };

  // 예상 급수 상승 시점 계산
  const calculateGradeProgress = () => {
    const currentGrade = calculateGrade(currentPoints);
    const pointsPerMonth = 5; // 평균 월 획득 점수 (작업점 기준)

    const targets = [
      { grade: 1, points: 160 },
      { grade: 2, points: 120 },
      { grade: 3, points: 80 },
    ];

    return targets
      .filter(t => t.grade < currentGrade)
      .map(t => ({
        grade: t.grade,
        pointsNeeded: t.points - currentPoints,
        monthsNeeded: Math.max(0, Math.ceil((t.points - currentPoints) / pointsPerMonth)),
      }));
  };

  const parole = calculateParoleEligibility();
  const gradeProgress = calculateGradeProgress();

  // 급수별 색상
  const gradeColors: Record<number, string> = {
    1: "text-green-600 bg-green-100 dark:bg-green-900/30",
    2: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    3: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
    4: "text-red-600 bg-red-100 dark:bg-red-900/30",
  };

  return (
    <div className="space-y-4">
      {/* 입력 섹션 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">형기 (개월)</label>
          <input
            type="number"
            value={sentenceMonths}
            onChange={(e) => setSentenceMonths(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-sm rounded-lg border bg-card focus:ring-2 focus:ring-primary/20 outline-none"
            min="1"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">복역기간 (개월)</label>
          <input
            type="number"
            value={servedMonths}
            onChange={(e) => setServedMonths(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 text-sm rounded-lg border bg-card focus:ring-2 focus:ring-primary/20 outline-none"
            min="0"
          />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-muted-foreground mb-1 block">현재 처우점</label>
          <input
            type="range"
            value={currentPoints}
            onChange={(e) => setCurrentPoints(parseInt(e.target.value))}
            className="w-full"
            min="0"
            max="200"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0점</span>
            <span className="font-medium text-foreground">{currentPoints}점</span>
            <span>200점</span>
          </div>
        </div>
      </div>

      {/* 결과 섹션 */}
      <div className="bg-muted/30 rounded-xl p-4 space-y-3">
        {/* 현재 급수 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">현재 급수</span>
          <span className={cn("px-3 py-1 rounded-full text-sm font-bold", gradeColors[parole.currentGrade])}>
            {parole.currentGrade}급
          </span>
        </div>

        {/* 가석방 요건 */}
        <div className="pt-3 border-t border-border/50">
          <div className="text-xs font-medium text-muted-foreground mb-2">가석방 요건</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>형기 1/3 이상 복역</span>
              <span className={parole.isTimeEligible ? "text-green-600" : "text-muted-foreground"}>
                {parole.isTimeEligible ? "✓ 충족" : `${parole.monthsUntilEligible}개월 남음`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>2급 이상</span>
              <span className={parole.isGradeEligible ? "text-green-600" : "text-muted-foreground"}>
                {parole.isGradeEligible ? "✓ 충족" : `현재 ${parole.currentGrade}급`}
              </span>
            </div>
          </div>
        </div>

        {/* 가석방 심사 가능 여부 */}
        <div className={cn(
          "rounded-lg p-3 text-center",
          parole.isTimeEligible && parole.isGradeEligible
            ? "bg-green-100 dark:bg-green-900/30"
            : "bg-muted/50"
        )}>
          <div className="text-sm font-medium">
            {parole.isTimeEligible && parole.isGradeEligible ? (
              <span className="text-green-600">🎉 가석방 심사 신청 가능</span>
            ) : (
              <span className="text-muted-foreground">가석방 심사 요건 미충족</span>
            )}
          </div>
        </div>

        {/* 급수 상승 예측 */}
        {gradeProgress.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <div className="text-xs font-medium text-muted-foreground mb-2">급수 상승 예상</div>
            <div className="space-y-1">
              {gradeProgress.map(p => (
                <div key={p.grade} className="flex items-center justify-between text-xs">
                  <span>{p.grade}급 달성</span>
                  <span className="text-muted-foreground">
                    +{p.pointsNeeded}점 (약 {p.monthsNeeded}개월)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 안내 */}
      <div className="text-size-10 text-muted-foreground space-y-1">
        <p>* 급수 기준: 1급(160점↑), 2급(120~159점), 3급(80~119점), 4급(79점↓)</p>
        <p>* 실제 가석방은 심사위원회 결정에 따라 달라질 수 있습니다</p>
      </div>
    </div>
  );
}

// 유머 미리보기
function HumorPreview() {
  const jokes = [
    { setup: "아들: 아빠, 나 용돈 좀...", punchline: "아빠: 용? 돈? 둘 다 없어." },
    { setup: "의사: 환자분, 매일 운동하세요.", punchline: "환자: 네, 매일 결론을 내리고 있습니다." },
    { setup: "친구: 너 요즘 뭐해?", punchline: "나: 숨쉬기, 먹기, 자기..." },
  ];
  const [currentJoke, setCurrentJoke] = useState(0);

  return (
    <div className="space-y-4">
      <motion.div
        key={currentJoke}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6"
      >
        <div className="text-center mb-4">
          <span className="text-4xl">😂</span>
        </div>
        <p className="text-foreground mb-3">{jokes[currentJoke].setup}</p>
        <p className="text-foreground font-medium">{jokes[currentJoke].punchline}</p>
      </motion.div>
      <button
        onClick={() => setCurrentJoke((prev) => (prev + 1) % jokes.length)}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        다른 유머 보기
      </button>
      <p className="text-xs text-muted-foreground text-center">
        * 매주 업데이트되는 최신 유머가 포함됩니다
      </p>
    </div>
  );
}

// 사용자 문서 업로드 미리보기
export function DocumentUploadPreview({
  documents,
  onDocumentsChange,
}: {
  documents: UserDocument[];
  onDocumentsChange: (docs: UserDocument[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<UserDocument | null>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (documents.length + files.length > MAX_DOCUMENT_COUNT) {
      toast.error(`최대 ${MAX_DOCUMENT_COUNT}개까지 업로드할 수 있습니다`);
      return;
    }

    setIsUploading(true);
    let nextDocuments = [...documents];

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiFetch('/api/v1/uploads/documents', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || '업로드 실패');
        }

        const data = await response.json();
        const newDoc = createUserDocument(data);
        nextDocuments = [...nextDocuments, newDoc];
        onDocumentsChange(nextDocuments);
        toast.success(`${file.name} 업로드 완료`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '업로드에 실패했습니다');
      }
    }

    setIsUploading(false);
  }, [documents, onDocumentsChange]);

  const handleDelete = async (doc: UserDocument) => {
    try {
      await apiFetch(`/api/v1/uploads/documents?path=${encodeURIComponent(doc.path)}`, {
        method: 'DELETE',
      });
      onDocumentsChange(documents.filter(d => d.id !== doc.id));
      toast.success('삭제되었습니다');
    } catch {
      toast.error('삭제에 실패했습니다');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const updateDocument = useCallback((documentId: string, updates: Partial<UserDocument>) => {
    onDocumentsChange(
      documents.map((document) => {
        if (document.id !== documentId) {
          return document;
        }

        const nextPageCount = Math.max(1, Math.floor(updates.pageCount ?? document.pageCount));
        return {
          ...document,
          ...updates,
          pageCount: nextPageCount,
          isPageCountEstimated: updates.pageCount != null ? false : updates.isPageCountEstimated ?? document.isPageCountEstimated,
        };
      })
    );
  }, [documents, onDocumentsChange]);

  const getFileIcon = (doc: UserDocument) => {
    if (doc.fileType === 'application/pdf') return '📄';
    if (isImageDocument(doc.fileName, doc.fileType)) return '🖼️';
    if (doc.fileName.toLowerCase().endsWith('.hwp') || doc.fileName.toLowerCase().endsWith('.hwpx')) return '📝';
    if (doc.fileName.toLowerCase().endsWith('.doc') || doc.fileName.toLowerCase().endsWith('.docx')) return '📘';
    return '📎';
  };

  const isPdfDocument = (doc: UserDocument) => doc.fileType === 'application/pdf' || doc.fileName.toLowerCase().endsWith('.pdf');
  const supportsInlinePreview = (doc: UserDocument) => isImageDocument(doc.fileName, doc.fileType) || isPdfDocument(doc);

  return (
    <div className="space-y-4">
      {/* 업로드 영역 */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.hwp,.hwpx,.doc,.docx,.jpg,.jpeg,.png"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">업로드 중...</p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">
              클릭하거나 파일을 드래그하세요
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, 한글, Word, JPG, JPEG, PNG (최대 {(MAX_DOCUMENT_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB, {MAX_DOCUMENT_COUNT}개까지)
            </p>
          </>
        )}
      </div>

      {/* 업로드된 파일 목록 */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            업로드된 문서 ({documents.length}/{MAX_DOCUMENT_COUNT})
          </p>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="space-y-3 bg-muted/30 rounded-lg p-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getFileIcon(doc)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{doc.fileName}</p>
                      {doc.isPageCountEstimated && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          장수 추정
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getDocumentTypeLabel(doc.fileName, doc.fileType)} · {formatFileSize(doc.fileSize)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewDocument(doc);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-1.5 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                  <label className="space-y-1">
                    <span className="text-xs font-medium text-foreground">장수</span>
                    <input
                      type="number"
                      min={1}
                      value={doc.pageCount}
                      onChange={(event) => {
                        const pageCount = Number(event.target.value);
                        updateDocument(doc.id, {
                          pageCount: Number.isFinite(pageCount) && pageCount > 0 ? pageCount : 1,
                        });
                      }}
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                  </label>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-foreground">출력 방식</span>
                    <div className="grid grid-cols-2 gap-2">
                      {(['BLACK_WHITE', 'COLOR'] as const).map((printMode) => {
                        const selected = doc.printMode === printMode;
                        return (
                          <button
                            key={printMode}
                            type="button"
                            onClick={() => updateDocument(doc.id, { printMode })}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-sm transition-colors",
                              selected
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40"
                            )}
                          >
                            {DOCUMENT_PRINT_MODE_LABELS[printMode]} {getDocumentUnitPrice(printMode).toLocaleString()}원
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-lg bg-card px-3 py-2 text-right">
                    <p className="text-[11px] text-muted-foreground">
                      {doc.pageCount}장 x {doc.printMode === 'COLOR' ? DOCUMENT_COLOR_PRICE : DOCUMENT_BLACK_WHITE_PRICE}원
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {calculateDocumentPrice(doc.pageCount, doc.printMode).toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 안내 */}
      <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-lg p-3">
        <p>💡 개인 문서, 사진, 신문기사 등을 편지와 함께 출력 동봉할 수 있습니다</p>
        <p>💡 흑백은 장당 200원, 컬러는 장당 300원입니다</p>
        <p>💡 PDF와 이미지는 여기서 바로 미리보기할 수 있습니다</p>
        <p>💡 DOC/HWP 같은 일부 문서는 장수를 1장으로 먼저 추정하니 필요하면 직접 수정해주세요</p>
        <p>⚠️ 부적절한 내용이 포함된 파일은 검수 시 삭제될 수 있습니다</p>
      </div>

      <Dialog open={!!previewDocument} onOpenChange={(open) => !open && setPreviewDocument(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="text-xl">{previewDocument ? getFileIcon(previewDocument) : '📎'}</span>
              <span className="truncate">{previewDocument?.fileName ?? '문서 미리보기'}</span>
            </DialogTitle>
          </DialogHeader>

          {previewDocument && (
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{getDocumentTypeLabel(previewDocument.fileName, previewDocument.fileType)}</span>
                <span>·</span>
                <span>{formatFileSize(previewDocument.fileSize)}</span>
                <span>·</span>
                <span>{previewDocument.pageCount}장</span>
                <span>·</span>
                <span>{DOCUMENT_PRINT_MODE_LABELS[previewDocument.printMode]} {getDocumentUnitPrice(previewDocument.printMode).toLocaleString()}원</span>
              </div>

              {isImageDocument(previewDocument.fileName, previewDocument.fileType) && (
                <div className="max-h-[65vh] overflow-auto rounded-xl border border-border bg-muted/20 p-4">
                  <img
                    src={previewDocument.url}
                    alt={previewDocument.fileName}
                    className="mx-auto h-auto max-w-full rounded-lg"
                  />
                </div>
              )}

              {isPdfDocument(previewDocument) && (
                <div className="h-[65vh] overflow-hidden rounded-xl border border-border bg-muted/20">
                  <iframe
                    src={previewDocument.url}
                    title={previewDocument.fileName}
                    className="h-full w-full"
                  />
                </div>
              )}

              {!supportsInlinePreview(previewDocument) && (
                <div className="rounded-xl border border-border bg-muted/20 p-6 text-center">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">브라우저 미리보기를 지원하지 않는 형식입니다</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    한글 문서와 Word 문서는 새 탭에서 내려받아 확인해주세요.
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <a
                  href={previewDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <ExternalLink className="h-4 w-4" />
                  새 탭에서 열기
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 기본 하드코딩 항목 (DB에 없어도 항상 표시)
export const defaultAdditionalItems: AdditionalItem[] = [
  {
    id: "meal-plan",
    icon: "🍽️",
    title: "월간 식단표",
    description: "달력형, 2개월치 식단 정보",
    previewType: "text",
    previewContent: "이달의 식단표와 다음달 예정 식단을 한눈에 볼 수 있는 달력형 정보입니다. 교정시설별 맞춤 식단 정보를 제공합니다.",
  },
  {
    id: "movie",
    icon: "🎬",
    title: "보라미 영화",
    description: "TV 시청 편성표",
    previewType: "text",
    previewContent: "이번 주 TV 영화 편성표와 추천 프로그램 정보입니다. 지상파, 케이블 채널의 영화 편성을 한눈에 확인하세요.",
  },
  // {
  //   id: "parole-calc",
  //   icon: "📊",
  //   title: "가석방+급수 계산기",
  //   description: "형기/점수 관리 시뮬레이션",
  //   isNew: true,
  //   previewType: "parole-calc",
  // },
  {
    id: "fortune",
    icon: "🔮",
    title: "AI 운세/타로",
    description: "오늘의 운세와 타로 점",
    previewType: "fortune",
    previewContent: "AI가 분석한 오늘의 운세와 타로 카드 해석 결과입니다.",
  },
  {
    id: "puzzle",
    icon: "🧩",
    title: "스도쿠/퍼즐",
    description: "재미있는 두뇌 게임",
    previewType: "sudoku",
    previewContent: "난이도별 스도쿠 퍼즐과 다양한 두뇌 게임이 포함되어 있습니다.",
  },
  {
    id: "humor",
    icon: "😂",
    title: "최신 유머",
    description: "웃음을 선물하세요",
    previewType: "humor",
    previewContent: "엄선된 최신 유머와 재미있는 이야기 모음입니다.",
  },
  // {
  //   id: "job-training",
  //   icon: "📚",
  //   title: "직업훈련 안내",
  //   description: "자격증 취득 정보",
  //   previewType: "text",
  //   previewContent: "교정시설 내 직업훈련 프로그램과 자격증 취득 방법 안내입니다. 출소 후 취업에 도움이 되는 정보를 제공합니다.",
  // },
  // {
  //   id: "100-questions",
  //   icon: "💬",
  //   title: "100가지 질문",
  //   description: "10가지 테마별 질문",
  //   previewType: "questions",
  //   previewContent: "서로를 더 깊이 알아갈 수 있는 100가지 질문 카드입니다.",
  // },
  {
    id: "user-document",
    icon: "📎",
    title: "내 문서 동봉",
    description: "PDF, 한글, Word, 이미지 첨부",
    isNew: true,
    previewType: "user-document",
    previewContent: "개인 문서, 사진, 신문기사 등을 편지와 함께 동봉할 수 있습니다.",
  },
  // {
  //   id: "coffee-gift",
  //   icon: "☕",
  //   title: "커피 한잔 하자",
  //   description: "추운 겨울날 커피한잔하자",
  //   previewType: "text",
  //   previewContent: "날씨도 추운데, 매일 같이 가던 카페에서 커피한잔하기 딱 좋은날이네. 조금이나마 도움이되었으면 좋겠어",
  //   price: 5000,
  //   image: "/present-coffee-thumbnail.png",
  //   isGift: true,
  // },
  // {
  //   id: "orange-gift",
  //   icon: "🍊",
  //   title: "오렌지 선물",
  //   description: "오늘은 닿지 않아도, 그날을 위해 남겨두는 마음",
  //   previewType: "text",
  //   previewContent: "지금 맺어주는 오렌지는 출소 후 새로운 하루를 시작하는 데 쓰일 수 있는 준비가 됩니다.",
  //   price: 10000,
  //   image: "/present-orange-thumbnail.png",
  //   isGift: true,
  // },
];

interface AdditionalOptionsProps {
  selectedItems: string[];
  onSelectedItemsChange: (items: string[]) => void;
  items?: AdditionalItem[];
  userDocuments?: UserDocument[];
  onUserDocumentsChange?: (docs: UserDocument[]) => void;
}

export function AdditionalOptions({
  selectedItems,
  onSelectedItemsChange,
  items,
  userDocuments = [],
  onUserDocumentsChange,
}: AdditionalOptionsProps) {
  const [previewItem, setPreviewItem] = useState<AdditionalItem | null>(null);
  // items prop이 있으면 사용, 없으면 기본 하드코딩 항목 사용
  const resolvedItems = items && items.length > 0 ? items : defaultAdditionalItems;

  // 사용자 문서 변경 핸들러
  const handleUserDocumentsChange = useCallback((docs: UserDocument[]) => {
    onUserDocumentsChange?.(docs);
    // 문서가 있으면 자동으로 user-document 선택
    if (docs.length > 0 && !selectedItems.includes('user-document')) {
      onSelectedItemsChange([...selectedItems, 'user-document']);
    }
    // 문서가 없으면 user-document 선택 해제
    if (docs.length === 0 && selectedItems.includes('user-document')) {
      onSelectedItemsChange(selectedItems.filter(id => id !== 'user-document'));
    }
  }, [onUserDocumentsChange, selectedItems, onSelectedItemsChange]);

  const toggleItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onSelectedItemsChange(selectedItems.filter((id) => id !== itemId));
    } else {
      onSelectedItemsChange([...selectedItems, itemId]);
    }
  };


  return (
    <div className="space-y-4 lg:space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <Gift className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
        <div>
          <h2 className="text-sm lg:text-base font-semibold text-foreground">편지와 함께 작은 바깥의 하루를 전하세요</h2>
          <p className="text-muted-foreground text-size-11 lg:text-xs">
            안에서는 알기 어려운 소식과 정보를 전달합니다.
          </p>
        </div>
      </div>

      {/* 흰색 라운딩 박스 - 메인 컨테이너 */}
      <div className="bg-card rounded-xl lg:rounded-3xl p-4 lg:p-6 shadow-md lg:shadow-lg border border-border/50 space-y-4 lg:space-y-6">
        {/* 아이템 그리드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
          {resolvedItems.map((item) => {
            const isSelected = selectedItems.includes(item.id);
            
            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                className={cn(
                  "relative bg-muted/30 rounded-xl lg:rounded-2xl border-2 p-3 lg:p-5 transition-all",
                  isSelected
                    ? "border-primary shadow-lg bg-primary/5"
                    : "border-transparent hover:border-primary/30"
                )}
              >
                {/* NEW 배지 */}
                {item.isNew && (
                  <div className="absolute -top-1.5 -right-1.5 lg:-top-2 lg:-right-2 px-1.5 lg:px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-size-10 lg:text-xs font-bold rounded-full shadow-md">
                    NEW
                  </div>
                )}

                {/* 선택 체크 */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 lg:top-3 lg:right-3 w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 lg:w-4 lg:h-4 text-primary-foreground" />
                  </motion.div>
                )}

                {/* 아이콘/이미지 */}
                {item.image ? (
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-[#fff8ed] flex items-center justify-center mb-2 lg:mb-4 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-card flex items-center justify-center text-2xl lg:text-3xl mb-2 lg:mb-4">
                    {item.icon}
                  </div>
                )}

                {/* 내용 */}
                <h3 className="font-semibold text-foreground mb-0.5 lg:mb-1 text-xs lg:text-base">{item.title}</h3>
                <p className="text-size-10 lg:text-sm text-muted-foreground mb-2 lg:mb-4 line-clamp-2">{item.description}</p>

                {/* 버튼들 */}
                <div className="flex items-center gap-1 lg:gap-2 pt-2 lg:pt-3 border-t border-border/50">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 lg:py-2 text-size-10 lg:text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {item.id === 'user-document' ? (
                      <>
                        <Upload className="w-3 h-3 lg:w-4 lg:h-4 shrink-0" />
                        <span className="hidden sm:inline">업로드</span>
                        <span className="sm:hidden">업로드</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 lg:w-4 lg:h-4 shrink-0" />
                        <span className="hidden sm:inline">미리보기</span>
                        <span className="sm:hidden">보기</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1.5 lg:py-2 text-size-10 lg:text-sm rounded-lg transition-colors whitespace-nowrap",
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3 h-3 lg:w-4 lg:h-4 shrink-0" />
                        <span className="hidden sm:inline">선택됨</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 lg:w-4 lg:h-4 shrink-0" />
                        선택
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 선택 요약 */}
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-orange-200/50 dark:border-orange-800/30"
          >
            <div className="flex items-center gap-2 mb-2 lg:mb-3">
              <span className="font-medium text-foreground text-sm lg:text-base">선택됨:</span>
            </div>

            {/* 선택된 아이템 목록 */}
            <div className="flex flex-wrap gap-1.5 lg:gap-2">
              {selectedItems.map((itemId) => {
                const item = resolvedItems.find((i) => i.id === itemId);
                if (!item) return null;
                return (
                  <div
                    key={itemId}
                    className="flex items-center gap-1.5 lg:gap-2 bg-white dark:bg-card px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs lg:text-sm border border-orange-200 dark:border-orange-800/50"
                  >
                    <span className="text-sm lg:text-base">{item.icon}</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">{item.title}</span>
                    <button
                      onClick={() => toggleItem(itemId)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 안내 메시지 */}
        <div className="bg-muted/50 rounded-lg lg:rounded-xl p-3 lg:p-4 text-center">
          <p className="text-xs lg:text-sm text-muted-foreground">
            💡 추가 콘텐츠는 선택하지 않아도 편지 발송이 가능합니다.
          </p>
        </div>
      </div>

      {/* 미리보기 모달 */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl">{previewItem?.icon}</span>
              {previewItem?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 미리보기 타입별 렌더링 */}
            {previewItem?.previewType === 'fortune' && <FortunePreview />}
            {previewItem?.previewType === 'sudoku' && <SudokuPreview />}
            {previewItem?.previewType === 'questions' && <QuestionsPreview />}
            {previewItem?.previewType === 'humor' && <HumorPreview />}
            {previewItem?.previewType === 'parole-calc' && <ParoleCalculatorPreview />}
            {previewItem?.previewType === 'user-document' && onUserDocumentsChange && (
              <DocumentUploadPreview
                documents={userDocuments}
                onDocumentsChange={handleUserDocumentsChange}
              />
            )}
            {previewItem?.previewType === 'image' && previewItem.previewImageUrl && (
              <div className="space-y-3">
                <img
                  src={previewItem.previewImageUrl}
                  alt={previewItem.title}
                  className="w-full rounded-xl"
                />
                <p className="text-sm text-muted-foreground">{previewItem.previewContent}</p>
              </div>
            )}
            {(previewItem?.previewType === 'text' || !previewItem?.previewType) && (
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-muted-foreground leading-relaxed">{previewItem?.previewContent}</p>
              </div>
            )}

            {/* 사용자 문서는 다른 버튼 표시 */}
            {previewItem?.previewType === 'user-document' ? (
              <button
                onClick={() => setPreviewItem(null)}
                className="w-full py-3 rounded-xl font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {userDocuments.length > 0
                  ? `완료 (${userDocuments.length}개 파일)`
                  : "닫기"}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (previewItem) {
                    toggleItem(previewItem.id);
                    setPreviewItem(null);
                  }
                }}
                className={cn(
                  "w-full py-3 rounded-xl font-medium transition-colors",
                  previewItem && selectedItems.includes(previewItem.id)
                    ? "bg-muted text-muted-foreground hover:bg-muted/80"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {previewItem && selectedItems.includes(previewItem.id)
                  ? "선택 취소"
                  : "선택하기"}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
