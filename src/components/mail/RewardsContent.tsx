import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";

interface RewardsContentProps {
  onClose?: () => void;
}

export function RewardsContent({ onClose }: RewardsContentProps) {
  const { user } = useAuth();
  const { profile } = useProfile();

  const router = useRouter();

  const isLoggedIn = !!user;

  console.log("user", !!user);

  const userCreatedAt = user ? new Date(user.created_at) : new Date();

  const displayName =
    profile?.nickname ??
    user?.user_metadata?.display_name ??
    user?.email?.split("@")[0] ??
    "사용자";

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="hidden md:flex h-14 border-b border-border/40 bg-white/80 backdrop-blur-sm items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-foreground">
          내가 받은 경품
        </h1>
        <Button variant="ghost" size="sm" onClick={onClose} className="hidden">
          편지함으로 돌아가기
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:py-10 lg:px-6">
        <div className="max-w-4xl mx-auto">
          {/* 타이틀 */}
          <div className="mb-8">
            <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-[18px]">
              {isLoggedIn ? (
                <>
                  {displayName}님 회원 가입을{" "}
                  <span className="text-primary underline underline-offset-4">
                    축하
                  </span>{" "}
                  드립니다.
                </>
              ) : (
                <>
                  투오렌지 새해 응원선물 2026년 한해{" "}
                  <span className="text-primary underline underline-offset-4">
                    무료 우편서비스
                  </span>
                </>
              )}
            </h2>
            <div className="mb-6">
              {isLoggedIn ? (
                <p className="text-size-15 md:text-base text-muted-foreground leading-normal">
                  저희 투오렌지 회원이 되어주셔서 진심으로 감사 드립니다.
                  <br />
                  감사 선물로 2026년 12월 31일까지 일반우편 (430원) 요금에
                  대하여 매주{" "}
                  <span className="text-primary">
                    월요일 . 수요일 . 금요일
                  </span>{" "}
                  무료로 이용하실수 있습니다.
                </p>
              ) : (
                <p className="text-size-15 md:text-base text-muted-foreground leading-normal">
                  지금 회원 가입하시면 감사 선물로 2026년 12월 31일까지 일반우편
                  (430원) 요금에 대하여 매주{" "}
                  <span className="text-primary">월요일 . 수요일 . 금요일</span>{" "}
                  무료로 이용하실수 있습니다.
                </p>
              )}
            </div>
          </div>

          {/* 경품 카드 */}
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border/60 p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* 아이콘 */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0">
                  🎫
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-foreground text-lg mb-1">
                    2026년 한해 430원 일반우표 무료이용권
                  </h4>
                  {/* <p className="text-sm text-muted-foreground">
                    430 일반우편 서비스 : 430원 우표 + B5 편지지 3매 + B5
                    편지봉투
                  </p> */}
                  {/* <p className="text-xs text-primary mt-1.5 font-medium">
                    결제시 430 무료서비스 12월 31일까지 자동 적용
                  </p> */}
                </div>

                {/* 비회원 시 경품받기 -> 회원가입 페이지로 연결 */}
                {/* <button
                  onClick={() => router.push("/auth/sign-up")}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm  font-medium hover:bg-primary/90 transition-colors flex items-center justify-center
                 "
                >
                  경품받기
                </button> */}

                {/* 회원 가입 일 ~ 이벤트 종료일 알림 */}
                <p className="text-size-15 md:text-base text-muted-foreground leading-normal">
                  {isLoggedIn
                    ? `${userCreatedAt.getFullYear()}년 ${userCreatedAt.getMonth() + 1}월 ${userCreatedAt.getDate()}일부터 \n 2026년 12월 31일까지`
                    : "회원 가입일로부터 2026년 12월 31일까지"}
                </p>
              </div>
            </motion.div>
          </div>

          {/* 안내 문구 */}
          <div className="mt-8 p-4 bg-muted/50 rounded-xl">
            <h4 className="text-sm font-medium text-foreground mb-2">
              이용 안내
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• 경품은 편지 발송 시 결제 단계에서 자동 적용됩니다.</li>
              <li>• 유효기간이 지난 경품은 사용이 불가합니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
